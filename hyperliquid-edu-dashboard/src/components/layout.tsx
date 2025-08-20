import { Navigation } from './navigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Learning</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/tutorials" className="hover:text-primary transition-colors">Tutorials</a></li>
              <li><a href="/examples" className="hover:text-primary transition-colors">Code Examples</a></li>
              <li><a href="/api-reference" className="hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="/playground" className="hover:text-primary transition-colors">API Playground</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/playground" className="hover:text-primary transition-colors">API Playground</a></li>
              <li><a href="/examples" className="hover:text-primary transition-colors">Code Examples</a></li>
              <li><a href="/api-reference" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="/settings" className="hover:text-primary transition-colors">Settings</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://discord.gg/hyperliquid" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Discord</a></li>
              <li><a href="https://twitter.com/hyperliquid_x" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="https://github.com/hyperliquid-dex" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a></li>
              <li><a href="https://hyperliquid.gitbook.io/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Official Docs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://hyperliquid.gitbook.io/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Official Docs</a></li>
              <li><a href="/settings" className="hover:text-primary transition-colors">Settings</a></li>
              <li><a href="mailto:support@hyperliquid.xyz" className="hover:text-primary transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Hyperliquid Educational Dashboard. Built for developers, by developers.</p>
          <p className="mt-2">
            <a href="https://hyperliquid.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Learn more about Hyperliquid
            </a>
            {" • "}
            <a href="https://github.com/hyperliquid-dex" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Open Source
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}