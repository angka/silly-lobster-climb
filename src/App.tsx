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
import FittingSessionPage from "./pages/FittingSessionPage"; // Import the new FittingSessionPage
import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

// A simple wrapper for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  return isAuthenticated ? <>{children}</> : null;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize auth state from localStorage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index isAuthenticated={isAuthenticated} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DashboardPage onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <PatientDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route // New route for fitting session
              path="/patients/:id/fitting-session"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <FittingSessionPage />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;