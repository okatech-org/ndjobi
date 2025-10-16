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

  // Comptes démo disponibles
  public readonly DEMO_ACCOUNTS: DemoAccountData[] = [
    {
      email: '24177777001@ndjobi.com',
      password: '123456',
      role: 'user',
      label: 'Citoyen',
      fullName: 'Citoyen Démo',
      phone: '+24177777001'
    },
    {
      email: '24177777002@ndjobi.com',
      password: '123456',
      role: 'agent',
      label: 'Agent DGSS',
      fullName: 'Agent DGSS Démo',
      phone: '+24177777002'
    },
    {
      email: '24177777003@ndjobi.com',
      password: '123456',
      role: 'admin',
      label: 'Protocole d\'État',
      fullName: 'Protocole d\'État Démo',
      phone: '+24177777003'
    },
    {
      email: '24177777000@ndjobi.com',
      password: '123456',
      role: 'super_admin',
      label: 'Super Administrateur',
      fullName: 'Super Administrateur',
      phone: '+24177777000'
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
        created_at: new Date().toISOString()
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

