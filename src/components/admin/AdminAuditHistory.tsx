import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Clock, FileText, RefreshCw, Filter, User, Calendar, BarChart3, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { agentAuditService, AuditActionType } from '@/services/agentAuditService';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AgentActivityTrendChart } from './AgentActivityTrendChart';
import { SuspiciousActivityAlerts } from './SuspiciousActivityAlerts';

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

interface SignalementInfo {
  id: string;
  reference_number: string | null;
  title: string;
}

const ACTION_TYPES: { value: AuditActionType; label: string }[] = [
  { value: 'view_signalement', label: 'Consultation' },
  { value: 'update_status', label: 'Modification statut' },
  { value: 'update_priority', label: 'Modification priorité' },
  { value: 'add_comment', label: 'Commentaire' },
  { value: 'assign_signalement', label: 'Assignation' },
  { value: 'resolve_signalement', label: 'Résolution' },
  { value: 'reject_signalement', label: 'Rejet' },
  { value: 'export_report', label: 'Export' },
  { value: 'download_attachment', label: 'Téléchargement' },
];

export const AdminAuditHistory: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [agents, setAgents] = useState<Map<string, AgentInfo>>(new Map());
  const [signalements, setSignalements] = useState<Map<string, SignalementInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [agentsList, setAgentsList] = useState<AgentInfo[]>([]);

  const fetchAuditLogs = async () => {
    try {
      const filters: {
        actionType?: AuditActionType;
        startDate?: Date;
        endDate?: Date;
        agentId?: string;
      } = {};

      if (actionTypeFilter !== 'all') {
        filters.actionType = actionTypeFilter as AuditActionType;
      }
      if (agentFilter !== 'all') {
        filters.agentId = agentFilter;
      }
      if (startDate) {
        filters.startDate = startDate;
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filters.endDate = endOfDay;
      }

      const logs = await agentAuditService.getAllAgentsHistory(filters) as AuditEntry[];
      setAuditLogs(logs);

      // Récupérer les infos des agents
      const agentIds = [...new Set(logs.map(l => l.agent_id).filter(Boolean))] as string[];
      if (agentIds.length > 0) {
        const { data: agentData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', agentIds);
        
        if (agentData) {
          const agentMap = new Map<string, AgentInfo>();
          agentData.forEach(a => agentMap.set(a.id, a));
          setAgents(agentMap);
          
          // Set agents list for filter dropdown
          if (agentsList.length === 0) {
            setAgentsList(agentData);
          }
        }
      }

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
  }, [actionTypeFilter, agentFilter, startDate, endDate]);

  useEffect(() => {
    // Abonnement realtime pour les nouvelles entrées
    const channel = supabase
      .channel('admin-audit-realtime')
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

  const handleClearFilters = () => {
    setActionTypeFilter('all');
    setAgentFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getActionBadgeColor = (actionType: string): string => {
    switch (actionType) {
      case 'resolve_signalement':
        return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
      case 'reject_signalement':
        return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
      case 'update_status':
      case 'update_priority':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30';
      case 'add_comment':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30';
      case 'view_signalement':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30';
      default:
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30';
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

  const hasActiveFilters = actionTypeFilter !== 'all' || agentFilter !== 'all' || startDate || endDate;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Global des Agents
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
    <div className="space-y-6">
      {/* Graphiques de tendance et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentActivityTrendChart auditLogs={auditLogs} agents={agents} />
        <SuspiciousActivityAlerts auditLogs={auditLogs} agents={agents} />
      </div>

      {/* Historique détaillé */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique Détaillé des Agents
              <Badge variant="secondary" className="ml-2">
                {auditLogs.length} entrées
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Effacer filtres
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3">
            {/* Filtre par type d'action */}
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">Toutes les actions</SelectItem>
                {ACTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {agentAuditService.getActionIcon(type.value)} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par agent */}
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[200px] bg-background">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">Tous les agents</SelectItem>
                {agentsList.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.full_name || agent.email || agent.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre date début */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal bg-background",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Date début"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background border z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Filtre date fin */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal bg-background",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Date fin"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background border z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune action enregistrée {hasActiveFilters ? 'avec ces filtres' : 'pour le moment'}</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-4">
                  {auditLogs.map((log) => {
                    const agent = agents.get(log.agent_id);
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
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                {/* Agent badge */}
                                <Badge variant="outline" className="bg-background">
                                  <User className="h-3 w-3 mr-1" />
                                  {agent?.full_name || agent?.email || log.agent_id.slice(0, 8)}
                                </Badge>
                                
                                {/* Action badge */}
                                <Badge className={getActionBadgeColor(actionType)}>
                                  {agentAuditService.getActionLabel(actionType)}
                                </Badge>
                              </div>

                              {signalement && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                  <FileText className="h-3 w-3" />
                                  <span className="font-mono">
                                    {signalement.reference_number || signalement.id.slice(0, 8)}
                                  </span>
                                  <span className="mx-1">-</span>
                                  <span className="truncate max-w-[300px]">{signalement.title}</span>
                                </div>
                              )}

                              {renderChanges(log.old_values, log.new_values)}
                            </div>

                            <div className="text-xs text-muted-foreground flex flex-col items-end gap-1">
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(log.created_at), {
                                  addSuffix: true,
                                  locale: fr
                                })}
                              </span>
                              <span className="text-[10px] opacity-70">
                                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}
                              </span>
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
    </div>
  );
};
