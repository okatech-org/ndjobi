export interface KPI {
  label: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export interface CaseCritique {
  id: string;
  titre: string;
  montant: number | string;
  priorite: 'urgent' | 'élevée' | 'moyenne' | 'critique' | 'haute';
  statut: 'ouvert' | 'en_cours' | 'résolu' | 'pending' | 'in_progress' | 'resolved';
  dateSignalement: string;
  localisation?: string;
  location?: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  urgence?: string;
  ai_priority_score?: number;
  ai_analysis_summary?: string;
  reference_id?: string;
  categorie?: string;
  metadata?: Record<string, any>;
}

export interface OpinionPublique {
  satisfactionGlobale: number;
  sentimentDominant: 'positif' | 'neutre' | 'négatif' | string;
  principauxGriefs: Grief[];
  zonesRisque: ZoneRisque[];
  tendance?: string;
  risqueSocial?: string;
  tendanceOpinion?: string;
  noteOpinion?: number;
  tauxSatisfaction?: number[] | number;
}

export interface Grief {
  id?: string;
  categorie: string;
  sujet?: string;
  intensite: number | string;
  occurrences?: number;
  evolution: string;
  description?: string;
  pourcentage?: number;
}

export interface ZoneRisque {
  region: string;
  niveau: 'Haute' | 'Moyenne' | 'Basse';
  description: string;
}

export interface Recommandation {
  id: string;
  titre: string;
  description: string;
  priorite: 'Critique' | 'Haute' | 'Moyenne';
  impact: string;
  delai: string;
  categorie?: string;
  statut?: string;
  budget?: string;
  services?: string;
  responsable?: string;
  justification?: string;
  planAction?: string[];
  risques?: string;
  prochaineEcheance?: string;
  indicateursSucces?: string;
  classification?: string;
  delaiPropose?: string;
  ressourcesNecessaires?: string[];
}

export interface PerformanceMinistere {
  ministere: string;
  signalements: number;
  critiques: number;
  taux: number;
  responsable: string;
}

export interface DistributionRegionale {
  region: string;
  cas: number;
  resolus: number;
  taux: number;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
}

export interface EvolutionMensuelle {
  mois: string;
  signalements: number;
  resolutions: number;
  corruption?: number;
  budget?: number;
}

export interface PilierVision {
  pilier: string;
  score: number;
  objectif: number | string;
  statut: string;
  budget?: string;
  priorite?: string;
}

