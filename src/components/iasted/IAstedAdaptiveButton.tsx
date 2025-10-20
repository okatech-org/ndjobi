/**
 * Bouton iAsted adaptatif qui choisit automatiquement
 * entre la version desktop et mobile selon l'appareil
 */

import React from 'react';
import { IAstedFloatingButton } from './IAstedFloatingButton';
import { IAstedMobileButton } from './IAstedMobileButton';
import { PerformanceOptimizationService } from '@/services/performanceOptimization';

interface IAstedAdaptiveButtonProps {
  className?: string;
}

export const IAstedAdaptiveButton: React.FC<IAstedAdaptiveButtonProps> = ({ className }) => {
  // Détecter si on est sur mobile
  const isMobile = PerformanceOptimizationService.isMobileDevice();

  // Choisir automatiquement le bon composant
  if (isMobile) {
    return <IAstedMobileButton className={className} />;
  }

  return <IAstedFloatingButton className={className} />;
};
