export function ApiReferencePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">API Reference</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Complete documentation for Hyperliquid API endpoints
        </p>
        
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold mb-2">Under Construction</h2>
          <p className="text-muted-foreground mb-6">
            API Reference documentation is coming soon!
          </p>
          <a href="https://hyperliquid.gitbook.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            View Official Documentation →
          </a>
        </div>
      </div>
    </div>
  );
}