import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, AlertTriangle, FileText } from 'lucide-react';
import type { AgentRole } from '@/services/signalementRouting';

interface AgentRealtimeNotificationsProps {
  agentRole: AgentRole;
  onNewSignalement?: () => void;
}

/**
 * Composant pour les notifications temps réel des nouveaux signalements
 * assignés à un agent spécialisé
 */
const AgentRealtimeNotifications = ({ 
  agentRole, 
  onNewSignalement 
}: AgentRealtimeNotificationsProps) => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // S'abonner aux nouveaux signalements assignés à ce rôle
    const channel = supabase
      .channel(`agent-signalements-${agentRole}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signalements',
          filter: `assigned_agent_role=eq.${agentRole}`
        },
        (payload) => {
          const newSignalement = payload.new as {
            id: string;
            title: string;
            type: string;
            priority: string;
            reference_number: string;
            location?: string;
          };

          // Afficher une notification toast
          const priorityColor = newSignalement.priority === 'critical' 
            ? 'text-red-500' 
            : newSignalement.priority === 'high' 
              ? 'text-orange-500' 
              : 'text-blue-500';

          toast.custom((t) => (
            <div className="bg-background border rounded-lg shadow-lg p-4 max-w-sm animate-fade-in">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-primary/10 ${priorityColor}`}>
                  {newSignalement.priority === 'critical' ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Nouveau signalement</span>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground mt-1">
                    {newSignalement.reference_number}
                  </p>
                  <p className="text-sm mt-1 line-clamp-2">{newSignalement.title}</p>
                  {newSignalement.location && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📍 {newSignalement.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ), {
            duration: 8000,
            position: 'top-right',
          });

          // Callback pour rafraîchir les données
          onNewSignalement?.();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [agentRole, onNewSignalement]);

  // Ce composant ne rend rien visuellement, il gère juste les notifications
  return null;
};

export default AgentRealtimeNotifications;
