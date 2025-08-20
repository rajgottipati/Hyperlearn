import { hyperliquidConfig, type MarketData, type OrderBook, type AccountState, type OpenOrder, type OrderResult, type UserFill } from './types';

/**
 * Rate limiting configuration
 */
interface RateLimit {
  requests: number;
  per: number; // seconds
  current: number;
  resetTime: number;
}

class HyperliquidApiClient {
  private baseUrl: string;
  private rateLimit: RateLimit;
  private requestQueue: Array<{ resolve: Function; reject: Function; request: () => Promise<any> }>;
  private isProcessingQueue: boolean = false;

  constructor() {
    this.baseUrl = hyperliquidConfig.apiUrl;
    this.rateLimit = {
      requests: 0,
      per: 1, // 1 second
      current: 1200, // Start with max requests per window
      resetTime: Date.now() + 1000
    };
    this.requestQueue = [];
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset rate limit if window has passed
    if (now > this.rateLimit.resetTime) {
      this.rateLimit.current = 1200; // Reset to max
      this.rateLimit.resetTime = now + 1000;
      this.rateLimit.requests = 0;
    }

    // If we've exceeded the rate limit, wait
    if (this.rateLimit.requests >= this.rateLimit.current) {
      const waitTime = this.rateLimit.resetTime - now;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime + 100));
        return this.waitForRateLimit();
      }
    }

    this.rateLimit.requests++;
  }

  private async makeRequest<T>(endpoint: string, body?: any, method: 'GET' | 'POST' = 'POST'): Promise<T> {
    await this.waitForRateLimit();

    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Hyperliquid-Educational-Dashboard/1.0'
      }
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const startTime = Date.now();
    let response: Response;
    let data: T;

    try {
      response = await fetch(url, options);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      data = await response.json();
      
      // Log successful request for monitoring
      this.logRequest(endpoint, method, response.status, responseTime, body, data);
      
      return data;
    } catch (error: any) {
      // Log failed request
      this.logRequest(endpoint, method, 0, Date.now() - startTime, body, null, error.message);
      throw error;
    }
  }

  private logRequest(endpoint: string, method: string, status: number, responseTime: number, requestData?: any, responseData?: any, error?: string) {
    // This could be enhanced to send logs to Supabase for monitoring
    if (error) {
      console.error(`[HyperliquidAPI] ${method} ${endpoint} failed:`, error);
    } else {
      console.log(`[HyperliquidAPI] ${method} ${endpoint} - ${status} (${responseTime}ms)`);
    }
  }

  /**
   * Get market metadata including all available assets
   */
  async getMarketData(): Promise<MarketData> {
    const data = await this.makeRequest<{ universe: Array<{ name: string; szDecimals: number }> }>('/info', {
      type: 'meta'
    });
    
    return {
      universe: data.universe,
      timestamp: Date.now()
    };
  }

  /**
   * Get all mid prices for all assets
   */
  async getAllMids(): Promise<Record<string, string>> {
    return await this.makeRequest<Record<string, string>>('/info', {
      type: 'allMids'
    });
  }

  /**
   * Get order book for a specific asset
   */
  async getOrderBook(coin: string): Promise<OrderBook> {
    const data = await this.makeRequest<{
      coin: string;
      levels: [[{ px: string; sz: string; n: number }], [{ px: string; sz: string; n: number }]];
      time: number;
    }>('/info', {
      type: 'l2Book',
      coin
    });

    return {
      coin: data.coin,
      levels: data.levels,
      time: data.time
    };
  }

  /**
   * Get account state including balances and positions
   */
  async getAccountState(userAddress: string): Promise<AccountState> {
    if (!userAddress) {
      throw new Error('User address is required');
    }

    return await this.makeRequest<AccountState>('/info', {
      type: 'clearinghouseState',
      user: userAddress
    });
  }

  /**
   * Get open orders for a user
   */
  async getOpenOrders(userAddress: string): Promise<OpenOrder[]> {
    if (!userAddress) {
      throw new Error('User address is required');
    }

    return await this.makeRequest<OpenOrder[]>('/info', {
      type: 'openOrders',
      user: userAddress
    });
  }

  /**
   * Get user fills (trade history)
   */
  async getUserFills(userAddress: string, startTime?: number): Promise<UserFill[]> {
    if (!userAddress) {
      throw new Error('User address is required');
    }

    const body: any = {
      type: 'userFills',
      user: userAddress
    };

    if (startTime) {
      body.startTime = startTime;
    }

    return await this.makeRequest<UserFill[]>('/info', body);
  }

  /**
   * Get trading assets metadata
   */
  async getAssets(): Promise<Array<{ name: string; szDecimals: number }>> {
    const marketData = await this.getMarketData();
    return marketData.universe;
  }

  /**
   * Get market summary for all assets
   */
  async getMarketSummary(): Promise<Array<{
    coin: string;
    dayNtlVlm?: string;
    premium?: string;
    prevDayPx?: string;
    fundingRate?: string;
    openInterest?: string;
    midPx?: string;
    markPx?: string;
  }>> {
    return await this.makeRequest('/info', { type: 'mktSummary' });
  }

  /**
   * Get candle data for technical analysis
   */
  async getCandleSnapshot(coin: string, interval: string, startTime?: number, endTime?: number): Promise<Array<{
    T: number;   // timestamp
    c: string;   // close
    h: string;   // high
    l: string;   // low
    n: number;   // number of trades
    o: string;   // open
    t: number;   // start timestamp
    v: string;   // volume
  }>> {
    const body: any = {
      type: 'candleSnapshot',
      req: {
        coin,
        interval,
        startTime: startTime || Date.now() - 24 * 60 * 60 * 1000, // Default to 24h ago
        endTime: endTime || Date.now()
      }
    };

    return await this.makeRequest('/info', body);
  }

  /**
   * Execute user-provided code in playground context
   * This parses the code and identifies the API method to call
   */
  async executeUserCode(code: string, userAddress?: string): Promise<any> {
    try {
      // Extract API method from code
      const apiMethod = this.extractApiMethod(code);
      const params = this.extractParameters(code);
      
      switch (apiMethod) {
        case 'getMarketData':
          return await this.getMarketData();
          
        case 'getAllMids':
          return await this.getAllMids();
          
        case 'getOrderBook':
          const coin = params.coin || 'BTC';
          return await this.getOrderBook(coin);
          
        case 'getAccountState':
          if (!userAddress) {
            throw new Error('User address required for account operations');
          }
          return await this.getAccountState(userAddress);
          
        case 'getUserFills':
          if (!userAddress) {
            throw new Error('User address required for user data');
          }
          return await this.getUserFills(userAddress);
          
        case 'getMarketSummary':
          return await this.getMarketSummary();
          
        case 'getCandleSnapshot':
          const candleCoin = params.coin || 'BTC';
          const interval = params.interval || '1h';
          return await this.getCandleSnapshot(candleCoin, interval);
          
        default:
          throw new Error(`Unsupported API method: ${apiMethod}`);
      }
    } catch (error: any) {
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }

  /**
   * Extract API method name from user code
   */
  private extractApiMethod(code: string): string {
    // Look for hyperliquidClient method calls
    const methodMatch = code.match(/hyperliquidClient\.([a-zA-Z]+)/);    
    if (methodMatch) {
      return methodMatch[1];
    }

    // Look for direct method calls
    const directMatch = code.match(/await\s+(get[A-Za-z]+|execute[A-Za-z]+)/);    
    if (directMatch) {
      return directMatch[1];
    }

    // Default fallback
    throw new Error('No API method found in code. Use hyperliquidClient.methodName() format.');
  }

  /**
   * Extract parameters from user code
   */
  private extractParameters(code: string): Record<string, any> {
    const params: Record<string, any> = {};
    
    // Extract coin parameter
    const coinMatch = code.match(/['"]([A-Z]{3,4})['"]/);
    if (coinMatch) {
      params.coin = coinMatch[1];
    }

    // Extract interval for candles
    const intervalMatch = code.match(/interval[:\s]*['"]([^'"]+)['"]/);
    if (intervalMatch) {
      params.interval = intervalMatch[1];
    }

    return params;
  }

  /**
   * Validate API response and add metadata
   */
  private enhanceResponse(data: any, endpoint: string): any {
    return {
      ...data,
      _metadata: {
        endpoint,
        timestamp: Date.now(),
        source: 'Hyperliquid Educational Dashboard'
      }
    };
  }
}

// Create and export singleton instance
export const hyperliquidClient = new HyperliquidApiClient();