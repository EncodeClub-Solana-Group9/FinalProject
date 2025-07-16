// src/hooks/useSolanaProgram.ts
import { useMemo } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import IDL from '../../anchor/target/idl/marketplace.json';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Marketplace } from '@encode-club-final-project/anchor';
import * as anchor from '@coral-xyz/anchor';

const programId = new anchor.web3.PublicKey(IDL.address);

export function getMockWallet(): AnchorWallet {
  return {
    publicKey: anchor.web3.Keypair.generate().publicKey,
    signTransaction: () => Promise.reject(),
    signAllTransactions: () => Promise.reject(),
  };
}

export function getAnchorProvider(wallet: AnchorWallet) {
  if (!process.env.NEXT_PUBLIC_CLUSTER_URL) {
    throw new Error('NEXT_PUBLIC_CLUSTER_URL is undefined');
  }

  return new anchor.AnchorProvider(
    new anchor.web3.Connection(process.env.NEXT_PUBLIC_CLUSTER_URL),
    wallet,
    { preflightCommitment: 'recent', commitment: 'processed' }
  );
}

export function useSolanaProgram(cluster: string = 'devnet') {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      preflightCommitment: 'confirmed',
    });
  }, [connection, wallet]);

  return { connection, provider, cluster };
}

export function useMarketplaceProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      preflightCommitment: 'processed',
    });
  }, [wallet, connection]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL as Marketplace, provider);
  }, [provider]);

  return { program, provider };
}
