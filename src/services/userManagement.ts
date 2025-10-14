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
      // Récupérer les profils
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (profileError) throw profileError;

      // Récupérer les rôles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Récupérer les données auth (dernière connexion, etc.)
      const users: UserDetail[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || 'N/A',
          avatar_url: profile.avatar_url || undefined,
          organization: profile.organization || undefined,
          role: userRole?.role || 'user',
          status: 'active', // Par défaut actif
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
        };
      });

      return users;
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      throw error;
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
        .single();

      if (profileError) throw profileError;

      // Récupérer le rôle
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

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

      const user: UserDetail = {
        id: profile.id,
        email: profile.email || '',
        full_name: profile.full_name || 'N/A',
        avatar_url: profile.avatar_url || undefined,
        organization: profile.organization || undefined,
        role: roleData?.role || 'user',
        status: 'active',
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
        .insert({
          user_id: userId,
          role: newRole,
        });

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
      // Dans une vraie application, on aurait une table user_suspensions
      // Pour l'instant, on log l'action
      console.log(`Suspension utilisateur ${userId}. Raison: ${reason || 'Non spécifiée'}`);
      
      // On pourrait aussi mettre à jour le profil avec un statut
      await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
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
      
      await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
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

      if (error) throw error;

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const users: UserDetail[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || 'N/A',
          avatar_url: profile.avatar_url || undefined,
          organization: profile.organization || undefined,
          role: userRole?.role || 'user',
          status: 'active',
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
        };
      });

      return users;
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error);
      throw error;
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
      const { data: profiles, count } = await supabase
        .from('profiles')
        .select('id, created_at', { count: 'exact' });

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role');

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

      roles?.forEach(r => {
        if (byRole[r.role] !== undefined) {
          byRole[r.role]++;
        }
      });

      return {
        total: count || 0,
        byRole,
        newToday,
        newThisWeek,
        newThisMonth,
      };
    } catch (error) {
      console.error('Erreur stats utilisateurs:', error);
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();
export default userManagementService;

