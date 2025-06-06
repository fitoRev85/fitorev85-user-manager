import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/hooks/useTheme.tsx';

// Import pages
import Properties from '@/pages/Properties';
import RMSForecastPace from '@/pages/RMSForecastPace';
import Pricing from '@/pages/Pricing';
import ExecutiveDashboard from '@/pages/ExecutiveDashboard';
import EventsSeason from '@/pages/EventsSeason';
import Financial from '@/pages/Financial';
import BudgetMetas from '@/pages/BudgetMetas';
import ChannelAnalysis from '@/pages/ChannelAnalysis';
import AnalysisPage from '@/pages/AnalysisPage';
import Reports from '@/pages/Reports';
import UserManagement from '@/pages/UserManagement';
import NotFound from '@/pages/NotFound';
import Alerts from '@/pages/Alerts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Properties />} />
                <Route path="/rms/:propertyId" element={<RMSForecastPace />} />
                <Route path="/pricing/:propertyId" element={<Pricing />} />
                <Route path="/executive" element={<ExecutiveDashboard />} />
                <Route path="/events" element={<EventsSeason />} />
                <Route path="/financial" element={<Financial />} />
                <Route path="/budget" element={<BudgetMetas />} />
                <Route path="/channels" element={<ChannelAnalysis />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster position="top-right" />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
