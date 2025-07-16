import { FC } from 'react';
import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';

interface ItemCardProps {
  name: string;
  description: string;
  price: string;
  listed: boolean;
  seller: string;
  currentUser: string;
  onBuy?: () => void;
  onUnlist?: () => void;
  onRelist?: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
  disableButtons?: boolean;
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
  showDelete = false,
  onDelete,
  disableButtons,
}) => {
  const isOwner = seller === currentUser;
  const programId = new PublicKey(
    'FWBtGhuFU9xbXQbcGEJxDfQZckUTm8RMS55YiG1jDtdr'
  );
  const sellerPublicKey = new PublicKey(seller);
  const [itemPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('item'), sellerPublicKey.toBuffer(), Buffer.from(name)],
    programId
  );
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition-transform">
      <div className="flex justify-center items-center">
        <img
          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${itemPda}&size=225`}
          width={200}
          height={200}
          className="w-full"
        />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 my-2">{name}</h2>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-indigo-600 font-bold">{price} SOL</span>
        <span className="text-xs text-gray-400 truncate max-w-[50%]">
          {seller ? seller?.slice(0, 4) + '..' + seller?.slice(40) : ''}
        </span>
      </div>
      <div className="flex gap-x-2">
        {isOwner ? (
          listed ? (
            <button
              disabled={disableButtons}
              onClick={onUnlist}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition"
            >
              Unlist Item
            </button>
          ) : (
            <button
              disabled={disableButtons}
              onClick={onRelist}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
            >
              Relist Item
            </button>
          )
        ) : listed ? (
          <button
            disabled={disableButtons}
            onClick={onBuy}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Buy Now
          </button>
        ) : (
          <span className="text-sm text-gray-400 italic">Not for sale</span>
        )}
        {showDelete && (
          <button
            disabled={disableButtons}
            onClick={onDelete}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
