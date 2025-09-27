import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientDetailsPage from "./pages/PatientDetailsPage";
import FittingSessionPage from "./pages/FittingSessionPage";
import React, { useEffect } from "react";
import { SessionContextProvider, useSession } from "./components/SessionContextProvider"; // Import SessionContextProvider and useSession
import AdminPage from "./pages/AdminPage"; // Import AdminPage

const queryClient = new QueryClient();

// A simple wrapper for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

const AppContent = () => {
  const { isAuthenticated, isLoading, session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Logged out successfully!');
      navigate('/login');
    }
  };

  // Pass isAuthenticated and handleLogout to Layout
  // The Layout component will need to be updated to accept these props
  // For now, we'll pass them directly to DashboardPage and other protected routes
  // and let Layout handle its own display logic based on session context if needed.

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <PatientDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id/fitting-session"
        element={
          <ProtectedRoute>
            <FittingSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionContextProvider>
            <AppContent />
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;