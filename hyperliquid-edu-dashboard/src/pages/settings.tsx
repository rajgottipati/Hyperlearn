export function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">Settings</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Configure your learning experience and preferences
        </p>
        
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold mb-2">Settings Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            User settings and preferences panel is in development!
          </p>
          <a href="/" className="text-primary hover:underline">
            Return to Home →
          </a>
        </div>
      </div>
    </div>
  );
}