/**
 * Bouton iAsted adaptatif qui choisit automatiquement
 * entre la version desktop et mobile selon l'appareil
 */

import React from 'react';
import { IAstedFloatingButton } from '@/components/admin/IAstedFloatingButton';
import { IAstedMobileButton } from './IAstedMobileButton';
import { PerformanceOptimizationService } from '@/services/performanceOptimization';

export const IAstedAdaptiveButton: React.FC = () => {
  // Détecter si on est sur mobile
  const isMobile = PerformanceOptimizationService.isMobileDevice();

  // Choisir automatiquement le bon composant
  if (isMobile) {
    return <IAstedMobileButton />;
  }

  return <IAstedFloatingButton />;
};
