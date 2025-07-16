'use client';

import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';

import { useParams } from 'next/navigation';

import { ExplorerLink } from '../cluster/cluster-ui';
import { AppHero, ellipsify } from '../ui/ui-layout';
import {
  AccountBalance,
  AccountButtons,
  AccountTokens,
  AccountTransactions,
} from './account-ui';
import { ItemCard } from '../ui/ItemCard';

export default function AccountDetailFeature() {
  const params = useParams();
  const address = useMemo(() => {
    if (!params.address) {
      return;
    }
    try {
      return new PublicKey(params.address);
    } catch (e) {
      console.log(`Invalid public key`, e);
    }
  }, [params]);
  if (!address) {
    return <div>Error loading account</div>;
  }

  return (
    <div>
      <div className="w-full">
        <p className="text-center my-5">My items</p>
        <div className="grid grid-cols-4 gap-4 px-[30px] py-[20px]">
          <ItemCard
            name="Sword of Power"
            description="A legendary sword that grants great strength."
            price={1_500_000_000} // 1.5 SOL
            listed={true}
            seller={
              new PublicKey('9Z6WhWUf2GxsAy4sUs1s1HyKTNJe1wCjaAXT2X8fs555')
            }
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
            seller={
              new PublicKey('9Z6WhWUf2GxsAy4sUs1s1HyKTNJe1wCjaAXT2X8fs555')
            }
            currentUser={
              new PublicKey('9Z6WhWUf2GxsAy4sUs1s1HyKTNJe1wCjaAXT2X8fs555')
            }
            onBuy={() => {}}
            onUnlist={() => {}}
            onRelist={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
