use anchor_lang::prelude::*;

declare_id!("9426uyFBpzXhVRxmfXzFoCgWP9shVJpYevsbSKoDyKkn");

#[program]
pub mod bawls_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
