import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/error-boundary';
import { Layout } from './components/layout';
import { HomePage } from './pages/home';
import { TutorialsPage } from './pages/tutorials';
import { TutorialPage } from './pages/tutorial';
import { PlaygroundPage } from './pages/playground';
import { ApiReferencePage } from './pages/api-reference';
import { ExamplesPage } from './pages/examples';
import { SettingsPage } from './pages/settings';
import { NotFoundPage } from './pages/not-found';
import { MarketDataProvider } from './components/market-data-provider';
import { WalletConnectionProvider } from './components/wallet-connection-provider';

function App() {
  return (
    <ErrorBoundary>
      <WalletConnectionProvider>
        <MarketDataProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tutorials" element={<TutorialsPage />} />
              <Route path="/tutorials/:id" element={<TutorialPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/api-reference" element={<ApiReferencePage />} />
              <Route path="/examples" element={<ExamplesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right" 
            expand={false}
            richColors
            closeButton
          />
        </MarketDataProvider>
      </WalletConnectionProvider>
    </ErrorBoundary>
  );
}

export default App;