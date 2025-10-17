import { useEffect, useState, useCallback } from 'react';
import { 
  RealtimeNotificationService, 
  CriticalCaseNotification 
} from '@/services/realtimeNotificationService';
import { useToast } from '@/hooks/use-toast';

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<CriticalCaseNotification[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleNewNotification = useCallback((notification: CriticalCaseNotification) => {
    setNotifications(prev => [notification, ...prev]);
    
    toast({
      title: '🚨 Nouveau Cas Critique',
      description: `${notification.title} - ${notification.location}`,
      variant: 'destructive',
      duration: 10000,
    });
  }, [toast]);

  const subscribe = useCallback(async () => {
    const hasPermission = await RealtimeNotificationService.requestNotificationPermission();
    
    if (!hasPermission) {
      toast({
        title: 'Notifications désactivées',
        description: 'Activez les notifications navigateur pour recevoir les alertes',
        variant: 'default',
      });
    }

    const unsubscribe = RealtimeNotificationService.subscribe(handleNewNotification);
    setIsSubscribed(true);

    return unsubscribe;
  }, [handleNewNotification, toast]);

  const unsubscribe = useCallback(() => {
    RealtimeNotificationService.unsubscribe();
    setIsSubscribed(false);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    return () => {
      RealtimeNotificationService.unsubscribe();
    };
  }, []);

  return {
    notifications,
    isSubscribed,
    subscribe,
    unsubscribe,
    clearNotifications
  };
}

