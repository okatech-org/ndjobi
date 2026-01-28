import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Signalement {
  id: string;
  created_at: string;
  status: string;
  resolved_at?: string;
}

interface MonthlyEvolutionChartProps {
  signalements: Signalement[];
  title?: string;
  description?: string;
}

const MonthlyEvolutionChart = ({ 
  signalements, 
  title = "Évolution Mensuelle",
  description = "Tendance des signalements sur les 6 derniers mois"
}: MonthlyEvolutionChartProps) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const months: { month: string; shortMonth: string; received: number; resolved: number }[] = [];

    // Générer les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthName = date.toLocaleDateString('fr-FR', { month: 'long' });
      const shortMonth = date.toLocaleDateString('fr-FR', { month: 'short' });

      const received = signalements.filter(s => {
        const createdAt = new Date(s.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).length;

      const resolved = signalements.filter(s => {
        if (!s.resolved_at) return false;
        const resolvedAt = new Date(s.resolved_at);
        return resolvedAt >= monthStart && resolvedAt <= monthEnd;
      }).length;

      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        shortMonth: shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1),
        received,
        resolved,
      });
    }

    return months;
  }, [signalements]);

  // Calculer la tendance
  const trend = useMemo(() => {
    if (chartData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const lastMonth = chartData[chartData.length - 1].received;
    const previousMonth = chartData[chartData.length - 2].received;
    
    if (previousMonth === 0) {
      return { direction: lastMonth > 0 ? 'up' : 'stable', percentage: 0 };
    }
    
    const change = ((lastMonth - previousMonth) / previousMonth) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs(Math.round(change)),
    };
  }, [chartData]);

  const TrendIcon = trend.direction === 'up' 
    ? TrendingUp 
    : trend.direction === 'down' 
      ? TrendingDown 
      : Minus;

  const trendColor = trend.direction === 'up' 
    ? 'text-orange-500' 
    : trend.direction === 'down' 
      ? 'text-green-500' 
      : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {trend.percentage}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="shortMonth" 
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
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'received' ? 'Reçus' : 'Résolus'
                ]}
                labelFormatter={(label) => `Mois: ${label}`}
              />
              <Legend 
                formatter={(value) => value === 'received' ? 'Signalements reçus' : 'Signalements résolus'}
              />
              <Area
                type="monotone"
                dataKey="received"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReceived)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorResolved)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyEvolutionChart;
