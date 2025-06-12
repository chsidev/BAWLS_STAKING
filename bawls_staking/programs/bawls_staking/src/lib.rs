use anchor_lang::prelude::*;
use anchor_lang::solana_program::declare_id;

declare_id!("8eP5KqibfaYq7ANUjEpy6t1Jdq9i3kjwohCDEmCNt3nv");

#[program]
pub mod bawls_staking {
    use super::*;

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        // Transfer tokens from user to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Save stake data
        let stake_data = &mut ctx.accounts.stake_state;
        stake_data.amount = amount;
        stake_data.start_time = Clock::get()?.unix_timestamp;
        stake_data.user = ctx.accounts.user.key();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
