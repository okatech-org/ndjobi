// Service pour la persistance des données utilisateur en PWA
export interface StoredUser {
  id: string;
  phoneNumber: string;
  countryCode: string;
  fullName: string;
  role: string;
  registeredAt: string;
  lastLoginAt: string;
  biometricEnabled: boolean;
}

class UserPersistenceService {
  private readonly STORAGE_KEY = 'ndjobi_user_data';
  private readonly BIOMETRIC_KEY_PREFIX = 'ndjobi_biometric_';

  // Enregistrer les données utilisateur après inscription
  public async storeUser(userData: Omit<StoredUser, 'registeredAt' | 'lastLoginAt' | 'biometricEnabled'>): Promise<void> {
    try {
      const storedUser: StoredUser = {
        ...userData,
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        biometricEnabled: false
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedUser));
      
      // Également stocker dans sessionStorage pour la session courante
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedUser));
      
      console.log('Utilisateur enregistré localement:', storedUser);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données utilisateur:', error);
      throw new Error('Impossible d\'enregistrer les données utilisateur');
    }
  }

  // Récupérer les données utilisateur stockées
  public getStoredUser(): StoredUser | null {
    try {
      // Essayer d'abord sessionStorage, puis localStorage
      const sessionData = sessionStorage.getItem(this.STORAGE_KEY);
      const localData = localStorage.getItem(this.STORAGE_KEY);
      
      const data = sessionData || localData;
      if (!data) return null;

      const userData = JSON.parse(data) as StoredUser;
      
      // Vérifier que les données ne sont pas trop anciennes (30 jours max)
      const lastLogin = new Date(userData.lastLoginAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (lastLogin < thirtyDaysAgo) {
        this.clearStoredUser();
        return null;
      }

      return userData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  // Mettre à jour la dernière connexion
  public updateLastLogin(): void {
    try {
      const userData = this.getStoredUser();
      if (userData) {
        userData.lastLoginAt = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
    }
  }

  // Activer/désactiver l'authentification biométrique
  public setBiometricEnabled(enabled: boolean): void {
    try {
      const userData = this.getStoredUser();
      if (userData) {
        userData.biometricEnabled = enabled;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut biométrique:', error);
    }
  }

  // Vérifier si l'utilisateur a des données stockées
  public hasStoredUser(): boolean {
    return this.getStoredUser() !== null;
  }

  // Obtenir l'ID utilisateur stocké
  public getStoredUserId(): string | null {
    const userData = this.getStoredUser();
    return userData?.id || null;
  }

  // Obtenir le numéro de téléphone stocké (masqué)
  public getStoredPhoneDisplay(): string | null {
    const userData = this.getStoredUser();
    if (!userData) return null;

    const phone = userData.phoneNumber;
    if (phone.length <= 4) return phone;
    
    // Masquer le numéro : +241 77 *** 001
    const start = phone.slice(0, 2);
    const end = phone.slice(-3);
    const masked = '*'.repeat(phone.length - 5);
    
    return `${userData.countryCode} ${start} ${masked} ${end}`;
  }

  // Obtenir le nom complet stocké
  public getStoredUserName(): string | null {
    const userData = this.getStoredUser();
    return userData?.fullName || null;
  }

  // Vérifier si l'authentification biométrique est activée
  public isBiometricEnabled(): boolean {
    const userData = this.getStoredUser();
    return userData?.biometricEnabled || false;
  }

  // Effacer toutes les données utilisateur stockées
  public clearStoredUser(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
      
      // Effacer aussi les données biométriques
      const userData = this.getStoredUser();
      if (userData) {
        localStorage.removeItem(`${this.BIOMETRIC_KEY_PREFIX}${userData.id}`);
      }
      
      console.log('Données utilisateur effacées');
    } catch (error) {
      console.error('Erreur lors de l\'effacement des données utilisateur:', error);
    }
  }

  // Synchroniser avec le serveur (optionnel)
  public async syncWithServer(): Promise<boolean> {
    try {
      const userData = this.getStoredUser();
      if (!userData) return false;

      // Ici, vous pourriez faire un appel API pour synchroniser
      // les données avec le serveur si nécessaire
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la synchronisation avec le serveur:', error);
      return false;
    }
  }

  // Obtenir les statistiques de stockage
  public getStorageStats(): { hasLocalData: boolean; hasSessionData: boolean; lastLogin?: string } {
    const localData = localStorage.getItem(this.STORAGE_KEY);
    const sessionData = sessionStorage.getItem(this.STORAGE_KEY);
    const userData = this.getStoredUser();

    return {
      hasLocalData: !!localData,
      hasSessionData: !!sessionData,
      lastLogin: userData?.lastLoginAt
    };
  }
}

// Instance singleton
export const userPersistence = new UserPersistenceService();
