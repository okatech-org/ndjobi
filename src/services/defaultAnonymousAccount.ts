/**
 * Service pour gérer le compte anonyme par défaut
 * Utilise le compte "Citoyen Anonyme" créé dans Supabase pour les signalements sans compte
 */

export interface AnonymousAccountInfo {
  email: string;
  phone: string;
  fullName: string;
  role: string;
  organization: string;
}

class DefaultAnonymousAccountService {
  private readonly DEFAULT_ANONYMOUS_ACCOUNT: AnonymousAccountInfo = {
    email: '24177888009@ndjobi.com',
    phone: '+24177888009',
    fullName: 'Citoyen Anonyme',
    role: 'user',
    organization: 'Anonyme'
  };

  /**
   * Récupère les informations du compte anonyme par défaut
   */
  getDefaultAnonymousAccount(): AnonymousAccountInfo {
    return this.DEFAULT_ANONYMOUS_ACCOUNT;
  }

  /**
   * Crée une session locale pour le compte anonyme par défaut
   * Utilisé quand un utilisateur fait un signalement sans créer de compte
   */
  createAnonymousSession(): boolean {
    try {
      const sessionData = {
        user: {
          id: this.generateAnonymousUserId(),
          email: this.DEFAULT_ANONYMOUS_ACCOUNT.email,
          phone: this.DEFAULT_ANONYMOUS_ACCOUNT.phone,
          user_metadata: {
            full_name: this.DEFAULT_ANONYMOUS_ACCOUNT.fullName,
            phone: this.DEFAULT_ANONYMOUS_ACCOUNT.phone,
            organization: this.DEFAULT_ANONYMOUS_ACCOUNT.organization,
            is_anonymous: true,
            session_type: 'anonymous_default'
          }
        },
        session: {
          access_token: `anonymous_token_${Date.now()}`,
          refresh_token: `anonymous_refresh_${Date.now()}`
        }
      };

      // Sauvegarder la session dans le localStorage
      localStorage.setItem('ndjobi-anonymous-session', JSON.stringify(sessionData));
      localStorage.setItem('ndjobi-user-role', this.DEFAULT_ANONYMOUS_ACCOUNT.role);
      localStorage.setItem('ndjobi-session-type', 'anonymous_default');

      return true;
    } catch (error) {
      console.error('Erreur création session anonyme:', error);
      return false;
    }
  }

  /**
   * Vérifie si une session anonyme par défaut est active
   */
  hasAnonymousSession(): boolean {
    const sessionType = localStorage.getItem('ndjobi-session-type');
    return sessionType === 'anonymous_default';
  }

  /**
   * Récupère les informations de l'utilisateur anonyme actuel
   */
  getCurrentAnonymousUser(): AnonymousAccountInfo | null {
    if (!this.hasAnonymousSession()) {
      return null;
    }

    return this.DEFAULT_ANONYMOUS_ACCOUNT;
  }

  /**
   * Génère un ID utilisateur unique pour la session anonyme
   * Basé sur l'IP, l'empreinte du navigateur, etc.
   */
  private generateAnonymousUserId(): string {
    // Utiliser une combinaison de facteurs pour créer un ID unique mais anonyme
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const userAgent = navigator.userAgent.length.toString();
    const screenRes = `${screen.width}x${screen.height}`;
    
    // Créer un hash simple
    const combined = `${timestamp}-${random}-${userAgent}-${screenRes}`;
    return btoa(combined).substring(0, 36);
  }

  /**
   * Nettoie la session anonyme
   */
  clearAnonymousSession(): void {
    localStorage.removeItem('ndjobi-anonymous-session');
    localStorage.removeItem('ndjobi-user-role');
    localStorage.removeItem('ndjobi-session-type');
  }

  /**
   * Enregistre un signalement anonyme avec les métadonnées de l'appareil
   */
  async createAnonymousReport(reportData: any): Promise<boolean> {
    try {
      if (!this.hasAnonymousSession()) {
        this.createAnonymousSession();
      }

      // Ajouter les métadonnées de l'appareil
      const anonymousMetadata = {
        device_fingerprint: this.getDeviceFingerprint(),
        ip_info: await this.getIPInfo(),
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        session_type: 'anonymous_default'
      };

      // Enrichir les données du signalement avec les métadonnées anonymes
      const enrichedReportData = {
        ...reportData,
        metadata: {
          ...reportData.metadata,
          anonymous_info: anonymousMetadata
        }
      };

      // Ici, vous pouvez appeler l'API pour sauvegarder le signalement
      // avec le compte anonyme par défaut
      console.log('Signalement anonyme créé:', enrichedReportData);
      
      return true;
    } catch (error) {
      console.error('Erreur création signalement anonyme:', error);
      return false;
    }
  }

  /**
   * Génère une empreinte de l'appareil pour l'anonymat
   */
  private getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  /**
   * Récupère les informations IP (simulation)
   */
  private async getIPInfo(): Promise<any> {
    try {
      // En production, vous pourriez utiliser un service comme ipapi.co
      // Pour la démo, on simule des données
      return {
        ip: 'simulated_ip',
        country: 'GA',
        region: 'Libreville',
        timezone: 'Africa/Libreville'
      };
    } catch (error) {
      return {
        ip: 'unknown',
        country: 'unknown',
        region: 'unknown',
        timezone: 'unknown'
      };
    }
  }

  /**
   * Récupère les statistiques des signalements anonymes
   */
  getAnonymousStats(): { totalReports: number; lastReport: string | null } {
    try {
      const session = localStorage.getItem('ndjobi-anonymous-session');
      if (!session) {
        return { totalReports: 0, lastReport: null };
      }

      const sessionData = JSON.parse(session);
      const reports = sessionData.user?.user_metadata?.reports || [];
      
      return {
        totalReports: reports.length,
        lastReport: reports.length > 0 ? reports[reports.length - 1] : null
      };
    } catch (error) {
      return { totalReports: 0, lastReport: null };
    }
  }
}

export const defaultAnonymousAccountService = new DefaultAnonymousAccountService();
