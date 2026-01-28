/**
 * Hook personnalisé pour l'optimisation des performances
 * 
 * Fournit des utilitaires pour optimiser les performances
 * des composants React et des interactions utilisateur
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { PerformanceOptimizationService } from '@/services/performanceOptimization';

export interface UsePerformanceOptimizationOptions {
  enablePreloading?: boolean;
  enableCaching?: boolean;
  enableDebouncing?: boolean;
  debounceDelay?: number;
}

export const usePerformanceOptimization = (options: UsePerformanceOptimizationOptions = {}) => {
  const {
    enablePreloading = true,
    enableCaching = true,
    enableDebouncing = true,
    debounceDelay = 300
  } = options;

  const [isOptimized, setIsOptimized] = useState(false);
  const preloadTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Précharger les données critiques
   */
  const preloadData = useCallback(async () => {
    if (!enablePreloading) return;

    try {
      await PerformanceOptimizationService.preloadCriticalData();
      setIsOptimized(true);
      console.log('✅ Données préchargées avec succès');
    } catch (error) {
      console.error('❌ Erreur préchargement:', error);
    }
  }, [enablePreloading]);

  /**
   * Debounce une fonction
   */
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T
  ): ((...args: Parameters<T>) => void) => {
    if (!enableDebouncing) return func;
    return PerformanceOptimizationService.debounce(func, debounceDelay);
  }, [enableDebouncing, debounceDelay]);

  /**
   * Throttle une fonction
   */
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number = 100
  ): ((...args: Parameters<T>) => void) => {
    return PerformanceOptimizationService.throttle(func, limit);
  }, []);

  /**
   * Obtenir des données avec cache
   */
  const getCachedData = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> => {
    if (!enableCaching) {
      return await fetcher();
    }

    try {
      switch (key) {
        case 'system-stats':
          return await PerformanceOptimizationService.getCachedSystemStats(forceRefresh) as T;
        case 'users':
          return await PerformanceOptimizationService.getCachedUsers(forceRefresh) as T;
        case 'activity-logs':
          return await PerformanceOptimizationService.getCachedActivityLogs(forceRefresh) as T;
        default:
          return await fetcher();
      }
    } catch (error) {
      console.error(`Erreur cache ${key}:`, error);
      return await fetcher();
    }
  }, [enableCaching]);

  /**
   * Détecter si on est sur mobile
   */
  const isMobile = PerformanceOptimizationService.isMobileDevice();

  /**
   * Obtenir l'URL d'image optimisée
   */
  const getOptimizedImageUrl = useCallback((originalUrl: string) => {
    return PerformanceOptimizationService.getOptimizedImageUrl(originalUrl, isMobile);
  }, [isMobile]);

  /**
   * Obtenir les statistiques de performance
   */
  const getPerformanceStats = useCallback(() => {
    return PerformanceOptimizationService.getPerformanceStats();
  }, []);

  /**
   * Nettoyer le cache
   */
  const clearCache = useCallback(() => {
    PerformanceOptimizationService.clearCache();
    setIsOptimized(false);
  }, []);

  // Précharger les données au montage
  useEffect(() => {
    if (enablePreloading) {
      preloadTimeoutRef.current = setTimeout(preloadData, 100);
    }

    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [enablePreloading, preloadData]);

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOptimized,
    isMobile,
    preloadData,
    debounce,
    throttle,
    getCachedData,
    getOptimizedImageUrl,
    getPerformanceStats,
    clearCache
  };
};
