/**
 * Validateur de Sécurité - Module XR-7
 * 
 * Vérifie l'intégrité du système et empêche les modifications non autorisées
 */

import CryptoJS from 'crypto-js';

// Codes d'erreur obfusqués
const ERROR_CODES = {
  E001: 'System integrity check failed',
  E002: 'Unauthorized modification detected',
  E003: 'Security breach attempt',
  E004: 'Invalid authorization',
  E005: 'Module not available',
};

// Pattern du code d'urgence
const EMERGENCY_PATTERNS = [
  /^EMRG-\d{4}-\d{6}$/,
  /^URG-\d{4}-\d{6}$/,
  /^ÉTAT-\d{4}-\d{6}$/,
];

// Hash des mots de passe autorisés
const AUTHORIZED_HASHES = [
  'a7d2f3c91e8b4a5d6789c0b2e1f3a4d5', // R@XY
  'b8e3f4d02f9c5b6e7890d1c3f2e4b5e6', // Backup
];

class SecurityValidator {
  private static instance: SecurityValidator;
  private integrityChecks: Map<string, string> = new Map();
  private violationCount: number = 0;
  private maxViolations: number = 3;
  private lockoutTime: number = 3600000; // 1 heure
  private lastViolation: number = 0;

  private constructor() {
    this.initializeIntegrityChecks();
    this.startMonitoring();
  }

  static getInstance(): SecurityValidator {
    if (!SecurityValidator.instance) {
      SecurityValidator.instance = new SecurityValidator();
    }
    return SecurityValidator.instance;
  }

  /**
   * Initialise les checksums des fichiers critiques
   */
  private initializeIntegrityChecks(): void {
    // Checksums des modules critiques (à générer lors du build)
    this.integrityChecks.set('emergencyDecoder', 'expected_hash_1');
    this.integrityChecks.set('coreProtection', 'expected_hash_2');
    this.integrityChecks.set('EmergencyControl', 'expected_hash_3');
  }

  /**
   * Démarre la surveillance continue
   */
  private startMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Vérification périodique (toutes les 5 minutes)
    setInterval(() => {
      this.performIntegrityCheck();
    }, 300000);

    // Détection de modifications du DOM
    this.monitorDOMChanges();
    
    // Protection contre le debugging
    this.antiDebugging();
  }

  /**
   * Vérifie l'intégrité des modules
   */
  private performIntegrityCheck(): boolean {
    try {
      // En production, vérifier les checksums réels des fichiers
      // Pour l'instant, simulation
      const isValid = true;

      if (!isValid) {
        this.handleViolation('INTEGRITY_CHECK_FAILED');
        return false;
      }

      return true;
    } catch (error) {
      this.handleViolation('INTEGRITY_CHECK_ERROR');
      return false;
    }
  }

  /**
   * Monitore les changements du DOM pour détecter les injections
   */
  private monitorDOMChanges(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Détecter l'injection de scripts malveillants
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node: any) => {
            if (node.tagName === 'SCRIPT') {
              const src = node.getAttribute('src');
              if (src && !this.isAuthorizedScript(src)) {
                this.handleViolation('UNAUTHORIZED_SCRIPT_INJECTION');
                node.remove();
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Vérifie si un script est autorisé
   */
  private isAuthorizedScript(src: string): boolean {
    const authorizedDomains = [
      'localhost',
      '127.0.0.1',
      'supabase.co',
      'supabase.io',
    ];

    try {
      const url = new URL(src);
      return authorizedDomains.some(domain => url.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  /**
   * Protection anti-debugging
   */
  private antiDebugging(): void {
    // Détection de breakpoints
    setInterval(() => {
      const start = performance.now();
      debugger; // Si DevTools ouvert, pause ici
      const end = performance.now();
      
      if (end - start > 100) {
        this.handleViolation('DEBUGGER_DETECTED');
      }
    }, 1000);

    // Protection contre la modification de fonctions
    this.protectFunctions();
  }

  /**
   * Protège les fonctions critiques contre la modification
   */
  private protectFunctions(): void {
    const criticalFunctions = [
      'verifyAuthorization',
      'validateEmergencyCode',
      'checkPassword',
    ];

    criticalFunctions.forEach(fnName => {
      const fn = (this as any)[fnName];
      if (fn) {
        Object.freeze(fn);
        Object.defineProperty(this, fnName, {
          writable: false,
          configurable: false,
        });
      }
    });
  }

  /**
   * Gère une violation de sécurité
   */
  private handleViolation(type: string): void {
    console.error(`[Security] ${ERROR_CODES.E003}: ${type}`);
    
    this.violationCount++;
    this.lastViolation = Date.now();

    // Log l'incident
    this.logIncident(type);

    // Si trop de violations, verrouiller le système
    if (this.violationCount >= this.maxViolations) {
      this.lockdownSystem();
    }
  }

  /**
   * Enregistre un incident de sécurité
   */
  private logIncident(type: string): void {
    const incident = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.href,
      violationCount: this.violationCount,
    };

    // Envoyer au serveur (en production)
    try {
      fetch('/api/security/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident),
      }).catch(() => {});
    } catch {
      // Silent fail
    }

    // Stocker localement (chiffré)
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(incident),
      'incident_key'
    ).toString();
    
    sessionStorage.setItem(`incident_${Date.now()}`, encrypted);
  }

  /**
   * Verrouille le système après trop de violations
   */
  private lockdownSystem(): void {
    console.error('[Security] System locked due to multiple violations');
    
    // Effacer les données sensibles
    this.clearSensitiveData();
    
    // Désactiver les fonctionnalités
    this.disableFeatures();
    
    // Rediriger vers page d'erreur
    setTimeout(() => {
      window.location.href = '/maintenance';
    }, 1000);
  }

  /**
   * Efface les données sensibles
   */
  private clearSensitiveData(): void {
    // Nettoyer localStorage
    const keysToRemove = Object.keys(localStorage).filter(key =>
      key.includes('xr7') || 
      key.includes('emergency') || 
      key.includes('decoder')
    );
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Nettoyer sessionStorage
    sessionStorage.clear();
    
    // Nettoyer les cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }

  /**
   * Désactive les fonctionnalités sensibles
   */
  private disableFeatures(): void {
    // Désactiver les event listeners
    const newBody = document.body.cloneNode(true);
    document.body.parentNode?.replaceChild(newBody, document.body);
    
    // Bloquer les requêtes réseau
    if ('fetch' in window) {
      (window as any).fetch = () => Promise.reject(new Error('System locked'));
    }
    
    // Bloquer XMLHttpRequest
    (window as any).XMLHttpRequest = function() {
      throw new Error('System locked');
    };
  }

  // ========== MÉTHODES PUBLIQUES ==========

  /**
   * Vérifie si le système est verrouillé
   */
  isLocked(): boolean {
    if (this.violationCount >= this.maxViolations) {
      const timeSinceLastViolation = Date.now() - this.lastViolation;
      if (timeSinceLastViolation < this.lockoutTime) {
        return true;
      }
      // Reset après le temps de verrouillage
      this.violationCount = 0;
    }
    return false;
  }

  /**
   * Valide un code d'urgence
   */
  validateEmergencyCode(code: string): boolean {
    if (this.isLocked()) {
      return false;
    }

    const isValid = EMERGENCY_PATTERNS.some(pattern => pattern.test(code));
    
    if (!isValid) {
      this.handleViolation('INVALID_EMERGENCY_CODE');
    }
    
    return isValid;
  }

  /**
   * Vérifie un mot de passe
   */
  checkPassword(password: string): boolean {
    if (this.isLocked()) {
      return false;
    }

    const hash = CryptoJS.MD5(password).toString();
    const isValid = AUTHORIZED_HASHES.includes(hash);
    
    if (!isValid) {
      this.handleViolation('INVALID_PASSWORD');
    }
    
    return isValid;
  }

  /**
   * Vérifie l'autorisation complète
   */
  verifyAuthorization(password: string, emergencyCode: string): boolean {
    return !this.isLocked() && 
           this.checkPassword(password) && 
           this.validateEmergencyCode(emergencyCode);
  }

  /**
   * Obtient le statut du système
   */
  getSystemStatus(): {
    isLocked: boolean;
    violationCount: number;
    lastViolation: Date | null;
    timeUntilUnlock: number;
  } {
    const isLocked = this.isLocked();
    const timeUntilUnlock = isLocked 
      ? this.lockoutTime - (Date.now() - this.lastViolation)
      : 0;

    return {
      isLocked,
      violationCount: this.violationCount,
      lastViolation: this.lastViolation ? new Date(this.lastViolation) : null,
      timeUntilUnlock: Math.max(0, timeUntilUnlock),
    };
  }
}

// Export singleton
export const securityValidator = SecurityValidator.getInstance();

// Protection de l'export
if (typeof window !== 'undefined') {
  Object.freeze(securityValidator);
  
  // Masquer de window
  Object.defineProperty(window, 'securityValidator', {
    value: undefined,
    writable: false,
    enumerable: false,
    configurable: false,
  });
}

export default securityValidator;
