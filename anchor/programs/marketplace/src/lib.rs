use anchor_lang::prelude::*;

declare_id!("FWBtGhuFU9xbXQbcGEJxDfQZckUTm8RMS55YiG1jDtdr");

#[program]
pub mod marketplace {
  use super::*;

  pub fn list_item(
    ctx: Context<ListItem>, 
    name: String, 
    description: String, 
    price: u64
  ) -> Result<()> {
    require!(name.len() <= 32, MarketplaceError::NameTooLong);
    require!(description.len() <= 256, MarketplaceError::DescriptionTooLong);

    let item = &mut ctx.accounts.item;
    item.seller = ctx.accounts.seller.key();
    item.name = name;
    item.description = description;
    item.price = price;
    item.list_item = true;
    item.bump = ctx.bumps.item;
    item.listed_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn buy_item(ctx: Context<BuyItem>, _name: String) -> Result<()> {
    let item = &mut ctx.accounts.item;
    require!(item.list_item, MarketplaceError::NotListed);
    require_keys_neq!(ctx.accounts.buyer.key(), item.seller, MarketplaceError::SellerCannotBuy);

    let ix = anchor_lang::solana_program::system_instruction::transfer(
      &ctx.accounts.buyer.key(),
      &item.seller,
      item.price
    );
    anchor_lang::solana_program::program::invoke(
      &ix,
      &[
        ctx.accounts.buyer.to_account_info(),
        ctx.accounts.seller.to_account_info(),
      ]
    )?;

    item.seller = ctx.accounts.buyer.key();
    Ok(())
  }

  pub fn set_listing_status(
    ctx: Context<SetListingStatus>,
    _name: String, 
    list_item: bool,
    new_price: Option<u64>,
  ) -> Result<()> {
    let item = &mut ctx.accounts.item;
    require_keys_eq!(item.seller, ctx.accounts.seller.key(), MarketplaceError::Unauthorized);

    item.list_item = list_item;

    if let Some(price) = new_price {
      item.price = price;
    }

    Ok(())
  }

  pub fn close_item(ctx: Context<CloseItem>) -> Result<()> {
    let item = &mut ctx.accounts.item;

    require_keys_eq!(item.seller, ctx.accounts.seller.key(), MarketplaceError::Unauthorized);

    Ok(())
  }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct BuyItem<'info> {
  #[account(
    mut,
    seeds = [b"item", item.seller.as_ref(), name.as_bytes()],
    bump = item.bump
  )]
  pub item: Account<'info, Item>,
  #[account(mut)]
  pub buyer: Signer<'info>,
  /// CHECK: This is the seller's wallet. We don’t need to validate any data here.
  #[account(mut)]
  pub seller: AccountInfo<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct SetListingStatus<'info> {
  #[account(
    mut,
    seeds = [b"item", item.seller.as_ref(), name.as_bytes()],
    bump = item.bump
  )]
  pub item: Account<'info, Item>,
  /// CHECK: This is the seller's wallet. We don’t need to validate any data here.
  pub seller: Signer<'info>
}

#[derive(Accounts)]
#[instruction(name: String, description: String)]
pub struct ListItem<'info> {
  #[account(
    init, 
    payer = seller, 
    space = 8 + Item::INIT_SPACE, 
    seeds = [b"item", seller.key().as_ref(), name.as_bytes()], 
    bump
  )]
  pub item: Account<'info, Item>,
  /// CHECK: This is the seller's wallet. We don’t need to validate any data here.
  #[account(mut)]
  pub seller: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseItem<'info> {
  #[account(
    mut,
    seeds = [b"item", seller.key().as_ref(), item.name.as_bytes()],
    bump = item.bump,
    close = seller
  )]
  pub item: Account<'info, Item>,

  #[account(mut)]
  pub seller: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Item {
  /// CHECK: This is the seller's wallet. We don’t need to validate any data here.
  pub seller: Pubkey,
  pub price: u64,
  pub list_item: bool,
  #[max_len(32)]
  pub name: String,
  #[max_len(256)]
  pub description: String,
  pub bump: u8,
  pub listed_at: i64,
}

#[error_code]
pub enum MarketplaceError {
  #[msg("Item is not listed.")]
  NotListed,
  #[msg("You can't buy your own item.")]
  SellerCannotBuy,
  #[msg("Name exceeds 32 characters.")]
  NameTooLong,
  #[msg("Description exceeds 256 characters.")]
  DescriptionTooLong,
  #[msg("Only the item owner can perform this action.")]
  Unauthorized,
}