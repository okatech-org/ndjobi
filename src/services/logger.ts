type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[level];

    let formatted = `${emoji} [${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    return formatted;
  }

  private addLog(level: LogLevel, message: string, context?: Record<string, unknown>, stack?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      stack,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    if (this.isDevelopment || level === 'error') {
      this.saveToLocalStorage();
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
    this.addLog('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(this.formatMessage('info', message, context));
    this.addLog('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatMessage('warn', message, context));
    this.addLog('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const stack = (error as Error)?.stack || new Error().stack;
    const errorMessage = (error as Error)?.message || String(error);
    const fullMessage = `${message}${errorMessage ? `: ${errorMessage}` : ''}`;

    console.error(this.formatMessage('error', fullMessage, context));
    if (stack) {
      console.error(stack);
    }

    this.addLog('error', fullMessage, context, stack);

    if (!this.isDevelopment && typeof window !== 'undefined' && (window as any).Sentry) {
      ((window as any).Sentry as { captureException: (err: unknown, opts?: Record<string, unknown>) => void }).captureException(error || new Error(message), {
        contexts: { custom: context },
      });
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('ndjobi-logs');
  }

  private saveToLocalStorage(): void {
    try {
      const recentLogs = this.logs.slice(-100);
      localStorage.setItem('ndjobi-logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }
  }

  loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('ndjobi-logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.logs = Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Failed to load logs from localStorage:', error);
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  downloadLogs(): void {
    const logs = this.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ndjobi-logs-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    errors: number;
    warnings: number;
  } {
    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    return {
      total: this.logs.length,
      byLevel,
      errors: byLevel.error || 0,
      warnings: byLevel.warn || 0,
    };
  }

  groupByLevel(): Record<LogLevel, LogEntry[]> {
    return this.logs.reduce((acc, log) => {
      if (!acc[log.level]) {
        acc[log.level] = [];
      }
      acc[log.level].push(log);
      return acc;
    }, {} as Record<LogLevel, LogEntry[]>);
  }

  search(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(lowerQuery) ||
      JSON.stringify(log.context).toLowerCase().includes(lowerQuery)
    );
  }
}

export const logger = new LoggerService();

logger.loadFromLocalStorage();

export const logPerformance = (metric: string, value: number) => {
  logger.debug(`Performance: ${metric}`, { value, unit: 'ms' });
};

export const logUserAction = (action: string, context?: Record<string, unknown>): void => {
  logger.info(`User action: ${action}`, context);
};

export const logAPICall = (endpoint: string, method: string, status: number, duration: number): void => {
  logger.debug(`API Call: ${method} ${endpoint}`, {
    status,
    duration,
    success: status >= 200 && status < 300,
  });
};

