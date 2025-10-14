import { captureBusinessEvent, addBreadcrumb, measurePerformance } from './sentryConfig';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserJourney {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  startTime: number;
  lastActivity: number;
}

class AnalyticsService {
  private sessionId: string = `ndjobi_${Date.now()}`;
  private userId: string | null = null;
  private currentJourney: UserJourney | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline: boolean = true;

  constructor() {
    if (typeof window === 'undefined') return;
    
    try {
      this.isOnline = navigator.onLine;
      this.initializeSession();
      this.setupNetworkListeners();
    } catch (error) {
      console.debug('Analytics initialization skipped:', error);
    }
  }

  /**
   * Génère un ID de session unique
   */
  private generateSessionId(): string {
    return `ndjobi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialise la session analytics
   */
  private initializeSession(): void {
    // Récupération des données de session précédente si applicable
    const savedSession = sessionStorage.getItem('ndjobi_analytics_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (Date.now() - session.lastActivity < 30 * 60 * 1000) { // 30 minutes
          this.sessionId = session.sessionId;
        }
      } catch {
        // Ignorer les erreurs de parsing
      }
    }

    this.trackEvent('session_start', {
      session_id: this.sessionId,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  /**
   * Configure les listeners réseau
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.trackEvent('network_online');
      this.flushEventQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.trackEvent('network_offline');
    });

    // Flush des événements avant fermeture
    window.addEventListener('beforeunload', () => {
      this.flushEventQueue();
      this.trackEvent('session_end', {
        session_duration: Date.now() - (this.currentJourney?.startTime || Date.now()),
        events_count: this.currentJourney?.events.length || 0,
      });
    });
  }

  /**
   * Définit l'utilisateur actuel
   */
  setUser(userId: string, properties: Record<string, any> = {}): void {
    this.userId = userId;
    
    // Démarrer un nouveau parcours utilisateur
    this.currentJourney = {
      userId,
      sessionId: this.sessionId,
      events: [],
      startTime: Date.now(),
      lastActivity: Date.now(),
    };

    this.trackEvent('user_identified', {
      user_id: userId,
      ...properties,
    });

    // Sauvegarder la session
    sessionStorage.setItem('ndjobi_analytics_session', JSON.stringify({
      sessionId: this.sessionId,
      userId,
      lastActivity: Date.now(),
    }));
  }

  /**
   * Supprime l'utilisateur (déconnexion)
   */
  clearUser(): void {
    if (this.currentJourney) {
      this.trackEvent('user_logout', {
        session_duration: Date.now() - this.currentJourney.startTime,
        events_in_session: this.currentJourney.events.length,
      });
    }

    this.userId = null;
    this.currentJourney = null;
    sessionStorage.removeItem('ndjobi_analytics_session');
  }

  /**
   * Track un événement analytics
   */
  trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        session_id: this.sessionId,
        user_id: this.userId,
        timestamp: Date.now(),
        page_url: window.location.href,
        page_title: document.title,
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    // Ajouter à la queue
    this.eventQueue.push(event);

    // Ajouter au parcours utilisateur
    if (this.currentJourney) {
      this.currentJourney.events.push(event);
      this.currentJourney.lastActivity = Date.now();
    }

    // Breadcrumb Sentry
    addBreadcrumb(`Analytics: ${eventName}`, 'analytics', 'info', properties);

    // Capturer l'événement métier important dans Sentry
    if (this.isImportantBusinessEvent(eventName)) {
      captureBusinessEvent(eventName, properties);
    }

    // Flush si online
    if (this.isOnline && this.eventQueue.length > 0) {
      this.flushEventQueue();
    }

    console.debug('Analytics Event:', eventName, properties);
  }

  /**
   * Détermine si un événement est important pour le business
   */
  private isImportantBusinessEvent(eventName: string): boolean {
    const importantEvents = [
      'report_submitted',
      'project_protected',
      'user_registered',
      'user_login',
      'payment_completed',
      'blockchain_transaction',
      'encryption_used',
      'ai_chat_started',
      'critical_error',
    ];
    return importantEvents.includes(eventName);
  }

  /**
   * Envoie les événements en queue vers le serveur
   */
  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isOnline) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // En production, envoyer vers votre endpoint analytics
      if (import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_ENDPOINT) {
        await fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: eventsToSend,
            session_id: this.sessionId,
            user_id: this.userId,
          }),
        });
      }
    } catch (error) {
      console.warn('Erreur envoi analytics:', error);
      // Remettre les événements en queue
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  /**
   * Mesure la performance d'une opération
   */
  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata: Record<string, any> = {}
  ): Promise<T> {
    const startTime = Date.now();
    
    this.trackEvent(`${operationName}_started`, metadata);

    try {
      const result = await measurePerformance(operationName, operation, metadata);
      
      this.trackEvent(`${operationName}_completed`, {
        ...metadata,
        duration: Date.now() - startTime,
        success: true,
      });

      return result;
    } catch (error) {
      this.trackEvent(`${operationName}_failed`, {
        ...metadata,
        duration: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      });
      throw error;
    }
  }

  /**
   * Track les événements spécifiques à Ndjobi
   */
  
  // Événements de signalement
  trackReportEvent(action: 'started' | 'submitted' | 'failed', metadata: Record<string, any> = {}): void {
    this.trackEvent(`report_${action}`, {
      ...metadata,
      feature: 'corruption_reporting',
    });
  }

  // Événements de protection de projet
  trackProjectEvent(action: 'started' | 'protected' | 'failed' | 'verified', metadata: Record<string, any> = {}): void {
    this.trackEvent(`project_${action}`, {
      ...metadata,
      feature: 'project_protection',
    });
  }

  // Événements blockchain
  trackBlockchainEvent(action: 'transaction_started' | 'transaction_confirmed' | 'transaction_failed', metadata: Record<string, any> = {}): void {
    this.trackEvent(`blockchain_${action}`, {
      ...metadata,
      feature: 'blockchain',
    });
  }

  // Événements de chiffrement
  trackEncryptionEvent(action: 'encrypt' | 'decrypt' | 'key_generated', metadata: Record<string, any> = {}): void {
    this.trackEvent(`encryption_${action}`, {
      ...metadata,
      feature: 'encryption',
    });
  }

  // Événements IA
  trackAIEvent(action: 'chat_started' | 'message_sent' | 'message_received' | 'chat_ended', metadata: Record<string, any> = {}): void {
    this.trackEvent(`ai_${action}`, {
      ...metadata,
      feature: 'ai_assistant',
    });
  }

  // Événements d'authentification
  trackAuthEvent(action: 'login_attempt' | 'login_success' | 'login_failed' | 'logout', metadata: Record<string, any> = {}): void {
    this.trackEvent(`auth_${action}`, {
      ...metadata,
      feature: 'authentication',
    });
  }

  // Événements de navigation
  trackNavigationEvent(page: string, metadata: Record<string, any> = {}): void {
    this.trackEvent('page_view', {
      page,
      ...metadata,
      feature: 'navigation',
    });
  }

  // Événements d'erreur
  trackErrorEvent(error: Error, context: Record<string, any> = {}): void {
    this.trackEvent('error_occurred', {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack?.substring(0, 500), // Limiter la taille
      ...context,
      feature: 'error_handling',
    });
  }

  /**
   * Obtient les statistiques de la session actuelle
   */
  getSessionStats(): {
    sessionId: string;
    userId: string | null;
    eventsCount: number;
    sessionDuration: number;
    isOnline: boolean;
  } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      eventsCount: this.currentJourney?.events.length || 0,
      sessionDuration: this.currentJourney 
        ? Date.now() - this.currentJourney.startTime 
        : 0,
      isOnline: this.isOnline,
    };
  }

  /**
   * Exporte les données de session (pour debug)
   */
  exportSessionData(): UserJourney | null {
    return this.currentJourney;
  }
}

// Instance singleton
export const analyticsService = new AnalyticsService();

// Helper functions pour usage facile
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analyticsService.trackEvent(name, properties);
};

export const trackAIChatEvent = (action: string, metadata: Record<string, any> = {}) => {
  analyticsService.trackAIEvent(action as any, metadata);
};

export const trackReportSubmission = (metadata: Record<string, any> = {}) => {
  analyticsService.trackReportEvent('submitted', metadata);
};

export const trackProjectProtection = (metadata: Record<string, any> = {}) => {
  analyticsService.trackProjectEvent('protected', metadata);
};

export const trackUserAuth = (action: string, metadata: Record<string, any> = {}) => {
  analyticsService.trackAuthEvent(action as any, metadata);
};

export default analyticsService;
