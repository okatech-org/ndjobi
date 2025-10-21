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
import SuperAdminAuth from "./pages/SuperAdminAuth";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/dashboards/UserDashboard";
import Statistics from "./pages/Statistics";
import NdjobiAIAgent from "@/components/ai-agent/NdjobiAIAgent";
import { PWAAuth } from "@/components/auth/PWAAuth";

// Lazy loading UNIQUEMENT pour les routes rarement utilisées
const AgentDashboard = lazy(() => import("./pages/dashboards/AgentDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboards/Admin"));
const SuperAdminDashboard = lazy(() => import("./pages/dashboards/SuperAdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);
  const [localDemoRole, setLocalDemoRole] = useState<string | null>(null);
  const [demoSessionVersion, setDemoSessionVersion] = useState(0);

  const isPresident = user?.email === '24177888001@ndjobi.com' || 
                      user?.phone === '+24177888001';

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ndjobi_demo_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.role) {
          setLocalDemoRole(parsed.role);
        } else {
          setLocalDemoRole(null);
        }
      } else {
        setLocalDemoRole(null);
      }
    } catch (error) {
      console.error('Erreur parsing session:', error);
      setLocalDemoRole(null);
    }
  }, [demoSessionVersion]);

  useEffect(() => {
    if (!isLoading && !hasChecked) {
      setHasChecked(true);
    }
  }, [isLoading, hasChecked]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ndjobi_demo_session') {
        console.log('🔄 Session démo changée, revalidation...');
        setDemoSessionVersion(prev => prev + 1);
        setHasChecked(false);
      }
    };

    const handleDemoSessionChange = () => {
      console.log('🔄 Événement session démo détecté, revalidation...');
      setDemoSessionVersion(prev => prev + 1);
      setHasChecked(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ndjobi:demo:session:changed', handleDemoSessionChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ndjobi:demo:session:changed', handleDemoSessionChange);
    };
  }, []);

  useEffect(() => {
    const hasLocalSession = !!role || !!localDemoRole;
    if (hasLocalSession && hasChecked) {
      const effRole = localDemoRole || role;
      console.log('✅ Session locale détectée, rôle:', effRole, ', accès autorisé');
    }
  }, [role, localDemoRole, hasChecked]);

  if (isLoading && !hasChecked) {
    return <LoadingFallback fullScreen message="Vérification de votre session..." />;
  }

  const hasLocalSession = !!role || !!localDemoRole;

  if (!user && !hasLocalSession) {
    if (location.pathname !== "/auth") {
      console.log('🚫 Pas d\'utilisateur détecté, redirection vers /auth');
      return <Navigate to="/auth" replace />;
    }
    return <></>;
  }

  if (hasLocalSession && !user) {
    console.log('🔧 Session locale détectée mais user null - accès forcé pour', localDemoRole || role);
  }

  const effectiveRole = localDemoRole || role || null;
  if (effectiveRole && location.pathname === '/') {
    const dashboardUrl = effectiveRole === 'super_admin' ? '/dashboard/super-admin' :
                        isPresident ? '/dashboard/admin' :
                        effectiveRole === 'admin' ? '/dashboard/admin' :
                        effectiveRole === 'agent' ? '/dashboard/agent' : '/dashboard/user';
    console.log('📍 Redirection depuis / vers', dashboardUrl);
    return <Navigate to={dashboardUrl} replace />;
  }

  if (effectiveRole && location.pathname.startsWith('/dashboard')) {
    const target = effectiveRole === 'super_admin' ? '/dashboard/super-admin' :
                   isPresident ? '/dashboard/admin' :
                   effectiveRole === 'admin' ? '/dashboard/admin' :
                   effectiveRole === 'agent' ? '/dashboard/agent' : '/dashboard/user';
    if (!location.pathname.startsWith(target)) {
      console.log('📍 Correction route dashboard:', location.pathname, '->', target);
      return <Navigate to={target} replace />;
    }
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  // Supprimé useAuth() pour éviter les boucles de re-render
  // Les composants enfants gèrent leur propre logique d'authentification
  return <>{children}</>;
};

// Rendre le chatbot Ndjobi UNIQUEMENT pour l'espace Citoyen (role user)
// et l'exclure explicitement des espaces Admin / Super Admin / Agent
const NdjobiAgentVisibility = () => {
  const { role } = useAuth();
  const location = useLocation();

  const path = location.pathname || '';
  const isRestrictedSpace =
    path.startsWith('/dashboard/admin') ||
    path.startsWith('/dashboard/super-admin') ||
    path.startsWith('/dashboard/agent');

  if (isRestrictedSpace) return null;
  if (role && role !== 'user') return null;
  return <NdjobiAIAgent />;
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
              path="/auth/super-admin"
              element={
                <PublicRoute>
                  <SuperAdminAuth />
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
            {/* Routes Super Admin avec sous-routes dédiées */}
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
            <Route
              path="/dashboard/super-admin/dashboard"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement du dashboard super admin..." />}>
                    <SuperAdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/super-admin/system"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement du système..." />}>
                    <SuperAdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/super-admin/users"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement des utilisateurs..." />}>
                    <SuperAdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/super-admin/project"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement du projet..." />}>
                    <SuperAdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/super-admin/xr7"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement du module XR-7..." />}>
                    <SuperAdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/super-admin/visibilite"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement de la visibilité..." />}>
                    <SuperAdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/super-admin/config"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback fullScreen message="Chargement de la configuration..." />}>
                    <SuperAdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route path="/statistiques" element={<Statistics />} />
            <Route path="*" element={
              <Suspense fallback={<LoadingFallback fullScreen message="Chargement de la page..." />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
          <NdjobiAgentVisibility />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
