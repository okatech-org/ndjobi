import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CriticalCaseNotification {
  id: string;
  title: string;
  type: string;
  priority: string;
  location: string;
  ai_priority_score?: number;
  created_at: string;
}

type NotificationCallback = (notification: CriticalCaseNotification) => void;

export class RealtimeNotificationService {
  private static channel: RealtimeChannel | null = null;
  private static callbacks: NotificationCallback[] = [];

  static subscribe(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);

    if (!this.channel) {
      this.initializeChannel();
    }

    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
      if (this.callbacks.length === 0) {
        this.unsubscribe();
      }
    };
  }

  private static initializeChannel() {
    console.log('🔔 Initialisation notifications temps réel cas critiques');

    this.channel = supabase
      .channel('cas-critiques-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signalements',
          filter: 'priority=eq.critique'
        },
        (payload) => {
          console.log('🚨 Nouveau cas critique détecté:', payload);
          this.handleNewCriticalCase(payload.new as any);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'signalements',
          filter: 'priority=eq.critique'
        },
        (payload) => {
          console.log('🔄 Mise à jour cas critique:', payload);
          this.handleNewCriticalCase(payload.new as any);
        }
      )
      .subscribe((status) => {
        console.log('📡 Statut subscription Realtime:', status);
      });
  }

  private static handleNewCriticalCase(caseData: any) {
    const notification: CriticalCaseNotification = {
      id: caseData.id,
      title: caseData.title || caseData.titre || 'Cas critique',
      type: caseData.type,
      priority: caseData.priority,
      location: caseData.location,
      ai_priority_score: caseData.ai_priority_score,
      created_at: caseData.created_at
    };

    this.callbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Erreur callback notification:', error);
      }
    });

    this.showBrowserNotification(notification);
  }

  private static async showBrowserNotification(notification: CriticalCaseNotification) {
    if (!('Notification' in window)) {
      console.warn('Notifications navigateur non supportées');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('🚨 Nouveau Cas Critique - Protocole d\'État', {
        body: `${notification.title}\nLocalisation: ${notification.location}\nPriorité: ${notification.priority}`,
        icon: '/logo_ndjobi.png',
        badge: '/logo_ndjobi.png',
        tag: `cas-critique-${notification.id}`,
        requireInteraction: true,
        data: { casId: notification.id }
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showBrowserNotification(notification);
      }
    }
  }

  static unsubscribe() {
    if (this.channel) {
      console.log('🔕 Désabonnement notifications temps réel');
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.callbacks = [];
  }

  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications navigateur non supportées');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static subscribeToPresidentialDecisions(callback: (decision: any) => void): () => void {
    console.log('🏛️ Abonnement décisions présidentielles');

    const channel = supabase
      .channel('presidential-decisions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'presidential_decisions'
        },
        (payload) => {
          console.log('✅ Nouvelle décision présidentielle:', payload);
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  static subscribeToDirectives(callback: (directive: any) => void): () => void {
    console.log('📢 Abonnement directives présidentielles');

    const channel = supabase
      .channel('presidential-directives')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'presidential_directives'
        },
        (payload) => {
          console.log('📣 Nouvelle directive présidentielle:', payload);
          callback(payload.new);
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('📢 Nouvelle Directive Présidentielle', {
              body: payload.new.title,
              icon: '/logo_ndjobi.png',
              requireInteraction: true
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}

