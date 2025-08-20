# Architecture Overview

## System Architecture

The Hyperliquid Educational Dashboard is built as a modern single-page application (SPA) with a focus on performance, scalability, and developer experience.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   External APIs   │    │   Database      │
│   (React SPA)   │◄──►│   Hyperliquid     │    │   Supabase      │
│                 │    │   WebSocket/REST  │    │   PostgreSQL    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Deployment    │    │   Rate Limiting   │    │   User Data     │
│   Netlify/      │    │   Error Handling  │    │   Progress      │
│   Vercel        │    │   Reconnection    │    │   Sessions      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App (ErrorBoundary)
├── WalletConnectionProvider
│   └── MarketDataProvider
│       └── Layout
│           ├── Navigation
│           └── Pages
│               ├── HomePage
│               ├── TutorialsPage
│               ├── TutorialPage
│               ├── PlaygroundPage
│               ├── ApiReferencePage
│               └── SettingsPage
└── Toaster (Global notifications)
```

### Data Flow

```
┌─────────────────┐
│   User Action   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Component     │
│   Event Handler │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Store Update  │
│   (Zustand)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   API Call      │
│   (Client)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   State Update  │
│   Re-render     │
└─────────────────┘
```

## API Integration Layer

### Hyperliquid Client Architecture

```typescript
class HyperliquidApiClient {
  private rateLimit: RateLimit;
  private requestQueue: RequestQueue;
  
  // Core methods
  async makeRequest<T>(endpoint: string, body?: any): Promise<T>
  
  // Market data
  async getMarketData(): Promise<MarketData>
  async getAllMids(): Promise<Record<string, string>>
  async getOrderBook(coin: string): Promise<OrderBook>
  
  // Account data
  async getAccountState(address: string): Promise<AccountState>
  async getUserFills(address: string): Promise<UserFill[]>
  
  // Playground execution
  async executeUserCode(code: string, address?: string): Promise<any>
}
```

### WebSocket Client Architecture

```typescript
class HyperliquidWebSocketClient {
  private ws: WebSocket | null;
  private subscriptions: Map<string, Subscription>;
  private reconnectAttempts: number;
  
  // Connection management
  async connect(): Promise<void>
  disconnect(): void
  
  // Subscription management
  subscribe(params: SubscriptionParams, callback: Function): string
  unsubscribe(id: string): void
  
  // Event handling
  private handleMessage(message: any): void
  private reconnect(): void
}
```

### Rate Limiting Strategy

```typescript
interface RateLimit {
  requests: number;     // Current request count
  per: number;          // Time window (seconds)
  current: number;      // Max requests per window
  resetTime: number;    // Window reset timestamp
}

// Rate limiting flow
1. Check current rate limit status
2. Queue request if limit exceeded
3. Execute request when limit allows
4. Update rate limit counters
5. Handle rate limit errors with exponential backoff
```

## State Management

### Zustand Store Structure

```typescript
interface AppStore {
  // Wallet management
  wallet: WalletState;
  connectWallet(address: string, chainId: number): void;
  disconnectWallet(): void;
  
  // User data
  user: UserState;
  setUser(user: User): void;
  updateProgress(tutorialId: string, progress: TutorialProgress): void;
  
  // Market data
  market: MarketState;
  setMarketData(data: MarketData): void;
  setPrices(prices: Record<string, string>): void;
  setConnectionStatus(status: ConnectionStatus): void;
  
  // UI state
  ui: UIState;
  addNotification(notification: Notification): void;
  setSidebarOpen(open: boolean): void;
}
```

### State Persistence

```typescript
// Zustand persistence middleware
export const useAppStore = create<AppStore>()(persist(
  (set, get) => ({
    // Store implementation
  }),
  {
    name: 'hyperliquid-edu-storage',
    partialize: (state) => ({
      wallet: state.wallet,
      user: state.user,
      ui: { theme: state.ui.theme }
    })
  }
));
```

## Database Architecture

### Supabase Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutorial progress
CREATE TABLE tutorial_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tutorial_id TEXT NOT NULL,
  completed_steps TEXT[] DEFAULT '{}',
  current_step INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  pages_visited TEXT[],
  apis_used TEXT[],
  total_time INTEGER,
  device_info JSONB
);

-- API usage logs
CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS (Row Level Security) Policies

```sql
-- Users can read/update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = wallet_address OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = wallet_address OR auth.uid() = id);

-- Tutorial progress policies
CREATE POLICY "Users can view own progress" ON tutorial_progress
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE auth.uid()::text = wallet_address
  ));

CREATE POLICY "Users can insert own progress" ON tutorial_progress
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth.uid()::text = wallet_address
  ));
```

## Security Architecture

### Authentication Flow

```
1. User connects wallet (MetaMask)
2. Sign authentication message
3. Verify signature on client
4. Create/update user in Supabase
5. Set session for database access
```

### API Security

```typescript
// Request validation
interface ApiRequest {
  endpoint: string;
  body?: any;
  headers: {
    'Content-Type': 'application/json';
    'User-Agent': string;
  };
}

// Rate limiting per user/IP
class RateLimiter {
  private limits: Map<string, RateLimit>;
  
  isAllowed(identifier: string): boolean;
  recordRequest(identifier: string): void;
}
```

### Content Security Policy

```typescript
const CSP = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https:",
  'connect-src': [
    "'self'",
    'https://api.hyperliquid.xyz',
    'wss://api.hyperliquid.xyz',
    'https://*.supabase.co',
    'wss://*.supabase.co'
  ].join(' ')
};
```

## Error Handling Architecture

### Error Boundary Hierarchy

```
App Level Error Boundary
├── Route Level Error Boundaries
│   ├── Page Level Error Boundaries
│   └── Component Level Error Boundaries
└── Async Error Handling
    ├── API Error Handling
    ├── WebSocket Error Handling
    └── Database Error Handling
```

### Error Types

```typescript
interface AppError {
  type: 'network' | 'api' | 'validation' | 'auth' | 'unknown';
  message: string;
  code?: string;
  retryable: boolean;
  context?: Record<string, any>;
}

class ErrorHandler {
  static handle(error: AppError): void {
    // Log error
    console.error(error);
    
    // Report to monitoring service
    if (import.meta.env.PROD) {
      this.reportError(error);
    }
    
    // Show user feedback
    this.showUserNotification(error);
    
    // Attempt recovery if possible
    if (error.retryable) {
      this.attemptRetry(error);
    }
  }
}
```

## Performance Architecture

### Code Splitting Strategy

```typescript
// Route-based code splitting
const HomePage = lazy(() => import('@/pages/home'));
const TutorialsPage = lazy(() => import('@/pages/tutorials'));
const PlaygroundPage = lazy(() => import('@/pages/playground'));

// Component-based code splitting
const MonacoEditor = lazy(() => import('@monaco-editor/react'));
```

### Caching Strategy

```typescript
interface CacheStrategy {
  // API response caching
  apiCache: {
    marketData: { ttl: 60000 }; // 1 minute
    prices: { ttl: 5000 };      // 5 seconds
    userProfile: { ttl: 300000 }; // 5 minutes
  };
  
  // Asset caching
  assetCache: {
    images: 'max-age=31536000'; // 1 year
    scripts: 'max-age=31536000'; // 1 year
    styles: 'max-age=31536000';  // 1 year
  };
}
```

### Bundle Analysis

```typescript
// Webpack bundle analyzer results
const bundleAnalysis = {
  mainBundle: {
    size: '~500KB gzipped',
    components: ['React', 'Router', 'Store', 'UI Library']
  },
  vendorBundle: {
    size: '~300KB gzipped', 
    components: ['Monaco Editor', 'Chart Library', 'Wallet SDKs']
  },
  asyncChunks: {
    playground: '~200KB',
    tutorials: '~150KB',
    settings: '~100KB'
  }
};
```

## Deployment Architecture

### Build Process

```typescript
// Vite build configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          editor: ['@monaco-editor/react'],
          wallet: ['wagmi', 'ethers']
        }
      }
    },
    minify: 'terser',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@monaco-editor/react']
  }
});
```

### CDN Strategy

```
┌─────────────────┐    ┌──────────────────┐
│   Static Assets │    │   Dynamic Content│
│   (CDN Cached)  │    │   (Origin Server)│
├─────────────────┤    ├──────────────────┤
│   Images        │    │   API Responses  │
│   Fonts         │    │   User Data      │
│   CSS           │    │   WebSocket      │
│   JavaScript    │    │   Database       │
└─────────────────┘    └──────────────────┘
```

### Monitoring & Analytics

```typescript
interface MonitoringSetup {
  performance: {
    webVitals: ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'];
    apiMetrics: ['response_time', 'error_rate', 'throughput'];
    userMetrics: ['session_duration', 'page_views', 'bounce_rate'];
  };
  
  errorTracking: {
    clientErrors: 'Error Boundaries + Console';
    networkErrors: 'Fetch Interceptors';
    performanceIssues: 'Performance Observer';
  };
  
  businessMetrics: {
    tutorialCompletion: 'Supabase Analytics';
    apiUsage: 'Custom Logging';
    userEngagement: 'Session Tracking';
  };
}
```

This architecture provides a scalable, maintainable, and performant foundation for the Hyperliquid Educational Dashboard.