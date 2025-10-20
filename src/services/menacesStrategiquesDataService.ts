/**
 * Service de données pour les Menaces Stratégiques - Services Spéciaux
 */

import { MenaceStrategique } from './servicesSpeciauxDataService';

/**
 * Génère les menaces stratégiques détaillées par service
 */
export function getMenacesStrategiques(service: string): MenaceStrategique[] {
  const menacesParService: Record<string, MenaceStrategique[]> = {
    'DGSS': [
      {
        id: 'MENACE-DGSS-001',
        titre: 'Corruption systémique administrations clés',
        description: `**ANALYSE STRATÉGIQUE SÉCURITÉ D'ÉTAT**

**MENACE IDENTIFIÉE:**
Réseau de corruption infiltrant 5 administrations stratégiques (Douanes, Trésor, Contrôle d'État, Marchés publics, Pétrole). Détournements estimés 45 Mrd FCFA sur 24 mois.

**MODE OPÉRATOIRE:**
- Structure pyramidale avec tête pensante non identifiée
- Utilisation de sociétés écrans offshore (Panama, Luxembourg, Dubai)
- Blanchiment via secteur immobilier et import-export
- Complicités bancaires avérées (3 banques commerciales)
- Protection politique présumée à haut niveau

**IMPACT SÉCURITÉ NATIONALE:**
- Affaiblissement capacités régaliennes de l'État
- Risque infiltration criminalité organisée internationale
- Vulnérabilité institutions clés
- Compromission décisions stratégiques
- Menace stabilité économique

**SOURCES ET PREUVES:**
- 7 sources HUMINT confirmées (3 infiltrées, 4 lanceurs d'alerte)
- 450+ heures interceptions téléphoniques (autorisées)
- Analyses financières UIF (Unité Intelligence Financière)
- Rapports surveillance physique (6 mois)
- Documents internes obtenus légalement`,
        impact: 'CRITIQUE - SÉCURITÉ D\'ÉTAT',
        montant: '45 000 000 000 FCFA (estimé)',
        statut: 'Investigation secrète',
        classification: 'SECRET DÉFENSE',
        dateDetection: '2024-11-15',
        secteur: 'Sécurité d\'État - Lutte anticorruption',
        niveauMenace: 'NIVEAU 1 - CRITIQUE',
        planAction: `**PHASE 1 - CONSOLIDATION (EN COURS - 45 jours)**
Budget: 450 M FCFA | Délai: 15 mars 2025
• Élargissement surveillance à 12 cibles secondaires
• Infiltration comptable sociétés écrans
• Coordination avec INTERPOL et services étrangers
• Sécurisation témoins et lanceurs d'alerte
• Cartographie complète réseau financier

**PHASE 2 - DÉMANTÈLEMENT (60 jours)**
Budget: 680 M FCFA | Délai: 15 mai 2025
• Opérations interpellations coordonnées
• Saisies simultanées (domiciles, bureaux, coffres)
• Gel avoirs bancaires (national et international)
• Perquisitions numériques (serveurs, cloud)
• Protection procédure judiciaire

**PHASE 3 - JUDICIARISATION (90 jours)**
Budget: 320 M FCFA | Délai: 15 août 2025
• Constitution dossiers individuels étanches
• Coordination parquets spécialisés
• Auditions témoins protégés
• Expertises comptables et financières
• Préparation procès

**PHASE 4 - RÉCUPÉRATION AVOIRS (180 jours)**
Budget: 520 M FCFA | Délai: Février 2026
• Procédures saisies internationales
• Rapatriement fonds détournés
• Ventes aux enchères biens saisis
• Indemnisation Trésor public

**PHASE 5 - RÉFORMES STRUCTURELLES (12 mois)**
Budget: 2 800 M FCFA | Délai: Janvier 2027
• Audit complet 5 administrations compromises
• Renouvellement personnel clé
• Nouvelles procédures contrôle interne
• Formation intégrité et éthique
• Systèmes informatiques sécurisés`,
        kpis: [
          { indicateur: 'Taux démantèlement réseau', cible: '95%', actuel: '45%' },
          { indicateur: 'Avoirs récupérés', cible: '60% (27 Mrd)', actuel: '0%' },
          { indicateur: 'Condamnations obtenues', cible: '80% prévenus', actuel: '0%' },
          { indicateur: 'Réformes déployées', cible: '100% administrations', actuel: '0%' },
          { indicateur: 'Amélioration indice transparence', cible: '+25 points', actuel: '+0' }
        ]
      }
    ],
    'DGR': [
      {
        id: 'MENACE-DGR-001',
        titre: 'Ingérence économique étrangère secteur stratégique',
        description: `**ANALYSE RENSEIGNEMENT ÉCONOMIQUE**

**MENACE IDENTIFIÉE:**
Tentatives d'influence et corruption ciblant décideurs gabonais dans secteur extractif (pétrole, manganèse, bois). Puissance étrangère identifiée cherchant accès privilégié ressources naturelles.

**MODE OPÉRATOIRE:**
- Lobbying diplomatique agressif
- Versements suspects à intermédiaires locaux (12 identifiés)
- Financement campagnes politiques (allégations)
- Contrats consulting fictifs (400 M FCFA détectés)
- Invitations "voyages d'affaires" tous frais payés

**IMPACT SOUVERAINETÉ:**
- Compromission négociations contrats pétroliers
- Bradage ressources minières stratégiques
- Perte revenus État (estimé: 80 Mrd FCFA sur 5 ans)
- Dépendance économique vis-à-vis puissance étrangère
- Atteinte image internationale Gabon

**ÉVALUATION RENSEIGNEMENT:**
- Sources HUMINT: 5 sources confirmées (niveau confiance: ÉLEVÉ)
- Sources SIGINT: Interceptions diplomatiques (autorisées)
- Sources OSINT: Analyses médias spécialisés et réseaux sociaux
- Recoupements: 87% informations confirmées par sources multiples`,
        impact: 'CRITIQUE - SOUVERAINETÉ ÉCONOMIQUE',
        montant: '80 000 000 000 FCFA (perte potentielle 5 ans)',
        statut: 'Surveillance stratégique',
        classification: 'TRÈS SECRET DÉFENSE',
        dateDetection: '2024-09-20',
        secteur: 'Renseignement économique',
        niveauMenace: 'NIVEAU 1 - CRITIQUE',
        planAction: `**PHASE 1 - CONTRE-RENSEIGNEMENT (EN COURS - 60 jours)**
Budget: 380 M FCFA | Délai: 1er avril 2025
• Surveillance diplomatique accrue (HUMINT + SIGINT)
• Identification tous acteurs réseau influence
• Analyse flux financiers suspects
• Protection décideurs clés (briefings sécurité)
• Coordination services alliés

**PHASE 2 - MESURES DÉFENSIVES (90 jours)**
Budget: 520 M FCFA | Délai: 1er juin 2025
• Expulsion diplomates compromis (persona non grata)
• Gel comptes bancaires intermédiaires corrompus
• Audits conformité sociétés extractives
• Renégociation contrats léonins
• Communication stratégique internationale

**PHASE 3 - CONTRE-OFFENSIVE DIPLOMATIQUE (120 jours)**
Budget: 680 M FCFA | Délai: 1er août 2025
• Dénonciation forums internationaux
• Sanctions ciblées contre société/personnes
• Diversification partenaires économiques
• Renforcement cadre juridique anti-corruption
• Campagne médiatique souveraineté économique

**PHASE 4 - RÉFORMES GOUVERNANCE (18 mois)**
Budget: 4 200 M FCFA | Délai: Août 2026
• Transparence totale contrats extractifs (ITIE+)
• Commission indépendante négociation contrats
• Formation négociateurs d'État
• Systèmes alertes corruptions sectorielles
• Partenariats internationaux équilibrés`,
        kpis: [
          { indicateur: 'Acteurs malveillants neutralisés', cible: '100%', actuel: '58%' },
          { indicateur: 'Contrats renégociés', cible: '12 contrats', actuel: '2' },
          { indicateur: 'Pertes évitées', cible: '80 Mrd FCFA', actuel: '12 Mrd' },
          { indicateur: 'Indice souveraineté économique', cible: '+30 points', actuel: '+8' },
          { indicateur: 'Partenaires économiques diversifiés', cible: '+5 pays', actuel: '+1' }
        ]
      }
    ],
    'Défense Nationale': [
      {
        id: 'MENACE-DEF-001',
        titre: 'Vulnérabilités cybersécurité installations militaires',
        description: `**ANALYSE SÉCURITÉ MILITAIRE**

**MENACE IDENTIFIÉE:**
Failles sécurité informatique détectées sur 8 installations militaires stratégiques. Tentatives intrusion réseau FAG (Forces Armées Gabonaises) confirmées. Origine attaques: multi-sources (étatiques et criminalité organisée).

**VULNÉRABILITÉS CRITIQUES:**
- Logiciels obsolètes (Windows 2008, systèmes non patchés)
- Mots de passe faibles (70% personnel concerné)
- Absence segmentation réseau sensible
- Clés USB non contrôlées (risque malware)
- Personnel non formé (cyber-hygiène défaillante)

**IMPACT DÉFENSE NATIONALE:**
- Risque espionnage militaire (plans, effectifs, équipements)
- Compromission chaîne commandement en cas de conflit
- Sabotage potentiel systèmes d'armes
- Atteinte secret défense
- Vulnérabilité infrastructures critiques`,
        impact: 'CRITIQUE - DÉFENSE NATIONALE',
        montant: 'Coût remédiation: 3 500 M FCFA',
        statut: 'Déploiement contre-mesures',
        classification: 'SECRET DÉFENSE',
        dateDetection: '2024-10-12',
        secteur: 'Cyberdéfense militaire',
        niveauMenace: 'NIVEAU 1 - CRITIQUE',
        planAction: `**PHASE 1 - URGENCE (EN COURS - 30 jours)**
Budget: 850 M FCFA | Délai: 20 février 2025
• Déconnexion systèmes critiques compromis
• Changement tous mots de passe (impose complexité)
• Installation pare-feu nouvelle génération
• Déploiement antivirus/EDR militaire grade
• Audit forensique incidents récents

**PHASE 2 - SÉCURISATION (60 jours)**
Budget: 1 200 M FCFA | Délai: 20 avril 2025
• Segmentation réseau (zones militaires / administratives)
• Chiffrement communications sensibles (niveau OTAN)
• Authentification multi-facteurs obligatoire
• Blocage périphériques USB non autorisés
• Supervision 24/7 (SOC - Security Operations Center)

**PHASE 3 - MODERNISATION (180 jours)**
Budget: 2 800 M FCFA | Délai: Octobre 2025
• Remplacement systèmes obsolètes
• Cloud souverain sécurisé (hébergement national)
• Simulation exercices cyber-attaques (Red Team)
• Protocoles réponse incidents normalisés
• Contrats support technique 24/7

**PHASE 4 - FORMATION (12 mois)**
Budget: 950 M FCFA | Délai: Février 2026
• Formation 100% personnel cyber-hygiène
• Certification 50 experts cybersécurité militaire
• Exercices cyber-défense interarmées
• Sensibilisation officiers (war games cyber)
• Création unité cyber FAG (20 spécialistes)`,
        kpis: [
          { indicateur: 'Vulnérabilités critiques corrigées', cible: '100%', actuel: '45%' },
          { indicateur: 'Intrusions détectées et bloquées', cible: '95%', actuel: '78%' },
          { indicateur: 'Personnel formé cyber-hygiène', cible: '100%', actuel: '22%' },
          { indicateur: 'Temps réponse incident cyber', cible: '<2h', actuel: '12h' },
          { indicateur: 'Certification sécurité OTAN', cible: 'Niveau 3', actuel: 'Niveau 1' }
        ]
      }
    ],
    'Intérieur': [
      {
        id: 'MENACE-INT-001',
        titre: 'Réseaux criminalité organisée transfrontalière',
        description: `**ANALYSE SÉCURITÉ INTÉRIEURE**

**MENACE IDENTIFIÉE:**
4 réseaux majeurs criminalité organisée identifiés opérant frontières gabonaises (Cameroun, Guinée Équatoriale, Congo). Activités: trafic armes, drogues, êtres humains, contrebande bois précieux.

**MODUS OPERANDI:**
- Routes transfrontalières établies (8 corridors identifiés)
- Corruption agents contrôles frontaliers (23 compromis)
- Complicités douanes et gendarmerie (enquêtes en cours)
- Violence armée croissante (7 affrontements 6 mois)
- Blanchiment via commerce informel et casinos

**IMPACT SÉCURITÉ NATIONALE:**
- Affaiblissement autorité État zones frontalières
- Prolifération armes illégales (estimé: 2 500 armes)
- Trafic drogues (cannabis, cocaïne) vers capitales
- Traite êtres humains (prostitution, travail forcé)
- Déforestation illégale (pertes: 12 Mrd FCFA/an)`,
        impact: 'ÉLEVÉ - SÉCURITÉ INTÉRIEURE',
        montant: 'Pertes État: 18 000 M FCFA/an',
        statut: 'Opérations coordonnées',
        classification: 'CONFIDENTIEL DÉFENSE',
        dateDetection: '2024-06-18',
        secteur: 'Lutte criminalité organisée',
        niveauMenace: 'NIVEAU 2 - ÉLEVÉ',
        planAction: `**PHASE 1 - RÉPRESSION (EN COURS - 90 jours)**
Budget: 1 200 M FCFA | Délai: 20 avril 2025
• Opérations coup de poing (16 raids planifiés)
• Arrestations chefs réseaux (8 mandats internationaux)
• Saisies cargaisons illicites (contrôles surprises)
• Démantèlement cellules locales
• Protection témoins et infiltrés

**PHASE 2 - RENFORCEMENT CONTRÔLES (120 jours)**
Budget: 2 400 M FCFA | Délai: 20 juin 2025
• Déploiement 150 gendarmes zones frontalières
• Équipements modernes (véhicules 4x4, drones, radios)
• Postes contrôles fixes et mobiles (24/7)
• Caméras surveillance thermique
• Centrale renseignement criminel transfrontalier

**PHASE 3 - COOPÉRATION RÉGIONALE (180 jours)**
Budget: 680 M FCFA | Délai: Août 2025
• Accords bilatéraux sécuritaires (3 pays)
• Patrouilles conjointes transfrontalières
• Échanges renseignements temps réel
• Extraditions facilitées criminels
• Centre coordination régionale CEEAC

**PHASE 4 - PRÉVENTION (24 mois)**
Budget: 3 800 M FCFA | Délai: Février 2027
• Programmes socio-économiques zones frontalières
• Alternatives économiques légales (agriculture, élevage)
• Éducation sensibilisation communautés
• Lutte corruption (contrôles internes)
• Réinsertion repentis criminalité organisée`,
        kpis: [
          { indicateur: 'Réseaux démantelés', cible: '4/4 (100%)', actuel: '1/4 (25%)' },
          { indicateur: 'Saisies illicites (valeur)', cible: '+200%', actuel: '+45%' },
          { indicateur: 'Arrestations criminels majeurs', cible: '20', actuel: '7' },
          { indicateur: 'Pertes État réduites', cible: '-70%', actuel: '-18%' },
          { indicateur: 'Incidents violents frontaliers', cible: '-80%', actuel: '-25%' }
        ]
      }
    ],
    'Affaires Étrangères': [
      {
        id: 'MENACE-AE-001',
        titre: 'Atteinte réputation internationale - Corruption perçue',
        description: `**ANALYSE DIPLOMATIE ET IMAGE INTERNATIONALE**

**MENACE IDENTIFIÉE:**
Dégradation indices transparence et gouvernance internationaux. Perception corruption gabonaise affecte relations diplomatiques, investissements étrangers, et partenariats stratégiques.

**INDICATEURS PRÉOCCUPANTS:**
- Indice Perception Corruption (Transparency International): 128/180 (recul 8 places en 2 ans)
- Indice Facilité des Affaires (Banque Mondiale): 169/190
- Indice État de Droit (World Justice Project): 112/128
- Classement Liberté Presse: 115/180 (RSF)
- Rapports ONG: 12 rapports critiques publiés (2024)

**IMPACT DIPLOMATIQUE:**
- Relations UE: Conditionnalités accrues aides budgétaires (450 M€ suspendus)
- Relations USA: Scrutiny accru éligibilité programmes (MCC, AGOA)
- Investisseurs: Réticence majors pétrolières et minières
- Institutions financières: Notations risque-pays dégradées
- Coopération internationale: Questionnements sur bonne gouvernance`,
        impact: 'ÉLEVÉ - IMAGE INTERNATIONALE',
        montant: 'Pertes économiques estimées: 125 Mrd FCFA/an',
        statut: 'Stratégie communication',
        classification: 'CONFIDENTIEL DIPLOMATIQUE',
        dateDetection: '2024-03-10',
        secteur: 'Diplomatie et réputation',
        niveauMenace: 'NIVEAU 2 - ÉLEVÉ',
        planAction: `**PHASE 1 - COMMUNICATION CRISE (EN COURS - 60 jours)**
Budget: 420 M FCFA | Délai: 20 mars 2025
• Conférence presse internationale (Présidence)
• Annonces mesures anticorruption concrètes
• Invitations médias étrangers (fact-finding)
• Réfutation point par point allégations
• Ambassadeurs gabonais: Tournée capitales alliées

**PHASE 2 - RÉFORMES VISIBLES (120 jours)**
Budget: 2 100 M FCFA | Délai: 20 juin 2025
• Adhésion Initiative Transparence Industries Extractives (ITIE++)
• Création Commission Indépendante Anti-Corruption (mandat élargi)
• Publication déclarations patrimoines hauts fonctionnaires
• Digitalisation marchés publics (blockchain transparency)
• Protection lanceurs alerte (loi votée et appliquée)
• Open data: Budgets État et finances publiques

**PHASE 3 - OFFENSIVE DIPLOMATIQUE (180 jours)**
Budget: 1 800 M FCFA | Délai: Septembre 2025
• Invitation missions internationales (FMI, BM, UE)
• Partenariats publics exemplaires (showcase projects)
• Forums internationaux gouvernance (interventions présidentielles)
• Réseaux diplomatie économique réactivés
• Campagne médias: "Nouveau Gabon" (BBC, CNN, France 24)

**PHASE 4 - AMÉLIORATION CONTINUE (24 mois)**
Budget: 4 500 M FCFA | Délai: Janvier 2027
• Monitoring indices internationaux (cibles chiffrées)
• Audits externes récurrents (Big 4)
• Certifications ISO gouvernance publique
• Formation continue fonctionnaires (éthique)
• Partenariats académiques (Harvard Kennedy, Sciences Po)`,
        kpis: [
          { indicateur: 'Indice Transparency International', cible: 'Top 80 (+48 places)', actuel: '128' },
          { indicateur: 'Fonds internationaux débloqués', cible: '650 M€', actuel: '0 M€' },
          { indicateur: 'Investissements étrangers directs', cible: '+35%', actuel: '-8%' },
          { indicateur: 'Notations agences (Moody\'s, Fitch)', cible: '+2 niveaux', actuel: 'Stable' },
          { indicateur: 'Rapports médias positifs', cible: '60% (vs 15%)', actuel: '15%' }
        ]
      }
    ]
  };

  return menacesParService[service] || [];
}

