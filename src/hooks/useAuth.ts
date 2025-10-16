import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserProfile } from '@/types/auth';
import { deviceIdentityService } from '@/services/deviceIdentity';
import { userPersistence } from '@/services/userPersistence';
import { superAdminAuthService } from '@/services/superAdminAuth';
import { demoAccountService } from '@/services/demoAccountService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitializedRef = useRef(false);

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

    const initAuth = async () => {
      if (hasInitializedRef.current) {
        console.log('⚠️ useAuth déjà initialisé, skip');
        return;
      }
      hasInitializedRef.current = true;
      console.log('🔄 Initialisation useAuth...');

      try {
        timeoutId = setTimeout(() => {
          console.warn('⏰ Timeout 5s atteint, forcer isLoading=false');
          if (mounted) {
            setIsLoading(false);
          }
        }, 5000);

        // Vérifier s'il y a une session locale (démo ou super admin)
        const localDemoSession = demoAccountService.getLocalSession();
        if (localDemoSession) {
          console.log('📱 Session locale démo détectée:', localDemoSession.role);
          if (mounted) {
            setUser(localDemoSession.user);
            setSession(null);
            setProfile(localDemoSession.profile);
            setRole(localDemoSession.role);
            setIsLoading(false);
          }
          clearTimeout(timeoutId);
          console.log('✅ Session locale chargée, isLoading=false');
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
          
          if (mounted) {
            setUser(mockSuperAdminUser);
            setSession(null);
            setProfile({
              id: 'local-super-admin',
              email: '24177777000@ndjobi.com',
              full_name: 'Super Administrateur (Local)',
              created_at: new Date().toISOString()
            } as UserProfile);
            setRole('super_admin' as UserRole);
            setIsLoading(false);
          }
          clearTimeout(timeoutId);
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
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('👤 Chargement données utilisateur:', currentSession.user.id);
          await fetchUserData(currentSession.user.id);
        } else {
          console.log('❌ Aucun utilisateur connecté');
          setProfile(null);
          setRole(null);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setRole(null);
        }
      } finally {
        if (mounted) {
          console.log('✅ useAuth initialisé, isLoading=false');
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
      
      // Réinitialiser le flag d'initialisation
      hasInitializedRef.current = false;
      
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
