import { supabase } from '@/integrations/supabase/client';

export interface DatabaseDemoAccount {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  organization: string;
  role: 'admin' | 'sub_admin' | 'agent' | 'user';
  created_at: string;
  last_used?: string;
  pin: string;
}

export class DemoAccountsFromDatabaseService {
  private static instance: DemoAccountsFromDatabaseService;
  private accounts: DatabaseDemoAccount[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DemoAccountsFromDatabaseService {
    if (!DemoAccountsFromDatabaseService.instance) {
      DemoAccountsFromDatabaseService.instance = new DemoAccountsFromDatabaseService();
    }
    return DemoAccountsFromDatabaseService.instance;
  }

  /**
   * Récupère tous les comptes démo depuis la base de données
   */
  async fetchDemoAccounts(): Promise<DatabaseDemoAccount[]> {
    const now = Date.now();
    
    // Utiliser le cache si disponible et récent
    if (this.accounts.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.accounts;
    }

    try {
      console.log('🔍 Récupération des comptes démo depuis la base de données...');
      
      // Récupérer les comptes démo depuis la base de données
      const { data: accountsData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          organization,
          created_at,
          user_roles!inner(role)
        `)
        .like('email', '24177888%@ndjobi.com')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération des comptes démo:', error);
        throw error;
      }

      // Mapper les données vers notre interface
      this.accounts = accountsData?.map((account: any) => ({
        id: account.id,
        email: account.email || '',
        full_name: account.full_name || '',
        phone: account.phone || '',
        organization: account.organization || '',
        role: (account.user_roles?.role || (Array.isArray(account.user_roles) ? account.user_roles?.[0]?.role : undefined) || 'user') as 'admin' | 'sub_admin' | 'agent' | 'user',
        created_at: account.created_at || new Date().toISOString(),
        pin: this.getPinForPhone(account.phone || '')
      })) || [];

      this.lastFetch = now;
      
      console.log(`✅ ${this.accounts.length} comptes démo récupérés depuis la base de données`);
      
      return this.accounts;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des comptes démo:', error);
      return [];
    }
  }

  /**
   * Obtient le PIN correspondant au numéro de téléphone
   */
  private getPinForPhone(phone: string): string {
    const phoneToPinMap: Record<string, string> = {
      '+24177888001': '111111', // Admin (Président)
      '+24177888002': '222222', // Sous-Admin DGSS
      '+24177888003': '333333', // Sous-Admin DGR
      '+24177888004': '444444', // Agent Défense
      '+24177888005': '555555', // Agent Justice
      '+24177888006': '666666', // Agent Anti-Corruption
      '+24177888007': '777777', // Agent Intérieur
      '+24177888008': '888888', // Citoyen Démo
      '+24177888009': '999999', // Citoyen Anonyme
    };

    return phoneToPinMap[phone] || '000000';
  }

  /**
   * Obtient le nom d'affichage du rôle
   */
  getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      'admin': 'Président / Administrateur',
      'sub_admin': 'Sous-Administrateur',
      'agent': 'Agent',
      'user': 'Citoyen'
    };

    return roleNames[role] || role;
  }

  /**
   * Obtient la couleur du badge pour le rôle
   */
  getRoleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    const roleVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      'admin': 'default',
      'sub_admin': 'secondary',
      'agent': 'outline',
      'user': 'outline'
    };

    return roleVariants[role] || 'outline';
  }

  /**
   * Obtient la description du rôle
   */
  getRoleDescription(role: string): string {
    const roleDescriptions: Record<string, string> = {
      'admin': 'Accès présidentiel - Administration complète',
      'sub_admin': 'Vue sectorielle - Direction spécialisée',
      'agent': 'Enquêtes opérationnelles - Terrain',
      'user': 'Signalements et protection de projets'
    };

    return roleDescriptions[role] || 'Rôle non défini';
  }

  /**
   * Force le rafraîchissement du cache
   */
  async refreshCache(): Promise<DatabaseDemoAccount[]> {
    this.lastFetch = 0;
    this.accounts = [];
    return this.fetchDemoAccounts();
  }

  /**
   * Obtient un compte par son email
   */
  async getAccountByEmail(email: string): Promise<DatabaseDemoAccount | null> {
    await this.fetchDemoAccounts();
    return this.accounts.find(account => account.email === email) || null;
  }

  /**
   * Obtient les comptes par rôle
   */
  async getAccountsByRole(role: string): Promise<DatabaseDemoAccount[]> {
    await this.fetchDemoAccounts();
    return this.accounts.filter(account => account.role === role);
  }
}

export const demoAccountsFromDatabaseService = DemoAccountsFromDatabaseService.getInstance();
