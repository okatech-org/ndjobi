// Service d'authentification Super Admin
// Accès exclusif avec code spécial et validation par email/téléphone

export interface SuperAdminCredentials {
  code: string;
  email: string;
  phone: string;
}

export interface ValidationResult {
  success: boolean;
  error?: string;
  requiresValidation?: boolean;
}

class SuperAdminAuthService {
  // Lire le code depuis les variables d'environnement (fallback dev conservé)
  private getSuperAdminCode(): string {
    const envCode = (import.meta as any)?.env?.VITE_SUPER_ADMIN_CODE;
    return envCode && String(envCode).trim().length > 0 ? String(envCode) : '011282*';
  }
  private readonly VALIDATION_EMAIL = 'iasted@me.com';
  private readonly VALIDATION_PHONE = '+33661002616';
  private readonly STORAGE_KEY = 'ndjobi_super_admin_session';

  // Vérifier le code d'authentification Super Admin
  public validateSuperAdminCode(code: string): ValidationResult {
    const valid = this.getSuperAdminCode();
    if (code !== valid) {
      return {
        success: false,
        error: 'Code d\'authentification incorrect'
      };
    }

    return {
      success: true,
      requiresValidation: true
    };
  }

  // Envoyer le code de validation (simulation)
  public async sendValidationCode(method: 'email' | 'phone'): Promise<{ success: boolean; error?: string }> {
    try {
      // En production, ceci devrait envoyer un vrai code de validation
      // Pour la démo, on simule l'envoi
      
      const target = method === 'email' ? this.VALIDATION_EMAIL : this.VALIDATION_PHONE;
      
      console.log(`Code de validation envoyé à ${target}`);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi du code'
      };
    }
  }

  // Valider le code de validation reçu
  public validateCode(validationCode: string): ValidationResult {
    // Pour la démo, on accepte n'importe quel code de 6 chiffres
    // En production, ceci devrait vérifier contre un code généré côté serveur
    
    if (!validationCode || validationCode.length !== 6) {
      return {
        success: false,
        error: 'Code de validation invalide'
      };
    }

    // Vérifier que c'est bien des chiffres
    if (!/^\d{6}$/.test(validationCode)) {
      return {
        success: false,
        error: 'Le code doit contenir 6 chiffres'
      };
    }

    return { success: true };
  }

  // Créer une session Super Admin
  public createSuperAdminSession(): void {
    const sessionData = {
      isSuperAdmin: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
  }

  // Vérifier si une session Super Admin est active
  public isSuperAdminSessionActive(): boolean {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionData) return false;

      const session = JSON.parse(sessionData);
      
      // Vérifier l'expiration
      if (Date.now() > session.expiresAt) {
        this.clearSuperAdminSession();
        return false;
      }

      return session.isSuperAdmin === true;
    } catch (error) {
      console.error('Erreur lors de la vérification de la session Super Admin:', error);
      return false;
    }
  }

  // Nettoyer la session Super Admin
  public clearSuperAdminSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Obtenir les informations de validation
  public getValidationInfo(): { email: string; phone: string } {
    return {
      email: this.VALIDATION_EMAIL,
      phone: this.VALIDATION_PHONE
    };
  }

  // Vérifier si le code d'authentification est correct (pour affichage)
  public isCorrectCode(code: string): boolean {
    return code === this.getSuperAdminCode();
  }

  // Générer un code de validation temporaire (pour la démo)
  public generateDemoValidationCode(): string {
    // Générer un code de 6 chiffres aléatoire
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

// Instance singleton
export const superAdminAuthService = new SuperAdminAuthService();
