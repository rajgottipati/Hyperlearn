import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface RetryWrapperProps {
  children: ReactNode;
  onRetry?: () => Promise<void> | void;
  maxRetries?: number;
  error?: Error | null;
  loading?: boolean;
  fallback?: ReactNode;
}

export function RetryWrapper({
  children,
  onRetry,
  maxRetries = 3,
  error,
  loading = false,
  fallback
}: RetryWrapperProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await onRetry?.();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  if (error) {
    const canRetry = retryCount < maxRetries && !isRetrying;
    
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {error.message || 'An unexpected error occurred'}
              </AlertDescription>
            </Alert>
            
            {canRetry && (
              <Button 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : `Retry (${maxRetries - retryCount} left)`}
              </Button>
            )}
            
            {retryCount >= maxRetries && (
              <div className="text-center text-sm text-muted-foreground">
                Max retries reached. Please refresh the page or check your connection.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}