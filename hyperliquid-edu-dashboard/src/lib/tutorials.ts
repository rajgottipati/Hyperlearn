export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  code?: string;
  language?: string;
  expectedOutput?: string;
  hints?: string[];
  xpReward: number;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  steps: TutorialStep[];
  prerequisites?: string[];
  tags: string[];
}

export const tutorials: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Hyperliquid API',
    description: 'Learn the basics of connecting to Hyperliquid API and fetching live market data.',
    category: 'API Fundamentals',
    difficulty: 'Beginner',
    duration: '15 min',
    steps: [
      {
        id: 'step-1',
        title: 'Understanding Hyperliquid API',
        content: `Welcome to Hyperliquid development! Hyperliquid is a high-performance decentralized exchange built on a custom blockchain optimized for trading.

The Hyperliquid API provides two main endpoints:
- **POST /info**: For retrieving market data, account information, and historical data
- **POST /exchange**: For trading operations (requires authentication)

All API calls use POST requests with JSON payloads. The API is rate-limited to ensure fair usage and system stability.

In this tutorial, we'll start by connecting to the live API and fetching real market data.`,
        xpReward: 10
      },
      {
        id: 'step-2',
        title: 'Fetching Market Metadata',
        content: `Let's start by fetching the market metadata to see all available trading pairs. This endpoint returns information about all assets available for trading.

The request uses type: 'meta' to get universe data which includes all trading pairs and their decimal precision.`,
        code: `import { hyperliquidClient } from '@/lib/hyperliquid-client';

// Fetch live market data
const marketData = await hyperliquidClient.getMarketData();

console.log('Available Assets:');
marketData.universe.forEach(asset => {
  console.log(\`- \${asset.name} (\${asset.szDecimals} decimals)\`);
});

console.log(\`Total assets: \${marketData.universe.length}\`);
console.log(\`Data timestamp: \${new Date(marketData.timestamp)}\`);`,
        language: 'javascript',
        expectedOutput: `Available Assets:
- BTC (5 decimals)
- ETH (4 decimals)
- SOL (3 decimals)
...
Total assets: 50+
Data timestamp: [current timestamp]`,
        hints: [
          'This is a real API call to Hyperliquid production servers',
          'The data shows all currently tradeable assets',
          'szDecimals indicates the precision for order sizes'
        ],
        xpReward: 20
      },
      {
        id: 'step-3',
        title: 'Getting Live Price Data',
        content: `Now let's fetch live price data for all assets. The 'allMids' endpoint returns the current mid price for every tradeable asset.

This data updates in real-time and reflects the current market state.`,
        code: `// Fetch all current mid prices
const prices = await hyperliquidClient.getAllMids();

console.log('Live Prices:');
Object.entries(prices).slice(0, 10).forEach(([coin, price]) => {
  console.log(\`\${coin}: $\${parseFloat(price).toLocaleString()}\`);
});

console.log(\`\nTotal markets: \${Object.keys(prices).length}\`);`,
        language: 'javascript',
        expectedOutput: `Live Prices:
BTC: $43,250
ETH: $2,680
SOL: $98.50
AVAX: $35.20
...
Total markets: 50+`,
        hints: [
          'Prices are returned as strings to maintain precision',
          'Use parseFloat() to convert to numbers for calculations',
          'These are live mid prices from the order book'
        ],
        xpReward: 25
      },
      {
        id: 'step-4',
        title: 'Understanding Order Books',
        content: `Let's examine a real order book for Bitcoin. The order book shows all current buy (bid) and sell (ask) orders, giving you insight into market depth and liquidity.

This data is essential for understanding market conditions and making informed trading decisions.`,
        code: `// Get BTC order book
const orderBook = await hyperliquidClient.getOrderBook('BTC');

console.log(\`Order Book for \${orderBook.coin}:\`);
console.log('\nTop 5 Bids (Buy Orders):');
orderBook.levels[0].slice(0, 5).forEach(bid => {
  console.log(\`Price: $\${bid.px} | Size: \${bid.sz} | Orders: \${bid.n}\`);
});

console.log('\nTop 5 Asks (Sell Orders):');
orderBook.levels[1].slice(0, 5).forEach(ask => {
  console.log(\`Price: $\${ask.px} | Size: \${ask.sz} | Orders: \${ask.n}\`);
});

// Calculate spread
const bestBid = parseFloat(orderBook.levels[0][0]?.px || '0');
const bestAsk = parseFloat(orderBook.levels[1][0]?.px || '0');
const spread = bestAsk - bestBid;
const spreadPercent = (spread / bestBid) * 100;

console.log(\`\nSpread: $\${spread.toFixed(2)} (\${spreadPercent.toFixed(4)}%)\`);`,
        language: 'javascript',
        expectedOutput: `Order Book for BTC:

Top 5 Bids (Buy Orders):
Price: $43,249.50 | Size: 0.2 | Orders: 1
Price: $43,249.00 | Size: 0.5 | Orders: 2
...

Top 5 Asks (Sell Orders):
Price: $43,250.50 | Size: 0.3 | Orders: 1
Price: $43,251.00 | Size: 0.8 | Orders: 3
...

Spread: $1.00 (0.0023%)`,
        hints: [
          'levels[0] contains bids (buy orders), levels[1] contains asks (sell orders)',
          'Orders are sorted by price - best bid is highest, best ask is lowest',
          'The spread represents the difference between best bid and ask'
        ],
        xpReward: 30
      },
      {
        id: 'step-5',
        title: 'API Health Monitoring',
        content: `Finally, let's implement a health check system to monitor API connectivity and performance. This is crucial for production applications to ensure reliable data feeds.

Monitoring helps you detect and handle API issues gracefully.`,
        code: `// Check API health
const health = await hyperliquidClient.healthCheck();

console.log('API Health Status:');
console.log(\`Status: \${health.status}\`);
console.log(\`Response Time: \${health.responseTime}ms\`);
console.log(\`Timestamp: \${new Date(health.timestamp)}\`);

if (health.status === 'ok') {
  console.log('✅ API is healthy and responsive');
  
  if (health.responseTime < 1000) {
    console.log('⚡ Excellent response time');
  } else if (health.responseTime < 3000) {
    console.log('⏳ Acceptable response time');
  } else {
    console.log('🐌 Slow response time - consider caching');
  }
} else {
  console.log('❌ API health check failed');
  console.log('Implement fallback strategies or retry logic');
}`,
        language: 'javascript',
        expectedOutput: `API Health Status:
Status: ok
Response Time: 250ms
Timestamp: [current timestamp]
✅ API is healthy and responsive
⚡ Excellent response time`,
        hints: [
          'Health checks should be performed regularly',
          'Monitor response times to detect performance issues',
          'Implement retry logic and fallbacks for production apps'
        ],
        xpReward: 25
      }
    ],
    tags: ['API', 'Basics', 'Market Data', 'Real-time']
  },
  
  {
    id: 'websocket-feeds',
    title: 'Real-Time WebSocket Data Feeds',
    description: 'Connect to live WebSocket feeds for real-time market data, order book updates, and trade streams.',
    category: 'Real-time Data',
    difficulty: 'Intermediate',
    duration: '20 min',
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'ws-step-1',
        title: 'WebSocket Connection Setup',
        content: `WebSocket connections provide real-time data streaming from Hyperliquid. This is essential for applications that need live market data, order book updates, or account notifications.

The WebSocket client handles connection management, reconnection logic, and subscription management automatically.`,
        code: `import { wsClient } from '@/lib/websocket-client';

// Set up connection handlers
wsClient.onConnectionChange((connected) => {
  console.log(\`WebSocket \${connected ? 'connected' : 'disconnected'}\`);
});

wsClient.onErrorHandler((error) => {
  console.error('WebSocket error:', error.message);
});

wsClient.onReconnectHandler((attempt) => {
  console.log(\`Reconnection attempt \${attempt}\`);
});

// Connect to WebSocket
try {
  await wsClient.connect();
  console.log('✅ WebSocket connected successfully!');
} catch (error) {
  console.error('❌ WebSocket connection failed:', error.message);
}`,
        language: 'javascript',
        expectedOutput: `WebSocket connected
✅ WebSocket connected successfully!`,
        hints: [
          'The client automatically handles reconnection on connection loss',
          'Always set up error handlers before connecting',
          'Connection state is managed automatically'
        ],
        xpReward: 15
      },
      {
        id: 'ws-step-2',
        title: 'Live Price Subscriptions',
        content: `Subscribe to live price updates for all assets. This provides real-time mid price updates as market conditions change.

The 'allMids' subscription delivers price updates for all trading pairs in real-time.`,
        code: `// Subscribe to all mid prices
const priceSubscription = wsClient.subscribe(
  { type: 'allMids' },
  (data) => {
    console.log('Price Update Received:');
    
    // Show first 5 price updates
    const prices = Object.entries(data).slice(0, 5);
    prices.forEach(([coin, price]) => {
      console.log(\`  \${coin}: $\${parseFloat(price).toLocaleString()}\`);
    });
    
    console.log(\`  ... and \${Object.keys(data).length - 5} more assets\`);
    console.log(\`  Update time: \${new Date().toLocaleTimeString()}\`);
  }
);

console.log(\`Subscribed to live prices: \${priceSubscription}\`);

// The callback will be called whenever prices update
console.log('🔄 Waiting for live price updates...');`,
        language: 'javascript',
        expectedOutput: `Subscribed to live prices: allMids-1640995200000
🔄 Waiting for live price updates...
Price Update Received:
  BTC: $43,251.50
  ETH: $2,681.25
  SOL: $98.75
  ... and 47 more assets
  Update time: 3:45:12 PM`,
        hints: [
          'Price updates arrive in real-time as market moves',
          'Store the subscription ID to unsubscribe later',
          'Updates typically arrive every few seconds during active trading'
        ],
        xpReward: 25
      },
      {
        id: 'ws-step-3',
        title: 'Order Book Streaming',
        content: `Stream live order book updates for a specific asset. This shows real-time changes to bids and asks, providing deep market insight.

Order book streams are essential for building trading algorithms and market analysis tools.`,
        code: `// Subscribe to BTC order book updates
const orderbookSubscription = wsClient.subscribe(
  { type: 'l2Book', coin: 'BTC' },
  (data) => {
    console.log(\`Order Book Update for \${data.coin}:\`);
    
    const bids = data.levels[0];
    const asks = data.levels[1];
    
    console.log('Top 3 Bids:');
    bids.slice(0, 3).forEach((bid, i) => {
      console.log(\`  \${i + 1}. $\${bid.px} x \${bid.sz} (\${bid.n} orders)\`);
    });
    
    console.log('Top 3 Asks:');
    asks.slice(0, 3).forEach((ask, i) => {
      console.log(\`  \${i + 1}. $\${ask.px} x \${ask.sz} (\${ask.n} orders)\`);
    });
    
    // Calculate and show spread
    const spread = parseFloat(asks[0].px) - parseFloat(bids[0].px);
    console.log(\`  Spread: $\${spread.toFixed(2)}\`);
    console.log(\`  Update time: \${new Date().toLocaleTimeString()}\`);
    console.log('---');
  }
);

console.log(\`Subscribed to BTC order book: \${orderbookSubscription}\`);
console.log('📊 Streaming live order book data...');`,
        language: 'javascript',
        expectedOutput: `Subscribed to BTC order book: l2Book-BTC-1640995200001
📊 Streaming live order book data...
Order Book Update for BTC:
Top 3 Bids:
  1. $43,249.50 x 0.25 (1 orders)
  2. $43,249.00 x 0.50 (2 orders)
  3. $43,248.50 x 1.20 (3 orders)
Top 3 Asks:
  1. $43,250.50 x 0.30 (1 orders)
  2. $43,251.00 x 0.75 (2 orders)
  3. $43,251.50 x 2.10 (4 orders)
  Spread: $1.00
  Update time: 3:45:15 PM
---`,
        hints: [
          'Order book updates show real-time changes to market depth',
          'levels[0] = bids (buys), levels[1] = asks (sells)',
          'Monitor spread changes to understand market liquidity'
        ],
        xpReward: 35
      },
      {
        id: 'ws-step-4',
        title: 'Trade Stream Monitoring',
        content: `Subscribe to live trade execution data to see real-time trading activity. This provides insights into market momentum and trading patterns.

Trade streams show actual executed transactions with price, size, and direction.`,
        code: `// Subscribe to BTC trade stream
let tradeCount = 0;
let totalVolume = 0;

const tradeSubscription = wsClient.subscribe(
  { type: 'trades', coin: 'BTC' },
  (trades) => {
    trades.forEach(trade => {
      tradeCount++;
      const volume = parseFloat(trade.sz);
      totalVolume += volume;
      
      const side = trade.side === 'A' ? '🔴 SELL' : '🟢 BUY';
      const price = parseFloat(trade.px).toLocaleString();
      const size = volume.toFixed(5);
      const time = new Date(trade.time).toLocaleTimeString();
      
      console.log(\`\${side} \${size} BTC @ $\${price} (\${time})\`);
    });
    
    console.log(\`Total trades: \${tradeCount}, Volume: \${totalVolume.toFixed(2)} BTC\`);
    console.log('---');
  }
);

console.log(\`Subscribed to BTC trades: \${tradeSubscription}\`);
console.log('💹 Monitoring live trade executions...');`,
        language: 'javascript',
        expectedOutput: `Subscribed to BTC trades: trades-BTC-1640995200002
💹 Monitoring live trade executions...
🟢 BUY 0.15000 BTC @ $43,250 (3:45:18 PM)
🔴 SELL 0.25000 BTC @ $43,249 (3:45:19 PM)
🟢 BUY 0.05000 BTC @ $43,251 (3:45:20 PM)
Total trades: 3, Volume: 0.45 BTC
---`,
        hints: [
          'Trade streams show actual market activity',
          'Side A = Ask (sell), Side B = Bid (buy)',
          'Volume aggregation helps track market activity levels'
        ],
        xpReward: 30
      },
      {
        id: 'ws-step-5',
        title: 'Subscription Management',
        content: `Learn how to properly manage subscriptions, handle cleanup, and optimize data usage. This is crucial for production applications to prevent memory leaks and excessive data usage.`,
        code: `// Demonstrate subscription management
console.log('Active subscriptions:', {
  prices: priceSubscription,
  orderbook: orderbookSubscription,
  trades: tradeSubscription
});

// Unsubscribe from specific feeds
wsClient.unsubscribe(tradeSubscription);
console.log('🔇 Unsubscribed from trade stream');

// Check connection status
console.log(\`Connection status: \${wsClient.isConnected() ? 'Connected' : 'Disconnected'}\`);

// Cleanup function for component unmount
const cleanup = () => {
  wsClient.unsubscribe(priceSubscription);
  wsClient.unsubscribe(orderbookSubscription);
  // Note: Don't disconnect if other components need the connection
  console.log('🧹 Cleaned up subscriptions');
};

// In a real React component, you'd call cleanup in useEffect cleanup
console.log('✅ Subscription management implemented');
console.log('Use cleanup() when component unmounts');`,
        language: 'javascript',
        expectedOutput: `Active subscriptions: {
  prices: "allMids-1640995200000",
  orderbook: "l2Book-BTC-1640995200001", 
  trades: "trades-BTC-1640995200002"
}
🔇 Unsubscribed from trade stream
Connection status: Connected
✅ Subscription management implemented
Use cleanup() when component unmounts`,
        hints: [
          'Always clean up subscriptions to prevent memory leaks',
          'Keep track of subscription IDs for later unsubscribe',
          'Consider connection sharing across components'
        ],
        xpReward: 20
      }
    ],
    tags: ['WebSocket', 'Real-time', 'Streams', 'Advanced']
  },
  
  {
    id: 'wallet-integration',
    title: 'Wallet Connection & Authentication',
    description: 'Implement MetaMask wallet connection, user authentication, and signature-based authorization.',
    category: 'Wallet Integration',
    difficulty: 'Intermediate', 
    duration: '25 min',
    steps: [
      {
        id: 'wallet-step-1',
        title: 'Setting Up Wallet Connection',
        content: `Wallet integration is essential for user authentication and transaction signing in Hyperliquid applications. We'll use wagmi for robust wallet connection management.

This tutorial covers MetaMask integration, address validation, and connection state management.`,
        code: `import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { formatAddress, isValidAddress } from '@/lib/wallet';

// Component setup
function WalletConnection() {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    // Find MetaMask connector
    const metamaskConnector = connectors.find(c => c.id === 'metaMask');
    
    if (metamaskConnector) {
      connect({ connector: metamaskConnector });
      console.log('🦊 Connecting to MetaMask...');
    } else {
      console.error('❌ MetaMask not found');
    }
  };

  if (isConnected && address) {
    console.log(\`✅ Connected: \${formatAddress(address)}\`);
    console.log(\`Full address: \${address}\`);
    console.log(\`Valid address: \${isValidAddress(address)}\`);
    
    return {
      connected: true,
      address,
      formattedAddress: formatAddress(address),
      disconnect
    };
  }

  return {
    connected: false,
    connect: handleConnect
  };
}

// Usage example
const wallet = WalletConnection();
console.log('Wallet state:', wallet);`,
        language: 'javascript',
        expectedOutput: `🦊 Connecting to MetaMask...
✅ Connected: 0x1234...5678
Full address: 0x1234567890abcdef1234567890abcdef12345678
Valid address: true
Wallet state: { connected: true, address: "0x1234...", ... }`,
        hints: [
          'Always check if MetaMask is installed before connecting',
          'Handle connection errors gracefully',
          'Store wallet state in global state management'
        ],
        xpReward: 20
      },
      {
        id: 'wallet-step-2',
        title: 'User Authentication with Signatures',
        content: `Implement signature-based authentication for user verification. This creates a secure login system without requiring passwords or personal information.

Signatures prove wallet ownership without exposing private keys.`,
        code: `import { useSignMessage } from 'wagmi';
import { createAuthMessage, generateNonce } from '@/lib/wallet';
import { createOrUpdateUser } from '@/lib/supabase';

async function authenticateUser(address, signMessage) {
  try {
    // Generate authentication message
    const nonce = generateNonce();
    const message = createAuthMessage(address, nonce);
    
    console.log('Authentication message:');
    console.log(message);
    console.log('\n🖊️ Please sign the message in MetaMask...');
    
    // Request signature
    const signature = await signMessage({ message });
    console.log(\`✅ Signature received: \${signature.slice(0, 20)}...\`);
    
    // Create or update user in database
    const user = await createOrUpdateUser(address);
    
    if (user) {
      console.log(\`👤 User authenticated: \${user.username}\`);
      console.log(\`📊 Level: \${user.level}, XP: \${user.xp_points}\`);
      
      return {
        success: true,
        user,
        signature,
        sessionToken: \`session_\${nonce}_\${Date.now()}\`
      };
    } else {
      throw new Error('Failed to create user profile');
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Usage example
const address = '0x1234567890abcdef1234567890abcdef12345678';
const result = await authenticateUser(address, signMessage);
console.log('Auth result:', result);`,
        language: 'javascript',
        expectedOutput: `Authentication message:
Sign this message to authenticate with Hyperliquid Educational Dashboard.

Wallet: 0x1234567890abcdef1234567890abcdef12345678
Timestamp: 1640995200

This signature is only used for authentication and will not authorize any transactions.

🖊️ Please sign the message in MetaMask...
✅ Signature received: 0x1234567890abcdef...
👤 User authenticated: User-12345678
📊 Level: 1, XP: 0
Auth result: { success: true, user: {...}, ... }`,
        hints: [
          'Never request transaction permissions for authentication',
          'Include timestamp to prevent replay attacks',
          'Store user session securely after authentication'
        ],
        xpReward: 30
      }
    ],
    tags: ['Wallet', 'Authentication', 'MetaMask', 'Security']
  },
  
  {
    id: 'account-data',
    title: 'Reading Account Data',
    description: 'Learn to fetch and display user account information, balances, positions, and trading history.',
    category: 'Account Management',
    difficulty: 'Beginner',
    duration: '18 min',
    prerequisites: ['getting-started', 'wallet-integration'],
    steps: [
      {
        id: 'account-step-1',
        title: 'Fetching Account State',
        content: `Account state provides a complete overview of a user's portfolio including balances, positions, margin usage, and P&L. This is essential for building trading interfaces and portfolio dashboards.`,
        code: `import { hyperliquidClient } from '@/lib/hyperliquid-client';

async function getAccountOverview(userAddress) {
  try {
    console.log(\`📊 Fetching account data for \${userAddress.slice(0, 8)}...\`);
    
    const accountState = await hyperliquidClient.getAccountState(userAddress);
    
    console.log('Account Summary:');
    console.log(\`  💰 Account Value: $\${parseFloat(accountState.marginSummary.accountValue).toLocaleString()}\`);
    console.log(\`  💵 Withdrawable: $\${parseFloat(accountState.marginSummary.withdrawable).toLocaleString()}\`);
    console.log(\`  📈 Total Position Value: $\${parseFloat(accountState.marginSummary.totalNtlPos).toLocaleString()}\`);
    
    console.log(\`\n📍 Active Positions: \${accountState.assetPositions.length}\`);
    
    accountState.assetPositions.forEach((pos, index) => {
      const position = pos.position;
      const pnl = position.unrealizedPnl ? parseFloat(position.unrealizedPnl) : 0;
      const pnlColor = pnl >= 0 ? '🟢' : '🔴';
      
      console.log(\`  \${index + 1}. \${position.coin}:\`);
      console.log(\`     Size: \${position.szi}\`);
      console.log(\`     Entry: $\${position.entryPx || 'N/A'}\`);
      console.log(\`     Value: $\${position.positionValue || '0'}\`);
      console.log(\`     PnL: \${pnlColor} $\${pnl.toFixed(2)}\`);
    });
    
    return accountState;
    
  } catch (error) {
    console.error('❌ Failed to fetch account data:', error.message);
    throw error;
  }
}

// Example usage
const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
const account = await getAccountOverview(userAddress);`,
        language: 'javascript',
        expectedOutput: `📊 Fetching account data for 0x123456...
Account Summary:
  💰 Account Value: $15,420.50
  💵 Withdrawable: $6,670.25
  📈 Total Position Value: $8,750.25

📍 Active Positions: 3
  1. BTC:
     Size: 0.2
     Entry: $42000
     Value: $8400.00
     PnL: 🟢 $400.00
  2. ETH:
     Size: -1.5
     Entry: $2700
     Value: $4050.00
     PnL: 🔴 -$75.50`,
        hints: [
          'Negative position size indicates short positions',
          'Unrealized PnL shows current profit/loss',
          'Withdrawable amount considers margin requirements'
        ],
        xpReward: 25
      }
    ],
    tags: ['Account', 'Portfolio', 'Balances', 'Positions']
  }
];

// Utility functions
export const getTutorialById = (id: string): Tutorial | undefined => {
  return tutorials.find(tutorial => tutorial.id === id);
};

export const getTutorialsByCategory = (category: string): Tutorial[] => {
  return tutorials.filter(tutorial => tutorial.category === category);
};

export const getTutorialsByDifficulty = (difficulty: string): Tutorial[] => {
  return tutorials.filter(tutorial => tutorial.difficulty === difficulty);
};

export const getCategories = (): string[] => {
  return [...new Set(tutorials.map(tutorial => tutorial.category))];
};

export const getDifficulties = (): string[] => {
  return ['Beginner', 'Intermediate', 'Advanced'];
};

export const searchTutorials = (query: string): Tutorial[] => {
  const lowercaseQuery = query.toLowerCase();
  return tutorials.filter(tutorial => 
    tutorial.title.toLowerCase().includes(lowercaseQuery) ||
    tutorial.description.toLowerCase().includes(lowercaseQuery) ||
    tutorial.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};