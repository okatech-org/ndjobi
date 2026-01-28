import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  AlertCircle,
  Shield,
  Clock,
  User,
  Activity,
  TrendingUp,
  Zap,
  Eye,
  EyeOff,
  Bell,
  BellOff,
} from 'lucide-react';
import { formatDistanceToNow, format, differenceInMinutes, subHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { agentAuditService, AuditActionType } from '@/services/agentAuditService';

interface AuditEntry {
  id: string;
  agent_id: string;
  signalement_id: string;
  action_type: string;
  action_details: Record<string, unknown>;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

interface AgentInfo {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface SuspiciousActivityAlertsProps {
  auditLogs: AuditEntry[];
  agents: Map<string, AgentInfo>;
}

type AlertSeverity = 'critical' | 'warning' | 'info';

interface SuspiciousActivity {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

// Seuils de détection
const THRESHOLDS = {
  // Actions rapides: plus de X actions en Y minutes
  RAPID_ACTIONS_COUNT: 10,
  RAPID_ACTIONS_WINDOW_MINUTES: 5,
  // Modifications de masse: plus de X modifications de statut en Y minutes
  MASS_STATUS_CHANGES_COUNT: 5,
  MASS_STATUS_CHANGES_WINDOW_MINUTES: 10,
  // Rejets multiples: plus de X rejets en Y minutes
  MASS_REJECTIONS_COUNT: 3,
  MASS_REJECTIONS_WINDOW_MINUTES: 30,
  // Résolutions rapides: résolution en moins de X minutes après création
  QUICK_RESOLUTION_MINUTES: 2,
  // Actions hors heures normales (0h-6h)
  OFF_HOURS_START: 0,
  OFF_HOURS_END: 6,
};

export const SuspiciousActivityAlerts: React.FC<SuspiciousActivityAlertsProps> = ({
  auditLogs,
  agents,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [showDismissed, setShowDismissed] = useState(false);

  const getAgentName = (agentId: string): string => {
    const agent = agents.get(agentId);
    return agent?.full_name || agent?.email || agentId.slice(0, 8);
  };

  // Détecter les activités suspectes
  const suspiciousActivities = useMemo(() => {
    const alerts: SuspiciousActivity[] = [];
    const now = new Date();
    const recentLogs = auditLogs.filter(
      log => new Date(log.created_at) >= subHours(now, 24)
    );

    // Grouper par agent
    const logsByAgent = new Map<string, AuditEntry[]>();
    recentLogs.forEach(log => {
      const existing = logsByAgent.get(log.agent_id) || [];
      existing.push(log);
      logsByAgent.set(log.agent_id, existing);
    });

    logsByAgent.forEach((agentLogs, agentId) => {
      const sortedLogs = [...agentLogs].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // 1. Détection des actions rapides
      for (let i = 0; i < sortedLogs.length; i++) {
        const windowEnd = new Date(sortedLogs[i].created_at);
        const windowStart = new Date(windowEnd.getTime() - THRESHOLDS.RAPID_ACTIONS_WINDOW_MINUTES * 60 * 1000);
        
        const actionsInWindow = sortedLogs.filter(log => {
          const logTime = new Date(log.created_at);
          return logTime >= windowStart && logTime <= windowEnd;
        });

        if (actionsInWindow.length >= THRESHOLDS.RAPID_ACTIONS_COUNT) {
          const alertId = `rapid-${agentId}-${windowEnd.getTime()}`;
          if (!alerts.find(a => a.id === alertId)) {
            alerts.push({
              id: alertId,
              type: 'rapid_actions',
              severity: 'warning',
              title: 'Activité inhabituelle détectée',
              description: `${actionsInWindow.length} actions en ${THRESHOLDS.RAPID_ACTIONS_WINDOW_MINUTES} minutes`,
              agentId,
              agentName: getAgentName(agentId),
              timestamp: windowEnd,
              details: { actionCount: actionsInWindow.length },
            });
          }
        }
      }

      // 2. Détection des modifications de statut en masse
      const statusChanges = sortedLogs.filter(log => 
        log.action_type === 'update_status' || 
        log.action_type === 'resolve_signalement'
      );

      for (let i = 0; i < statusChanges.length; i++) {
        const windowEnd = new Date(statusChanges[i].created_at);
        const windowStart = new Date(windowEnd.getTime() - THRESHOLDS.MASS_STATUS_CHANGES_WINDOW_MINUTES * 60 * 1000);
        
        const changesInWindow = statusChanges.filter(log => {
          const logTime = new Date(log.created_at);
          return logTime >= windowStart && logTime <= windowEnd;
        });

        if (changesInWindow.length >= THRESHOLDS.MASS_STATUS_CHANGES_COUNT) {
          const alertId = `mass-status-${agentId}-${windowEnd.getTime()}`;
          if (!alerts.find(a => a.id === alertId)) {
            alerts.push({
              id: alertId,
              type: 'mass_status_changes',
              severity: 'warning',
              title: 'Modifications de statut en masse',
              description: `${changesInWindow.length} changements de statut en ${THRESHOLDS.MASS_STATUS_CHANGES_WINDOW_MINUTES} minutes`,
              agentId,
              agentName: getAgentName(agentId),
              timestamp: windowEnd,
              details: { changeCount: changesInWindow.length },
            });
          }
        }
      }

      // 3. Détection des rejets multiples
      const rejections = sortedLogs.filter(log => log.action_type === 'reject_signalement');
      
      for (let i = 0; i < rejections.length; i++) {
        const windowEnd = new Date(rejections[i].created_at);
        const windowStart = new Date(windowEnd.getTime() - THRESHOLDS.MASS_REJECTIONS_WINDOW_MINUTES * 60 * 1000);
        
        const rejectionsInWindow = rejections.filter(log => {
          const logTime = new Date(log.created_at);
          return logTime >= windowStart && logTime <= windowEnd;
        });

        if (rejectionsInWindow.length >= THRESHOLDS.MASS_REJECTIONS_COUNT) {
          const alertId = `mass-reject-${agentId}-${windowEnd.getTime()}`;
          if (!alerts.find(a => a.id === alertId)) {
            alerts.push({
              id: alertId,
              type: 'mass_rejections',
              severity: 'critical',
              title: 'Rejets multiples suspects',
              description: `${rejectionsInWindow.length} signalements rejetés en ${THRESHOLDS.MASS_REJECTIONS_WINDOW_MINUTES} minutes`,
              agentId,
              agentName: getAgentName(agentId),
              timestamp: windowEnd,
              details: { rejectionCount: rejectionsInWindow.length },
            });
          }
        }
      }

      // 4. Détection des actions hors heures normales
      const offHoursActions = sortedLogs.filter(log => {
        const hour = new Date(log.created_at).getHours();
        return hour >= THRESHOLDS.OFF_HOURS_START && hour < THRESHOLDS.OFF_HOURS_END;
      });

      if (offHoursActions.length > 0) {
        const latestOffHour = offHoursActions[offHoursActions.length - 1];
        const alertId = `off-hours-${agentId}-${new Date(latestOffHour.created_at).toDateString()}`;
        if (!alerts.find(a => a.id === alertId)) {
          alerts.push({
            id: alertId,
            type: 'off_hours_activity',
            severity: 'info',
            title: 'Activité hors heures normales',
            description: `${offHoursActions.length} action(s) entre ${THRESHOLDS.OFF_HOURS_START}h et ${THRESHOLDS.OFF_HOURS_END}h`,
            agentId,
            agentName: getAgentName(agentId),
            timestamp: new Date(latestOffHour.created_at),
            details: { actionCount: offHoursActions.length },
          });
        }
      }
    });

    // 5. Détection des résolutions très rapides (peut indiquer un traitement superficiel)
    const resolutions = recentLogs.filter(log => log.action_type === 'resolve_signalement');
    resolutions.forEach(resolution => {
      const viewActions = recentLogs.filter(
        log => log.signalement_id === resolution.signalement_id && 
        log.action_type === 'view_signalement' &&
        log.agent_id === resolution.agent_id
      );

      if (viewActions.length > 0) {
        const firstView = viewActions.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];
        
        const minutesBetween = differenceInMinutes(
          new Date(resolution.created_at),
          new Date(firstView.created_at)
        );

        if (minutesBetween <= THRESHOLDS.QUICK_RESOLUTION_MINUTES) {
          const alertId = `quick-resolve-${resolution.id}`;
          if (!alerts.find(a => a.id === alertId)) {
            alerts.push({
              id: alertId,
              type: 'quick_resolution',
              severity: 'info',
              title: 'Résolution très rapide',
              description: `Signalement résolu ${minutesBetween < 1 ? 'en moins d\'une minute' : `en ${minutesBetween} minute(s)`} après consultation`,
              agentId: resolution.agent_id,
              agentName: getAgentName(resolution.agent_id),
              timestamp: new Date(resolution.created_at),
              details: { 
                signalementId: resolution.signalement_id,
                minutesBetween 
              },
            });
          }
        }
      }
    });

    return alerts.sort((a, b) => {
      // Trier par sévérité puis par date
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [auditLogs, agents]);

  const visibleAlerts = suspiciousActivities.filter(
    alert => showDismissed || !dismissedAlerts.has(alert.id)
  );

  const criticalCount = suspiciousActivities.filter(
    a => a.severity === 'critical' && !dismissedAlerts.has(a.id)
  ).length;
  const warningCount = suspiciousActivities.filter(
    a => a.severity === 'warning' && !dismissedAlerts.has(a.id)
  ).length;

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30">Critique</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30">Attention</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30">Info</Badge>;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'rapid_actions':
        return <Zap className="h-4 w-4" />;
      case 'mass_status_changes':
        return <TrendingUp className="h-4 w-4" />;
      case 'mass_rejections':
        return <AlertCircle className="h-4 w-4" />;
      case 'off_hours_activity':
        return <Clock className="h-4 w-4" />;
      case 'quick_resolution':
        return <Activity className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Alertes de Sécurité
              {criticalCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="ml-1 bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30">
                  {warningCount} attention
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Détection automatique des comportements inhabituels (dernières 24h)
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDismissed(!showDismissed)}
            className="flex items-center gap-2"
          >
            {showDismissed ? (
              <>
                <EyeOff className="h-4 w-4" />
                Masquer ignorées
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Voir ignorées ({dismissedAlerts.size})
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
            <p className="font-medium">Aucune activité suspecte détectée</p>
            <p className="text-sm">Le système surveille continuellement l'activité des agents</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {visibleAlerts.map(alert => (
                <Alert
                  key={alert.id}
                  className={`relative ${
                    dismissedAlerts.has(alert.id) ? 'opacity-50' : ''
                  } ${
                    alert.severity === 'critical'
                      ? 'border-red-500/50 bg-red-500/5'
                      : alert.severity === 'warning'
                        ? 'border-orange-500/50 bg-orange-500/5'
                        : 'border-blue-500/50 bg-blue-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <AlertTitle className="text-sm font-medium flex items-center gap-1">
                          {getAlertTypeIcon(alert.type)}
                          {alert.title}
                        </AlertTitle>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <AlertDescription className="text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{alert.agentName}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        <p>{alert.description}</p>
                      </AlertDescription>
                    </div>
                    {!dismissedAlerts.has(alert.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(alert.id)}
                        className="shrink-0"
                      >
                        <BellOff className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Légende des seuils */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Seuils de détection:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>≥{THRESHOLDS.RAPID_ACTIONS_COUNT} actions / {THRESHOLDS.RAPID_ACTIONS_WINDOW_MINUTES}min</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>≥{THRESHOLDS.MASS_STATUS_CHANGES_COUNT} modifs statut / {THRESHOLDS.MASS_STATUS_CHANGES_WINDOW_MINUTES}min</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>≥{THRESHOLDS.MASS_REJECTIONS_COUNT} rejets / {THRESHOLDS.MASS_REJECTIONS_WINDOW_MINUTES}min</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Activité entre {THRESHOLDS.OFF_HOURS_START}h-{THRESHOLDS.OFF_HOURS_END}h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuspiciousActivityAlerts;
