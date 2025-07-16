import { FC } from 'react';
import { TokenInfo } from '@solana/spl-token-registry';
import { cn } from '@/lib/utils'; // optional: classNames helper

interface TokenSwapCardProps {
  fromToken: TokenInfo | null;
  toToken: TokenInfo | null;
  amountFrom: string;
  amountTo: string;
  onAmountFromChange: (val: string) => void;
  onSelectFrom: () => void;
  onSelectTo: () => void;
  onSwap: () => void;
  loading?: boolean;
}

export const TokenSwapCard: FC<TokenSwapCardProps> = ({
  fromToken,
  toToken,
  amountFrom,
  amountTo,
  onAmountFromChange,
  onSelectFrom,
  onSelectTo,
  onSwap,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Swap Tokens</h2>

      {/* From Token */}
      <div className="mb-4">
        <label className="text-gray-600 text-sm">From</label>
        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3 mt-1">
          <button
            onClick={onSelectFrom}
            className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-lg font-semibold mr-3 hover:bg-indigo-700 transition"
          >
            {fromToken?.symbol || 'Select'}
          </button>
          <input
            type="number"
            placeholder="0.0"
            value={amountFrom}
            onChange={(e) => onAmountFromChange(e.target.value)}
            className="bg-transparent w-full outline-none text-right text-lg font-medium"
          />
        </div>
        <p className="text-gray-600 text-sm mt-2">You have 100 SOL</p>
      </div>

      {/* Swap Icon */}
      <div className="flex justify-center my-2">
        <div className="bg-indigo-100 p-2 rounded-full rotate-90 md:rotate-0 transition-transform">
          <svg
            className="h-5 w-5 text-indigo-600 transform rotate-90 md:rotate-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* To Token */}
      <div className="mb-4">
        <label className="text-gray-600 text-sm">To</label>
        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3 mt-1">
          <button
            onClick={onSelectTo}
            className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-lg font-semibold mr-3 hover:bg-indigo-700 transition"
          >
            {toToken?.symbol || 'Select'}
          </button>
          <input
            type="text"
            readOnly
            value={amountTo}
            placeholder="0.0"
            className="bg-transparent w-full outline-none text-right text-lg font-medium text-gray-500"
          />
        </div>
        <p className="text-gray-600 text-sm mt-2">You have 100 USDT</p>
      </div>

      {/* Swap Button */}
      <button
        onClick={onSwap}
        disabled={loading || !fromToken || !toToken || !amountFrom}
        className={cn(
          'w-full py-3 rounded-xl font-semibold transition cursor-pointer',
          loading
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        )}
      >
        {loading ? 'Swapping...' : 'Swap 100 SOL -> 100 USDT'}
      </button>
    </div>
  );
};
