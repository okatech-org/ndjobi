// Service pour l'authentification biométrique
export interface BiometricCapabilities {
  hasFingerprint: boolean;
  hasFaceId: boolean;
  hasTouchId: boolean;
  isSupported: boolean;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
  credential?: any;
}

class BiometricAuthService {
  private isSupported = false;
  private hasFingerprint = false;
  private hasFaceId = false;
  private hasTouchId = false;

  constructor() {
    this.checkCapabilities();
  }

  private async checkCapabilities() {
    try {
      // Vérifier si l'API WebAuthn est supportée
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        this.isSupported = true;
        
        // Vérifier les types d'authentificateurs disponibles
        try {
          const availableTypes = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          this.hasFingerprint = availableTypes;
          this.hasFaceId = availableTypes; // Face ID et Touch ID utilisent la même API
          this.hasTouchId = availableTypes;
        } catch (error) {
          console.warn('Erreur lors de la vérification des authentificateurs:', error);
          // Fallback sur la détection par user agent
          this.detectByUserAgent();
        }
      } else {
        // Fallback sur la détection par user agent si WebAuthn n'est pas disponible
        this.detectByUserAgent();
      }
    } catch (error) {
      console.warn('Erreur lors de la vérification des capacités biométriques:', error);
      this.isSupported = false;
      this.detectByUserAgent();
    }
  }

  private detectByUserAgent() {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      
      // iOS Safari
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        this.hasFaceId = true;
        this.hasTouchId = true;
        this.isSupported = true;
      }
      
      // Android Chrome
      if (/Android/.test(userAgent) && /Chrome/.test(userAgent)) {
        this.hasFingerprint = true;
        this.isSupported = true;
      }
      
      // Desktop Chrome/Edge avec Windows Hello
      if (/Windows/.test(userAgent) && (/Chrome/.test(userAgent) || /Edg/.test(userAgent))) {
        this.hasFingerprint = true;
        this.hasFaceId = true;
        this.isSupported = true;
      }
    }
  }

  public getCapabilities(): BiometricCapabilities {
    return {
      hasFingerprint: this.hasFingerprint,
      hasFaceId: this.hasFaceId,
      hasTouchId: this.hasTouchId,
      isSupported: this.isSupported
    };
  }

  public async registerBiometric(userId: string, userInfo: { name: string; displayName: string }): Promise<BiometricResult> {
    try {
      if (!this.isSupported) {
        return { success: false, error: 'Authentification biométrique non supportée' };
      }

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32), // Générer un challenge aléatoire
          rp: {
            name: "NDJOBI",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userInfo.name,
            displayName: userInfo.displayName,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "direct"
        }
      });

      // Stocker les informations d'authentification
      if (credential) {
        localStorage.setItem(`biometric_${userId}`, JSON.stringify({
          credentialId: credential.id,
          registeredAt: new Date().toISOString()
        }));
      }

      return { success: true, credential };
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement biométrique:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de l\'enregistrement biométrique' 
      };
    }
  }

  public async authenticateBiometric(userId: string): Promise<BiometricResult> {
    try {
      if (!this.isSupported) {
        return { success: false, error: 'Authentification biométrique non supportée' };
      }

      // Vérifier si l'utilisateur a enregistré une authentification biométrique
      const storedAuth = localStorage.getItem(`biometric_${userId}`);
      if (!storedAuth) {
        return { success: false, error: 'Aucune authentification biométrique enregistrée' };
      }

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            type: "public-key",
            id: new TextEncoder().encode(JSON.parse(storedAuth).credentialId),
            transports: ["internal"]
          }],
          userVerification: "required",
          timeout: 30000 // Réduire le timeout à 30 secondes
        }
      });

      return { success: true, credential };
    } catch (error: any) {
      console.error('Erreur lors de l\'authentification biométrique:', error);
      
      // Gestion spécifique des erreurs WebAuthn
      let errorMessage = 'Authentification biométrique échouée';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Authentification annulée ou refusée par l\'utilisateur';
      } else if (error.name === 'TimeoutError') {
        errorMessage = 'Authentification expirée, veuillez réessayer';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Authentification biométrique non supportée sur cet appareil';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Erreur de sécurité, veuillez utiliser votre code PIN';
      } else if (error.name === 'InvalidStateError') {
        errorMessage = 'État invalide, veuillez réenregistrer votre authentification';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  public async isBiometricRegistered(userId: string): Promise<boolean> {
    const storedAuth = localStorage.getItem(`biometric_${userId}`);
    return !!storedAuth;
  }

  public async removeBiometricRegistration(userId: string): Promise<boolean> {
    try {
      localStorage.removeItem(`biometric_${userId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'authentification biométrique:', error);
      return false;
    }
  }

  public getBiometricIcon(): string {
    if (this.hasFaceId) return '👤'; // Face ID
    if (this.hasFingerprint) return '👆'; // Touch ID / Fingerprint
    return '🔐'; // Fallback
  }

  public getBiometricLabel(): string {
    if (this.hasFaceId) return 'Face ID';
    if (this.hasFingerprint) return 'Touch ID';
    return 'Authentification biométrique';
  }

  public async resetBiometricRegistration(userId: string): Promise<boolean> {
    try {
      // Supprimer l'enregistrement local
      localStorage.removeItem(`biometric_${userId}`);
      
      // Optionnel : supprimer aussi du serveur si nécessaire
      // await this.deleteFromServer(userId);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation biométrique:', error);
      return false;
    }
  }

  public getErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError') {
      return 'Authentification annulée. Utilisez votre code PIN.';
    } else if (error.name === 'TimeoutError') {
      return 'Authentification expirée. Réessayez.';
    } else if (error.name === 'NotSupportedError') {
      return 'Authentification biométrique non supportée.';
    } else if (error.name === 'SecurityError') {
      return 'Erreur de sécurité. Utilisez votre code PIN.';
    } else if (error.name === 'InvalidStateError') {
      return 'Authentification invalide. Réenregistrez-vous.';
    }
    return 'Erreur d\'authentification. Utilisez votre code PIN.';
  }
}

// Instance singleton
export const biometricAuth = new BiometricAuthService();
