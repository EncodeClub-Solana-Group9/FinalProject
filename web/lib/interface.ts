export interface Token {
  symbol: string;
  mint: string;
  decimals: number;
}

export interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: any;
  priceImpactPct: string;
  routePlan: RoutePlan[];
  contextSlot: number;
  timeTaken: number;
  swapUsdValue: string;
  simplerRouteUsed: boolean;
  mostReliableAmmsQuoteReport: MostReliableAmmsQuoteReport;
  useIncurredSlippageForQuoting: any;
  otherRoutePlans: any;
  aggregatorVersion: any;
}

export interface RoutePlan {
  swapInfo: SwapInfo;
  percent: number;
  bps: number;
}

export interface SwapInfo {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
}

export interface MostReliableAmmsQuoteReport {
  info: Info;
}

export interface Info {
  Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE: string;
  BZtgQEyS6eXUXicYPHecYQ7PybqodXQMvkjUbP4R8mUU: string;
  '32D4zRxNc1EssbJieVHfPhZM3rH6CzfUPrWUuWxD9prG': string;
}

export interface SPLTokenResponse {
  context: Context;
  value: Value;
}

export interface Context {
  apiVersion: string;
  slot: number;
}

export interface Value {
  data: SPLTokenData;
  executable: boolean;
  lamports: number;
  owner: string;
  rentEpoch: number;
  space: number;
}

export interface SPLTokenData {
  parsed: Parsed;
  program: string;
  space: number;
}

export interface Parsed {
  info: SPLTokenInfo;
  type: string;
}

export interface SPLTokenInfo {
  isNative: boolean;
  mint: string;
  owner: string;
  state: string;
  tokenAmount: TokenAmount;
}

export interface TokenAmount {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

export interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
  prioritizationType: PrioritizationType;
  simulationSlot: any;
  dynamicSlippageReport: any;
  simulationError: any;
  addressesByLookupTableAddress: any;
}

export interface PrioritizationType {
  computeBudget: ComputeBudget;
}

export interface ComputeBudget {
  microLamports: number;
  estimatedMicroLamports: number;
}
