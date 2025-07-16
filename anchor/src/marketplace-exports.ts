// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import MarketplaceIDL from '../target/idl/marketplace.json';
import type { Marketplace } from '../target/types/marketplace';

// Re-export the generated IDL and type
export { Marketplace, MarketplaceIDL };

// The programId is imported from the program IDL.
export const COUNTER_PROGRAM_ID = new PublicKey(MarketplaceIDL.address);

// This is a helper function to get the Counter Anchor program.
export function getMarketplaceProgram(provider: AnchorProvider) {
  return new Program(MarketplaceIDL as Marketplace, provider);
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getMarketplaceProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return new PublicKey('6BrWXuQJLxmC4VENhUoG3pkrG6FeKGsHw6jyVn9UbCNQ');
    case 'mainnet-beta':
    default:
      return COUNTER_PROGRAM_ID;
  }
}
