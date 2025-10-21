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
  async getSystemAccounts(): Promise<SystemAccount[]> {
    try {
      console.log('🔍 Récupération des comptes système...');
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone_number, created_at')
        .in('phone_number', [
          '+24177888001',
          '+24177888002',
          '+24177888003',
          '+24177888004',
          '+24177888005',
          '+24177888006',
          '+24177888007',
          '+24177888008',
          '+24177888009'
        ]);

      if (profilesError) {
        console.error('❌ Erreur profiles:', profilesError);
        throw profilesError;
      }

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profilesData?.map(p => p.id) || []);

      if (rolesError) {
        console.error('❌ Erreur roles:', rolesError);
        throw rolesError;
      }

      const rolesMap = new Map(
        rolesData?.map(r => [r.user_id, r.role]) || []
      );

      const accountsMetadata: Record<string, { pin: string; organization: string; description: string }> = {
        '+24177888001': {
          pin: '111111',
          organization: 'Présidence de la République',
          description: 'Accès présidentiel - Administration complète'
        },
        '+24177888002': {
          pin: '222222',
          organization: 'DGSS (Direction Générale de la Sécurité d\'État)',
          description: 'Vue sectorielle - Direction spécialisée'
        },
        '+24177888003': {
          pin: '333333',
          organization: 'DGR (Direction Générale du Renseignement)',
          description: 'Vue sectorielle - Direction spécialisée'
        },
        '+24177888004': {
          pin: '444444',
          organization: 'Ministère de la Défense',
          description: 'Enquêtes opérationnelles - Terrain'
        },
        '+24177888005': {
          pin: '555555',
          organization: 'Ministère de la Justice',
          description: 'Enquêtes opérationnelles - Terrain'
        },
        '+24177888006': {
          pin: '666666',
          organization: 'Commission Anti-Corruption',
          description: 'Enquêtes opérationnelles - Terrain'
        },
        '+24177888007': {
          pin: '777777',
          organization: 'Ministère de l\'Intérieur',
          description: 'Enquêtes opérationnelles - Terrain'
        },
        '+24177888008': {
          pin: '888888',
          organization: 'Citoyen',
          description: 'Signalements citoyens'
        },
        '+24177888009': {
          pin: '999999',
          organization: 'Anonyme',
          description: 'Signalements citoyens'
        }
      };

      const accounts: SystemAccount[] = profilesData?.map(profile => {
        const phone = profile.phone_number || '';
        const metadata = accountsMetadata[phone] || {
          pin: '000000',
          organization: 'Inconnu',
          description: 'Compte système'
        };
        
        const role = rolesMap.get(profile.id) as SystemAccount['role'] || 'user';

        return {
          id: profile.id,
          email: profile.email || `${phone}@ndjobi.com`,
          full_name: profile.full_name || 'Utilisateur',
          phone,
          pin: metadata.pin,
          role,
          organization: metadata.organization,
          description: metadata.description,
          created_at: profile.created_at || new Date().toISOString()
        };
      }) || [];

      console.log(`✅ ${accounts.length} comptes système récupérés`);
      
      return accounts.sort((a, b) => {
        const phoneA = parseInt(a.phone.replace(/\D/g, ''));
        const phoneB = parseInt(b.phone.replace(/\D/g, ''));
        return phoneA - phoneB;
      });

    } catch (error) {
      console.error('💥 Erreur récupération comptes système:', error);
      return this.getFallbackAccounts();
    }
  }

  private getFallbackAccounts(): SystemAccount[] {
    console.log('⚠️ Utilisation des comptes de secours (fallback)');
    return [
      {
        id: 'fallback-1',
        email: '24177888001@ndjobi.com',
        full_name: 'Président',
        phone: '+24177888001',
        organization: 'Présidence de la République',
        role: 'admin',
        created_at: new Date().toISOString(),
        pin: '111111',
        description: 'Accès présidentiel - Administration complète'
      },
      {
        id: 'fallback-2',
        email: '24177888002@ndjobi.com',
        full_name: 'Sous-Admin DGSS',
        phone: '+24177888002',
        organization: 'DGSS (Direction Générale de la Sécurité d\'État)',
        role: 'sub_admin',
        created_at: new Date().toISOString(),
        pin: '222222',
        description: 'Vue sectorielle - Direction spécialisée'
      },
      {
        id: 'fallback-3',
        email: '24177888003@ndjobi.com',
        full_name: 'Sous-Admin DGR',
        phone: '+24177888003',
        organization: 'DGR (Direction Générale du Renseignement)',
        role: 'sub_admin',
        created_at: new Date().toISOString(),
        pin: '333333',
        description: 'Vue sectorielle - Direction spécialisée'
      },
      {
        id: 'fallback-4',
        email: '24177888004@ndjobi.com',
        full_name: 'Agent Défense',
        phone: '+24177888004',
        organization: 'Ministère de la Défense',
        role: 'agent',
        created_at: new Date().toISOString(),
        pin: '444444',
        description: 'Enquêtes opérationnelles - Terrain'
      },
      {
        id: 'fallback-5',
        email: '24177888005@ndjobi.com',
        full_name: 'Agent Justice',
        phone: '+24177888005',
        organization: 'Ministère de la Justice',
        role: 'agent',
        created_at: new Date().toISOString(),
        pin: '555555',
        description: 'Enquêtes opérationnelles - Terrain'
      },
      {
        id: 'fallback-6',
        email: '24177888006@ndjobi.com',
        full_name: 'Agent Anti-Corruption',
        phone: '+24177888006',
        organization: 'Commission Anti-Corruption',
        role: 'agent',
        created_at: new Date().toISOString(),
        pin: '666666',
        description: 'Enquêtes opérationnelles - Terrain'
      },
      {
        id: 'fallback-7',
        email: '24177888007@ndjobi.com',
        full_name: 'Agent Intérieur',
        phone: '+24177888007',
        organization: 'Ministère de l\'Intérieur',
        role: 'agent',
        created_at: new Date().toISOString(),
        pin: '777777',
        description: 'Enquêtes opérationnelles - Terrain'
      },
      {
        id: 'fallback-8',
        email: '24177888008@ndjobi.com',
        full_name: 'Citoyen Démo',
        phone: '+24177888008',
        organization: 'Citoyen',
        role: 'user',
        created_at: new Date().toISOString(),
        pin: '888888',
        description: 'Signalements citoyens'
      },
      {
        id: 'fallback-9',
        email: '24177888009@ndjobi.com',
        full_name: 'Citoyen Anonyme',
        phone: '+24177888009',
        organization: 'Anonyme',
        role: 'user',
        created_at: new Date().toISOString(),
        pin: '999999',
        description: 'Signalements citoyens'
      }
    ];
  }

  async refreshAccount(accountId: string): Promise<SystemAccount | null> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone_number, created_at')
        .eq('id', accountId)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erreur récupération compte:', profileError);
        return null;
      }

      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', accountId)
        .single();

      if (roleError) {
        console.error('❌ Erreur récupération rôle:', roleError);
      }

      const phone = profile.phone_number || '';
      const accountsMetadata: Record<string, { pin: string; organization: string; description: string }> = {
        '+24177888001': { pin: '111111', organization: 'Présidence de la République', description: 'Accès présidentiel' },
        '+24177888002': { pin: '222222', organization: 'DGSS', description: 'Direction spécialisée' },
        '+24177888003': { pin: '333333', organization: 'DGR', description: 'Direction spécialisée' },
        '+24177888004': { pin: '444444', organization: 'Ministère de la Défense', description: 'Enquêtes terrain' },
        '+24177888005': { pin: '555555', organization: 'Ministère de la Justice', description: 'Enquêtes terrain' },
        '+24177888006': { pin: '666666', organization: 'Commission Anti-Corruption', description: 'Enquêtes terrain' },
        '+24177888007': { pin: '777777', organization: 'Ministère de l\'Intérieur', description: 'Enquêtes terrain' },
        '+24177888008': { pin: '888888', organization: 'Citoyen', description: 'Signalements citoyens' },
        '+24177888009': { pin: '999999', organization: 'Anonyme', description: 'Signalements citoyens' }
      };

      const metadata = accountsMetadata[phone] || {
        pin: '000000',
        organization: 'Inconnu',
        description: 'Compte système'
      };

      return {
        id: profile.id,
        email: profile.email || `${phone}@ndjobi.com`,
        full_name: profile.full_name || 'Utilisateur',
        phone,
        pin: metadata.pin,
        role: (role?.role as SystemAccount['role']) || 'user',
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

