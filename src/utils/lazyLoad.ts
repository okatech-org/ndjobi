import { lazy, ComponentType } from 'react';

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
}

export function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>,
  options: RetryOptions = {}
): React.LazyExoticComponent<T> {
  const { maxRetries = 3, delay = 1000 } = options;

  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let retries = 0;

      const attemptImport = () => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            retries++;
            
            if (retries >= maxRetries) {
              console.error(`Failed to load component after ${maxRetries} retries:`, error);
              reject(error);
              return;
            }

            console.warn(`Retrying component import (${retries}/${maxRetries})...`);
            setTimeout(attemptImport, delay * retries);
          });
      };

      attemptImport();
    });
  });
}

export function preloadComponent(
  componentImport: () => Promise<{ default: ComponentType<unknown> }>
): void {
  componentImport()
    .then(() => console.log('Component preloaded successfully'))
    .catch((error) => console.error('Component preload failed:', error));
}

export function createRoutePreloader() {
  const preloadedRoutes = new Set<string>();

  return {
    preload: (routePath: string, importFn: () => Promise<unknown>) => {
      if (preloadedRoutes.has(routePath)) {
        return;
      }

      preloadedRoutes.add(routePath);
      importFn()
        .then(() => console.log(`Route ${routePath} preloaded`))
        .catch((error) => console.error(`Failed to preload ${routePath}:`, error));
    },
    
    isPreloaded: (routePath: string) => preloadedRoutes.has(routePath),
    
    clear: () => preloadedRoutes.clear(),
  };
}

export const routePreloader = createRoutePreloader();

