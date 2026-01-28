/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Crown, BarChart3, CheckCircle, Users, Package,
  FileText, TrendingUp, Shield, AlertTriangle, Eye, Filter,
  Download, MapPin, Calendar, Activity, Zap, Brain, Scale,
  Building2, Flag, Target, DollarSign, Clock, ChevronRight,
  AlertCircle, XCircle, RefreshCw, Search, UserPlus, Menu,
  Mail, Phone, X, Check, CheckSquare, Presentation, Sparkles,
  Mic,
  FileSpreadsheet,
  Settings,
  Bell,
  MessageCircle,
  User,
  LogOut,
  Radio
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useProtocolEtat } from '@/hooks/useProtocolEtat';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { ModuleXR7 } from '@/components/admin/ModuleXR7';
import { IAstedChat } from '@/components/admin/IAstedChat';
import { IAstedFloatingButton } from '@/components/admin/IAstedFloatingButton';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell } from 'recharts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import emblemGabon from '@/assets/emblem_gabon.png';
import { IAstedVoiceButton } from '@/components/iasted';
import { useIsMobile } from '@/hooks/use-mobile';

const VueEnsemble = lazy(() => import('./President/components/VueEnsemble'));
const OpinionPublique = lazy(() => import('./President/components/OpinionPublique'));
const SituationsCritiques = lazy(() => import('./President/components/SituationsCritiques'));
const VisionNationale = lazy(() => import('./President/components/VisionNationale'));

// Icône utilitaire compacte pour la barre mobile droite
const NavIcon = ({ href, active, label, icon, showLabel = false }: { href: string; active: boolean; label: string; icon: 'grid' | 'users' | 'crown' | 'user' | 'shield' | 'map' | 'file' | 'radio' | 'brain'; showLabel?: boolean }) => {
  const Icon =
    icon === 'grid' ? BarChart3 :
      icon === 'users' ? Users :
        icon === 'crown' ? Crown :
          icon === 'user' ? User :
            icon === 'shield' ? Shield :
              icon === 'map' ? MapPin :
                icon === 'file' ? FileText :
                  icon === 'radio' ? Radio :
                    Brain;
  return (
    <button
      aria-label={label}
      className={`rounded-full flex items-center justify-center transition-all duration-200 ${active
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'hover:bg-muted/70 hover:scale-105'
        } ${showLabel
          ? 'h-10 w-full px-3 gap-2'
          : 'h-10 w-10 mx-auto'
        }`}
      onClick={() => {
        window.location.assign(href);
      }}
      title={label}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {showLabel && <span className="text-xs font-medium whitespace-nowrap truncate">{label}</span>}
    </button>
  );
};

type AdminData = Record<string, any> & {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  phone: string;
  organization: string;
  role: string;
};

type CaseData = Record<string, any> & {
  id: string;
  titre?: string;
  statut?: string;
  urgence?: string;
  description?: string;
  montant?: number | string;
  region?: string;
};

type HistoryItem = Record<string, any> & {
  id: string | number;
  action?: string;
  date?: string;
  description?: string;
  timestamp?: string;
  montant?: string;
};

type Problematique = Record<string, any> & {
  id: string;
  titre?: string;
  description?: string;
  categorie?: string;
  montantEstime?: string | number;
  montant?: string | number;
  region?: string;
  date?: string;
};

type Grief = Record<string, any> & {
  id: string;
  titre?: string;
  description?: string;
  categorie?: string;
  intensite?: number | string;
  occurrences?: number;
};

type OpinionPubliqueData = Record<string, any> & {
  principauxGriefs: Grief[];
  risqueSocial?: string;
  tendanceOpinion?: string;
  satisfactionGlobale?: number | number[];
  sentimentDominant?: string;
  noteOpinion?: number;
  tauxSatisfaction?: number[] | number;
  zonesRisque?: string[];
};

type Recommandation = Record<string, any> & {
  id: string;
  titre?: string;
  description?: string;
  priorite?: string;
  delaiPropose?: string;
  impact?: string;
  ressourcesNecessaires?: string[];
};

export default function AdminDashboard() {
  const { user, role, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // ============================================================================
  // DASHBOARD HYBRIDE UNIFIÉ v2.1
  // ============================================================================
  // Le compte Président (24177888001@ndjobi.com) accède à un dashboard HYBRIDE
  // combinant vue stratégique (4 onglets) ET gestion opérationnelle (7 onglets)
  // dans UNE SEULE interface à onglets.
  //
  // Détection :
  const isPresident = user?.email === '24177888001@ndjobi.com' ||
    user?.phone === '+24177888001';
  //
  // Si isPresident = true  → Affiche interface hybride avec 11 onglets
  // Si isPresident = false → Affiche interface admin standard avec sidebar
  // ============================================================================

  // États pour la recherche et filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');

  // États pour les modals et actions
  const [isNommerModalOpen, setIsNommerModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRapportModalOpen, setIsRapportModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminData | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [adminHistory, setAdminHistory] = useState<HistoryItem[]>([]);

  // État du menu mobile (3 niveaux)
  const [mobileMenuState, setMobileMenuState] = useState<'collapsed' | 'icons' | 'expanded'>('icons');
  const [adminCases, setAdminCases] = useState<CaseData[]>([]);
  const [adminProblematiques, setAdminProblematiques] = useState<Problematique[]>([]);
  const [adminOpinionPublique, setAdminOpinionPublique] = useState<OpinionPubliqueData | null>(null);
  const [adminRecommandations, setAdminRecommandations] = useState<Recommandation[]>([]);
  const [rapportType, setRapportType] = useState<'cas' | 'global'>('global');
  const [selectedCas, setSelectedCas] = useState<CaseData | null>(null);
  const [selectedCasIds, setSelectedCasIds] = useState<string[]>([]);
  const [periodeSuivi, setPeriodeSuivi] = useState<'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel'>('mensuel');
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [formatRapport, setFormatRapport] = useState<'gamma-pdf' | 'gamma-pptx'>('gamma-pdf');

  // État de navigation pour la vue Président
  const [presidentTab, setPresidentTab] = useState<string>('vue-ensemble');

  // États pour la configuration Gamma AI
  const [gammaConfig, setGammaConfig] = useState({
    modeCreation: 'ia' as 'ia' | 'texte',
    typeDocument: 'presentation' as 'texte' | 'presentation',
    formatPage: 'defaut' as 'defaut' | 'lettre' | 'a4',
    modeGeneration: 'generer' as 'generer' | 'synthese' | 'conserver',
    niveauDetail: 'detaille' as 'minimaliste' | 'concis' | 'detaille',
    langue: 'francais' as 'francais' | 'anglais',
    sourceImages: 'ia' as 'ia' | 'aucune',
    styleImages: 'realiste' as 'realiste' | 'illustration',
    nombreCartes: 7
  });

  // États pour le formulaire de nomination
  const [nomForm, setNomForm] = useState({
    nom: '',
    email: '',
    phone: '',
    role: 'agent' as 'sub_admin' | 'agent',
    organization: '',
    secteur: ''
  });
  const {
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
    reloadData
  } = useProtocolEtat();

  // Déterminer la vue active depuis les paramètres URL
  const activeView = searchParams.get('view') || 'dashboard';
  const [timeRange, setTimeRange] = useState<string>('30days');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const {
    notifications: realtimeNotifications,
    isSubscribed,
    subscribe: subscribeNotifications,
    unsubscribe: unsubscribeNotifications
  } = useRealtimeNotifications();

  const COLORS = ['#2D5F1E', '#4A8B3A', '#6BB757', '#8FD977', '#B4F199'];

  useEffect(() => {
    if (user && role === 'admin') {
      reloadData();
      subscribeNotifications();
    }

    return () => {
      unsubscribeNotifications();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  const handleValiderCas = async (casId: string, decision: 'approuver' | 'rejeter' | 'enquete') => {
    const result = await enregistrerDecision(casId, decision);
    if (result.success) {
      toast({
        title: '✅ Décision enregistrée',
        description: `La décision présidentielle "${decision}" a été enregistrée avec succès.`,
      });
    }
  };

  const handleGenererRapport = async (type: 'executif' | 'hebdomadaire' | 'mensuel' | 'annuel') => {
    await genererRapport(type);
  };

  // Logique de filtrage et recherche
  const filteredSousAdmins = sousAdmins.filter(admin => {
    const matchesSearch = searchQuery === '' ||
      admin.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.secteur.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone.includes(searchQuery) ||
      admin.organization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'all' || admin.role === selectedRole;
    const matchesOrganization = selectedOrganization === 'all' || admin.organization === selectedOrganization;

    return matchesSearch && matchesRole && matchesOrganization;
  });

  // Filtrage spécifique pour chaque vue
  const filteredAgents = filteredSousAdmins.filter(admin => admin.role === 'agent');
  const filteredSubAdmins = filteredSousAdmins.filter(admin => admin.role === 'sub_admin');
  const filteredCitoyens = filteredSousAdmins.filter(admin => admin.role === 'user');

  // Obtenir les organisations uniques
  const uniqueOrganizations = Array.from(new Set(sousAdmins.map(admin => admin.organization))).filter(Boolean);

  // Fonction pour nommer un nouveau sous-admin/agent
  const handleNommerSousAdmin = async () => {
    if (!nomForm.nom || !nomForm.email || !nomForm.phone || !nomForm.organization) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingAction(true);
    try {
      // Simulation de création (à remplacer par appel API Supabase)
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Nomination réussie",
        description: `${nomForm.nom} a été nommé${nomForm.role === 'sub_admin' ? ' Sous-Admin' : ' Agent'} avec succès.`,
      });

      // Réinitialiser le formulaire
      setNomForm({
        nom: '',
        email: '',
        phone: '',
        role: 'agent',
        organization: '',
        secteur: ''
      });
      setIsNommerModalOpen(false);

      // Recharger les données
      reloadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le compte. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Fonction pour voir les détails d'un admin
  const handleVoirDetails = async (admin: AdminData) => {
    console.log('🔍 [handleVoirDetails] Ouverture détails pour:', admin.nom, admin);
    setSelectedAdmin(admin);
    setIsLoadingAction(true);
    setIsDetailsModalOpen(true); // Ouvrir immédiatement le modal

    try {
      // Charger l'historique et les cas spécifiques à l'admin
      if (admin.nom === 'Agent Pêche') {
        // Données spécifiques pour l'Agent Pêche liées au cas Pêche-Gab
        setAdminHistory([
          {
            id: 1,
            date: '2025-01-15',
            action: 'Signalement reçu',
            description: 'Nouveau signalement Pêche-Gab - Coopératives fantômes',
            status: 'En cours',
            montant: '5 000 000 000 FCFA'
          },
          {
            id: 2,
            date: '2025-01-14',
            action: 'Enquête lancée',
            description: 'Investigation sur les activités de pêche illégales',
            status: 'Résolu',
            montant: '2 500 000 000 FCFA'
          },
          {
            id: 3,
            date: '2025-01-12',
            action: 'Surveillance renforcée',
            description: 'Contrôle des navires de pêche dans la zone économique',
            status: 'En cours',
            montant: '1 200 000 000 FCFA'
          },
          {
            id: 4,
            date: '2025-01-10',
            action: 'Rapport mensuel',
            description: 'Bilan des activités de surveillance maritime',
            status: 'Terminé',
            montant: '0 FCFA'
          }
        ]);

        setAdminCases([
          {
            id: 'SIG-2025-014',
            titre: 'Coopératives fantômes - Pêche-Gab',
            description: 'Détection de 12 coopératives de pêche fictives',
            montant: '5 000 000 000 FCFA',
            statut: 'En cours',
            priorite: 'Critique',
            dateCreation: '2025-01-15',
            secteur: 'Pêche maritime',
            localisation: 'Port-Gentil, Ogooué-Maritime'
          },
          {
            id: 'SIG-2025-008',
            titre: 'Pêche illégale - Zone économique',
            description: 'Activités de pêche non autorisées détectées',
            montant: '2 500 000 000 FCFA',
            statut: 'Résolu',
            priorite: 'Haute',
            dateCreation: '2025-01-14',
            secteur: 'Surveillance maritime',
            localisation: 'Cap Lopez, Ogooué-Maritime'
          },
          {
            id: 'SIG-2025-005',
            titre: 'Contrôle navires étrangers',
            description: 'Vérification des licences de pêche internationales',
            montant: '1 200 000 000 FCFA',
            statut: 'En cours',
            priorite: 'Moyenne',
            dateCreation: '2025-01-12',
            secteur: 'Contrôle maritime',
            localisation: 'Mayumba, Nyanga'
          }
        ]);

        // Problématiques spécifiques à l'Agent Pêche
        setAdminProblematiques([
          {
            id: 'PROB-001',
            titre: 'Détournement de fonds coopératives',
            description: 'Suite à une enquête approfondie menée par la Direction Générale des Ressources Halieutiques et de l\'Aquaculture (DGRHA) en collaboration avec la Cour des Comptes, 12 coopératives de pêche fictives ont été formellement identifiées dans les régions de l\'Ogooué-Maritime et de la Nyanga. Ces entités frauduleuses, enregistrées officiellement entre 2022 et 2024, ont bénéficié indûment de subventions publiques et de prêts bonifiés destinés au développement du secteur halieutique. L\'analyse des flux financiers révèle un détournement total estimé à 5 milliards de FCFA. Le mode opératoire identifié implique la création de structures juridiques avec des documents falsifiés, l\'utilisation de prête-noms issus de communautés de pêcheurs réelles pour crédibiliser les dossiers, et la complicité présumée de certains agents administratifs qui ont validé les demandes de financement sans vérification terrain. Les fonds détournés devaient initialement servir à l\'acquisition d\'équipements de pêche moderne, à la construction d\'infrastructures portuaires communautaires, et au financement de programmes de formation pour 450 pêcheurs. L\'impact sur les véritables coopératives légitimes est considérable : retards dans l\'attribution des subventions, perte de confiance des pêcheurs envers les institutions, et fragilisation de l\'économie bleue nationale. Cette fraude systématique met en péril la stratégie gouvernementale de développement du secteur maritime et compromet les objectifs de souveraineté alimentaire fixés dans le Plan National de Développement 2025-2030.',
            impact: 'Critique',
            montant: '5 000 000 000 FCFA',
            statut: 'En cours d\'analyse',
            classification: 'Pas urgent',
            dateCreation: '2025-01-15',
            dateDetection: '2025-01-15',
            secteur: 'Pêche maritime',
            localisation: 'Port-Gentil, Ogooué-Maritime',
            tendance: 'En aggravation - Risque de réplication',
            actionsRecommandees: 'PHASE 1 - URGENCE IMMÉDIATE (0-15 jours) : Gel immédiat de tous les comptes bancaires associés aux 12 coopératives identifiées. Suspension provisoire de toutes les nouvelles demandes de subvention dans les zones concernées. Constitution d\'une cellule de crise interministérielle (Pêche, Justice, Finances, Intérieur) sous coordination présidentielle. Convocation et audition des responsables présumés et des agents administratifs impliqués. Sécurisation de l\'ensemble des pièces comptables et documents juridiques. PHASE 2 - ENQUÊTE APPROFONDIE (15-45 jours) : Audit forensique complet des 156 coopératives enregistrées depuis 2020. Vérification terrain systématique avec géolocalisation des installations. Analyse des circuits financiers et identification des bénéficiaires finaux. Évaluation du préjudice subi par les coopératives légitimes. Constitution des dossiers judiciaires pour poursuites pénales. PHASE 3 - RÉCUPÉRATION ET SANCTION (45-90 jours) : Procédures de recouvrement des fonds détournés via saisies conservatoires. Poursuites judiciaires contre tous les auteurs et complices identifiés. Sanctions administratives contre les agents défaillants. Réaffectation des fonds récupérés aux coopératives légitimes lésées. Publication d\'un rapport d\'étape public pour restaurer la confiance. PHASE 4 - RÉFORME STRUCTURELLE (90-180 jours) : Refonte complète du système d\'agrément avec procédure de validation renforcée. Mise en place d\'une plateforme numérique de traçabilité des subventions. Création d\'un registre national biométrique des coopérateurs. Formation spécialisée des agents instructeurs. Instauration de contrôles surprises trimestriels.',
            derniereMAJ: 'Aujourd\'hui - 19h00'
          },
          {
            id: 'PROB-002',
            titre: 'Surveillance maritime insuffisante',
            description: 'L\'analyse des données satellitaires et des rapports de patrouilles maritimes sur les 18 derniers mois révèle des lacunes critiques dans le dispositif de surveillance de la Zone Économique Exclusive (ZEE) gabonaise, s\'étendant sur 213 000 km². Les moyens actuels (3 patrouilleurs opérationnels sur 7 programmés, 2 avions de surveillance avec disponibilité à 40%, système radar côtier obsolète) ne permettent qu\'une couverture de 35% de la zone, laissant 65% du territoire maritime sans surveillance effective. Cette défaillance favorise la pêche illicite, non déclarée et non réglementée (INN) estimée à 2,5 milliards FCFA de pertes annuelles en ressources halieutiques. Des navires-usines étrangers opèrent impunément dans les zones nord et sud, avec des pratiques de pêche dévastatrices (chalutage profond, capture d\'espèces protégées, rejet massif de prises accessoires). Les équipages sont sous-dimensionnés (120 agents pour couvrir 956 km de côtes), mal équipés (absence de moyens de communication sécurisés, GPS défectueux) et insuffisamment formés aux techniques modernes de surveillance maritime. Le manque de coordination entre la Marine nationale, la Gendarmerie maritime, et la Direction de la Pêche aggrave l\'inefficacité du dispositif. Cette situation compromet non seulement la préservation des stocks halieutiques, mais aussi la souveraineté nationale sur l\'espace maritime, un enjeu stratégique majeur dans le contexte de la valorisation de l\'économie bleue.',
            impact: 'Élevé',
            montant: '2 500 000 000 FCFA',
            statut: 'Résolu - Plan d\'action validé',
            classification: 'Résolu',
            dateCreation: '2025-01-14',
            dateDetection: '2025-01-14',
            secteur: 'Surveillance maritime',
            localisation: 'Cap Lopez, Ogooué-Maritime',
            tendance: 'Stabilisée - Mesures correctives en cours',
            actionsRecommandees: 'SOLUTION MISE EN ŒUVRE : Acquisition de 4 nouveaux patrouilleurs rapides (livraison Q2-2025). Installation d\'un système radar nouvelle génération sur 12 points stratégiques. Recrutement et formation de 80 agents supplémentaires (programme AFOP maritime). Déploiement d\'un système de surveillance par drones maritimes (portée 200 km). Création d\'un centre de commandement unifié inter-services opérationnel depuis février 2025. Convention de coopération régionale signée avec 5 pays pour surveillance conjointe. Budget alloué : 12 milliards FCFA sur 3 ans. Résultats attendus : couverture à 85% d\'ici fin 2025.',
            derniereMAJ: '2025-01-18 - 14h30'
          },
          {
            id: 'PROB-003',
            titre: 'Processus d\'agrément défaillant',
            description: 'L\'audit interne conduit par l\'Inspection Générale des Services du Ministère de la Pêche a mis en évidence des dysfonctionnements structurels majeurs dans le processus d\'agrément des coopératives de pêche. Le système actuel, hérité de procédures datant de 2008, repose sur une approche entièrement manuelle, papier et décentralisée qui favorise les zones grises. Les dossiers de demande d\'agrément sont incomplets dans 68% des cas acceptés, avec absence récurrente de pièces essentielles (statuts juridiques visés par le notaire, listes nominatives des coopérateurs avec identité vérifiée, plans d\'affaires réalistes, attestations de dépôt de capital social). Le délai moyen de traitement d\'une demande est de 8 mois, mais certaines sont approuvées en 3 semaines sans justification du circuit accéléré. L\'absence de vérification terrain systématique (seulement 12% des dossiers font l\'objet d\'une visite de validation) permet l\'enregistrement d\'entités fantômes. Le personnel affecté à l\'instruction des dossiers (9 agents pour traiter 180 demandes annuelles) est surchargé, insuffisamment formé aux techniques d\'analyse de risque, et vulnérable à la corruption (salaires moyens de 350 000 FCFA pour des décisions engageant des millions). L\'inexistence d\'un registre national centralisé et numérisé empêche la détection des doublons et des incohérences. Cette défaillance systémique a facilité la création des 12 coopératives fictives identifiées et représente un risque permanent pour l\'intégrité du secteur. La perte de crédibilité du processus d\'agrément décourage les opérateurs sérieux et alimente une économie informelle estimée à 1,2 milliards FCFA.',
            impact: 'Moyen',
            montant: '1 200 000 000 FCFA',
            statut: 'Évaluation approfondie requise',
            classification: 'Supprimer',
            dateCreation: '2025-01-12',
            dateDetection: '2025-01-12',
            secteur: 'Administration',
            localisation: 'Direction Générale - Libreville',
            tendance: 'Chronique - Défaillance systémique',
            actionsRecommandees: 'ACTION 1 - DIAGNOSTIC COMPLET (0-30 jours) : Cartographie exhaustive du circuit actuel d\'agrément avec identification de tous les points de blocage et de vulnérabilité. Audit des 450 agréments délivrés depuis 2020 avec notation de conformité. Benchmark international des meilleures pratiques (Sénégal, Maurice, Seychelles). Consultation des parties prenantes (coopérateurs, administration, partenaires techniques). ACTION 2 - SUSPENSION TEMPORAIRE (dès validation présidentielle) : Moratoire de 60 jours sur les nouvelles demandes d\'agrément pour mise à niveau du système. Gel des renouvellements automatiques sans contrôle préalable. Vérification obligatoire des agréments en cours avant tout décaissement de fonds publics. ACTION 3 - RÉFORME STRUCTURELLE (30-120 jours) : Conception et déploiement d\'une plateforme numérique intégrée de gestion des agréments (dématérialisation complète, workflow automatisé, traçabilité totale). Définition d\'un nouveau cahier des charges avec critères objectifs et vérifiables. Création d\'une Commission nationale d\'agrément (Pêche, Justice, Finances, Société civile) pour décisions collégi ales. Renforcement des effectifs (recrutement de 15 instructeurs qualifiés). Programme de formation obligatoire anti-fraude pour tous les agents. Mise en place d\'un dispositif de lanceurs d\'alerte protégé. Budget estimé : 800 millions FCFA. Délai : opérationnel d\'ici juillet 2025.',
            derniereMAJ: '2025-01-16 - 10h15'
          }
        ]);

        // Recommandations présidentielles
        setAdminRecommandations([
          {
            id: 'REC-001',
            titre: 'Réforme du système d\'agrément',
            description: 'Mettre en place un système de vérification renforcé et digitalisé pour l\'agrément des coopératives de pêche, avec contrôles terrain obligatoires et traçabilité complète',
            priorite: 'Critique',
            categorie: 'Réforme Structurelle',
            statut: 'En attente de validation présidentielle',
            classification: 'Pas urgent',
            impact: 'Prévention systématique des détournements futurs et restauration de la confiance institutionnelle',
            delai: '120 jours (phase pilote 30 jours)',
            budget: '800 000 000 FCFA (investissement initial + 3 ans fonctionnement)',
            services: 'Ministère Pêche, Justice, Finances, Transformation Digitale',
            responsable: 'Ministère de la Pêche',
            justification: 'L\'affaire des 12 coopératives fictives ayant détourné 5 milliards FCFA révèle une défaillance systémique du processus d\'agrément actuel, hérité de 2008 et devenu obsolète face aux enjeux contemporains. Cette réforme s\'impose comme une nécessité absolue pour trois raisons stratégiques majeures : PREMIÈRE RAISON - SÉCURISATION DES FINANCES PUBLIQUES : Les subventions publiques au secteur halieutique représentent 28 milliards FCFA annuels (Budget 2025). Sans réforme, le risque de récurrence des détournements est estimé à 15-20% du budget soit 4,2 à 5,6 milliards FCFA de pertes potentielles. La mise en place d\'un système de vérification renforcé permettra d\'économiser au minimum 3 milliards FCFA/an en détournements évités. DEUXIÈME RAISON - CRÉDIBILITÉ INTERNATIONALE : Le Gabon sollicite un financement de 50 millions USD auprès de la Banque Mondiale pour le Programme d\'Économie Bleue 2025-2030. Les bailleurs exigent désormais des garanties de bonne gouvernance et de traçabilité des fonds. Cette réforme conditionnera l\'obtention du financement. TROISIÈME RAISON - DÉVELOPPEMENT DURABLE DU SECTEUR : Les 350 coopératives légitimes (12 000 pêcheurs et leurs familles, soit 60 000 personnes) sont pénalisées par les fraudes. La réforme restaurera leur confiance et stimulera l\'investissement privé estimé à 15 milliards FCFA sur 3 ans.',
            planAction: [
              'ÉTAPE 1 (Jours 1-15) : Constitution d\'une Task Force présidentielle pluridisciplinaire (15 experts : juristes, informaticiens, auditeurs, représentants coopératives). Budget: 50 millions FCFA.',
              'ÉTAPE 2 (Jours 16-30) : Audit exhaustif du système actuel avec cartographie des failles. Consultation nationale des parties prenantes (coopératives, administrations, bailleurs). Benchmark des meilleures pratiques internationales (Sénégal, Maurice, Seychelles). Rédaction du cahier des charges technique. Budget: 80 millions FCFA.',
              'ÉTAPE 3 (Jours 31-60) : Appel d\'offres international pour la plateforme digitale (dématérialisation, blockchain, géolocalisation). Recrutement et formation de 15 instructeurs spécialisés (salaire moyen 800 000 FCFA/mois). Élaboration du nouveau cadre juridique (décret présidentiel, arrêtés ministériels). Budget: 250 millions FCFA.',
              'ÉTAPE 4 (Jours 61-90) : Développement et tests de la plateforme numérique. Campagne nationale de sensibilisation multi-canal (TV, radio, réseaux sociaux). Mise en place de la Commission Nationale d\'Agrément (5 collèges : État, coopératives, société civile, experts, bailleurs). Formation des 450 coopératives existantes au nouveau système. Budget: 200 millions FCFA.',
              'ÉTAPE 5 (Jours 91-120) : Lancement opérationnel du nouveau système avec période probatoire. Traitement des dossiers en attente selon la nouvelle procédure. Mise en place du dispositif de lanceurs d\'alerte sécurisé. Évaluation indépendante à J+120 par un cabinet international. Budget: 220 millions FCFA.'
            ],
            risques: 'RISQUE MAJEUR 1 - RÉSISTANCE ADMINISTRATIVE (probabilité 70%, impact élevé) : Les agents bénéficiant de l\'ancien système opaque pourraient saboter la réforme. MITIGATION : Sanctions exemplaires (révocation) pour obstruction + primes de performance (200% salaire) pour les agents vertueux + campagne de communication sur les bénéfices collectifs. RISQUE MAJEUR 2 - RETARDS TECHNOLOGIQUES (probabilité 40%, impact moyen) : Les prestataires IT peuvent accumuler des retards. MITIGATION : Pénalités contractuelles de 5 millions FCFA/semaine de retard + solution de backup avec un second prestataire + accompagnement d\'un expert international (financement Banque Mondiale). RISQUE MAJEUR 3 - SOUS-FINANCEMENT (probabilité 30%, impact critique) : Budget initial insuffisant pourrait compromettre la réforme. MITIGATION : Ligne budgétaire sécurisée par décret présidentiel + co-financement bailleurs (50%) déjà confirmé par l\'AFD + possibilité de réaffectation de 10% du budget détournement récupéré.',
            prochaineEcheance: '7 jours - Décision présidentielle requise',
            indicateursSucces: 'KPI 1 : 100% des nouveaux agréments avec visite terrain (vs 12% actuellement). KPI 2 : Délai moyen traitement réduit à 45 jours (vs 8 mois). KPI 3 : Zéro détournement détecté sur 24 mois. KPI 4 : 95% satisfaction des coopératives (enquête annuelle). KPI 5 : Certification ISO 9001 du processus d\'agrément obtenue avant fin 2026.'
          },
          {
            id: 'REC-002',
            titre: 'Renforcement surveillance maritime',
            description: 'Déployer un dispositif intégré de surveillance maritime de nouvelle génération combinant moyens navals, aériens, satellites et drones pour assurer une couverture de 85% de la ZEE gabonaise',
            priorite: 'Haute',
            categorie: 'Sécurité et Souveraineté',
            statut: 'En cours d\'exécution - Phase 2/4',
            classification: 'Résolu',
            impact: 'Réduction de 75% de la pêche illégale et protection de 2,5 milliards FCFA de ressources halieutiques annuelles',
            delai: '18 mois (jalons trimestriels)',
            budget: '12 000 000 000 FCFA sur 3 ans (4 milliards/an)',
            services: 'Marine Nationale, Gendarmerie Maritime, Direction Pêche, Douanes, Air Force',
            responsable: 'Marine Nationale',
            justification: 'La Zone Économique Exclusive (ZEE) gabonaise s\'étend sur 213 000 km², représentant un territoire maritime 3 fois supérieur à la superficie terrestre du pays. Cette immensité recèle des ressources halieutiques estimées à 85 000 tonnes/an d\'une valeur commerciale de 180 milliards FCFA. CONSTAT ALARMANT : Avec seulement 35% de couverture surveillance actuelle, le Gabon subit des pertes annuelles de 2,5 milliards FCFA dues à la pêche INN (Illicite, Non déclarée, Non réglementée) pratiquée par des navires-usines étrangers principalement asiatiques et européens. Ces activités criminelles épuisent les stocks (thons, merlus, crevettes), détruisent les écosystèmes marins (chalutage profond), et privent l\'État de recettes fiscales (licences non payées). ENJEU STRATÉGIQUE NATIONAL : La Vision Gabon 2035 fait de l\'économie bleue un pilier du développement avec objectif de 15% du PIB d\'ici 2030 (actuellement 4%). Cet objectif ambitieux nécessite impérativement la maîtrise et la protection de notre espace maritime. CONTEXTE GÉOPOLITIQUE : Les tensions en mer de Chine méridionale poussent les flottes de pêche asiatiques vers les côtes africaines. Sans réaction ferme, le Gabon deviendra une zone de prédation. OPPORTUNITÉ DIPLOMATIQUE : Un dispositif de surveillance performant positionnera le Gabon comme leader régional de la sécurité maritime, ouvrant la voie à des coopérations bilatérales rémunératrices (location de moyens aux pays voisins : Guinée Équatoriale, Sao Tomé, Congo) estimées à 3 milliards FCFA/an de revenus additionnels.',
            planAction: [
              'PHASE 1 - DÉJÀ RÉALISÉE (Oct 2024-Jan 2025) : Signature contrat d\'acquisition de 4 patrouilleurs rapides Ocea FPB 98 (France) pour 6,5 milliards FCFA. Financement sécurisé : 60% crédit Coface, 40% budget État. Livraison programmée Q2-2025. Formation de 60 marins à Lorient (France) - 80% complétée.',
              'PHASE 2 - EN COURS (Fév-Juin 2025) : Installation système radar côtier SCANTER 6000 sur 12 sites stratégiques (Port-Gentil, Cap Lopez, Mayumba, Libreville, etc.) pour 1,8 milliards FCFA. Prestataire : Terma (Danemark). Avancement : 40%. Recrutement et formation de 80 nouveaux agents surveillance (programme AFOP maritime financé BM). Avancement : 100 candidats sélectionnés, formation démarrage mars 2025.',
              'PHASE 3 - À LANCER (Juillet-Déc 2025) : Déploiement de 8 drones maritimes longue portée Schiebel Camcopter S-100 (autonomie 10h, portée 200 km) pour 2,2 milliards FCFA. Appel d\'offres en finalisation. Construction du Centre de Commandement Maritime Unifié (CCMU) à Libreville, regroupant Marine, Gendarmerie, Pêche, Douanes. Investissement : 800 millions FCFA. Chantier démarrage Q3-2025.',
              'PHASE 4 - CONSOLIDATION (2026) : Convention de coopération régionale CEMAC + CEEAC pour surveillance conjointe et partage de renseignements. Protocole déjà signé avec 5 pays (Cameroun, Guinée Équatoriale, Congo, RDC, Sao Tomé). Acquisition système satellitaire AIS (Automatic Identification System) pour tracking en temps réel de tous les navires dans la ZEE. Budget : 500 millions FCFA. Fournisseur : Spire Global ou Exactearth.'
            ],
            risques: 'RISQUE OPÉRATIONNEL 1 - MAINTENANCE ÉQUIPEMENTS (probabilité 50%, impact élevé) : Les équipements sophistiqués nécessitent une maintenance spécialisée coûteuse. Un patrouilleur immobilisé = 1,5 milliards FCFA de manque à gagner/an. MITIGATION : Contrats de maintenance tout compris sur 10 ans inclus dans l\'acquisition (20% du prix d\'achat). Formation de 25 techniciens gabonais (transfert technologie obligatoire contractuellement). Constitution d\'un stock de pièces détachées critique (200 millions FCFA). RISQUE HUMAIN 2 - CORRUPTION DES AGENTS (probabilité 30%, impact critique) : Des agents corrompus pourraient alerter les navires illégaux contre rétribution. MITIGATION : Salaires majorés de 100% pour les agents surveillance (prime souveraineté maritime). Rotation aléatoire des équipages. Système de contrôle croisé et audit surprise mensuel par l\'Inspection Générale des Armées. Sanctions pénales alourdies (10 ans prison ferme pour trahison de souveraineté). RISQUE DIPLOMATIQUE 3 - TENSIONS INTERNATIONALES (probabilité 20%, impact moyen) : L\'arraisonnement de navires étrangers peut créer des incidents diplomatiques. MITIGATION : Protocole d\'intervention gradué validé par le Quai d\'Orsay et la Commission Africaine. Caméras embarquées sur tous les navires (preuve juridique). Cellule juridique spécialisée droit maritime international (5 avocats). Assurance diplomatique contractée (50 millions FCFA/an).',
            prochaineEcheance: '15 jours - Réception 1er patrouilleur Ocea',
            indicateursSucces: 'KPI 1 : Couverture surveillance ZEE portée à 85% avant fin 2025 (vs 35% actuellement). KPI 2 : Nombre d\'infractions détectées multiplié par 5 (objectif 120 arrestations/an). KPI 3 : Recettes fiscales licences de pêche augmentées de 40% (objectif 8 milliards FCFA en 2026). KPI 4 : Zéro incident majeur de sécurité maritime (piraterie, pollution). KPI 5 : Temps de réponse aux alertes réduit à moins de 2h (vs 8h actuellement).'
          },
          {
            id: 'REC-003',
            titre: 'Protocole d\'Intervention Rapide XR-7 Enhanced',
            description: 'Établir un protocole présidentiel d\'intervention d\'urgence multi-agences pour traiter les signalements critiques (corruption massive, détournements, menaces sécuritaires) en moins de 48h avec mobilisation de moyens exceptionnels',
            priorite: 'Moyenne',
            categorie: 'Gouvernance et Réactivité',
            statut: 'En phase d\'étude - Comité technique constitué',
            classification: 'Supprimer',
            impact: 'Amélioration drastique de la réactivité institutionnelle et restauration de la confiance citoyenne',
            delai: '90 jours (phase pilote 45 jours)',
            budget: '2 500 000 000 FCFA (installation + 2 ans fonctionnement)',
            services: 'Présidence, Justice, Police, Gendarmerie, Finances, Cour des Comptes, Parquet',
            responsable: 'Secrétariat Général Présidence',
            justification: 'CONTEXTE GÉNÉRAL : Le système actuel de traitement des signalements souffre de délais bureaucratiques incompatibles avec l\'urgence de certaines situations. Exemple concret : le cas des 12 coopératives fictives identifié en janvier 2025 résultait de signalements citoyens datant de... novembre 2022. 14 MOIS DE RETARD pendant lesquels les fraudeurs ont continué à détourner tranquillement. Ce dysfonctionnement mine la confiance des citoyens et des lanceurs d\'alerte. BESOIN IMPÉRATIF D\'UN DISPOSITIF EXCEPTIONNEL : Certains cas requièrent une réaction quasi-militaire avec activation en moins de 48h de moyens exceptionnels : gel de comptes bancaires, perquisitions simultanées multi-sites, convocations immédiates, saisies conservatoires, mobilisation d\'experts (forensique, informatique, etc.). Le cadre juridique actuel ne permet pas cette célérité. RÉFÉRENCE INTERNATIONALE : Ce protocole s\'inspire du modèle singapourien du "Serious Fraud Office" qui traite 85% des cas ultra-graves en moins de 72h avec un taux de condamnation de 94%. L\'efficacité repose sur des procédures dérogatoires activées par décision présidentielle pour contourner légalement les lourdeurs administratives classiques. IMPACT DISSUASIF : L\'existence même d\'un tel protocole aura un effet préventif majeur. Les fraudeurs potentiels sauront qu\'ils risquent une intervention-éclair présidentielle. Les agents publics hésiteront à 10 fois avant de se compromettre. AMÉLIORATION IMAGE INTERNATIONALE : Les bailleurs et investisseurs étrangers valorisent la capacité de réaction rapide face à la corruption. Ce protocole améliorera le classement Gabon dans l\'indice Doing Business (objectif : top 100 en 2027 vs 169ème actuellement).',
            planAction: [
              'ÉTAPE 1 - CADRE JURIDIQUE (Jours 1-30) : Rédaction d\'un décret présidentiel instituant le Protocole XR-7 Enhanced avec définition précise des critères d\'activation (montants > 500 millions FCFA, menace sécurité nationale, corruption d\'agents supérieurs, etc.). Consultation du Conseil d\'État pour garantir constitutionnalité. Avis de la Cour Suprême sur les procédures dérogatoires. Validation finale Conseil des Ministres. Budget : 80 millions FCFA (frais experts juridiques).',
              'ÉTAPE 2 - INFRASTRUCTURE OPÉRATIONNELLE (Jours 31-60) : Création d\'une Cellule XR-7 Enhanced au Palais présidentiel (effectif permanent : 12 agents d\'élite - magistrats, policiers, enquêteurs financiers). Aménagement d\'un Centre de Crise sécurisé (salle de commandement blindée, serveurs cryptés, liaisons satellites). Équipements high-tech : drones de surveillance, brouilleurs, véhicules banalisés, matériel de perquisition. Budget : 800 millions FCFA.',
              'ÉTAPE 3 - PROCÉDURES ET OUTILS (Jours 61-75) : Élaboration de 8 playbooks d\'intervention selon typologie des cas (détournement fonds publics, corruption, fraude fiscale, blanchiment, etc.). Développement d\'une plateforme digitale de signalement sécurisée accessible 24/7 (anonymat garanti, blockchain, géolocalisation). Négociation de protocoles avec banques pour gel instantané de comptes (délai maximum 1h). Formation de 50 agents réservistes mobilisables H+6. Budget : 350 millions FCFA.',
              'ÉTAPE 4 - TEST ET DÉPLOIEMENT (Jours 76-90) : Simulation grandeur nature avec cas fictif (exercice interministériel sur 48h). Débriefing et ajustements procédures. Campagne de communication publique sur l\'existence du protocole (dissuasion). Formation de 200 magistrats et policiers aux procédures XR-7. Audit indépendant par un cabinet international spécialisé (Transparency International ou équivalent). Budget : 270 millions FCFA.'
            ],
            risques: 'RISQUE POLITIQUE 1 - DÉRIVE AUTORITAIRE (probabilité 25%, impact majeur) : Un tel pouvoir présidentiel pourrait être instrumentalisé contre des opposants politiques. MITIGATION JURIDIQUE SOLIDE : Garde-fous constitutionnels stricts (contrôle a posteriori obligatoire de la Cour Constitutionnelle dans les 72h, rapport trimestriel au Parlement, commission de surveillance indépendante composée de magistrats inamovibles). Limitation aux seuls cas financiers/économiques (exclusion explicite des cas politiques). Publication obligatoire d\'un rapport annuel détaillé. RISQUE OPÉRATIONNEL 2 - ERREURS D\'INTERVENTION (probabilité 15%, impact élevé) : Une perquisition sur base d\'un faux signalement pourrait causer des dommages réputationnels irréversibles. MITIGATION : Processus de validation en double niveau (analyste puis superviseur senior). Obligation de preuves préliminaires solides (pas d\'activation sur simple rumeur). Assurance responsabilité civile de l\'État pour 500 millions FCFA en cas d\'erreur avérée. Droit à réparation intégrale du préjudice (financier + moral). RISQUE DE FUITE 3 - COMPROMISSION CONFIDENTIALITÉ (probabilité 35%, impact critique) : Des fuites d\'information alerteraient les suspects avant l\'intervention. MITIGATION : Effectif réduit (principe need-to-know strict). Cloisonnement informationnel (agents ne connaissent que leur partie de mission). Procédures de contre-espionnage (détecteurs de micros, téléphones sécurisés Thales). Sanctions pénales maximales (15 ans prison) pour violation du secret XR-7.',
            prochaineEcheance: '30 jours - Validation décret présidentiel',
            indicateursSucces: 'KPI 1 : Délai moyen traitement cas critiques réduit à 48h (vs 8-12 mois actuellement). KPI 2 : Taux de récupération des fonds détournés porté à 70% (vs 20% actuellement). KPI 3 : Nombre de signalements citoyens multiplié par 3 (effet confiance). KPI 4 : Classement Transparency International amélioré de 15 places en 2 ans. KPI 5 : Aucune dérive autoritaire constatée (audit annuel indépendant).'
          }
        ]);

        // Opinion publique spécifique à l'Agent Pêche
        setAdminOpinionPublique({
          sentimentGeneral: 'Négatif',
          scoreConfiance: 32,
          tauxSatisfaction: [28],
          principauxGriefs: [
            {
              id: 'GRIEF-001',
              sujet: 'Lenteur administrative et impunité',
              pourcentage: 68,
              intensite: 'Très élevée',
              description: 'Les communautés de pêcheurs dénoncent massivement la lenteur des enquêtes administratives et le sentiment d\'impunité des fraudeurs. Le cas des 12 coopératives fictives, qui ont opéré pendant plus de 2 ans (2022-2024) sans être inquiétées malgré plusieurs signalements citoyens dès novembre 2022, cristallise la colère populaire. Les pêcheurs légitimes estiment que "l\'État protège les voleurs pendant que les honnêtes gens souffrent". Cette perception alimente une défiance profonde envers les institutions administratives et judiciaires.'
            },
            {
              id: 'GRIEF-002',
              sujet: 'Injustice dans l\'attribution des subventions',
              pourcentage: 54,
              intensite: 'Élevée',
              description: 'Les vrais pêcheurs artisanaux et coopératives légitimes dénoncent un système d\'attribution des subventions publiques profondément inéquitable. Pendant que des entités fictives ont reçu 5 milliards FCFA sans justification, 230 coopératives légitimes (7 500 pêcheurs) attendent depuis 18 mois des aides promises par le Programme National d\'Appui à la Pêche Artisanale. Cette situation crée un sentiment d\'abandon et nourrit la suspicion de corruption généralisée au sein de l\'administration. Les témoignages recueillis parlent de "système à deux vitesses" favorisant les réseaux politiques.'
            },
            {
              id: 'GRIEF-003',
              sujet: 'Détérioration des conditions de vie',
              pourcentage: 47,
              intensite: 'Moyenne',
              description: 'Les communautés côtières observent une dégradation constante de leurs conditions socio-économiques depuis 3 ans. La raréfaction des ressources halieutiques due à la surpêche illégale (notamment par navires étrangers non contrôlés) a réduit les prises moyennes de 40%. Les équipements vieillissants (pirogues, filets, moteurs) ne peuvent être renouvelés faute d\'accès au crédit. Les infrastructures portuaires communautaires (quais, chambres froides, ateliers de transformation) restent à l\'état de projet malgré les promesses électorales de 2023. Cette situation pousse les jeunes pêcheurs vers l\'exode rural ou la migration clandestine.'
            }
          ],
          sourcesDonnees: [
            'Sondage IFOP Gabon (1 250 personnes, 12 communautés côtières) - Janvier 2025',
            'Analyse réseaux sociaux (Facebook, Twitter, WhatsApp) - 45 000 mentions - Décembre 2024',
            'Consultations citoyennes organisées par le Conseil National de la Pêche - Novembre 2024',
            '18 pétitions en ligne (125 000 signatures cumulées) - Octobre-Décembre 2024',
            'Rapports d\'ONG (Transparency Gabon, Observatoire Citoyen) - T4 2024'
          ],
          tendanceEvolution: 'Dégradation accélérée',
          risqueSocial: 'Élevé',
          impactPolitique: 'L\'affaire des coopératives fictives a un impact politique majeur. Elle alimente les critiques de l\'opposition sur la "gouvernance opaque" et la "corruption systémique". Lors des élections locales de décembre 2024 dans 5 communes côtières (Port-Gentil, Cap Lopez, Mayumba, Gamba, Libreville-Maritime), les candidats gouvernementaux ont subi un recul de 12 points en moyenne. Les slogans "Rendez l\'argent des pêcheurs!" et "Justice pour nos coopératives!" ont mobilisé plus de 5 000 manifestants à Port-Gentil en janvier 2025. Sans action rapide et visible du gouvernement, le risque est une défiance durable envers les institutions dans ces zones stratégiques qui représentent 8% de l\'électorat national.',
          recommandationsCommunication: [
            'URGENCE : Communiqué présidentiel officiel dans les 7 jours reconnaissant le problème, présentant les mesures prises (gel des comptes, poursuites judiciaires) et s\'engageant personnellement sur le recouvrement intégral des fonds détournés.',
            'Tournée présidentielle dans les 3 principales communautés de pêcheurs (Port-Gentil, Cap Lopez, Mayumba) dans les 30 jours pour dialogue direct, écoute des doléances et annonces concrètes.',
            'Campagne médiatique multi-canal (TV, radio, réseaux sociaux) expliquant de manière pédagogique les réformes en cours, avec témoignages de pêcheurs bénéficiaires et experts indépendants.',
            'Publication hebdomadaire des progrès de l\'enquête et des montants récupérés (transparence totale) sur un site web dédié et via SMS aux 12 000 pêcheurs enregistrés.',
            'Organisation de "États Généraux de la Pêche Artisanale" dans les 90 jours avec participation de toutes les parties prenantes pour co-construire les solutions et restaurer la confiance.'
          ],
          actionsCorrectivesUrgentes: [
            'Déblocage immédiat d\'une enveloppe d\'urgence de 2 milliards FCFA pour les 230 coopératives légitimes en attente (délai 15 jours maximum).',
            'Création d\'un Fonds d\'Indemnisation des Victimes alimenté par les fonds détournés récupérés (objectif 3,5 milliards FCFA).',
            'Instauration d\'une ligne téléphonique verte présidentielle gratuite (numéro court 1234) pour signalements directs et suivi des cas.',
            'Nomination d\'un Médiateur Présidentiel pour le Secteur Halieutique avec pouvoir d\'investigation et de recommandation directe à la Présidence.',
            'Organisation d\'une cérémonie publique de remise symbolique de chèques aux premières coopératives indemnisées (impact médiatique fort).'
          ],
          dateAnalyse: '2025-01-19',
          prochaineSondage: '2025-03-15 (suivi post-mesures correctives)'
        });
      } else if ((admin as any).type_service === 'securite_nationale') {
        // **DONNÉES SPÉCIFIQUES SERVICES SPÉCIAUX / SÉCURITÉ NATIONALE**
        console.log('🛡️ [handleVoirDetails] Service de sécurité détecté:', admin.organization, 'Classification:', (admin as any).classification);

        const {
          getHistoriqueOperationnel,
          getCasSensibles,
          getOpinionPubliqueSecurite,
          getRecommandationsSecurite
        } = await import('@/services/servicesSpeciauxDataService');

        const { getMenacesStrategiques } = await import('@/services/menacesStrategiquesDataService');

        const classification = (admin as any).classification || 'CONFIDENTIEL DÉFENSE';

        // Historique opérationnel
        const historique = getHistoriqueOperationnel(admin.organization, classification);
        console.log('📋 Historique opérationnel chargé:', historique.length, 'entrées');
        setAdminHistory(historique);

        // Cas sensibles en cours
        const cas = getCasSensibles(admin.organization);
        console.log('📁 Cas sensibles chargés:', cas.length, 'cas');
        setAdminCases(cas as any[]);

        // Menaces stratégiques
        const menaces = getMenacesStrategiques(admin.organization);
        console.log('⚠️ Menaces stratégiques chargées:', menaces.length, 'menaces');
        setAdminProblematiques(menaces as any[]);

        // Recommandations sécurité nationale
        const recommandations = getRecommandationsSecurite(admin.organization, classification);
        console.log('📝 Recommandations chargées:', recommandations.length, 'recommandations');
        setAdminRecommandations(recommandations as any[]);

        // Opinion publique adaptée services spéciaux
        const opinion = getOpinionPubliqueSecurite(admin.organization);
        console.log('📊 Opinion publique chargée:', opinion);
        setAdminOpinionPublique(opinion as any);
      } else if ((admin as any).type_compte === 'identifie') {
        // **FICHE CITOYEN IDENTIFIÉ** - Informations personnelles + ses signalements
        console.log('👤 [handleVoirDetails] Citoyen identifié détecté:', (admin as any).identite?.nom_complet);
        setAdminHistory([
          {
            id: 1,
            date: '2025-01-18',
            action: 'Signalement déposé',
            description: 'Dénonciation corruption mairie - Marché public truqué',
            status: 'En traitement',
            montant: '450 000 000 FCFA'
          },
          {
            id: 2,
            date: '2025-01-12',
            action: 'Signalement résolu',
            description: 'Détournement fonds association - Récupération partielle',
            status: 'Résolu',
            montant: '120 000 000 FCFA'
          },
          {
            id: 3,
            date: '2024-12-20',
            action: 'Signalement résolu',
            description: 'Harcèlement fonctionnaire municipal - Sanction appliquée',
            status: 'Résolu',
            montant: 'N/A'
          }
        ]);

        setAdminCases([
          {
            id: 'SIG-USER-2025-089',
            titre: 'Corruption mairie - Marché public attribution frauduleuse',
            description: 'Dénonciation attribution marché public 450M FCFA à société fictive. Preuves documentaires fournies (appel d\'offres, factures, témoignages).',
            montant: '450 000 000 FCFA',
            statut: 'En traitement',
            priorite: 'Haute',
            dateCreation: '2025-01-18',
            secteur: 'Administration locale',
            localisation: 'Libreville',
            auteur: (admin as any).identite?.nom_complet,
            anonymat: 'Non (identité révélée)'
          },
          {
            id: 'SIG-USER-2024-234',
            titre: 'Détournement fonds association quartier',
            description: 'Président association détourne subventions municipales. Somme récupérée partiellement après enquête.',
            montant: '120 000 000 FCFA',
            statut: 'Résolu',
            priorite: 'Moyenne',
            dateCreation: '2024-12-20',
            secteur: 'Société civile',
            localisation: 'Gros-Bouquet, Libreville',
            auteur: (admin as any).identite?.nom_complet,
            anonymat: 'Non'
          },
          {
            id: 'SIG-USER-2024-187',
            titre: 'Racket agent municipal sur commerçants',
            description: 'Agent municipal exige pots-de-vin pour délivrance autorisations. En cours de vérification.',
            montant: 'Estimé: 15 000 000 FCFA',
            statut: 'Enquête préliminaire',
            priorite: 'Moyenne',
            dateCreation: '2024-11-28',
            secteur: 'Administration locale',
            localisation: 'Gros-Bouquet',
            auteur: (admin as any).identite?.nom_complet,
            anonymat: 'Non'
          }
        ]);

        setAdminProblematiques([]);
        setAdminRecommandations([]);
        setAdminOpinionPublique(null);
      } else if ((admin as any).type_compte === 'anonyme') {
        // **SIGNALEMENTS ANONYMES "Taper le Ndjobi"** - Uniquement dénonciations, aucune info personnelle
        console.log('🔒 [handleVoirDetails] Signalements anonymes détectés:', (admin as any).numero_anonyme);
        setAdminHistory([]);

        setAdminCases([
          {
            id: 'ANON-2025-1234',
            titre: 'Détournement subventions agriculture (dénonciation anonyme)',
            description: 'Source anonyme signale détournement 800M FCFA programme agricole. Vérifications en cours. Aucune identité révélée.',
            montant: '800 000 000 FCFA',
            statut: 'Vérification',
            priorite: 'Haute',
            dateCreation: '2025-01-16',
            secteur: 'Agriculture',
            localisation: 'Haut-Ogooué (source: métadonnées SMS)',
            auteur: 'ANONYME',
            anonymat: 'Complet (XR-7 requis)',
            numero_anonyme: 'ANON-2025-1234',
            methode: 'SMS "Taper le Ndjobi"',
            metadata_xr7: 'IP, géolocalisation, analyse comportementale disponibles via XR-7'
          },
          {
            id: 'ANON-2025-0987',
            titre: 'Corruption juge tribunal (dénonciation anonyme)',
            description: 'Allégations corruption magistrat. Demande enquête discrète. Protection identité critique.',
            montant: 'Pots-de-vin: 50 000 000 FCFA',
            statut: 'Enquête discrète',
            priorite: 'Critique',
            dateCreation: '2025-01-14',
            secteur: 'Justice',
            localisation: 'Libreville (source: métadonnées WhatsApp)',
            auteur: 'ANONYME',
            anonymat: 'Complet (XR-7 requis)',
            numero_anonyme: 'ANON-2025-0987',
            methode: 'WhatsApp "Taper le Ndjobi"',
            metadata_xr7: 'Numéro téléphone chiffré, timestamp, empreinte appareil disponibles via XR-7'
          },
          {
            id: 'ANON-2024-5621',
            titre: 'Trafic influence entreprise publique (anonyme)',
            description: 'Dénonciations nominations frauduleuses contre commissions. Enquête préliminaire ouverte.',
            montant: 'Non chiffré',
            statut: 'Analyse',
            priorite: 'Moyenne',
            dateCreation: '2024-12-28',
            secteur: 'Entreprises publiques',
            localisation: 'Port-Gentil (source: géolocalisation approximative)',
            auteur: 'ANONYME',
            anonymat: 'Complet (XR-7 requis)',
            numero_anonyme: 'ANON-2024-5621',
            methode: 'SMS "Taper le Ndjobi"',
            metadata_xr7: 'Traces numériques disponibles via XR-7 uniquement'
          }
        ]);

        setAdminProblematiques([]);
        setAdminRecommandations([]);
        setAdminOpinionPublique(null);
      } else {
        // Données génériques pour les autres agents (non Pêche, non Services Spéciaux)
        setAdminHistory([
          {
            id: 1,
            date: '2025-01-15',
            action: 'Signalement traité',
            description: 'Nouveau cas d\'enquête sectorielle',
            status: 'En cours',
            montant: '500 000 000 FCFA'
          },
          {
            id: 2,
            date: '2025-01-14',
            action: 'Rapport généré',
            description: 'Bilan hebdomadaire des activités',
            status: 'Terminé',
            montant: '0 FCFA'
          }
        ]);

        setAdminCases([
          {
            id: 'SIG-2025-XXX',
            titre: 'Cas sectoriel',
            description: 'Enquête en cours dans le secteur',
            montant: '500 000 000 FCFA',
            statut: 'En cours',
            priorite: 'Moyenne',
            dateCreation: '2025-01-15',
            secteur: admin.organization,
            localisation: 'Gabon'
          }
        ]);

        setAdminProblematiques([]);
        setAdminRecommandations([]);
      }
    } catch (error) {
      console.error('❌ [handleVoirDetails] Erreur lors du chargement des détails:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAction(false);
      console.log('✅ [handleVoirDetails] Modal ouvert pour:', admin.nom);
    }
  };

  // Fonction pour ouvrir le modal de génération de rapport
  const handleOuvrirRapportModal = (admin: AdminData, cas?: CaseData) => {
    console.log('📊 [handleOuvrirRapportModal] Ouverture modal rapport pour:', admin.nom, cas ? 'cas spécifique' : 'global');
    setSelectedAdmin(admin);
    if (cas) {
      setRapportType('cas');
      setSelectedCas(cas);
      setSelectedCasIds([cas.id]);
    } else {
      setRapportType('global');
      setSelectedCas(null);
      setSelectedCasIds([]);
    }
    // Initialiser les dates par défaut
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateDebut(firstDayOfMonth.toISOString().split('T')[0]);
    setDateFin(today.toISOString().split('T')[0]);
    setPeriodeSuivi('mensuel');
    setFormatRapport('gamma-pdf');
    setIsRapportModalOpen(true);
    console.log('✅ [handleOuvrirRapportModal] Modal rapport ouvert');
  };

  // Fonction pour basculer la sélection d'un cas
  const handleToggleCasSelection = (casId: string) => {
    setSelectedCasIds(prev => {
      if (prev.includes(casId)) {
        return prev.filter(id => id !== casId);
      } else {
        return [...prev, casId];
      }
    });
  };

  // Fonction pour sélectionner/désélectionner tous les cas
  const handleToggleAllCas = () => {
    if (selectedCasIds.length === adminCases.length) {
      setSelectedCasIds([]);
    } else {
      setSelectedCasIds(adminCases.map(cas => cas.id));
    }
  };

  // Fonction pour générer le rapport institution/cas
  const handleGenererRapportInstitution = async () => {
    // Validation
    if (rapportType === 'cas' && selectedCasIds.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un cas pour générer le rapport.",
        variant: "destructive"
      });
      return;
    }

    if (rapportType === 'global' && (!dateDebut || !dateFin)) {
      toast({
        title: "Dates requises",
        description: "Veuillez sélectionner une période pour le rapport global.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingAction(true);
    try {
      // Notification de début de génération
      toast({
        title: "🎨 Génération Gamma AI en cours",
        description: "Préparation du rapport professionnel, veuillez patienter...",
      });

      // Import du service Gamma AI
      const { gammaAIService } = await import('@/services/gammaAIService');
      const gammaFormat = formatRapport === 'gamma-pdf' ? 'pdf' : 'pptx';

      let rapportData: any;
      let filename: string;

      if (rapportType === 'cas') {
        // Rapport cas spécifiques - Données optimisées pour Gamma AI
        const nombreCas = selectedCasIds.length;
        const casSelectionnes = adminCases.filter(cas => selectedCasIds.includes(cas.id));
        const montantTotal = casSelectionnes.reduce((sum, cas) => {
          const montantStr = typeof cas.montant === 'number' ? String(cas.montant) : (cas.montant || '0');
          const montant = parseInt(montantStr.replace(/[^\d]/g, ''));
          return sum + montant;
        }, 0);

        rapportData = {
          admin: {
            nom: selectedAdmin?.nom || 'Administrateur',
            organization: selectedAdmin?.organization || 'Organisation',
            email: selectedAdmin?.email || '',
            phone: selectedAdmin?.phone || '',
            role: selectedAdmin?.role || 'admin'
          },
          casSelectionnes: casSelectionnes.map(cas => ({
            id: cas.id,
            titre: cas.titre || 'Cas sans titre',
            description: cas.description || 'Aucune description disponible',
            montant: cas.montant || '0 FCFA',
            statut: cas.statut || 'Non défini',
            priorite: cas.priorite || 'Moyenne',
            dateCreation: cas.dateCreation || new Date().toISOString().split('T')[0],
            localisation: cas.localisation || 'Non spécifié',
            secteur: cas.secteur || 'Non spécifié'
          })),
          montantTotal: montantTotal,
          nombreCas: nombreCas,
          periode: `Cas sélectionnés - ${new Date().toLocaleDateString('fr-FR')}`
        };

        filename = `Rapport_Cas_${selectedAdmin?.organization?.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.${gammaFormat}`;

        // Génération du rapport de cas
        const result = await gammaAIService.generateRapportCas(rapportData, gammaFormat, gammaConfig);

        // Téléchargement automatique
        await gammaAIService.downloadFile(result.downloadUrl, filename);

        toast({
          title: "✅ Rapport Gamma AI généré avec succès",
          description: (
            <div className="space-y-1">
              <p className="font-medium">{nombreCas} cas analysés - {montantTotal.toLocaleString()} FCFA</p>
              <p className="text-sm text-muted-foreground">Format: {gammaFormat.toUpperCase()} • {gammaConfig.nombreCartes} slides</p>
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm">
                ✨ Voir sur Gamma.app →
              </a>
            </div>
          ),
        });

      } else {
        // Rapport global - Données enrichies pour Gamma AI
        const impactFinancier = adminProblematiques.reduce((sum, p) => {
          const montantStr = String(p.montant || '0');
          const montant = parseInt(montantStr.replace(/[^\d]/g, ''));
          return sum + montant;
        }, 0);

        rapportData = {
          admin: {
            nom: selectedAdmin?.nom || 'Administrateur',
            organization: selectedAdmin?.organization || 'Organisation',
            email: selectedAdmin?.email || '',
            phone: selectedAdmin?.phone || '',
            role: selectedAdmin?.role || 'admin'
          },
          periode: periodeSuivi,
          dateDebut: dateDebut,
          dateFin: dateFin,
          totalCas: adminCases.length,
          totalProblematiques: adminProblematiques.length,
          impactFinancier: impactFinancier,
          casData: adminCases.map(cas => ({
            id: cas.id,
            titre: cas.titre || 'Cas sans titre',
            description: cas.description || 'Aucune description',
            montant: cas.montant || '0 FCFA',
            statut: cas.statut || 'Non défini',
            priorite: cas.priorite || 'Moyenne',
            dateCreation: cas.dateCreation || new Date().toISOString().split('T')[0],
            localisation: cas.localisation || 'Non spécifié',
            secteur: cas.secteur || 'Non spécifié'
          })),
          problematiques: adminProblematiques.map(prob => ({
            id: prob.id,
            titre: prob.titre || 'Problématique sans titre',
            description: prob.description || 'Aucune description',
            impact: prob.impact || 'Non évalué',
            montant: prob.montant || '0 FCFA',
            statut: prob.statut || 'En cours',
            classification: prob.classification || 'Non classé',
            dateCreation: prob.dateCreation || new Date().toISOString().split('T')[0],
            secteur: prob.secteur || 'Non spécifié',
            localisation: prob.localisation || 'Non spécifié',
            actionsRecommandees: prob.actionsRecommandees || 'Aucune action recommandée'
          })),
          recommandations: adminRecommandations.map(rec => ({
            id: rec.id,
            titre: rec.titre || 'Recommandation sans titre',
            description: rec.description || 'Aucune description',
            priorite: rec.priorite || 'Moyenne',
            categorie: rec.categorie || 'Non catégorisé',
            statut: rec.statut || 'En attente',
            impact: rec.impact || 'Non évalué',
            delai: rec.delai || 'Non défini',
            budget: rec.budget || 'Non défini',
            services: rec.services || 'Non spécifié',
            responsable: rec.responsable || 'Non assigné'
          })),
          opinionPublique: adminOpinionPublique ? {
            principauxGriefs: adminOpinionPublique.principauxGriefs || [],
            risqueSocial: adminOpinionPublique.risqueSocial || 'Non évalué',
            tendanceOpinion: adminOpinionPublique.tendanceOpinion || 'Stable',
            satisfactionGlobale: adminOpinionPublique.satisfactionGlobale || 0,
            sentimentDominant: adminOpinionPublique.sentimentDominant || 'Neutre',
            noteOpinion: adminOpinionPublique.noteOpinion || 0,
            tauxSatisfaction: adminOpinionPublique.tauxSatisfaction || 0,
            zonesRisque: adminOpinionPublique.zonesRisque || []
          } : null
        };

        filename = `Rapport_Global_${selectedAdmin?.organization?.replace(/[^a-zA-Z0-9]/g, '_')}_${dateDebut}_${dateFin}.${gammaFormat}`;

        // Génération du rapport global
        const result = await gammaAIService.generateRapportGlobal(rapportData, gammaFormat, gammaConfig);

        // Téléchargement automatique
        await gammaAIService.downloadFile(result.downloadUrl, filename);

        toast({
          title: "✅ Rapport Gamma AI généré avec succès",
          description: (
            <div className="space-y-1">
              <p className="font-medium">Rapport {periodeSuivi} - Du {dateDebut} au {dateFin}</p>
              <p className="text-sm text-muted-foreground">
                {adminCases.length} cas • {adminProblematiques.length} problématiques • {impactFinancier.toLocaleString()} FCFA
              </p>
              <p className="text-sm text-muted-foreground">Format: {gammaFormat.toUpperCase()} • {gammaConfig.nombreCartes} slides</p>
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm">
                ✨ Voir sur Gamma.app →
              </a>
            </div>
          ),
        });
      }

      setIsRapportModalOpen(false);
    } catch (error) {
      console.error('❌ Erreur génération rapport Gamma AI:', error);
      toast({
        title: "❌ Erreur de génération",
        description: `Impossible de générer le rapport Gamma AI: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Fonction pour générer le rapport d'un admin (ancienne fonction)
  const handleGenererRapportAdmin = async (admin: AdminData) => {
    handleOuvrirRapportModal(admin);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Vérifier aussi la session démo dans localStorage pour éviter les problèmes de timing
  let hasAdminAccess = role === 'admin';
  let localRole = null;

  if (!hasAdminAccess) {
    try {
      const demoSessionData = localStorage.getItem('ndjobi_demo_session');
      console.log('🔍 [AdminDashboard] Vérification localStorage - demoSessionData:', demoSessionData ? 'trouvé' : 'vide');
      if (demoSessionData) {
        const demoSession = JSON.parse(demoSessionData);
        console.log('🔍 [AdminDashboard] Session démo parsée - role:', demoSession.role);
        localRole = demoSession.role;
        hasAdminAccess = demoSession.role === 'admin';
      }
    } catch (e) {
      console.error('❌ [AdminDashboard] Erreur parsing session démo:', e);
    }
  }

  console.log('🔍 [AdminDashboard] État final - user:', user?.id, 'role:', role, 'localRole:', localRole, 'hasAdminAccess:', hasAdminAccess);

  if (!user && !hasAdminAccess) {
    console.error('❌ [AdminDashboard] Accès refusé - user:', user, 'hasAdminAccess:', hasAdminAccess);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Accès refusé - Réservé au Protocole d'État</p>
      </div>
    );
  }

  console.log('✅ [AdminDashboard] Accès autorisé, rendu du dashboard');

  const renderDashboardGlobal = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <Card className="glass-effect border-none relative overflow-hidden group hover:translate-y-[-4px] transition-transform">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-warning))] to-transparent" />
          <CardHeader className="pb-1 md:pb-2 pt-2 md:pt-4 px-3 md:px-6">
            <CardTitle className="text-[10px] md:text-xs font-medium text-muted-foreground">
              Signalements Nationaux
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 md:pb-3 px-3 md:px-6">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <div className="text-lg md:text-2xl font-bold tabular-nums truncate">{kpis?.total_signalements?.toLocaleString() || 0}</div>
                <Badge className="mt-0.5 md:mt-1 text-[10px] md:text-xs bg-[hsl(var(--accent-warning))]/20 text-[hsl(var(--accent-warning))]">{kpis?.tendance || '+0%'}</Badge>
              </div>
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-[hsl(var(--accent-warning))]/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-[hsl(var(--accent-warning))]" />
              </div>
            </div>
            <div className="mt-1.5 md:mt-2 h-0.5 md:h-1 bg-muted/50 rounded-full overflow-hidden">
              <div className="h-full w-[67%] bg-gradient-to-r from-[hsl(var(--accent-intel))] to-[hsl(var(--accent-warning))] rounded-full" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
            <div className="mt-1 md:mt-1.5 text-[9px] md:text-xs text-muted-foreground truncate">
              {kpis?.signalements_critiques || 0} cas critiques
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-none relative overflow-hidden group hover:translate-y-[-4px] transition-transform">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-success))] to-transparent" />
          <CardHeader className="pb-1 md:pb-2 pt-2 md:pt-4 px-3 md:px-6">
            <CardTitle className="text-[10px] md:text-xs font-medium text-muted-foreground">
              Impact Économique
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 md:pb-3 px-3 md:px-6">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <div className="text-lg md:text-2xl font-bold tabular-nums truncate">
                  {((kpis?.impact_economique || 0) / 1000000000).toFixed(1)}Mrd
                </div>
                <div className="text-[9px] md:text-xs text-[hsl(var(--accent-success))] mt-0.5 md:mt-1 truncate">FCFA récupérés</div>
              </div>
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-[hsl(var(--accent-success))]/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-[hsl(var(--accent-success))]" />
              </div>
            </div>
            <div className="mt-1.5 md:mt-2 h-0.5 md:h-1 bg-muted/50 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-gradient-to-r from-[hsl(var(--accent-intel))] to-[hsl(var(--accent-success))] rounded-full" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
            <div className="mt-1 md:mt-1.5 text-[9px] md:text-xs text-muted-foreground truncate">
              Fonds restitués
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-none relative overflow-hidden group hover:translate-y-[-4px] transition-transform">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-intel))] to-transparent" />
          <CardHeader className="pb-1 md:pb-2 pt-2 md:pt-4 px-3 md:px-6">
            <CardTitle className="text-[10px] md:text-xs font-medium text-muted-foreground">
              Taux de Résolution
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 md:pb-3 px-3 md:px-6">
            <div className="flex items-center justify-between gap-1">
              <div className="w-full min-w-0 flex-1">
                <div className="text-lg md:text-2xl font-bold mb-1.5 md:mb-2 tabular-nums">{kpis?.taux_resolution || 0}%</div>
                <Progress value={kpis?.taux_resolution || 0} className="h-1 md:h-1.5" />
              </div>
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-[hsl(var(--accent-intel))]/20 flex items-center justify-center ml-2 flex-shrink-0">
                <Target className="h-3 w-3 md:h-4 md:w-4 text-[hsl(var(--accent-intel))]" />
              </div>
            </div>
            <div className="mt-1 md:mt-1.5 text-[9px] md:text-xs text-muted-foreground truncate">
              Objectif: 85%
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-none relative overflow-hidden group hover:translate-y-[-4px] transition-transform">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          <CardHeader className="pb-1 md:pb-2 pt-2 md:pt-4 px-3 md:px-6">
            <CardTitle className="text-[10px] md:text-xs font-medium text-muted-foreground">
              Score Transparence
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 md:pb-3 px-3 md:px-6">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <div className="text-lg md:text-2xl font-bold tabular-nums truncate">{kpis?.score_transparence || 0}/100</div>
                <Badge variant="outline" className="mt-0.5 md:mt-1 text-[9px] md:text-xs truncate">2e République</Badge>
              </div>
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
              </div>
            </div>
            <div className="mt-1.5 md:mt-2 h-0.5 md:h-1 bg-muted/50 rounded-full overflow-hidden">
              <div className="h-full w-[{kpis?.score_transparence || 0}%] bg-gradient-to-r from-[hsl(var(--accent-intel))] to-purple-500 rounded-full" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
            <div className="mt-1 md:mt-1.5 text-[9px] md:text-xs text-muted-foreground truncate">
              Indice national
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect border-none">
          <CardHeader className="pb-2 md:pb-6 pt-3 md:pt-6 px-3 md:px-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
              Évolution de la Lutte Anticorruption
            </CardTitle>
            <CardDescription className="text-xs md:text-sm mt-0.5 md:mt-1.5">
              Tendances nationales - Signalements vs Résolutions
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3 md:pb-6 px-3 md:px-6">
            <ResponsiveContainer width="100%" height={200} className="md:!h-[300px]">
              <LineChart data={evolutionMensuelle}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mois" tick={{ fontSize: 10 }} className="md:text-sm" />
                <YAxis tick={{ fontSize: 10 }} className="md:text-sm" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.5rem',
                    backdropFilter: 'blur(10px)',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} className="md:text-sm" />
                <Line
                  type="monotone"
                  dataKey="signalements"
                  stroke="hsl(var(--accent-intel))"
                  name="Signalements"
                  strokeWidth={2}
                  className="md:stroke-[3px]"
                />
                <Line
                  type="monotone"
                  dataKey="resolutions"
                  stroke="hsl(var(--accent-success))"
                  name="Cas résolus"
                  strokeWidth={2}
                  className="md:stroke-[3px]"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect border-none">
          <CardHeader className="pb-2 md:pb-6 pt-3 md:pt-6 px-3 md:px-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
              <Flag className="h-4 w-4 md:h-5 md:w-5" />
              Vision Gabon 2025 - Piliers Stratégiques
            </CardTitle>
            <CardDescription className="text-xs md:text-sm mt-0.5 md:mt-1.5">
              Performance par pilier de développement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visionData.map((pilier, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{pilier.pilier}</span>
                    <Badge variant={
                      pilier.priorite === 'Critique' ? 'destructive' :
                        pilier.priorite === 'Haute' ? 'default' :
                          'secondary'
                    }>
                      {pilier.priorite}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={(pilier.score / pilier.objectif) * 100}
                      className="h-2 flex-1"
                    />
                    <span className="text-sm font-medium min-w-[50px] text-right">
                      {pilier.score}/{pilier.objectif}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Budget alloué: {pilier.budget}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-warning))]/10 to-[hsl(var(--accent-warning))]/5 border-[hsl(var(--accent-warning))]/30">
        <AlertTriangle className="h-4 w-4 text-[hsl(var(--accent-warning))]" />
        <AlertTitle className="text-[hsl(var(--accent-warning))]">
          Attention Requise
        </AlertTitle>
        <AlertDescription className="text-muted-foreground">
          {kpis?.signalements_critiques || 0} cas critiques nécessitent une validation
          présidentielle immédiate. Consulter l'onglet "Validation" pour prendre les décisions.
          {isSubscribed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--accent-success))] animate-live-pulse"></div>
              <span className="text-sm">Notifications temps réel actives</span>
            </div>
          )}
        </AlertDescription>
      </Alert>

      <Card className="glass-effect border-none">
        <CardHeader className="pb-2 md:pb-6 pt-3 md:pt-6 px-3 md:px-6">
          <CardTitle className="flex items-center gap-1.5 md:gap-2 text-sm md:text-lg">
            <MapPin className="h-4 w-4 md:h-5 md:w-5" />
            Distribution Régionale
          </CardTitle>
          <CardDescription className="text-xs md:text-sm mt-0.5 md:mt-1.5">
            Performance par région
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-xs md:text-sm whitespace-nowrap">Région</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-xs md:text-sm whitespace-nowrap">Signalés</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-xs md:text-sm whitespace-nowrap">Résolus</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-xs md:text-sm whitespace-nowrap">Taux</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-xs md:text-sm whitespace-nowrap">Priorité</th>
                  </tr>
                </thead>
                <tbody>
                  {distributionRegionale.map((region, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-2 md:py-3 px-2 md:px-4 font-medium text-xs md:text-sm">{region.region}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center text-xs md:text-sm">{region.cas}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center text-xs md:text-sm">{region.resolus}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4">
                        <div className="flex items-center gap-2 justify-center">
                          <Progress value={region.taux} className="w-12 md:w-20 h-1.5 md:h-2" />
                          <span className="text-xs md:text-sm min-w-[30px] md:min-w-[35px]">{region.taux}%</span>
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                        <Badge variant={
                          region.priorite === 'Haute' ? 'destructive' :
                            region.priorite === 'Moyenne' ? 'default' :
                              'secondary'
                        } className="text-xs">
                          {region.priorite}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderValidation = () => (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
        <div>
          <h3 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">Cas Sensibles - Validation Présidentielle</h3>
          <p className="text-muted-foreground mt-0.5 md:mt-1 text-xs md:text-sm">
            Dossiers critiques nécessitant votre décision stratégique
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[180px] glass-effect border-none">
              <SelectValue placeholder="Toutes régions" />
            </SelectTrigger>
            <SelectContent className="glass-effect border-none">
              <SelectItem value="all">Toutes régions</SelectItem>
              <SelectItem value="estuaire">Estuaire</SelectItem>
              <SelectItem value="haut-ogooue">Haut-Ogooué</SelectItem>
              <SelectItem value="ogooue-maritime">Ogooué-Maritime</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {casSensibles.map((cas, idx) => (
        <Card key={idx} className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-warning))]/5 to-transparent relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-warning))] to-transparent" />
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="space-y-1 flex-1 min-w-[200px]">
                <CardTitle className="text-lg">{cas.title || cas.titre}</CardTitle>
                <CardDescription>Référence: {cas.id} • {new Date(cas.created_at).toLocaleDateString('fr-FR')}</CardDescription>
              </div>
              <Badge className={`text-sm ${cas.priority === 'critique' || cas.urgence === 'Critique' ? 'bg-[hsl(var(--accent-danger))]/20 text-[hsl(var(--accent-danger))]' :
                  cas.priority === 'haute' || cas.urgence === 'Haute' ? 'bg-[hsl(var(--accent-warning))]/20 text-[hsl(var(--accent-warning))]' :
                    'bg-muted/50 text-muted-foreground'
                }`}>
                {cas.urgence || cas.priority || 'Moyenne'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Montant impliqué</div>
                <div className="font-bold text-red-600">{cas.montant || 'N/A'}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Type</div>
                <div className="font-semibold">{cas.type}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Statut</div>
                <Badge variant="outline">{cas.status}</Badge>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Localisation</div>
                <div className="font-semibold text-xs">{cas.location}</div>
              </div>
            </div>

            <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-intel))]/10 to-transparent">
              <Brain className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
              <AlertDescription className="text-muted-foreground">
                <strong className="text-foreground">Analyse IA:</strong> Score de priorité {cas.ai_priority_score || 0}%.
                {cas.ai_analysis_summary || 'Analyse en cours...'}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 flex-wrap">
              <Button
                className="bg-[hsl(var(--accent-success))] hover:bg-[hsl(var(--accent-success))]/90 text-white"
                onClick={() => handleValiderCas(cas.id, 'approuver')}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver l'Action
              </Button>
              <Button
                variant="outline"
                className="glass-effect border-none"
                onClick={() => handleValiderCas(cas.id, 'enquete')}
                disabled={isLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Enquête Approfondie
              </Button>
              <Button
                variant="destructive"
                className="bg-[hsl(var(--accent-danger))] hover:bg-[hsl(var(--accent-danger))]/90"
                onClick={() => handleValiderCas(cas.id, 'rejeter')}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter le Dossier
              </Button>
              <Button
                variant="ghost"
                className="glass-effect border-none"
                onClick={() => handleGenererRapport('executif')}
              >
                <Download className="h-4 w-4 mr-2" />
                Rapport Détaillé
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {casSensibles.length === 0 && (
        <Card className="glass-effect border-none">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-[hsl(var(--accent-success))] opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucun cas sensible en attente</h3>
            <p className="text-muted-foreground">
              Tous les dossiers critiques ont été traités. Continuez la supervision via le dashboard.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSuiviEnquetes = () => (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
        <div>
          <h3 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">Suivi des Enquêtes Nationales</h3>
          <p className="text-muted-foreground mt-0.5 md:mt-1 text-xs md:text-sm">
            État d'avancement des investigations en cours
          </p>
        </div>
        <Button variant="outline" className="glass-effect border-none text-xs md:text-sm h-8 md:h-10 px-2 md:px-4" onClick={reloadData} disabled={isLoading}>
          <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <Card className="glass-effect border-none">
        <CardHeader>
          <CardTitle>Performance par Ministère</CardTitle>
          <CardDescription>
            Répartition des signalements et efficacité du traitement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Ministère/Secteur</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Signalements</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Cas Critiques</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Taux Résolution</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Responsable</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {performanceMinisteres.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {item.ministere}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline">{item.signalements}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={item.critiques > 20 ? 'destructive' : 'default'}>
                        {item.critiques}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <Progress value={item.taux} className="w-20 h-2" />
                        <span className="text-sm font-medium min-w-[35px]">{item.taux}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">{item.responsable}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Impact Économique de la Lutte Anticorruption
          </CardTitle>
          <CardDescription>
            Fonds détournés récupérés et réaffectés au budget de l'État
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evolutionMensuelle}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Legend />
              <Bar
                dataKey="budget"
                fill="hsl(var(--accent-success))"
                name="Fonds récupérés (M FCFA)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderGestionInstitutions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">Gestion Institutions</h3>
          <p className="text-muted-foreground mt-1">
            Supervision des agents sectoriels et performance
          </p>
        </div>
        <Button
          className="bg-[hsl(var(--accent-intel))] hover:bg-[hsl(var(--accent-intel))]/90 text-white"
          onClick={() => setIsNommerModalOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nommer Agent
        </Button>
      </div>

      {/* Barre de recherche intelligente */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche textuelle */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, secteur, email, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-effect border-none"
            />
          </div>

          {/* Filtre par rôle */}
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48 glass-effect border-none">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les agents</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre par organisation */}
          <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
            <SelectTrigger className="w-full sm:w-48 glass-effect border-none">
              <SelectValue placeholder="Filtrer par organisation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les organisations</SelectItem>
              {uniqueOrganizations.map(org => (
                <SelectItem key={org} value={org}>{org}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Statistiques de recherche */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              {filteredAgents.length} agent{filteredAgents.length > 1 ? 's' : ''} trouvé{filteredAgents.length > 1 ? 's' : ''}
              {searchQuery && ` pour "${searchQuery}"`}
            </span>
            {(searchQuery || selectedRole !== 'all' || selectedOrganization !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRole('all');
                  setSelectedOrganization('all');
                }}
                className="text-xs h-6 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Effacer filtres
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredAgents.length} Agent
            </Badge>
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Aucun agent trouvé
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? `Aucun agent trouvé pour "${searchQuery}". Essayez avec d'autres termes.`
              : "Aucun agent ne correspond aux filtres sélectionnés."
            }
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedRole('all');
              setSelectedOrganization('all');
            }}
            className="glass-effect border-none"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Effacer tous les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((admin, idx) => {
            const isInactive = (admin as any).inactive === true;
            return (
              <Card key={idx} className={`glass-effect border-none relative overflow-hidden ${admin.statut === 'Attention' ? 'bg-gradient-to-br from-[hsl(var(--accent-warning))]/5 to-transparent' : ''
                } ${isInactive ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                {admin.statut === 'Attention' && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-warning))] to-transparent" />
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{admin.nom}</CardTitle>
                      <CardDescription>{admin.secteur}</CardDescription>
                    </div>
                    <Badge className={`${admin.statut === 'Actif'
                        ? 'bg-[hsl(var(--accent-success))]/20 text-[hsl(var(--accent-success))]'
                        : 'bg-[hsl(var(--accent-danger))]/20 text-[hsl(var(--accent-danger))]'
                      }`}>
                      {admin.statut}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informations de contact */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{admin.phone}</span>
                    </div>
                  </div>

                  {/* Métriques de performance */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Cas traités</div>
                      <div className="text-2xl font-bold tabular-nums">{admin.casTraites || admin.cas_traites}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Taux succès</div>
                      <div className="text-2xl font-bold tabular-nums text-[hsl(var(--accent-success))]">{admin.taux || admin.taux_succes}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Délai moyen</div>
                      <div className="text-2xl font-bold tabular-nums text-[hsl(var(--accent-intel))]">{admin.delai || admin.delai_moyen_jours}j</div>
                    </div>
                  </div>

                  <Progress value={admin.taux || admin.taux_succes} className="h-2" />

                  {/* Rôle et organisation */}
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {admin.role === 'sub_admin' ? 'Sub-Admin' :
                        admin.role === 'agent' ? 'Agent' :
                          admin.role === 'user' ? 'Citoyen' : admin.role}
                    </Badge>
                    <span className="text-muted-foreground">{admin.organization}</span>
                  </div>

                  {/* Privilèges (pour les rôles admin/agent) */}
                  {admin.privileges && (admin.role === 'sub_admin' || admin.role === 'agent') && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Privilèges:</div>
                      <div className="flex flex-wrap gap-1">
                        {admin.privileges.slice(0, 2).map((privilege, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0.5">
                            {privilege}
                          </Badge>
                        ))}
                        {admin.privileges.length > 2 && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                            +{admin.privileges.length - 2} autres
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {admin.statut === 'Attention' && !isInactive && (
                    <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-warning))]/10 to-transparent">
                      <AlertTriangle className="h-4 w-4 text-[hsl(var(--accent-warning))]" />
                      <AlertDescription className="text-muted-foreground">
                        Performance en baisse. Délai de traitement supérieur à la norme nationale.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isInactive && (
                    <Alert className="glass-effect border-none bg-muted/30">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <AlertDescription className="text-muted-foreground text-xs">
                        Compte non actif - En attente de configuration
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full glass-effect border-none bg-[hsl(var(--accent-intel))]/5 hover:bg-[hsl(var(--accent-intel))]/15"
                      onClick={() => handleVoirDetails(admin)}
                      disabled={isLoadingAction || isInactive}
                    >
                      <Eye className="h-4 w-4 mr-2 text-[hsl(var(--accent-intel))]" />
                      Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full glass-effect border-none bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Détecter si on est sur mobile
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                        if (isMobile) {
                          // Sur mobile, ouvrir directement l'interface iAsted en mode texte
                          const event = new CustomEvent('iasted:open-text-mode', {
                            detail: {
                              context: 'institution-card',
                              admin,
                              autoMessage: `Excellence, je suis iAsted. Je vais analyser les données de ${admin.organization || 'cette institution'}. Comment puis-je vous aider ?`
                            }
                          });
                          window.dispatchEvent(event);
                        } else {
                          // Sur desktop, utiliser le mode vocal comme avant
                          const event = new CustomEvent('iasted:open-voice-report', {
                            detail: { context: 'institution-card', admin }
                          });
                          window.dispatchEvent(event);
                        }
                      }}
                      title="Rapport iAsted (vocal)"
                      disabled={isInactive}
                    >
                      <Mic className="h-4 w-4 mr-2 text-purple-600" />
                      iAsted
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full glass-effect border-none bg-[hsl(var(--accent-success))]/5 hover:bg-[hsl(var(--accent-success))]/15"
                      onClick={() => handleGenererRapportAdmin(admin)}
                      disabled={isLoadingAction || isInactive}
                    >
                      {isLoadingAction ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin text-[hsl(var(--accent-success))]" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2 text-[hsl(var(--accent-success))]" />
                      )}
                      Rapport
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-intel))]/10 to-transparent">
        <Users className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
        <AlertTitle className="text-foreground">
          Coordination Nationale
        </AlertTitle>
        <AlertDescription className="text-muted-foreground">
          {sousAdmins.length} comptes actifs coordonnent les opérations
          sur l'ensemble du territoire national.
          Performance globale: {Math.round(sousAdmins.reduce((acc, a) => acc + (a.taux || a.taux_succes), 0) / sousAdmins.length)}%
          <br />
          <span className="text-xs mt-1 block">
            • {sousAdmins.filter(a => a.role === 'sub_admin').length} Sub-Admin • {sousAdmins.filter(a => a.role === 'agent').length} Agent • {sousAdmins.filter(a => a.role === 'user').length} Citoyen
          </span>
        </AlertDescription>
      </Alert>

      {/* Modal Nommer Sous-Admin */}
      <Dialog open={isNommerModalOpen} onOpenChange={setIsNommerModalOpen}>
        <DialogContent className="glass-effect border-none max-w-2xl h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[hsl(var(--accent-intel))]" />
              Nommer un Sous-Admin ou Agent
            </DialogTitle>
            <DialogDescription>
              Créez un nouveau compte pour coordonner les opérations sectorielles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom complet *</Label>
                <Input
                  id="nom"
                  placeholder="Nom et prénom"
                  value={nomForm.nom}
                  onChange={(e) => setNomForm({ ...nomForm, nom: e.target.value })}
                  className="glass-effect border-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select value={nomForm.role} onValueChange={(value) => setNomForm({ ...nomForm, role: value as 'sub_admin' | 'agent' })}>
                  <SelectTrigger className="glass-effect border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sub_admin">Sous-Administrateur</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ndjobi.com"
                  value={nomForm.email}
                  onChange={(e) => setNomForm({ ...nomForm, email: e.target.value })}
                  className="glass-effect border-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+24177888XXX"
                  value={nomForm.phone}
                  onChange={(e) => setNomForm({ ...nomForm, phone: e.target.value })}
                  className="glass-effect border-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organisation *</Label>
              <Input
                id="organization"
                placeholder="Ministère, Direction, Agence..."
                value={nomForm.organization}
                onChange={(e) => setNomForm({ ...nomForm, organization: e.target.value })}
                className="glass-effect border-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secteur">Secteur de spécialisation *</Label>
              <Textarea
                id="secteur"
                placeholder="Décrivez le secteur d'intervention..."
                value={nomForm.secteur}
                onChange={(e) => setNomForm({ ...nomForm, secteur: e.target.value })}
                className="glass-effect border-none min-h-[100px]"
              />
            </div>

            <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-intel))]/10 to-transparent">
              <Shield className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
              <AlertDescription className="text-xs text-muted-foreground">
                Le compte sera créé avec un code PIN temporaire qui devra être modifié lors de la première connexion.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="mt-auto sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
            <Button
              variant="outline"
              onClick={() => setIsNommerModalOpen(false)}
              disabled={isLoadingAction}
              className="glass-effect border-none"
            >
              Annuler
            </Button>
            <Button
              onClick={handleNommerSousAdmin}
              disabled={isLoadingAction}
              className="bg-[hsl(var(--accent-intel))] hover:bg-[hsl(var(--accent-intel))]/90 text-white"
            >
              {isLoadingAction ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer le compte
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Détails Admin */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="glass-effect border-none max-w-3xl h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
          <DialogHeader className="border-b border-muted/10 pb-4">
            {(selectedAdmin as any)?.type_service === 'securite_nationale' ? (
              // **EN-TÊTE SERVICES SPÉCIAUX / SÉCURITÉ NATIONALE**
              <>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-red-600/90 text-white text-xs font-bold px-3 py-1">
                    🛡️ {(selectedAdmin as any)?.classification || 'CONFIDENTIEL DÉFENSE'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Service Spécial
                  </Badge>
                </div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Fiche Sécurité Nationale - {selectedAdmin?.nom}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-sm mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">{selectedAdmin?.organization}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Rapport renseignement stratégique et analyse menaces - {new Date().toLocaleDateString('fr-FR')}
                  </div>
                </DialogDescription>
              </>
            ) : (selectedAdmin as any)?.type_compte === 'identifie' ? (
              // **EN-TÊTE CITOYEN IDENTIFIÉ**
              <>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-[hsl(var(--accent-success))]/90 text-white text-xs font-bold px-3 py-1">
                    👤 Citoyen Identifié
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Compte vérifié
                  </Badge>
                </div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-success))]/20 to-[hsl(var(--accent-intel))]/20">
                    <Users className="h-5 w-5 text-[hsl(var(--accent-success))]" />
                  </div>
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Fiche Citoyen - {(selectedAdmin as any)?.identite?.nom_complet || selectedAdmin?.nom}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-sm mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
                    <span>{selectedAdmin?.email}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Compte citoyen avec signalements non anonymes
                  </div>
                </DialogDescription>
              </>
            ) : (selectedAdmin as any)?.type_compte === 'anonyme' ? (
              // **EN-TÊTE SIGNALEMENTS ANONYMES**
              <>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-purple-600/90 text-white text-xs font-bold px-3 py-1">
                    🔒 Signalements Anonymes
                  </Badge>
                  <Badge variant="outline" className="text-xs text-red-600 border-red-600/30">
                    Protection XR-7
                  </Badge>
                </div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <AlertCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Signalements "Taper le Ndjobi" - {(selectedAdmin as any)?.numero_anonyme}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-sm mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold">Protection identité totale</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Révélation autorisée uniquement via Protocole XR-7 (décision présidentielle)
                  </div>
                </DialogDescription>
              </>
            ) : (
              // **EN-TÊTE STANDARD (Agents)**
              <>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-intel))]/20 to-[hsl(var(--accent-success))]/20">
                    <Eye className="h-5 w-5 text-[hsl(var(--accent-intel))]" />
                  </div>
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Détails - {selectedAdmin?.nom}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-sm mt-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[hsl(var(--accent-success))]" />
                  {selectedAdmin?.organization} - Informations détaillées et historique de performance
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          {selectedAdmin && (
            <div className="space-y-6 py-4 flex-1 overflow-y-auto pr-2">
              {/* INFORMATIONS IDENTITÉ CITOYEN (si citoyen identifié) */}
              {(selectedAdmin as any)?.type_compte === 'identifie' && (selectedAdmin as any)?.identite && (
                <Card className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-success))]/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-[hsl(var(--accent-success))]" />
                      Informations Personnelles
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Identité vérifiée - Compte citoyen non anonyme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Nom complet</div>
                          <div className="font-semibold text-foreground">{(selectedAdmin as any).identite.nom_complet}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Date de naissance</div>
                          <div className="font-medium text-foreground">{new Date((selectedAdmin as any).identite.date_naissance).toLocaleDateString('fr-FR')}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Lieu de naissance</div>
                          <div className="font-medium text-foreground">{(selectedAdmin as any).identite.lieu_naissance}</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Profession</div>
                          <div className="font-medium text-foreground">{(selectedAdmin as any).identite.profession}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Quartier/Zone</div>
                          <div className="font-medium text-foreground">{(selectedAdmin as any).identite.quartier}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Inscription NDJOBI</div>
                          <div className="font-medium text-foreground">{new Date((selectedAdmin as any).identite.date_inscription).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Statistiques signalements */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-muted/20">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[hsl(var(--accent-intel))]">{(selectedAdmin as any).identite.signalements_total}</div>
                        <div className="text-xs text-muted-foreground">Total signalements</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[hsl(var(--accent-warning))]">{(selectedAdmin as any).identite.signalements_en_cours}</div>
                        <div className="text-xs text-muted-foreground">En cours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[hsl(var(--accent-success))]">{(selectedAdmin as any).identite.signalements_resolus}</div>
                        <div className="text-xs text-muted-foreground">Résolus</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AVERTISSEMENT ANONYMAT (si signalements anonymes) */}
              {(selectedAdmin as any)?.type_compte === 'anonyme' && (
                <Alert className="glass-effect border-none bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-600 font-semibold">Protection Identité - Protocole XR-7</AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground space-y-2">
                    <p>{(selectedAdmin as any)?.avertissement}</p>
                    <p className="font-medium text-foreground/80">
                      Méthode de contact: {(selectedAdmin as any)?.methode_contact}
                    </p>
                    <p className="text-[10px] text-purple-600">
                      ⚠️ Métadonnées disponibles (IP, géolocalisation, analyse comportementale) accessibles uniquement via activation Protocole XR-7 avec décision présidentielle explicite.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Analyse et recommandations présidentielles - EN HAUT (sauf pour citoyens) */}
              {!((selectedAdmin as any)?.type_compte === 'identifie' || (selectedAdmin as any)?.type_compte === 'anonyme') && (
                <Card className="glass-effect border-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Crown className="h-4 w-4 text-[hsl(var(--accent-warning))]" />
                      Analyse et recommandations présidentielles
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Évaluation stratégique et recommandations pour décision présidentielle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Problématiques identifiées / Menaces Stratégiques */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(selectedAdmin as any)?.type_service === 'securite_nationale' ? (
                            <>
                              <Shield className="h-4 w-4 text-red-600" />
                              <div className="text-sm font-semibold text-foreground">Menaces Stratégiques</div>
                              <Badge variant="outline" className="text-xs bg-red-600/10 text-red-600 border-red-600/30">
                                {adminProblematiques.length} menace{adminProblematiques.length > 1 ? 's' : ''}
                              </Badge>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-[hsl(var(--accent-warning))]" />
                              <div className="text-sm font-semibold text-foreground">Problématiques identifiées</div>
                              <Badge variant="outline" className="text-xs">
                                {adminProblematiques.length} problème{adminProblematiques.length > 1 ? 's' : ''}
                              </Badge>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-foreground/70">
                          Impact financier total: {adminProblematiques.reduce((sum, p) => {
                            const montantStr = String(p.montant || '0');
                            const montant = parseInt(montantStr.replace(/[^\d]/g, ''));
                            return sum + montant;
                          }, 0).toLocaleString()} FCFA
                        </div>
                      </div>

                      <div className="space-y-3">
                        {adminProblematiques.map((problematique: Problematique, index: number) => (
                          <div key={problematique.id} className="border border-muted/20 rounded-lg p-4 space-y-3 bg-gradient-to-r from-muted/10 to-transparent">
                            {/* En-tête avec métadonnées */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(var(--accent-warning))]/20 to-[hsl(var(--accent-warning))]/10 flex items-center justify-center">
                                  <span className="text-xs font-bold text-[hsl(var(--accent-warning))]">{index + 1}</span>
                                </div>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {problematique.id}
                                </Badge>
                                <Badge className={`text-xs font-medium ${problematique.impact === 'Critique' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                    problematique.impact === 'Élevé' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                      'bg-blue-500/20 text-blue-500 border-blue-500/30'
                                  }`}>
                                  {problematique.impact}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {problematique.secteur}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select defaultValue={problematique.classification}>
                                  <SelectTrigger className="w-28 h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Résolu">✅ Résolu</SelectItem>
                                    <SelectItem value="Pas urgent">⏳ Pas urgent</SelectItem>
                                    <SelectItem value="Supprimer">🗑️ Supprimer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Titre et description détaillée */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold text-foreground">{problematique.titre}</div>
                                {(problematique as any).niveauMenace && (
                                  <Badge className="bg-red-600/90 text-white text-[10px] px-2 py-0.5">
                                    {(problematique as any).niveauMenace}
                                  </Badge>
                                )}
                                {(problematique as any).classification && (selectedAdmin as any)?.type_service === 'securite_nationale' && (
                                  <Badge variant="outline" className="text-[10px] text-red-600 border-red-600/30">
                                    {(problematique as any).classification}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{problematique.description}</div>
                            </div>

                            {/* Métriques détaillées */}
                            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/20">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-3 w-3 text-[hsl(var(--accent-success))]" />
                                  <span className="text-xs text-foreground/70">
                                    {(selectedAdmin as any)?.type_service === 'securite_nationale' ? 'Impact / Coût' : 'Impact financier'}
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-[hsl(var(--accent-success))]">
                                  {problematique.montant}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-[hsl(var(--accent-intel))]" />
                                  <span className="text-xs text-foreground/70">Localisation</span>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {problematique.localisation || 'National'}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-[hsl(var(--accent-warning))]" />
                                  <span className="text-xs text-foreground/70">
                                    {(selectedAdmin as any)?.type_service === 'securite_nationale' ? 'Détection' : 'Détecté le'}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {problematique.dateCreation || problematique.dateDetection}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {(selectedAdmin as any)?.type_service === 'securite_nationale' ? (
                                    <Shield className="h-3 w-3 text-red-600" />
                                  ) : (
                                    <TrendingUp className="h-3 w-3 text-[hsl(var(--accent-warning))]" />
                                  )}
                                  <span className="text-xs text-foreground/70">
                                    {(selectedAdmin as any)?.type_service === 'securite_nationale' ? 'Menace' : 'Tendance'}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {(problematique as any).menace || problematique.tendance || 'En aggravation'}
                                </div>
                              </div>
                            </div>

                            {/* Plan d'action (pour services spéciaux) ou Actions recommandées */}
                            {(selectedAdmin as any)?.type_service === 'securite_nationale' && (problematique as any).planAction ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Target className="h-3 w-3 text-red-600" />
                                  <span className="text-xs font-medium text-foreground">Plan d'action stratégique</span>
                                </div>
                                <div className="text-xs text-foreground/70 pl-5 whitespace-pre-wrap bg-muted/30 p-3 rounded">
                                  {(problematique as any).planAction}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Target className="h-3 w-3 text-[hsl(var(--accent-intel))]" />
                                  <span className="text-xs font-medium text-foreground">Actions recommandées</span>
                                </div>
                                <div className="text-xs text-foreground/70 pl-5">
                                  {problematique.actionsRecommandees || 'Intervention immédiate requise. Coordination avec les services compétents pour mise en place d\'un plan d\'action d\'urgence.'}
                                </div>
                              </div>
                            )}

                            {/* KPIs (pour services spéciaux) */}
                            {(selectedAdmin as any)?.type_service === 'securite_nationale' && (problematique as any).kpis && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-3 w-3 text-[hsl(var(--accent-intel))]" />
                                  <span className="text-xs font-medium text-foreground">Indicateurs de performance (KPIs)</span>
                                </div>
                                <div className="space-y-1 pl-5">
                                  {(problematique as any).kpis.map((kpi: any, kpiIdx: number) => (
                                    <div key={kpiIdx} className="flex items-center justify-between text-[10px] bg-muted/20 p-2 rounded">
                                      <span className="text-foreground/70">{kpi.indicateur}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Actuel: <span className="font-semibold text-foreground">{kpi.actuel}</span></span>
                                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[hsl(var(--accent-success))]">Cible: <span className="font-semibold">{kpi.cible}</span></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Statut et suivi */}
                            <div className="flex items-center justify-between pt-2 border-t border-muted/20">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${problematique.impact === 'Critique' ? 'bg-red-500' :
                                    problematique.impact === 'Élevé' ? 'bg-orange-500' :
                                      'bg-blue-500'
                                  }`}></div>
                                <span className="text-xs text-foreground/70">
                                  Statut: {problematique.statut || 'En cours d\'analyse'}
                                </span>
                              </div>
                              <div className="text-xs text-foreground/60">
                                Dernière mise à jour: {problematique.derniereMAJ || 'Aujourd\'hui'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Opinion publique */}
                    {adminOpinionPublique && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
                            <div className="text-sm font-semibold text-foreground">Opinion publique</div>
                            <Badge variant="outline" className="text-xs">
                              Analyse {adminOpinionPublique.dateAnalyse}
                            </Badge>
                          </div>
                          <div className={`text-xs font-medium px-2 py-1 rounded ${adminOpinionPublique.sentimentGeneral === 'Négatif' ? 'bg-red-500/20 text-red-500' :
                              adminOpinionPublique.sentimentGeneral === 'Neutre' ? 'bg-gray-500/20 text-gray-500' :
                                'bg-green-500/20 text-green-500'
                            }`}>
                            Sentiment: {adminOpinionPublique.sentimentGeneral}
                          </div>
                        </div>

                        {/* Indicateurs clés */}
                        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-intel))]/10 to-transparent border border-muted/10">
                          <div className="text-center space-y-1">
                            <div className="text-xs text-foreground/70">Score de confiance</div>
                            <div className={`text-2xl font-bold ${adminOpinionPublique.scoreConfiance < 40 ? 'text-red-500' :
                                adminOpinionPublique.scoreConfiance < 60 ? 'text-orange-500' :
                                  'text-green-500'
                              }`}>{adminOpinionPublique.scoreConfiance}%</div>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="text-xs text-foreground/70">Taux de satisfaction</div>
                            <div className={`text-2xl font-bold ${(Array.isArray(adminOpinionPublique.tauxSatisfaction) ? adminOpinionPublique.tauxSatisfaction[0] : adminOpinionPublique.tauxSatisfaction) < 40 ? 'text-red-500' :
                                (Array.isArray(adminOpinionPublique.tauxSatisfaction) ? adminOpinionPublique.tauxSatisfaction[0] : adminOpinionPublique.tauxSatisfaction) < 60 ? 'text-orange-500' :
                                  'text-green-500'
                              }`}>{Array.isArray(adminOpinionPublique.tauxSatisfaction) ? adminOpinionPublique.tauxSatisfaction[0] : adminOpinionPublique.tauxSatisfaction}%</div>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="text-xs text-foreground/70">Risque social</div>
                            <Badge className={`text-xs font-medium ${adminOpinionPublique.risqueSocial === 'Élevé' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                adminOpinionPublique.risqueSocial === 'Moyen' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                  'bg-blue-500/20 text-blue-500 border-blue-500/30'
                              }`}>
                              {adminOpinionPublique.risqueSocial}
                            </Badge>
                          </div>
                        </div>

                        {/* Principaux griefs */}
                        <div className="space-y-3">
                          <div className="text-xs font-semibold text-foreground">Principaux griefs de la population</div>
                          {adminOpinionPublique.principauxGriefs.map((grief: Grief) => (
                            <div key={grief.id} className="border border-muted/20 rounded-lg p-4 space-y-3 bg-gradient-to-r from-muted/10 to-transparent">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs font-mono">{grief.id}</Badge>
                                  <Badge className={`text-xs font-medium ${grief.intensite === 'Très élevée' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                      grief.intensite === 'Élevée' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                        'bg-blue-500/20 text-blue-500 border-blue-500/30'
                                    }`}>
                                    {grief.intensite}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress value={grief.pourcentage} className="w-24 h-2" />
                                  <span className="text-xs font-medium text-foreground">{grief.pourcentage}%</span>
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-foreground">{grief.sujet}</div>
                              <div className="text-xs text-foreground/80 leading-relaxed">{grief.description}</div>
                            </div>
                          ))}
                        </div>

                        {/* Impact politique */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Flag className="h-3 w-3 text-[hsl(var(--accent-warning))]" />
                            <span className="text-xs font-semibold text-foreground">Impact politique</span>
                          </div>
                          <div className="text-xs text-foreground/80 leading-relaxed p-3 rounded-lg bg-gradient-to-r from-[hsl(var(--accent-warning))]/10 to-transparent border border-muted/10">
                            {adminOpinionPublique.impactPolitique}
                          </div>
                        </div>

                        {/* Recommandations communication */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3 text-[hsl(var(--accent-success))]" />
                            <span className="text-xs font-semibold text-foreground">Recommandations communication</span>
                          </div>
                          <div className="space-y-1 pl-3">
                            {adminOpinionPublique.recommandationsCommunication.map((rec: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-foreground/70">
                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-success))] mt-1.5 flex-shrink-0"></div>
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions correctives urgentes */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-[hsl(var(--accent-warning))]" />
                            <span className="text-xs font-semibold text-foreground">Actions correctives urgentes</span>
                          </div>
                          <div className="space-y-1 pl-3">
                            {adminOpinionPublique.actionsCorrectivesUrgentes.map((action: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-foreground/70">
                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-warning))] mt-1.5 flex-shrink-0"></div>
                                <span>{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sources et suivi */}
                        <div className="flex items-center justify-between pt-3 border-t border-muted/10">
                          <div className="text-xs text-foreground/60">
                            Tendance: <span className="font-medium text-foreground/80">{adminOpinionPublique.tendanceEvolution}</span>
                          </div>
                          <div className="text-xs text-foreground/60">
                            Prochain sondage: <span className="font-medium text-foreground/80">{adminOpinionPublique.prochaineSondage}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommandations présidentielles */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-[hsl(var(--accent-warning))]" />
                          <div className="text-sm font-semibold text-foreground">Recommandations présidentielles</div>
                          <Badge variant="outline" className="text-xs">
                            {adminRecommandations.length} recommandation{adminRecommandations.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="text-xs text-foreground/70">
                          Priorité critique: {adminRecommandations.filter(r => r.priorite === 'Critique').length}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {adminRecommandations.map((recommandation: Recommandation, index: number) => (
                          <div key={recommandation.id} className="border border-muted/20 rounded-lg p-4 space-y-3 bg-gradient-to-r from-[hsl(var(--accent-warning))]/5 to-transparent">
                            {/* En-tête avec métadonnées */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(var(--accent-warning))]/20 to-[hsl(var(--accent-warning))]/10 flex items-center justify-center">
                                  <Crown className="h-3 w-3 text-[hsl(var(--accent-warning))]" />
                                </div>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {recommandation.id}
                                </Badge>
                                <Badge className={`text-xs font-medium ${recommandation.priorite === 'Critique' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                    recommandation.priorite === 'Haute' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                      'bg-blue-500/20 text-blue-500 border-blue-500/30'
                                  }`}>
                                  {recommandation.priorite}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {recommandation.categorie || 'Stratégique'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select defaultValue={recommandation.classification}>
                                  <SelectTrigger className="w-28 h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Résolu">✅ Résolu</SelectItem>
                                    <SelectItem value="Pas urgent">⏳ Pas urgent</SelectItem>
                                    <SelectItem value="Supprimer">🗑️ Supprimer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Titre et description détaillée */}
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-foreground">{recommandation.titre}</div>
                              <div className="text-xs text-foreground/80 leading-relaxed">{recommandation.description}</div>
                            </div>

                            {/* Justification et contexte */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-[hsl(var(--accent-intel))]" />
                                <span className="text-xs font-medium text-foreground">Justification présidentielle</span>
                              </div>
                              <div className="text-xs text-foreground/70 pl-5 p-2 rounded bg-muted/20">
                                {recommandation.justification || 'Cette recommandation s\'inscrit dans le cadre de la politique nationale de modernisation et d\'efficacité administrative. Elle vise à renforcer la transparence et l\'efficacité des services publics.'}
                              </div>
                            </div>

                            {/* Métriques et délais */}
                            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/20">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Target className="h-3 w-3 text-[hsl(var(--accent-success))]" />
                                  <span className="text-xs text-foreground/70">Impact attendu</span>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {recommandation.impact}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-[hsl(var(--accent-warning))]" />
                                  <span className="text-xs text-foreground/70">Délai d'exécution</span>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {recommandation.delai}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-3 w-3 text-[hsl(var(--accent-success))]" />
                                  <span className="text-xs text-foreground/70">Budget requis</span>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {recommandation.budget || 'À définir'}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3 text-[hsl(var(--accent-intel))]" />
                                  <span className="text-xs text-foreground/70">Services concernés</span>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                  {recommandation.services || 'Multi-services'}
                                </div>
                              </div>
                            </div>

                            {/* Plan d'action détaillé */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckSquare className="h-3 w-3 text-[hsl(var(--accent-success))]" />
                                <span className="text-xs font-medium text-foreground">Plan d'action</span>
                              </div>
                              <div className="space-y-1 pl-5">
                                {recommandation.planAction ? (
                                  recommandation.planAction.map((action: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-foreground/70">
                                      <div className="w-1 h-1 rounded-full bg-[hsl(var(--accent-success))] mt-2 flex-shrink-0"></div>
                                      <span>{action}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-foreground/70 pl-2">
                                    • Mise en place d'un comité de pilotage<br />
                                    • Définition des objectifs et indicateurs<br />
                                    • Allocation des ressources nécessaires<br />
                                    • Suivi et évaluation régulière
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Risques et mitigation */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3 text-[hsl(var(--accent-warning))]" />
                                <span className="text-xs font-medium text-foreground">Risques identifiés</span>
                              </div>
                              <div className="text-xs text-foreground/70 pl-5">
                                {recommandation.risques || 'Résistance au changement, contraintes budgétaires, délais d\'exécution. Mitigation: communication renforcée, formation des équipes, suivi rapproché.'}
                              </div>
                            </div>

                            {/* Statut et suivi */}
                            <div className="flex items-center justify-between pt-2 border-t border-muted/20">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${recommandation.priorite === 'Critique' ? 'bg-red-500' :
                                    recommandation.priorite === 'Haute' ? 'bg-orange-500' :
                                      'bg-blue-500'
                                  }`}></div>
                                <span className="text-xs text-foreground/70">
                                  Statut: {recommandation.statut || 'En attente de validation'}
                                </span>
                              </div>
                              <div className="text-xs text-foreground/60">
                                Prochaine échéance: {recommandation.prochaineEcheance || 'Sous 30 jours'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Résumé exécutif */}
                    <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-warning))]/10 to-transparent">
                      <AlertTriangle className="h-4 w-4 text-[hsl(var(--accent-warning))]" />
                      <AlertTitle className="text-[hsl(var(--accent-warning))] text-xs">Résumé exécutif</AlertTitle>
                      <AlertDescription className="text-xs text-muted-foreground">
                        {adminProblematiques.length} problématique{adminProblematiques.length > 1 ? 's' : ''} identifiée{adminProblematiques.length > 1 ? 's' : ''}
                        avec {adminRecommandations.length} recommandation{adminRecommandations.length > 1 ? 's' : ''} stratégique{adminRecommandations.length > 1 ? 's' : ''}.
                        Impact financier total: {adminProblematiques.reduce((sum, p) => {
                          const montantStr = String(p.montant || '0');
                          const montant = parseInt(montantStr.replace(/[^\d]/g, ''));
                          return sum + montant;
                        }, 0).toLocaleString()} FCFA.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {/* Informations principales */}
              {!((selectedAdmin as any)?.type_compte === 'identifie' || (selectedAdmin as any)?.type_compte === 'anonyme') && (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="glass-effect border-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedAdmin.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedAdmin.phone}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Organisation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Rôle:</strong> {selectedAdmin.role === 'sub_admin' ? 'Sub-Admin' : selectedAdmin.role === 'agent' ? 'Agent' : 'Citoyen'}</div>
                      <div><strong>Secteur:</strong> {selectedAdmin.organization}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Métriques de performance */}
              {!((selectedAdmin as any)?.type_compte === 'identifie' || (selectedAdmin as any)?.type_compte === 'anonyme') && (
                <Card className="glass-effect border-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[hsl(var(--accent-intel))]">
                          {selectedAdmin.cas_traites || selectedAdmin.casTraites}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Cas traités</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[hsl(var(--accent-success))]">
                          {selectedAdmin.taux_succes || selectedAdmin.taux}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Taux de succès</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[hsl(var(--accent-warning))]">
                          {selectedAdmin.delai_moyen_jours || selectedAdmin.delai}j
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Délai moyen</div>
                      </div>
                    </div>
                    <Progress value={selectedAdmin.taux_succes || selectedAdmin.taux} className="h-2 mt-4" />
                  </CardContent>
                </Card>
              )}

              {/* Privilèges */}
              {!((selectedAdmin as any)?.type_compte === 'anonyme') && selectedAdmin.privileges && (
                <Card className="glass-effect border-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Privilèges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedAdmin.privileges.map((privilege: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {privilege}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cas en cours / Opérations sensibles */}
              {adminCases.length > 0 && (
                <Card className="glass-effect border-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {(selectedAdmin as any)?.type_service === 'securite_nationale' ? (
                        <>
                          <Shield className="h-4 w-4 text-red-600" />
                          Opérations sensibles en cours
                        </>
                      ) : (selectedAdmin as any)?.type_compte === 'anonyme' ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-purple-600" />
                          Dénonciations Anonymes "Taper le Ndjobi"
                        </>
                      ) : (selectedAdmin as any)?.type_compte === 'identifie' ? (
                        <>
                          <FileText className="h-4 w-4 text-[hsl(var(--accent-success))]" />
                          Mes Signalements Non-Anonymes
                        </>
                      ) : selectedAdmin.nom === 'Agent Pêche' ? (
                        <>
                          <Package className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
                          Dossier Pêche-Gab - Signalements critiques
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
                          Cas en cours
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {(selectedAdmin as any)?.type_service === 'securite_nationale'
                        ? `${(selectedAdmin as any).classification} - Dossiers actifs et surveillance`
                        : (selectedAdmin as any)?.type_compte === 'anonyme'
                          ? `${adminCases.length} dénonciations anonymes via SMS/WhatsApp - Identité protégée par XR-7`
                          : (selectedAdmin as any)?.type_compte === 'identifie'
                            ? `${adminCases.length} signalements déposés par ce citoyen (identité révélée)`
                            : selectedAdmin.nom === 'Agent Pêche'
                              ? 'Enquêtes en cours sur les activités de pêche illégales et détournements de fonds'
                              : 'Enquêtes et dossiers en cours de traitement'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {adminCases.slice(0, 3).map((cas: CaseData) => (
                      <div key={cas.id} className="border border-muted/20 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {cas.id}
                            </Badge>
                            <Badge className={`text-xs font-medium ${cas.priorite === 'Critique' || cas.priorite === 'Très élevée' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                cas.priorite === 'Haute' || cas.priorite === 'Élevée' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                  'bg-blue-500/20 text-blue-500 border-blue-500/30'
                              }`}>
                              {cas.priorite}
                            </Badge>
                            {(selectedAdmin as any)?.type_service === 'securite_nationale' && (cas as any).classification && (
                              <Badge className="bg-red-600/90 text-white text-[10px] px-2 py-0.5">
                                {(cas as any).classification}
                              </Badge>
                            )}
                          </div>
                          <Badge className={`text-xs font-medium ${cas.statut.includes('cours') || cas.statut.includes('active') ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                              cas.statut.includes('Résolu') || cas.statut.includes('terminée') || cas.statut.includes('réussie') ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                                'bg-gray-500/20 text-gray-500 border-gray-500/30'
                            }`}>
                            {cas.statut}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-foreground">{cas.titre}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">{cas.description}</div>

                          {/* Champs spécifiques services spéciaux */}
                          {(selectedAdmin as any)?.type_service === 'securite_nationale' && (
                            <div className="space-y-2 mt-3 pt-3 border-t border-muted/20">
                              {(cas as any).menace && (
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3 text-red-600" />
                                  <span className="text-xs font-medium text-red-600">Menace: {(cas as any).menace}</span>
                                </div>
                              )}
                              {(cas as any).sourcesRenseignement && (
                                <div className="flex items-start gap-2">
                                  <Brain className="h-3 w-3 text-[hsl(var(--accent-intel))] mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-[10px] text-muted-foreground">Sources: </span>
                                    <span className="text-[10px] text-foreground/80">{(cas as any).sourcesRenseignement}</span>
                                  </div>
                                </div>
                              )}
                              {(cas as any).coordination && (
                                <div className="flex items-start gap-2">
                                  <Users className="h-3 w-3 text-[hsl(var(--accent-success))] mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-[10px] text-muted-foreground">Coordination: </span>
                                    <span className="text-[10px] text-foreground/80">{(cas as any).coordination}</span>
                                  </div>
                                </div>
                              )}
                              {(cas as any).prochaineEtape && (
                                <div className="flex items-start gap-2">
                                  <ChevronRight className="h-3 w-3 text-[hsl(var(--accent-warning))] mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-[10px] text-muted-foreground">Prochaine étape: </span>
                                    <span className="text-[10px] font-medium text-foreground/80">{(cas as any).prochaineEtape}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Champs spécifiques signalements anonymes */}
                          {(selectedAdmin as any)?.type_compte === 'anonyme' && (
                            <div className="space-y-2 mt-3 pt-3 border-t border-purple-500/20 bg-purple-500/5 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-3 w-3 text-purple-600" />
                                <span className="text-xs font-semibold text-purple-600">Protection Anonymat - XR-7</span>
                              </div>
                              {(cas as any).auteur && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3 text-purple-600" />
                                  <span className="text-xs font-medium">Auteur: <span className="text-purple-600">{(cas as any).auteur}</span></span>
                                </div>
                              )}
                              {(cas as any).anonymat && (
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-3 w-3 text-purple-600" />
                                  <span className="text-xs">Anonymat: <span className="font-semibold text-purple-600">{(cas as any).anonymat}</span></span>
                                </div>
                              )}
                              {(cas as any).numero_anonyme && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-600/30">
                                    N° Anonyme: {(cas as any).numero_anonyme}
                                  </Badge>
                                </div>
                              )}
                              {(cas as any).methode && (
                                <div className="flex items-start gap-2">
                                  <Phone className="h-3 w-3 text-purple-600 mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-[10px] text-muted-foreground">Méthode: </span>
                                    <span className="text-[10px] text-foreground/80">{(cas as any).methode}</span>
                                  </div>
                                </div>
                              )}
                              {(cas as any).metadata_xr7 && (
                                <div className="flex items-start gap-2">
                                  <Zap className="h-3 w-3 text-red-600 mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-[10px] text-muted-foreground">Métadonnées XR-7: </span>
                                    <span className="text-[10px] font-medium text-red-600">{(cas as any).metadata_xr7}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Informations auteur pour citoyens identifiés */}
                          {(selectedAdmin as any)?.type_compte === 'identifie' && (cas as any).auteur && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-muted/20">
                              <Users className="h-3 w-3 text-[hsl(var(--accent-success))]" />
                              <span className="text-xs">Déposé par: <span className="font-semibold text-foreground">{(cas as any).auteur}</span></span>
                              <Badge variant="outline" className="text-[10px]">
                                {(cas as any).anonymat || 'Identité révélée'}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="font-medium text-muted-foreground">Montant concerné</div>
                            <div className="text-[hsl(var(--accent-success))] font-semibold text-sm">
                              {cas.montant}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium text-muted-foreground">Zone géographique</div>
                            <div className="text-foreground font-medium">{cas.localisation}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="font-medium text-muted-foreground">Secteur d'activité</div>
                            <div className="text-foreground">{cas.secteur}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium text-muted-foreground">Date de signalement</div>
                            <div className="text-foreground">{cas.dateCreation}</div>
                          </div>
                        </div>

                        {/* Actions recommandées */}
                        {cas.priorite === 'Critique' && (
                          <Alert className="glass-effect border-none bg-gradient-to-br from-red-500/10 to-transparent">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <AlertTitle className="text-red-500 text-xs">Action immédiate requise</AlertTitle>
                            <AlertDescription className="text-xs text-muted-foreground">
                              {(selectedAdmin as any)?.type_compte === 'anonyme'
                                ? 'Dénonciation anonyme critique. Vérifications prioritaires requises. Activation XR-7 possible pour révélation identité si nécessaire.'
                                : (selectedAdmin as any)?.type_compte === 'identifie'
                                  ? 'Signalement citoyen prioritaire. Traitement urgent requis pour maintenir confiance citoyenne.'
                                  : 'Ce dossier nécessite une intervention urgente du Président. Impact financier majeur sur l\'économie bleue gabonaise.'
                              }
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Bouton rapport cas spécifique */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 glass-effect border-none hover:bg-[hsl(var(--accent-success))]/10"
                            onClick={() => handleOuvrirRapportModal(selectedAdmin, cas)}
                            disabled={isLoadingAction}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Rapport cas
                          </Button>
                        </div>
                      </div>
                    ))}

                    {adminCases.length > 3 && (
                      <div className="text-center pt-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Consulter {adminCases.length - 3} autres dossiers
                        </Button>
                      </div>
                    )}

                    {/* Résumé financier */}
                    <div className="border-t border-muted/20 pt-3">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-muted-foreground">Total concerné</div>
                          <div className="text-sm font-semibold text-[hsl(var(--accent-success))]">
                            {adminCases.reduce((sum, cas) => {
                              const montantStr = typeof cas.montant === 'number' ? String(cas.montant) : (cas.montant || '0');
                              const montant = parseInt(montantStr.replace(/[^\d]/g, ''));
                              return sum + montant;
                            }, 0).toLocaleString()} FCFA
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Dossiers actifs</div>
                          <div className="text-sm font-semibold text-[hsl(var(--accent-intel))]">
                            {adminCases.filter(cas => cas.statut === 'En cours').length}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Résolus</div>
                          <div className="text-sm font-semibold text-[hsl(var(--accent-success))]">
                            {adminCases.filter(cas => cas.statut === 'Résolu').length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Historique des activités */}
              {!((selectedAdmin as any)?.type_compte === 'anonyme') && adminHistory.length > 0 && (
                <Card className="glass-effect border-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
                      Chronologie des interventions - Agent Pêche
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Suivi détaillé des actions menées sur le dossier Pêche-Gab
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adminHistory.slice(0, 4).map((activity: HistoryItem, index: number) => (
                        <div key={activity.id} className="relative">
                          {/* Timeline line */}
                          {index < adminHistory.slice(0, 4).length - 1 && (
                            <div className="absolute left-3 top-8 w-px h-8 bg-gradient-to-b from-[hsl(var(--accent-intel))] to-transparent" />
                          )}

                          <div className="flex items-start gap-4 p-3 rounded-lg border border-muted/10 bg-gradient-to-r from-muted/5 to-transparent">
                            <div className="w-6 h-6 rounded-full bg-[hsl(var(--accent-intel))] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-foreground">{activity.action}</span>
                                <span className="text-xs text-muted-foreground font-mono">{activity.date}</span>
                              </div>
                              <div className="text-xs text-muted-foreground leading-relaxed">
                                {activity.description}
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={`text-xs font-medium ${activity.status === 'En cours' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                                    activity.status === 'Résolu' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                                      'bg-gray-500/20 text-gray-500 border-gray-500/30'
                                  }`}>
                                  {activity.status}
                                </Badge>
                                {activity.montant !== '0 FCFA' && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-[hsl(var(--accent-success))]" />
                                    <span className="text-xs text-[hsl(var(--accent-success))] font-semibold">
                                      {activity.montant}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Détails supplémentaires pour les cas critiques */}
                              {activity.montant !== '0 FCFA' && (
                                <div className="text-xs text-muted-foreground bg-muted/10 p-2 rounded border-l-2 border-[hsl(var(--accent-intel))]">
                                  <strong>Impact financier:</strong> Cette intervention concerne un montant significatif
                                  nécessitant un suivi rapproché et une validation présidentielle.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Résumé des actions */}
                    <div className="border-t border-muted/20 pt-3 mt-4">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="font-medium text-muted-foreground">Total des montants traités</div>
                          <div className="text-sm font-semibold text-[hsl(var(--accent-success))]">
                            {adminHistory
                              .filter(activity => String(activity.montant || '') !== '0 FCFA')
                              .reduce((sum, activity) => {
                                const montantStr = String(activity.montant || '0');
                                const montant = parseInt(montantStr.replace(/[^\d]/g, ''));
                                return sum + montant;
                              }, 0).toLocaleString()} FCFA
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium text-muted-foreground">Actions en cours</div>
                          <div className="text-sm font-semibold text-[hsl(var(--accent-warning))]">
                            {adminHistory.filter(activity => activity.status === 'En cours').length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}


              {/* Statut */}
              <Alert className={`glass-effect border-none ${selectedAdmin.statut === 'Actif'
                  ? 'bg-gradient-to-br from-[hsl(var(--accent-success))]/10 to-transparent'
                  : 'bg-gradient-to-br from-[hsl(var(--accent-warning))]/10 to-transparent'
                }`}>
                {selectedAdmin.statut === 'Actif' ? (
                  <CheckCircle className="h-4 w-4 text-[hsl(var(--accent-success))]" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--accent-warning))]" />
                )}
                <AlertTitle>Statut: {selectedAdmin.statut}</AlertTitle>
                <AlertDescription className="text-xs">
                  {selectedAdmin.statut === 'Actif'
                    ? 'Compte actif et opérationnel. Performance conforme aux standards nationaux.'
                    : 'Attention requise. Performance en dessous des standards. Suivi recommandé.'}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="mt-auto sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-muted/10 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
              className="glass-effect border-none hover:bg-muted/50 transition-all"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Fermer
            </Button>
            <Button
              variant="outline"
              className="glass-effect border-none hover:bg-muted/50 transition-all flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // Détecter si on est sur mobile
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                if (isMobile) {
                  // Sur mobile, ouvrir directement l'interface iAsted en mode texte
                  const event = new CustomEvent('iasted:open-text-mode', {
                    detail: {
                      context: 'institution',
                      admin: selectedAdmin,
                      autoMessage: `Excellence, je suis iAsted. Je vais analyser les données de ${selectedAdmin?.organization || 'cette institution'}. Comment puis-je vous aider ?`
                    }
                  });
                  window.dispatchEvent(event);
                } else {
                  // Sur desktop, utiliser le mode vocal comme avant
                  const event = new CustomEvent('iasted:open-voice-report', {
                    detail: {
                      context: 'institution',
                      admin: selectedAdmin,
                    }
                  });
                  window.dispatchEvent(event);
                }
              }}
              title="Rapport vocal iAsted"
            >
              <Mic className="h-4 w-4" />
              Rapport iAsted (vocal)
            </Button>
            <Button
              onClick={() => {
                setIsDetailsModalOpen(false);
                if (selectedAdmin) handleOuvrirRapportModal(selectedAdmin);
              }}
              className="bg-gradient-to-r from-[hsl(var(--accent-success))] to-[hsl(var(--accent-intel))] hover:from-[hsl(var(--accent-success))]/90 hover:to-[hsl(var(--accent-intel))]/90 text-white shadow-lg transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Générer Rapport Global
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Génération de Rapport */}
      <Dialog open={isRapportModalOpen} onOpenChange={setIsRapportModalOpen}>
        <DialogContent className="glass-effect border-none max-w-3xl h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
          <DialogHeader className="border-b border-muted/10 pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-success))]/20 to-[hsl(var(--accent-intel))]/20">
                <FileText className="h-5 w-5 text-[hsl(var(--accent-success))]" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Génération de Rapport
              </span>
            </DialogTitle>
            <DialogDescription className="text-sm mt-2 flex items-center gap-2 text-foreground/80">
              <Building2 className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
              <span className="font-medium">{selectedAdmin?.organization}</span> - {rapportType === 'cas'
                ? `Sélection des cas à inclure dans le rapport`
                : `Configuration du rapport global pour la période sélectionnée`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 flex-1 overflow-y-auto pr-2">
            {/* Type de rapport */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Filter className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
                Type de rapport
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={rapportType === 'global' ? 'default' : 'outline'}
                  onClick={() => {
                    setRapportType('global');
                    setSelectedCasIds([]);
                  }}
                  className={`glass-effect border-none h-auto py-4 transition-all ${rapportType === 'global'
                      ? 'bg-gradient-to-br from-[hsl(var(--accent-intel))]/20 to-[hsl(var(--accent-success))]/20 border border-[hsl(var(--accent-intel))]/30 shadow-lg'
                      : 'hover:bg-muted/50'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <BarChart3 className={`h-5 w-5 ${rapportType === 'global' ? 'text-[hsl(var(--accent-intel))]' : 'text-muted-foreground'}`} />
                    <div className="text-center">
                      <div className="font-semibold text-foreground">Rapport Global</div>
                      <div className="text-xs text-foreground/70">Vue d'ensemble ministère</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant={rapportType === 'cas' ? 'default' : 'outline'}
                  onClick={() => setRapportType('cas')}
                  className={`glass-effect border-none h-auto py-4 transition-all ${rapportType === 'cas'
                      ? 'bg-gradient-to-br from-[hsl(var(--accent-success))]/20 to-[hsl(var(--accent-intel))]/20 border border-[hsl(var(--accent-success))]/30 shadow-lg'
                      : 'hover:bg-muted/50'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Package className={`h-5 w-5 ${rapportType === 'cas' ? 'text-[hsl(var(--accent-success))]' : 'text-muted-foreground'}`} />
                    <div className="text-center">
                      <div className="font-semibold text-foreground">Rapport Cas</div>
                      <div className="text-xs text-foreground/70">Sélection spécifique</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Contenu selon le type */}
            {rapportType === 'global' ? (
              <div className="space-y-4">
                {/* Période de suivi */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
                    Période de suivi
                  </Label>
                  <Select value={periodeSuivi} onValueChange={(value) => setPeriodeSuivi(value as typeof periodeSuivi)}>
                    <SelectTrigger className="glass-effect border-none bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-none">
                      <SelectItem value="hebdomadaire" className="hover:bg-muted/50 text-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-foreground/70" />
                          Hebdomadaire
                        </div>
                      </SelectItem>
                      <SelectItem value="mensuel" className="hover:bg-muted/50 text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-foreground/70" />
                          Mensuel
                        </div>
                      </SelectItem>
                      <SelectItem value="trimestriel" className="hover:bg-muted/50 text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-foreground/70" />
                          Trimestriel
                        </div>
                      </SelectItem>
                      <SelectItem value="annuel" className="hover:bg-muted/50 text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-foreground/70" />
                          Annuel
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <Calendar className="h-3 w-3 text-[hsl(var(--accent-success))]" />
                      Date de début
                    </Label>
                    <Input
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="glass-effect border-none bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <Calendar className="h-3 w-3 text-[hsl(var(--accent-warning))]" />
                      Date de fin
                    </Label>
                    <Input
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="glass-effect border-none bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 transition-all"
                    />
                  </div>
                </div>

                {/* Résumé du rapport global */}
                <Card className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-intel))]/10 via-transparent to-[hsl(var(--accent-success))]/5">
                  <CardHeader className="pb-3 border-b border-muted/10">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <BarChart3 className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
                      Contenu du rapport global
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <span className="text-foreground/70 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-foreground/60" />
                          Administration
                        </span>
                        <div className="font-semibold mt-1 text-foreground">{selectedAdmin?.organization}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <span className="text-foreground/70 flex items-center gap-1">
                          <Users className="h-3 w-3 text-foreground/60" />
                          Responsable
                        </span>
                        <div className="font-semibold mt-1 text-foreground">{selectedAdmin?.nom}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <span className="text-foreground/70 flex items-center gap-1">
                          <Package className="h-3 w-3 text-foreground/60" />
                          Total cas
                        </span>
                        <div className="font-semibold mt-1 text-[hsl(var(--accent-intel))]">{adminCases.length}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <span className="text-foreground/70 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-foreground/60" />
                          Problématiques
                        </span>
                        <div className="font-semibold mt-1 text-[hsl(var(--accent-warning))]">{adminProblematiques.length}</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-muted/20">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-[hsl(var(--accent-success))]/10 to-transparent">
                        <span className="text-foreground/70 flex items-center gap-1 mb-2">
                          <DollarSign className="h-3 w-3 text-foreground/60" />
                          Impact financier total
                        </span>
                        <div className="text-base font-bold text-[hsl(var(--accent-success))]">
                          {adminProblematiques.reduce((sum, p) => {
                            const montantStr = String(p.montant || '0');
                            const montant = parseInt(montantStr.replace(/[^\d]/g, ''));
                            return sum + montant;
                          }, 0).toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sélection des cas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">
                      Sélection des cas ({selectedCasIds.length}/{adminCases.length})
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleAllCas}
                      className="h-7 text-xs text-foreground hover:bg-muted/50"
                    >
                      {selectedCasIds.length === adminCases.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto border border-muted/20 rounded-lg p-3">
                    {adminCases.map((cas: CaseData) => (
                      <div
                        key={cas.id}
                        onClick={() => handleToggleCasSelection(cas.id)}
                        className={`cursor-pointer p-3 rounded-lg border transition-all ${selectedCasIds.includes(cas.id)
                            ? 'border-[hsl(var(--accent-success))] bg-[hsl(var(--accent-success))]/10'
                            : 'border-muted/20 hover:border-muted/40'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 ${selectedCasIds.includes(cas.id)
                              ? 'bg-[hsl(var(--accent-success))] border-[hsl(var(--accent-success))]'
                              : 'border-muted-foreground'
                            }`}>
                            {selectedCasIds.includes(cas.id) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs font-mono">
                                {cas.id}
                              </Badge>
                              <Badge className={`text-xs ${cas.priorite === 'Critique' ? 'bg-red-500/20 text-red-500' :
                                  cas.priorite === 'Haute' ? 'bg-orange-500/20 text-orange-500' :
                                    'bg-blue-500/20 text-blue-500'
                                }`}>
                                {cas.priorite}
                              </Badge>
                            </div>
                            <div className="text-sm font-medium mb-1 text-foreground">{cas.titre}</div>
                            <div className="text-xs text-foreground/70 mb-2">{cas.description}</div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[hsl(var(--accent-success))] font-medium">
                                {cas.montant}
                              </span>
                              <span className="text-foreground/60">{cas.localisation}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Résumé des cas sélectionnés */}
                {selectedCasIds.length > 0 && (
                  <Card className="glass-effect border-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Résumé de la sélection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground">Cas sélectionnés:</span>
                          <div className="font-medium">{selectedCasIds.length}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Montant total:</span>
                          <div className="text-[hsl(var(--accent-success))] font-semibold">
                            {adminCases
                              .filter(cas => selectedCasIds.includes(cas.id))
                              .reduce((sum, cas) => {
                                const montantStr = typeof cas.montant === 'number' ? String(cas.montant) : (cas.montant || '0');
                                const montant = parseInt(montantStr.replace(/[^\d]/g, ''));
                                return sum + montant;
                              }, 0).toLocaleString()} FCFA
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Configuration Gamma AI */}
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-semibold text-foreground">Configuration Gamma AI</span>
                <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 border-purple-500/30 text-xs">
                  Recommandé
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Mode de création */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/70">Mode de création</Label>
                  <Select value={gammaConfig.modeCreation} onValueChange={(value: 'ia' | 'texte') => setGammaConfig({ ...gammaConfig, modeCreation: value })}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ia">✨ Créer avec l'IA</SelectItem>
                      <SelectItem value="texte">📝 Coller le texte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type de document */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/70">Type de document</Label>
                  <Select value={gammaConfig.typeDocument} onValueChange={(value: 'texte' | 'presentation') => setGammaConfig({ ...gammaConfig, typeDocument: value })}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presentation">📊 Présentation</SelectItem>
                      <SelectItem value="texte">📄 Texte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Format de page */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/70">Format de page</Label>
                  <Select value={gammaConfig.formatPage} onValueChange={(value: 'defaut' | 'lettre' | 'a4') => setGammaConfig({ ...gammaConfig, formatPage: value })}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defaut">📏 Par défaut</SelectItem>
                      <SelectItem value="lettre">📄 Lettre (US)</SelectItem>
                      <SelectItem value="a4">📋 A4 (EU)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mode de génération */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/70">Mode de génération</Label>
                  <Select value={gammaConfig.modeGeneration} onValueChange={(value: 'generer' | 'synthese' | 'conserver') => setGammaConfig({ ...gammaConfig, modeGeneration: value })}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generer">✨ Générer</SelectItem>
                      <SelectItem value="synthese">📝 Synthèse</SelectItem>
                      <SelectItem value="conserver">💾 Conserver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Niveau de détail */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/70">Niveau de détail</Label>
                  <Select value={gammaConfig.niveauDetail} onValueChange={(value: 'minimaliste' | 'concis' | 'detaille') => setGammaConfig({ ...gammaConfig, niveauDetail: value })}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimaliste">⚡ Minimaliste</SelectItem>
                      <SelectItem value="concis">📋 Concis</SelectItem>
                      <SelectItem value="detaille">📚 Détaillé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Langue de sortie */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/70">Langue de sortie</Label>
                  <Select value={gammaConfig.langue} onValueChange={(value: 'francais' | 'anglais') => setGammaConfig({ ...gammaConfig, langue: value })}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="francais">🇫🇷 Français</SelectItem>
                      <SelectItem value="anglais">🇬🇧 Anglais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Source d'images */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/70">Source d'images</Label>
                  <Select value={gammaConfig.sourceImages} onValueChange={(value: 'ia' | 'aucune') => setGammaConfig({ ...gammaConfig, sourceImages: value })}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ia">🎨 Généré par l'IA</SelectItem>
                      <SelectItem value="aucune">🚫 Ne pas ajouter d'images</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Style d'images */}
                {gammaConfig.sourceImages === 'ia' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-foreground/70">Style d'images</Label>
                    <Select value={gammaConfig.styleImages} onValueChange={(value: 'realiste' | 'illustration') => setGammaConfig({ ...gammaConfig, styleImages: value })}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realiste">📸 Photo réaliste</SelectItem>
                        <SelectItem value="illustration">🎨 Illustration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Nombre de cartes */}
                <div className="space-y-2">
                  <Label className="text-xs text-foreground/70">Nombre de cartes (slides)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={gammaConfig.nombreCartes}
                      onChange={(e) => setGammaConfig({ ...gammaConfig, nombreCartes: parseInt(e.target.value) || 7 })}
                      className="h-9 text-xs"
                    />
                    <span className="text-xs text-foreground/60">/ 10</span>
                  </div>
                </div>
              </div>

              {/* Résumé de la configuration */}
              <div className="p-3 rounded-lg bg-muted/20 space-y-1">
                <div className="text-xs font-medium text-foreground">📋 Résumé de la configuration :</div>
                <div className="text-xs text-foreground/70">
                  {gammaConfig.typeDocument === 'presentation' ? '📊 Présentation' : '📄 Document'} •
                  {gammaConfig.niveauDetail === 'minimaliste' ? ' ⚡ Minimaliste' : gammaConfig.niveauDetail === 'concis' ? ' 📋 Concis' : ' 📚 Détaillé'} •
                  {gammaConfig.nombreCartes} cartes •
                  🇫🇷 {gammaConfig.langue === 'francais' ? 'Français' : 'Anglais'} •
                  {gammaConfig.sourceImages === 'ia' ? ` 🎨 Images ${gammaConfig.styleImages === 'realiste' ? 'réalistes' : 'illustrations'}` : ' 🚫 Sans images'}
                </div>
              </div>
            </div>

            {/* Format d'extraction - APRÈS configuration */}
            <div className="space-y-3 pt-4 border-t border-purple-500/20">
              <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Download className="h-4 w-4 text-purple-500" />
                Format d'extraction
              </Label>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={formatRapport === 'gamma-pdf' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormatRapport('gamma-pdf')}
                  className={`glass-effect border-none h-auto py-4 transition-all ${formatRapport === 'gamma-pdf'
                      ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 shadow-lg'
                      : 'hover:bg-muted/50'
                    }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <FileText className={`h-6 w-6 ${formatRapport === 'gamma-pdf' ? 'text-purple-500' : 'text-muted-foreground'}`} />
                      <Sparkles className={`h-3 w-3 absolute -top-1 -right-1 ${formatRapport === 'gamma-pdf' ? 'text-purple-400' : 'text-muted-foreground/50'}`} />
                    </div>
                    <span className="text-sm font-bold text-foreground">PDF IA</span>
                    <span className="text-xs text-foreground/60">Document professionnel</span>
                  </div>
                </Button>
                <Button
                  variant={formatRapport === 'gamma-pptx' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormatRapport('gamma-pptx')}
                  className={`glass-effect border-none h-auto py-4 transition-all ${formatRapport === 'gamma-pptx'
                      ? 'bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 shadow-lg'
                      : 'hover:bg-muted/50'
                    }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <Presentation className={`h-6 w-6 ${formatRapport === 'gamma-pptx' ? 'text-pink-500' : 'text-muted-foreground'}`} />
                      <Sparkles className={`h-3 w-3 absolute -top-1 -right-1 ${formatRapport === 'gamma-pptx' ? 'text-pink-400' : 'text-muted-foreground/50'}`} />
                    </div>
                    <span className="text-sm font-bold text-foreground">PowerPoint IA</span>
                    <span className="text-xs text-foreground/60">Présentation éditable</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Informations de livraison */}
            <Alert className="glass-effect border-none bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <AlertTitle className="text-purple-600 text-xs font-semibold">🎨 Génération avec Gamma AI</AlertTitle>
              <AlertDescription className="text-xs text-foreground/80 space-y-2">
                <p className="font-medium">Processus de génération :</p>
                <div className="space-y-1 pl-4">
                  <p>1️⃣ Extraction automatique des données détaillées (problématiques, opinion publique, recommandations)</p>
                  <p>2️⃣ Création du rapport avec IA selon votre configuration</p>
                  <p>3️⃣ Génération du design professionnel et mise en page automatique</p>
                  <p>4️⃣ Export au format {formatRapport === 'gamma-pdf' ? 'PDF' : 'PowerPoint'} haute qualité</p>
                  <p>5️⃣ Téléchargement automatique + lien Gamma.app pour édition</p>
                </div>
                <p className="font-medium text-purple-600 pt-2">⏱️ Temps estimé : 10-30 secondes</p>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="mt-auto sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-muted/10 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsRapportModalOpen(false)}
              disabled={isLoadingAction}
              className="glass-effect border-none hover:bg-muted/50 transition-all"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleGenererRapportInstitution}
              disabled={isLoadingAction}
              className="bg-gradient-to-r from-[hsl(var(--accent-success))] to-[hsl(var(--accent-intel))] hover:from-[hsl(var(--accent-success))]/90 hover:to-[hsl(var(--accent-intel))]/90 text-white shadow-lg transition-all"
            >
              {isLoadingAction ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Générer le Rapport
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderGestionSpecial = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">Gestion Spéciale</h3>
          <p className="text-muted-foreground mt-1">
            Supervision des sous-administrateurs et performance
          </p>
        </div>
        <Button
          className="bg-[hsl(var(--accent-warning))] hover:bg-[hsl(var(--accent-warning))]/90 text-white"
          onClick={() => setIsNommerModalOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nommer Sous-Admin
        </Button>
      </div>

      {/* Barre de recherche intelligente */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche textuelle */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, secteur, email, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-effect border-none"
            />
          </div>

          {/* Filtre par organisation */}
          <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
            <SelectTrigger className="w-full sm:w-48 glass-effect border-none">
              <SelectValue placeholder="Filtrer par organisation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les organisations</SelectItem>
              {uniqueOrganizations.map(org => (
                <SelectItem key={org} value={org}>{org}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Statistiques de recherche */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              {filteredSubAdmins.length} sous-administrateur{filteredSubAdmins.length > 1 ? 's' : ''} trouvé{filteredSubAdmins.length > 1 ? 's' : ''}
              {searchQuery && ` pour "${searchQuery}"`}
            </span>
            {(searchQuery || selectedOrganization !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedOrganization('all');
                }}
                className="text-xs h-6 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Effacer filtres
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredSubAdmins.length} Sub-Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      {filteredSubAdmins.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Aucun sous-administrateur trouvé
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? `Aucun sous-administrateur trouvé pour "${searchQuery}". Essayez avec d'autres termes.`
              : "Aucun sous-administrateur ne correspond aux filtres sélectionnés."
            }
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedOrganization('all');
            }}
            className="glass-effect border-none"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Effacer tous les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubAdmins.map((admin, idx) => {
            const isInactive = (admin as any).inactive === true;
            return (
              <Card key={idx} className={`glass-effect border-none relative overflow-hidden ${admin.statut === 'Attention' ? 'bg-gradient-to-br from-[hsl(var(--accent-warning))]/5 to-transparent' : ''
                } ${isInactive ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                {admin.statut === 'Attention' && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-warning))] to-transparent" />
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{admin.nom}</CardTitle>
                      <CardDescription>{admin.secteur}</CardDescription>
                    </div>
                    <Badge className={`${admin.statut === 'Actif'
                        ? 'bg-[hsl(var(--accent-success))]/20 text-[hsl(var(--accent-success))]'
                        : 'bg-[hsl(var(--accent-danger))]/20 text-[hsl(var(--accent-danger))]'
                      }`}>
                      {admin.statut}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informations de contact */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{admin.phone}</span>
                    </div>
                  </div>

                  {/* Métriques de performance */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Cas traités</div>
                      <div className="text-2xl font-bold tabular-nums">{admin.casTraites || admin.cas_traites}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Taux succès</div>
                      <div className="text-2xl font-bold tabular-nums text-[hsl(var(--accent-success))]">{admin.taux || admin.taux_succes}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Délai moyen</div>
                      <div className="text-2xl font-bold tabular-nums text-[hsl(var(--accent-intel))]">{admin.delai || admin.delai_moyen_jours}j</div>
                    </div>
                  </div>

                  <Progress value={admin.taux || admin.taux_succes} className="h-2" />

                  {/* Rôle et organisation */}
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      Sub-Admin
                    </Badge>
                    <span className="text-muted-foreground">{admin.organization}</span>
                  </div>

                  {/* Privilèges */}
                  {admin.privileges && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Privilèges:</div>
                      <div className="flex flex-wrap gap-1">
                        {admin.privileges.map((privilege, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0.5">
                            {privilege}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alerte inactivité */}
                  {isInactive && (
                    <Alert className="glass-effect border-none bg-muted/30">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <AlertDescription className="text-muted-foreground text-xs">
                        Service non actif - En attente de configuration
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVoirDetails(admin)}
                      className="w-full glass-effect border-none hover:bg-[hsl(var(--accent-intel))]/10"
                      disabled={isInactive}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Détecter si on est sur mobile
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                        if (isMobile) {
                          // Sur mobile, ouvrir directement l'interface iAsted en mode texte
                          window.dispatchEvent(new CustomEvent('iasted:open-text-mode', {
                            detail: {
                              admin,
                              context: 'institution',
                              autoMessage: `Excellence, je suis iAsted. Je vais analyser les données de ${admin.organization || 'cette institution'}. Comment puis-je vous aider ?`
                            }
                          }));
                        } else {
                          // Sur desktop, utiliser le mode vocal comme avant
                          window.dispatchEvent(new CustomEvent('iasted:open-voice-report', {
                            detail: { admin }
                          }));
                        }
                      }}
                      className="w-full glass-effect border-none bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30"
                      disabled={isInactive}
                    >
                      <Mic className="h-3 w-3 mr-1" />
                      iAsted
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOuvrirRapportModal(admin)}
                      className="w-full glass-effect border-none hover:bg-[hsl(var(--accent-success))]/10"
                      disabled={isInactive}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Rapport
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderGestionCitoyens = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">Gestion Citoyens</h3>
          <p className="text-muted-foreground mt-1">
            Supervision des comptes citoyens et signalements
          </p>
        </div>
        <Button
          className="bg-[hsl(var(--accent-success))] hover:bg-[hsl(var(--accent-success))]/90 text-white"
          onClick={() => setIsNommerModalOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Créer Compte Citoyen
        </Button>
      </div>

      {/* Barre de recherche intelligente */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche textuelle */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, email, téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-effect border-none"
            />
          </div>

          {/* Filtre par organisation */}
          <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
            <SelectTrigger className="w-full sm:w-48 glass-effect border-none">
              <SelectValue placeholder="Filtrer par organisation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les organisations</SelectItem>
              {uniqueOrganizations.map(org => (
                <SelectItem key={org} value={org}>{org}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Statistiques de recherche */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              {filteredCitoyens.length} citoyen{filteredCitoyens.length > 1 ? 's' : ''} trouvé{filteredCitoyens.length > 1 ? 's' : ''}
              {searchQuery && ` pour "${searchQuery}"`}
            </span>
            {(searchQuery || selectedOrganization !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedOrganization('all');
                }}
                className="text-xs h-6 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Effacer filtres
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredCitoyens.length} Citoyen
            </Badge>
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      {filteredCitoyens.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Aucun citoyen trouvé
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? `Aucun citoyen trouvé pour "${searchQuery}". Essayez avec d'autres termes.`
              : "Aucun citoyen ne correspond aux filtres sélectionnés."
            }
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedOrganization('all');
            }}
            className="glass-effect border-none"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Effacer tous les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCitoyens.map((admin, idx) => {
            const isInactive = (admin as any).inactive === true;
            return (
              <Card key={idx} className={`glass-effect border-none relative overflow-hidden ${admin.statut === 'Attention' ? 'bg-gradient-to-br from-[hsl(var(--accent-warning))]/5 to-transparent' : ''
                } ${isInactive ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                {admin.statut === 'Attention' && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-warning))] to-transparent" />
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{admin.nom}</CardTitle>
                      <CardDescription>{admin.secteur}</CardDescription>
                    </div>
                    <Badge className={`${admin.statut === 'Actif'
                        ? 'bg-[hsl(var(--accent-success))]/20 text-[hsl(var(--accent-success))]'
                        : 'bg-[hsl(var(--accent-danger))]/20 text-[hsl(var(--accent-danger))]'
                      }`}>
                      {admin.statut}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informations de contact */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{admin.phone}</span>
                    </div>
                  </div>

                  {/* Métriques de performance */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Signalements</div>
                      <div className="text-2xl font-bold tabular-nums">{admin.casTraites || admin.cas_traites || 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Taux succès</div>
                      <div className="text-2xl font-bold tabular-nums text-[hsl(var(--accent-success))]">{admin.taux || admin.taux_succes || 0}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Délai moyen</div>
                      <div className="text-2xl font-bold tabular-nums text-[hsl(var(--accent-intel))]">{admin.delai || admin.delai_moyen_jours || 0}j</div>
                    </div>
                  </div>

                  <Progress value={admin.taux || admin.taux_succes || 0} className="h-2" />

                  {/* Rôle et organisation */}
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      Citoyen
                    </Badge>
                    <span className="text-muted-foreground">{admin.organization}</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVoirDetails(admin)}
                      className="w-full glass-effect border-none hover:bg-[hsl(var(--accent-intel))]/10"
                      disabled={isInactive}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Détecter si on est sur mobile
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                        if (isMobile) {
                          // Sur mobile, ouvrir directement l'interface iAsted en mode texte
                          window.dispatchEvent(new CustomEvent('iasted:open-text-mode', {
                            detail: {
                              admin,
                              context: 'institution',
                              autoMessage: `Excellence, je suis iAsted. Je vais analyser les données de ${admin.organization || 'cette institution'}. Comment puis-je vous aider ?`
                            }
                          }));
                        } else {
                          // Sur desktop, utiliser le mode vocal comme avant
                          window.dispatchEvent(new CustomEvent('iasted:open-voice-report', {
                            detail: { admin }
                          }));
                        }
                      }}
                      className="w-full glass-effect border-none bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30"
                      disabled={isInactive}
                    >
                      <Mic className="h-3 w-3 mr-1" />
                      iAsted
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOuvrirRapportModal(admin)}
                      className="w-full glass-effect border-none hover:bg-[hsl(var(--accent-success))]/10"
                      disabled={isInactive}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Rapport
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderRapportsStrategiques = () => (
    <div className="space-y-3 md:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
        <div>
          <h3 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">Rapports Stratégiques</h3>
          <p className="text-muted-foreground mt-0.5 md:mt-1 text-xs md:text-sm">
            Analytics avancés et indicateurs Vision Gabon 2025
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] glass-effect border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-effect border-none">
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="3months">3 derniers mois</SelectItem>
              <SelectItem value="1year">Dernière année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="glass-effect border-none">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {[
          { type: 'executif', titre: 'Rapport Exécutif', icon: Crown, desc: 'Synthèse présidentielle', color: 'purple' },
          { type: 'hebdomadaire', titre: 'Rapport Hebdo', icon: Calendar, desc: 'Évolution 7 jours', color: 'intel' },
          { type: 'mensuel', titre: 'Rapport Mensuel', icon: BarChart3, desc: 'Performance mensuelle', color: 'success' },
          { type: 'annuel', titre: 'Rapport Annuel', icon: TrendingUp, desc: 'Vision 2025', color: 'warning' }
        ].map((rapport, idx) => (
          <Card key={idx} className="glass-effect border-none cursor-pointer transition-all hover:translate-y-[-4px] relative overflow-hidden group">
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${rapport.color === 'intel' ? '[hsl(var(--accent-intel))]' : rapport.color === 'success' ? '[hsl(var(--accent-success))]' : rapport.color === 'warning' ? '[hsl(var(--accent-warning))]' : 'purple-500'} to-transparent`} />
            <CardHeader className="pb-2 md:pb-3 pt-2 md:pt-6 px-3 md:px-6">
              <CardTitle className="text-xs md:text-base flex items-center gap-1.5 md:gap-2">
                <rapport.icon className="h-3 w-3 md:h-5 md:w-5 flex-shrink-0" />
                <span className="truncate">{rapport.titre}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 md:pb-6 px-3 md:px-6">
              <p className="text-[10px] md:text-sm text-muted-foreground mb-2 md:mb-4 truncate">{rapport.desc}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full glass-effect border-none text-[10px] md:text-sm h-7 md:h-9"
                onClick={() => handleGenererRapport(rapport.type as 'executif' | 'hebdomadaire' | 'mensuel' | 'annuel')}
              >
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Générer PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-success))]/10 to-transparent">
        <Target className="h-4 w-4 text-[hsl(var(--accent-success))]" />
        <AlertTitle className="text-foreground">
          Vision Gabon Émergent 2025
        </AlertTitle>
        <AlertDescription className="text-muted-foreground">
          La lutte anticorruption contribue directement aux objectifs de la Deuxième République.
          Impact mesuré: réduction de 34% des cas de corruption vs 2023, récupération de {((kpis?.impact_economique || 0) / 1000000000).toFixed(1)} milliards FCFA,
          amélioration de 18 points du score de transparence nationale.
        </AlertDescription>
      </Alert>
    </div>
  );

  // ============================================================================
  // INTERFACE HYBRIDE PRÉSIDENT - 11 Onglets
  // ============================================================================
  // Définie ici (après toutes les fonctions render*) pour éviter les erreurs
  // "Cannot access before initialization"
  const renderPresidentHybrid = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <Header />

        <main className="container mx-auto px-4 py-8 space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 via-green-600 to-blue-700 p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
            <div className="relative flex items-center gap-6">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
                <img src={emblemGabon} alt="Armoiries du Gabon" className="w-20 h-20 object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-8 w-8" />
                  <h1 className="text-3xl font-bold">Dashboard Président/Admin Unifié</h1>
                </div>
                <p className="text-green-100 text-lg">Vue stratégique ET gestion opérationnelle • République Gabonaise</p>
              </div>
            </div>
          </div>

          <Tabs value={presidentTab} onValueChange={setPresidentTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-xl h-auto">
              <TabsTrigger value="vue-ensemble" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                <Eye className="h-4 w-4 mr-2" />Vue Ensemble
              </TabsTrigger>
              <TabsTrigger value="opinion" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />Opinion
              </TabsTrigger>
              <TabsTrigger value="situations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                <AlertCircle className="h-4 w-4 mr-2" />Situations
              </TabsTrigger>
              <TabsTrigger value="vision" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                <Target className="h-4 w-4 mr-2" />Vision
              </TabsTrigger>

              <div className="col-span-full flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                <Badge variant="outline" className="text-xs font-semibold px-3 bg-blue-50">
                  <Crown className="h-3 w-3 mr-1" />OPÉRATIONNEL
                </Badge>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
              </div>

              <TabsTrigger value="gestion" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Building2 className="h-4 w-4 mr-2" />Institutions
              </TabsTrigger>
              <TabsTrigger value="special" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <Crown className="h-4 w-4 mr-2" />Spéciale
              </TabsTrigger>
              <TabsTrigger value="citoyens" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />Citoyens
              </TabsTrigger>
              <TabsTrigger value="validation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Shield className="h-4 w-4 mr-2" />Validation
              </TabsTrigger>
              <TabsTrigger value="enquetes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <MapPin className="h-4 w-4 mr-2" />Enquêtes
              </TabsTrigger>
              <TabsTrigger value="rapports" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />Rapports
              </TabsTrigger>
              <TabsTrigger value="xr7" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                <Radio className="h-4 w-4 mr-2" />XR-7
              </TabsTrigger>
              <TabsTrigger value="iasted" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Brain className="h-4 w-4 mr-2" />iAsted
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />Config
              </TabsTrigger>
            </TabsList>

            <Suspense fallback={<div className="flex items-center justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
              <TabsContent value="vue-ensemble"><VueEnsemble /></TabsContent>
              <TabsContent value="opinion"><OpinionPublique /></TabsContent>
              <TabsContent value="situations"><SituationsCritiques /></TabsContent>
              <TabsContent value="vision"><VisionNationale /></TabsContent>
              <TabsContent value="gestion">{renderGestionInstitutions()}</TabsContent>
              <TabsContent value="special">{renderGestionSpecial()}</TabsContent>
              <TabsContent value="citoyens">{renderGestionCitoyens()}</TabsContent>
              <TabsContent value="validation">{renderValidation()}</TabsContent>
              <TabsContent value="enquetes">{renderSuiviEnquetes()}</TabsContent>
              <TabsContent value="rapports">{renderRapportsStrategiques()}</TabsContent>
              <TabsContent value="xr7"><ModuleXR7 /></TabsContent>
              <TabsContent value="iasted"><IAstedChat isOpen={true} /></TabsContent>
              <TabsContent value="settings">
                <div className="text-center p-8">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Paramètres</h3>
                  <p className="text-muted-foreground mt-2">Configuration du dashboard (à venir)</p>
                </div>
              </TabsContent>
            </Suspense>
          </Tabs>
        </main>

        <Footer />
        <IAstedFloatingButton />
      </div>
    );
  };

  // ============================================================================
  // ROUTING CONDITIONNEL : Président vs Admin Standard
  // ============================================================================
  if (isPresident) {
    return renderPresidentHybrid();
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-pattern-grid pointer-events-none z-0" />

        {/* Animated Orbs */}
        <div className="fixed w-[400px] h-[400px] rounded-full opacity-[var(--orb-opacity)] blur-[100px] -top-[200px] -left-[200px] bg-gradient-to-br from-[hsl(var(--accent-intel))] via-[hsl(var(--accent-intel))] to-transparent animate-float-orb pointer-events-none" style={{ animationDuration: '25s' }} />
        <div className="fixed w-[300px] h-[300px] rounded-full opacity-[var(--orb-opacity)] blur-[100px] -bottom-[150px] -right-[150px] bg-gradient-to-br from-[hsl(var(--accent-warning))] via-[hsl(var(--accent-warning))] to-transparent animate-float-orb pointer-events-none" style={{ animationDuration: '30s', animationDelay: '-5s' }} />
        <div className="fixed w-[350px] h-[350px] rounded-full opacity-[var(--orb-opacity)] blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-[hsl(var(--accent-success))] via-[hsl(var(--accent-success))] to-transparent animate-float-orb pointer-events-none" style={{ animationDuration: '35s', animationDelay: '-10s' }} />

        {/* Sidebar desktop uniquement */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col w-full relative z-10">
          {/* Barre verticale mobile avec 3 niveaux d'affichage */}
          <div className="fixed right-0 top-16 bottom-0 z-[60] flex lg:hidden">
            <div className={`h-full border-l bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 flex flex-col items-center py-3 gap-2 transition-all duration-300 ease-in-out ${mobileMenuState === 'collapsed' ? 'w-0 opacity-0 pointer-events-none' :
                mobileMenuState === 'icons' ? 'w-14' :
                  'w-52'
              }`}>
              {/* Navigation items */}
              {mobileMenuState !== 'collapsed' && (
                <div className="flex flex-col gap-2 w-full px-2">
                  <NavIcon href="/admin" active={activeView === 'dashboard'} label="Dashboard" icon="grid" showLabel={mobileMenuState === 'expanded'} />
                  <NavIcon href="/admin?view=gestion" active={activeView === 'gestion'} label="Gestion Institutions" icon="users" showLabel={mobileMenuState === 'expanded'} />
                  <NavIcon href="/admin?view=special" active={activeView === 'special'} label="Gestion Spéciale" icon="crown" showLabel={mobileMenuState === 'expanded'} />
                  <NavIcon href="/admin?view=citoyens" active={activeView === 'citoyens'} label="Gestion Citoyens" icon="user" showLabel={mobileMenuState === 'expanded'} />
                  <NavIcon href="/admin?view=validation" active={activeView === 'validation'} label="Validation Cas" icon="shield" showLabel={mobileMenuState === 'expanded'} />
                  <NavIcon href="/admin?view=enquetes" active={activeView === 'enquetes'} label="Enquêtes" icon="map" showLabel={mobileMenuState === 'expanded'} />
                  <NavIcon href="/admin?view=rapports" active={activeView === 'rapports'} label="Rapports" icon="file" showLabel={mobileMenuState === 'expanded'} />
                  <NavIcon href="/admin?view=xr7" active={activeView === 'xr7'} label="Module XR-7" icon="radio" showLabel={mobileMenuState === 'expanded'} />
                  <NavIcon href="/admin?view=iasted" active={activeView === 'iasted'} label="iAsted AI" icon="brain" showLabel={mobileMenuState === 'expanded'} />
                </div>
              )}

              <div className="flex-1" />

              {/* Actions */}
              {mobileMenuState !== 'collapsed' && (
                <div className="flex flex-col gap-2 w-full px-2">
                  <button
                    aria-label="Paramètres"
                    className={`rounded-full flex items-center justify-center hover:bg-muted transition-colors ${mobileMenuState === 'expanded' ? 'h-10 w-full px-3 gap-2' : 'h-10 w-10 mx-auto'}`}
                    title="Paramètres"
                    onClick={() => window.location.assign('/admin?view=settings')}
                  >
                    <Settings className="h-5 w-5" />
                    {mobileMenuState === 'expanded' && <span className="text-xs font-medium whitespace-nowrap">Paramètres</span>}
                  </button>
                  <button
                    aria-label="Déconnexion"
                    className={`rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors ${mobileMenuState === 'expanded' ? 'h-10 w-full px-3 gap-2' : 'h-10 w-10 mx-auto'}`}
                    title="Déconnexion"
                    onClick={() => window.dispatchEvent(new CustomEvent('ndjobi:signout'))}
                  >
                    <LogOut className="h-5 w-5" />
                    {mobileMenuState === 'expanded' && <span className="text-xs font-medium whitespace-nowrap">Déconnexion</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* En-tête glassmorphism */}
          <header className="h-16 glass-effect sticky top-0 z-50">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
              {/* Gauche: Titre et badge */}
              <div className="flex items-center gap-3">
                {/* Bouton menu mobile supprimé - remplacé par barre droite */}

                <div className="flex items-center gap-3">
                  <img
                    src={emblemGabon}
                    alt="Emblème du Gabon"
                    className="h-8 w-8 object-contain rounded-full bg-white p-1 shadow-sm"
                  />
                  <div className="hidden md:block">
                    <h1 className="text-base font-bold">PROTOCOLE D'ÉTAT</h1>
                    <p className="text-[9px] text-muted-foreground">Intelligence • Vision 2025</p>
                  </div>
                </div>
              </div>

              {/* Droite: Actions et infos */}
              <div className="flex items-center gap-3">
                {/* LIVE - maintenant en première position */}
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-live-pulse" />
                  <span className="text-xs font-medium text-red-500">LIVE</span>
                </div>

                {/* Thème - maintenant en deuxième position */}
                <ThemeToggle />

                {/* Bouton toggle menu mobile - maintenant en troisième position */}
                <button
                  onClick={() => {
                    setMobileMenuState(prev =>
                      prev === 'collapsed' ? 'icons' :
                        prev === 'icons' ? 'expanded' :
                          'collapsed'
                    );
                  }}
                  className={`lg:hidden h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted border transition-all duration-200 hover:scale-105 ${mobileMenuState === 'collapsed' ? 'border-border/50 hover:border-primary/50' :
                      mobileMenuState === 'icons' ? 'border-primary/50 bg-primary/10 hover:bg-primary/20' :
                        'border-primary bg-primary/20 hover:bg-primary/30'
                    }`}
                  title={`Menu: ${mobileMenuState === 'collapsed' ? 'Fermé' : mobileMenuState === 'icons' ? 'Icônes' : 'Complet'}`}
                >
                  <Menu className={`h-5 w-5 transition-all duration-200 ${mobileMenuState === 'expanded' ? 'rotate-90' : ''
                    }`} />
                </button>

                <div className="h-8 w-px bg-border/50 hidden lg:block" />

                <div className="hidden lg:flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-2 bg-[hsl(var(--accent-success))]/10 border-[hsl(var(--accent-success))]/30">
                    Gabon • Vision 2025
                  </Badge>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu principal avec scroll */}
          <main className="flex-1 overflow-y-auto">
            <div className={`container py-3 md:py-8 space-y-3 md:space-y-6 transition-all duration-300 ease-in-out ${mobileMenuState === 'collapsed' ? 'pr-0' :
                mobileMenuState === 'icons' ? 'pr-14' :
                  'pr-52'
              } lg:pr-0`}>
              {/* Rendu des vues selon activeView */}
              {activeView === 'dashboard' && renderDashboardGlobal()}
              {activeView === 'validation' && renderValidation()}
              {activeView === 'enquetes' && renderSuiviEnquetes()}
              {activeView === 'gestion' && renderGestionInstitutions()}
              {activeView === 'special' && renderGestionSpecial()}
              {activeView === 'citoyens' && renderGestionCitoyens()}
              {activeView === 'rapports' && renderRapportsStrategiques()}
              {activeView === 'xr7' && <ModuleXR7 />}
              {activeView === 'iasted' && <IAstedChat isOpen={true} />}
            </div>
          </main>

          {/* Bouton flottant iAsted - masqué si vue iasted active */}
          {activeView !== 'iasted' && <IAstedFloatingButton />}
        </div>
      </div>
    </SidebarProvider>
  );
}
