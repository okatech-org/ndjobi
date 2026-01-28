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
    let isMounted = true;
    
    const initAuth = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('⏱️ Timeout auth init');
          setIsLoading(false);
        }
      }, 3000);

      try {
        // Vérifier d'abord la session Super Admin (localStorage)
        const superAdminSessionData = localStorage.getItem('ndjobi_super_admin_session');
        if (superAdminSessionData) {
          try {
            const superAdminSession = JSON.parse(superAdminSessionData);
            
            if (isMounted) {
              setUser(superAdminSession.user);
              setRole(superAdminSession.role);
              
              if (authService && typeof authService === 'object') {
                (authService as any).currentUser = superAdminSession.user;
                (authService as any).currentRole = superAdminSession.role;
              }
            }
            
            clearTimeout(timeoutId);
            if (isMounted) {
              setIsLoading(false);
            }
            return;
          } catch (err) {
            console.error('Erreur parsing session:', err);
          }
        }
        
        const demoSessionData = localStorage.getItem('ndjobi_demo_session');
        if (demoSessionData) {
          try {
            const demoSession = JSON.parse(demoSessionData);
            
            if (isMounted) {
              setUser(demoSession.user);
              setRole(demoSession.role);
              
              if (authService && typeof authService === 'object') {
                (authService as any).currentUser = demoSession.user;
                (authService as any).currentRole = demoSession.role;
              }
            }
            
            clearTimeout(timeoutId);
            if (isMounted) {
              setIsLoading(false);
            }
            return;
          } catch (err) {
            console.error('Erreur parsing session:', err);
          }
        }
        
        // Sinon, vérifier l'authentification normale
        const isAuth = authService.isAuthenticated();
        
        if (isAuth) {
          const user = authService.getCurrentUser();
          const role = authService.getCurrentRole();
          if (isMounted) {
            setUser(user);
            setRole(role);
          }
        } else {
          // Vérifier sessionStorage
          const sessionData = sessionStorage.getItem('ndjobi_session');
          if (sessionData) {
            const { userId, role: sessionRole } = JSON.parse(sessionData);
            await authService.authenticateWithSession(userId, sessionRole);
            if (isMounted) {
              setUser(authService.getCurrentUser());
              setRole(authService.getCurrentRole());
            }
          }
        }
      } catch (err) {
        console.error('❌ Erreur initialisation auth:', err);
        if (isMounted) {
          setError('Erreur lors de l\'initialisation de l\'authentification');
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const handleDemoSessionChange = () => {
      if (isMounted) {
        initAuth();
      }
    };

    // Écouteur global pour la déconnexion (notamment depuis le menu mobile)
    const handleGlobalSignOut = async () => {
      console.log('🚪 [useAuth] Événement global signout reçu');
      if (isMounted) {
        setUser(null);
        setRole(null);
        await authService.signOut();
      }
    };

    window.addEventListener('ndjobi:demo:session:changed', handleDemoSessionChange);
    window.addEventListener('ndjobi:signout', handleGlobalSignOut);

    return () => {
      isMounted = false;
      window.removeEventListener('ndjobi:demo:session:changed', handleDemoSessionChange);
      window.removeEventListener('ndjobi:signout', handleGlobalSignOut);
    };
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
    code: string,
    phoneNumber?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.authenticateSuperAdmin(code, phoneNumber);

      console.log({result})
      
      if (result.success) {
        setUser(authService.getCurrentUser());
        setRole('super_admin');
        
        // Rediriger directement vers le dashboard super admin
        navigate('/super-admin');
        
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
   * Réinitialise le PIN du Super Admin après vérification OTP
   */
  const resetSuperAdminPin = useCallback(async (
    newPin: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.resetSuperAdminPin(newPin);
      
      if (result.success) {
        setUser(authService.getCurrentUser());
        setRole(authService.getCurrentRole());
      } else {
        setError(result.error || null);
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'Erreur lors de la réinitialisation du PIN';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Déconnexion robuste
   */
  const signOut = useCallback(async () => {
    console.log('🚪 [useAuth] Déconnexion demandée');
    setIsLoading(true);
    
    try {
      // Nettoyer l'état React immédiatement
      setUser(null);
      setRole(null);
      setError(null);
      
      // Appeler le service de déconnexion
      await authService.signOut();
      // La redirection est gérée dans authService
    } catch (err) {
      console.error('❌ Erreur lors de la déconnexion:', err);
      // Forcer la redirection même en cas d'erreur
      window.location.replace('/auth');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    resetSuperAdminPin,
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
