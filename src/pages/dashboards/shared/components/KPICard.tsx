import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    label?: string;
  };
  description?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  className?: string;
}

/**
 * KPICard - Affiche un indicateur clé de performance
 * 
 * @component
 * @example
 * ```tsx
 * <KPICard
 *   title="Total Cases"
 *   value={1247}
 *   icon={FileText}
 *   trend={{ value: '+12%', label: 'vs mois dernier' }}
 *   color="blue"
 * />
 * ```
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: 'border-l-blue-500 hover:bg-blue-50/30',
    green: 'border-l-green-500 hover:bg-green-50/30',
    red: 'border-l-red-500 hover:bg-red-50/30',
    yellow: 'border-l-yellow-500 hover:bg-yellow-50/30',
    purple: 'border-l-purple-500 hover:bg-purple-50/30'
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-600',
    purple: 'text-purple-500'
  };

  const trendColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };

  return (
    <Card className={`border-l-4 ${colorClasses[color]} transition-all ${className}`}>
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trend && (
          <div className={`flex items-center text-sm ${trendColorClasses[color]}`}>
            <Icon className="h-4 w-4 mr-1" />
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-muted-foreground ml-1">{trend.label}</span>
            )}
          </div>
        )}
        {description && (
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Icon className="h-4 w-4 mr-1" />
            <span>{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;

