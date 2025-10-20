import { useProtocolEtat } from '@/hooks/useProtocolEtat';

export const usePresidentData = () => {
  const {
    kpis,
    casSensibles,
    distributionRegionale,
    performanceMinisteres,
    evolutionMensuelle,
    visionData,
    isLoading,
    enregistrerDecision,
    genererRapport
  } = useProtocolEtat();

  const opinionPublique = {
    satisfactionGlobale: 62,
    tendance: 'stable',
    sentimentDominant: 'Préoccupé mais optimiste',
    principauxGriefs: [
      { categorie: 'Corruption', intensite: 85, evolution: '+5%' },
      { categorie: 'Pouvoir d\'achat', intensite: 78, evolution: '-2%' },
      { categorie: 'Sécurité', intensite: 65, evolution: 'stable' },
      { categorie: 'Santé publique', intensite: 72, evolution: '+8%' },
      { categorie: 'Emploi jeunes', intensite: 81, evolution: '+3%' }
    ],
    zonesRisque: [
      { region: 'Estuaire', niveau: 'Haute' as const, description: '128 cas signalés' },
      { region: 'Haut-Ogooué', niveau: 'Moyenne' as const, description: '87 cas signalés' }
    ]
  };

  const recommandationsStrategiques = [
    {
      priorite: 'Critique',
      titre: 'Renforcer lutte Gab Pêche',
      description: '18 cas critiques détectés. Action immédiate requise.',
      impact: 'Très élevé',
      delai: '15 jours'
    },
    {
      priorite: 'Haute',
      titre: 'Audit CNSS',
      description: 'Enrichissement illicite détecté (6,7 Mrd FCFA)',
      impact: 'Élevé',
      delai: '30 jours'
    },
    {
      priorite: 'Haute',
      titre: 'Protection lanceurs d\'alerte',
      description: 'Menaces signalées dans secteur santé',
      impact: 'Moyen',
      delai: '7 jours'
    }
  ];

  return {
    kpis,
    casSensibles,
    distributionRegionale,
    performanceMinisteres,
    evolutionMensuelle,
    visionData,
    opinionPublique,
    recommandationsStrategiques,
    isLoading,
    enregistrerDecision,
    genererRapport
  };
};

export default usePresidentData;

