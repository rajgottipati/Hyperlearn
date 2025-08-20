import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAppStore } from '@/lib/store';
import { createOrUpdateUser, isDemoMode } from '@/lib/supabase';
import { isMetaMaskAvailable } from '@/lib/wallet';
import { toast } from 'sonner';

interface WalletConnectionProviderProps {
  children: React.ReactNode;
}

export function WalletConnectionProvider({ children }: WalletConnectionProviderProps) {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { 
    wallet, 
    setWallet, 
    connectWallet, 
    disconnectWallet,
    setUser,
    addNotification 
  } = useAppStore();

  // Handle wallet connection state changes
  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnect(address, chainId || 1);
    } else if (!isConnected && wallet.isConnected) {
      handleWalletDisconnect();
    }
  }, [isConnected, address, chainId]);

  const handleWalletConnect = async (address: string, chainId: number) => {
    try {
      setWallet({ isConnecting: true });
      
      // Update wallet state
      connectWallet(address, chainId);
      
      // Create or update user in database (with fallback for demo mode)
      let user = null;
      if (!isDemoMode()) {
        try {
          user = await createOrUpdateUser(address);
        } catch (error) {
          console.log('Database user creation failed, using demo mode');
        }
      }
      
      if (!user) {
        // Fallback to demo user with wallet address
        user = {
          id: `wallet-${address.slice(-8)}`,
          wallet_address: address,
          username: `User ${address.slice(-6)}`,
          xp_points: 0,
          level: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      setUser(user);
      addNotification({
        type: 'success',
        title: 'Wallet Connected',
        message: `Welcome back, ${user.username}!`
      });
      
      console.log('Wallet connected:', { address, chainId });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: error.message || 'Failed to connect wallet'
      });
      
      // Clean up on error
      disconnectWallet();
      disconnect();
    } finally {
      setWallet({ isConnecting: false });
    }
  };

  const handleWalletDisconnect = () => {
    disconnectWallet();
    addNotification({
      type: 'info',
      title: 'Wallet Disconnected',
      message: 'Your wallet has been disconnected'
    });
    console.log('Wallet disconnected');
  };

  // Expose connect function for manual connection
  const connectMetaMask = () => {
    if (!isMetaMaskAvailable()) {
      toast.error('MetaMask not found', {
        description: 'Please install MetaMask extension to connect your wallet'
      });
      return;
    }
    
    const metamaskConnector = connectors.find(c => c.id === 'metaMask' || c.name.toLowerCase().includes('metamask'));
    const injectedConnector = connectors.find(c => c.id === 'injected');
    
    const connector = metamaskConnector || injectedConnector;
    
    if (connector) {
      connect({ connector });
    } else {
      toast.error('No wallet connector found', {
        description: 'Please refresh the page and try again'
      });
    }
  };

  // Add connect function to global context
  useEffect(() => {
    (window as any).__connectWallet = connectMetaMask;
    (window as any).__disconnectWallet = () => disconnect();
    
    return () => {
      delete (window as any).__connectWallet;
      delete (window as any).__disconnectWallet;
    };
  }, [connectMetaMask, disconnect]);

  return <>{children}</>;
}