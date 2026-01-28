import { useState, useEffect, useCallback } from 'react';

export interface SecurityAlertThresholds {
  // Actions rapides
  rapidActionsCount: number;
  rapidActionsWindowMinutes: number;
  // Modifications de masse
  massStatusChangesCount: number;
  massStatusChangesWindowMinutes: number;
  // Rejets multiples
  massRejectionsCount: number;
  massRejectionsWindowMinutes: number;
  // Résolutions rapides
  quickResolutionMinutes: number;
  // Heures hors bureau
  offHoursStart: number;
  offHoursEnd: number;
  // Notifications
  enableCriticalNotifications: boolean;
  enableWarningNotifications: boolean;
  enableInfoNotifications: boolean;
  soundEnabled: boolean;
}

const DEFAULT_THRESHOLDS: SecurityAlertThresholds = {
  rapidActionsCount: 10,
  rapidActionsWindowMinutes: 5,
  massStatusChangesCount: 5,
  massStatusChangesWindowMinutes: 10,
  massRejectionsCount: 3,
  massRejectionsWindowMinutes: 30,
  quickResolutionMinutes: 2,
  offHoursStart: 0,
  offHoursEnd: 6,
  enableCriticalNotifications: true,
  enableWarningNotifications: true,
  enableInfoNotifications: false,
  soundEnabled: true,
};

const STORAGE_KEY = 'ndjobi-security-alert-thresholds';

export const useSecurityAlertThresholds = () => {
  const [thresholds, setThresholds] = useState<SecurityAlertThresholds>(DEFAULT_THRESHOLDS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les seuils depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setThresholds({ ...DEFAULT_THRESHOLDS, ...parsed });
      }
    } catch (error) {
      console.error('Erreur chargement seuils:', error);
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder les seuils
  const saveThresholds = useCallback((newThresholds: SecurityAlertThresholds) => {
    setThresholds(newThresholds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newThresholds));
    } catch (error) {
      console.error('Erreur sauvegarde seuils:', error);
    }
  }, []);

  // Mettre à jour un seuil spécifique
  const updateThreshold = useCallback(<K extends keyof SecurityAlertThresholds>(
    key: K,
    value: SecurityAlertThresholds[K]
  ) => {
    setThresholds(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erreur sauvegarde seuil:', error);
      }
      return updated;
    });
  }, []);

  // Réinitialiser aux valeurs par défaut
  const resetToDefaults = useCallback(() => {
    setThresholds(DEFAULT_THRESHOLDS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
    }
  }, []);

  return {
    thresholds,
    isLoaded,
    saveThresholds,
    updateThreshold,
    resetToDefaults,
    defaultThresholds: DEFAULT_THRESHOLDS,
  };
};

export default useSecurityAlertThresholds;
