import * as Sentry from '@sentry/react';

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
}

const defaultConfig: SentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  tracesSampleRate: import.meta.env.VITE_ENVIRONMENT === 'production' ? 0.1 : 0,
};

export const initSentry = (config: Partial<SentryConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  if (!finalConfig.dsn || finalConfig.environment === 'development') {
    console.info('Sentry désactivé en développement');
    return;
  }

  try {
    Sentry.init({
      dsn: finalConfig.dsn,
      environment: finalConfig.environment,
      tracesSampleRate: finalConfig.tracesSampleRate,
      
      beforeSend: (event) => {
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  } catch (error) {
    console.warn('Erreur initialisation Sentry:', error);
  }
};

export const captureError = (error: Error, context: any = {}) => {
  if (import.meta.env.DEV) {
    console.error('Error:', error, context);
    return;
  }
  try {
    Sentry.captureException(error);
  } catch {
    console.error(error);
  }
};

export const captureBusinessEvent = (eventName: string, data: Record<string, any> = {}) => {
  if (import.meta.env.DEV) {
    console.debug('Business Event:', eventName, data);
  }
};

export const setUserContext = (user: any) => {
  if (import.meta.env.PROD && Sentry.getCurrentHub) {
    try {
      Sentry.setUser({ id: user.id, role: user.role });
    } catch {}
  }
};

export const clearUserContext = () => {
  if (import.meta.env.PROD && Sentry.getCurrentHub) {
    try {
      Sentry.setUser(null);
    } catch {}
  }
};

export const addBreadcrumb = (message: string, category: string = 'custom', level: any = 'info', data: Record<string, any> = {}) => {
  if (import.meta.env.DEV) {
    console.debug('Breadcrumb:', message, data);
  }
};

export const startTransaction = (name: string, operation: string = 'navigation') => {
  return {
    setTag: () => {},
    setStatus: () => {},
    finish: () => {},
  };
};

export const measurePerformance = async <T>(
  name: string,
  operation: () => Promise<T> | T,
  tags: Record<string, string> = {}
): Promise<T> => {
  return await operation();
};

export default Sentry;