import { useState, useEffect } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  silent?: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async show(options: NotificationOptions): Promise<boolean> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        return false;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/logo_ndjobi.png',
        badge: options.badge || '/logo_ndjobi.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        if (options.data?.url) {
          window.location.href = options.data.url as string;
        }
      };

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  async notifyReportUpdate(reportId: string, status: string): Promise<void> {
    const statusMessages: Record<string, string> = {
      processing: 'Votre signalement est en cours de traitement',
      resolved: 'Votre signalement a été résolu',
      closed: 'Votre signalement a été clôturé',
    };

    await this.show({
      title: 'Mise à jour - Ndjobi',
      body: statusMessages[status] || 'Votre signalement a été mis à jour',
      tag: `report-${reportId}`,
      data: { url: '/dashboard/user?view=files' },
    });
  }

  async notifyProjectUpdate(projectId: string, status: string): Promise<void> {
    const statusMessages: Record<string, string> = {
      protected: 'Votre projet a été protégé avec succès',
      reviewed: 'Votre projet a été examiné',
    };

    await this.show({
      title: 'Projet Protégé - Ndjobi',
      body: statusMessages[status] || 'Votre projet a été mis à jour',
      tag: `project-${projectId}`,
      data: { url: '/dashboard/user?view=files' },
    });
  }

  async notifyNewMessage(message: string): Promise<void> {
    await this.show({
      title: 'Nouveau message',
      body: message,
      tag: 'message',
    });
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }

  async scheduleNotification(
    options: NotificationOptions,
    delayMs: number
  ): Promise<number> {
    return window.setTimeout(() => {
      this.show(options);
    }, delayMs);
  }

  cancelScheduledNotification(id: number): void {
    clearTimeout(id);
  }

  async showWithSound(options: NotificationOptions): Promise<boolean> {
    const success = await this.show({ ...options, silent: false });
    
    if (success) {
      this.playNotificationSound();
    }
    
    return success;
  }

  private playNotificationSound(): void {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.warn('Could not play notification sound');
    }
  }

  async testNotification(): Promise<boolean> {
    return await this.show({
      title: 'Test de notification',
      body: 'Les notifications fonctionnent correctement ! 🎉',
      tag: 'test',
      requireInteraction: false,
    });
  }
}

export const notificationService = new NotificationService();

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setPermission(notificationService.getPermission());
  }, []);

  const requestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermission());
    return granted;
  };

  const showNotification = async (options: NotificationOptions) => {
    return await notificationService.show(options);
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    notifyReportUpdate: notificationService.notifyReportUpdate.bind(notificationService),
    notifyProjectUpdate: notificationService.notifyProjectUpdate.bind(notificationService),
    testNotification: notificationService.testNotification.bind(notificationService),
  };
};

