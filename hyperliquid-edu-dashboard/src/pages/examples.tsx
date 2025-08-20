export function ExamplesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">Code Examples</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Ready-to-use code examples for common Hyperliquid development patterns
        </p>
        
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💻</div>
          <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            Code examples library is being prepared!
          </p>
          <a href="/playground" className="text-primary hover:underline">
            Try the API Playground instead →
          </a>
        </div>
      </div>
    </div>
  );
}