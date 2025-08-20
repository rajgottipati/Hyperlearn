import { useEffect } from 'react';
import { hyperliquidClient } from '@/lib/hyperliquid-client';
import { wsClient } from '@/lib/websocket-client';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface MarketDataProviderProps {
  children: React.ReactNode;
}

export function MarketDataProvider({ children }: MarketDataProviderProps) {
  const { 
    setMarketData, 
    setPrices, 
    setMarketLoading, 
    setConnectionStatus,
    addNotification 
  } = useAppStore();

  useEffect(() => {
    let priceSubscriptionId: string | null = null;
    
    const initializeMarketData = async () => {
      try {
        setMarketLoading(true);
        setConnectionStatus('connecting');
        
        // Fetch initial market data
        console.log('Fetching initial market data...');
        const marketData = await hyperliquidClient.getMarketData();
        setMarketData(marketData);
        
        // Fetch initial prices
        const prices = await hyperliquidClient.getAllMids();
        setPrices(prices);
        
        console.log(`Loaded ${marketData?.universe?.length || 0} assets with live prices`);
        
        // Initialize WebSocket connection
        await connectWebSocket();
        
        setConnectionStatus('connected');
        addNotification({
          type: 'success',
          title: 'Market Data Connected',
          message: `Live data for ${marketData?.universe?.length || 0} assets`
        });
        
      } catch (error: any) {
        console.error('Failed to initialize market data:', error);
        setConnectionStatus('error');
        addNotification({
          type: 'error',
          title: 'Connection Failed',
          message: 'Failed to connect to market data feeds'
        });
      } finally {
        setMarketLoading(false);
      }
    };
    
    const connectWebSocket = async () => {
      try {
        // Set up WebSocket handlers
        wsClient.onConnectionChange((connected) => {
          console.log(`WebSocket ${connected ? 'connected' : 'disconnected'}`);
          if (!connected) {
            setConnectionStatus('error');
          }
        });
        
        wsClient.onErrorHandler((error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
        });
        
        wsClient.onReconnectHandler((attempt) => {
          console.log(`WebSocket reconnection attempt ${attempt}`);
          setConnectionStatus('connecting');
        });
        
        // Connect to WebSocket
        await wsClient.connect();
        
        // Subscribe to live price updates
        priceSubscriptionId = wsClient.subscribe(
          { type: 'allMids' },
          (newPrices) => {
            setPrices(newPrices);
            console.log('Received price update for', Object.keys(newPrices).length, 'assets');
          }
        );
        
        console.log('WebSocket connected and subscribed to price feeds');
        
      } catch (error: any) {
        console.error('WebSocket connection failed:', error);
        // Continue with REST API only if WebSocket fails
        setupPricePolling();
      }
    };
    
    // Fallback price polling if WebSocket fails
    const setupPricePolling = () => {
      console.log('Setting up price polling fallback...');
      const interval = setInterval(async () => {
        try {
          const prices = await hyperliquidClient.getAllMids();
          setPrices(prices);
        } catch (error) {
          console.error('Price polling error:', error);
        }
      }, 5000); // Poll every 5 seconds
      
      return () => clearInterval(interval);
    };
    
    // Initialize everything
    initializeMarketData();
    
    // Cleanup function
    return () => {
      if (priceSubscriptionId) {
        wsClient.unsubscribe(priceSubscriptionId);
      }
      // Note: Don't disconnect WebSocket as other components might use it
    };
  }, []);

  return <>{children}</>;
}