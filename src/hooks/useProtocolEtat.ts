import { useState, useEffect, useCallback } from 'react';
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
    
    // Données mockées garanties pour l'affichage
    setKpis({
      total_signalements: 320,
      signalements_critiques: 28,
      taux_resolution: 67,
      impact_economique: 7200000000, // 7.2 Mrd FCFA
      score_transparence: 78,
      tendance: '+12%'
    });
    
    setCasSensibles([
      {
        id: 'mock-sig-2025-014',
        reference_id: 'SIG-2025-014',
        titre: 'Coopérative fantôme Gab Pêche - Détournement subventions',
        type: 'denonciation_corruption',
        categorie: 'malversation_gab_peche',
        montant: '5,00 Mrd FCFA',
        location: 'Libreville, Estuaire',
        status: 'pending',
        urgence: 'Critique',
        priority: 'critique',
        ai_priority_score: 99,
        ai_analysis_summary: 'Réseau organisé de fraude massive. 15 coopératives fictives détectées. Montant total: 5 milliards FCFA. Implication haute fonction publique confirmée. Preuves documentaires solides.',
        created_at: '2025-01-10T16:23:41Z',
        metadata: {
          gravite: 'CRITIQUE',
          action_recommandee: 'Enquête immédiate - Saisie des biens - Gel des comptes bancaires'
        }
      },
      {
        id: 'mock-sig-2025-027',
        reference_id: 'SIG-2025-027',
        titre: 'Matériel de pêche Gab Pêche revendu en Guinée Équatoriale',
        type: 'denonciation_corruption',
        categorie: 'malversation_gab_peche',
        montant: '450 M FCFA',
        location: 'Libreville, Estuaire',
        status: 'pending',
        urgence: 'Haute',
        priority: 'critique',
        ai_priority_score: 83,
        ai_analysis_summary: 'Contrebande transfrontalière organisée. Matériel destiné aux pêcheurs gabonais détourné vers Guinée Équatoriale. 450M FCFA. Contrôles frontaliers recommandés.',
        created_at: '2025-01-06T09:23:51Z',
        metadata: {
          gravite: 'HAUTE',
          action_recommandee: 'Contrôles frontaliers renforcés - Investigation douanière'
        }
      },
      {
        id: 'mock-sig-2025-011',
        reference_id: 'SIG-2025-011',
        titre: 'Détournement budget santé - Achat ambulances fantômes',
        type: 'denonciation_corruption',
        categorie: 'detournement_fonds',
        montant: '1,20 Mrd FCFA',
        location: 'Franceville, Haut-Ogooué',
        status: 'pending',
        urgence: 'Critique',
        priority: 'critique',
        ai_priority_score: 98,
        ai_analysis_summary: 'Détournement avéré de fonds publics. Société écran internationale. Menaces sur lanceur d\'alerte. Preuves documentaires disponibles. Protection urgente requise.',
        created_at: '2025-01-11T18:32:14Z',
        metadata: {
          gravite: 'CRITIQUE',
          action_recommandee: 'Protection du lanceur d\'alerte - Enquête judiciaire - Audit externe'
        }
      },
      {
        id: 'mock-sig-2025-022',
        reference_id: 'SIG-2025-022',
        titre: 'Directeur CNSS - Villa 12 chambres et fleet de luxe',
        type: 'denonciation_corruption',
        categorie: 'enrichissement_illicite',
        montant: '6,70 Mrd FCFA',
        location: 'Libreville, Estuaire',
        status: 'pending',
        urgence: 'Critique',
        priority: 'critique',
        ai_priority_score: 92,
        ai_analysis_summary: 'Enrichissement illicite flagrant. Train de vie incompatible avec revenus déclarés. 6,7 milliards FCFA estimés. Audit patrimonial urgent.',
        created_at: '2025-01-07T21:45:19Z',
        metadata: {
          gravite: 'CRITIQUE',
          action_recommandee: 'Audit patrimonial - Enquête DGLIC - Gel des avoirs'
        }
      }
    ]);
    
    setDistributionRegionale([
      { region: 'Estuaire', cas: 128, resolus: 82, taux: 64, priorite: 'Haute' },
      { region: 'Haut-Ogooué', cas: 87, resolus: 53, taux: 61, priorite: 'Moyenne' },
      { region: 'Ogooué-Maritime', cas: 56, resolus: 38, taux: 68, priorite: 'Haute' },
      { region: 'Moyen-Ogooué', cas: 42, resolus: 28, taux: 67, priorite: 'Moyenne' },
      { region: 'Woleu-Ntem', cas: 35, resolus: 22, taux: 63, priorite: 'Moyenne' }
    ]);
    
    setSousAdmins([
      { 
        id: '1', 
        user_id: '24177888002', 
        nom: 'Sous-Admin DGSS', 
        secteur: 'DGSS (Direction Générale de la Sécurité d\'État)', 
        cas_traites: 45, 
        taux_succes: 78, 
        delai_moyen_jours: 8, 
        statut: 'Actif',
        email: '24177888002@ndjobi.com',
        phone: '+24177888002',
        role: 'sub_admin',
        organization: 'DGSS',
        type_service: 'securite_nationale',
        classification: 'CONFIDENTIEL DÉFENSE',
        privileges: ['Vue sectorielle sécurité d\'État', 'Assignation d\'agents terrain', 'Statistiques sectorielles DGSS', 'Rapports ministériels', 'Coordination enquêtes sécuritaires']
      },
      { 
        id: '2', 
        user_id: '24177888003', 
        nom: 'Sous-Admin DGR', 
        secteur: 'DGR (Direction Générale du Renseignement)', 
        cas_traites: 38, 
        taux_succes: 72, 
        delai_moyen_jours: 9, 
        statut: 'Actif',
        email: '24177888003@ndjobi.com',
        phone: '+24177888003',
        role: 'sub_admin',
        organization: 'DGR',
        type_service: 'securite_nationale',
        classification: 'SECRET DÉFENSE',
        privileges: ['Vue sectorielle renseignement', 'Assignation agents spécialisés', 'Enquêtes sensibles et confidentielles', 'Intelligence anticorruption', 'Rapports de renseignement']
      },
      { 
        id: '3', 
        user_id: '24177888011', 
        nom: 'Sous-Admin Défense', 
        secteur: 'Ministère de la Défense Nationale', 
        cas_traites: 52, 
        taux_succes: 85, 
        delai_moyen_jours: 7, 
        statut: 'Actif',
        email: '24177888011@ndjobi.com',
        phone: '+24177888011',
        role: 'sub_admin',
        organization: 'Défense Nationale',
        type_service: 'securite_nationale',
        classification: 'SECRET DÉFENSE',
        privileges: ['Sécurité militaire', 'Contre-espionnage', 'Protection installations stratégiques', 'Coordination forces armées', 'Renseignement militaire']
      },
      { 
        id: '4', 
        user_id: '24177888012', 
        nom: 'Sous-Admin Intérieur', 
        secteur: 'Ministère de l\'Intérieur', 
        cas_traites: 67, 
        taux_succes: 81, 
        delai_moyen_jours: 6, 
        statut: 'Actif',
        email: '24177888012@ndjobi.com',
        phone: '+24177888012',
        role: 'sub_admin',
        organization: 'Intérieur',
        type_service: 'securite_nationale',
        classification: 'CONFIDENTIEL DÉFENSE',
        privileges: ['Sécurité intérieure', 'Gendarmerie nationale', 'Police nationale', 'Lutte anti-terrorisme', 'Contrôle frontières']
      },
      { 
        id: '5', 
        user_id: '24177888013', 
        nom: 'Sous-Admin Affaires Étrangères', 
        secteur: 'Ministère des Affaires Étrangères', 
        cas_traites: 41, 
        taux_succes: 76, 
        delai_moyen_jours: 10, 
        statut: 'Actif',
        email: '24177888013@ndjobi.com',
        phone: '+24177888013',
        role: 'sub_admin',
        organization: 'Affaires Étrangères',
        type_service: 'securite_nationale',
        classification: 'CONFIDENTIEL DIPLOMATIQUE',
        privileges: ['Renseignement diplomatique', 'Sécurité ambassades', 'Veille internationale', 'Protection ressortissants', 'Relations bilatérales sécuritaires']
      },
      { 
        id: '3', 
        user_id: '24177888004', 
        nom: 'Agent Défense', 
        secteur: 'Ministère de la Défense Nationale', 
        cas_traites: 42, 
        taux_succes: 68, 
        delai_moyen_jours: 10, 
        statut: 'Actif',
        email: '24177888004@ndjobi.com',
        phone: '+24177888004',
        role: 'agent',
        organization: 'Ministère Défense',
        privileges: ['Traitement signalements défense', 'Enquêtes militaires', 'Surveillance installations', 'Rapports sécuritaires']
      },
      { 
        id: '4', 
        user_id: '24177888005', 
        nom: 'Agent Justice', 
        secteur: 'Ministère de la Justice', 
        cas_traites: 48, 
        taux_succes: 75, 
        delai_moyen_jours: 7, 
        statut: 'Actif',
        email: '24177888005@ndjobi.com',
        phone: '+24177888005',
        role: 'agent',
        organization: 'Ministère Justice',
        privileges: ['Traitement signalements judiciaires', 'Enquêtes pénales', 'Surveillance juridique', 'Rapports judiciaires']
      },
      { 
        id: '5', 
        user_id: '24177888006', 
        nom: 'Agent Anti-Corruption', 
        secteur: 'Agence Nationale de Lutte contre la Corruption', 
        cas_traites: 55, 
        taux_succes: 82, 
        delai_moyen_jours: 6, 
        statut: 'Actif',
        email: '24177888006@ndjobi.com',
        phone: '+24177888006',
        role: 'agent',
        organization: 'Anti-Corruption',
        privileges: ['Traitement signalements corruption', 'Enquêtes anticorruption', 'Surveillance patrimoniale', 'Rapports anticorruption']
      },
      { 
        id: '6', 
        user_id: '24177888007', 
        nom: 'Agent Intérieur', 
        secteur: 'Ministère de l\'Intérieur', 
        cas_traites: 39, 
        taux_succes: 70, 
        delai_moyen_jours: 9, 
        statut: 'Actif',
        email: '24177888007@ndjobi.com',
        phone: '+24177888007',
        role: 'agent',
        organization: 'Ministère Intérieur',
        privileges: ['Traitement signalements intérieur', 'Enquêtes administratives', 'Surveillance territoriale', 'Rapports administratifs']
      },
      { 
        id: '7', 
        user_id: '24177888010', 
        nom: 'Agent Pêche', 
        secteur: 'Ministère de la Mer de la Pêche et de l\'Économie Bleue', 
        cas_traites: 52, 
        taux_succes: 65, 
        delai_moyen_jours: 11, 
        statut: 'Actif',
        email: '24177888010@ndjobi.com',
        phone: '+24177888010',
        role: 'agent',
        organization: 'Ministère Pêche',
        privileges: ['Traitement des signalements liés à la pêche', 'Enquêtes sur les infractions maritimes', 'Surveillance des activités de pêche', 'Rapports sectoriels pêche']
      },
      { 
        id: '8', 
        user_id: '24177888008', 
        nom: 'Citoyen Démo', 
        secteur: 'Citoyen Gabonais', 
        cas_traites: 12, 
        taux_succes: 85, 
        delai_moyen_jours: 5, 
        statut: 'Actif',
        email: '24177888008@ndjobi.com',
        phone: '+24177888008',
        role: 'user',
        organization: 'Citoyen Gabonais',
        privileges: ['Création signalements', 'Suivi de ses signalements', 'Protection projets', 'Consultation statuts', 'Chat IASTED']
      },
      { 
        id: '9', 
        user_id: '24177888009', 
        nom: 'Citoyen Anonyme', 
        secteur: 'Citoyen Gabonais', 
        cas_traites: 8, 
        taux_succes: 90, 
        delai_moyen_jours: 4, 
        statut: 'Actif',
        email: '24177888009@ndjobi.com',
        phone: '+24177888009',
        role: 'user',
        organization: 'Citoyen Gabonais',
        privileges: ['Création signalements anonymes', 'Suivi de ses signalements', 'Protection projets', 'Consultation statuts', 'Chat IASTED']
      }
    ]);
    
    setPerformanceMinisteres([
      { ministere: 'Mer et Pêche', cas_traites: 38, taux_resolution: 45, delai_moyen: 12, statut: 'Attention' },
      { ministere: 'Santé', cas_traites: 41, taux_resolution: 62, delai_moyen: 10, statut: 'Actif' },
      { ministere: 'Justice', cas_traites: 45, taux_resolution: 78, delai_moyen: 8, statut: 'Actif' },
      { ministere: 'Affaires Sociales', cas_traites: 35, taux_resolution: 58, delai_moyen: 11, statut: 'Actif' },
      { ministere: 'Éducation', cas_traites: 28, taux_resolution: 72, delai_moyen: 9, statut: 'Actif' }
    ]);
    
    setEvolutionMensuelle([
      { mois: 'Jan 2024', signalements: 45, resolus: 28, taux: 62 },
      { mois: 'Fév 2024', signalements: 52, resolus: 35, taux: 67 },
      { mois: 'Mar 2024', signalements: 48, resolus: 32, taux: 67 },
      { mois: 'Avr 2024', signalements: 61, resolus: 41, taux: 67 },
      { mois: 'Mai 2024', signalements: 55, resolus: 38, taux: 69 },
      { mois: 'Juin 2024', signalements: 67, resolus: 45, taux: 67 },
      { mois: 'Juil 2024', signalements: 58, resolus: 39, taux: 67 },
      { mois: 'Août 2024', signalements: 72, resolus: 48, taux: 67 },
      { mois: 'Sep 2024', signalements: 65, resolus: 44, taux: 68 },
      { mois: 'Oct 2024', signalements: 78, resolus: 52, taux: 67 },
      { mois: 'Nov 2024', signalements: 82, resolus: 55, taux: 67 },
      { mois: 'Déc 2024', signalements: 89, resolus: 60, taux: 67 }
    ]);
    
    setVisionData([
      { pilier: 'Gouvernance', score: 78, objectif: 85, statut: 'En cours' },
      { pilier: 'Économie', score: 72, objectif: 80, statut: 'En cours' },
      { pilier: 'Social', score: 68, objectif: 75, statut: 'En cours' },
      { pilier: 'Environnement', score: 82, objectif: 85, statut: 'En cours' },
      { pilier: 'Innovation', score: 65, objectif: 70, statut: 'En cours' }
    ]);
    
    setIsLoading(false);
  }, []);

  const loadAllData = useCallback(async () => {
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
        // Utiliser les comptes réels au lieu des données de performance
        setSousAdmins([
          { 
            id: '1', 
            user_id: '24177888002', 
            nom: 'Sous-Admin DGSS', 
            secteur: 'DGSS (Direction Générale de la Sécurité d\'État)', 
            cas_traites: 45, 
            taux_succes: 78, 
            delai_moyen_jours: 8, 
            statut: 'Actif',
            email: '24177888002@ndjobi.com',
            phone: '+24177888002',
            role: 'sub_admin',
            organization: 'DGSS',
            privileges: ['Vue sectorielle sécurité d\'État', 'Assignation d\'agents terrain', 'Statistiques sectorielles DGSS', 'Rapports ministériels', 'Coordination enquêtes sécuritaires']
          },
          { 
            id: '2', 
            user_id: '24177888003', 
            nom: 'Sous-Admin DGR', 
            secteur: 'DGR (Direction Générale du Renseignement)', 
            cas_traites: 38, 
            taux_succes: 72, 
            delai_moyen_jours: 9, 
            statut: 'Actif',
            email: '24177888003@ndjobi.com',
            phone: '+24177888003',
            role: 'sub_admin',
            organization: 'DGR',
            privileges: ['Vue sectorielle renseignement', 'Assignation agents spécialisés', 'Enquêtes sensibles et confidentielles', 'Intelligence anticorruption', 'Rapports de renseignement']
          },
          { 
            id: '3', 
            user_id: '24177888004', 
            nom: 'Agent Défense', 
            secteur: 'Ministère de la Défense Nationale', 
            cas_traites: 42, 
            taux_succes: 68, 
            delai_moyen_jours: 10, 
            statut: 'Actif',
            email: '24177888004@ndjobi.com',
            phone: '+24177888004',
            role: 'agent',
            organization: 'Ministère Défense',
            privileges: ['Traitement signalements défense', 'Enquêtes militaires', 'Surveillance installations', 'Rapports sécuritaires']
          },
          { 
            id: '4', 
            user_id: '24177888005', 
            nom: 'Agent Justice', 
            secteur: 'Ministère de la Justice', 
            cas_traites: 48, 
            taux_succes: 75, 
            delai_moyen_jours: 7, 
            statut: 'Actif',
            email: '24177888005@ndjobi.com',
            phone: '+24177888005',
            role: 'agent',
            organization: 'Ministère Justice',
            privileges: ['Traitement signalements judiciaires', 'Enquêtes pénales', 'Surveillance juridique', 'Rapports judiciaires']
          },
          { 
            id: '5', 
            user_id: '24177888006', 
            nom: 'Agent Anti-Corruption', 
            secteur: 'Agence Nationale de Lutte contre la Corruption', 
            cas_traites: 55, 
            taux_succes: 82, 
            delai_moyen_jours: 6, 
            statut: 'Actif',
            email: '24177888006@ndjobi.com',
            phone: '+24177888006',
            role: 'agent',
            organization: 'Anti-Corruption',
            privileges: ['Traitement signalements corruption', 'Enquêtes anticorruption', 'Surveillance patrimoniale', 'Rapports anticorruption']
          },
          { 
            id: '6', 
            user_id: '24177888007', 
            nom: 'Agent Intérieur', 
            secteur: 'Ministère de l\'Intérieur', 
            cas_traites: 39, 
            taux_succes: 70, 
            delai_moyen_jours: 9, 
            statut: 'Actif',
            email: '24177888007@ndjobi.com',
            phone: '+24177888007',
            role: 'agent',
            organization: 'Ministère Intérieur',
            privileges: ['Traitement signalements intérieur', 'Enquêtes administratives', 'Surveillance territoriale', 'Rapports administratifs']
          },
          { 
            id: '7', 
            user_id: '24177888010', 
            nom: 'Agent Pêche', 
            secteur: 'Ministère de la Mer de la Pêche et de l\'Économie Bleue', 
            cas_traites: 52, 
            taux_succes: 65, 
            delai_moyen_jours: 11, 
            statut: 'Actif',
            email: '24177888010@ndjobi.com',
            phone: '+24177888010',
            role: 'agent',
            organization: 'Ministère Pêche',
            privileges: ['Traitement des signalements liés à la pêche', 'Enquêtes sur les infractions maritimes', 'Surveillance des activités de pêche', 'Rapports sectoriels pêche']
          },
          { 
            id: '8', 
            user_id: '24177888008', 
            nom: 'Citoyen Démo', 
            secteur: 'Citoyen Gabonais', 
            cas_traites: 12, 
            taux_succes: 85, 
            delai_moyen_jours: 5, 
            statut: 'Actif',
            email: '24177888008@ndjobi.com',
            phone: '+24177888008',
            role: 'user',
            organization: 'Citoyen Gabonais',
            privileges: ['Création signalements', 'Suivi de ses signalements', 'Protection projets', 'Consultation statuts', 'Chat IASTED']
          },
          { 
            id: '9', 
            user_id: '24177888009', 
            nom: 'Citoyen Anonyme', 
            secteur: 'Citoyen Gabonais', 
            cas_traites: 8, 
            taux_succes: 90, 
            delai_moyen_jours: 4, 
            statut: 'Actif',
            email: '24177888009@ndjobi.com',
            phone: '+24177888009',
            role: 'user',
            organization: 'Citoyen Gabonais',
            privileges: ['Création signalements anonymes', 'Suivi de ses signalements', 'Protection projets', 'Consultation statuts', 'Chat IASTED']
          }
        ]);
      }
      if (!directives.error && directives.data) setDirectivesActives(directives.data);
      
      // Créer données mockées pour l'ancien dashboard
      setPerformanceMinisteres([
        { ministere: 'Mer et Pêche', signalements: 38, critiques: 18, taux: 45, responsable: 'Sous-Admin Mer' },
        { ministere: 'Justice', signalements: 45, critiques: 12, taux: 78, responsable: 'Sous-Admin Justice' },
        { ministere: 'Santé', signalements: 41, critiques: 16, taux: 62, responsable: 'Sous-Admin Santé' },
        { ministere: 'Affaires Sociales', signalements: 35, critiques: 14, taux: 58, responsable: 'Sous-Admin Social' },
        { ministere: 'Intérieur', signalements: 28, critiques: 15, taux: 65, responsable: 'Sous-Admin Intérieur' },
        { ministere: 'Anti-Corruption', signalements: 52, critiques: 25, taux: 72, responsable: 'Sous-Admin Anti-Corruption' },
      ]);
      
      setEvolutionMensuelle([
        { mois: 'Jan', signalements: 187, resolutions: 142, budget: 125 },
        { mois: 'Fév', signalements: 203, resolutions: 158, budget: 210 },
        { mois: 'Mar', signalements: 195, resolutions: 151, budget: 185 },
        { mois: 'Avr', signalements: 218, resolutions: 172, budget: 290 },
        { mois: 'Mai', signalements: 234, resolutions: 185, budget: 340 },
        { mois: 'Juin', signalements: 251, resolutions: 198, budget: 425 }
      ]);
      
      setVisionData([
        { pilier: 'Gabon Vert', score: 72, objectif: 100, budget: '850 M FCFA', priorite: 'Haute' },
        { pilier: 'Gabon Industriel', score: 65, objectif: 100, budget: '1,2 Mrd FCFA', priorite: 'Haute' },
        { pilier: 'Gabon Services', score: 80, objectif: 100, budget: '920 M FCFA', priorite: 'Moyenne' },
        { pilier: 'Gouvernance & Transparence', score: 78, objectif: 100, budget: '650 M FCFA', priorite: 'Critique' }
      ]);

    } catch (error) {
      console.error('Erreur chargement données Protocole d\'État:', error);
      toast.error('Impossible de charger les données du dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enregistrer une décision présidentielle
  const enregistrerDecision = useCallback(async (
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
  }, [loadAllData]);

  // Générer un rapport
  const genererRapport = useCallback(async (type: 'executif' | 'hebdomadaire' | 'mensuel' | 'annuel') => {
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
  }, []);

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
