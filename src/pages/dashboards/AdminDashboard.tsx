import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Crown, BarChart3, CheckCircle, Users, Package, 
  FileText, TrendingUp, Shield, AlertTriangle, Eye, Filter,
  Download, MapPin, Calendar, Activity, Zap, Brain, Scale,
  Building2, Flag, Target, DollarSign, Clock, ChevronRight,
  AlertCircle, XCircle, RefreshCw, Search, UserPlus, Menu,
  Mail, Phone, X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import emblemGabon from '@/assets/emblem_gabon.png';

export default function AdminDashboard() {
  const { user, role, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // États pour la recherche et filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');
  
  // États pour les modals et actions
  const [isNommerModalOpen, setIsNommerModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRapportModalOpen, setIsRapportModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [adminHistory, setAdminHistory] = useState<any[]>([]);
  const [adminCases, setAdminCases] = useState<any[]>([]);
  const [adminProblematiques, setAdminProblematiques] = useState<any[]>([]);
  const [adminRecommandations, setAdminRecommandations] = useState<any[]>([]);
  const [rapportType, setRapportType] = useState<'cas' | 'global'>('global');
  const [selectedCas, setSelectedCas] = useState<any>(null);
  
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
  const handleVoirDetails = async (admin: any) => {
    setSelectedAdmin(admin);
    setIsLoadingAction(true);
    
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
            description: '12 coopératives fictives détectées avec détournement de 5 milliards FCFA',
            impact: 'Critique',
            montant: '5 000 000 000 FCFA',
            statut: 'En cours',
            classification: 'Pas urgent',
            dateDetection: '2025-01-15',
            secteur: 'Pêche maritime'
          },
          {
            id: 'PROB-002',
            titre: 'Surveillance maritime insuffisante',
            description: 'Lacunes dans le contrôle des navires étrangers en zone économique',
            impact: 'Élevé',
            montant: '2 500 000 000 FCFA',
            statut: 'Résolu',
            classification: 'Résolu',
            dateDetection: '2025-01-14',
            secteur: 'Surveillance maritime'
          },
          {
            id: 'PROB-003',
            titre: 'Processus d\'agrément défaillant',
            description: 'Failles dans le système d\'agrément des coopératives de pêche',
            impact: 'Moyen',
            montant: '1 200 000 000 FCFA',
            statut: 'En cours',
            classification: 'Supprimer',
            dateDetection: '2025-01-12',
            secteur: 'Administration'
          }
        ]);

        // Recommandations présidentielles
        setAdminRecommandations([
          {
            id: 'REC-001',
            titre: 'Réforme du système d\'agrément',
            description: 'Mettre en place un système de vérification renforcé pour les coopératives',
            priorite: 'Critique',
            statut: 'En attente',
            classification: 'Pas urgent',
            impact: 'Prévention des détournements futurs',
            delai: '30 jours',
            responsable: 'Ministère de la Pêche'
          },
          {
            id: 'REC-002',
            titre: 'Renforcement surveillance maritime',
            description: 'Déployer des moyens de contrôle renforcés en zone économique',
            priorite: 'Haute',
            statut: 'En cours',
            classification: 'Résolu',
            impact: 'Réduction pêche illégale',
            delai: '15 jours',
            responsable: 'Marine Nationale'
          },
          {
            id: 'REC-003',
            titre: 'Protocole d\'urgence',
            description: 'Établir un protocole d\'intervention rapide pour signalements critiques',
            priorite: 'Moyenne',
            statut: 'Proposé',
            classification: 'Supprimer',
            impact: 'Amélioration réactivité',
            delai: '45 jours',
            responsable: 'Présidence'
          }
        ]);
      } else {
        // Données génériques pour les autres agents
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

        // Problématiques génériques
        setAdminProblematiques([
          {
            id: 'PROB-GEN-001',
            titre: 'Problématique sectorielle',
            description: 'Enjeu identifié dans le secteur d\'activité',
            impact: 'Moyen',
            montant: '500 000 000 FCFA',
            statut: 'En cours',
            classification: 'Pas urgent',
            dateDetection: '2025-01-15',
            secteur: admin.organization
          }
        ]);

        // Recommandations génériques
        setAdminRecommandations([
          {
            id: 'REC-GEN-001',
            titre: 'Recommandation sectorielle',
            description: 'Amélioration des processus dans le secteur',
            priorite: 'Moyenne',
            statut: 'Proposé',
            classification: 'Pas urgent',
            impact: 'Optimisation des performances',
            delai: '60 jours',
            responsable: admin.organization
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setIsLoadingAction(false);
      setIsDetailsModalOpen(true);
    }
  };

  // Fonction pour ouvrir le modal de génération de rapport
  const handleOuvrirRapportModal = (admin: any, cas?: any) => {
    setSelectedAdmin(admin);
    if (cas) {
      setRapportType('cas');
      setSelectedCas(cas);
    } else {
      setRapportType('global');
      setSelectedCas(null);
    }
    setIsRapportModalOpen(true);
  };

  // Fonction pour générer le rapport institution/cas
  const handleGenererRapportInstitution = async () => {
    setIsLoadingAction(true);
    try {
      // Simulation de génération de rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const typeRapport = rapportType === 'cas' ? 'du cas spécifique' : 'global du ministère';
      const nomCas = selectedCas ? selectedCas.titre : '';
      
      toast({
        title: "Rapport généré avec succès",
        description: `Rapport ${typeRapport}${nomCas ? ` - ${nomCas}` : ''} de ${selectedAdmin.nom} généré.`,
      });

      setIsRapportModalOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Fonction pour générer le rapport d'un admin (ancienne fonction)
  const handleGenererRapportAdmin = async (admin: any) => {
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
                            <Badge className={`text-sm ${
                cas.priority === 'critique' || cas.urgence === 'Critique' ? 'bg-[hsl(var(--accent-danger))]/20 text-[hsl(var(--accent-danger))]' :
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

  const renderGestionSousAdmins = () => (
      <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">Gestion Institutions</h3>
          <p className="text-muted-foreground mt-1">
            Supervision des directeurs sectoriels et performance
          </p>
            </div>
        <Button 
          className="bg-[hsl(var(--accent-intel))] hover:bg-[hsl(var(--accent-intel))]/90 text-white"
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
          
          {/* Filtre par rôle */}
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48 glass-effect border-none">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="sub_admin">Sub-Admin</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="user">Citoyen</SelectItem>
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
              {filteredSousAdmins.length} compte{filteredSousAdmins.length > 1 ? 's' : ''} trouvé{filteredSousAdmins.length > 1 ? 's' : ''}
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
              {sousAdmins.filter(a => a.role === 'sub_admin').length} Sub-Admin
            </Badge>
            <Badge variant="outline" className="text-xs">
              {sousAdmins.filter(a => a.role === 'agent').length} Agent
            </Badge>
            <Badge variant="outline" className="text-xs">
              {sousAdmins.filter(a => a.role === 'user').length} Citoyen
            </Badge>
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      {filteredSousAdmins.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Aucun compte trouvé
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery 
              ? `Aucun résultat pour "${searchQuery}". Essayez avec d'autres termes.`
              : "Aucun compte ne correspond aux filtres sélectionnés."
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
          {filteredSousAdmins.map((admin, idx) => (
          <Card key={idx} className={`glass-effect border-none relative overflow-hidden ${
            admin.statut === 'Attention' ? 'bg-gradient-to-br from-[hsl(var(--accent-warning))]/5 to-transparent' : ''
          }`}>
            {admin.statut === 'Attention' && (
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[hsl(var(--accent-warning))] to-transparent" />
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
            <div>
                  <CardTitle className="text-lg">{admin.nom}</CardTitle>
                  <CardDescription>{admin.secteur}</CardDescription>
                </div>
                <Badge className={`${
                  admin.statut === 'Actif' 
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

              {admin.statut === 'Attention' && (
                <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-warning))]/10 to-transparent">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--accent-warning))]" />
                  <AlertDescription className="text-muted-foreground">
                    Performance en baisse. Délai de traitement supérieur à la norme nationale.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 glass-effect border-none hover:bg-[hsl(var(--accent-intel))]/10"
                  onClick={() => handleVoirDetails(admin)}
                  disabled={isLoadingAction}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir Détails
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 glass-effect border-none hover:bg-[hsl(var(--accent-success))]/10"
                  onClick={() => handleGenererRapportAdmin(admin)}
                  disabled={isLoadingAction}
                >
                  {isLoadingAction ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Rapport
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
        <DialogContent className="glass-effect border-none max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[hsl(var(--accent-intel))]" />
              Nommer un Sous-Admin ou Agent
            </DialogTitle>
            <DialogDescription>
              Créez un nouveau compte pour coordonner les opérations sectorielles
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom complet *</Label>
                <Input
                  id="nom"
                  placeholder="Nom et prénom"
                  value={nomForm.nom}
                  onChange={(e) => setNomForm({...nomForm, nom: e.target.value})}
                  className="glass-effect border-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select value={nomForm.role} onValueChange={(value) => setNomForm({...nomForm, role: value as 'sub_admin' | 'agent'})}>
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
                  onChange={(e) => setNomForm({...nomForm, email: e.target.value})}
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
                  onChange={(e) => setNomForm({...nomForm, phone: e.target.value})}
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
                onChange={(e) => setNomForm({...nomForm, organization: e.target.value})}
                className="glass-effect border-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secteur">Secteur de spécialisation *</Label>
              <Textarea
                id="secteur"
                placeholder="Décrivez le secteur d'intervention..."
                value={nomForm.secteur}
                onChange={(e) => setNomForm({...nomForm, secteur: e.target.value})}
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

          <DialogFooter>
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
        <DialogContent className="glass-effect border-none max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[hsl(var(--accent-intel))]" />
              Détails - {selectedAdmin?.nom}
            </DialogTitle>
            <DialogDescription>
              Informations détaillées et historique de performance
            </DialogDescription>
          </DialogHeader>
          
          {selectedAdmin && (
            <div className="space-y-6 py-4">
              {/* Analyse et recommandations présidentielles - EN HAUT */}
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
                  {/* Problématiques identifiées */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-foreground">Problématiques identifiées</div>
                    <div className="space-y-2">
                      {adminProblematiques.map((problematique: any) => (
                        <div key={problematique.id} className="border border-muted/20 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                {problematique.id}
                              </Badge>
                              <Badge className={`text-xs font-medium ${
                                problematique.impact === 'Critique' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                problematique.impact === 'Élevé' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                'bg-blue-500/20 text-blue-500 border-blue-500/30'
                              }`}>
                                {problematique.impact}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select defaultValue={problematique.classification}>
                                <SelectTrigger className="w-24 h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Résolu">Résolu</SelectItem>
                                  <SelectItem value="Pas urgent">Pas urgent</SelectItem>
                                  <SelectItem value="Supprimer">Supprimer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="text-sm font-medium">{problematique.titre}</div>
                          <div className="text-xs text-muted-foreground">{problematique.description}</div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[hsl(var(--accent-success))] font-medium">
                              {problematique.montant}
                            </span>
                            <span className="text-muted-foreground">{problematique.secteur}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommandations présidentielles */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-foreground">Recommandations présidentielles</div>
                    <div className="space-y-2">
                      {adminRecommandations.map((recommandation: any) => (
                        <div key={recommandation.id} className="border border-muted/20 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                {recommandation.id}
                              </Badge>
                              <Badge className={`text-xs font-medium ${
                                recommandation.priorite === 'Critique' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                recommandation.priorite === 'Haute' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                                'bg-blue-500/20 text-blue-500 border-blue-500/30'
                              }`}>
                                {recommandation.priorite}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select defaultValue={recommandation.classification}>
                                <SelectTrigger className="w-24 h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Résolu">Résolu</SelectItem>
                                  <SelectItem value="Pas urgent">Pas urgent</SelectItem>
                                  <SelectItem value="Supprimer">Supprimer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="text-sm font-medium">{recommandation.titre}</div>
                          <div className="text-xs text-muted-foreground">{recommandation.description}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Impact:</span> {recommandation.impact}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Délai:</span> {recommandation.delai}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Responsable:</span> {recommandation.responsable}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Statut:</span> {recommandation.statut}
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
                        const montant = parseInt(p.montant.replace(/[^\d]/g, ''));
                        return sum + montant;
                      }, 0).toLocaleString()} FCFA.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Informations principales */}
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

              {/* Métriques de performance */}
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

              {/* Privilèges */}
              {selectedAdmin.privileges && (
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

              {/* Cas en cours - Spécifique à l'Agent Pêche */}
              {selectedAdmin.nom === 'Agent Pêche' && adminCases.length > 0 && (
                <Card className="glass-effect border-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
                      Dossier Pêche-Gab - Signalements critiques
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Enquêtes en cours sur les activités de pêche illégales et détournements de fonds
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {adminCases.slice(0, 3).map((cas: any) => (
                      <div key={cas.id} className="border border-muted/20 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {cas.id}
                            </Badge>
                            <Badge className={`text-xs font-medium ${
                              cas.priorite === 'Critique' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                              cas.priorite === 'Haute' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                              'bg-blue-500/20 text-blue-500 border-blue-500/30'
                            }`}>
                              {cas.priorite}
                            </Badge>
                          </div>
                          <Badge className={`text-xs font-medium ${
                            cas.statut === 'En cours' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                            cas.statut === 'Résolu' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                            'bg-gray-500/20 text-gray-500 border-gray-500/30'
                          }`}>
                            {cas.statut}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-foreground">{cas.titre}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">{cas.description}</div>
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
                              Ce dossier nécessite une intervention urgente du Président. 
                              Impact financier majeur sur l'économie bleue gabonaise.
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
                              const montant = parseInt(cas.montant.replace(/[^\d]/g, ''));
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
              {adminHistory.length > 0 && (
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
                      {adminHistory.slice(0, 4).map((activity: any, index: number) => (
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
                                <Badge className={`text-xs font-medium ${
                                  activity.status === 'En cours' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
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
                              .filter(activity => activity.montant !== '0 FCFA')
                              .reduce((sum, activity) => {
                                const montant = parseInt(activity.montant.replace(/[^\d]/g, ''));
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
              <Alert className={`glass-effect border-none ${
                selectedAdmin.statut === 'Actif'
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
              className="glass-effect border-none"
            >
              Fermer
            </Button>
            <Button
              onClick={() => {
                setIsDetailsModalOpen(false);
                if (selectedAdmin) handleOuvrirRapportModal(selectedAdmin);
              }}
              className="bg-[hsl(var(--accent-success))] hover:bg-[hsl(var(--accent-success))]/90 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Rapport Global
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Génération de Rapport */}
      <Dialog open={isRapportModalOpen} onOpenChange={setIsRapportModalOpen}>
        <DialogContent className="glass-effect border-none max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[hsl(var(--accent-success))]" />
              Génération de Rapport
            </DialogTitle>
            <DialogDescription>
              {rapportType === 'cas' 
                ? `Rapport détaillé du cas spécifique - ${selectedCas?.titre}`
                : `Rapport global du ministère - ${selectedAdmin?.organization}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Type de rapport */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type de rapport</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={rapportType === 'global' ? 'default' : 'outline'}
                  onClick={() => setRapportType('global')}
                  className="glass-effect border-none"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Rapport Global
                </Button>
                <Button
                  variant={rapportType === 'cas' ? 'default' : 'outline'}
                  onClick={() => setRapportType('cas')}
                  className="glass-effect border-none"
                  disabled={!selectedCas}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Rapport Cas
                </Button>
              </div>
            </div>

            {/* Informations du rapport */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Informations du rapport</div>
              
              {rapportType === 'global' ? (
                <div className="space-y-3">
                  <Card className="glass-effect border-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Rapport Global - {selectedAdmin?.organization}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground">Administration:</span>
                          <div className="font-medium">{selectedAdmin?.organization}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Responsable:</span>
                          <div className="font-medium">{selectedAdmin?.nom}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cas traités:</span>
                          <div className="font-medium">{adminCases.length}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Problématiques:</span>
                          <div className="font-medium">{adminProblematiques.length}</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-muted/20">
                        <span className="text-muted-foreground">Impact financier total:</span>
                        <div className="text-[hsl(var(--accent-success))] font-semibold">
                          {adminProblematiques.reduce((sum, p) => {
                            const montant = parseInt(p.montant.replace(/[^\d]/g, ''));
                            return sum + montant;
                          }, 0).toLocaleString()} FCFA
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-3">
                  <Card className="glass-effect border-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Rapport Cas - {selectedCas?.titre}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground">ID Cas:</span>
                          <div className="font-medium">{selectedCas?.id}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Priorité:</span>
                          <div className="font-medium">{selectedCas?.priorite}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Statut:</span>
                          <div className="font-medium">{selectedCas?.statut}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Localisation:</span>
                          <div className="font-medium">{selectedCas?.localisation}</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-muted/20">
                        <span className="text-muted-foreground">Montant concerné:</span>
                        <div className="text-[hsl(var(--accent-success))] font-semibold">
                          {selectedCas?.montant}
                        </div>
                      </div>
                      <div className="pt-2">
                        <span className="text-muted-foreground">Description:</span>
                        <div className="text-muted-foreground mt-1">{selectedCas?.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Options de format */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Format du rapport</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="glass-effect border-none">
                  <FileText className="h-3 w-3 mr-1" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="glass-effect border-none">
                  <FileText className="h-3 w-3 mr-1" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" className="glass-effect border-none">
                  <FileText className="h-3 w-3 mr-1" />
                  Word
                </Button>
              </div>
            </div>

            {/* Informations de livraison */}
            <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-intel))]/10 to-transparent">
              <FileText className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
              <AlertTitle className="text-[hsl(var(--accent-intel))] text-xs">Information</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Le rapport sera généré et disponible au téléchargement dans quelques instants. 
                Une notification sera envoyée une fois le processus terminé.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRapportModalOpen(false)}
              disabled={isLoadingAction}
              className="glass-effect border-none"
            >
              Annuler
            </Button>
            <Button
              onClick={handleGenererRapportInstitution}
              disabled={isLoadingAction}
              className="bg-[hsl(var(--accent-success))] hover:bg-[hsl(var(--accent-success))]/90 text-white"
            >
              {isLoadingAction ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Générer le Rapport
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-pattern-grid pointer-events-none z-0" />
        
        {/* Animated Orbs */}
        <div className="fixed w-[400px] h-[400px] rounded-full opacity-[var(--orb-opacity)] blur-[100px] -top-[200px] -left-[200px] bg-gradient-to-br from-[hsl(var(--accent-intel))] via-[hsl(var(--accent-intel))] to-transparent animate-float-orb pointer-events-none" style={{ animationDuration: '25s' }} />
        <div className="fixed w-[300px] h-[300px] rounded-full opacity-[var(--orb-opacity)] blur-[100px] -bottom-[150px] -right-[150px] bg-gradient-to-br from-[hsl(var(--accent-warning))] via-[hsl(var(--accent-warning))] to-transparent animate-float-orb pointer-events-none" style={{ animationDuration: '30s', animationDelay: '-5s' }} />
        <div className="fixed w-[350px] h-[350px] rounded-full opacity-[var(--orb-opacity)] blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-[hsl(var(--accent-success))] via-[hsl(var(--accent-success))] to-transparent animate-float-orb pointer-events-none" style={{ animationDuration: '35s', animationDelay: '-10s' }} />

        {/* Sidebar */}
        <AdminSidebar />

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col w-full relative z-10">
          {/* En-tête glassmorphism */}
          <header className="h-16 glass-effect sticky top-0 z-40">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
              {/* Gauche: Titre et badge */}
              <div className="flex items-center gap-3">
                {/* Bouton menu mobile */}
                <SidebarTrigger className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
                
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
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-live-pulse" />
                  <span className="text-xs font-medium text-red-500">LIVE</span>
                </div>
                
                <ThemeToggle />
                
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
            <div className="container py-3 md:py-8 space-y-3 md:space-y-6">
              {/* Rendu des vues selon activeView */}
              {activeView === 'dashboard' && renderDashboardGlobal()}
              {activeView === 'validation' && renderValidation()}
              {activeView === 'enquetes' && renderSuiviEnquetes()}
              {activeView === 'gestion' && renderGestionSousAdmins()}
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
