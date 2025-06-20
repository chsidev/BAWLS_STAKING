// Finalized BAWLS Staking Program using Anchor 0.31.1
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Transfer, Mint, TokenAccount};
use anchor_spl::associated_token::{AssociatedToken, get_associated_token_address, Create, create};

declare_id!("DU3BX4Bu1XAnM98ftXLgguPMwMhaquSU3dPwmUhtp7vx");

pub const CONFIG_SEED: &[u8] = b"config-v1";
pub const POOL_SEED: &[u8] = b"pool-v1";
pub const STATE_SEED: &[u8] = b"state-v1";

#[program]
pub mod bawls_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, community_wallet: Pubkey) -> Result<()> {
        ctx.accounts.config.community_wallet = community_wallet;
        ctx.accounts.config.token_mint = ctx.accounts.token_mint.key();
        ctx.accounts.config.tax_percentage = 5;
        ctx.accounts.config.min_stake_duration = 90 * 86400;
        ctx.accounts.config.bump = ctx.bumps.config;

        ctx.accounts.pool.total_tax_collected = 0;
        ctx.accounts.pool.total_staked = 0;
        ctx.accounts.pool.total_rewards_distributed = 0;
        ctx.accounts.pool.bump = ctx.bumps.pool;
        Ok(())
    }

    pub fn create_vault(ctx: Context<CreateVault>) -> Result<()> {
        let expected_vault = get_associated_token_address(&ctx.accounts.config.key(), &ctx.accounts.token_mint.key());
        require_keys_eq!(ctx.accounts.vault.key(), expected_vault, StakingError::VaultOwnershipMismatch);

        let signer_seeds: &[&[u8]] = &[CONFIG_SEED, &[ctx.accounts.config.bump]];
        let signer = &[signer_seeds];

        let cpi_accounts = Create {
            payer: ctx.accounts.user.to_account_info(),
            associated_token: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.config.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.associated_token_program.to_account_info(),
            cpi_accounts,
            signer,
        );

        let _ = create(cpi_ctx); // safe to ignore if already exists
        Ok(())
    }

    pub fn initialize_user_state(ctx: Context<InitializeUserState>) -> Result<()> {
        ctx.accounts.user_state.amount = 0;
        ctx.accounts.user_state.start_time = 0;
        ctx.accounts.user_state.authority = ctx.accounts.user.key();
        ctx.accounts.user_state.last_tax_snapshot = 0;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidStakeAmount);

        let cpi_ctx = ctx.accounts.transfer_to_vault_context();
        token::transfer(cpi_ctx, amount)?;

        let clock = Clock::get()?;
        ctx.accounts.user_state.amount += amount;
        ctx.accounts.user_state.start_time = clock.unix_timestamp;
        ctx.accounts.user_state.last_tax_snapshot = ctx.accounts.pool.total_tax_collected;
        ctx.accounts.pool.total_staked += amount;

        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let stake_duration = now - ctx.accounts.user_state.start_time;
        let amount = ctx.accounts.user_state.amount;

        require!(amount > 0, StakingError::NothingToUnstake);

        let tax = if stake_duration >= ctx.accounts.config.min_stake_duration {
            0
        } else {
            (amount as u128 * ctx.accounts.config.tax_percentage as u128 / 100) as u64
        };

        let tax_to_pool = tax * 3 / 5;
        let tax_to_community = tax - tax_to_pool;
        let user_amount = amount - tax;

        require!(ctx.accounts.vault.amount >= amount, StakingError::VaultInsufficientBalance);

        ctx.accounts.pool.total_tax_collected += tax_to_pool;
        ctx.accounts.pool.total_staked -= amount;

        ctx.accounts.user_state.amount = 0;
        ctx.accounts.user_state.start_time = 0;
        ctx.accounts.user_state.last_tax_snapshot = 0;

        let signer_seeds: &[&[u8]] = &[CONFIG_SEED, &[ctx.accounts.config.bump]];
        let signer = &[signer_seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.to.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                signer,
            ),
            user_amount,
        )?;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.community_ata.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                signer,
            ),
            tax_to_community,
        )?;

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let user_stake = ctx.accounts.user_state.amount;
        let total_staked = ctx.accounts.pool.total_staked;
        require!(user_stake > 0 && total_staked > 0, StakingError::NothingToClaim);

        let new_rewards = ctx.accounts.pool.total_tax_collected - ctx.accounts.user_state.last_tax_snapshot;
        require!(new_rewards > 0, StakingError::InsufficientFundsInPool);

        let user_reward = (user_stake as u128 * new_rewards as u128 / total_staked as u128) as u64;
        require!(user_reward > 0, StakingError::InsufficientFundsInPool);

        ctx.accounts.pool.total_rewards_distributed += user_reward;
        ctx.accounts.user_state.last_tax_snapshot = ctx.accounts.pool.total_tax_collected;

        let signer_seeds: &[&[u8]] = &[CONFIG_SEED, &[ctx.accounts.config.bump]];
        let signer = &[signer_seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.to.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                signer,
            ),
            user_reward,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, seeds = [CONFIG_SEED], bump, payer = payer, space = 8 + 96)]
    pub config: Account<'info, Config>,
    #[account(init, seeds = [POOL_SEED], bump, payer = payer, space = 8 + 32)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [CONFIG_SEED], bump)]
    pub config: Account<'info, Config>,
    /// CHECK: This is the ATA for the config PDA and token mint. Verified via manual check in instruction.
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct InitializeUserState<'info> {
    #[account(init, payer = user, space = 8 + 8 + 8 + 32 + 8, seeds = [STATE_SEED, user.key().as_ref()], bump)]
    pub user_state: Account<'info, UserState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut, has_one = authority)]
    pub user_state: Account<'info, UserState>,
    pub authority: Signer<'info>,
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = from.mint == config.token_mint)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut, constraint = vault.mint == config.token_mint)]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut, has_one = authority)]
    pub user_state: Account<'info, UserState>,
    pub authority: Signer<'info>,
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = to.mint == config.token_mint)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut, constraint = vault.mint == config.token_mint)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = community_ata.mint == config.token_mint)]
    pub community_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut, has_one = authority)]
    pub user_state: Account<'info, UserState>,
    pub authority: Signer<'info>,
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = to.mint == config.token_mint)]
    pub to: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    #[account(mut, constraint = vault.owner == config.key() && vault.mint == config.token_mint)]
    pub vault: Account<'info, TokenAccount>,
}

#[account]
pub struct Config {
    pub community_wallet: Pubkey,
    pub token_mint: Pubkey,
    pub tax_percentage: u8,
    pub min_stake_duration: i64,
    pub bump: u8,
}

#[account]
pub struct UserState {
    pub amount: u64,
    pub start_time: i64,
    pub authority: Pubkey,
    pub last_tax_snapshot: u64,
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

#[error_code]
pub enum StakingError {
    #[msg("Nothing to unstake.")]
    NothingToUnstake,
    #[msg("Nothing to claim.")]
    NothingToClaim,
    #[msg("Insufficient funds in pool.")]
    InsufficientFundsInPool,
    #[msg("Invalid stake amount.")]
    InvalidStakeAmount,
    #[msg("Vault has insufficient funds.")]
    VaultInsufficientBalance,
    #[msg("Vault ATA is not owned by config PDA.")]
    VaultOwnershipMismatch,
}
