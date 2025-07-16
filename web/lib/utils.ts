import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Token } from './interface';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const tokens = [
  {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
  },
  {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
  },
  {
    symbol: 'USDT',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
  },
];

export const defaultSol: Token = {
  symbol: 'SOL',
  mint: 'So11111111111111111111111111111111111111112',
  decimals: 9,
};

export const defaultUsdt: Token = {
  symbol: 'USDT',
  mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  decimals: 6,
};

export function formatNumberWithCommas(
  value: string | number,
  decimals: number = 0
) {
  try {
    const num =
      typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    const result = Number(num) / Math.pow(10, decimals);
    if (isNaN(result)) return '';
    return result.toLocaleString('en-US');
  } catch (e) {
    return value;
  }
}

export function isSwapInputInvalid(
  amount: string | undefined | null,
  fromTokenBalance: number | string | undefined | null
): boolean {
  const parsedAmount = parseFloat(amount || '0');
  const parsedBalance = parseFloat(fromTokenBalance?.toString() || '0');

  const isAmountNaN = isNaN(parsedAmount);
  const isBalanceNaN = isNaN(parsedBalance);

  const isBalanceZero = parsedBalance === 0;
  const isAmountGreaterThanBalance = parsedAmount > parsedBalance;

  const isAmountZero = parsedAmount === 0;
  return (
    isAmountNaN ||
    isBalanceNaN ||
    isBalanceZero ||
    isAmountGreaterThanBalance ||
    isAmountZero
  );
}

export function formatNumberWithDecimals(amount: string, decimals: number = 0) {
  try {
    const result = parseFloat(amount) * Math.pow(10, decimals);
    if (isNaN(result)) return '';
    return result;
  } catch (e) {
    return amount;
  }
}
