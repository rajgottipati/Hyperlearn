import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

// Simplified configuration focusing on MetaMask/Injected wallets
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({ shimDisconnect: true }),
    metaMask({
      dappMetadata: {
        name: 'Hyperliquid Educational Dashboard',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://hyperliquid-edu.com',
      }
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Wallet utilities
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const getExplorerUrl = (address: string, chainId: number = 1): string => {
  const baseUrls = {
    1: 'https://etherscan.io/address/',
    11155111: 'https://sepolia.etherscan.io/address/', // Sepolia
  };
  
  return `${baseUrls[chainId as keyof typeof baseUrls] || baseUrls[1]}${address}`;
};

// Check if MetaMask is available
export const isMetaMaskAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         window.ethereum.isMetaMask;
};

// Signature utilities for Hyperliquid authentication
export const createAuthMessage = (address: string, timestamp: number): string => {
  return `Sign this message to authenticate with Hyperliquid Educational Dashboard.\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis signature is only used for authentication and will not authorize any transactions.`;
};

export const generateNonce = (): number => {
  return Math.floor(Date.now() / 1000);
};