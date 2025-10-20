/**
 * Formate un montant en FCFA avec unités (Mrd, M)
 */
export const formatMontant = (montant: number): string => {
  if (montant >= 1000000000) {
    return `${(montant / 1000000000).toFixed(2)} Mrd FCFA`;
  }
  if (montant >= 1000000) {
    return `${(montant / 1000000).toFixed(0)} M FCFA`;
  }
  return `${montant.toLocaleString()} FCFA`;
};

/**
 * Formate une date au format français
 */
export const formatDateFR = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formate une date courte
 */
export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR');
};

/**
 * Extrait le montant numérique d'une chaîne
 */
export const extractMontant = (montantStr: string | number): number => {
  if (typeof montantStr === 'number') return montantStr;
  return parseInt(montantStr.replace(/[^\d]/g, '')) || 0;
};

/**
 * Retourne la variante de Badge selon priorité
 */
export const getPriorityVariant = (priorite: string): 'destructive' | 'default' | 'secondary' | 'outline' => {
  const lower = priorite.toLowerCase();
  if (lower.includes('critique') || lower.includes('urgent')) return 'destructive';
  if (lower.includes('haute') || lower.includes('élevé')) return 'default';
  return 'secondary';
};

/**
 * Retourne la classe de couleur selon priorité
 */
export const getPriorityColor = (priorite: string): string => {
  const lower = priorite.toLowerCase();
  if (lower.includes('critique') || lower.includes('urgent')) return 'text-red-600';
  if (lower.includes('haute') || lower.includes('élevé')) return 'text-orange-600';
  return 'text-blue-600';
};

