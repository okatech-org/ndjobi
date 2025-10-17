import { Suspense, useEffect, useState, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineIndicator, OfflineBanner } from "@/components/ui/offline-indicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingFallback } from "@/components/LoadingFallback";
import { CookieConsent } from "@/components/CookieConsent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/dashboards/UserDashboard";
import Statistics from "./pages/Statistics";
import DebugAuth from "./pages/DebugAuth";
import NdjobiAIAgent from "@/components/ai-agent/NdjobiAIAgent";
import { PWAAuth } from "@/components/auth/PWAAuth";

// Lazy loading UNIQUEMENT pour les routes rarement utilisées
const AgentDashboard = lazy(() => import("./pages/dashboards/AgentDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboards/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/dashboards/SuperAdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback fullScreen message="Vérification de votre session..." />;
  }

  // Détection immédiate d'une session locale depuis localStorage
  let localDemoRole: string | null = null;
  try {
    const raw = localStorage.getItem('ndjobi_demo_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role) {
        localDemoRole = parsed.role;
      }
    }
  } catch (_) {}

  // Pour les sessions locales (super_admin, demo), considérer l'accès comme autorisé
  const hasLocalSession = (!!role && !session) || !!localDemoRole;

  if (!user && !hasLocalSession) {
    if (location.pathname !== "/auth") {
      console.log('🚫 Pas d\'utilisateur détecté, redirection vers /auth');
      return <Navigate to="/auth" replace />;
    }
    return <></>;
  }

  if (hasLocalSession) {
    const effRole = (role as string) || (localDemoRole as string);
    console.log('✅ Session locale détectée, rôle:', effRole, ', accès autorisé');
  }

  // Redirection automatique vers le dashboard approprié si on est sur une page générique
  const effectiveRole = (role as string) || (localDemoRole as string) || null;
  if (effectiveRole && location.pathname === '/') {
    const dashboardUrl = effectiveRole === 'super_admin' ? '/dashboard/super-admin' :
                        effectiveRole === 'admin' ? '/dashboard/admin' :
                        effectiveRole === 'agent' ? '/dashboard/agent' : '/dashboard/user';
    return <Navigate to={dashboardUrl} replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  // Supprimé useAuth() pour éviter les boucles de re-render
  // Les composants enfants gèrent leur propre logique d'authentification
  return <>{children}</>;
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineBanner />
        <OfflineIndicator />
        <CookieConsent />
        <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
            <Route
              path="/"
              element={<Index />}
            />
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/pwa"
              element={
                <PublicRoute>
                  <PWAAuth />
                </PublicRoute>
              }
            />
            <Route
              path="/report"
              element={<Report />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/agent"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement du dashboard agent..." />}>
                    <AgentDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement du dashboard admin..." />}>
                    <AdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/super-admin"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement du dashboard super admin..." />}>
                    <SuperAdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route path="/statistiques" element={<Statistics />} />
            <Route path="/debug" element={<DebugAuth />} />
            <Route path="*" element={
              <Suspense fallback={<LoadingFallback fullScreen message="Chargement de la page..." />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
          <NdjobiAIAgent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
