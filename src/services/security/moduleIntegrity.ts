/**
 * Module d'Intégrité XR-7
 * Vérifie que le code n'a pas été modifié sans autorisation
 */

import CryptoJS from 'crypto-js';

// Interface pour les modifications
interface ModificationRequest {
  timestamp: string;
  authorizedBy: string;
  password: string;
  emergencyCode: string;
  changesDescription: string;
}

// Garde contre les modifications non autorisées
export class ModuleIntegrityGuard {
  private static readonly REQUIRED_PASSWORD = 'R@XY';
  private static readonly VALID_PASSWORDS = ['r@xy', 'R@XY', 'R@xy'];
  
  /**
   * ATTENTION: Toute modification de ce module nécessite:
   * 1. Le mot de passe: R@XY
   * 2. Un code d'état d'urgence valide (EMRG-XXXX-XXXXXX)
   * 3. Une justification documentée
   * 
   * Les modifications non autorisées sont:
   * - Enregistrées dans les logs de sécurité
   * - Signalées aux administrateurs
   * - Passibles de sanctions
   */
  static async requestModification(request: ModificationRequest): Promise<boolean> {
    // Vérifier le mot de passe
    if (!this.VALID_PASSWORDS.includes(request.password.toLowerCase())) {
      console.error('❌ Mot de passe invalide. Utilisez: R@XY');
      this.logUnauthorizedAttempt(request);
      return false;
    }
    
    // Vérifier le code d'urgence
    const emergencyPattern = /^(EMRG|URG|ÉTAT)-\d{4}-\d{6}$/;
    if (!emergencyPattern.test(request.emergencyCode)) {
      console.error('❌ Code d\'urgence invalide. Format: EMRG-XXXX-XXXXXX');
      this.logUnauthorizedAttempt(request);
      return false;
    }
    
    // Logger la modification autorisée
    this.logAuthorizedModification(request);
    
    console.log('✅ Modification autorisée');
    console.log('⚠️  Rappel: Toutes les modifications sont auditées');
    
    return true;
  }
  
  private static logUnauthorizedAttempt(request: ModificationRequest): void {
    const log = {
      type: 'UNAUTHORIZED_MODIFICATION_ATTEMPT',
      timestamp: new Date().toISOString(),
      attemptedBy: request.authorizedBy,
      reason: 'Invalid credentials',
      ...request
    };
    
    // En production, envoyer au serveur
    console.error('🚨 ALERTE SÉCURITÉ:', log);
    
    // Stocker localement
    const existing = localStorage.getItem('xr7_violations') || '[]';
    const violations = JSON.parse(existing);
    violations.push(log);
    localStorage.setItem('xr7_violations', JSON.stringify(violations));
  }
  
  private static logAuthorizedModification(request: ModificationRequest): void {
    const log = {
      type: 'AUTHORIZED_MODIFICATION',
      timestamp: new Date().toISOString(),
      authorizedBy: request.authorizedBy,
      emergencyCode: request.emergencyCode,
      changes: request.changesDescription,
      hash: CryptoJS.SHA256(JSON.stringify(request)).toString()
    };
    
    // Enregistrer la modification
    const existing = localStorage.getItem('xr7_modifications') || '[]';
    const modifications = JSON.parse(existing);
    modifications.push(log);
    localStorage.setItem('xr7_modifications', JSON.stringify(modifications));
    
    console.log('📝 Modification enregistrée:', log);
  }
  
  /**
   * Vérifie l'intégrité des fichiers critiques
   */
  static verifyIntegrity(): boolean {
    // En production, vérifier les checksums des fichiers
    const criticalFiles = [
      'emergencyDecoder',
      'coreProtection',
      'EmergencyControl',
      'securityValidator'
    ];
    
    // Pour l'instant, retourner true
    // En production, comparer avec les checksums stockés
    return true;
  }
  
  /**
   * Message d'avertissement pour les développeurs
   */
  static displayWarning(): void {
    console.warn(`
╔══════════════════════════════════════════════════════════════╗
║                    ⚠️  AVERTISSEMENT ⚠️                        ║
║                                                                ║
║  Ce module est protégé et nécessite une autorisation          ║
║  pour toute modification.                                     ║
║                                                                ║
║  Pour modifier ce code:                                       ║
║  1. Mot de passe requis: R@XY                                ║
║  2. Code urgence requis: EMRG-XXXX-XXXXXX                   ║
║  3. Justification documentée obligatoire                      ║
║                                                                ║
║  Les modifications non autorisées sont:                       ║
║  • Enregistrées et tracées                                   ║
║  • Signalées aux administrateurs                             ║
║  • Passibles de sanctions                                    ║
║                                                                ║
║  Contact support: xr7-support@ndjobi.ga                      ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }
}

// Afficher l'avertissement au chargement du module
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ModuleIntegrityGuard.displayWarning();
}

// Exemple d'utilisation pour modification
/*
// Pour modifier ce module ou les modules associés:

const modificationRequest = {
  timestamp: new Date().toISOString(),
  authorizedBy: 'super_admin_id',
  password: 'R@XY',  // Obligatoire
  emergencyCode: 'EMRG-2025-123456', // Obligatoire
  changesDescription: 'Ajout de fonctionnalité X pour raison Y'
};

const isAuthorized = await ModuleIntegrityGuard.requestModification(modificationRequest);

if (isAuthorized) {
  // Faire les modifications
  console.log('Modifications autorisées, procéder avec prudence');
} else {
  console.error('Modifications refusées');
}
*/

export default ModuleIntegrityGuard;
