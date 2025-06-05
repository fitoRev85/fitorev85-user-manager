import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ThemeSelector } from "@/components/ui/theme-selector";
import Properties from "./pages/Properties";
import UserManagement from "./pages/UserManagement";
import RMSForecastPace from "./pages/RMSForecastPace";
import NotFound from "./pages/NotFound";
import Financial from "./pages/Financial";
import Pricing from "./pages/Pricing";
import Reports from "./pages/Reports";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import AnalysisPage from "./pages/AnalysisPage";
import ChannelAnalysis from "./pages/ChannelAnalysis";
import BudgetMetas from "./pages/BudgetMetas";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  // Enable keyboard shortcuts globally
  useKeyboardShortcuts();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Theme selector - positioned fixed in top right */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <ThemeSelector />
      </div>
      
      <Routes>
        <Route path="/" element={<Properties />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/executive" element={<ExecutiveDashboard />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/channels" element={<ChannelAnalysis />} />
        <Route path="/budget" element={<BudgetMetas />} />
        <Route path="/rms/:propertyId" element={<RMSForecastPace />} />
        <Route path="/pricing/:propertyId" element={<Pricing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/financial" element={<Financial />} />
        {user.categoria === 'admin' && (
          <Route path="/users" element={<UserManagement />} />
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner 
        position="bottom-right"
        className="animate-slide-in-right"
        toastOptions={{
          className: "smooth-transition",
        }}
      />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
