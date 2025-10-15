// Service pour basculer entre les comptes (Super Admin vers comptes démo)
import { supabase } from '@/integrations/supabase/client';
import { userPersistence } from './userPersistence';

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
    try {
      const { data: { user }, data: { session } } = await supabase.auth.getUser();
      
      if (user && session) {
        this.originalAccount = {
          userId: user.id,
          email: user.email || '',
          role: 'super_admin', // Le Super Admin est toujours le compte original
          sessionToken: session.access_token
        };

        // Stocker dans localStorage pour persistance
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.originalAccount));
        
        console.log('Compte original sauvegardé:', this.originalAccount);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du compte original:', error);
    }
  }

  // Basculer vers un compte démo
  public async switchToDemoAccount(demoAccount: DemoAccount): Promise<{ success: boolean; error?: string }> {
    try {
      // Sauvegarder le compte original si pas déjà fait
      if (!this.originalAccount) {
        await this.saveOriginalAccount();
      }

      console.log('Basculement vers le compte démo:', demoAccount);

      // Construire l'email à partir du numéro de téléphone
      const phoneNumber = demoAccount.phoneNumber || '77777001';
      const countryCode = demoAccount.countryCode || '+241';
      const email = `${countryCode.replace('+', '')}${phoneNumber}@ndjobi.temp`;
      const pin = demoAccount.password || '123456';

      console.log('Tentative de connexion avec:', { email, pin });

      // Se connecter avec le compte démo (email construit + PIN)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin,
      });

      if (signInError) {
        console.error('Erreur de connexion au compte démo:', signInError);
        return { success: false, error: signInError.message };
      }

      if (!signInData?.user) {
        return { success: false, error: 'Utilisateur démo non trouvé' };
      }

      // Mettre à jour les données PWA avec le compte démo
      await userPersistence.storeUser({
        id: signInData.user.id,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        fullName: demoAccount.fullName,
        role: demoAccount.role
      });

      console.log('Basculement réussi vers:', demoAccount.role);
      return { success: true };

    } catch (error: any) {
      console.error('Erreur lors du basculement:', error);
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
