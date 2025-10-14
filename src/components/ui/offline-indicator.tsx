import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { offlineService } from '@/services/offlineService';
import { useToast } from '@/hooks/use-toast';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Connexion rétablie',
        description: 'Synchronisation automatique en cours...',
      });
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Mode hors ligne',
        description: 'Vos données seront synchronisées à la reconnexion',
        variant: 'destructive',
      });
    };

    const updateQueueSize = () => {
      setQueueSize(offlineService.getQueueSize());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const interval = setInterval(updateQueueSize, 5000);
    updateQueueSize();

    offlineService.setupAutoSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline || syncing) return;

    setSyncing(true);
    try {
      const results = await offlineService.syncQueue();
      setQueueSize(offlineService.getQueueSize());
      
      if (results.success > 0) {
        toast({
          title: 'Synchronisation réussie',
          description: `${results.success} élément(s) synchronisé(s)`,
        });
      }
      
      if (results.failed > 0) {
        toast({
          title: 'Synchronisation partielle',
          description: `${results.failed} élément(s) n'ont pas pu être synchronisés`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur de synchronisation',
        description: 'Une erreur est survenue lors de la synchronisation',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline && queueSize === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'sm:bottom-6 sm:right-6'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border',
          'backdrop-blur-sm',
          isOnline ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
        )}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
          
          <div>
            <p className={cn(
              'text-sm font-medium',
              isOnline ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
            )}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </p>
            {queueSize > 0 && (
              <p className="text-xs text-muted-foreground">
                {queueSize} élément(s) en attente
              </p>
            )}
          </div>
        </div>

        {queueSize > 0 && (
          <Badge variant={isOnline ? 'default' : 'secondary'}>
            {queueSize}
          </Badge>
        )}

        {isOnline && queueSize > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>
          Mode hors ligne - Vos modifications seront synchronisées à la reconnexion
        </span>
      </div>
    </div>
  );
};

