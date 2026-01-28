import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Clock, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { agentAuditService, AuditActionType } from '@/services/agentAuditService';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  signalement_id: string;
  action_type: string;
  action_details: Record<string, unknown>;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

interface SignalementInfo {
  id: string;
  reference_number: string | null;
  title: string;
}

export const AgentAuditHistory: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [signalements, setSignalements] = useState<Map<string, SignalementInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const logs = await agentAuditService.getAgentHistory(user.id, 100) as AuditEntry[];
      setAuditLogs(logs);

      // Récupérer les infos des signalements
      const signalementIds = [...new Set(logs.map(l => l.signalement_id).filter(Boolean))] as string[];
      if (signalementIds.length > 0) {
        const { data: signData } = await supabase
          .from('signalements')
          .select('id, reference_number, title')
          .in('id', signalementIds);
        
        if (signData) {
          const signMap = new Map<string, SignalementInfo>();
          signData.forEach(s => signMap.set(s.id, s));
          setSignalements(signMap);
        }
      }
    } catch (error) {
      console.error('Erreur chargement audit:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();

    // Abonnement realtime pour les nouvelles entrées
    const channel = supabase
      .channel('agent-audit-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_audit_logs'
      }, () => {
        fetchAuditLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAuditLogs();
  };

  const getActionBadgeColor = (actionType: string): string => {
    switch (actionType) {
      case 'resolve_signalement':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'reject_signalement':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'update_status':
      case 'update_priority':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'add_comment':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'view_signalement':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
    }
  };

  const renderChanges = (oldValues: Record<string, unknown> | null, newValues: Record<string, unknown> | null) => {
    if (!oldValues && !newValues) return null;
    
    const changes: { field: string; from: string; to: string }[] = [];
    
    if (oldValues && newValues) {
      Object.keys(newValues).forEach(key => {
        if (oldValues[key] !== newValues[key]) {
          changes.push({
            field: key,
            from: String(oldValues[key] || '-'),
            to: String(newValues[key] || '-')
          });
        }
      });
    }

    if (changes.length === 0) return null;

    return (
      <div className="mt-2 text-xs space-y-1">
        {changes.map((change, idx) => (
          <div key={idx} className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium capitalize">{change.field}:</span>
            <span className="line-through text-red-500">{change.from}</span>
            <span>→</span>
            <span className="text-green-500">{change.to}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des actions
          <Badge variant="secondary" className="ml-2">
            {auditLogs.length} entrées
          </Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune action enregistrée pour le moment</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {auditLogs.map((log, index) => {
                  const signalement = signalements.get(log.signalement_id);
                  const actionType = log.action_type as AuditActionType;
                  
                  return (
                    <div key={log.id} className="relative pl-12">
                      {/* Timeline dot */}
                      <div className="absolute left-3 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs">
                        {agentAuditService.getActionIcon(actionType)}
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 border">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getActionBadgeColor(actionType)}>
                                {agentAuditService.getActionLabel(actionType)}
                              </Badge>
                              {signalement && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {signalement.reference_number || signalement.title.substring(0, 30)}
                                </span>
                              )}
                            </div>

                            {log.action_details && Object.keys(log.action_details).length > 0 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {JSON.stringify(log.action_details)}
                              </p>
                            )}

                            {renderChanges(log.old_values, log.new_values)}
                          </div>

                          <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
