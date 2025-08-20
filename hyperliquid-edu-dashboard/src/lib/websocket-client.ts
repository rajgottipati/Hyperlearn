import { hyperliquidConfig } from './types';

export interface WebSocketMessage {
  channel: string;
  data: any;
}

export interface WebSocketSubscription {
  id: string;
  channel: string;
  params?: any;
  callback: (data: any) => void;
}

export type SubscriptionType = 
  | 'allMids'
  | 'l2Book'
  | 'trades'
  | 'user'
  | 'userFills'
  | 'userFunding'
  | 'candle';

interface SubscriptionParams {
  type: SubscriptionType;
  coin?: string;
  user?: string;
  interval?: string;
}

class HyperliquidWebSocketClient {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, WebSocketSubscription>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private url: string;

  // Event handlers
  private onConnectionStateChange?: (connected: boolean) => void;
  private onError?: (error: Error) => void;
  private onReconnectAttempt?: (attempt: number) => void;

  constructor() {
    this.url = hyperliquidConfig.wsUrl;
  }

  /**
   * Connect to the WebSocket
   */
  public connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        console.log(`[WebSocket] Connecting to ${this.url}`);
        this.ws = new WebSocket(this.url);

        // Connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

        this.ws.onopen = (event) => {
          console.log('[WebSocket] Connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }

          this.startHeartbeat();
          this.onConnectionStateChange?.(true);
          
          // Resubscribe to all subscriptions
          this.resubscribeAll();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`[WebSocket] Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.onConnectionStateChange?.(false);
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }

          // Attempt to reconnect if not manually closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        };

        this.ws.onerror = (event) => {
          console.error('[WebSocket] Connection error:', event);
          const error = new Error('WebSocket connection error');
          this.onError?.(error);
          
          if (this.isConnecting) {
            reject(error);
          }
        };

      } catch (error: any) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket
   */
  public disconnect(): void {
    console.log('[WebSocket] Disconnecting...');
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.stopHeartbeat();
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.subscriptions.clear();
    this.onConnectionStateChange?.(false);
  }

  /**
   * Subscribe to a data feed
   */
  public subscribe(
    params: SubscriptionParams,
    callback: (data: any) => void
  ): string {
    const subscriptionId = this.generateSubscriptionId(params);
    
    const subscription: WebSocketSubscription = {
      id: subscriptionId,
      channel: params.type,
      params,
      callback
    };

    this.subscriptions.set(subscriptionId, subscription);
    
    // Send subscription message if connected
    if (this.isConnected()) {
      this.sendSubscription(subscription);
    }

    console.log(`[WebSocket] Subscribed to ${params.type}:`, params);
    return subscriptionId;
  }

  /**
   * Unsubscribe from a data feed
   */
  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      console.warn(`[WebSocket] Subscription ${subscriptionId} not found`);
      return;
    }

    // Send unsubscribe message if connected
    if (this.isConnected()) {
      try {
        this.ws?.send(JSON.stringify({
          method: 'unsubscribe',
          subscription: subscription.params
        }));
      } catch (error) {
        console.error('[WebSocket] Failed to send unsubscribe message:', error);
      }
    }

    this.subscriptions.delete(subscriptionId);
    console.log(`[WebSocket] Unsubscribed from ${subscription.channel}`);
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  /**
   * Set event handlers
   */
  public onConnectionChange(handler: (connected: boolean) => void): void {
    this.onConnectionStateChange = handler;
  }

  public onErrorHandler(handler: (error: Error) => void): void {
    this.onError = handler;
  }

  public onReconnectHandler(handler: (attempt: number) => void): void {
    this.onReconnectAttempt = handler;
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: any): void {
    try {
      // Handle subscription confirmations
      if (message.method === 'subscription') {
        console.log('[WebSocket] Subscription confirmed:', message.subscription);
        return;
      }

      // Handle data messages
      if (message.channel && message.data) {
        // Find all subscriptions for this channel
        for (const [id, subscription] of this.subscriptions.entries()) {
          if (this.matchesSubscription(subscription, message)) {
            try {
              subscription.callback(message.data);
            } catch (error) {
              console.error(`[WebSocket] Callback error for subscription ${id}:`, error);
            }
          }
        }
        return;
      }

      // Handle direct data updates (Hyperliquid format)
      if (message.type === 'allMids') {
        // Find allMids subscriptions
        for (const [id, subscription] of this.subscriptions.entries()) {
          if (subscription.params?.type === 'allMids') {
            subscription.callback(message.data || message);
          }
        }
        return;
      }

      if (message.type === 'l2Book' && message.coin) {
        // Find l2Book subscriptions for this coin
        for (const [id, subscription] of this.subscriptions.entries()) {
          if (subscription.params?.type === 'l2Book' && subscription.params?.coin === message.coin) {
            subscription.callback(message);
          }
        }
        return;
      }

      // Handle other message types
      console.log('[WebSocket] Received unhandled message:', message);

    } catch (error) {
      console.error('[WebSocket] Message handling error:', error);
    }
  }

  /**
   * Check if a message matches a subscription
   */
  private matchesSubscription(subscription: WebSocketSubscription, message: any): boolean {
    if (subscription.channel !== message.channel) return false;
    
    // Add specific matching logic based on subscription parameters
    if (subscription.params?.coin && message.coin !== subscription.params.coin) {
      return false;
    }
    
    return true;
  }

  /**
   * Send subscription message
   */
  private sendSubscription(subscription: WebSocketSubscription): void {
    if (!this.isConnected()) {
      console.warn('[WebSocket] Cannot send subscription - not connected');
      return;
    }

    try {
      const message = {
        method: 'subscribe',
        subscription: subscription.params
      };
      
      this.ws!.send(JSON.stringify(message));
      console.log('[WebSocket] Sent subscription:', message);
    } catch (error) {
      console.error('[WebSocket] Failed to send subscription:', error);
      this.onError?.(new Error('Failed to send subscription'));
    }
  }

  /**
   * Resubscribe to all active subscriptions
   */
  private resubscribeAll(): void {
    console.log(`[WebSocket] Resubscribing to ${this.subscriptions.size} subscriptions`);
    
    for (const subscription of this.subscriptions.values()) {
      this.sendSubscription(subscription);
    }
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(params: SubscriptionParams): string {
    const parts: string[] = [params.type];
    if (params.coin) parts.push(params.coin);
    if (params.user) parts.push(params.user);
    if (params.interval) parts.push(params.interval);
    
    return `${parts.join('_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        try {
          this.ws!.send(JSON.stringify({ method: 'ping' }));
        } catch (error) {
          console.error('[WebSocket] Heartbeat failed:', error);
          // Connection might be broken, let it handle reconnection
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  private reconnect(): void {
    if (this.isConnecting) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.onReconnectAttempt?.(this.reconnectAttempts);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('[WebSocket] Reconnection failed:', error);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        } else {
          console.error('[WebSocket] Max reconnection attempts reached');
          this.onError?.(new Error('Max reconnection attempts reached'));
        }
      });
    }, delay);
  }
}

// Create and export singleton instance
export const wsClient = new HyperliquidWebSocketClient();