import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  FCP: number | null;
  LCP: number | null;
  FID: number | null;
  CLS: number | null;
  TTFB: number | null;
}

export const usePerformance = (enabled: boolean = true) => {
  const logMetric = useCallback((name: string, value: number) => {
    if (!enabled) return;
    
    console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        value: Math.round(value),
        metric_id: name,
      });
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          const ttfb = navEntry.responseStart - navEntry.requestStart;
          logMetric('TTFB', ttfb);
          
          const domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
          logMetric('DOM_CONTENT_LOADED', domContentLoaded);
          
          const loadComplete = navEntry.loadEventEnd - navEntry.loadEventStart;
          logMetric('LOAD_COMPLETE', loadComplete);
        }

        if (entry.entryType === 'paint') {
          const paintEntry = entry as PerformancePaintTiming;
          logMetric(paintEntry.name.toUpperCase().replace(/-/g, '_'), paintEntry.startTime);
        }

        if (entry.entryType === 'largest-contentful-paint') {
          logMetric('LCP', entry.startTime);
        }

        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming & { processingStart: number };
          logMetric('FID', fidEntry.processingStart - fidEntry.startTime);
        }

        if (entry.entryType === 'layout-shift') {
          const clsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value: number };
          if (!clsEntry.hadRecentInput) {
            logMetric('CLS', clsEntry.value);
          }
        }
      }
    });

    try {
      observer.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
      });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    return () => {
      observer.disconnect();
    };
  }, [enabled, logMetric]);

  const measureComponentRender = useCallback((componentName: string) => {
    if (!enabled) return () => {};

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      logMetric(`COMPONENT_RENDER_${componentName}`, renderTime);
    };
  }, [enabled, logMetric]);

  const measureAsyncOperation = useCallback(async <T,>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    if (!enabled) {
      return operation();
    }

    const startTime = performance.now();
    try {
      const result = await operation();
      const endTime = performance.now();
      logMetric(`ASYNC_${operationName}`, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      logMetric(`ASYNC_${operationName}_ERROR`, endTime - startTime);
      throw error;
    }
  }, [enabled, logMetric]);

  const getNavigationTiming = useCallback((): PerformanceNavigationTiming | null => {
    const entries = performance.getEntriesByType('navigation');
    return entries.length > 0 ? entries[0] as PerformanceNavigationTiming : null;
  }, []);

  const getResourceTiming = useCallback((resourceUrl: string): PerformanceResourceTiming | null => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return entries.find(entry => entry.name.includes(resourceUrl)) || null;
  }, []);

  const clearPerformanceData = useCallback(() => {
    performance.clearMarks();
    performance.clearMeasures();
    performance.clearResourceTimings();
  }, []);

  return {
    measureComponentRender,
    measureAsyncOperation,
    getNavigationTiming,
    getResourceTiming,
    clearPerformanceData,
  };
};

export const reportWebVitals = (onPerfEntry?: (metric: PerformanceEntry) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          onPerfEntry(entry);
        }
      });

      try {
        observer.observe({
          entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
        });
      } catch (error) {
        console.warn('Performance observer not supported');
      }
    }
  }
};

