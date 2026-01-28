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
import TrackReport from "./pages/TrackReport";
import NdjobiAIAgent from "@/components/ai-agent/NdjobiAIAgent";
import { PWAAuth } from "@/components/auth/PWAAuth";

// Lazy loading UNIQUEMENT pour les routes rarement utilisées
const AgentDashboard = lazy(() => import("./pages/dashboards/AgentDashboard"));
const SpecializedAgentDashboard = lazy(() => import("./pages/dashboards/SpecializedAgentDashboard"));
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
  // Mapping des rôles spécialisés vers leurs URLs
  const getAgentDashboardUrl = (r: string | null): string => {
    if (!r) return '/user';
    switch (r) {
      case 'super_admin': return '/super-admin';
      case 'admin': return '/admin';
      case 'sub_admin': return '/admin';
      case 'agent': return '/agent';
      case 'agent_anticorruption': return '/agent/anticorruption';
      case 'agent_justice': return '/agent/justice';
      case 'agent_interior': return '/agent/interior';
      case 'agent_defense': return '/agent/defense';
      case 'sub_admin_dgss': return '/agent/dgss';
      case 'sub_admin_dgr': return '/agent/dgr';
      default: return '/user';
    }
  };

  if (effectiveRole && location.pathname === '/') {
    const dashboardUrl = isPresident ? '/admin' : getAgentDashboardUrl(effectiveRole);
    console.log('📍 Redirection depuis / vers', dashboardUrl);
    return <Navigate to={dashboardUrl} replace />;
  }

  if (effectiveRole && (location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/user') ||
    location.pathname.startsWith('/agent') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/super-admin'))) {
    const target = isPresident ? '/admin' : getAgentDashboardUrl(effectiveRole);

    const validPaths = [target, `${target}/`];
    const hasSubRoute = location.pathname.split('/').length > 2;

    if (!location.pathname.startsWith(target) && !location.pathname.startsWith('/dashboard')) {
      console.log('📍 Correction route:', location.pathname, '->', target);
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
    path.startsWith('/admin') ||
    path.startsWith('/super-admin') ||
    path.startsWith('/agent');

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

              {/* Redirections des anciennes routes /dashboard/* vers /{role}/* */}
              <Route path="/dashboard/super-admin/*" element={<Navigate to="/super-admin" replace />} />
              <Route path="/dashboard/admin/*" element={<Navigate to="/admin" replace />} />
              <Route path="/dashboard/agent/*" element={<Navigate to="/agent" replace />} />
              <Route path="/dashboard/user/*" element={<Navigate to="/user" replace />} />

              {/* Routes User - Citoyen */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Routes Agent - Avec sous-routes pour extensibilité future */}
              <Route
                path="/agent"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de l'espace agent..." />}>
                      <AgentDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Routes Agents Spécialisés */}
              <Route
                path="/agent/anticorruption"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de l'espace Anti-Corruption..." />}>
                      <SpecializedAgentDashboard agentRole="agent_anticorruption" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent/justice"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de l'espace Justice..." />}>
                      <SpecializedAgentDashboard agentRole="agent_justice" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent/interior"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de l'espace Intérieur..." />}>
                      <SpecializedAgentDashboard agentRole="agent_interior" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent/defense"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de l'espace Défense..." />}>
                      <SpecializedAgentDashboard agentRole="agent_defense" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent/dgss"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de l'espace DGSS..." />}>
                      <SpecializedAgentDashboard agentRole="sub_admin_dgss" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent/dgr"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de l'espace DGR..." />}>
                      <SpecializedAgentDashboard agentRole="sub_admin_dgr" />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Routes Admin/Sub-Admin - Avec sous-routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de l'espace admin..." />}>
                      <AdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Routes Super Admin - Avec sous-routes dédiées */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement du super admin..." />}>
                      <SuperAdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/system"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement du système..." />}>
                      <SuperAdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/users"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement des utilisateurs..." />}>
                      <SuperAdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/project"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement du projet..." />}>
                      <SuperAdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/xr7"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement du module XR-7..." />}>
                      <SuperAdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/visibility"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de la visibilité..." />}>
                      <SuperAdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/visibilite"
                element={<Navigate to="/super-admin/visibility" replace />}
              />
              <Route
                path="/super-admin/config"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback fullScreen message="Chargement de la configuration..." />}>
                      <SuperAdminDashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="/statistiques" element={<Statistics />} />
              <Route path="/suivi" element={<TrackReport />} />
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
