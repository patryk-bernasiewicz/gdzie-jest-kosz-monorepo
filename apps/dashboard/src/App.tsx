import { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Outside from './components/Outside';

const HomePage = lazy(() => import('./feature/home/page'));
const BinsPage = lazy(() => import('./feature/map/page'));

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const queryClient = new QueryClient();

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <SignedIn>
            <QueryClientProvider client={queryClient}>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/bins" element={<BinsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </QueryClientProvider>
          </SignedIn>
          <SignedOut>
            <Routes>
              <Route path="*" element={<Outside />} />
            </Routes>
          </SignedOut>
        </Suspense>
      </Router>
    </ClerkProvider>
  );
}

export default App;
