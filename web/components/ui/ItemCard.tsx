import { FC } from 'react';
import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';

interface ItemCardProps {
  name: string;
  description: string;
  price: number;
  listed: boolean;
  seller: PublicKey;
  currentUser: PublicKey;
  onBuy?: () => void;
  onUnlist?: () => void;
  onRelist?: () => void;
}

export const ItemCard: FC<ItemCardProps> = ({
  name,
  description,
  price,
  listed,
  seller,
  currentUser,
  onBuy,
  onUnlist,
  onRelist,
}) => {
  const isOwner = seller.equals(currentUser);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition-transform">
      <div className="flex justify-center items-center">
        <img
          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${Math.random()}&size=10`}
          width={200}
          height={200}
          className="w-full"
        />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 my-2">{name}</h2>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-indigo-600 font-bold">
          {price / 1_000_000_000} SOL
        </span>
        <span className="text-xs text-gray-400 truncate max-w-[50%]">
          {seller.toBase58()}
        </span>
      </div>

      {isOwner ? (
        listed ? (
          <button
            onClick={onUnlist}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition"
          >
            Unlist Item
          </button>
        ) : (
          <button
            onClick={onRelist}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Relist Item
          </button>
        )
      ) : listed ? (
        <button
          onClick={onBuy}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Buy Now
        </button>
      ) : (
        <span className="text-sm text-gray-400 italic">Not for sale</span>
      )}
    </div>
  );
};
