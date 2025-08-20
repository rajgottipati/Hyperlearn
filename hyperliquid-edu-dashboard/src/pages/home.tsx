import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  Code, 
  Zap, 
  Users, 
  Activity,
  TrendingUp,
  Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarket } from '@/lib/store';
import { hyperliquidClient } from '@/lib/hyperliquid-client';
import { formatAddress } from '@/lib/wallet';

const features = [
  {
    icon: Code,
    title: 'Live API Integration',
    description: 'Real Hyperliquid API calls with live market data and WebSocket connections'
  },
  {
    icon: BookOpen,
    title: 'Interactive Tutorials',
    description: 'Hands-on learning with executable code and real-time feedback'
  },
  {
    icon: Zap,
    title: 'Production Ready',
    description: 'Deploy-ready code with comprehensive error handling and authentication'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Connect with developers, share progress, and learn together'
  }
];

const tutorialPreviews = [
  {
    title: 'Live API Connection',
    description: 'Connect to real Hyperliquid API endpoints with live market data',
    difficulty: 'Beginner',
    time: '15 min',
    href: '/tutorials/getting-started'
  },
  {
    title: 'Real-Time WebSocket Feeds',
    description: 'Stream live market data, order books, and trade executions',
    difficulty: 'Intermediate',
    time: '20 min',
    href: '/tutorials/websocket-feeds'
  },
  {
    title: 'Wallet Integration',
    description: 'MetaMask connection, authentication, and user management',
    difficulty: 'Intermediate',
    time: '25 min',
    href: '/tutorials/wallet-integration'
  },
  {
    title: 'Account Management',
    description: 'Read portfolio balances, positions, and trading history',
    difficulty: 'Beginner',
    time: '18 min',
    href: '/tutorials/account-data'
  },
  {
    title: 'Production Trading Bot',
    description: 'Build automated trading bots with real-time data and risk management',
    difficulty: 'Advanced',
    time: '45 min',
    href: '/tutorials/trading-bot'
  },
  {
    title: 'Live Data Visualization',
    description: 'Create real-time charts and dashboards with WebSocket feeds',
    difficulty: 'Intermediate',
    time: '25 min',
    href: '/tutorials/data-visualization'
  }
];

export function HomePage() {
  const market = useMarket();
  const [liveStats, setLiveStats] = useState({
    assets: 0,
    connected: false,
    responseTime: 0,
    samplePrices: {} as Record<string, string>
  });

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const startTime = Date.now();
        const marketData = await hyperliquidClient.getMarketData();
        const prices = await hyperliquidClient.getAllMids();
        const responseTime = Date.now() - startTime;
        
        // Get sample prices for major assets
        const majorAssets = ['BTC', 'ETH', 'SOL', 'AVAX'];
        const samplePrices: Record<string, string> = {};
        majorAssets.forEach(asset => {
          if (prices[asset]) {
            samplePrices[asset] = prices[asset];
          }
        });
        
        setLiveStats({
          assets: marketData.universe.length,
          connected: true,
          responseTime,
          samplePrices
        });
      } catch (error) {
        console.error('Failed to fetch live stats:', error);
        setLiveStats(prev => ({ ...prev, connected: false }));
      }
    };

    fetchLiveStats();
  }, []);

  const getConnectionStatus = () => {
    if (market.connectionStatus === 'connected') {
      return { icon: Wifi, color: 'text-green-500', text: 'Live API Connected' };
    } else if (market.connectionStatus === 'connecting') {
      return { icon: TrendingUp, color: 'text-yellow-500', text: 'Connecting...' };
    } else {
      return { icon: Activity, color: 'text-red-500', text: 'Offline Mode' };
    }
  };

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="max-w-7xl mx-auto text-center">
          {/* Live Status Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-2">
              <StatusIcon className="h-3 w-3" />
              {connectionStatus.text}
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Hyperliquid{' '}
            <span className="gradient-text">
              Developer Hub
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            The complete developer platform for building on Hyperliquid. Real API integration, 
            interactive tutorials, live market data, and production-ready tools.
          </p>

          {/* Live Stats */}
          {liveStats.connected && (
            <div className="flex justify-center gap-6 mb-8 text-sm flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>{liveStats.assets} Live Assets</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>{liveStats.responseTime}ms Response</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Real-time Data</span>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/tutorials">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/playground">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Try API Playground
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Market Data Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Live Market Data</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real-time market data powered by Hyperliquid's production API
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(liveStats.samplePrices).map(([symbol, price]) => {
                  const numPrice = parseFloat(price);
                  const formattedPrice = numPrice.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                  
                  return (
                    <div key={symbol} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{symbol}</span>
                        <Badge variant="secondary">{formattedPrice}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Live data updates via WebSocket connection
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Connected to live feeds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tutorial Previews */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Production-Ready Learning</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From basic API connections to advanced trading strategies with real market data
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorialPreviews.map((tutorial, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{tutorial.title}</h3>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        tutorial.difficulty === 'Beginner' ? 'border-green-200 text-green-700 bg-green-50' :
                        tutorial.difficulty === 'Intermediate' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                        'border-red-200 text-red-700 bg-red-50'
                      }`}
                    >
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{tutorial.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">⏱ {tutorial.time}</span>
                    <Link to={tutorial.href} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Start →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Build on Hyperliquid?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join developers building the future of decentralized trading
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tutorials">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                  Start Building Now
                </Button>
              </Link>
              <Link to="/playground">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                  Explore API
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}