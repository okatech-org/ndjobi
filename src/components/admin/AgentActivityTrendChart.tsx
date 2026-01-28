import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, startOfDay, startOfWeek, eachDayOfInterval, eachWeekOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AuditActionType, agentAuditService } from '@/services/agentAuditService';

interface AuditEntry {
  id: string;
  agent_id: string;
  action_type: string;
  created_at: string;
}

interface AgentInfo {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface AgentActivityTrendChartProps {
  auditLogs: AuditEntry[];
  agents: Map<string, AgentInfo>;
}

const ACTION_COLORS: Record<string, string> = {
  view_signalement: 'hsl(var(--muted-foreground))',
  update_status: 'hsl(210, 100%, 50%)',
  update_priority: 'hsl(280, 100%, 60%)',
  add_comment: 'hsl(270, 100%, 60%)',
  assign_signalement: 'hsl(40, 100%, 50%)',
  resolve_signalement: 'hsl(142, 76%, 36%)',
  reject_signalement: 'hsl(0, 84%, 60%)',
  export_report: 'hsl(200, 100%, 50%)',
  download_attachment: 'hsl(180, 100%, 40%)',
};

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)',
  'hsl(0, 84%, 60%)',
  'hsl(210, 100%, 50%)',
  'hsl(40, 100%, 50%)',
  'hsl(270, 100%, 60%)',
];

export const AgentActivityTrendChart: React.FC<AgentActivityTrendChartProps> = ({
  auditLogs,
  agents,
}) => {
  // Données par jour (7 derniers jours)
  const dailyData = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = auditLogs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const byType: Record<string, number> = {};
      dayLogs.forEach(log => {
        byType[log.action_type] = (byType[log.action_type] || 0) + 1;
      });

      return {
        date: format(day, 'EEE', { locale: fr }),
        fullDate: format(day, 'dd/MM', { locale: fr }),
        total: dayLogs.length,
        resolve_signalement: byType.resolve_signalement || 0,
        update_status: byType.update_status || 0,
        add_comment: byType.add_comment || 0,
        view_signalement: byType.view_signalement || 0,
        other: Object.entries(byType)
          .filter(([key]) => !['resolve_signalement', 'update_status', 'add_comment', 'view_signalement'].includes(key))
          .reduce((acc, [, val]) => acc + val, 0),
      };
    });
  }, [auditLogs]);

  // Données par semaine (4 dernières semaines)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks = eachWeekOfInterval({
      start: subDays(now, 27),
      end: now,
    }, { weekStartsOn: 1 });

    return weeks.map((weekStart, idx) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekLogs = auditLogs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= weekStart && logDate <= weekEnd;
      });

      const byType: Record<string, number> = {};
      weekLogs.forEach(log => {
        byType[log.action_type] = (byType[log.action_type] || 0) + 1;
      });

      return {
        week: `S${idx + 1}`,
        fullWeek: `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`,
        total: weekLogs.length,
        resolve_signalement: byType.resolve_signalement || 0,
        update_status: byType.update_status || 0,
        add_comment: byType.add_comment || 0,
        view_signalement: byType.view_signalement || 0,
        other: Object.entries(byType)
          .filter(([key]) => !['resolve_signalement', 'update_status', 'add_comment', 'view_signalement'].includes(key))
          .reduce((acc, [, val]) => acc + val, 0),
      };
    });
  }, [auditLogs]);

  // Répartition par type d'action
  const actionDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    auditLogs.forEach(log => {
      distribution[log.action_type] = (distribution[log.action_type] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([type, count]) => ({
        name: agentAuditService.getActionLabel(type as AuditActionType),
        value: count,
        color: ACTION_COLORS[type] || 'hsl(var(--muted))',
      }))
      .sort((a, b) => b.value - a.value);
  }, [auditLogs]);

  // Top agents par activité
  const topAgents = useMemo(() => {
    const agentActivity: Record<string, number> = {};
    auditLogs.forEach(log => {
      agentActivity[log.agent_id] = (agentActivity[log.agent_id] || 0) + 1;
    });

    return Object.entries(agentActivity)
      .map(([agentId, count]) => {
        const agent = agents.get(agentId);
        return {
          name: agent?.full_name || agent?.email || agentId.slice(0, 8),
          actions: count,
        };
      })
      .sort((a, b) => b.actions - a.actions)
      .slice(0, 5);
  }, [auditLogs, agents]);

  // Calcul de la tendance
  const trend = useMemo(() => {
    if (dailyData.length < 2) return { direction: 'stable' as const, percentage: 0 };

    const recent = dailyData.slice(-3).reduce((acc, d) => acc + d.total, 0);
    const previous = dailyData.slice(0, 3).reduce((acc, d) => acc + d.total, 0);

    if (previous === 0) {
      return { direction: (recent > 0 ? 'up' : 'stable') as 'up' | 'down' | 'stable', percentage: 0 };
    }

    const change = ((recent - previous) / previous) * 100;
    return {
      direction: (change > 5 ? 'up' : change < -5 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      percentage: Math.abs(Math.round(change)),
    };
  }, [dailyData]);

  const TrendIcon = trend.direction === 'up'
    ? TrendingUp
    : trend.direction === 'down'
      ? TrendingDown
      : Minus;

  const trendColor = trend.direction === 'up'
    ? 'text-green-500'
    : trend.direction === 'down'
      ? 'text-orange-500'
      : 'text-muted-foreground';

  const totalActions = auditLogs.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendances d'Activité
            </CardTitle>
            <CardDescription>
              Analyse de l'activité des agents sur les 7 derniers jours
            </CardDescription>
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {trend.percentage}% vs semaine précédente
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Par Jour</TabsTrigger>
            <TabsTrigger value="weekly">Par Semaine</TabsTrigger>
            <TabsTrigger value="distribution">Par Type</TabsTrigger>
            <TabsTrigger value="agents">Par Agent</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullDate || label;
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total actions"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="resolve_signalement"
                  name="Résolutions"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="weekly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullWeek || label;
                  }}
                />
                <Legend />
                <Bar dataKey="resolve_signalement" name="Résolutions" stackId="a" fill="hsl(142, 76%, 36%)" />
                <Bar dataKey="update_status" name="Modif. statut" stackId="a" fill="hsl(210, 100%, 50%)" />
                <Bar dataKey="add_comment" name="Commentaires" stackId="a" fill="hsl(270, 100%, 60%)" />
                <Bar dataKey="view_signalement" name="Consultations" stackId="a" fill="hsl(var(--muted-foreground))" />
                <Bar dataKey="other" name="Autres" stackId="a" fill="hsl(40, 100%, 50%)" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="distribution" className="h-[300px]">
            <div className="flex items-center justify-center h-full gap-8">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={actionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {actionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value, 'Actions']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {actionDistribution.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((item.value / totalActions) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topAgents}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="actions" name="Actions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                  {topAgents.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AgentActivityTrendChart;
