import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  icon?: LucideIcon;
  iconClassName?: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'pending';
  metadata?: Record<string, unknown>;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
  showDate?: boolean;
  compact?: boolean;
}

const statusColors = {
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  pending: 'bg-gray-400 text-white',
};

const statusBorderColors = {
  success: 'border-green-500',
  warning: 'border-yellow-500',
  error: 'border-red-500',
  info: 'border-blue-500',
  pending: 'border-gray-400',
};

export const Timeline: React.FC<TimelineProps> = ({
  events,
  className,
  showDate = true,
  compact = false,
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun événement à afficher
      </div>
    );
  }

  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = format(event.timestamp, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className={cn('space-y-8', className)}>
      {sortedDates.map((dateKey, dateIndex) => {
        const dateEvents = groupedEvents[dateKey];
        const date = new Date(dateKey);

        return (
          <div key={dateKey} className="space-y-4">
            {/* Date Header */}
            {showDate && (
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
                </h3>
              </div>
            )}

            {/* Events for this date */}
            <div className="relative space-y-6 pl-8">
              {/* Vertical Line */}
              {dateEvents.length > 1 && (
                <div 
                  className="absolute left-3 top-3 bottom-3 w-0.5 bg-border"
                  aria-hidden="true"
                />
              )}

              {dateEvents.map((event, eventIndex) => {
                const Icon = event.icon;
                const status = event.status || 'info';
                const isLast = eventIndex === dateEvents.length - 1;

                return (
                  <div
                    key={event.id}
                    className="relative"
                  >
                    {/* Icon Circle */}
                    <div
                      className={cn(
                        'absolute -left-8 top-0 flex items-center justify-center',
                        compact ? 'w-6 h-6' : 'w-8 h-8',
                        'rounded-full border-2 bg-background',
                        statusBorderColors[status]
                      )}
                    >
                      {Icon ? (
                        <Icon
                          className={cn(
                            compact ? 'w-3 h-3' : 'w-4 h-4',
                            event.iconClassName || `text-${status === 'pending' ? 'gray' : status}-500`
                          )}
                        />
                      ) : (
                        <div
                          className={cn(
                            compact ? 'w-2 h-2' : 'w-3 h-3',
                            'rounded-full',
                            statusColors[status]
                          )}
                        />
                      )}
                    </div>

                    {/* Event Content */}
                    <div
                      className={cn(
                        'border rounded-lg p-4 bg-card hover:shadow-md transition-shadow',
                        statusBorderColors[status]
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              'font-medium',
                              compact ? 'text-sm' : 'text-base'
                            )}>
                              {event.title}
                            </h4>
                            
                            {/* Status Badge */}
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                statusColors[status]
                              )}
                            >
                              {status === 'success' && 'Terminé'}
                              {status === 'warning' && 'Attention'}
                              {status === 'error' && 'Erreur'}
                              {status === 'info' && 'Info'}
                              {status === 'pending' && 'En attente'}
                            </span>
                          </div>

                          {event.description && (
                            <p className={cn(
                              'text-muted-foreground',
                              compact ? 'text-xs' : 'text-sm'
                            )}>
                              {event.description}
                            </p>
                          )}

                          {/* Metadata */}
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-2">
                              {Object.entries(event.metadata).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="text-xs"
                                >
                                  <span className="font-medium text-muted-foreground">
                                    {key}:
                                  </span>{' '}
                                  <span className="text-foreground">
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className={cn(
                          'text-xs text-muted-foreground whitespace-nowrap',
                          compact && 'text-[10px]'
                        )}>
                          {format(event.timestamp, 'HH:mm', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface TimelineItemProps {
  event: TimelineEvent;
  isLast?: boolean;
  compact?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  event,
  isLast = false,
  compact = false,
}) => {
  const Icon = event.icon;
  const status = event.status || 'info';

  return (
    <div className="relative pb-8">
      {!isLast && (
        <span
          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border"
          aria-hidden="true"
        />
      )}
      
      <div className="relative flex items-start space-x-3">
        <div>
          <div className="relative px-1">
            <div
              className={cn(
                'flex items-center justify-center rounded-full',
                compact ? 'w-6 h-6' : 'w-8 h-8',
                statusColors[status]
              )}
            >
              {Icon ? (
                <Icon className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              ) : (
                <div className={cn(
                  'rounded-full bg-white',
                  compact ? 'w-2 h-2' : 'w-3 h-3'
                )} />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <p className={cn(
                'font-medium',
                compact ? 'text-sm' : 'text-base'
              )}>
                {event.title}
              </p>
            </div>
            {event.description && (
              <p className={cn(
                'text-muted-foreground',
                compact ? 'text-xs' : 'text-sm',
                'mt-1'
              )}>
                {event.description}
              </p>
            )}
          </div>
          <p className={cn(
            'text-muted-foreground whitespace-nowrap',
            compact ? 'text-xs' : 'text-sm',
            'mt-1'
          )}>
            {format(event.timestamp, 'PPp', { locale: fr })}
          </p>
        </div>
      </div>
    </div>
  );
};

