import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Marketplace } from '../target/types/marketplace';

describe('marketplace', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // The program instance
  const program = anchor.workspace.Marketplace as Program<Marketplace>;

  // Keypairs for testing different roles
  const seller = anchor.web3.Keypair.generate();
  const buyer = anchor.web3.Keypair.generate();

  // Define an item name and description for consistent testing
  const itemName = 'Test Item';
  const itemDescription = 'This is a test item for sale.';
  const itemPrice = new anchor.BN(1000000000); // 1 SOL in lamports

  // Helper function to fund a new account
  const fundAccount = async (
    publicKey: anchor.web3.PublicKey,
    amount: number
  ) => {
    const tx = await provider.connection.requestAirdrop(publicKey, amount);
    await provider.connection.confirmTransaction(tx, 'confirmed');
  };

  // Before all tests, fund the seller and buyer accounts
  beforeAll(async () => {
    console.log('Funding seller and buyer accounts...');
    await fundAccount(seller.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL); // Fund with 2 SOL
    await fundAccount(buyer.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL); // Fund with 5 SOL
    console.log('Accounts funded.');
  });

  // --- Test Cases for list_item ---
  describe('list_item', () => {
    it('Successfully lists an item', async () => {
      // Generate a unique item PDA for each test to avoid conflicts
      const [itemPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('item'),
          seller.publicKey.toBuffer(),
          Buffer.from(itemName),
        ],
        program.programId
      );

      // Call the list_item instruction
      await (program as any).methods
        .listItem(itemName, itemDescription, itemPrice)
        .accounts({
          item: itemPda,
          seller: seller.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      // Fetch the item account and verify its data
      const itemAccount = await program.account.item.fetch(itemPda);

      assert.isTrue(itemAccount.seller.equals(seller.publicKey));
      assert.strictEqual(itemAccount.name, itemName);
      assert.strictEqual(itemAccount.description, itemDescription);
      assert.isTrue(itemAccount.price.eq(itemPrice));
      assert.isTrue(itemAccount.listItem); // Should be true after listing
      assert.strictEqual(itemAccount.bump, itemPda.bump); // Verify bump

      console.log('Item listed successfully:', itemAccount);
    });

    it('Fails to list item with name too long', async () => {
      const longName = 'a'.repeat(33); // 33 characters, max is 32
      const [itemPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('item'),
          seller.publicKey.toBuffer(),
          Buffer.from(longName),
        ],
        program.programId
      );

      try {
        await (program as any).methods
          .listItem(longName, itemDescription, itemPrice)
          .accounts({
            item: itemPda,
            seller: seller.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([seller])
          .rpc();
        assert.fail(
          'The transaction should have failed with NameTooLong error.'
        );
      } catch (error) {
        assert.instanceOf(error, anchor.AnchorError);
        assert.strictEqual(error.error.errorCode.code, 'NameTooLong');
        console.log('Caught expected error: NameTooLong');
      }
    });

    it('Fails to list item with description too long', async () => {
      const longDescription = 'a'.repeat(257); // 257 characters, max is 256
      const uniqueItemName = 'Unique Item for Long Desc'; // Use a unique name
      const [itemPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('item'),
          seller.publicKey.toBuffer(),
          Buffer.from(uniqueItemName),
        ],
        program.programId
      );

      try {
        await (program as any).methods
          .listItem(uniqueItemName, longDescription, itemPrice)
          .accounts({
            item: itemPda,
            seller: seller.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([seller])
          .rpc();
        assert.fail(
          'The transaction should have failed with DescriptionTooLong error.'
        );
      } catch (error) {
        assert.instanceOf(error, anchor.AnchorError);
        assert.strictEqual(error.error.errorCode.code, 'DescriptionTooLong');
        console.log('Caught expected error: DescriptionTooLong');
      }
    });
  });

  // --- Test Cases for buy_item ---
  describe('buy_item', () => {
    // List an item before running buy_item tests
    let listedItemPda: anchor.web3.PublicKey;
    const buyItemName = 'Item to Buy';
    const buyItemPrice = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL); // 1 SOL

    beforeAll(async () => {
      [listedItemPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('item'),
          seller.publicKey.toBuffer(),
          Buffer.from(buyItemName),
        ],
        program.programId
      );

      await program.methods
        .listItem(buyItemName, 'Description for buying', buyItemPrice)
        .accounts({
          item: listedItemPda,
          seller: seller.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      const itemAccount = await program.account.item.fetch(listedItemPda);
      assert.isTrue(
        itemAccount.listItem,
        'Item should be listed for buy tests'
      );
      console.log('Item listed for buying tests.');
    });

    it('Successfully buys an item', async () => {
      const initialSellerBalance = await provider.connection.getBalance(
        seller.publicKey
      );
      const initialBuyerBalance = await provider.connection.getBalance(
        buyer.publicKey
      );

      // Call the buy_item instruction
      await program.methods
        .buyItem(buyItemName) // Pass the item name to the instruction
        .accounts({
          item: listedItemPda,
          buyer: buyer.publicKey,
          seller: seller.publicKey, // Seller's account info is needed for transfer
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      // Verify the item's seller has changed to the buyer
      const itemAccount = await program.account.item.fetch(listedItemPda);
      assert.isTrue(
        itemAccount.seller.equals(buyer.publicKey),
        'Item seller should be the buyer after purchase'
      );

      // Verify balances (approximate due to transaction fees)
      const finalSellerBalance = await provider.connection.getBalance(
        seller.publicKey
      );
      const finalBuyerBalance = await provider.connection.getBalance(
        buyer.publicKey
      );

      // Seller's balance should increase by itemPrice
      assert.closeTo(
        finalSellerBalance,
        initialSellerBalance + buyItemPrice.toNumber(),
        anchor.web3.LAMPORTS_PER_SOL * 0.01,
        'Seller balance should increase'
      );
      // Buyer's balance should decrease by itemPrice + transaction fee
      assert.closeTo(
        finalBuyerBalance,
        initialBuyerBalance - buyItemPrice.toNumber(),
        anchor.web3.LAMPORTS_PER_SOL * 0.01,
        'Buyer balance should decrease'
      );

      console.log('Item bought successfully.');
    });

    it('Fails to buy an item that is not listed', async () => {
      const unlistedItemName = 'Unlisted Item';
      const [unlistedItemPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('item'),
          seller.publicKey.toBuffer(),
          Buffer.from(unlistedItemName),
        ],
        program.programId
      );

      // First, list an item, then immediately set its status to unlisted
      await program.methods
        .listItem(
          unlistedItemName,
          'This item will be unlisted',
          new anchor.BN(100)
        )
        .accounts({
          item: unlistedItemPda,
          seller: seller.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      // Set listing status to false
      await program.methods
        .setListingStatus(false, null) // Set list_item to false, no price change
        .accounts({
          item: unlistedItemPda,
          seller: seller.publicKey,
        })
        .signers([seller])
        .rpc();

      const unlistedItemAccount = await program.account.item.fetch(
        unlistedItemPda
      );
      assert.isFalse(
        unlistedItemAccount.listItem,
        'Item should be unlisted for this test'
      );

      try {
        await program.methods
          .buyItem(unlistedItemName)
          .accounts({
            item: unlistedItemPda,
            buyer: buyer.publicKey,
            seller: seller.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([buyer])
          .rpc();
        assert.fail('The transaction should have failed with NotListed error.');
      } catch (error) {
        assert.instanceOf(error, anchor.AnchorError);
        assert.strictEqual(error.error.errorCode.code, 'NotListed');
        console.log('Caught expected error: NotListed');
      }
    });

    it('Fails if seller tries to buy their own item', async () => {
      const selfBuyItemName = 'Self Buy Item';
      const [selfBuyItemPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('item'),
          seller.publicKey.toBuffer(),
          Buffer.from(selfBuyItemName),
        ],
        program.programId
      );

      // List an item by the seller
      await program.methods
        .listItem(selfBuyItemName, 'Item for self-buy test', new anchor.BN(100))
        .accounts({
          item: selfBuyItemPda,
          seller: seller.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      try {
        await program.methods
          .buyItem(selfBuyItemName)
          .accounts({
            item: selfBuyItemPda,
            buyer: seller.publicKey, // Seller is trying to buy
            seller: seller.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([seller]) // Seller signs as buyer
          .rpc();
        assert.fail(
          'The transaction should have failed with SellerCannotBuy error.'
        );
      } catch (error) {
        assert.instanceOf(error, anchor.AnchorError);
        assert.strictEqual(error.error.errorCode.code, 'SellerCannotBuy');
        console.log('Caught expected error: SellerCannotBuy');
      }
    });
  });

  // --- Test Cases for set_listing_status ---
  describe('set_listing_status', () => {
    let statusItemPda: anchor.web3.PublicKey;
    const statusItemName = 'Status Change Item';
    const initialStatusPrice = new anchor.BN(500000000); // 0.5 SOL

    beforeEach(async () => {
      // Use beforeEach to ensure a fresh item for each test
      [statusItemPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('item'),
          seller.publicKey.toBuffer(),
          Buffer.from(statusItemName),
        ],
        program.programId
      );

      // List the item initially
      await program.methods
        .listItem(
          statusItemName,
          'Item for status change tests',
          initialStatusPrice
        )
        .accounts({
          item: statusItemPda,
          seller: seller.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([seller])
        .rpc();

      const itemAccount = await program.account.item.fetch(statusItemPda);
      assert.isTrue(itemAccount.listItem, 'Item should be listed initially');
      console.log('Item listed for status change tests.');
    });

    it('Successfully unlists an item', async () => {
      await program.methods
        .setListingStatus(false, null) // Set list_item to false, no price change
        .accounts({
          item: statusItemPda,
          seller: seller.publicKey,
        })
        .signers([seller])
        .rpc();

      const itemAccount = await program.account.item.fetch(statusItemPda);
      assert.isFalse(itemAccount.listItem, 'Item should be unlisted');
      assert.isTrue(
        itemAccount.price.eq(initialStatusPrice),
        'Price should remain unchanged'
      );
      console.log('Item unlisted successfully.');
    });

    it('Successfully relists an item', async () => {
      // First unlist it
      await program.methods
        .setListingStatus(false, null)
        .accounts({
          item: statusItemPda,
          seller: seller.publicKey,
        })
        .signers([seller])
        .rpc();

      let itemAccount = await program.account.item.fetch(statusItemPda);
      assert.isFalse(
        itemAccount.listItem,
        'Item should be unlisted before relisting'
      );

      // Then relist it
      await program.methods
        .setListingStatus(true, null) // Set list_item to true, no price change
        .accounts({
          item: statusItemPda,
          seller: seller.publicKey,
        })
        .signers([seller])
        .rpc();

      itemAccount = await program.account.item.fetch(statusItemPda);
      assert.isTrue(itemAccount.listItem, 'Item should be relisted');
      assert.isTrue(
        itemAccount.price.eq(initialStatusPrice),
        'Price should remain unchanged'
      );
      console.log('Item relisted successfully.');
    });

    it('Successfully changes item price', async () => {
      const newPrice = new anchor.BN(2000000000); // 2 SOL

      await program.methods
        .setListingStatus(true, newPrice) // Keep listed, change price
        .accounts({
          item: statusItemPda,
          seller: seller.publicKey,
        })
        .signers([seller])
        .rpc();

      const itemAccount = await program.account.item.fetch(statusItemPda);
      assert.isTrue(itemAccount.listItem, 'Item should remain listed');
      assert.isTrue(
        itemAccount.price.eq(newPrice),
        'Item price should be updated'
      );
      console.log('Item price changed successfully.');
    });

    it('Successfully changes item price and listing status simultaneously', async () => {
      const newPrice = new anchor.BN(3000000000); // 3 SOL

      await program.methods
        .setListingStatus(false, newPrice) // Unlist and change price
        .accounts({
          item: statusItemPda,
          seller: seller.publicKey,
        })
        .signers([seller])
        .rpc();

      const itemAccount = await program.account.item.fetch(statusItemPda);
      assert.isFalse(itemAccount.listItem, 'Item should be unlisted');
      assert.isTrue(
        itemAccount.price.eq(newPrice),
        'Item price should be updated'
      );
      console.log('Item status and price changed simultaneously.');
    });

    it('Fails if a non-seller tries to change listing status', async () => {
      try {
        await program.methods
          .setListingStatus(false, null)
          .accounts({
            item: statusItemPda,
            seller: buyer.publicKey, // Buyer tries to change status
          })
          .signers([buyer])
          .rpc();
        assert.fail(
          'The transaction should have failed with Unauthorized error.'
        );
      } catch (error) {
        assert.instanceOf(error, anchor.AnchorError);
        assert.strictEqual(error.error.errorCode.code, 'Unauthorized');
        console.log('Caught expected error: Unauthorized');
      }
    });
  });
});
