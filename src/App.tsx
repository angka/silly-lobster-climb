import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientDetailsPage from "./pages/PatientDetailsPage";
import FittingSessionPage from "./pages/FittingSessionPage";
import FollowUpSessionPage from "./pages/FollowUpSessionPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import React from "react";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { session, role, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboardPage />
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
        path="/patients/:id/follow-up-session"
        element={
          <ProtectedRoute>
            <FollowUpSessionPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;