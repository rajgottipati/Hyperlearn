import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, TutorialProgress } from './supabase';
import type { MarketData } from './types';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
}

interface UserState {
  user: User | null;
  progress: Record<string, TutorialProgress>;
  isLoading: boolean;
}

interface MarketState {
  data: MarketData | null;
  prices: Record<string, string>;
  isLoading: boolean;
  lastUpdate: number;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
  }>;
}

interface AppStore {
  // Wallet
  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;
  connectWallet: (address: string, chainId: number) => void;
  disconnectWallet: () => void;
  
  // User
  user: UserState;
  setUser: (user: User | null) => void;
  setUserLoading: (loading: boolean) => void;
  updateProgress: (tutorialId: string, progress: TutorialProgress) => void;
  
  // Market data
  market: MarketState;
  setMarketData: (data: MarketData) => void;
  setPrices: (prices: Record<string, string>) => void;
  setMarketLoading: (loading: boolean) => void;
  setConnectionStatus: (status: MarketState['connectionStatus']) => void;
  
  // UI
  ui: UIState;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: UIState['theme']) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Actions
  reset: () => void;
}

const initialState = {
  wallet: {
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
  },
  user: {
    user: null,
    progress: {},
    isLoading: false,
  },
  market: {
    data: null,
    prices: {},
    isLoading: false,
    lastUpdate: 0,
    connectionStatus: 'disconnected' as const,
  },
  ui: {
    sidebarOpen: false,
    theme: 'system' as const,
    notifications: [],
  },
};

export const useAppStore = create<AppStore>()(persist(
  (set, get) => ({
    ...initialState,
    
    // Wallet actions
    setWallet: (wallet) => 
      set((state) => ({ wallet: { ...state.wallet, ...wallet } })),
    
    connectWallet: (address, chainId) => 
      set((state) => ({
        wallet: {
          ...state.wallet,
          address,
          chainId,
          isConnected: true,
          isConnecting: false,
        }
      })),
    
    disconnectWallet: () => 
      set((state) => ({
        wallet: {
          ...initialState.wallet,
        },
        user: {
          ...initialState.user,
        }
      })),
    
    // User actions
    setUser: (user) => 
      set((state) => ({ user: { ...state.user, user } })),
    
    setUserLoading: (isLoading) => 
      set((state) => ({ user: { ...state.user, isLoading } })),
    
    updateProgress: (tutorialId, progress) => 
      set((state) => ({
        user: {
          ...state.user,
          progress: {
            ...state.user.progress,
            [tutorialId]: progress,
          },
        },
      })),
    
    // Market actions
    setMarketData: (data) => 
      set((state) => ({
        market: {
          ...state.market,
          data,
          lastUpdate: Date.now(),
        },
      })),
    
    setPrices: (prices) => 
      set((state) => ({
        market: {
          ...state.market,
          prices: { ...state.market.prices, ...prices },
          lastUpdate: Date.now(),
        },
      })),
    
    setMarketLoading: (isLoading) => 
      set((state) => ({ market: { ...state.market, isLoading } })),
    
    setConnectionStatus: (connectionStatus) => 
      set((state) => ({ market: { ...state.market, connectionStatus } })),
    
    // UI actions
    setSidebarOpen: (sidebarOpen) => 
      set((state) => ({ ui: { ...state.ui, sidebarOpen } })),
    
    setTheme: (theme) => 
      set((state) => ({ ui: { ...state.ui, theme } })),
    
    addNotification: (notification) => 
      set((state) => ({
        ui: {
          ...state.ui,
          notifications: [
            {
              ...notification,
              id: Date.now().toString(),
              timestamp: Date.now(),
            },
            ...(state.ui.notifications || []).slice(0, 9), // Keep max 10 notifications
          ],
        },
      })),
    
    removeNotification: (id) => 
      set((state) => ({
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter((n) => n.id !== id),
        },
      })),
    
    clearNotifications: () => 
      set((state) => ({ ui: { ...state.ui, notifications: [] } })),
    
    // Reset
    reset: () => set(initialState),
  }),
  {
    name: 'hyperliquid-edu-store',
    partialize: (state) => ({
      wallet: {
        address: state.wallet.address,
        chainId: state.wallet.chainId,
      },
      user: {
        user: state.user.user,
        progress: state.user.progress,
      },
      ui: {
        theme: state.ui.theme,
      },
    }),
  }
));

// Selectors
export const useWallet = () => useAppStore((state) => state.wallet);
export const useUser = () => useAppStore((state) => state.user);
export const useMarket = () => useAppStore((state) => state.market);
export const useUI = () => useAppStore((state) => state.ui);