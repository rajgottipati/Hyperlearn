import * as React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error Boundary:', error, errorInfo);
    
    // Log to external service in production
    if (import.meta.env.PROD) {
      // logErrorToService(error, errorInfo);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} retry={this.retry} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card p-8 rounded-lg shadow-lg border">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold text-destructive mb-2">Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. This has been logged and we'll look into it.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded mb-6 text-sm font-mono overflow-x-auto">
            {error.message}
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={retry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}