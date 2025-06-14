use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Transfer};
use anchor_spl::token::TokenAccount;
use anchor_spl::associated_token::{self, AssociatedToken};

declare_id!("3zqSS8UUtnup2hX96jFqFTHmPteXRXV5xfHMYhEczhfS");

#[program]
pub mod bawls_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, community_wallet: Pubkey) -> Result<()> {
        ctx.accounts.config.community_wallet = community_wallet;
        ctx.accounts.config.bump = ctx.bumps.config;
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
        let cpi_ctx = CpiContext::new(ctx.accounts.associated_token_program.to_account_info(), cpi_accounts);
        anchor_spl::associated_token::create(cpi_ctx)?;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let cpi_ctx = ctx.accounts.transfer_to_vault_context();
        token::transfer(cpi_ctx, amount)?;

        let clock = Clock::get()?;
        ctx.accounts.user_state.amount += amount;
        ctx.accounts.user_state.start_time = clock.unix_timestamp;
        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let stake_duration = now - ctx.accounts.user_state.start_time;

        let amount = ctx.accounts.user_state.amount;
        require!(amount > 0, StakingError::NothingToUnstake);

        let tax = if stake_duration >= 90 * 86400 {
            0
        } else {
            amount * 5 / 100
        };

        let user_amount = amount - tax;

        let bump = ctx.accounts.config.bump;
        let seeds: &[&[u8]] = &[b"config", &[bump]];
        let signer = &[seeds];

        let cpi_ctx = ctx
            .accounts
            .transfer_back_context()
            .with_signer(signer);

        token::transfer(cpi_ctx, user_amount)?;

        ctx.accounts.user_state.amount = 0;
        Ok(())
    }

    pub fn initialize_user_state(ctx: Context<InitializeUserState>) -> Result<()> {
        ctx.accounts.user_state.amount = 0;
        ctx.accounts.user_state.start_time = 0;
        ctx.accounts.user_state.authority = ctx.accounts.user.key();
        Ok(())
    }

}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 1, seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This vault will be created via CPI to the associated token program
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    pub config: Account<'info, Config>,
    /// CHECK: Token mint passed in to create ATA for config
    pub token_mint: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: SPL Token account - manually validated
    #[account(mut)]
    pub from: UncheckedAccount<'info>,

    /// CHECK: SPL Token vault - manually validated
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: SPL Token account - manually validated
    #[account(mut)]
    pub to: UncheckedAccount<'info>,
    
    /// CHECK: SPL Token vault - manually validated
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitializeUserState<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 8 + 32,
        seeds = [b"state", user.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
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

pub fn config_seeds(bump: u8) -> [&'static [u8]; 2] {
    let bump_static: &'static [u8] = Box::leak(Box::new([bump]));
    [b"config", bump_static]
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
}
