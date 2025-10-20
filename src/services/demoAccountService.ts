import { User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '@/types/auth';

export interface DemoAccountData {
  email: string;
  password: string;
  role: UserRole;
  label: string;
  fullName: string;
  phone: string;
}

export interface LocalDemoSession {
  user: User;
  profile: UserProfile;
  role: UserRole;
  timestamp: number;
  expiresAt: number;
}

class DemoAccountService {
  private readonly STORAGE_KEY = 'ndjobi_demo_session';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures

  // Comptes démo disponibles (mis à jour avec les comptes de la base de données)
  public readonly DEMO_ACCOUNTS: DemoAccountData[] = [
    {
      email: '24177888001@ndjobi.com',
      password: '111111',
      role: 'admin', // Selon diagramme: Président/Admin = Vue globale, Validation
      label: 'Président / Administrateur',
      fullName: 'Président / Administrateur',
      phone: '+24177888001'
    },
    {
      email: '24177888002@ndjobi.com',
      password: '222222',
      role: 'sub_admin', // Selon diagramme: Sous-Admin = Vue sectorielle
      label: 'Sous-Admin DGSS',
      fullName: 'Sous-Admin DGSS',
      phone: '+24177888002'
    },
    {
      email: '24177888003@ndjobi.com',
      password: '333333',
      role: 'sub_admin', // Selon diagramme: Sous-Admin = Vue sectorielle
      label: 'Sous-Admin DGR',
      fullName: 'Sous-Admin DGR',
      phone: '+24177888003'
    },
    {
      email: '24177888011@ndjobi.com',
      password: '101010',
      role: 'sub_admin',
      label: 'Sous-Admin Défense',
      fullName: 'Sous-Admin Défense Nationale',
      phone: '+24177888011'
    },
    {
      email: '24177888012@ndjobi.com',
      password: '121212',
      role: 'sub_admin',
      label: 'Sous-Admin Intérieur',
      fullName: 'Sous-Admin Ministère de l\'Intérieur',
      phone: '+24177888012'
    },
    {
      email: '24177888013@ndjobi.com',
      password: '131313',
      role: 'sub_admin',
      label: 'Sous-Admin Affaires Étrangères',
      fullName: 'Sous-Admin Affaires Étrangères',
      phone: '+24177888013'
    },
    {
      email: '24177888004@ndjobi.com',
      password: '444444',
      role: 'agent',
      label: 'Agent Défense',
      fullName: 'Agent Défense',
      phone: '+24177888004'
    },
    {
      email: '24177888005@ndjobi.com',
      password: '555555',
      role: 'agent',
      label: 'Agent Justice',
      fullName: 'Agent Justice',
      phone: '+24177888005'
    },
    {
      email: '24177888006@ndjobi.com',
      password: '666666',
      role: 'agent',
      label: 'Agent Anti-Corruption',
      fullName: 'Agent Anti-Corruption',
      phone: '+24177888006'
    },
    {
      email: '24177888007@ndjobi.com',
      password: '777777',
      role: 'agent',
      label: 'Agent Intérieur',
      fullName: 'Agent Intérieur',
      phone: '+24177888007'
    },
    {
      email: '24177888008@ndjobi.com',
      password: '888888',
      role: 'user',
      label: 'Citoyen Démo',
      fullName: 'Citoyen Démo',
      phone: '+24177888008'
    },
    {
      email: '24177888009@ndjobi.com',
      password: '999999',
      role: 'user',
      label: 'Citoyen Anonyme',
      fullName: 'Citoyen Anonyme',
      phone: '+24177888009'
    },
    {
      email: '24177888010@ndjobi.com',
      password: '000000',
      role: 'agent',
      label: 'Agent Pêche',
      fullName: 'Agent Pêche',
      phone: '+24177888010'
    }
  ];

  // Créer une session locale pour un compte démo
  public createLocalSession(accountEmail: string): boolean {
    try {
      const account = this.DEMO_ACCOUNTS.find(acc => acc.email === accountEmail);
      
      if (!account) {
        console.error('Compte démo non trouvé:', accountEmail);
        return false;
      }

      // Créer un utilisateur fictif
      const mockUser = {
        id: `local-${account.role}`,
        email: account.email,
        user_metadata: {
          full_name: account.fullName,
          phone: account.phone,
          role: account.role
        },
        created_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        confirmed_at: new Date().toISOString()
      } as User;

      const mockProfile: UserProfile = {
        id: `local-${account.role}`,
        email: account.email,
        full_name: account.fullName,
        avatar_url: '',
        organization: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const sessionData: LocalDemoSession = {
        user: mockUser,
        profile: mockProfile,
        role: account.role,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.SESSION_DURATION
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      console.log(`✅ Session locale créée pour ${account.label}`);
      
      return true;
    } catch (error) {
      console.error('Erreur création session locale:', error);
      return false;
    }
  }

  // Créer une session locale pour un compte arbitraire avec rôle explicite
  public createLocalSessionFor(params: { email: string; role: UserRole; fullName?: string; phone?: string }): boolean {
    try {
      const { email, role, fullName, phone } = params;

      const mockUser = {
        id: `local-${role}`,
        email,
        user_metadata: {
          full_name: fullName || `Démo ${role}`,
          phone: phone || '',
          role
        },
        created_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        confirmed_at: new Date().toISOString()
      } as User;

      const mockProfile: UserProfile = {
        id: `local-${role}`,
        email,
        full_name: fullName || `Démo ${role}`,
        avatar_url: '',
        organization: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const sessionData: LocalDemoSession = {
        user: mockUser,
        profile: mockProfile,
        role,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.SESSION_DURATION
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      console.log(`✅ Session locale créée pour ${email} avec rôle ${role}`);
      return true;
    } catch (error) {
      console.error('Erreur création session locale (générique):', error);
      return false;
    }
  }

  // Récupérer la session locale active
  public getLocalSession(): LocalDemoSession | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionData) return null;

      const session: LocalDemoSession = JSON.parse(sessionData);
      
      // Vérifier l'expiration
      if (Date.now() > session.expiresAt) {
        this.clearLocalSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Erreur récupération session locale:', error);
      return null;
    }
  }

  // Vérifier si une session locale est active
  public hasActiveLocalSession(): boolean {
    return this.getLocalSession() !== null;
  }

  // Nettoyer la session locale
  public clearLocalSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Obtenir les informations d'un compte démo
  public getDemoAccount(email: string): DemoAccountData | undefined {
    return this.DEMO_ACCOUNTS.find(acc => acc.email === email);
  }

  // Vérifier si un email correspond à un compte démo
  public isDemoAccount(email: string): boolean {
    return this.DEMO_ACCOUNTS.some(acc => acc.email === email);
  }
}

// Instance singleton
export const demoAccountService = new DemoAccountService();

