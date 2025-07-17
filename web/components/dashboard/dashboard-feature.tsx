'use client';

import { PublicKey, SystemProgram } from '@solana/web3.js';
import { ItemCard } from '../ui/ItemCard';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMarketplaceProgram } from '@/lib/hooks';
import * as anchor from '@coral-xyz/anchor';
import { AnimatedModal } from '../ui/AnimatedModal';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DashboardFeature() {
  const { publicKey } = useWallet();
  const { program } = useMarketplaceProgram();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [items, setItems] = useState<any>();

  const disableButton = !name || !description || !price;

  async function listItem(name: string, description: string, price: string) {
    if (loading) return;
    const toastId = toast.loading('Listing item...', {
      id: 'list-item',
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
        .listItem(
          name,
          description,
          new anchor.BN(parseFloat(price) * Math.pow(10, 9))
        )
        .accounts({
          item: itemPda,
          seller: sellerPublicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setName('');
      setDescription('');
      setPrice('');
      setIsOpenModal(false);
      toast.success(`Successfully listed the item!`, {
        id: toastId,
        duration: 4000,
      });
    } catch (error) {
      const errorMessage = error?.toString();
      console.log(errorMessage);
      if (
        !errorMessage?.toLowerCase()?.includes('user rejected the request.')
      ) {
        toast.success(`Successfully listed the item!`, {
          id: toastId,
          duration: 4000,
        });
      } else {
        toast.dismiss();
      }
      setName('');
      setDescription('');
      setPrice('');
      setIsOpenModal(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleList(name: string, price: string, listItem: boolean) {
    if (loading) return;
    const toastId = toast.loading('Unlisting item...', {
      id: 'unlist-item',
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
        .setListingStatus(name, listItem, new anchor.BN(parseFloat(price)))
        .accounts({
          item: itemPda,
          seller: sellerPublicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast.success(`Successfully unlisted the item!`, {
        id: toastId,
        duration: 4000,
      });
    } catch (error) {
      const errorMessage = error?.toString();
      if (
        !errorMessage?.toLowerCase()?.includes('user rejected the request.')
      ) {
        toast.success(`Successfully unlisted the item!`, {
          id: toastId,
          duration: 4000,
        });
      } else {
        toast.dismiss();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(name: string, seller: PublicKey) {
    if (loading) return;
    const toastId = toast.loading('Buying item...', {
      id: 'buy-item',
      duration: Infinity,
    });
    try {
      setLoading(true);
      const programId = new PublicKey(
        'FWBtGhuFU9xbXQbcGEJxDfQZckUTm8RMS55YiG1jDtdr'
      );
      const buyerPublicKey = new PublicKey(publicKey?.toBase58() ?? '');
      const [itemPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('item'), seller.toBuffer(), Buffer.from(name)],
        programId
      );
      await (program as any)?.methods
        .buyItem(name)
        .accounts({
          item: itemPda,
          buyer: buyerPublicKey,
          seller: seller,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast.success(`Successfully bought the item!`, {
        id: toastId,
        duration: 4000,
      });
    } catch (error) {
      const errorMessage = error?.toString();
      if (
        !errorMessage?.toLowerCase()?.includes('user rejected the request.')
      ) {
        toast.success(`Successfully bought the item!`, {
          id: toastId,
          duration: 4000,
        });
      } else {
        toast.dismiss();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchItems = async () => {
      if (!program) return;

      try {
        const allItems = await program.account.item.all();
        allItems.sort((a, b) => b.account.listedAt - a.account.listedAt);
        setItems(allItems);
      } catch (err) {
        console.error('Error fetching items:', err);
      }
    };

    fetchItems();
  }, [program, loading]);

  return (
    <div className="w-full">
      <p className="text-center my-5">SuperSol Marketplace</p>
      <div className="flex justify-center">
        <button
          onClick={() => {
            setIsOpenModal(true);
          }}
          className="w-fit px-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
        >
          List Item
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 py-[20px]">
        {items
          ?.filter((a: any) => a.account.listItem)
          .map((item: any) => (
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
              onBuy={async () => {
                await handleBuy(item.account.name, item.account.seller);
              }}
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
            />
          ))}
      </div>
      <AnimatedModal
        isOpen={isOpenModal}
        onClose={() => {
          if (loading) return;
          setIsOpenModal(false);
        }}
      >
        <form>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-[15px]">
            ⚡ Create New Item
          </h2>
          <div className="flex flex-col gap-y-2">
            <label
              htmlFor="name"
              className="block my-1 text-gray-700 text-md dark:text-white"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              className={`w-full border shadow-sm focus-visible:outline-none dark:border-zinc-700 border-zinc-200 rounded p-2 text-sm ${
                loading
                  ? 'dark:bg-zinc-700 bg-zinc-100 cursor-not-allowed'
                  : 'dark:bg-zinc-800 bg-zinc-50'
              }`}
              disabled={loading}
            />
            <label
              htmlFor="description"
              className="block my-1 text-gray-700 text-md dark:text-white"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="Enter item description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full border shadow-sm focus-visible:outline-none dark:border-zinc-700 border-zinc-200 rounded p-2 text-sm ${
                loading
                  ? 'dark:bg-zinc-700 bg-zinc-100 cursor-not-allowed'
                  : 'dark:bg-zinc-800 bg-zinc-50'
              }`}
              disabled={loading}
            />
            <label
              htmlFor="price"
              className="block my-1 text-gray-700 text-md dark:text-white"
            >
              Price <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="text"
              placeholder="Enter item price"
              value={price}
              onChange={(e) => {
                if (
                  e.target.value === '' ||
                  /^[0-9]*\.?[0-9]*$/.test(e.target.value)
                ) {
                  setPrice(e.target.value);
                }
              }}
              className={`w-full border shadow-sm focus-visible:outline-none dark:border-zinc-700 border-zinc-200 rounded p-2 text-sm ${
                loading
                  ? 'dark:bg-zinc-700 bg-zinc-100 cursor-not-allowed'
                  : 'dark:bg-zinc-800 bg-zinc-50'
              }`}
              disabled={loading}
            />
            <div className="flex justify-center w-full mt-2">
              <button
                disabled={loading || disableButton}
                type="button"
                onClick={async () => {
                  if (loading) return;
                  listItem(name, description, price);
                }}
                className="w-full px-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </AnimatedModal>
    </div>
  );
}
