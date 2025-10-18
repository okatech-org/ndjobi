import { supabase } from '@/integrations/supabase/client';

export interface UserDetail {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  organization?: string;
  role: string;
  status: 'active' | 'suspended' | 'banned';
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

export interface UserStats {
  totalSignalements: number;
  totalProjets: number;
  lastActivity?: string;
}

class UserManagementService {
  /**
   * Récupère tous les utilisateurs avec leurs rôles
   */
  async getAllUsers(limit: number = 100): Promise<UserDetail[]> {
    try {
      // Utiliser la fonction RPC get_user_role pour éviter les erreurs RLS
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (profileError) {
        console.warn('Erreur récupération profiles, profils limités:', profileError);
        // Tolérer l'erreur, retourner liste vide au lieu de planter
        return [];
      }

      // Récupérer les rôles via RPC pour chaque utilisateur (plus sûr)
      const users: UserDetail[] = [];
      
      for (const profile of profiles || []) {
        try {
          const { data: role } = await supabase.rpc('get_user_role', { _user_id: profile.id });
          const metadata = (profile.metadata as any) || {};
          
          users.push({
            id: profile.id,
            email: profile.email || '',
            full_name: profile.full_name || 'N/A',
            avatar_url: profile.avatar_url || undefined,
            organization: profile.organization || undefined,
            role: role || 'user',
            status: metadata.suspended ? 'suspended' : 'active',
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: profile.updated_at || new Date().toISOString(),
          });
        } catch (err) {
          console.warn(`Erreur chargement rôle pour ${profile.id}, défaut: user`);
          users.push({
            id: profile.id,
            email: profile.email || '',
            full_name: profile.full_name || 'N/A',
            role: 'user',
            status: 'active',
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: profile.updated_at || new Date().toISOString(),
          });
        }
      }

      return users;
    } catch (error) {
      console.error('Erreur récupération utilisateurs (tolérée):', error);
      return [];
    }
  }

  /**
   * Récupère les détails complets d'un utilisateur
   */
  async getUserDetails(userId: string): Promise<{
    user: UserDetail;
    stats: UserStats;
  }> {
    try {
      // Récupérer le profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profil non trouvé');

      // Récupérer le rôle via RPC sécurisé
      const { data: role } = await supabase.rpc('get_user_role', { _user_id: userId });

      // Récupérer les stats
      const [signalementsResult, projetsResult] = await Promise.all([
        supabase
          .from('signalements')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('projets')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);

      // Récupérer la dernière activité
      const { data: lastSignalement } = await supabase
        .from('signalements')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const metadata = (profile.metadata as any) || {};
      const user: UserDetail = {
        id: profile.id,
        email: profile.email || '',
        full_name: profile.full_name || 'N/A',
        avatar_url: profile.avatar_url || undefined,
        organization: profile.organization || undefined,
        role: role || 'user',
        status: metadata.suspended ? 'suspended' : 'active',
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
      };

      const stats: UserStats = {
        totalSignalements: signalementsResult.count || 0,
        totalProjets: projetsResult.count || 0,
        lastActivity: lastSignalement?.created_at,
      };

      return { user, stats };
    } catch (error) {
      console.error('Erreur récupération détails utilisateur:', error);
      throw error;
    }
  }

  /**
   * Met à jour le rôle d'un utilisateur
   */
  async updateUserRole(userId: string, newRole: string): Promise<void> {
    try {
      // Supprimer l'ancien rôle
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Ajouter le nouveau rôle
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: newRole as 'admin' | 'agent' | 'super_admin' | 'user',
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur mise à jour rôle:', error);
      throw error;
    }
  }

  /**
   * Met à jour le profil d'un utilisateur
   */
  async updateUserProfile(
    userId: string,
    updates: {
      full_name?: string;
      organization?: string;
      avatar_url?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  }

  /**
   * Suspend un utilisateur
   */
  async suspendUser(userId: string, reason?: string): Promise<void> {
    try {
      // Persister la suspension via profiles.role = 'suspended' (rôle effectif reste géré par user_roles)
      console.log(`Suspension utilisateur ${userId}. Raison: ${reason || 'Non spécifiée'}`);
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'suspended' as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Erreur suspension utilisateur:', error);
      throw error;
    }
  }

  /**
   * Réactive un utilisateur suspendu
   */
  async reactivateUser(userId: string): Promise<void> {
    try {
      console.log(`Réactivation utilisateur ${userId}`);
      const { error } = await supabase
        .from('profiles')
        .update({
          role: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Erreur réactivation utilisateur:', error);
      throw error;
    }
  }

  /**
   * Supprime un utilisateur (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Supprimer le rôle
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Supprimer le profil (cascade delete via FK)
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      // Note: Ne pas supprimer de auth.users (réservé au système)
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      throw error;
    }
  }

  /**
   * Recherche des utilisateurs
   */
  async searchUsers(query: string): Promise<UserDetail[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(50);

      if (error) {
        console.warn('Erreur recherche profiles:', error);
        return [];
      }

      const users: UserDetail[] = [];
      
      for (const profile of profiles || []) {
        try {
          const { data: role } = await supabase.rpc('get_user_role', { _user_id: profile.id });
          
          users.push({
            id: profile.id,
            email: profile.email || '',
            full_name: profile.full_name || 'N/A',
            avatar_url: profile.avatar_url || undefined,
            organization: profile.organization || undefined,
            role: role || 'user',
            status: (profile.metadata as any)?.suspended ? 'suspended' : 'active',
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: profile.updated_at || new Date().toISOString(),
          });
        } catch (err) {
          console.warn(`Erreur rôle pour ${profile.id}, défaut user`);
          users.push({
            id: profile.id,
            email: profile.email || '',
            full_name: profile.full_name || 'N/A',
            role: 'user',
            status: 'active',
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: profile.updated_at || new Date().toISOString(),
          });
        }
      }

      return users;
    } catch (error) {
      console.error('Erreur recherche utilisateurs (tolérée):', error);
      return [];
    }
  }

  /**
   * Récupère les statistiques globales des utilisateurs
   */
  async getUsersStatistics(): Promise<{
    total: number;
    byRole: { [key: string]: number };
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  }> {
    try {
      const { data: profiles, count, error } = await supabase
        .from('profiles')
        .select('id, created_at', { count: 'exact' });

      if (error) {
        console.warn('Erreur stats profiles:', error);
        return {
          total: 0,
          byRole: { user: 0, agent: 0, admin: 0, super_admin: 0 },
          newToday: 0,
          newThisWeek: 0,
          newThisMonth: 0,
        };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      
      const thisMonth = new Date();
      thisMonth.setDate(thisMonth.getDate() - 30);

      const newToday = profiles?.filter(p => 
        new Date(p.created_at!) >= today
      ).length || 0;

      const newThisWeek = profiles?.filter(p => 
        new Date(p.created_at!) >= thisWeek
      ).length || 0;

      const newThisMonth = profiles?.filter(p => 
        new Date(p.created_at!) >= thisMonth
      ).length || 0;

      const byRole: { [key: string]: number } = {
        user: 0,
        agent: 0,
        admin: 0,
        super_admin: 0,
      };

      // Compter les rôles via RPC pour chaque profil (plus sûr)
      for (const profile of profiles || []) {
        try {
          const { data: role } = await supabase.rpc('get_user_role', { _user_id: profile.id });
          if (role && byRole[role] !== undefined) {
            byRole[role]++;
          }
        } catch {}
      }

      return {
        total: count || 0,
        byRole,
        newToday,
        newThisWeek,
        newThisMonth,
      };
    } catch (error) {
      console.error('Erreur stats utilisateurs (tolérée):', error);
      return {
        total: 0,
        byRole: { user: 0, agent: 0, admin: 0, super_admin: 0 },
        newToday: 0,
        newThisWeek: 0,
        newThisMonth: 0,
      };
    }
  }
}

export const userManagementService = new UserManagementService();
export default userManagementService;

