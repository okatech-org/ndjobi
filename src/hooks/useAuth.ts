import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserProfile } from '@/types/auth';
import { deviceIdentityService } from '@/services/deviceIdentity';
import { userPersistence } from '@/services/userPersistence';
import { superAdminAuthService } from '@/services/superAdminAuth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and role
  const fetchUserData = async (userId: string) => {
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
      try {
        timeoutId = setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 5000);

        // Fallback dev: session Super Admin locale (sans Supabase)
        const hasLocalSuperAdmin = superAdminAuthService.isSuperAdminSessionActive();
        if (hasLocalSuperAdmin) {
          // Créer un utilisateur fictif pour la session locale Super Admin
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
          
          setUser(mockSuperAdminUser);
          setSession(null);
          setProfile({
            id: 'local-super-admin',
            email: '24177777000@ndjobi.com',
            full_name: 'Super Administrateur (Local)',
            created_at: new Date().toISOString()
          } as UserProfile);
          setRole('super_admin' as UserRole);
          clearTimeout(timeoutId);
          setIsLoading(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);
        
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchUserData(currentSession.user.id);
        } else {
          setProfile(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setRole(null);
        }
      } finally {
        if (mounted) {
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
          const isNewUser = event === 'SIGNED_IN' && currentSession.user.created_at === currentSession.user.last_sign_in_at;
          await fetchUserData(currentSession.user.id, isNewUser);
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
      
      // Nettoyer le device identity
      deviceIdentityService.clearDeviceData();
      
      // Nettoyer les données PWA
      userPersistence.clearStoredUser();
      
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
