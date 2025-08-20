# API Reference

## Hyperliquid Client

The `HyperliquidApiClient` provides a comprehensive interface to interact with Hyperliquid's APIs.

### Import

```typescript
import { hyperliquidClient } from '@/lib/hyperliquid-client';
```

### Market Data Methods

#### `getMarketData()`

Get metadata for all available trading pairs.

```typescript
const marketData = await hyperliquidClient.getMarketData();
```

**Response:**
```typescript
interface MarketData {
  universe: Array<{
    name: string;        // Asset name (e.g., "BTC")
    szDecimals: number;  // Size decimals
  }>;
  timestamp: number;
}
```

#### `getAllMids()`

Get current mid prices for all trading pairs.

```typescript
const prices = await hyperliquidClient.getAllMids();
```

**Response:**
```typescript
Record<string, string> // { "BTC": "45000.0", "ETH": "3000.0", ... }
```

#### `getOrderBook(coin: string)`

Get order book data for a specific asset.

```typescript
const orderBook = await hyperliquidClient.getOrderBook('BTC');
```

**Parameters:**
- `coin` (string): Asset symbol (e.g., "BTC")

**Response:**
```typescript
interface OrderBook {
  coin: string;
  levels: [OrderBookLevel[], OrderBookLevel[]]; // [bids, asks]
  time: number;
}

interface OrderBookLevel {
  px: string;  // Price
  sz: string;  // Size
  n: number;   // Number of orders
}
```

#### `getMarketSummary()`

Get market summary for all assets.

```typescript
const summary = await hyperliquidClient.getMarketSummary();
```

**Response:**
```typescript
Array<{
  coin: string;
  dayNtlVlm?: string;     // 24h notional volume
  premium?: string;       // Premium
  prevDayPx?: string;     // Previous day price
  fundingRate?: string;   // Funding rate
  openInterest?: string;  // Open interest
  midPx?: string;        // Mid price
  markPx?: string;       // Mark price
}>
```

#### `getCandleSnapshot(coin, interval, startTime?, endTime?)`

Get historical candle data.

```typescript
const candles = await hyperliquidClient.getCandleSnapshot(
  'BTC', 
  '1h', 
  Date.now() - 24 * 60 * 60 * 1000,
  Date.now()
);
```

**Parameters:**
- `coin` (string): Asset symbol
- `interval` (string): Time interval ("1m", "5m", "15m", "1h", "1d")
- `startTime` (number, optional): Start timestamp
- `endTime` (number, optional): End timestamp

**Response:**
```typescript
Array<{
  T: number;   // End timestamp
  c: string;   // Close price
  h: string;   // High price
  l: string;   // Low price
  n: number;   // Number of trades
  o: string;   // Open price
  t: number;   // Start timestamp
  v: string;   // Volume
}>
```

### Account Methods

#### `getAccountState(userAddress: string)`

Get account balances and positions.

```typescript
const accountState = await hyperliquidClient.getAccountState(walletAddress);
```

**Parameters:**
- `userAddress` (string): Ethereum wallet address

**Response:**
```typescript
interface AccountState {
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
      leverage?: { type: string; value: number };
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
  time: number;
}
```

#### `getOpenOrders(userAddress: string)`

Get open orders for a user.

```typescript
const orders = await hyperliquidClient.getOpenOrders(walletAddress);
```

**Response:**
```typescript
interface OpenOrder {
  coin: string;
  limitPx: string;
  oid: number;
  origSz: string;
  reduceOnly: boolean;
  side: 'A' | 'B';  // 'A' = Ask/Sell, 'B' = Bid/Buy
  sz: string;
  timestamp: number;
  triggerCondition?: string;
  triggerPx?: string;
}
```

#### `getUserFills(userAddress: string, startTime?: number)`

Get user trade history.

```typescript
const fills = await hyperliquidClient.getUserFills(walletAddress);
```

**Response:**
```typescript
interface UserFill {
  coin: string;
  px: string;          // Fill price
  sz: string;          // Fill size
  side: 'A' | 'B';     // Side
  time: number;        // Timestamp
  startPosition?: string;
  dir?: string;        // Direction
  closedPnl?: string;  // Closed P&L
  hash?: string;       // Transaction hash
  oid?: number;        // Order ID
  crossed?: boolean;   // Crossed spread
  fee?: string;        // Fee paid
  liquidation?: boolean; // Was liquidation
}
```

### Playground Methods

#### `executeUserCode(code: string, userAddress?: string)`

Execute user-provided code in the playground.

```typescript
const result = await hyperliquidClient.executeUserCode(
  `const prices = await hyperliquidClient.getAllMids();
console.log(Object.keys(prices).length);`,
  walletAddress
);
```

**Parameters:**
- `code` (string): JavaScript code to execute
- `userAddress` (string, optional): User's wallet address for account operations

**Supported Methods in Code:**
- `getMarketData()`
- `getAllMids()`
- `getOrderBook(coin)`
- `getAccountState()` (requires wallet)
- `getUserFills()` (requires wallet)
- `getMarketSummary()`
- `getCandleSnapshot(coin, interval)`

### Rate Limiting

The client implements intelligent rate limiting:

- **Request Queue:** Automatic queuing of requests
- **Exponential Backoff:** Retry logic with increasing delays
- **Error Handling:** Comprehensive error catching

```typescript
// Rate limit configuration
interface RateLimit {
  requests: number;  // Current request count
  per: number;       // Time window (seconds)
  current: number;   // Max requests per window
  resetTime: number; // Window reset timestamp
}
```

### Error Handling

All methods can throw the following errors:

```typescript
try {
  const result = await hyperliquidClient.getMarketData();
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Handle rate limiting
  } else if (error.message.includes('network')) {
    // Handle network issues
  } else {
    // Handle other errors
  }
}
```

## WebSocket Client

Real-time data subscription management.

### Import

```typescript
import { wsClient } from '@/lib/websocket-client';
```

### Connection Management

#### `connect()`

Connect to WebSocket.

```typescript
await wsClient.connect();
```

#### `disconnect()`

Disconnect from WebSocket.

```typescript
wsClient.disconnect();
```

#### `isConnected()`

Check connection status.

```typescript
if (wsClient.isConnected()) {
  // Connected
}
```

### Subscriptions

#### `subscribe(params, callback)`

Subscribe to data feeds.

```typescript
// Subscribe to all mid prices
const priceSubscription = wsClient.subscribe(
  { type: 'allMids' },
  (prices) => {
    console.log('Price update:', prices);
  }
);

// Subscribe to specific order book
const bookSubscription = wsClient.subscribe(
  { type: 'l2Book', coin: 'BTC' },
  (orderBook) => {
    console.log('Order book update:', orderBook);
  }
);
```

**Subscription Types:**
- `allMids`: All mid prices
- `l2Book`: Order book for specific coin
- `trades`: Recent trades
- `user`: User-specific updates (requires authentication)

#### `unsubscribe(subscriptionId)`

Unsubscribe from data feed.

```typescript
wsClient.unsubscribe(subscriptionId);
```

### Event Handlers

```typescript
// Connection state changes
wsClient.onConnectionChange((connected) => {
  console.log('WebSocket:', connected ? 'connected' : 'disconnected');
});

// Error handling
wsClient.onErrorHandler((error) => {
  console.error('WebSocket error:', error);
});

// Reconnection attempts
wsClient.onReconnectHandler((attempt) => {
  console.log(`Reconnection attempt ${attempt}`);
});
```

## State Management

Zustand store with persistence.

### Import

```typescript
import { useAppStore } from '@/lib/store';
```

### Usage

```typescript
const {
  // Wallet state
  wallet,
  connectWallet,
  disconnectWallet,
  
  // User state
  user,
  setUser,
  updateProgress,
  
  // Market state
  market,
  setMarketData,
  setPrices,
  setConnectionStatus,
  
  // UI state
  ui,
  addNotification,
  removeNotification
} = useAppStore();
```

### State Structure

```typescript
interface AppStore {
  wallet: {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    chainId: number | null;
  };
  user: {
    user: User | null;
    progress: Record<string, TutorialProgress>;
    isLoading: boolean;
  };
  market: {
    data: MarketData | null;
    prices: Record<string, string>;
    isLoading: boolean;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  };
  ui: {
    notifications: Notification[];
    theme: 'light' | 'dark' | 'system';
  };
}
```

## Error Handling

The application provides comprehensive error handling.

### Error Boundary

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

<ErrorBoundary fallback={CustomErrorComponent}>
  <App />
</ErrorBoundary>
```

### Retry Wrapper

```typescript
import { RetryWrapper } from '@/components/retry-wrapper';

<RetryWrapper 
  onRetry={fetchData}
  maxRetries={3}
  error={error}
  loading={loading}
>
  <Component />
</RetryWrapper>
```

### Manual Error Handling

```typescript
import { useErrorHandler } from '@/components/error-boundary';

const { handleError } = useErrorHandler();

try {
  // API call
} catch (error) {
  handleError(error, { component: 'PlaygroundPage' });
}
```

This API reference covers all major functionality. For implementation examples, see the [USER_GUIDE.md](./USER_GUIDE.md).