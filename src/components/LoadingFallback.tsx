import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLogo?: boolean;
}

export const LoadingFallback = ({
  message = 'Chargement...',
  fullScreen = false,
  size = 'md',
  showLogo = true,
}: LoadingFallbackProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-4',
    fullScreen && 'min-h-screen'
  );

  return (
    <div className={containerClasses}>
      {showLogo && (
        <div className="relative">
          <div className={cn(
            'rounded-full bg-primary/10 flex items-center justify-center',
            size === 'sm' && 'w-16 h-16',
            size === 'md' && 'w-20 h-20',
            size === 'lg' && 'w-24 h-24'
          )}>
            <Shield className={cn(
              'text-primary',
              size === 'sm' && 'w-8 h-8',
              size === 'md' && 'w-10 h-10',
              size === 'lg' && 'w-12 h-12'
            )} />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
        </div>
      )}

      <div className={cn('animate-spin rounded-full border-b-2 border-primary', sizeClasses[size])} />

      {message && (
        <p className={cn(
          'text-muted-foreground font-medium animate-pulse',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg'
        )}>
          {message}
        </p>
      )}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="border rounded-lg p-6 bg-card space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="h-8 w-20 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-2">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg bg-card animate-pulse">
          <div className="h-10 w-10 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonForm = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-10 bg-muted rounded w-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-32" />
        <div className="h-32 bg-muted rounded w-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-28" />
        <div className="h-10 bg-muted rounded w-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-muted rounded w-24" />
        <div className="h-10 bg-muted rounded flex-1" />
      </div>
    </div>
  );
};

