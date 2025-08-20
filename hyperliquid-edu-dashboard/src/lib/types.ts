export interface HyperliquidConfig {
  apiUrl: string;
  wsUrl: string;
  isTestnet?: boolean;
}

export const hyperliquidConfig: HyperliquidConfig = {
  apiUrl: import.meta.env.VITE_HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz',
  wsUrl: import.meta.env.VITE_HYPERLIQUID_WS_URL || 'wss://api.hyperliquid.xyz/ws',
  isTestnet: import.meta.env.VITE_ENABLE_TESTNET_TRADING === 'true'
};

export interface MarketData {
  universe: Array<{
    name: string;
    szDecimals: number;
  }>;
  timestamp: number;
}

export interface OrderBookLevel {
  px: string;
  sz: string;
  n: number;
}

export interface OrderBook {
  coin: string;
  levels: [OrderBookLevel[], OrderBookLevel[]]; // [bids, asks]
  time: number;
}

export interface AccountState {
  marginSummary: {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    withdrawable: string;
  };
  assetPositions: Array<{
    position: {
      coin: string;
      entryPx?: string;
      leverage?: {
        type: string;
        value: number;
      };
      liquidationPx?: string;
      marginUsed?: string;
      maxLeverage?: number;
      positionValue?: string;
      returnOnEquity?: string;
      szi: string;
      unrealizedPnl?: string;
    };
    type: string;
  }>;
  crossMarginSummary?: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  crossPositions?: any[];
  time: number;
}

export interface OpenOrder {
  coin: string;
  limitPx: string;
  oid: number;
  origSz: string;
  reduceOnly: boolean;
  side: 'A' | 'B';
  sz: string;
  timestamp: number;
  triggerCondition?: string;
  triggerPx?: string;
}

export interface OrderResult {
  status: 'ok' | 'err';
  response?: {
    type: string;
    data?: {
      statuses: Array<{
        resting?: { oid: number };
        filled?: { avgPx: string; oid: number; totalSz: string };
        error?: string;
      }>;
    };
  };
  error?: string;
}

export interface UserFill {
  coin: string;
  px: string;
  sz: string;
  side: 'A' | 'B';
  time: number;
  startPosition?: string;
  dir?: string;
  closedPnl?: string;
  hash?: string;
  oid?: number;
  crossed?: boolean;
  fee?: string;
  liquidation?: boolean;
}