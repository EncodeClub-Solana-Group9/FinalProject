'use client';

import { useEffect, useState } from 'react';
import { AnimatedDropdown } from '../ui/AnimatedDropdown';
import {
  cn,
  defaultSol,
  defaultUsdt,
  formatNumberWithCommas,
  formatNumberWithDecimals,
  isSwapInputInvalid,
  tokens,
} from '@/lib/utils';
import {
  QuoteResponse,
  SPLTokenData,
  SwapResponse,
  Token,
} from '@/lib/interface';
import useSWR from 'swr';
import { axiosJupiter, fetcherJupiter } from '@/lib/axios';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';

export default function ClusterFeature() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setMountTo] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [fromToken, setFromToken] = useState<Token>(
    tokens?.find((x) => x.symbol === 'SOL') ?? defaultSol
  );
  const [toTokenBalance, setToTokenBalance] = useState<string>('');
  const [fromTokenBalance, setFromTokenBalance] = useState<string | number>('');
  const [toToken, setToToken] = useState<Token>(
    tokens?.find((x) => x.symbol === 'USDT') ?? defaultUsdt
  );
  const amountToSend = formatNumberWithDecimals(
    amountFrom,
    fromToken?.decimals
  );

  const quoteKey = `/swap/v1/quote?inputMint=${fromToken?.mint}&outputMint=${
    toToken?.mint
  }&amount=${amountToSend.toString()}&slippage=${slippage}`;

  const { data: quoteData, mutate: quoteMutate } = useSWR(
    quoteKey,
    fetcherJupiter
  );
  const quoteResult = quoteData?.data as QuoteResponse;
  const swapValue = formatNumberWithCommas(
    quoteResult?.outAmount,
    toToken?.decimals
  );
  const disableButton =
    isSwapInputInvalid(amountFrom, fromTokenBalance) || loading;
  const setSPLTokenBalance = async (
    publicKey: PublicKey,
    mintAddress: string,
    setTokenBalance: (amount: string) => void
  ) => {
    const associatedTokenAccountAddress = await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      publicKey,
      true,
      TOKEN_PROGRAM_ID
    );
    const tokenAccountInfo = await connection.getParsedAccountInfo(
      associatedTokenAccountAddress
    );

    if (tokenAccountInfo?.value) {
      const parsedAccountData = tokenAccountInfo.value.data as SPLTokenData;
      const tokenAmount = parsedAccountData.parsed.info.tokenAmount;

      const amount = tokenAmount.uiAmountString;

      setTokenBalance(amount);
    } else {
      setTokenBalance('0');
    }
  };

  const fetchAndSetTokenBalance = (
    publicKey: PublicKey,
    token: Token,
    setBalance: (value: string) => void
  ) => {
    if (token?.symbol !== 'SOL') {
      setSPLTokenBalance(publicKey, token?.mint, setBalance);
    } else {
      connection.getBalance(publicKey).then((result) => {
        setBalance((result / 1_000_000_000).toString());
      });
    }
  };

  const handleSwap = async () => {
    const toastId = toast.loading('Swapping tokens...', {
      id: 'swap-token',
      duration: Infinity,
    });
    try {
      setLoading(true);
      await quoteMutate(fetcherJupiter(quoteKey), {
        revalidate: true,
      });
      const response = await axiosJupiter.post('/swap/v1/swap', {
        userPublicKey: publicKey?.toBase58(),
        quoteResponse: quoteResult,
      });

      const result = response.data as SwapResponse;
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('finalized');
      const swapTransactionBuf = Uint8Array.from(
        Buffer.from(result.swapTransaction, 'base64')
      );
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      transaction.message.recentBlockhash = blockhash;
      if (signTransaction) {
        const signedTransaction = await signTransaction(transaction);
        const signature = await connection.sendTransaction(signedTransaction, {
          skipPreflight: false,
          preflightCommitment: 'processed',
        });
        const confirmation = await connection.confirmTransaction(
          { signature, lastValidBlockHeight, blockhash },
          'finalized'
        );
        setAmountFrom('');
        toast.success(`Successfully swapped the tokens!`, {
          id: toastId,
          duration: 4000,
        });
      }
    } catch (e) {
      toast.error(e?.toString(), { id: toastId, duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (publicKey) {
        try {
          fetchAndSetTokenBalance(publicKey, toToken, setToTokenBalance);
          fetchAndSetTokenBalance(publicKey, fromToken, setFromTokenBalance);
        } catch (e) {
          console.log(e, '<<< E');
        }
      }
    })();
  }, [fromToken, toToken, publicKey, loading]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Swap Tokens</h2>

        {/* From Token */}
        <div className="mb-4">
          <label className="text-gray-600 text-sm">From</label>
          <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3 mt-1">
            <AnimatedDropdown
              loading={loading}
              label={fromToken?.symbol || 'Select'}
              options={['SOL', 'USDT', 'USDC']}
              onSelect={(e) => {
                if (e === toToken?.symbol) {
                  const temp = toToken;
                  setToToken(fromToken);
                  setFromToken(temp);
                } else {
                  setFromToken(
                    tokens?.find((x) => x.symbol === e) ?? defaultSol
                  );
                }
              }}
              customClassName="w-[100%] md:w-[80%]"
            />
            <input
              disabled={loading}
              type="text"
              placeholder="0"
              value={amountFrom}
              onChange={(e) => {
                if (
                  e.target.value === '' ||
                  /^[0-9]*\.?[0-9]*$/.test(e.target.value)
                ) {
                  setAmountFrom(e.target.value);
                }
              }}
              className="bg-transparent w-full outline-none text-right text-lg font-medium text-gray-500"
            />
          </div>
          <p className="text-gray-600 text-sm mt-2">
            You have {fromTokenBalance} {fromToken?.symbol}
          </p>
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
            <AnimatedDropdown
              loading={loading}
              label={toToken?.symbol || 'Select'}
              options={['SOL', 'USDT', 'USDC']}
              onSelect={(e) => {
                if (e === fromToken?.symbol) {
                  const temp = fromToken;
                  setFromToken(toToken);
                  setToToken(temp);
                } else {
                  setToToken(
                    tokens?.find((x) => x.symbol === e) ?? defaultUsdt
                  );
                }
              }}
              customClassName="w-[100%] md:w-[80%]"
            />
            <input
              type="text"
              readOnly
              value={swapValue}
              placeholder="0.0"
              className="bg-transparent w-full outline-none text-right text-lg font-medium text-gray-500"
            />
          </div>
          <p className="text-gray-600 text-sm mt-2">
            You have {toTokenBalance} {toToken?.symbol}
          </p>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={
            loading || !fromToken || !toToken || !amountFrom || disableButton
          }
          className={cn(
            'w-full py-3 rounded-xl font-semibold transition-colors duration-200',
            'cursor-pointer disabled:cursor-not-allowed',
            loading || disableButton || !fromToken || !toToken || !amountFrom
              ? 'bg-gray-300 text-gray-500'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          )}
        >
          {loading
            ? 'Swapping...'
            : `Swap ${formatNumberWithCommas(amountFrom)} ${
                fromToken?.symbol
              } -> ${swapValue} ${toToken?.symbol}`}
        </button>
      </div>
    </div>
  );
}
