'use client';

import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { ItemCard } from '../ui/ItemCard';
import { useMarketplaceProgram } from '@/lib/hooks';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import * as anchor from '@coral-xyz/anchor';

export default function AccountDetailFeature() {
  const { program } = useMarketplaceProgram();
  const { publicKey } = useWallet();
  const [items, setItems] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async (name: string) => {
    if (loading) return;
    const toastId = toast.loading('Deleting item...', {
      id: 'delete-item',
      duration: Infinity,
    });
    try {
      setLoading(true);
      const programId = new PublicKey(
        'FWBtGhuFU9xbXQbcGEJxDfQZckUTm8RMS55YiG1jDtdr'
      );
      const sellerPublicKey = new PublicKey(publicKey?.toBase58() ?? '');
      const [itemPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('item'), sellerPublicKey.toBuffer(), Buffer.from(name)],
        programId
      );
      await (program as any)?.methods
        .closeItem()
        .accounts({
          item: itemPda,
          seller: sellerPublicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast.success(`Successfully deleted the item!`, {
        id: toastId,
        duration: 4000,
      });
    } catch (error) {
      const errorMessage = error?.toString();
      if (
        !errorMessage?.toLowerCase()?.includes('user rejected the request.')
      ) {
        toast.success(`Successfully deleted the item!`, {
          id: toastId,
          duration: 4000,
        });
      } else {
        toast.dismiss();
      }
    } finally {
      setLoading(false);
    }
  };

  async function handleList(name: string, price: string, listItem: boolean) {
    if (loading) return;
    const toastId = toast.loading(
      listItem ? 'Listing item...' : 'Unlisting item...',
      {
        id: listItem ? 'list-item' : 'unlist-item',
        duration: Infinity,
      }
    );
    try {
      setLoading(true);
      const programId = new PublicKey(
        'FWBtGhuFU9xbXQbcGEJxDfQZckUTm8RMS55YiG1jDtdr'
      );
      const sellerPublicKey = new PublicKey(publicKey?.toBase58() ?? '');
      const [itemPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('item'), sellerPublicKey.toBuffer(), Buffer.from(name)],
        programId
      );
      await (program as any)?.methods
        .setListingStatus(name, listItem, new anchor.BN(parseFloat(price)))
        .accounts({
          item: itemPda,
          seller: sellerPublicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast.success(
        `Successfully ${listItem ? 'listed' : 'unlisted'} the item!`,
        {
          id: toastId,
          duration: 4000,
        }
      );
    } catch (error) {
      const errorMessage = error?.toString();
      if (
        !errorMessage?.toLowerCase()?.includes('user rejected the request.')
      ) {
        toast.success(
          `Successfully ${listItem ? 'listed' : 'unlisted'} the item!`,
          {
            id: toastId,
            duration: 4000,
          }
        );
      } else {
        toast.dismiss();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchItems = async () => {
      const sellerPublicKey = new PublicKey(publicKey?.toBase58() ?? '');
      const itemsBySeller = await program?.account.item.all([
        {
          memcmp: {
            offset: 8, // skip discriminator
            bytes: sellerPublicKey.toBase58(),
          },
        },
      ]);
      itemsBySeller?.sort((a, b) => b.account.listedAt - a.account.listedAt);
      setItems(itemsBySeller);
    };
    fetchItems();
  }, [loading]);

  return (
    <div>
      <div className="w-full">
        <p className="text-center my-5">My items</p>
        <div className="grid grid-cols-4 gap-4 px-[30px] py-[20px]">
          {items?.map((item: any) => (
            <ItemCard
              key={item.account.name + item.account.seller.toBase58()}
              disableButtons={loading}
              name={item.account.name}
              description={item.account.description}
              price={(
                item.account.price.toNumber() / Math.pow(10, 9)
              ).toString()}
              listed={item.account.listItem}
              seller={item.account.seller.toBase58()}
              currentUser={publicKey?.toBase58() ?? ''}
              onDelete={async () => {
                await handleDelete(item.account.name);
              }}
              onBuy={() => {}}
              onUnlist={async () => {
                await handleList(
                  item.account.name,
                  item.account.price.toString(),
                  false
                );
              }}
              onRelist={async () => {
                await handleList(
                  item.account.name,
                  item.account.price.toString(),
                  true
                );
              }}
              showDelete
            />
          ))}
        </div>
      </div>
    </div>
  );
}
