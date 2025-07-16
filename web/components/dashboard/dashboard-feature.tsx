'use client';

import { PublicKey, SystemProgram } from '@solana/web3.js';
import { ItemCard } from '../ui/ItemCard';
import { useWallet } from '@solana/wallet-adapter-react';
import { TokenSwapCard } from '../ui/Swap';
import { useMarketplaceProgram, useSolanaProgram } from '@/lib/hooks';
import * as anchor from '@coral-xyz/anchor';
import { useAnchorProvider } from '../solana/solana-provider';
// import { getMarketplaceProgram } from '@encode-club-final-project/anchor';

const programId = new PublicKey('FWBtGhuFU9xbXQbcGEJxDfQZckUTm8RMS55YiG1jDtdr');

export default function DashboardFeature() {
  const { publicKey, connected } = useWallet();
  const { wallet } = useWallet();
  const provider = useAnchorProvider();
  const { program } = useMarketplaceProgram();

  async function listItem(
    name?: string,
    description?: string,
    price?: number,
    sellerPublicKey?: PublicKey
  ) {
    try {
      const sellerPublicKey = new PublicKey(publicKey?.toBase58() ?? '');
      const [itemPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('item'), sellerPublicKey.toBuffer(), Buffer.from('heyy')],
        programId
      );
      const tx = await program?.methods
        .listItem('heyy', 'helloo', new anchor.BN(1))
        .accounts({
          item: itemPda,
          seller: sellerPublicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log(tx);
      console.log('Item listed successfully! Transaction:', tx);
      console.log('Item PDA:', itemPda.toBase58());
    } catch (error) {
      console.error('Error listing item:', error);
    }
  }

  return (
    <div className="w-full">
      <p className="text-center my-5">SuperSol Marketplace</p>
      <div className="grid grid-cols-4 gap-4 px-[30px] py-[20px]">
        <ItemCard
          name="Sword of Power"
          description="A legendary sword that grants great strength."
          price={1_500_000_000} // 1.5 SOL
          listed={true}
          seller={new PublicKey('9Z6WhWUf2GxsAy4sUs1s1HyKTNJe1wCjaAXT2X8fs555')}
          currentUser={
            new PublicKey('9Z6WhWUf2GxsAy4sUs1s1HyKTNJe1wCjaAXT2X8fs555')
          }
          onBuy={() => {}}
          onUnlist={async () => {
            console.log('!!!');
            await listItem();
          }}
          onRelist={() => {}}
        />
        <ItemCard
          name="Sword of Power"
          description="A legendary sword that grants great strength."
          price={1_500_000_000} // 1.5 SOL
          listed={true}
          seller={new PublicKey('9Z6WhWUf2GxsAy4sUs1s1HyKTNJe1wCjaAXT2X8fs555')}
          currentUser={
            new PublicKey('9Z6WhWUf2GxsAy4sUs1s1HyKTNJe1wCjaAXT2X8fs555')
          }
          onBuy={() => {}}
          onUnlist={() => {}}
          onRelist={() => {}}
        />
      </div>
    </div>
  );
}
