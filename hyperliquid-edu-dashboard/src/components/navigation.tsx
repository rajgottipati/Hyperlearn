import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { 
  BookOpen, 
  Code, 
  FileText, 
  Gamepad2, 
  Settings, 
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Wallet,
  LogOut,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { useTheme } from './theme-provider';
import { useAppStore, useWallet, useUser, useMarket } from '@/lib/store';
import { formatAddress } from '@/lib/wallet';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: BookOpen },
  { name: 'Tutorials', href: '/tutorials', icon: FileText },
  { name: 'API Playground', href: '/playground', icon: Gamepad2 },
  { name: 'API Reference', href: '/api-reference', icon: Code },
  { name: 'Examples', href: '/examples', icon: Code },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  
  const wallet = useWallet();
  const user = useUser();
  const market = useMarket();

  const connectWallet = () => {
    if (typeof window !== 'undefined' && (window as any).__connectWallet) {
      (window as any).__connectWallet();
    }
  };

  const disconnectWallet = () => {
    if (typeof window !== 'undefined' && (window as any).__disconnectWallet) {
      (window as any).__disconnectWallet();
    }
  };

  const getConnectionStatus = () => {
    if (market.connectionStatus === 'connected') {
      return { icon: Activity, color: 'text-green-500', text: 'Live Data' };
    } else if (market.connectionStatus === 'connecting') {
      return { icon: TrendingUp, color: 'text-yellow-500', text: 'Connecting' };
    } else {
      return { icon: Activity, color: 'text-red-500', text: 'Offline' };
    }
  };

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-bold text-lg gradient-text">
                Hyperliquid Edu
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.slice(1, -1).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md',
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <StatusIcon className={cn('h-4 w-4', connectionStatus.color)} />
              <span className="text-muted-foreground">{connectionStatus.text}</span>
            </div>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wallet Connection */}
            {wallet.isConnected && user.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4" />
                    <span>{formatAddress(wallet.address!)}</span>
                    {user.user.level > 1 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        L{user.user.level}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatAddress(wallet.address!)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">XP: {user.user.xp_points}</span>
                      <span className="text-xs text-muted-foreground">Level {user.user.level}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={connectWallet} 
                size="sm" 
                disabled={wallet.isConnecting}
                className="flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>{wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-primary hover:bg-muted'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile connection status */}
            <div className="px-2 pb-3 border-t">
              <div className="flex items-center space-x-2 px-3 py-2">
                <StatusIcon className={cn('h-4 w-4', connectionStatus.color)} />
                <span className="text-sm text-muted-foreground">
                  {connectionStatus.text}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}