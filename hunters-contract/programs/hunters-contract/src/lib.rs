use anchor_lang::prelude::*;

declare_id!("AiPbAtUTRhT1bBSeoLTNgN5ajibLKg2KeHQj4gX4ZYe9");

#[program]
pub mod hunters_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.buy_count = 0;
        state.sell_count = 0;
        state.wait_count = 0;
        state.last_price = 0;
        state.last_action = String::from("NONE");
        state.total_transactions = 0;
        msg!("Hunters Contract initialized!");
        Ok(())
    }

    pub fn record_decision(
        ctx: Context<RecordDecision>,
        price: u64,
        action: String,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;

        state.last_price = price;
        state.last_action = action.clone();
        state.total_transactions += 1;

        match action.as_str() {
            "BUY"  => state.buy_count += 1,
            "SELL" => state.sell_count += 1,
            _      => state.wait_count += 1,
        }

        msg!("AI Decision recorded: {} at price {}", action, price);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 8 + 8 + 8 + 64 + 8
    )]
    pub state: Account<'info, AgentState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordDecision<'info> {
    #[account(mut)]
    pub state: Account<'info, AgentState>,
    pub authority: Signer<'info>,
}

#[account]
pub struct AgentState {
    pub buy_count: u64,
    pub sell_count: u64,
    pub wait_count: u64,
    pub last_price: u64,
    pub last_action: String,
    pub total_transactions: u64,
}
