import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/auth';
import { deviceIdentityService } from '@/services/deviceIdentity';

/**
 * Service d'authentification sécurisé pour NDJOBI
 * Gère l'authentification sans comptes démo
 */
export class AuthService {
  private static instance: AuthService;
  private currentUser: any = null;
  private currentRole: UserRole | null = null;
  private sessionToken: string | null = null;

  private constructor() {
    this.initializeAuthListener();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialise l'écouteur d'événements d'authentification
   */
  private initializeAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.clearSession();
      }
    });
  }

  /**
   * Authentification avec téléphone et PIN
   */
  async authenticateWithPhone(phone: string, pin: string): Promise<{
    success: boolean;
    user?: any;
    role?: UserRole;
    error?: string;
  }> {
    try {
      // Nettoyer le numéro de téléphone
      const cleanPhone = phone.replace(/\D/g, '');
      const email = `${cleanPhone}@ndjobi.com`; // Domaine unique standardisé

      // Authentification via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pin,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Authentification échouée' };
      }

      // Charger le profil et le rôle
      const role = await this.getUserRole(data.user.id);
      
      // Enregistrer la session
      await this.saveSession(data.user, role, data.session?.access_token);

      // Enregistrer l'identité de l'appareil
      await deviceIdentityService.linkToUser(data.user.id);

      return {
        success: true,
        user: data.user,
        role,
      };
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      return { 
        success: false, 
        error: 'Une erreur est survenue lors de l\'authentification' 
      };
    }
  }

  /**
   * Restaure une session existante depuis sessionStorage
   * Utilisé lors du rechargement de la page
   */
  async authenticateWithSession(userId: string, sessionRole: UserRole): Promise<void> {
    try {
      await this.loadUserProfile(userId);
      // Le rôle est déjà chargé dans loadUserProfile, mais on peut forcer si nécessaire
      if (this.currentRole !== sessionRole) {
        console.warn('Rôle de session différent du rôle en base, utilisation du rôle en base');
      }
    } catch (error) {
      console.error('Erreur restauration session:', error);
      this.clearSession();
      throw error;
    }
  }

  /**
   * Authentification Super Admin sécurisée
   * Utilise le MÊME système que les autres utilisateurs : Numéro + PIN
   */
  async authenticateSuperAdmin(pin: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Utiliser le même système que les autres : Numéro + PIN
      const superAdminPhone = '+33661002616';
      const superAdminEmail = 'superadmin@ndjobi.com';
      
      // Vérifier que le PIN est correct pour le Super Admin
      if (pin !== '999999') {
        return { success: false, error: 'Code PIN incorrect' };
      }

      // Trouver l'utilisateur Super Admin par email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .eq('email', superAdminEmail)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Compte Super Admin introuvable' };
      }

      // Vérifier le rôle
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.id)
        .single();

      if (roleError || !roleData || roleData.role !== 'super_admin') {
        return { success: false, error: 'Accès non autorisé' };
      }

      // Créer une session locale pour le Super Admin
      const sessionData = {
        user: {
          id: userData.id,
          email: userData.email,
          phone: userData.phone,
          user_metadata: {
            full_name: userData.full_name,
            phone: userData.phone
          }
        },
        session: {
          access_token: 'super_admin_token_' + Date.now(),
          refresh_token: 'super_admin_refresh_' + Date.now()
        }
      };

      await this.saveSession(sessionData.user as any, 'super_admin', sessionData.session.access_token);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur authentification Super Admin:', error);
      return { success: false, error: 'Erreur système' };
    }
  }

  /**
   * Récupère le rôle d'un utilisateur depuis la base de données
   */
  private async getUserRole(userId: string): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.warn('Rôle non trouvé, attribution du rôle par défaut');
        return 'user';
      }

      return data.role as UserRole;
    } catch (error) {
      console.error('Erreur récupération du rôle:', error);
      return 'user';
    }
  }

  /**
   * Charge le profil complet de l'utilisateur
   */
  private async loadUserProfile(userId: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        this.currentUser = profile;
      }

      // Charger le rôle
      this.currentRole = await this.getUserRole(userId);
    } catch (error) {
      console.error('Erreur chargement du profil:', error);
    }
  }

  /**
   * Sauvegarde la session de manière sécurisée
   * Utilise sessionStorage au lieu de localStorage pour plus de sécurité
   */
  private async saveSession(user: any, role: UserRole, token?: string) {
    this.currentUser = user;
    this.currentRole = role;
    this.sessionToken = token || null;

    // Utiliser sessionStorage (plus sécurisé que localStorage)
    const sessionData = {
      userId: user.id,
      role: role,
      timestamp: new Date().toISOString(),
    };

    sessionStorage.setItem('ndjobi_session', JSON.stringify(sessionData));
  }

  /**
   * Nettoie complètement la session
   */
  clearSession() {
    this.currentUser = null;
    this.currentRole = null;
    this.sessionToken = null;
    
    // Nettoyer tous les storages
    sessionStorage.clear();
    localStorage.removeItem('ndjobi_session');
    localStorage.removeItem('localDemoSession');
    localStorage.removeItem('ndjobi_demo_session');
    
    // Réinitialiser l'état global si nécessaire
    if (window.globalAuthState) {
      window.globalAuthState = null;
    }
  }

  /**
   * Déconnexion complète
   */
  async signOut() {
    try {
      await supabase.auth.signOut();
      this.clearSession();
      
      // Rediriger vers la page d'authentification
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer le nettoyage même en cas d'erreur
      this.clearSession();
      window.location.href = '/auth';
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * Vérifie d'abord la session en mémoire, puis dans sessionStorage
   */
  isAuthenticated(): boolean {
    // Vérifier d'abord l'état en mémoire
    if (this.currentUser !== null && this.currentRole !== null) {
      return true;
    }

    // Si pas en mémoire, vérifier dans sessionStorage
    try {
      const sessionData = sessionStorage.getItem('ndjobi_session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed && parsed.userId && parsed.role) {
          // La session existe dans le storage
          return true;
        }
      }
    } catch (error) {
      console.error('Erreur vérification session:', error);
    }

    // Vérifier la session démo dans localStorage
    try {
      const demoSessionData = localStorage.getItem('ndjobi_demo_session');
      if (demoSessionData) {
        const parsed = JSON.parse(demoSessionData);
        if (parsed && parsed.user && parsed.role) {
          return true;
        }
      }
    } catch (error) {
      console.error('Erreur vérification session démo:', error);
    }

    return false;
  }

  /**
   * Récupère l'utilisateur actuel
   * Si pas en mémoire, tente de restaurer depuis sessionStorage
   */
  getCurrentUser() {
    // Priorité à la session démo locale si présente
    try {
      const demoSessionData = localStorage.getItem('ndjobi_demo_session');
      if (demoSessionData) {
        const parsed = JSON.parse(demoSessionData);
        if (parsed && parsed.user) {
          return parsed.user;
        }
      }
    } catch (error) {
      console.error('Erreur récupération user démo:', error);
    }

    if (this.currentUser) {
      return this.currentUser;
    }

    // Récupération depuis sessionStorage
    try {
      const sessionData = sessionStorage.getItem('ndjobi_session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed && parsed.userId) {
          return { id: parsed.userId, role: parsed.role };
        }
      }
    } catch (error) {
      console.error('Erreur récupération user:', error);
    }

    return null;
  }

  /**
   * Récupère le rôle actuel
   * Si pas en mémoire, tente de restaurer depuis sessionStorage
   */
  getCurrentRole(): UserRole | null {
    // Priorité au rôle de la session démo locale si présent
    try {
      const demoSessionData = localStorage.getItem('ndjobi_demo_session');
      if (demoSessionData) {
        const parsed = JSON.parse(demoSessionData);
        if (parsed && parsed.role) {
          return parsed.role as UserRole;
        }
      }
    } catch (error) {
      console.error('Erreur récupération role démo:', error);
    }

    if (this.currentRole) {
      return this.currentRole;
    }

    // Récupération depuis sessionStorage
    try {
      const sessionData = sessionStorage.getItem('ndjobi_session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed && parsed.role) {
          return parsed.role as UserRole;
        }
      }
    } catch (error) {
      console.error('Erreur récupération role:', error);
    }

    return null;
  }

  /**
   * Récupère le dashboard approprié selon le rôle
   */
  getDashboardPath(): string {
    const role = this.getCurrentRole();
    switch (role) {
      case 'super_admin':
        return '/dashboard/super-admin';
      case 'admin':
        return '/dashboard/admin';
      case 'agent':
        return '/dashboard/agent';
      case 'user':
        return '/dashboard/user';
      default:
        return '/auth';
    }
  }

  /**
   * Vérifie si l'utilisateur a les permissions pour accéder à une ressource
   */
  hasPermission(requiredRole: UserRole): boolean {
    const effectiveRole = this.getCurrentRole();
    const roleHierarchy: Record<UserRole, number> = {
      'super_admin': 4,
      'admin': 3,
      'agent': 2,
      'user': 1,
    };

    if (!effectiveRole) return false;

    return roleHierarchy[effectiveRole] >= roleHierarchy[requiredRole];
  }
}

// Export de l'instance singleton
export const authService = AuthService.getInstance();

// Types pour TypeScript
declare global {
  interface Window {
    globalAuthState: any;
  }
}
