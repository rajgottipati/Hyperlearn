# Hyperliquid Educational Dashboard

A comprehensive educational platform for learning Hyperliquid API development with interactive tutorials, live API playground, and real-time market data integration.

## Features

- **Interactive Tutorials** - Step-by-step guides with executable code examples
- **Live API Playground** - Test Hyperliquid APIs with real-time execution
- **Real-time Market Data** - WebSocket integration for live price feeds
- **Wallet Integration** - MetaMask and WalletConnect support
- **Progress Tracking** - User progress saved with gamification elements
- **Production Ready** - Comprehensive error handling and performance optimization

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd hyperliquid-edu-dashboard

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Supabase credentials to .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── loading-skeletons.tsx
│   ├── error-boundary.tsx
│   └── market-data-provider.tsx
├── pages/               # Application pages
│   ├── home.tsx
│   ├── tutorials.tsx
│   ├── tutorial.tsx
│   └── playground.tsx
├── lib/                 # Core utilities
│   ├── hyperliquid-client.ts
│   ├── websocket-client.ts
│   ├── wallet.ts
│   ├── store.ts
│   └── supabase.ts
└── hooks/               # Custom React hooks
    └── use-mobile.tsx
```

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS, shadcn/ui
- **State Management:** Zustand with persistence
- **Database:** Supabase (PostgreSQL)
- **Wallet Integration:** wagmi, ethers.js
- **Code Editor:** Monaco Editor
- **API Integration:** Hyperliquid REST & WebSocket APIs

## Key Components

### Hyperliquid API Client

```typescript
import { hyperliquidClient } from '@/lib/hyperliquid-client';

// Get market data
const marketData = await hyperliquidClient.getMarketData();

// Get live prices
const prices = await hyperliquidClient.getAllMids();

// Get order book
const orderBook = await hyperliquidClient.getOrderBook('BTC');
```

### WebSocket Client

```typescript
import { wsClient } from '@/lib/websocket-client';

// Connect and subscribe to price updates
await wsClient.connect();
const subscriptionId = wsClient.subscribe(
  { type: 'allMids' },
  (prices) => console.log('Price update:', prices)
);
```

### State Management

```typescript
import { useAppStore } from '@/lib/store';

const { wallet, user, market } = useAppStore();
```

## API Integration

The dashboard integrates with Hyperliquid's APIs:

- **REST API:** Market data, account information, trading operations
- **WebSocket API:** Real-time price feeds, order book updates
- **Rate Limiting:** Intelligent request queuing and retry logic
- **Error Handling:** Comprehensive error catching and user feedback

## Database Schema

Supabase tables:

- **users:** User profiles and wallet addresses
- **tutorial_progress:** Track tutorial completion and XP
- **user_sessions:** Session management
- **api_usage_logs:** API usage analytics
- **achievements:** Gamification system

## Environment Variables

```env
# Hyperliquid API
VITE_HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
VITE_HYPERLIQUID_WS_URL=wss://api.hyperliquid.xyz/ws

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_ENABLE_TESTNET_TRADING=false
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
- **Netlify:** Connect repository, set environment variables
- **Vercel:** Import project, configure environment
- **Manual:** Build and upload `dist/` folder

## Testing

The application includes:

- **Error Boundaries:** Catch and display errors gracefully
- **Loading States:** Skeleton loaders for better UX
- **Retry Logic:** Automatic retry for failed API calls
- **Performance Monitoring:** Track API response times

## Performance

- **Code Splitting:** Lazy loading for optimal bundle sizes
- **Caching:** Intelligent caching for API responses
- **WebSocket Management:** Efficient connection handling
- **Skeleton Loading:** Smooth loading experiences

## Security

- **Wallet Security:** No private keys stored, secure wallet connections
- **API Security:** Rate limiting, request validation
- **CSP Headers:** Content Security Policy for XSS protection
- **HTTPS Only:** Secure connections enforced

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- **Documentation:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **User Guide:** [USER_GUIDE.md](./USER_GUIDE.md)
- **Issues:** GitHub Issues for bug reports
- **Discussions:** GitHub Discussions for questions