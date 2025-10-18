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
   * Authentification Super Admin sécurisée
   * Utilise le MÊME système que les autres utilisateurs : Numéro + PIN
   */
  /**
   * Authentification du compte Super Admin
   * Recherche le compte dans la base de données et crée une session locale
   */
  async authenticateSuperAdmin(pin: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('🔐 Démarrage authentification Super Admin...');
      
      // Identifiants du compte Super Admin (configurés dans la base)
      const superAdminPhone = '+33661002616';
      const superAdminEmail = '33661002616@ndjobi.com';
      const expectedPin = '999999'; // PIN configuré

      // Étape 1 : Vérifier le PIN
      console.log('🔍 Vérification du PIN...');
      if (pin !== expectedPin) {
        console.log('❌ PIN incorrect:', pin);
        return { success: false, error: 'Code PIN incorrect' };
      }
      console.log('✅ PIN correct');

      // Étape 2 : Rechercher le compte dans auth.users via profiles
      console.log('🔍 Recherche du profil Super Admin...');
      console.log('   - Email:', superAdminEmail);
      console.log('   - Téléphone:', superAdminPhone);
      
      // Recherche par email
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, organization')
        .eq('email', superAdminEmail)
        .maybeSingle();

      console.log('📊 Résultat recherche par email:', { 
        profileData, 
        profileError,
        profileDataType: typeof profileData,
        profileDataNull: profileData === null,
        profileDataUndefined: profileData === undefined
      });

      // Si pas trouvé, recherche par téléphone
      if (!profileData && !profileError) {
        console.log('🔍 Tentative de recherche par téléphone...');
        const phoneResult = await supabase
          .from('profiles')
          .select('id, email, full_name, phone, organization')
          .eq('phone', superAdminPhone)
          .maybeSingle();

        profileData = phoneResult.data;
        profileError = phoneResult.error;
        
        console.log('📊 Résultat recherche par téléphone:', { 
          profileData, 
          profileError,
          profileDataType: typeof profileData,
          profileDataNull: profileData === null,
          profileDataUndefined: profileData === undefined
        });
      }
      
      // Debug supplémentaire : essayer une recherche sans filtre pour voir ce qui existe
      console.log('🔍 Debug: Recherche de TOUS les profils pour diagnostic...');
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, email, phone, full_name')
        .limit(10);
      
      console.log('📊 Tous les profils (10 premiers):', { 
        count: allProfiles?.length || 0,
        profiles: allProfiles,
        error: allError
      });

      if (profileError) {
        console.error('❌ Erreur lors de la recherche du profil:', profileError);
        return { success: false, error: 'Erreur base de données' };
      }

      if (!profileData) {
        console.error('❌ Profil Super Admin introuvable');
        console.error('💡 Veuillez exécuter le script CREER-PROFIL-SUPER-ADMIN.sql');
        return { 
          success: false, 
          error: 'Compte Super Admin introuvable - Veuillez contacter l\'administrateur système' 
        };
      }

      console.log('✅ Profil trouvé:', {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        phone: profileData.phone
      });

      // Étape 3 : Vérifier le rôle super_admin
      console.log('🔍 Vérification du rôle...');
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profileData.id)
        .maybeSingle();

      console.log('📊 Résultat vérification rôle:', { roleData, roleError });

      if (roleError) {
        console.error('❌ Erreur lors de la vérification du rôle:', roleError);
        return { success: false, error: 'Erreur vérification rôle' };
      }

      if (!roleData || roleData.role !== 'super_admin') {
        console.error('❌ Rôle super_admin non attribué à ce compte');
        console.error('💡 Rôle actuel:', roleData?.role || 'aucun');
        return { success: false, error: 'Accès non autorisé' };
      }

      console.log('✅ Rôle super_admin confirmé');

      // Étape 4 : Créer la session locale
      console.log('🔧 Création de la session locale...');
      
      this.currentUser = {
        id: profileData.id,
        email: profileData.email || superAdminEmail,
        phone: profileData.phone || superAdminPhone,
        user_metadata: {
          full_name: profileData.full_name || 'Super Administrateur',
          phone: profileData.phone || superAdminPhone,
          organization: profileData.organization || 'Administration Système'
        }
      };
      
      this.currentRole = 'super_admin';
      this.sessionToken = `super_admin_token_${Date.now()}`;

      // Sauvegarder la session
      await this.saveSession(this.currentUser, this.currentRole, this.sessionToken);

      console.log('✅ Session Super Admin créée avec succès');
      console.log('📊 Session:', {
        user_id: this.currentUser.id,
        role: this.currentRole,
        email: this.currentUser.email
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de l\'authentification Super Admin:', error);
      return { 
        success: false, 
        error: 'Erreur système - Veuillez réessayer' 
      };
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
