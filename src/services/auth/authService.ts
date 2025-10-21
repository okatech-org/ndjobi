import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/auth';
import { deviceIdentityService } from '@/services/deviceIdentity';
import { defaultAnonymousAccountService } from '@/services/defaultAnonymousAccount';

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
   * Authentification Super Admin avec Supabase Auth (VRAI compte, pas demo)
   * Utilise le MÊME système que les autres utilisateurs : Numéro + PIN
   */
  async authenticateSuperAdmin(pin: string, phoneNumber?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Utiliser le numéro de téléphone si fourni, sinon utiliser l'email par défaut
      const superAdminEmail = phoneNumber ? 
        `${phoneNumber.replace(/\D/g, '')}@ndjobi.com` : 
        '33661002616@ndjobi.com';
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: superAdminEmail,
        password: pin,
      });

      if (error) {
        return { success: false, error: 'Code PIN incorrect' };
      }

      if (!data.user) {
        return { success: false, error: 'Authentification échouée' };
      }

      const role = await this.getUserRole(data.user.id);
      
      if (role !== 'super_admin') {
        await this.signOut();
        return { success: false, error: 'Accès non autorisé' };
      }

      await this.saveSession(data.user, 'super_admin', data.session?.access_token);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur système - Veuillez réessayer' 
      };
    }
  }

  /**
   * Réinitialise le PIN du Super Admin après vérification OTP
   */
  async resetSuperAdminPin(newPin: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const superAdminEmail = '33661002616@ndjobi.com';
      
      // On ne peut pas changer le password d'un utilisateur non connecté
      // Solution: Utiliser une Edge Function Supabase avec service_role
      const { data, error } = await supabase.functions.invoke('reset-super-admin-pin', {
        body: {
          email: superAdminEmail,
          newPassword: newPin,
        },
      });

      if (error) {
        return { 
          success: false, 
          error: 'Impossible de réinitialiser le PIN. Veuillez le faire manuellement dans Supabase Auth.' 
        };
      }

      // Tenter de se connecter avec le nouveau PIN
      return await this.authenticateSuperAdmin(newPin);
    } catch (error) {
      return { 
        success: false, 
        error: 'Veuillez réinitialiser le PIN manuellement dans Supabase Auth (Edit user → Password)' 
      };
    }
  }

  /**
   * Récupère le rôle d'un utilisateur depuis la base de données
   */
  private async getUserRole(userId: string): Promise<UserRole> {
    try {
      const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
      if (error || !data) {
        console.warn('Rôle non trouvé via RPC, attribution du rôle par défaut');
        return 'user';
      }
      return data as UserRole;
    } catch (error) {
      console.error('Erreur récupération du rôle via RPC:', error);
      return 'user';
    }
  }

  /**
   * Charge le profil complet de l'utilisateur
   */
  private async loadUserProfile(userId: string) {
    try {
      // Déterminer le rôle via RPC d'abord (évite les RLS récursives)
      const role = await this.getUserRole(userId);
      this.currentRole = role;

      if (role === 'super_admin') {
        // Profil Super Admin via RPC sécurisé
        const { data: saProfile, error: saError } = await supabase.rpc('get_super_admin_profile');
        if (!saError && saProfile) {
          this.currentUser = saProfile;
        } else {
          // Fallback sur les métadonnées du user
          this.currentUser = { id: userId, email: '33661002616@ndjobi.com', full_name: 'Super Administrateur' };
        }
        return;
      }

      // Autres rôles: on tente, mais sans bloquer en cas d'erreur RLS
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        this.currentUser = profile;
      } else {
        this.currentUser = { id: userId };
      }
    } catch (error) {
      console.error('Erreur chargement du profil (tolérée):', error);
      this.currentUser = { id: userId };
    }
  }

  /**
   * Sauvegarde la session de manière sécurisée
   * Utilise sessionStorage pour les utilisateurs normaux
   * Et localStorage pour le Super Admin (persistance après refresh)
   */
  private async saveSession(user: any, role: UserRole, token?: string) {
    this.currentUser = user;
    this.currentRole = role;
    this.sessionToken = token || null;

    // Session data
    const sessionData = {
      userId: user.id,
      role: role,
      timestamp: new Date().toISOString(),
    };

    // Pour les utilisateurs normaux : sessionStorage
    sessionStorage.setItem('ndjobi_session', JSON.stringify(sessionData));
    
    // Pour le Super Admin : localStorage (persistance maximale)
    if (role === 'super_admin') {
      const superAdminSessionData = {
        isSuperAdmin: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        user: user,
        role: role,
      };
      localStorage.setItem('ndjobi_super_admin_session', JSON.stringify(superAdminSessionData));
    }
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
    localStorage.removeItem('ndjobi_super_admin_session');
    
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
          return true;
        }
      }
    } catch (error) {
      console.error('Erreur vérification session:', error);
    }

    // Vérifier la session Super Admin persistée
    try {
      const saData = localStorage.getItem('ndjobi_super_admin_session');
      if (saData) {
        const parsed = JSON.parse(saData);
        const isValid = parsed?.isSuperAdmin === true && typeof parsed?.expiresAt === 'number' && Date.now() < parsed.expiresAt;
        if (isValid) return true;
      }
    } catch {}

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
    // Priorité à la session Super Admin persistée
    try {
      const saData = localStorage.getItem('ndjobi_super_admin_session');
      if (saData) {
        const sa = JSON.parse(saData);
        const isValid = sa?.isSuperAdmin === true && typeof sa?.expiresAt === 'number' && Date.now() < sa.expiresAt;
        if (isValid) {
          return sa.user || { id: 'local-super-admin', email: '33661002616@ndjobi.com' };
        }
      }
    } catch {}

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
    // Priorité au rôle Super Admin si session persistée valide
    try {
      const saData = localStorage.getItem('ndjobi_super_admin_session');
      if (saData) {
        const sa = JSON.parse(saData);
        const isValid = sa?.isSuperAdmin === true && typeof sa?.expiresAt === 'number' && Date.now() < sa.expiresAt;
        if (isValid) return 'super_admin';
      }
    } catch {}

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
        return '/super-admin';
      case 'admin':
      case 'sub_admin':
        return '/admin';
      case 'agent':
        return '/agent';
      case 'user':
        return '/user';
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
      'sub_admin': 2.5,
      'agent': 2,
      'user': 1,
    };

    if (!effectiveRole) return false;

    return roleHierarchy[effectiveRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Crée une session anonyme par défaut pour les signalements sans compte
   * Utilise le compte "Citoyen Anonyme" créé dans Supabase
   */
  async createDefaultAnonymousSession(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Créer une session locale pour le compte anonyme par défaut
      const success = defaultAnonymousAccountService.createAnonymousSession();
      
      if (!success) {
        return { success: false, error: 'Erreur création session anonyme' };
      }

      // Récupérer les informations du compte anonyme
      const anonymousAccount = defaultAnonymousAccountService.getDefaultAnonymousAccount();
      
      // Créer la session dans le service d'authentification
      this.currentUser = {
        id: defaultAnonymousAccountService.getCurrentAnonymousUser()?.email || 'anonymous',
        email: anonymousAccount.email,
        phone: anonymousAccount.phone,
        user_metadata: {
          full_name: anonymousAccount.fullName,
          phone: anonymousAccount.phone,
          organization: anonymousAccount.organization,
          is_anonymous: true,
          session_type: 'anonymous_default'
        }
      };
      
      this.currentRole = 'user';
      this.sessionToken = `anonymous_token_${Date.now()}`;
      
      // Sauvegarder la session
      this.saveSession(this.currentUser, this.currentRole, this.sessionToken);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur création session anonyme par défaut:', error);
      return { success: false, error: 'Erreur système' };
    }
  }

  /**
   * Vérifie si la session actuelle est une session anonyme par défaut
   */
  isDefaultAnonymousSession(): boolean {
    return defaultAnonymousAccountService.hasAnonymousSession();
  }

  /**
   * Récupère les informations du compte anonyme par défaut
   */
  getDefaultAnonymousAccountInfo() {
    return defaultAnonymousAccountService.getDefaultAnonymousAccount();
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
