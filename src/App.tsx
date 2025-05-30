
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import Properties from "./pages/Properties";
import UserManagement from "./pages/UserManagement";
import RMSForecastPace from "./pages/RMSForecastPace";
import NotFound from "./pages/NotFound";
import Financial from "./pages/Financial";

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

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<Properties />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/rms/:propertyId" element={<RMSForecastPace />} />
      <Route path="/financial" element={<Financial />} />
      {user.categoria === 'admin' && (
        <Route path="/users" element={<UserManagement />} />
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
