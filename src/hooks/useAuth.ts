// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth/authService';
import { UserRole } from '@/types/auth';

/**
 * Hook personnalisé pour la gestion de l'authentification
 * Version 2.0 - Sans comptes démo, avec état global propre
 */
export function useAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialise l'état d'authentification au chargement
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Timeout de sécurité pour éviter les boucles infinies
      const timeoutId = setTimeout(() => {
        console.warn('⏱️ Timeout auth init - force loading=false');
        setIsLoading(false);
      }, 3000);

      try {
        // Vérifier si l'utilisateur est déjà authentifié
        const isAuth = authService.isAuthenticated();
        console.log('🔐 useAuth init - isAuthenticated:', isAuth);
        
        if (isAuth) {
          const user = authService.getCurrentUser();
          const role = authService.getCurrentRole();
          console.log('✅ Session restaurée - user:', user?.id, 'role:', role);
          setUser(user);
          setRole(role);
        } else {
          // Vérifier la session dans sessionStorage
          const sessionData = sessionStorage.getItem('ndjobi_session');
          if (sessionData) {
            const { userId, role: sessionRole } = JSON.parse(sessionData);
            console.log('🔄 Restauration session depuis storage - userId:', userId, 'role:', sessionRole);
            // Recharger les données utilisateur depuis Supabase
            await authService.authenticateWithSession(userId, sessionRole);
            setUser(authService.getCurrentUser());
            setRole(authService.getCurrentRole());
          } else {
            // Vérifier la session démo dans localStorage
            const demoSessionData = localStorage.getItem('ndjobi_demo_session');
            if (demoSessionData) {
              try {
                const demoSession = JSON.parse(demoSessionData);
                console.log('🎭 Session démo détectée - role:', demoSession.role);
                setUser(demoSession.user);
                setRole(demoSession.role);
                // FORCER la session pour éviter les conflits
                if (demoSession.role === 'super_admin') {
                  console.log('🔧 Session Super Admin forcée - accès garanti');
                }
              } catch (err) {
                console.error('❌ Erreur parsing session démo:', err);
                console.log('❌ Aucune session trouvée');
              }
            } else {
              console.log('❌ Aucune session trouvée');
            }
          }
        }
      } catch (err) {
        console.error('❌ Erreur initialisation auth:', err);
        setError('Erreur lors de l\'initialisation de l\'authentification');
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
        console.log('✅ useAuth init terminé - loading=false');
      }
    };

    initAuth();
  }, []);

  /**
   * Connexion avec téléphone et PIN
   */
  const signInWithPhone = useCallback(async (
    phone: string, 
    pin: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.authenticateWithPhone(phone, pin);
      
      if (result.success) {
        setUser(result.user);
        setRole(result.role!);
        
        // Rediriger vers le dashboard approprié
        const dashboardPath = authService.getDashboardPath();
        navigate(dashboardPath);
        
        return { success: true };
      } else {
        setError(result.error || 'Échec de l\'authentification');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Connexion Super Admin sécurisée
   */
  const signInSuperAdmin = useCallback(async (
    code: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.authenticateSuperAdmin(code);

      console.log({result})
      
      if (result.success) {
        setUser(authService.getCurrentUser());
        setRole('super_admin');
        
        // Rediriger directement vers le dashboard super admin
        navigate('/dashboard/super-admin');
        
        return { success: true };
      } else {
        setError(result.error || 'Code invalide');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de l\'authentification Super Admin';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Déconnexion
   */
  const signOut = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await authService.signOut();
      setUser(null);
      setRole(null);
      setError(null);
      // La redirection est gérée dans authService
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      // Forcer le nettoyage même en cas d'erreur
      setUser(null);
      setRole(null);
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Vérifie les permissions pour un rôle donné
   */
  const hasPermission = useCallback((requiredRole: UserRole): boolean => {
    return authService.hasPermission(requiredRole);
  }, []);

  /**
   * Récupère le chemin du dashboard selon le rôle
   */
  const getDashboardPath = useCallback((): string => {
    return authService.getDashboardPath();
  }, []);

  /**
   * Réinitialise l'erreur
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // État
    user,
    role,
    isLoading,
    error,
    isAuthenticated: !!user && !!role,
    
    // Actions
    signInWithPhone,
    signInSuperAdmin,
    signOut,
    
    // Utilitaires
    hasPermission,
    getDashboardPath,
    clearError,
  };
}

/**
 * Hook pour protéger les routes selon le rôle
 */
export function useRequireAuth(requiredRole?: UserRole) {
  const { isAuthenticated, role, isLoading, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Rediriger vers la page de connexion si non authentifié
        navigate('/auth');
      } else if (requiredRole && !hasPermission(requiredRole)) {
        // Rediriger vers le dashboard approprié si pas les permissions
        const dashboardPath = authService.getDashboardPath();
        navigate(dashboardPath);
      }
    }
  }, [isAuthenticated, role, requiredRole, isLoading, hasPermission, navigate]);

  return { isAuthorized: requiredRole ? hasPermission(requiredRole) : isAuthenticated };
}

export function resetGlobalAuthState(): void {
  try {
    authService.clearSession();
  } catch {}
  try {
    window.dispatchEvent(new Event('ndjobi:auth:reset'));
  } catch {}
}
