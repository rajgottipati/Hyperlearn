import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Copy, Save, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hyperliquidClient } from '@/lib/hyperliquid-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const apiExamples = [
  {
    id: 'market-data',
    name: 'Get Market Data',
    description: 'Fetch all available trading pairs and their metadata',
    code: `import { hyperliquidClient } from '@/lib/hyperliquid-client';

// Fetch market metadata
const marketData = await hyperliquidClient.getMarketData();

console.log('Available assets:', marketData.universe.length);
console.log('Sample assets:');
marketData.universe.slice(0, 5).forEach(asset => {
  console.log(\`- \${asset.name} (\${asset.szDecimals} decimals)\`);
});`,
    endpoint: 'POST /info',
    category: 'Market Data'
  },
  {
    id: 'live-prices',
    name: 'Live Prices',
    description: 'Get current mid prices for all trading pairs',
    code: `// Fetch all current prices
const prices = await hyperliquidClient.getAllMids();

console.log('Live Prices:');
Object.entries(prices).slice(0, 5).forEach(([coin, price]) => {
  const formattedPrice = parseFloat(price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  console.log(\`\${coin}: \${formattedPrice}\`);
});`,
    endpoint: 'POST /info',
    category: 'Market Data'
  },
  {
    id: 'order-book',
    name: 'Order Book',
    description: 'Get live order book data for a specific asset',
    code: `// Get BTC order book
const orderBook = await hyperliquidClient.getOrderBook('BTC');

console.log(\`Order Book for \${orderBook.coin}:\`);
console.log('Top 3 Bids:');
orderBook.levels[0].slice(0, 3).forEach((bid, i) => {
  console.log(\`\${i + 1}. $\${bid.px} x \${bid.sz} (\${bid.n} orders)\`);
});

console.log('Top 3 Asks:');
orderBook.levels[1].slice(0, 3).forEach((ask, i) => {
  console.log(\`\${i + 1}. $\${ask.px} x \${ask.sz} (\${ask.n} orders)\`);
});`,
    endpoint: 'POST /info',
    category: 'Market Data'
  },
  {
    id: 'account-state',
    name: 'Account State',
    description: 'Get account balances and positions (requires wallet)',
    code: `// Get account state (requires connected wallet)
const userAddress = '0x1234567890abcdef1234567890abcdef12345678';

try {
  const accountState = await hyperliquidClient.getAccountState(userAddress);
  
  console.log('Account Summary:');
  console.log(\`Account Value: $\${parseFloat(accountState.marginSummary.accountValue).toLocaleString()}\`);
  console.log(\`Withdrawable: $\${parseFloat(accountState.marginSummary.withdrawable).toLocaleString()}\`);
  console.log(\`Active Positions: \${accountState.assetPositions.length}\`);
  
} catch (error) {
  console.error('Account data requires a valid wallet address');
}`,
    endpoint: 'POST /info',
    category: 'Account Data',
    requiresWallet: true
  },
  {
    id: 'websocket-prices',
    name: 'WebSocket Prices',
    description: 'Subscribe to live price updates via WebSocket',
    code: `import { wsClient } from '@/lib/websocket-client';

// Connect to WebSocket
if (!wsClient.isConnected()) {
  await wsClient.connect();
  console.log('WebSocket connected!');
}

// Subscribe to price updates
const subscriptionId = wsClient.subscribe(
  { type: 'allMids' },
  (prices) => {
    console.log('Price update received:');
    const samplePrices = Object.entries(prices).slice(0, 3);
    samplePrices.forEach(([coin, price]) => {
      console.log(\`\${coin}: $\${parseFloat(price).toLocaleString()}\`);
    });
  }
);

console.log(\`Subscribed with ID: \${subscriptionId}\`);
console.log('Waiting for live price updates...');`,
    endpoint: 'WebSocket',
    category: 'Real-time Data'
  }
];

export function PlaygroundPage() {
  const [selectedExample, setSelectedExample] = useState(apiExamples[0]);
  const [customCode, setCustomCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('examples');
  const [lastExecutionTime, setLastExecutionTime] = useState<number>(0);
  
  const { wallet, user, market } = useAppStore();

  const runCode = async (code: string = selectedExample.code) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setOutput('Running code...');
    const startTime = Date.now();
    
    try {
      // Check if user needs to be connected for certain operations
      const requiresWallet = code.includes('getAccountState') || 
                           code.includes('getUserFills') ||
                           selectedExample.requiresWallet;
      
      if (requiresWallet && !wallet.isConnected) {
        throw new Error('This operation requires a connected wallet. Please connect your wallet first.');
      }

      // Execute real API call
      const result = await hyperliquidClient.executeUserCode(
        code, 
        wallet.address || undefined
      );
      
      const executionTime = Date.now() - startTime;
      setLastExecutionTime(executionTime);
      
      // Format the output nicely
      const formattedOutput = JSON.stringify(result, null, 2);
      setOutput(`✅ Execution completed in ${executionTime}ms\n\n${formattedOutput}`);
      
      toast.success(`Code executed successfully in ${executionTime}ms`);
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error.message || 'Unknown error occurred';
      
      setOutput(`❌ Execution failed in ${executionTime}ms\n\nError: ${errorMessage}\n\nTip: Make sure you're using valid Hyperliquid API methods and parameters.`);
      
      toast.error('Code execution failed', {
        description: errorMessage
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runCustomCode = () => {
    if (!customCode.trim()) {
      toast.error('Please enter some code to execute');
      return;
    }
    runCode(customCode);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const saveCode = () => {
    const codeToSave = activeTab === 'examples' ? selectedExample.code : customCode;
    const blob = new Blob([codeToSave], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hyperliquid-code-${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code saved successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">API Playground</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Test Hyperliquid APIs with live data in real-time
          </p>
          
          {/* Connection Status */}
          <div className="flex items-center gap-4 mb-4">
            <Badge variant={market.connectionStatus === 'connected' ? 'default' : 'destructive'}>
              Market Data: {market.connectionStatus}
            </Badge>
            <Badge variant={wallet.isConnected ? 'default' : 'outline'}>
              Wallet: {wallet.isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            {lastExecutionTime > 0 && (
              <Badge variant="outline">
                Last execution: {lastExecutionTime}ms
              </Badge>
            )}
          </div>
          
          {!wallet.isConnected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some API methods require a connected wallet. Connect your wallet to test account-related features.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code Editor Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Code Editor</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(activeTab === 'examples' ? selectedExample.code : customCode)}
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveCode}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                    <TabsTrigger value="custom">Custom Code</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="examples" className="mt-4">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{selectedExample.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{selectedExample.category}</Badge>
                          {selectedExample.requiresWallet && (
                            <Badge variant="secondary">Requires Wallet</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {selectedExample.description}
                      </p>
                      <div className="text-xs font-mono text-muted-foreground mb-3">
                        Endpoint: {selectedExample.endpoint}
                      </div>
                    </div>
                    
                    <Editor
                      height="400px"
                      defaultLanguage="javascript"
                      value={selectedExample.code}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="custom" className="mt-4">
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Custom Code</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Write your own Hyperliquid API code. Use hyperliquidClient methods.
                      </p>
                    </div>
                    
                    <Editor
                      height="400px"
                      defaultLanguage="javascript"
                      value={customCode}
                      onChange={(value) => setCustomCode(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                      }}
                    />
                  </TabsContent>
                </Tabs>
                
                <div className="mt-4 flex items-center gap-2">
                  <Button 
                    onClick={() => activeTab === 'examples' ? runCode() : runCustomCode()}
                    disabled={isRunning}
                    className="flex-1"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Examples List */}
            {activeTab === 'examples' && (
              <Card>
                <CardHeader>
                  <CardTitle>API Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {apiExamples.map((example) => (
                        <div
                          key={example.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedExample.id === example.id 
                              ? "bg-primary/10 border-primary" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedExample(example)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{example.name}</h4>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {example.category}
                              </Badge>
                              {example.requiresWallet && (
                                <Badge variant="secondary" className="text-xs">
                                  Wallet
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {example.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm min-h-[500px] whitespace-pre-wrap overflow-auto">
                  {output || 'Click "Run Code" to see the output...'}
                </div>
              </CardContent>
            </Card>
            
            {/* Live Market Data Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Live Market Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {market.connectionStatus === 'connected' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Real-time data connected</span>
                    </div>
                    
                    <ScrollArea className="h-48">
                      <div className="space-y-1">
                        {Object.entries(market.prices).slice(0, 10).map(([coin, price]) => (
                          <div key={coin} className="flex justify-between items-center py-1">
                            <span className="font-medium">{coin}</span>
                            <span className="font-mono text-sm">
                              ${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Connecting to live market data...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}