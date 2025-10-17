import { useState, useEffect } from 'react';
import { ProtocolEtatService, NationalKPIs } from '@/services/protocolEtatService';
import { useToast } from '@/hooks/use-toast';

export function useProtocolEtat() {
  const [kpis, setKpis] = useState<NationalKPIs | null>(null);
  const [casSensibles, setCasSensibles] = useState<any[]>([]);
  const [distributionRegionale, setDistributionRegionale] = useState<any[]>([]);
  const [performanceMinisteres, setPerformanceMinisteres] = useState<any[]>([]);
  const [sousAdmins, setSousAdmins] = useState<any[]>([]);
  const [evolutionMensuelle, setEvolutionMensuelle] = useState<any[]>([]);
  const [visionData, setVisionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        kpisData,
        casData,
        distribData,
        perfData,
        adminsData,
        evolData,
        visionResult
      ] = await Promise.all([
        ProtocolEtatService.getNationalKPIs(),
        ProtocolEtatService.getCasSensibles(),
        ProtocolEtatService.getDistributionRegionale(),
        ProtocolEtatService.getPerformanceMinisteres(),
        ProtocolEtatService.getSousAdmins(),
        ProtocolEtatService.getEvolutionMensuelle(),
        ProtocolEtatService.getVisionData()
      ]);

      if (kpisData) setKpis(kpisData);
      if (casData.data) setCasSensibles(casData.data);
      if (distribData) setDistributionRegionale(distribData);
      if (perfData) setPerformanceMinisteres(perfData);
      if (adminsData) setSousAdmins(adminsData);
      if (evolData) setEvolutionMensuelle(evolData);
      if (visionResult) setVisionData(visionResult);

    } catch (error) {
      console.error('Erreur chargement données Protocole d\'État:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les données du dashboard',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      toast({
        title: '✅ Décision enregistrée',
        description: `La décision présidentielle a été enregistrée avec succès.`,
        variant: 'default'
      });
      loadAllData();
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible d\'enregistrer la décision',
        variant: 'destructive'
      });
    }

    return result;
  };

  const genererRapport = async (type: 'executif' | 'hebdomadaire' | 'mensuel' | 'annuel') => {
    toast({
      title: '📄 Génération en cours',
      description: `Préparation du rapport ${type}...`,
    });

    const result = await ProtocolEtatService.genererRapportStrategique(type);

    if (result.success && result.reportUrl) {
      toast({
        title: '✅ Rapport généré',
        description: 'Le rapport est prêt au téléchargement.',
        variant: 'default'
      });
      window.open(result.reportUrl, '_blank');
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible de générer le rapport',
        variant: 'destructive'
      });
    }

    return result;
  };

  return {
    kpis,
    casSensibles,
    distributionRegionale,
    performanceMinisteres,
    sousAdmins,
    evolutionMensuelle,
    visionData,
    isLoading,
    enregistrerDecision,
    genererRapport,
    reloadData: loadAllData
  };
}

