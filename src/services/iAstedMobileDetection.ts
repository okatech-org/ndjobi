/**
 * Service de détection des problèmes mobiles pour iAsted
 * 
 * Détecte automatiquement les problèmes de configuration sur:
 * - iOS Safari
 * - Android Chrome
 * - Autres navigateurs mobiles
 */

export interface MobileIssue {
  type: 'critical' | 'warning' | 'info';
  platform: 'ios' | 'android' | 'desktop';
  title: string;
  description: string;
  solution: string[];
}

export class IAstedMobileDetection {
  
  /**
   * Détecter la plateforme actuelle
   */
  static detectPlatform(): 'ios' | 'android' | 'desktop' {
    if (typeof navigator === 'undefined') {
      return 'desktop';
    }
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/ipad|iphone|ipod/.test(userAgent)) {
      return 'ios';
    } else if (/android/.test(userAgent)) {
      return 'android';
    } else {
      return 'desktop';
    }
  }

  /**
   * Détecter tous les problèmes potentiels
   */
  static detectAllIssues(): MobileIssue[] {
    const platform = this.detectPlatform();
    const issues: MobileIssue[] = [];

    // Problèmes communs à toutes les plateformes
    issues.push(...this.detectCommonIssues());

    // Problèmes spécifiques par plateforme
    switch (platform) {
      case 'ios':
        issues.push(...this.detectIOSIssues());
        break;
      case 'android':
        issues.push(...this.detectAndroidIssues());
        break;
      case 'desktop':
        issues.push(...this.detectDesktopIssues());
        break;
    }

    return issues;
  }

  /**
   * Problèmes communs à toutes les plateformes
   */
  private static detectCommonIssues(): MobileIssue[] {
    const issues: MobileIssue[] = [];

    // Vérifier HTTPS (uniquement en environnement navigateur)
    if (typeof location !== 'undefined' && location.protocol !== 'https:' && location.hostname !== 'localhost') {
      issues.push({
        type: 'critical',
        platform: 'desktop',
        title: 'HTTPS requis',
        description: 'iAsted nécessite une connexion sécurisée HTTPS',
        solution: [
          'Accédez à l\'application via HTTPS',
          'Acceptez le certificat SSL si demandé'
        ]
      });
    }

    // Vérifier les APIs nécessaires (uniquement en environnement navigateur)
    if (typeof navigator !== 'undefined' && !navigator.mediaDevices) {
      issues.push({
        type: 'critical',
        platform: 'desktop',
        title: 'MediaDevices API non disponible',
        description: 'L\'API MediaDevices est requise pour l\'audio',
        solution: [
          'Utilisez un navigateur moderne (Chrome, Firefox, Safari)',
          'Mettez à jour votre navigateur'
        ]
      });
    }

    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      issues.push({
        type: 'warning',
        platform: 'desktop',
        title: 'Speech Synthesis non supporté',
        description: 'La synthèse vocale ne sera pas disponible',
        solution: [
          'Utilisez un navigateur moderne',
          'Activez JavaScript'
        ]
      });
    }

    return issues;
  }

  /**
   * Problèmes spécifiques iOS Safari
   */
  private static detectIOSIssues(): MobileIssue[] {
    const issues: MobileIssue[] = [];

    const isSafari = typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isSafari) {
      issues.push({
        type: 'critical',
        platform: 'ios',
        title: 'Protection de la confidentialité Safari',
        description: 'La "Protection de la confidentialité lors des mesures publicitaires" bloque l\'audio',
        solution: [
          'Ouvrez Réglages > Safari',
          'Appuyez sur "Avancé"',
          'Désactivez "Protection de la confidentialité lors des mesures publicitaires"'
        ]
      });

      issues.push({
        type: 'critical',
        platform: 'ios',
        title: 'Autorisations microphone',
        description: 'Safari doit avoir accès au microphone',
        solution: [
          'Ouvrez Réglages > Safari',
          'Appuyez sur "Sites web"',
          'Sélectionnez "Microphone"',
          'Autorisez pour ndjobi.com'
        ]
      });

      issues.push({
        type: 'warning',
        platform: 'ios',
        title: 'JavaScript requis',
        description: 'JavaScript doit être activé dans Safari',
        solution: [
          'Ouvrez Réglages > Safari',
          'Appuyez sur "Avancé"',
          'Activez "JavaScript"'
        ]
      });

      issues.push({
        type: 'info',
        platform: 'ios',
        title: 'Navigation privée',
        description: 'Évitez le mode navigation privée pour iAsted',
        solution: [
          'Utilisez Safari en mode normal',
          'Évitez le mode navigation privée'
        ]
      });
    }

    // Vérifier AudioContext
    if (typeof window !== 'undefined' && !window.AudioContext && !window.webkitAudioContext) {
      issues.push({
        type: 'critical',
        platform: 'ios',
        title: 'AudioContext non supporté',
        description: 'L\'AudioContext est requis pour la gestion audio',
        solution: [
          'Mettez à jour Safari vers la dernière version',
          'Redémarrez l\'appareil'
        ]
      });
    }

    return issues;
  }

  /**
   * Problèmes spécifiques Android
   */
  private static detectAndroidIssues(): MobileIssue[] {
    const issues: MobileIssue[] = [];

    const isChrome = typeof navigator !== 'undefined' && /Chrome/.test(navigator.userAgent);

    if (isChrome) {
      issues.push({
        type: 'critical',
        platform: 'android',
        title: 'Autorisations microphone Chrome',
        description: 'Chrome doit avoir accès au microphone',
        solution: [
          'Ouvrez Chrome',
          'Appuyez sur les trois points > Paramètres',
          'Sélectionnez "Paramètres du site"',
          'Trouvez ndjobi.com',
          'Activez "Microphone"'
        ]
      });

      issues.push({
        type: 'info',
        platform: 'android',
        title: 'Mode navigation privée',
        description: 'Évitez le mode navigation privée',
        solution: [
          'Utilisez Chrome en mode normal',
          'Évitez le mode incognito'
        ]
      });
    }

    return issues;
  }

  /**
   * Problèmes spécifiques Desktop
   */
  private static detectDesktopIssues(): MobileIssue[] {
    const issues: MobileIssue[] = [];

    issues.push({
      type: 'critical',
      platform: 'desktop',
      title: 'Autorisations microphone',
      description: 'Le navigateur doit avoir accès au microphone',
      solution: [
        'Cliquez sur l\'icône de verrou à côté de l\'URL',
        'Activez l\'autorisation "Microphone"',
        'Actualisez la page'
      ]
    });

    return issues;
  }

  /**
   * Obtenir un message de résumé des problèmes
   */
  static getSummaryMessage(issues: MobileIssue[]): string {
    const criticalIssues = issues.filter(i => i.type === 'critical');
    const warningIssues = issues.filter(i => i.type === 'warning');

    if (criticalIssues.length > 0) {
      return `⚠️ ${criticalIssues.length} problème(s) critique(s) détecté(s). Consultez le guide de dépannage.`;
    } else if (warningIssues.length > 0) {
      return `ℹ️ ${warningIssues.length} avertissement(s) détecté(s). iAsted devrait fonctionner.`;
    } else {
      return '✅ Configuration détectée comme compatible avec iAsted.';
    }
  }

  /**
   * Vérifier si la plateforme est compatible
   */
  static isPlatformCompatible(): boolean {
    const issues = this.detectAllIssues();
    return issues.filter(i => i.type === 'critical').length === 0;
  }
}
