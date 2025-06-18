use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("F1vAg8cyPh9yiQdmpZHNDiTFTjP9qsLjJcKjoUcKBzsw");
//declare_id!("6DMtRQ8mDPCeDHLpJXuB1BPTXEzscF8VC8Bx53kgt3vB");

#[program]
pub mod bawls_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, community_wallet: Pubkey) -> Result<()> {
        ctx.accounts.config.community_wallet = community_wallet;
        ctx.accounts.config.bump = ctx.bumps.config;
        ctx.accounts.pool.total_tax_collected = 0;
        ctx.accounts.pool.total_staked = 0;
        ctx.accounts.pool.total_rewards_distributed = 0;
        ctx.accounts.pool.bump = ctx.bumps.pool;
        Ok(())
    }

    pub fn create_vault(ctx: Context<CreateVault>) -> Result<()> {
        let cpi_accounts = anchor_spl::associated_token::Create {
            payer: ctx.accounts.user.to_account_info(),
            associated_token: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.config.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        };
        
        let config_bump = ctx.accounts.config.bump;
        let config_seeds: &[&[u8]] = &[b"config-v2", &[config_bump]];
        let signer = &[config_seeds];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.associated_token_program.to_account_info(),
            cpi_accounts,
            signer,
        );

        anchor_spl::associated_token::create(cpi_ctx)?;
        Ok(())
    }

    pub fn initialize_user_state(ctx: Context<InitializeUserState>) -> Result<()> {
        ctx.accounts.user_state.amount = 0;
        ctx.accounts.user_state.start_time = 0;
        ctx.accounts.user_state.authority = ctx.accounts.user.key();
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let cpi_ctx = ctx.accounts.transfer_to_vault_context();
        token::transfer(cpi_ctx, amount)?;

        let clock = Clock::get()?;
        ctx.accounts.user_state.amount += amount;
        ctx.accounts.pool.total_staked += amount;
        ctx.accounts.user_state.start_time = clock.unix_timestamp;
        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        // Security: Ensure user is unstaking their own account
        require_keys_eq!(
            ctx.accounts.user.key(),
            ctx.accounts.user_state.authority,
            StakingError::Unauthorized
        );

        let now = Clock::get()?.unix_timestamp;
        let stake_duration = now - ctx.accounts.user_state.start_time;

        let amount = ctx.accounts.user_state.amount;
        require!(
            amount > 0 && ctx.accounts.user_state.start_time > 0, 
            StakingError::NothingToUnstake
        );

        let tax = if stake_duration >= 90 * 86400 {
            0
        } else {
            amount * 5 / 100
        };

        let user_amount = amount - tax;
        let tax_to_pool = tax * 3 / 5;
        let tax_to_community = tax - tax_to_pool;

        // Update state first (before interacting with token contract)
        ctx.accounts.pool.total_tax_collected += tax_to_pool;
        ctx.accounts.pool.total_staked -= amount;
        ctx.accounts.user_state.amount = 0;

        msg!("Unstake - Tax: {} → Pool: {}, Community: {}", tax, tax_to_pool, tax_to_community);
        msg!("Amount to user: {}", user_amount);

        // Now perform the transfers (interactions)
        let config_bump = ctx.accounts.config.bump;
        let config_seeds: &[&[u8]] = &[b"config-v2", &[config_bump]];
        let signer = &[config_seeds];

        // Transfer 95% back to user
        let user_transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            signer,
        );
        token::transfer(user_transfer_ctx, user_amount)?;

        // Transfer 2% to community wallet ATA
        let community_transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.community_ata.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            signer,
        );
        token::transfer(community_transfer_ctx, tax_to_community)?;

        // Log transaction details
        msg!("Unstaked: {}", amount);
        msg!("Returned to user: {}", user_amount);
        msg!("Tax: {} → Pool: {}, Community: {}", tax, tax_to_pool, tax_to_community);

        Ok(())
    }


    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let total_staked = ctx.accounts.pool.total_staked; // Total staked amount in the pool
        let user_stake = ctx.accounts.user_state.amount; // User's staked amount

        require!(user_stake > 0, StakingError::NothingToClaim); // Ensure the user has staked tokens
        require!(total_staked > 0, StakingError::NothingToClaim); // Ensure the pool has staked tokens

        // Calculate the user's share of the tax pool (based on their staked amount)
        let user_share = (user_stake as u128) * (ctx.accounts.pool.total_tax_collected as u128) / (total_staked as u128);
        let user_reward = user_share as u64;

        require!(user_reward > 0, StakingError::InsufficientFundsInPool); // Ensure they have a reward to claim
        require!(ctx.accounts.pool.total_tax_collected >= user_reward, StakingError::InsufficientFundsInPool);
        
        // Now perform the transfers (interactions)
        let config_bump = ctx.accounts.config.bump;
        let config_seeds: &[&[u8]] = &[b"config-v2", &[config_bump]];
        let signer = &[config_seeds];

        // Transfer the reward to the user
        let reward_transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            signer,
        );

        // Update the pool's total tax collected
        ctx.accounts.pool.total_tax_collected -= user_reward;
        ctx.accounts.pool.total_rewards_distributed += user_reward;

        token::transfer(reward_transfer_ctx, user_reward)?;

        // Log the reward claim
        msg!("User claimed reward: {}", user_reward);

        Ok(())
    }

}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // #[account(init, payer = authority, space = 8 + 32 + 1, seeds = [b"config-v2"], bump)]
    // pub config: Account<'info, Config>,

    // #[account(init, payer = authority, space = 8 + 8 + 8 + 1, seeds = [b"pool-v2"], bump)]
    // pub pool: Account<'info, StakingPool>,

    // #[account(mut)]
    // pub authority: Signer<'info>,
    // pub system_program: Program<'info, System>,
    #[account(
        init,
        seeds = [b"config-v2"],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<Config>() // adjust size as needed
    )]
    pub config: Account<'info, Config>,

    #[account(
        init,
        seeds = [b"pool-v2"],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<StakingPool>() // adjust size as needed
    )]
    pub pool: Account<'info, StakingPool>,

    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: only used for storage
    pub community_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: vault created via CPI
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    pub config: Account<'info, Config>,
    /// CHECK: manually validated mint
    pub token_mint: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct InitializeUserState<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 8 + 32,
        seeds = [b"state-v2", user.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK
    #[account(mut)]
    pub from: AccountInfo<'info>,
    /// CHECK
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    /// CHECK
    pub token_mint: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK
    #[account(mut)]
    pub to: AccountInfo<'info>,
    /// CHECK
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    /// CHECK: must be precomputed ATA of community_wallet for this mint
    #[account(mut)]
    pub community_ata: AccountInfo<'info>,
    /// CHECK
    pub token_mint: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub pool: Account<'info, StakingPool>, 
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    /// CHECK: user ATA for the token mint
    pub to: AccountInfo<'info>, 
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    /// CHECK: vault PDA ATA
    pub vault: AccountInfo<'info>,
}

#[account]
pub struct Config {
    pub community_wallet: Pubkey,
    pub bump: u8,
}

#[account]
pub struct UserState {
    pub amount: u64,
    pub start_time: i64,
    pub authority: Pubkey,
}

#[account]
pub struct StakingPool {
    pub total_tax_collected: u64,
    pub total_rewards_distributed: u64,
    pub total_staked: u64,
    pub bump: u8,
}

impl<'info> Stake<'info> {
    pub fn transfer_to_vault_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.from.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.user.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> Unstake<'info> {
    pub fn transfer_back_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.to.to_account_info(),
            authority: self.config.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[error_code]
pub enum StakingError {
    #[msg("Nothing to unstake.")]
    NothingToUnstake,
    #[msg("You are not authorized to unstake this account.")]
    Unauthorized,
    #[msg("Nothing to claim.")]
    NothingToClaim,
    #[msg("Insufficient funds in pool.")]
    InsufficientFundsInPool,
}
