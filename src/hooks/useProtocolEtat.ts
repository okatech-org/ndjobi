import { useState, useEffect } from 'react';
import { ProtocolEtatService } from '@/services/protocolEtatService';
import type { NationalKPIs, SubAdminPerformance, RegionalDistribution } from '@/services/protocolEtatService';
import { toast } from 'sonner';

export function useProtocolEtat() {
  const [kpis, setKpis] = useState<NationalKPIs | null>(null);
  const [casSensibles, setCasSensibles] = useState<any[]>([]);
  const [distributionRegionale, setDistributionRegionale] = useState<RegionalDistribution[]>([]);
  const [subAdminPerformance, setSubAdminPerformance] = useState<SubAdminPerformance[]>([]);
  const [directivesActives, setDirectivesActives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Données compatibles avec l'ancien AdminDashboard
  const [performanceMinisteres, setPerformanceMinisteres] = useState<any[]>([]);
  const [sousAdmins, setSousAdmins] = useState<any[]>([]);
  const [evolutionMensuelle, setEvolutionMensuelle] = useState<any[]>([]);
  const [visionData, setVisionData] = useState<any[]>([]);

  // Charger les données initiales
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Charger en parallèle toutes les données
      const [kpisData, cas, distrib, performance, directives] = await Promise.all([
        ProtocolEtatService.getNationalKPIs(),
        ProtocolEtatService.getCasSensibles(),
        ProtocolEtatService.getDistributionRegionale(),
        ProtocolEtatService.getSubAdminPerformance(),
        ProtocolEtatService.getDirectivesActives()
      ]);

      if (kpisData) setKpis(kpisData);
      if (!cas.error && cas.data) setCasSensibles(cas.data);
      if (distrib) setDistributionRegionale(distrib);
      if (performance) {
        setSubAdminPerformance(performance);
        // Mapper vers l'ancien format pour compatibilité
        setSousAdmins(performance);
      }
      if (!directives.error && directives.data) setDirectivesActives(directives.data);
      
      // Créer données mockées pour l'ancien dashboard
      setPerformanceMinisteres([
        { ministere: 'Justice', signalements: 45, critiques: 12, taux: 78, responsable: 'Sous-Admin Justice' },
        { ministere: 'Défense', signalements: 32, critiques: 8, taux: 85, responsable: 'Sous-Admin Défense' },
        { ministere: 'Intérieur', signalements: 28, critiques: 15, taux: 65, responsable: 'Sous-Admin Intérieur' },
        { ministere: 'Anti-Corruption', signalements: 52, critiques: 25, taux: 72, responsable: 'Sous-Admin Anti-Corruption' },
      ]);
      
      setEvolutionMensuelle([
        { mois: 'Jan', budget: 125 },
        { mois: 'Fév', budget: 210 },
        { mois: 'Mar', budget: 185 },
        { mois: 'Avr', budget: 290 },
        { mois: 'Mai', budget: 340 },
        { mois: 'Juin', budget: 425 }
      ]);
      
      setVisionData([
        { pilier: 'Gabon Vert', progression: 72, budget: 85 },
        { pilier: 'Gabon Industriel', progression: 65, budget: 78 },
        { pilier: 'Gabon Services', progression: 80, budget: 92 },
        { pilier: 'Gouvernance', progression: 58, budget: 65 }
      ]);

    } catch (error) {
      console.error('Erreur chargement données Protocole d\'État:', error);
      toast.error('Impossible de charger les données du dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Enregistrer une décision présidentielle
  const enregistrerDecision = async (
    casId: string,
    decision: 'approuver' | 'rejeter' | 'enquete',
    motif?: string
  ) => {
    const result = await ProtocolEtatService.enregistrerDecisionPresidentielle({
      signalement_id: casId,
      decision_type: decision,
      motif
    });

    if (result.success) {
      toast.success('Décision enregistrée', {
        description: 'La décision présidentielle a été enregistrée avec succès.'
      });
      // Recharger les données
      loadAllData();
    } else {
      toast.error('Erreur', {
        description: result.error || 'Impossible d\'enregistrer la décision'
      });
    }

    return result;
  };

  // Générer un rapport
  const genererRapport = async (type: 'executif' | 'hebdomadaire' | 'mensuel' | 'annuel') => {
    toast.info('Génération en cours', {
      description: `Préparation du rapport ${type}...`
    });

    const result = await ProtocolEtatService.genererRapportStrategique(type);

    if (result.success && result.reportUrl) {
      toast.success('Rapport généré', {
        description: 'Le rapport est prêt au téléchargement.'
      });
      // Ouvrir le rapport dans un nouvel onglet
      window.open(result.reportUrl, '_blank');
    } else {
      toast.error('Erreur', {
        description: result.error || 'Impossible de générer le rapport'
      });
    }

    return result;
  };

  // Diffuser une directive
  const diffuserDirective = async (
    title: string,
    content: string,
    targetMinistries: string[],
    priority: 'Haute' | 'Moyenne' | 'Basse'
  ) => {
    const result = await ProtocolEtatService.diffuserDirective({
      title,
      content,
      target_ministries: targetMinistries,
      priority
    });

    if (result.success) {
      toast.success('Directive diffusée', {
        description: `La directive a été envoyée à ${targetMinistries.length} ministères.`
      });
      // Recharger les directives
      loadAllData();
    } else {
      toast.error('Erreur', {
        description: result.error || 'Impossible de diffuser la directive'
      });
    }

    return result;
  };

  return {
    kpis,
    casSensibles,
    distributionRegionale,
    subAdminPerformance,
    directivesActives,
    isLoading,
    enregistrerDecision,
    genererRapport,
    diffuserDirective,
    reloadData: loadAllData,
    // Compatibilité avec l'ancien AdminDashboard
    performanceMinisteres,
    sousAdmins,
    evolutionMensuelle,
    visionData
  };
}
