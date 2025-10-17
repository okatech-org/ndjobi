// Service pour basculer entre les comptes (Super Admin vers comptes démo)
import { supabase } from '@/integrations/supabase/client';
import { userPersistence } from './userPersistence';
import { demoAccountService } from './demoAccountService';

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

  // Basculer vers un compte démo
  public async switchToDemoAccount(demoAccount: DemoAccount): Promise<{ success: boolean; error?: string }> {
    console.log('🔵 [AccountSwitching] switchToDemoAccount START avec:', demoAccount);
    try {
      // Sauvegarder le compte original si pas déjà fait
      if (!this.originalAccount) {
        console.log('🔵 [AccountSwitching] Sauvegarde du compte original...');
        await this.saveOriginalAccount();
      }

      console.log('🔵 [AccountSwitching] Basculement vers le compte démo:', demoAccount);

      // Déterminer l'email du compte démo (priorité à demoAccount.email)
      const phoneNumber = demoAccount.phoneNumber || '77777001';
      const countryCode = demoAccount.countryCode || '+241';
      const fallbackEmail = `${countryCode.replace('+', '')}${phoneNumber}@ndjobi.com`;
      const rawEmail = demoAccount.email || fallbackEmail;
      const email = rawEmail.replace('@ndjobi.temp', '@ndjobi.com');
      const pin = demoAccount.password || '123456';

      console.log('🔵 [AccountSwitching] Tentative de connexion avec (normalisé):', { email, pin });

      // Se connecter avec le compte démo (email construit + PIN)
      console.log('🔵 [AccountSwitching] Appel supabase.auth.signInWithPassword...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin,
      });
      console.log('🔵 [AccountSwitching] Réponse Supabase:', { signInData, signInError });

      // Si la connexion Supabase échoue, activer un fallback local
      if (signInError || !signInData?.user) {
        console.warn('⚠️ [AccountSwitching] Connexion Supabase pour compte démo échouée, activation du mode local. Détails:', signInError?.message);

        // Marquer que nous avons basculé (pour afficher l'option de retour)
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          const placeholderOriginal: OriginalAccount = {
            userId: 'local-super-admin',
            email: '24177777000@ndjobi.com',
            role: 'super_admin',
          };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(placeholderOriginal));
        }

        // Créer une session locale démo
        console.log('🔵 [AccountSwitching] Création session locale démo avec email:', email);
        const created = demoAccountService.createLocalSession(email);
        console.log('🔵 [AccountSwitching] Session locale créée:', created);
        if (!created) {
          console.error('❌ [AccountSwitching] Impossible de créer session locale');
          return { success: false, error: 'Impossible de créer une session locale démo' };
        }

        // Mettre à jour les données PWA
        console.log('🔵 [AccountSwitching] Mise à jour données PWA...');
        await userPersistence.storeUser({
          id: `local-${demoAccount.role}`,
          phoneNumber: phoneNumber,
          countryCode: countryCode,
          fullName: demoAccount.fullName,
          role: demoAccount.role
        });

        console.log('✅ [AccountSwitching] Basculement local réussi vers:', demoAccount.role);
        return { success: true };
      }

      // Mettre à jour les données PWA avec le compte démo
      console.log('🔵 [AccountSwitching] Supabase OK, mise à jour données PWA...');
      await userPersistence.storeUser({
        id: signInData.user.id,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        fullName: demoAccount.fullName,
        role: demoAccount.role
      });

      console.log('✅ [AccountSwitching] Basculement Supabase réussi vers:', demoAccount.role);
      return { success: true };

    } catch (error: any) {
      console.error('💥 [AccountSwitching] Erreur lors du basculement:', error);
      return { success: false, error: error.message || 'Erreur de basculement' };
    }
  }

  // Retourner au compte Super Admin original
  public async switchBackToOriginal(): Promise<{ success: boolean; error?: string }> {
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

      console.log('Retour au compte original:', this.originalAccount);

      // Se reconnecter avec le compte original
      // Note: On ne peut pas utiliser directement le token, il faut se reconnecter
      // Le Super Admin devra se reconnecter avec ses identifiants
      
      // Nettoyer les données PWA du compte démo
      userPersistence.clearStoredUser();
      
      // Nettoyer le stockage du compte original
      localStorage.removeItem(this.STORAGE_KEY);
      this.originalAccount = null;

      console.log('Retour au compte original préparé');
      return { success: true };

    } catch (error: any) {
      console.error('Erreur lors du retour au compte original:', error);
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
