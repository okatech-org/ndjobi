import { supabase } from '@/integrations/supabase/client';

export interface SystemAccount {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  pin: string;
  role: 'user' | 'agent' | 'sub_admin' | 'admin' | 'super_admin';
  organization: string;
  description: string;
  created_at: string;
}

class SystemAccountsService {
  private readonly accountsMetadata: Record<string, { pin: string; organization: string; description: string; expectedRole: SystemAccount['role']; fullName: string }> = {
    '+24177888001': {
      pin: '111111',
      organization: 'Présidence de la République',
      description: 'Accès présidentiel - Administration complète',
      expectedRole: 'admin',
      fullName: 'Président'
    },
    '+24177888002': {
      pin: '222222',
      organization: 'DGSS (Direction Générale de la Sécurité d\'État)',
      description: 'Vue sectorielle - Direction spécialisée',
      expectedRole: 'sub_admin',
      fullName: 'Sous-Admin DGSS'
    },
    '+24177888003': {
      pin: '333333',
      organization: 'DGR (Direction Générale du Renseignement)',
      description: 'Vue sectorielle - Direction spécialisée',
      expectedRole: 'sub_admin',
      fullName: 'Sous-Admin DGR'
    },
    '+24177888004': {
      pin: '444444',
      organization: 'Ministère de la Défense',
      description: 'Enquêtes opérationnelles - Terrain',
      expectedRole: 'agent',
      fullName: 'Agent Défense'
    },
    '+24177888005': {
      pin: '555555',
      organization: 'Ministère de la Justice',
      description: 'Enquêtes opérationnelles - Terrain',
      expectedRole: 'agent',
      fullName: 'Agent Justice'
    },
    '+24177888006': {
      pin: '666666',
      organization: 'Commission Anti-Corruption',
      description: 'Enquêtes opérationnelles - Terrain',
      expectedRole: 'agent',
      fullName: 'Agent Anti-Corruption'
    },
    '+24177888007': {
      pin: '777777',
      organization: 'Ministère de l\'Intérieur',
      description: 'Enquêtes opérationnelles - Terrain',
      expectedRole: 'agent',
      fullName: 'Agent Intérieur'
    },
    '+24177888008': {
      pin: '888888',
      organization: 'Citoyen',
      description: 'Signalements citoyens',
      expectedRole: 'user',
      fullName: 'Citoyen Démo'
    },
    '+24177888009': {
      pin: '999999',
      organization: 'Anonyme',
      description: 'Signalements citoyens',
      expectedRole: 'user',
      fullName: 'Citoyen Anonyme'
    }
  };

  async getSystemAccounts(): Promise<SystemAccount[]> {
    console.log('🔍 Récupération des comptes système...');
    
    // APPROCHE HYBRIDE: Tenter la base de données, avec fallback immédiat si échec
    try {
      const accounts = await this.fetchFromDatabase();
      if (accounts.length > 0) {
        console.log(`✅ ${accounts.length} comptes récupérés depuis la base`);
        return accounts;
      }
    } catch (error) {
      console.warn('⚠️ Échec récupération DB, utilisation du fallback:', error);
    }
    
    // Fallback: retourner les comptes prédéfinis
    return this.getFallbackAccounts();
  }

  private async fetchFromDatabase(): Promise<SystemAccount[]> {
    const phones = Object.keys(this.accountsMetadata);
    
    // Requête profiles avec timeout
    const profilesPromise = supabase
      .from('profiles')
      .select('id, email, full_name, phone, created_at')
      .in('phone', phones);
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout DB')), 3000)
    );
    
    const { data: profilesData, error: profilesError } = await Promise.race([
      profilesPromise,
      timeoutPromise
    ]) as Awaited<typeof profilesPromise>;

    if (profilesError) {
      console.error('❌ Erreur profiles:', profilesError);
      throw profilesError;
    }

    if (!profilesData || profilesData.length === 0) {
      console.log('⚠️ Aucun profil trouvé dans la base');
      return [];
    }

    // Requête rôles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', profilesData.map(p => p.id));

    if (rolesError) {
      console.warn('⚠️ Erreur roles (ignorée):', rolesError);
    }

    const rolesMap = new Map(
      rolesData?.map(r => [r.user_id, r.role]) || []
    );

    const accounts: SystemAccount[] = profilesData.map(profile => {
      const phone = profile.phone || '';
      const metadata = this.accountsMetadata[phone] || {
        pin: '000000',
        organization: 'Inconnu',
        description: 'Compte système',
        expectedRole: 'user' as const,
        fullName: 'Utilisateur'
      };
      
      // Utiliser le rôle de la base, ou le rôle attendu par défaut
      const role = (rolesMap.get(profile.id) as SystemAccount['role']) || metadata.expectedRole;

      return {
        id: profile.id,
        email: profile.email || `${phone.replace(/\D/g, '')}@ndjobi.com`,
        full_name: profile.full_name || metadata.fullName,
        phone,
        pin: metadata.pin,
        role,
        organization: metadata.organization,
        description: metadata.description,
        created_at: profile.created_at || new Date().toISOString()
      };
    });

    return accounts.sort((a, b) => {
      const phoneA = parseInt(a.phone.replace(/\D/g, ''));
      const phoneB = parseInt(b.phone.replace(/\D/g, ''));
      return phoneA - phoneB;
    });
  }

  private getFallbackAccounts(): SystemAccount[] {
    console.log('⚠️ Utilisation des comptes de secours (fallback)');
    
    // Générer automatiquement depuis les métadonnées
    const phones = Object.keys(this.accountsMetadata);
    return phones.map((phone, index) => {
      const metadata = this.accountsMetadata[phone];
      const cleanPhone = phone.replace(/\D/g, '');
      
      return {
        id: `fallback-${index + 1}`,
        email: `${cleanPhone}@ndjobi.com`,
        full_name: metadata.fullName,
        phone,
        pin: metadata.pin,
        role: metadata.expectedRole,
        organization: metadata.organization,
        description: metadata.description,
        created_at: new Date().toISOString()
      };
    });
  }

  async refreshAccount(accountId: string): Promise<SystemAccount | null> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, created_at')
        .eq('id', accountId)
        .maybeSingle();

      if (profileError || !profile) {
        console.error('❌ Erreur récupération compte:', profileError);
        return null;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', accountId)
        .maybeSingle();

      const phone = profile.phone || '';
      const metadata = this.accountsMetadata[phone] || {
        pin: '000000',
        organization: 'Inconnu',
        description: 'Compte système',
        expectedRole: 'user' as const,
        fullName: 'Utilisateur'
      };

      return {
        id: profile.id,
        email: profile.email || `${phone.replace(/\D/g, '')}@ndjobi.com`,
        full_name: profile.full_name || metadata.fullName,
        phone,
        pin: metadata.pin,
        role: (roleData?.role as SystemAccount['role']) || metadata.expectedRole,
        organization: metadata.organization,
        description: metadata.description,
        created_at: profile.created_at || new Date().toISOString()
      };

    } catch (error) {
      console.error('💥 Erreur rafraîchissement compte:', error);
      return null;
    }
  }
}

export const systemAccountsService = new SystemAccountsService();
export default systemAccountsService;

