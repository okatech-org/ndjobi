import { supabase } from "@/integrations/supabase/client";

export interface SignalementScoring {
  priorityScore: number;
  credibilityScore: number;
  category: string;
  urgency: 'critique' | 'haute' | 'moyenne' | 'basse';
  corruptionType: string;
  estimatedImpact: string;
  recommendations: string[];
  aiAnalysis: {
    summary: string;
    keyFactors: string[];
    riskIndicators: string[];
    suggestedActions: string[];
  };
}

export interface SignalementData {
  id: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  attachments?: any;
  created_at: string;
}

const CORRUPTION_CATEGORIES = {
  'corruption_administrative': {
    keywords: ['fonctionnaire', 'administration', 'service public', 'permis', 'autorisation', 'document'],
    basePriority: 60,
    impactMultiplier: 1.2
  },
  'corruption_economique': {
    keywords: ['entreprise', 'contrat', 'marché public', 'appel d\'offres', 'soumission', 'adjudication'],
    basePriority: 75,
    impactMultiplier: 1.5
  },
  'detournement_fonds': {
    keywords: ['détournement', 'fonds publics', 'budget', 'caisse', 'argent', 'millions', 'milliards'],
    basePriority: 90,
    impactMultiplier: 2.0
  },
  'fraude': {
    keywords: ['fraude', 'faux', 'falsification', 'manipulation', 'contrefaçon'],
    basePriority: 70,
    impactMultiplier: 1.4
  },
  'abus_pouvoir': {
    keywords: ['abus', 'intimidation', 'menace', 'pression', 'autorité', 'chef', 'responsable'],
    basePriority: 65,
    impactMultiplier: 1.3
  },
  'nepotisme': {
    keywords: ['népotisme', 'favoritisme', 'famille', 'ami', 'recrutement', 'nomination'],
    basePriority: 55,
    impactMultiplier: 1.1
  },
  'autre': {
    keywords: [],
    basePriority: 50,
    impactMultiplier: 1.0
  }
};

const CREDIBILITY_FACTORS = {
  hasAttachments: 20,
  hasLocation: 15,
  detailedDescription: 15,
  specificDates: 10,
  specificAmounts: 10,
  specificNames: 10,
  witnessesNumber: 10,
  officialReferences: 10
};

export function analyzeSignalement(signalement: SignalementData): SignalementScoring {
  const textContent = `${signalement.title} ${signalement.description}`.toLowerCase();
  
  const category = detectCategory(textContent);
  const categoryConfig = CORRUPTION_CATEGORIES[category as keyof typeof CORRUPTION_CATEGORIES] || CORRUPTION_CATEGORIES.autre;
  
  const credibilityScore = calculateCredibility(signalement, textContent);
  const priorityScore = calculatePriority(signalement, category, credibilityScore, categoryConfig);
  
  const urgency = determineUrgency(priorityScore, credibilityScore);
  const impactEstimate = estimateImpact(textContent, category);
  const recommendations = generateRecommendations(category, priorityScore, credibilityScore);
  
  const aiAnalysis = {
    summary: generateSummary(signalement, category, priorityScore),
    keyFactors: identifyKeyFactors(textContent, category),
    riskIndicators: identifyRisks(textContent, credibilityScore),
    suggestedActions: generateActions(category, urgency, priorityScore)
  };

  return {
    priorityScore: Math.min(100, Math.max(0, priorityScore)),
    credibilityScore: Math.min(100, Math.max(0, credibilityScore)),
    category,
    urgency,
    corruptionType: getCategoryLabel(category),
    estimatedImpact: impactEstimate,
    recommendations,
    aiAnalysis
  };
}

function detectCategory(text: string): string {
  let maxScore = 0;
  let detectedCategory = 'autre';

  for (const [category, config] of Object.entries(CORRUPTION_CATEGORIES)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (text.includes(keyword)) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category;
    }
  }

  return detectedCategory;
}

function calculateCredibility(signalement: SignalementData, text: string): number {
  let score = 30;

  if (signalement.attachments && Object.keys(signalement.attachments).length > 0) {
    score += CREDIBILITY_FACTORS.hasAttachments;
  }

  if (signalement.location) {
    score += CREDIBILITY_FACTORS.hasLocation;
  }

  if (signalement.description.length > 200) {
    score += CREDIBILITY_FACTORS.detailedDescription;
  }

  const dateRegex = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/gi;
  if (dateRegex.test(text)) {
    score += CREDIBILITY_FACTORS.specificDates;
  }

  const amountRegex = /\d+\s*(fcfa|cfa|francs?|euros?|dollars?|millions?|milliards?)/gi;
  if (amountRegex.test(text)) {
    score += CREDIBILITY_FACTORS.specificAmounts;
  }

  const namePattern = /(monsieur|madame|m\.|mme|docteur|dr|professeur|pr|ministre|directeur)/gi;
  if (namePattern.test(text)) {
    score += CREDIBILITY_FACTORS.specificNames;
  }

  return score;
}

function calculatePriority(
  signalement: SignalementData,
  category: string,
  credibilityScore: number,
  categoryConfig: any
): number {
  let priority = categoryConfig.basePriority;

  priority = priority * (credibilityScore / 100) * categoryConfig.impactMultiplier;

  const recentBonus = isRecent(signalement.created_at) ? 10 : 0;
  priority += recentBonus;

  return Math.round(priority);
}

function isRecent(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffHours < 24;
}

function determineUrgency(priorityScore: number, credibilityScore: number): 'critique' | 'haute' | 'moyenne' | 'basse' {
  if (priorityScore >= 80 && credibilityScore >= 70) return 'critique';
  if (priorityScore >= 65) return 'haute';
  if (priorityScore >= 45) return 'moyenne';
  return 'basse';
}

function estimateImpact(text: string, category: string): string {
  const highImpactKeywords = ['millions', 'milliards', 'national', 'ministère', 'président', 'gouvernement'];
  const hasHighImpact = highImpactKeywords.some(keyword => text.includes(keyword));
  
  if (hasHighImpact) {
    return 'Impact national majeur - Nécessite intervention présidentielle';
  } else if (category === 'detournement_fonds' || category === 'corruption_economique') {
    return 'Impact économique significatif - Priorité haute';
  } else {
    return 'Impact local/régional - Traitement standard';
  }
}

function generateRecommendations(category: string, priority: number, credibility: number): string[] {
  const recommendations: string[] = [];

  if (priority >= 80) {
    recommendations.push('Assigner immédiatement à un agent senior DGSS');
    recommendations.push('Informer le Procureur de la République');
  }

  if (credibility >= 70) {
    recommendations.push('Preuves solides - Investigation approfondie recommandée');
  } else if (credibility < 50) {
    recommendations.push('Vérifier la crédibilité avant de poursuivre');
  }

  if (category === 'detournement_fonds') {
    recommendations.push('Activer le gel des comptes si montants identifiés');
    recommendations.push('Coordonner avec la DGCP et la Cour des Comptes');
  }

  if (category === 'corruption_economique') {
    recommendations.push('Vérifier les registres de marchés publics');
    recommendations.push('Examiner les soumissions concurrentes');
  }

  return recommendations;
}

function generateSummary(signalement: SignalementData, category: string, priority: number): string {
  return `Signalement de ${getCategoryLabel(category)} avec score de priorité ${priority}/100. ` +
         `Localisation: ${signalement.location || 'Non spécifiée'}. ` +
         `Nécessite ${priority >= 75 ? 'une attention immédiate' : 'un traitement standard'}.`;
}

function identifyKeyFactors(text: string, category: string): string[] {
  const factors: string[] = [];
  
  if (text.match(/\d+\s*(fcfa|millions|milliards)/i)) {
    factors.push('Montants financiers spécifiques mentionnés');
  }
  
  if (text.match(/(monsieur|madame|ministre|directeur|chef)/i)) {
    factors.push('Personnalités identifiées');
  }
  
  if (text.match(/preuve|document|photo|enregistrement/i)) {
    factors.push('Preuves matérielles disponibles');
  }
  
  if (text.match(/témoin|présent|assisté|vu/i)) {
    factors.push('Témoignages directs');
  }

  return factors.length > 0 ? factors : ['Analyse basée sur la description fournie'];
}

function identifyRisks(text: string, credibilityScore: number): string[] {
  const risks: string[] = [];
  
  if (credibilityScore < 40) {
    risks.push('Score de crédibilité faible - Vérification nécessaire');
  }
  
  if (text.match(/menace|intimidation|danger/i)) {
    risks.push('Risque pour la sécurité du signalant');
  }
  
  if (text.match(/urgent|immédiat|maintenant/i)) {
    risks.push('Situation potentiellement urgente');
  }

  return risks.length > 0 ? risks : ['Aucun indicateur de risque critique détecté'];
}

function generateActions(category: string, urgency: string, priority: number): string[] {
  const actions: string[] = [];

  if (urgency === 'critique') {
    actions.push('Activation du module XR-7 recommandée');
    actions.push('Notification immédiate au Président');
  }

  if (priority >= 70) {
    actions.push('Assigner à l\'équipe d\'investigation prioritaire');
  } else {
    actions.push('Ajouter à la file d\'attente standard');
  }

  actions.push('Envoyer un accusé de réception au signalant');
  actions.push('Programmer un suivi dans 48-72h');

  return actions;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'corruption_administrative': 'Corruption Administrative',
    'corruption_economique': 'Corruption Économique',
    'detournement_fonds': 'Détournement de Fonds Publics',
    'fraude': 'Fraude',
    'abus_pouvoir': 'Abus de Pouvoir',
    'nepotisme': 'Népotisme/Favoritisme',
    'autre': 'Autre Type de Corruption'
  };
  return labels[category] || labels['autre'];
}

export async function scoreAndUpdateSignalement(signalement: SignalementData): Promise<SignalementScoring> {
  const scoring = analyzeSignalement(signalement);

  try {
    await supabase
      .from('signalements')
      .update({
        ai_priority_score: scoring.priorityScore,
        ai_credibility_score: scoring.credibilityScore,
        corruption_category: scoring.category,
        ai_analysis: scoring.aiAnalysis,
        priority: scoring.urgency,
        updated_at: new Date().toISOString()
      })
      .eq('id', signalement.id);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du scoring:', error);
  }

  return scoring;
}

export async function batchScoreSignalements(signalements: SignalementData[]): Promise<SignalementScoring[]> {
  const results: SignalementScoring[] = [];
  
  for (const signalement of signalements) {
    const scoring = await scoreAndUpdateSignalement(signalement);
    results.push(scoring);
  }
  
  return results;
}

export async function getTopPrioritySignalements(limit: number = 100) {
  try {
    // Stub - fonction RPC non disponible
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des signalements prioritaires:', error);
    return [];
  }
}

