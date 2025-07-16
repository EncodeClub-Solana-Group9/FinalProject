'use client';

import { PublicKey } from '@solana/web3.js';
import { ItemCard } from '../ui/ItemCard';
import { useWallet } from '@solana/wallet-adapter-react';
import { TokenSwapCard } from '../ui/Swap';

export default function DashboardFeature() {
  const { wallet } = useWallet();
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
          onUnlist={() => {}}
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
