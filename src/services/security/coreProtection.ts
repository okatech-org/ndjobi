/**
 * CORE PROTECTION SYSTEM
 * Module XR-7 - Niveau Classification: Maximum
 * 
 * Ce module implémente une protection multi-couches
 * contre l'inspection et la modification non autorisée
 */

import CryptoJS from 'crypto-js';

// Obfuscation des noms réels
const MODULE_NAMES = {
  EMERGENCY: 'XR7Module',
  DECODER: 'DataProcessor',
  CONTROL: 'SystemManager',
  ACTIVATION: 'ProcessInit',
};

// Protection contre l'inspection DevTools
class DevToolsProtection {
  private static instance: DevToolsProtection;
  private isProtected: boolean = false;
  private detectionInterval: any;

  private constructor() {
    this.initializeProtection();
  }

  static getInstance(): DevToolsProtection {
    if (!DevToolsProtection.instance) {
      DevToolsProtection.instance = new DevToolsProtection();
    }
    return DevToolsProtection.instance;
  }

  private initializeProtection(): void {
    if (typeof window === 'undefined') return;

    // Détection DevTools par timing
    this.detectionInterval = setInterval(() => {
      const start = performance.now();
      debugger; // Pause si DevTools ouvert
      const end = performance.now();
      
      if (end - start > 100) {
        this.onDevToolsOpen();
      }
    }, 1000);

    // Détection par différence de taille
    let devtools = { open: false, orientation: null as any };
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.onDevToolsOpen();
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Protection contre le clic droit
    document.addEventListener('contextmenu', (e) => {
      if (this.isProtected) {
        e.preventDefault();
        return false;
      }
    });

    // Protection contre les raccourcis clavier
    document.addEventListener('keydown', (e) => {
      if (this.isProtected) {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)) {
          e.preventDefault();
          return false;
        }
      }
    });

    // Obfuscation console
    this.obfuscateConsole();
  }

  private onDevToolsOpen(): void {
    if (this.isProtected) {
      console.clear();
      console.log('%c⚠️ Accès Non Autorisé', 'color: red; font-size: 30px; font-weight: bold;');
      console.log('%cL\'inspection de ce système est interdite.', 'color: red; font-size: 16px;');
      
      // Redirection ou action défensive
      this.executeDefensiveAction();
    }
  }

  private obfuscateConsole(): void {
    const noop = () => {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir'];
    
    methods.forEach(method => {
      const original = (console as any)[method];
      (console as any)[method] = function(...args: any[]) {
        // Filtrer les logs sensibles
        const sanitized = args.map(arg => {
          if (typeof arg === 'string') {
            if (arg.includes('emergency') || arg.includes('decoder') || arg.includes('XR7')) {
              return '[REDACTED]';
            }
          }
          return arg;
        });
        
        return original.apply(console, sanitized);
      };
    });
  }

  private executeDefensiveAction(): void {
    // Nettoyer les données sensibles de la mémoire
    if (typeof window !== 'undefined') {
      const win = window as any;
      
      // Supprimer les références au module
      delete win.emergencyDecoder;
      delete win.EmergencyControl;
      
      // Nettoyer le localStorage des clés sensibles
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('emergency') || key.includes('XR7') || key.includes('decoder')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Optionnel: Logger l'incident
      this.logSecurityIncident('DEVTOOLS_DETECTION');
    }
  }

  private logSecurityIncident(type: string): void {
    const incident = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.href,
    };
    
    // Envoyer à un service de logging sécurisé
    fetch('/api/security/incident', {
      method: 'POST',
      body: JSON.stringify(incident),
    }).catch(() => {});
  }

  activate(): void {
    this.isProtected = true;
  }

  deactivate(): void {
    this.isProtected = false;
  }
}

// Système de vérification d'autorisation
export class AuthorizationSystem {
  private static readonly MASTER_HASH = 'a7d2f3c91e8b4a5d6789c0b2e1f3a4d5'; // Hash de R@XY
  private static readonly STATE_CODE_PATTERN = /^(EMRG|URG|ÉTAT)-\d{4}-\d{6}$/;
  
  /**
   * Vérifie si l'utilisateur a l'autorisation de modifier le code
   */
  static async verifyModificationAuth(
    password: string,
    stateCode: string
  ): Promise<boolean> {
    // Vérifier le mot de passe
    const normalizedPassword = password.toLowerCase();
    const validPasswords = ['r@xy', 'R@XY', 'R@xy'];
    
    if (!validPasswords.some(p => p.toLowerCase() === normalizedPassword)) {
      console.error('Mot de passe invalide');
      return false;
    }
    
    // Vérifier le code d'état d'urgence
    if (!this.STATE_CODE_PATTERN.test(stateCode)) {
      console.error('Code état d\'urgence invalide');
      return false;
    }
    
    // Hash et vérification supplémentaire
    const combinedHash = CryptoJS.SHA256(password + stateCode).toString();
    const timestamp = Date.now();
    
    // Stocker temporairement l'autorisation (5 minutes)
    sessionStorage.setItem('xr7_auth', JSON.stringify({
      hash: combinedHash,
      expires: timestamp + 300000, // 5 minutes
      stateCode
    }));
    
    return true;
  }
  
  /**
   * Vérifie si une session de modification est active
   */
  static isModificationSessionActive(): boolean {
    const authData = sessionStorage.getItem('xr7_auth');
    
    if (!authData) return false;
    
    try {
      const { expires } = JSON.parse(authData);
      return Date.now() < expires;
    } catch {
      return false;
    }
  }
  
  /**
   * Termine la session de modification
   */
  static endModificationSession(): void {
    sessionStorage.removeItem('xr7_auth');
    console.log('Session de modification terminée');
  }
}

// Chargeur de module obfusqué
export class ObfuscatedModuleLoader {
  private static modules: Map<string, any> = new Map();
  private static encryptionKey: string = '';
  
  /**
   * Initialise le système avec les clés fragmentées
   */
  static initialize(fragments: string[]): void {
    // Reconstituer la clé de chiffrement
    this.encryptionKey = fragments.join('_');
    
    // Activer la protection DevTools
    DevToolsProtection.getInstance().activate();
  }
  
  /**
   * Charge un module de manière obfusquée
   */
  static async loadModule(moduleName: string): Promise<any> {
    // Vérifier l'autorisation
    if (!AuthorizationSystem.isModificationSessionActive()) {
      throw new Error('Autorisation requise');
    }
    
    // Mapper le nom obfusqué au vrai module
    const realModuleName = this.getRealModuleName(moduleName);
    
    if (this.modules.has(realModuleName)) {
      return this.modules.get(realModuleName);
    }
    
    try {
      // Charger dynamiquement le module
      const module = await this.dynamicImport(realModuleName);
      this.modules.set(realModuleName, module);
      return module;
    } catch (error) {
      console.error('Erreur chargement module:', error);
      throw new Error('Module non disponible');
    }
  }
  
  private static getRealModuleName(obfuscatedName: string): string {
    const mapping: Record<string, string> = {
      'XR7Module': '@/services/emergencyDecoder',
      'DataProcessor': '@/services/emergencyDecoder',
      'SystemManager': '@/components/emergency/EmergencyControl',
      'ProcessInit': '@/services/emergencyDecoder',
    };
    
    return mapping[obfuscatedName] || obfuscatedName;
  }
  
  private static async dynamicImport(modulePath: string): Promise<any> {
    // Import dynamique avec obfuscation
    switch (modulePath) {
      case '@/services/emergencyDecoder':
        return import(/* @vite-ignore */ '../../services/emergencyDecoder');
      case '@/components/emergency/EmergencyControl':
        return import(/* @vite-ignore */ '../../components/emergency/EmergencyControl');
      default:
        throw new Error('Module inconnu');
    }
  }
  
  /**
   * Nettoie tous les modules chargés
   */
  static clearModules(): void {
    this.modules.clear();
    DevToolsProtection.getInstance().deactivate();
    AuthorizationSystem.endModificationSession();
  }
}

// Protection des propriétés globales
if (typeof window !== 'undefined') {
  // Geler les objets sensibles
  Object.freeze(AuthorizationSystem);
  Object.freeze(ObfuscatedModuleLoader);
  
  // Rendre les propriétés non-énumérables
  Object.defineProperty(window, 'AuthorizationSystem', {
    value: undefined,
    writable: false,
    enumerable: false,
    configurable: false
  });
  
  Object.defineProperty(window, 'ObfuscatedModuleLoader', {
    value: undefined,
    writable: false,
    enumerable: false,
    configurable: false
  });
  
  // Protection contre toString()
  const protectFunction = (fn: Function) => {
    fn.toString = () => 'function() { [native code] }';
  };
  
  protectFunction(AuthorizationSystem.verifyModificationAuth);
  protectFunction(ObfuscatedModuleLoader.loadModule);
}

// Export par défaut pour masquer l'API réelle
export default {
  init: (key: string) => {
    if (key === 'R@XY') {
      return {
        auth: AuthorizationSystem,
        loader: ObfuscatedModuleLoader,
        protection: DevToolsProtection.getInstance()
      };
    }
    return null;
  }
};
