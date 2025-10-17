import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserProfile } from '@/types/auth';
import { deviceIdentityService } from '@/services/deviceIdentity';
import { userPersistence } from '@/services/userPersistence';
import { superAdminAuthService } from '@/services/superAdminAuth';
import { demoAccountService } from '@/services/demoAccountService';

// État global partagé entre toutes les instances de useAuth
let globalUser: User | null = null;
let globalSession: Session | null = null;
let globalProfile: UserProfile | null = null;
let globalRole: UserRole | null = null;
let globalInitialized = false;
let globalIsLoading = true;

// Fonction pour réinitialiser l'état global (utilisée lors du basculement de compte)
export const resetGlobalAuthState = () => {
  globalUser = null;
  globalSession = null;
  globalProfile = null;
  globalRole = null;
  globalInitialized = false;
  globalIsLoading = true;
  console.log('🔄 État global useAuth réinitialisé');
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(globalUser);
  const [session, setSession] = useState<Session | null>(globalSession);
  const [profile, setProfile] = useState<UserProfile | null>(globalProfile);
  const [role, setRole] = useState<UserRole | null>(globalRole);
  const [isLoading, setIsLoading] = useState(globalIsLoading);

  // Fetch user profile and role
  const fetchUserData = async (userId: string, isNewUser: boolean = false) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch role - use maybeSingle() to handle users without roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (roleError) throw roleError;
      
      // Utiliser le rôle retourné par la base si disponible
      const resolvedRole = roleData?.role || null;
      setRole(resolvedRole as UserRole | null);

      return { profile: profileData, role: resolvedRole };
    } catch (error) {
      console.error('Error fetching user data:', error);
      setProfile(null);
      setRole(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const updateGlobalState = (u: User | null, s: Session | null, p: UserProfile | null, r: UserRole | null, loading: boolean) => {
      globalUser = u;
      globalSession = s;
      globalProfile = p;
      globalRole = r;
      globalIsLoading = loading;
      if (mounted) {
        setUser(u);
        setSession(s);
        setProfile(p);
        setRole(r);
        setIsLoading(loading);
      }
    };

    const initAuth = async () => {
      // Toujours vérifier le localStorage, même si globalInitialized est true
      const localDemoSession = demoAccountService.getLocalSession();
      
      if (globalInitialized) {
        console.log('⚠️ useAuth déjà initialisé globalement, utilisation de l\'état global');
        
        // Si une session locale existe, la charger (peut avoir changé depuis la dernière init)
        if (localDemoSession) {
          console.log('🔄 Session locale trouvée, rechargement dans état global');
          updateGlobalState(localDemoSession.user, null, localDemoSession.profile, localDemoSession.role, false);
          return;
        }
        
        // Si pas de session locale mais l'état global en a une, c'est qu'on a nettoyé le storage
        if (!localDemoSession && globalRole) {
          console.log('🧹 localStorage nettoyé, réinitialisation état global');
          updateGlobalState(null, null, null, null, false);
          return;
        }
        
        updateGlobalState(globalUser, globalSession, globalProfile, globalRole, false);
        return;
      }
      globalInitialized = true;
      console.log('🔄 Initialisation useAuth...');

      try {
        timeoutId = setTimeout(() => {
          console.warn('⏰ Timeout 5s atteint, forcer isLoading=false');
          updateGlobalState(globalUser, globalSession, globalProfile, globalRole, false);
        }, 5000);

        // Note: localDemoSession déjà vérifié au début de initAuth
        if (localDemoSession) {
          console.log('📱 Session locale démo détectée:', localDemoSession.role);
          updateGlobalState(localDemoSession.user, null, localDemoSession.profile, localDemoSession.role, false);
          clearTimeout(timeoutId);
          console.log('✅ Session locale chargée, isLoading=false');
          
          // Redirection automatique vers le dashboard approprié
          if (localDemoSession.role === 'super_admin' && window.location.pathname === '/') {
            console.log('🔄 Redirection automatique vers dashboard super-admin');
            setTimeout(() => {
              window.location.href = '/dashboard/super-admin';
            }, 100);
          }
          
          return;
        }

        // Fallback dev: session Super Admin locale (ancienne méthode, pour compatibilité)
        const hasLocalSuperAdmin = superAdminAuthService.isSuperAdminSessionActive();
        if (hasLocalSuperAdmin) {
          console.log('🔐 Session Super Admin locale détectée');
          const mockSuperAdminUser = {
            id: 'local-super-admin',
            email: '24177777000@ndjobi.com',
            user_metadata: {
              full_name: 'Super Administrateur (Local)',
              is_super_admin: true
            },
            created_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated',
            app_metadata: {},
            confirmed_at: new Date().toISOString()
          } as User;
          
          const superAdminProfile = {
            id: 'local-super-admin',
            email: '24177777000@ndjobi.com',
            full_name: 'Super Administrateur (Local)',
            created_at: new Date().toISOString()
          } as UserProfile;
          
          updateGlobalState(mockSuperAdminUser, null, superAdminProfile, 'super_admin' as UserRole, false);
          clearTimeout(timeoutId);
          console.log('✅ Session Super Admin locale chargée');
          return;
        }

        console.log('🔍 Vérification session Supabase...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (!mounted) {
          console.log('⚠️ Composant démonté, abandon');
          return;
        }

        console.log('📊 Session Supabase:', currentSession ? 'Active' : 'Aucune');
        globalSession = currentSession;
        globalUser = currentSession?.user ?? null;
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }

        if (currentSession?.user) {
          console.log('👤 Chargement données utilisateur:', currentSession.user.id);
          await fetchUserData(currentSession.user.id);
        } else {
          console.log('❌ Aucun utilisateur connecté');
          updateGlobalState(null, null, null, null, false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        updateGlobalState(null, null, null, null, false);
      } finally {
        if (mounted) {
          console.log('✅ useAuth initialisé, isLoading=false');
          globalIsLoading = false;
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchUserData(currentSession.user.id);
        } else {
          setProfile(null);
          setRole(null);
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Nettoyer les états locaux d'abord
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      
      // Réinitialiser le flag d'initialisation global
      globalInitialized = false;
      
      // Nettoyer le device identity
      deviceIdentityService.clearDeviceData();
      
      // Nettoyer les données PWA
      userPersistence.clearStoredUser();
      
      // Nettoyer les sessions locales
      demoAccountService.clearLocalSession();
      superAdminAuthService.clearSuperAdminSession();
      
      // Nettoyer le localStorage
      localStorage.removeItem('supabase.auth.token');
      
      // Déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    profile,
    role,
    isLoading,
    signOut,
  };
};
