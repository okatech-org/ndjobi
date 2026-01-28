import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSecurityAlertThresholds, SecurityAlertThresholds } from './useSecurityAlertThresholds';
import { agentAuditService } from '@/services/agentAuditService';
import { differenceInMinutes, subMinutes } from 'date-fns';

interface AuditLogEntry {
  id: string;
  agent_id: string;
  signalement_id: string | null;
  action_type: string;
  action_details: Record<string, unknown>;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

interface RecentActivity {
  agentId: string;
  actions: { type: string; timestamp: Date }[];
}

// Son de notification (simple beep)
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880; // Fréquence en Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.error('Erreur lecture son:', error);
  }
};

export const useSecurityAlertsNotifications = () => {
  const { thresholds, isLoaded } = useSecurityAlertThresholds();
  const recentActivityRef = useRef<Map<string, RecentActivity>>(new Map());
  const notifiedAlertsRef = useRef<Set<string>>(new Set());

  const checkForSuspiciousActivity = useCallback((
    newEntry: AuditLogEntry,
    thresholds: SecurityAlertThresholds
  ) => {
    const now = new Date();
    const agentId = newEntry.agent_id;
    const entryTime = new Date(newEntry.created_at);

    // Récupérer ou créer l'activité récente de l'agent
    let agentActivity = recentActivityRef.current.get(agentId);
    if (!agentActivity) {
      agentActivity = { agentId, actions: [] };
      recentActivityRef.current.set(agentId, agentActivity);
    }

    // Ajouter la nouvelle action
    agentActivity.actions.push({
      type: newEntry.action_type,
      timestamp: entryTime,
    });

    // Nettoyer les actions anciennes (>1 heure)
    const oneHourAgo = subMinutes(now, 60);
    agentActivity.actions = agentActivity.actions.filter(
      a => a.timestamp >= oneHourAgo
    );

    // 1. Vérifier les rejets multiples (CRITIQUE)
    const rejectWindow = subMinutes(now, thresholds.massRejectionsWindowMinutes);
    const recentRejections = agentActivity.actions.filter(
      a => a.type === 'reject_signalement' && a.timestamp >= rejectWindow
    );

    if (recentRejections.length >= thresholds.massRejectionsCount) {
      const alertId = `reject-${agentId}-${Math.floor(now.getTime() / 60000)}`;
      if (!notifiedAlertsRef.current.has(alertId) && thresholds.enableCriticalNotifications) {
        notifiedAlertsRef.current.add(alertId);
        
        if (thresholds.soundEnabled) {
          playNotificationSound();
        }
        
        toast({
          title: '🚨 Alerte Critique',
          description: `Un agent a rejeté ${recentRejections.length} signalements en ${thresholds.massRejectionsWindowMinutes} minutes`,
          variant: 'destructive',
          duration: 10000,
        });
        
        return 'critical';
      }
    }

    // 2. Vérifier les actions rapides (ATTENTION)
    const rapidWindow = subMinutes(now, thresholds.rapidActionsWindowMinutes);
    const recentActions = agentActivity.actions.filter(
      a => a.timestamp >= rapidWindow
    );

    if (recentActions.length >= thresholds.rapidActionsCount) {
      const alertId = `rapid-${agentId}-${Math.floor(now.getTime() / 60000)}`;
      if (!notifiedAlertsRef.current.has(alertId) && thresholds.enableWarningNotifications) {
        notifiedAlertsRef.current.add(alertId);
        
        toast({
          title: '⚠️ Activité Inhabituelle',
          description: `${recentActions.length} actions détectées en ${thresholds.rapidActionsWindowMinutes} minutes`,
          duration: 8000,
        });
        
        return 'warning';
      }
    }

    // 3. Vérifier les modifications de statut en masse (ATTENTION)
    const statusWindow = subMinutes(now, thresholds.massStatusChangesWindowMinutes);
    const recentStatusChanges = agentActivity.actions.filter(
      a => (a.type === 'update_status' || a.type === 'resolve_signalement') && 
           a.timestamp >= statusWindow
    );

    if (recentStatusChanges.length >= thresholds.massStatusChangesCount) {
      const alertId = `status-${agentId}-${Math.floor(now.getTime() / 60000)}`;
      if (!notifiedAlertsRef.current.has(alertId) && thresholds.enableWarningNotifications) {
        notifiedAlertsRef.current.add(alertId);
        
        toast({
          title: '⚠️ Modifications en Masse',
          description: `${recentStatusChanges.length} changements de statut en ${thresholds.massStatusChangesWindowMinutes} minutes`,
          duration: 8000,
        });
        
        return 'warning';
      }
    }

    // 4. Vérifier l'activité hors heures (INFO)
    const hour = entryTime.getHours();
    if (hour >= thresholds.offHoursStart && hour < thresholds.offHoursEnd) {
      const alertId = `offhours-${agentId}-${entryTime.toDateString()}`;
      if (!notifiedAlertsRef.current.has(alertId) && thresholds.enableInfoNotifications) {
        notifiedAlertsRef.current.add(alertId);
        
        toast({
          title: 'ℹ️ Activité Hors Heures',
          description: `Un agent est actif à ${hour}h`,
          duration: 5000,
        });
        
        return 'info';
      }
    }

    return null;
  }, []);

  // Nettoyer les alertes notifiées toutes les 10 minutes
  useEffect(() => {
    const cleanup = setInterval(() => {
      notifiedAlertsRef.current.clear();
    }, 10 * 60 * 1000);

    return () => clearInterval(cleanup);
  }, []);

  // S'abonner aux nouvelles entrées d'audit en temps réel
  useEffect(() => {
    if (!isLoaded) return;

    const channel = supabase
      .channel('security-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_audit_logs',
        },
        (payload) => {
          const newEntry = payload.new as AuditLogEntry;
          checkForSuspiciousActivity(newEntry, thresholds);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoaded, thresholds, checkForSuspiciousActivity]);

  return {
    isActive: isLoaded,
    thresholds,
  };
};

export default useSecurityAlertsNotifications;
