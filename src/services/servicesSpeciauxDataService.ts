/**
 * Service de données pour les Services Spéciaux (Sécurité Nationale)
 * DGSS, DGR, Défense, Intérieur, Affaires Étrangères
 */

export interface CasSecurite {
  id: string;
  titre: string;
  description: string;
  montant: string;
  statut: string;
  priorite: string;
  dateCreation: string;
  secteur: string;
  localisation: string;
  classification: string;
  menace: string;
  sourcesRenseignement?: string;
  coordination?: string;
  prochaine

Etape?: string;
}

export interface MenaceStrategique {
  id: string;
  titre: string;
  description: string;
  impact: string;
  montant: string;
  statut: string;
  classification: string;
  dateDetection: string;
  secteur: string;
  niveauMenace: string;
  planAction: string;
  kpis: Array<{
    indicateur: string;
    cible: string;
    actuel: string;
  }>;
}

export interface HistoriqueOperationnel {
  id: number;
  date: string;
  action: string;
  description: string;
  status: string;
  montant: string;
  classification?: string;
}

export interface RecommandationSecurite {
  id: string;
  titre: string;
  description: string;
  priorite: string;
  statut: string;
  classification: string;
  impact: string;
  delai: string;
  responsable: string;
  budget?: string;
}

export interface OpinionPubliqueSecurite {
  sentimentGeneral: string;
  scoreConfiance: number;
  tauxSatisfaction: number;
  risqueSocial: string;
  principalesReclamations: Array<{
    titre: string;
    description: string;
    niveau: number;
    tendance: string;
  }>;
  impactPolitique: {
    stabiliteSociale: string;
    crédibilitéGouvernement: string;
    risqueManifestations: string;
    soutienPopulaire: string;
  };
  recommandationsCommunication: string[];
  actionsCorrectivesUrgentes: string[];
  sourcesdonnees: string[];
}

/**
 * Génère les données d'historique opérationnel pour un service de sécurité
 */
export function getHistoriqueOperationnel(service: string, classification: string): HistoriqueOperationnel[] {
  return [
    {
      id: 1,
      date: '2025-01-18',
      action: 'Opération classifiée',
      description: `${classification} - Surveillance cible prioritaire neutralisée`,
      status: 'Terminé',
      montant: 'Classifié',
      classification
    },
    {
      id: 2,
      date: '2025-01-16',
      action: 'Rapport de renseignement',
      description: 'Synthèse mensuelle transmise à la Présidence',
      status: 'Transmis',
      montant: 'N/A',
      classification
    },
    {
      id: 3,
      date: '2025-01-14',
      action: 'Coordination interservices',
      description: 'Réunion sécuritaire avec DGSS, DGR et Défense',
      status: 'Terminé',
      montant: 'N/A',
      classification: 'CONFIDENTIEL DÉFENSE'
    }
  ];
}

/**
 * Génère les cas sensibles selon le service
 */
export function getCasSensibles(service: string): CasSecurite[] {
  const casParService: Record<string, CasSecurite[]> = {
    'DGSS': [
      {
        id: 'SEC-2025-047',
        titre: 'Réseau corruption haute administration',
        description: 'Surveillance de 7 hauts fonctionnaires suspectés. Interceptions actives. Preuves en cours de consolidation.',
        montant: 'Estimation: 12 Mrd FCFA',
        statut: 'Surveillance active',
        priorite: 'Critique',
        dateCreation: '2025-01-10',
        secteur: 'Sécurité d\'État',
        localisation: 'Libreville',
        classification: 'SECRET DÉFENSE',
        menace: 'Sécurité intérieure',
        sourcesRenseignement: '7 HUMINT confirmées + Interceptions téléphoniques autorisées',
        prochaineEtape: 'Consolidation preuves avant interpellations (J-45)'
      },
      {
        id: 'SEC-2025-052',
        titre: 'Infiltration organisation criminelle transnationale',
        description: 'Agent infiltré dans réseau de blanchiment. Connexions avec 3 pays limitrophes confirmées.',
        montant: 'Flux: 8 Mrd FCFA/an',
        statut: 'Opération en cours',
        priorite: 'Très élevée',
        dateCreation: '2025-01-12',
        secteur: 'Contre-criminalité organisée',
        localisation: 'Multinational',
        classification: 'SECRET DÉFENSE',
        menace: 'Criminalité transnationale',
        sourcesRenseignement: 'Agent infiltré + 4 sources HUMINT',
        prochaineEtape: 'Démantèlement coordonné prévu Q2-2025'
      }
    ],
    'DGR': [
      {
        id: 'INTEL-2025-034',
        titre: 'Veille corruption secteur extractif',
        description: 'Renseignement sur versements suspects sociétés pétrolières. 4 sources HUMINT actives. Analyse financière en cours.',
        montant: 'Potentiel: 25 Mrd FCFA',
        statut: 'Analyse en cours',
        priorite: 'Élevée',
        dateCreation: '2025-01-08',
        secteur: 'Renseignement économique',
        localisation: 'Port-Gentil',
        classification: 'SECRET DÉFENSE',
        menace: 'Souveraineté économique',
        sourcesRenseignement: '4 sources HUMINT haut niveau + Analyses financières UIF',
        prochaineEtape: 'Recoupement avec services alliés (J-30)'
      },
      {
        id: 'INTEL-2025-041',
        titre: 'Ingérence étrangère présumée',
        description: 'Activités suspectes ambassade tierce. Surveillance diplomatique renforcée. Sources SIGINT confirmées.',
        montant: 'N/A',
        statut: 'Surveillance diplomatique',
        priorite: 'Critique',
        dateCreation: '2025-01-14',
        secteur: 'Contre-espionnage',
        localisation: 'Libreville',
        classification: 'TRÈS SECRET DÉFENSE',
        menace: 'Souveraineté nationale',
        sourcesRenseignement: 'SIGINT + 5 sources HUMINT diplomatiques',
        coordination: 'Services alliés (France, États-Unis) informés',
        prochaineEtape: 'Décision présidentielle requise (mesures diplomatiques)'
      }
    ],
    'Défense Nationale': [
      {
        id: 'MIL-2025-019',
        titre: 'Sécurisation sites militaires sensibles',
        description: 'Audit sécuritaire de 12 installations stratégiques. 3 vulnérabilités identifiées et corrigées.',
        montant: 'Budget: 450 M FCFA',
        statut: 'Mesures déployées',
        priorite: 'Haute',
        dateCreation: '2025-01-05',
        secteur: 'Sécurité militaire',
        localisation: 'National',
        classification: 'SECRET DÉFENSE',
        menace: 'Protection infrastructures critiques',
        prochaineEtape: 'Audit de contrôle (Q2-2025)'
      },
      {
        id: 'MIL-2025-023',
        titre: 'Contre-espionnage militaire',
        description: 'Détection tentative d\'infiltration réseau informatique FAG. Source neutralisée. Contre-mesures déployées.',
        montant: 'N/A',
        statut: 'Menace neutralisée',
        priorite: 'Critique',
        dateCreation: '2025-01-11',
        secteur: 'Cyberdéfense',
        localisation: 'Libreville',
        classification: 'TRÈS SECRET DÉFENSE',
        menace: 'Sécurité militaire',
        sourcesRenseignement: 'Détection système + Investigation forensique',
        prochaineEtape: 'Renforcement protocoles cyber (en cours)'
      }
    ],
    'Intérieur': [
      {
        id: 'INT-2025-067',
        titre: 'Lutte anti-terrorisme préventive',
        description: 'Surveillance 5 individus radicalisés. Coordination avec DGSS. Veille réseaux sociaux active.',
        montant: 'N/A',
        statut: 'Surveillance préventive',
        priorite: 'Critique',
        dateCreation: '2025-01-09',
        secteur: 'Anti-terrorisme',
        localisation: 'Libreville, Franceville',
        classification: 'SECRET DÉFENSE',
        menace: 'Terrorisme',
        coordination: 'DGSS + Services régionaux (CEMAC)',
        prochaineEtape: 'Évaluation continue + Mesures administratives si nécessaire'
      },
      {
        id: 'INT-2025-072',
        titre: 'Trafic transfrontalier armes et drogues',
        description: 'Opération coordonnée Gendarmerie-Douanes. 3 filières démantelées. 12 arrestations.',
        montant: 'Saisies: 180 M FCFA',
        statut: 'Opération réussie',
        priorite: 'Élevée',
        dateCreation: '2025-01-13',
        secteur: 'Sécurité frontalière',
        localisation: 'Frontière nord',
        classification: 'CONFIDENTIEL DÉFENSE',
        menace: 'Criminalité transnationale',
        prochaineEtape: 'Procédures judiciaires en cours'
      }
    ],
    'Affaires Étrangères': [
      {
        id: 'DIP-2025-028',
        titre: 'Veille diplomatique corruption internationale',
        description: 'Renseignement sur versements suspects à officiels gabonais par société étrangère. Coordination avec Interpol.',
        montant: 'Allégations: 3 Mrd FCFA',
        statut: 'Enquête internationale',
        priorite: 'Haute',
        dateCreation: '2025-01-07',
        secteur: 'Renseignement diplomatique',
        localisation: 'International',
        classification: 'CONFIDENTIEL DIPLOMATIQUE',
        menace: 'Image internationale',
        coordination: 'Interpol, Services alliés, Parquets étrangers',
        prochaineEtape: 'Auditions témoins internationaux (Q1-2025)'
      },
      {
        id: 'DIP-2025-033',
        titre: 'Protection ressortissants zone à risque',
        description: 'Évacuation préventive 23 ressortissants gabonais pays instable. Coordination consulaire réussie.',
        montant: 'Coût: 85 M FCFA',
        statut: 'Opération terminée',
        priorite: 'Critique',
        dateCreation: '2025-01-15',
        secteur: 'Protection consulaire',
        localisation: 'Afrique Centrale',
        classification: 'CONFIDENTIEL DIPLOMATIQUE',
        menace: 'Sécurité ressortissants',
        prochaineEtape: 'Débriefing et protocoles actualisés'
      }
    ]
  };

  return casParService[service] || [];
}

/**
 * Génère l'opinion publique adaptée aux services spéciaux
 */
export function getOpinionPubliqueSecurite(service: string): OpinionPubliqueSecurite {
  const isRenseignement = ['DGSS', 'DGR', 'Défense Nationale'].includes(service);
  
  return {
    sentimentGeneral: isRenseignement ? 'Confiance modérée' : 'Confiance élevée',
    scoreConfiance: isRenseignement ? 62 : 74,
    tauxSatisfaction: isRenseignement ? 58 : 71,
    risqueSocial: 'Faible',
    principalesReclamations: [
      {
        titre: isRenseignement 
          ? 'Demande plus de transparence sur actions menées'
          : 'Demande sécurité renforcée quartiers',
        description: isRenseignement
          ? 'Citoyens souhaitent bilans publics (dans limites secret défense) sur efficacité lutte corruption et menaces sécuritaires neutralisées.'
          : 'Populations demandent présence sécuritaire visible et rapide dans quartiers périphériques face à criminalité.',
        niveau: 65,
        tendance: 'stable'
      },
      {
        titre: 'Inquiétudes sur corruption interne services',
        description: 'Perception que services sécuritaires peuvent être infiltrés par corruption. Demande audits indépendants et sanctions exemplaires agents corrompus.',
        niveau: 48,
        tendance: 'hausse'
      },
      {
        titre: 'Soutien actions fermes anticorruption',
        description: 'Opinion publique approuve fermement lutte corruption et démantèlements réseaux criminels. Demande résultats concrets et poursuites judiciaires abouties.',
        niveau: 82,
        tendance: 'hausse'
      }
    ],
    impactPolitique: {
      stabiliteSociale: 'Stable',
      crédibilitéGouvernement: isRenseignement ? 'Modérée' : 'Bonne',
      risqueManifestations: 'Faible',
      soutienPopulaire: isRenseignement ? '62%' : '74%'
    },
    recommandationsCommunication: [
      'Communiquer régulièrement sur succès opérationnels (sans compromettre secret)',
      'Transparence sur moyens alloués lutte corruption',
      'Valoriser professionnalisme et sacrifices agents terrain',
      'Montrer indépendance services face aux pressions'
    ],
    actionsCorrectivesUrgentes: [
      'Campagne médiatique sur réalisations concrètes',
      'Audits internes et sanctions publiques agents déviants',
      'Renforcement contrôles internes déontologie',
      'Dialogue citoyen sur attentes sécuritaires'
    ],
    sourcesdonnees: [
      'Sondages opinion (Institut Gabonais Sondages)',
      'Réseaux sociaux (analyse sentiment)',
      'Médias traditionnels (revue de presse)',
      'Remontées terrain (agents liaison communautés)'
    ]
  };
}

/**
 * Génère les recommandations de sécurité nationale
 */
export function getRecommandationsSecurite(service: string, classification: string): RecommandationSecurite[] {
  const isRenseignement = ['DGSS', 'DGR', 'Défense Nationale'].includes(service);
  
  return [
    {
      id: 'REC-SEC-001',
      titre: 'Renforcement moyens humains et techniques',
      description: isRenseignement 
        ? 'Augmentation effectifs analystes renseignement. Formation continue agents (HUMINT, SIGINT, cyber). Équipements surveillance moderne (drones, interceptions).'
        : 'Renforcement capacités opérationnelles. Formation spécialisée. Équipements modernes.',
      priorite: 'Critique',
      statut: 'En cours',
      classification,
      impact: 'Amélioration efficacité opérationnelle',
      delai: '12 mois',
      responsable: service,
      budget: '2 800 M FCFA'
    },
    {
      id: 'REC-SEC-002',
      titre: 'Coordination interservices renforcée',
      description: 'Création cellule coordination DGSS-DGR-Défense-Intérieur. Partage renseignement temps réel. Réunions hebdomadaires. Protocoles intervention conjointe.',
      priorite: 'Élevée',
      statut: 'Proposé',
      classification: 'CONFIDENTIEL DÉFENSE',
      impact: 'Synergie services sécuritaires',
      delai: '6 mois',
      responsable: 'Présidence de la République',
      budget: '450 M FCFA'
    },
    {
      id: 'REC-SEC-003',
      titre: 'Cadre juridique lutte corruption renforcé',
      description: 'Révision code pénal (peines aggravées). Protection lanceurs alerte. Conventions internationales (UNCAC, OCDE). Tribunaux spécialisés corruption.',
      priorite: 'Très élevée',
      statut: 'Proposé',
      classification: 'DIFFUSION RESTREINTE',
      impact: 'Base légale solide répression',
      delai: '18 mois',
      responsable: 'Ministère Justice',
      budget: '680 M FCFA'
    }
  ];
}

