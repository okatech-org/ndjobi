// Service pour basculer entre les comptes (Super Admin vers comptes démo)
import { supabase } from '@/integrations/supabase/client';
import { userPersistence } from './userPersistence';
import { demoAccountService } from './demoAccountService';
// import supprimé: ne pas réinitialiser l'état global ici pour préserver la session démo

export interface DemoAccount {
  id: string;
  email: string;
  role: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  countryCode?: string;
}

export interface OriginalAccount {
  userId: string;
  email: string;
  role: string;
  sessionToken?: string;
}

class AccountSwitchingService {
  private originalAccount: OriginalAccount | null = null;
  private readonly STORAGE_KEY = 'ndjobi_original_account';

  // Sauvegarder le compte original avant de basculer
  public async saveOriginalAccount(): Promise<void> {
    console.log('🔵 [AccountSwitching] saveOriginalAccount START');
    try {
      // Créer un timeout pour éviter le blocage
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout Supabase')), 2000);
      });

      console.log('🔵 [AccountSwitching] Appel supabase.auth.getUser() avec timeout 2s...');
      const userResult = await Promise.race([
        supabase.auth.getUser(),
        timeout
      ]).catch((err) => {
        console.warn('⚠️ [AccountSwitching] Timeout/Erreur getUser:', err.message);
        return { data: { user: null }, error: err };
      });
      
      console.log('🔵 [AccountSwitching] getUser résultat:', userResult);
      
      console.log('🔵 [AccountSwitching] Appel supabase.auth.getSession() avec timeout 2s...');
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        timeout
      ]).catch((err) => {
        console.warn('⚠️ [AccountSwitching] Timeout/Erreur getSession:', err.message);
        return { data: { session: null }, error: err };
      });
      
      console.log('🔵 [AccountSwitching] getSession résultat:', sessionResult);
      
      const user = userResult.data?.user;
      const session = sessionResult.data?.session;
      
      if (user && session) {
        this.originalAccount = {
          userId: user.id,
          email: user.email || '',
          role: 'super_admin',
          sessionToken: session.access_token
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.originalAccount));
        
        console.log('✅ [AccountSwitching] Compte original sauvegardé:', this.originalAccount);
      } else {
        console.log('⚠️ [AccountSwitching] Pas de user/session Supabase, compte original non sauvegardé');
      }
    } catch (error) {
      console.error('💥 [AccountSwitching] Erreur lors de la sauvegarde du compte original:', error);
    }
    console.log('🔵 [AccountSwitching] saveOriginalAccount END');
  }

  // Basculer vers un compte démo (MODE LOCAL OPTIMISÉ)
  public async switchToDemoAccount(demoAccount: DemoAccount): Promise<{ success: boolean; error?: string }> {
    console.log('🚀 [Quick Fix] Basculement démo simplifié vers:', demoAccount.role);
    try {
      // Normaliser l'email (remplacer .temp par .com)
      const rawEmail = demoAccount.email || '';
      const email = rawEmail.replace('@ndjobi.temp', '@ndjobi.com');
      
      console.log('📧 Email normalisé:', email);

      // SKIP Supabase complètement - Créer session locale directement
      console.log('🔄 Création session locale démo...');
      const created = demoAccountService.createLocalSession(email);
      
      if (!created) {
        console.error('❌ Échec création session locale pour:', email);
        return { success: false, error: `Compte démo ${email} non trouvé` };
      }

      // Marquer qu'on a basculé (pour afficher "Retour au Super Admin")
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        const placeholderOriginal: OriginalAccount = {
          userId: 'local-super-admin',
          email: '',
          role: 'super_admin',
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(placeholderOriginal));
        console.log('💾 Compte original marqué pour retour');
      }

      // Dispatcher l'événement de changement de session démo
      window.dispatchEvent(new Event('ndjobi:demo:session:changed'));
      console.log('📢 Événement session démo dispatché');

      // Ne PAS réinitialiser l'état global ici: cela effaçait la session démo
      // ProtectedRoute écoute l'événement custom ci-dessus pour revalider l'accès

      console.log('✅ Basculement local réussi vers:', demoAccount.role);
      return { success: true };

    } catch (error: any) {
      console.error('💥 Erreur basculement:', error);
      return { success: false, error: error.message || 'Erreur de basculement' };
    }
  }

  // Retourner au compte Super Admin original
  public async switchBackToOriginal(): Promise<{ success: boolean; error?: string }> {
    console.log('🔙 [AccountSwitching] Retour au Super Admin...');
    try {
      // Récupérer le compte original depuis le localStorage
      const storedOriginal = localStorage.getItem(this.STORAGE_KEY);
      if (!storedOriginal) {
        return { success: false, error: 'Aucun compte original trouvé' };
      }

      this.originalAccount = JSON.parse(storedOriginal);
      
      if (!this.originalAccount) {
        return { success: false, error: 'Données du compte original corrompues' };
      }

      console.log('📧 Email Super Admin récupéré:', this.originalAccount.email);

      // Nettoyer les données de la session démo
      userPersistence.clearStoredUser();

      // Recréer la session Super Admin locale
      if (this.originalAccount.email) {
        const created = demoAccountService.createLocalSession(this.originalAccount.email);
        
        if (!created) {
          console.error('❌ Échec recréation session Super Admin');
          return { success: false, error: 'Impossible de recréer la session Super Admin' };
        }
        console.log('✅ Session Super Admin recréée');
      }
      
      // Nettoyer le marqueur de compte basculé
      localStorage.removeItem(this.STORAGE_KEY);
      this.originalAccount = null;

      // Dispatcher l'événement de changement de session
      window.dispatchEvent(new Event('ndjobi:demo:session:changed'));
      console.log('📢 Événement retour Super Admin dispatché');

      console.log('✅ Retour au Super Admin réussi');
      return { success: true };

    } catch (error: any) {
      console.error('💥 Erreur lors du retour au compte original:', error);
      return { success: false, error: error.message || 'Erreur de retour' };
    }
  }

  // Vérifier si on est dans un compte basculé
  public isInSwitchedAccount(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  // Obtenir les informations du compte original
  public getOriginalAccount(): OriginalAccount | null {
    if (!this.originalAccount) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.originalAccount = JSON.parse(stored);
      }
    }
    return this.originalAccount;
  }

  // Nettoyer complètement le service
  public clearAll(): void {
    this.originalAccount = null;
    localStorage.removeItem(this.STORAGE_KEY);
    userPersistence.clearStoredUser();
  }
}

// Instance singleton
export const accountSwitchingService = new AccountSwitchingService();
