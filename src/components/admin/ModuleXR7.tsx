import { useState, useEffect } from 'react';
import {
  Shield, Radio, AlertTriangle, Lock, Eye, Clock,
  FileText, CheckCircle, XCircle, Zap, Scale, AlertCircle,
  Search, ChevronDown, BookOpen, Gavel, Crown, Target,
  RefreshCw, History, Activity, TrendingUp, Download,
  Filter, X as CloseIcon, BarChart, PieChart, Bell, BellRing,
  CheckSquare, UserCheck, FileCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProtocoleActivation {
  signalement_id: string;
  raison: string;
  autorisation_judiciaire: string;
  duree_heures: number;
  reference_legale: string;
  protection_temoins: boolean;
  preservation_preuves: boolean;
}

interface Signalement {
  id: string;
  reference_id?: string;
  titre: string;
  title?: string;
  description?: string;
  type: string;
  categorie?: string;
  corruption_category?: string;
  montant?: string;
  location: string;
  status: string;
  urgence?: string;
  priority: string;
  ai_priority_score: number;
  ai_credibility_score?: number;
  metadata?: any;
  created_at: string;
  user_id?: string;
}

interface ProtocoleActif {
  id: string;
  signalement_id: string;
  signalement_titre: string;
  date_activation: string;
  date_expiration: string;
  duree_restante_heures: number;
  raison: string;
  autorisation: string;
  statut: 'actif' | 'expire' | 'desactive';
}

interface HistoriqueActivation {
  id: string;
  signalement_id: string;
  signalement_titre: string;
  date_activation: string;
  date_desactivation?: string;
  duree_heures: number;
  raison: string;
  autorisation: string;
  activated_by: string;
  resultat?: string;
}

interface FiltresRecherche {
  statut: string[];
  priorite: string[];
  montantMin: string;
  montantMax: string;
  localisation: string[];
  categorie: string[];
  scoreIAMin: number;
}

interface ValidationNiveau {
  niveau: 'super_admin' | 'procureur' | 'president';
  validateur_id?: string;
  validateur_nom?: string;
  date_validation?: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  commentaire?: string;
}

interface StatistiquesXR7 {
  total_activations: number;
  activations_mois: number;
  duree_moyenne: number;
  taux_reussite: number;
  par_categorie: { name: string; value: number }[];
  par_mois: { mois: string; activations: number }[];
  par_statut: { statut: string; count: number }[];
}

// Données présélectionnées - Cas critiques Pêche GAB et autres
const CAS_CRITIQUES_PRESELECTIONNES: Signalement[] = [
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
    created_at: '2025-01-10T16:23:41Z'
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
    created_at: '2025-01-06T09:23:51Z'
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
    created_at: '2025-01-11T18:32:14Z'
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
    created_at: '2025-01-07T21:45:19Z'
  }
];

// Lois et décrets présidentiels sélectionnables
const LOIS_ET_DECRETS = [
  {
    id: 'loi-2021-001',
    type: 'Loi',
    reference: 'Loi organique sur la lutte contre la corruption et l\'enrichissement illicite',
    numero: 'Loi N°2021/001',
    date: '2021',
    article: 'Art. 15-25',
    description: 'Protection des lanceurs d\'alerte et témoins'
  },
  {
    id: 'decret-2024-001',
    type: 'Décret',
    reference: 'Décret présidentiel sur le protocole XR-7',
    numero: 'Décret N°2024/001',
    date: '2024',
    article: 'Art. 1-10',
    description: 'Activation protocole d\'urgence judiciaire'
  },
  {
    id: 'ordonnance-2025-001',
    type: 'Ordonnance',
    reference: 'Ordonnance du Procureur de la République',
    numero: 'Ordonnance N°2025/PGR/001',
    date: '2025',
    article: 'Art. 142 Code Pénal',
    description: 'Autorisation activation XR-7 pour cas critiques'
  },
  {
    id: 'loi-2020-002',
    type: 'Loi',
    reference: 'Loi sur la transparence financière',
    numero: 'Loi N°2020/002',
    date: '2020',
    article: 'Art. 30-45',
    description: 'Audit et contrôle des fonds publics'
  },
  {
    id: 'decret-2023-003',
    type: 'Décret',
    reference: 'Décret sur la protection des témoins',
    numero: 'Décret N°2023/003',
    date: '2023',
    article: 'Art. 5-12',
    description: 'Mesures de protection renforcées'
  }
];

// Raisons d'activation préremplies
const RAISONS_PREEMPLIES = [
  {
    id: 'menaces-temoins',
    titre: 'Menaces avérées sur témoins clés',
    description: 'Témoins identifiés soumis à des pressions, intimidations ou menaces directes nécessitant une protection immédiate.',
    urgence: 'Critique',
    duree_recommandee: 48
  },
  {
    id: 'destruction-preuves',
    titre: 'Tentative de destruction de preuves',
    description: 'Risque imminent de destruction, altération ou dissimulation de preuves documentaires critiques.',
    urgence: 'Critique',
    duree_recommandee: 72
  },
  {
    id: 'reseau-organise',
    titre: 'Réseau de corruption organisé',
    description: 'Détection d\'un réseau structuré de corruption avec implications multiples nécessitant une intervention coordonnée.',
    urgence: 'Haute',
    duree_recommandee: 24
  },
  {
    id: 'detournement-majeur',
    titre: 'Détournement de fonds publics majeur',
    description: 'Détournement avéré de fonds publics supérieur à 1 milliard FCFA avec impact national.',
    urgence: 'Critique',
    duree_recommandee: 48
  },
  {
    id: 'implication-haut-fonctionnaire',
    titre: 'Implication de hauts fonctionnaires',
    description: 'Implication avérée de ministres, directeurs généraux ou hauts responsables dans des actes de corruption.',
    urgence: 'Critique',
    duree_recommandee: 72
  },
  {
    id: 'menace-securite-nationale',
    titre: 'Menace à la sécurité nationale',
    description: 'Corruption ayant des implications sur la sécurité nationale ou les intérêts stratégiques du Gabon.',
    urgence: 'Critique',
    duree_recommandee: 72
  }
];

export function ModuleXR7() {
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProtocoles, setIsLoadingProtocoles] = useState(false);
  const [isLoadingHistorique, setIsLoadingHistorique] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activationForm, setActivationForm] = useState<Partial<ProtocoleActivation>>({
    duree_heures: 24,
    protection_temoins: true,
    preservation_preuves: true
  });
  
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [signalementsNonFiltres, setSignalementsNonFiltres] = useState<Signalement[]>([]);
  const [protocoles, setProtocoles] = useState<ProtocoleActif[]>([]);
  const [historique, setHistorique] = useState<HistoriqueActivation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null);
  const [showSignalementSearch, setShowSignalementSearch] = useState(false);
  const [showRaisonSearch, setShowRaisonSearch] = useState(false);
  const [showLegalSearch, setShowLegalSearch] = useState(false);
  const [selectedRaison, setSelectedRaison] = useState<any>(null);
  const [selectedLegal, setSelectedLegal] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('activation');
  
  const [showFiltres, setShowFiltres] = useState(false);
  const [filtres, setFiltres] = useState<FiltresRecherche>({
    statut: [],
    priorite: [],
    montantMin: '',
    montantMax: '',
    localisation: [],
    categorie: [],
    scoreIAMin: 0
  });
  
  const [statistiques, setStatistiques] = useState<StatistiquesXR7>({
    total_activations: 0,
    activations_mois: 0,
    duree_moyenne: 0,
    taux_reussite: 0,
    par_categorie: [],
    par_mois: [],
    par_statut: []
  });
  
  const [validations, setValidations] = useState<ValidationNiveau[]>([]);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [notificationsActives, setNotificationsActives] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const { toast } = useToast();

  const chargerSignalementsCritiques = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('signalements')
        .select('*')
        .in('priority', ['critique', 'urgent', 'high'])
        .gte('ai_priority_score', 70)
        .order('ai_priority_score', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const signalementsFormatted = (data || []).map((sig: any) => ({
        id: sig.id,
        reference_id: sig.metadata?.reference_id || `SIG-${sig.id.slice(0, 8)}`,
        titre: sig.title || sig.description?.substring(0, 100) || 'Sans titre',
        title: sig.title,
        description: sig.description,
        type: sig.type,
        categorie: sig.corruption_category || sig.type,
        corruption_category: sig.corruption_category,
        montant: sig.metadata?.montant || 'Non spécifié',
        location: sig.location || 'Non spécifié',
        status: sig.status,
        urgence: sig.priority === 'critique' ? 'Critique' : sig.priority === 'urgent' ? 'Haute' : 'Moyenne',
        priority: sig.priority,
        ai_priority_score: sig.ai_priority_score || 0,
        ai_credibility_score: sig.ai_credibility_score || 0,
        metadata: sig.metadata,
        created_at: sig.created_at,
        user_id: sig.user_id
      }));

      setSignalements(signalementsFormatted);
      setSignalementsNonFiltres(signalementsFormatted);
    } catch (err: any) {
      console.error('Erreur chargement signalements:', err);
      setError('Impossible de charger les signalements critiques');
      setSignalements(CAS_CRITIQUES_PRESELECTIONNES);
      setSignalementsNonFiltres(CAS_CRITIQUES_PRESELECTIONNES);
    } finally {
      setIsLoading(false);
    }
  };

  const chargerProtocolesActifs = async () => {
    setIsLoadingProtocoles(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('signalements')
        .select('*')
        .eq('status', 'xr7_protocol_active')
        .not('metadata->xr7_end_date', 'is', null);

      if (fetchError) throw fetchError;

      const protocolesFormatted: ProtocoleActif[] = (data || []).map((sig: any) => {
        const metadata = sig.metadata as Record<string, any> || {};
        const endDate = new Date(metadata.xr7_end_date);
        const now = new Date();
        const diffMs = endDate.getTime() - now.getTime();
        const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

        return {
          id: sig.id,
          signalement_id: sig.id,
          signalement_titre: sig.title || 'Sans titre',
          date_activation: metadata.xr7_activation_date,
          date_expiration: metadata.xr7_end_date,
          duree_restante_heures: diffHours,
          raison: metadata.xr7_reason || 'Non spécifiée',
          autorisation: metadata.xr7_judicial_authorization || 'Non spécifiée',
          statut: (diffHours > 0 ? 'actif' : 'expire') as 'actif' | 'expire' | 'desactive'
        };
      });

      setProtocoles(protocolesFormatted);
    } catch (err: any) {
      console.error('Erreur chargement protocoles:', err);
    } finally {
      setIsLoadingProtocoles(false);
    }
  };

  const chargerHistorique = async () => {
    setIsLoadingHistorique(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('signalements')
        .select('*')
        .or('status.eq.xr7_protocol_active,metadata->xr7_activated.eq.true')
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;

      const historiqueFormatted = (data || [])
        .filter((sig: any) => sig.metadata?.xr7_activated)
        .map((sig: any) => ({
          id: sig.id,
          signalement_id: sig.id,
          signalement_titre: sig.title || 'Sans titre',
          date_activation: sig.metadata.xr7_activation_date,
          date_desactivation: sig.metadata.xr7_deactivation_date,
          duree_heures: sig.metadata.xr7_duration_hours || 24,
          raison: sig.metadata.xr7_reason || 'Non spécifiée',
          autorisation: sig.metadata.xr7_judicial_authorization || 'Non spécifiée',
          activated_by: sig.metadata.xr7_activated_by || 'Inconnu',
          resultat: sig.metadata.xr7_resultat
        }));

      setHistorique(historiqueFormatted);
    } catch (err: any) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setIsLoadingHistorique(false);
    }
  };

  useEffect(() => {
    chargerSignalementsCritiques();
    chargerProtocolesActifs();
    chargerHistorique();

    const interval = setInterval(() => {
      chargerProtocolesActifs();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([
      chargerSignalementsCritiques(),
      chargerProtocolesActifs(),
      chargerHistorique()
    ]);
    
    toast({
      title: 'Actualisation réussie',
      description: 'Les données ont été mises à jour',
    });
  };

  const filteredSignalements = signalements.filter(sig => {
    const searchLower = searchQuery.toLowerCase();
    return (
      sig.titre?.toLowerCase().includes(searchLower) ||
      sig.reference_id?.toLowerCase().includes(searchLower) ||
      sig.categorie?.toLowerCase().includes(searchLower) ||
      sig.corruption_category?.toLowerCase().includes(searchLower) ||
      sig.location?.toLowerCase().includes(searchLower) ||
      sig.description?.toLowerCase().includes(searchLower)
    );
  });

  // Fonction pour sélectionner un signalement
  const handleSelectSignalement = (signalement: Signalement) => {
    setSelectedSignalement(signalement);
    setActivationForm(prev => ({
      ...prev,
      signalement_id: signalement.id
    }));
    setShowSignalementSearch(false);
    setSearchQuery('');
  };

  // Fonction pour sélectionner une raison préremplie
  const handleSelectRaison = (raison: any) => {
    setSelectedRaison(raison);
    setActivationForm(prev => ({
      ...prev,
      raison: raison.description,
      duree_heures: raison.duree_recommandee
    }));
    setShowRaisonSearch(false);
  };

  // Fonction pour sélectionner une référence légale
  const handleSelectLegal = (legal: any) => {
    setSelectedLegal(legal);
    setActivationForm(prev => ({
      ...prev,
      autorisation_judiciaire: legal.numero,
      reference_legale: legal.article
    }));
    setShowLegalSearch(false);
  };

  const handleActiverProtocole = async () => {
    if (!activationForm.signalement_id || !activationForm.raison || !activationForm.autorisation_judiciaire) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    setIsActivating(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: existingSignalement, error: fetchError } = await supabase
        .from('signalements')
        .select('metadata')
        .eq('id', activationForm.signalement_id)
        .single();

      if (fetchError) throw fetchError;

      const existingMetadata = (existingSignalement?.metadata as Record<string, any>) || {};

      const { error } = await supabase
        .from('signalements')
        .update({
          status: 'xr7_protocol_active',
          priority: 'critique',
          metadata: {
            ...existingMetadata,
            xr7_activated: true,
            xr7_activation_date: new Date().toISOString(),
            xr7_reason: activationForm.raison,
            xr7_judicial_authorization: activationForm.autorisation_judiciaire,
            xr7_duration_hours: activationForm.duree_heures || 24,
            xr7_legal_reference: activationForm.reference_legale || 'Protocole XR-7 Emergency',
            xr7_start_date: new Date().toISOString(),
            xr7_end_date: new Date(Date.now() + (activationForm.duree_heures || 24) * 60 * 60 * 1000).toISOString(),
            xr7_activated_by: userData?.user?.id || '',
            xr7_protection_temoins: activationForm.protection_temoins,
            xr7_preservation_preuves: activationForm.preservation_preuves
          }
        })
        .eq('id', activationForm.signalement_id);

      if (error) throw error;

      toast({
        title: '🚨 Protocole XR-7 Activé',
        description: `Protection judiciaire activée pour ${activationForm.duree_heures}h sur ${selectedSignalement?.titre || 'le signalement'}`,
      });

      setShowActivationDialog(false);
      setActivationForm({
        duree_heures: 24,
        protection_temoins: true,
        preservation_preuves: true
      });
      setSelectedSignalement(null);
      setSelectedRaison(null);
      setSelectedLegal(null);

      await Promise.all([
        chargerSignalementsCritiques(),
        chargerProtocolesActifs(),
        chargerHistorique()
      ]);

    } catch (error: any) {
      console.error('Erreur activation XR-7:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'activer le protocole XR-7',
        variant: 'destructive'
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleDesactiverProtocole = async (protocoleId: string) => {
    try {
      const { data: signalement, error: fetchError } = await supabase
        .from('signalements')
        .select('metadata')
        .eq('id', protocoleId)
        .single();

      if (fetchError) throw fetchError;

      const metadata = (signalement?.metadata as Record<string, any>) || {};

      const { error } = await supabase
        .from('signalements')
        .update({
          status: 'under_investigation',
          metadata: {
            ...metadata,
            xr7_deactivation_date: new Date().toISOString(),
            xr7_deactivated_manually: true
          }
        })
        .eq('id', protocoleId);

      if (error) throw error;

      toast({
        title: 'Protocole désactivé',
        description: 'Le protocole XR-7 a été désactivé avec succès',
      });

      await chargerProtocolesActifs();
      await chargerHistorique();
    } catch (error: any) {
      console.error('Erreur désactivation XR-7:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de désactiver le protocole',
        variant: 'destructive'
      });
    }
  };

  const appliquerFiltres = () => {
    let resultats = [...signalementsNonFiltres];

    if (filtres.statut.length > 0) {
      resultats = resultats.filter(s => filtres.statut.includes(s.status));
    }

    if (filtres.priorite.length > 0) {
      resultats = resultats.filter(s => filtres.priorite.includes(s.priority));
    }

    if (filtres.montantMin || filtres.montantMax) {
      resultats = resultats.filter(s => {
        const montantStr = s.montant?.replace(/[^0-9.]/g, '') || '0';
        const montant = parseFloat(montantStr);
        const min = parseFloat(filtres.montantMin) || 0;
        const max = parseFloat(filtres.montantMax) || Infinity;
        return montant >= min && montant <= max;
      });
    }

    if (filtres.localisation.length > 0) {
      resultats = resultats.filter(s => 
        filtres.localisation.some(loc => s.location.toLowerCase().includes(loc.toLowerCase()))
      );
    }

    if (filtres.categorie.length > 0) {
      resultats = resultats.filter(s => 
        filtres.categorie.includes(s.categorie || '') || 
        filtres.categorie.includes(s.corruption_category || '')
      );
    }

    if (filtres.scoreIAMin > 0) {
      resultats = resultats.filter(s => s.ai_priority_score >= filtres.scoreIAMin);
    }

    setSignalements(resultats);
    setShowFiltres(false);
    
    toast({
      title: 'Filtres appliqués',
      description: `${resultats.length} signalement(s) correspond(ent) aux critères`,
    });
  };

  const reinitialiserFiltres = () => {
    setFiltres({
      statut: [],
      priorite: [],
      montantMin: '',
      montantMax: '',
      localisation: [],
      categorie: [],
      scoreIAMin: 0
    });
    setSignalements(signalementsNonFiltres);
    toast({
      title: 'Filtres réinitialisés',
      description: 'Tous les signalements sont affichés',
    });
  };

  const chargerStatistiques = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('signalements')
        .select('*')
        .or('status.eq.xr7_protocol_active,metadata->xr7_activated.eq.true');

      if (fetchError) throw fetchError;

      const activations = (data || []).filter(s => {
        const meta = s.metadata as Record<string, any> | null;
        return meta?.xr7_activated;
      });
      const totalActivations = activations.length;
      
      const now = new Date();
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
      const activationsMois = activations.filter(a => {
        const meta = a.metadata as Record<string, any>;
        return new Date(meta.xr7_activation_date) >= debutMois;
      }).length;

      const dureeMoyenne = activations.reduce((acc, a) => {
        const meta = a.metadata as Record<string, any>;
        return acc + (meta.xr7_duration_hours || 24);
      }, 0) / (totalActivations || 1);

      const reussis = activations.filter(a => {
        const meta = a.metadata as Record<string, any>;
        return meta.xr7_deactivation_date && !meta.xr7_deactivated_manually;
      }).length;
      const tauxReussite = (reussis / (totalActivations || 1)) * 100;

      const parCategorie = activations.reduce((acc: any, a) => {
        const meta = a.metadata as Record<string, any>;
        const cat = meta.corruption_category || a.type || 'Autre';
        const existing = acc.find((item: any) => item.name === cat);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: cat, value: 1 });
        }
        return acc;
      }, []);

      const parMois = activations.reduce((acc: any, a) => {
        const meta = a.metadata as Record<string, any>;
        const date = new Date(meta.xr7_activation_date);
        const mois = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        const existing = acc.find((item: any) => item.mois === mois);
        if (existing) {
          existing.activations++;
        } else {
          acc.push({ mois, activations: 1 });
        }
        return acc;
      }, []);

      const parStatut = [
        { statut: 'Actifs', count: protocoles.filter(p => p.statut === 'actif').length },
        { statut: 'Terminés', count: activations.filter(a => (a.metadata as Record<string, any>).xr7_deactivation_date).length },
        { statut: 'Expirés', count: protocoles.filter(p => p.statut === 'expire').length }
      ];

      setStatistiques({
        total_activations: totalActivations,
        activations_mois: activationsMois,
        duree_moyenne: Math.round(dureeMoyenne),
        taux_reussite: Math.round(tauxReussite),
        par_categorie: parCategorie,
        par_mois: parMois.slice(-6),
        par_statut: parStatut
      });
    } catch (error: any) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  const genererRapportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('RAPPORT PROTOCOLE XR-7', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 105, 28, { align: 'center' });
      doc.text('CONFIDENTIEL - CLASSIFICATION SECRET DÉFENSE', 105, 34, { align: 'center' });

      doc.setFontSize(14);
      doc.text('STATISTIQUES GÉNÉRALES', 20, 45);
      doc.setFontSize(10);
      doc.text(`Total activations: ${statistiques.total_activations}`, 20, 52);
      doc.text(`Activations ce mois: ${statistiques.activations_mois}`, 20, 58);
      doc.text(`Durée moyenne: ${statistiques.duree_moyenne}h`, 20, 64);
      doc.text(`Taux de réussite: ${statistiques.taux_reussite}%`, 20, 70);

      autoTable(doc, {
        startY: 80,
        head: [['Signalement', 'Date Activation', 'Durée', 'Raison', 'Statut']],
        body: historique.slice(0, 10).map(h => [
          h.signalement_titre.substring(0, 30),
          new Date(h.date_activation).toLocaleDateString('fr-FR'),
          `${h.duree_heures}h`,
          h.raison.substring(0, 30),
          h.date_desactivation ? 'Terminé' : 'En cours'
        ])
      });

      const yPosition = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('PROTOCOLES ACTIFS', 20, yPosition);

      autoTable(doc, {
        startY: yPosition + 5,
        head: [['Signalement', 'Temps Restant', 'Raison', 'Autorisation']],
        body: protocoles.filter(p => p.statut === 'actif').map(p => [
          p.signalement_titre.substring(0, 30),
          `${p.duree_restante_heures}h`,
          p.raison.substring(0, 30),
          p.autorisation.substring(0, 30)
        ])
      });

      doc.save(`rapport-xr7-${Date.now()}.pdf`);
      
      toast({
        title: 'Rapport généré',
        description: 'Le rapport PDF a été téléchargé avec succès',
      });
    } catch (error: any) {
      console.error('Erreur génération PDF:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le rapport PDF',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const verifierNotifications = () => {
    const protocolesSoonExpiring = protocoles.filter(p => 
      p.statut === 'actif' && p.duree_restante_heures <= 6 && p.duree_restante_heures > 0
    );

    protocolesSoonExpiring.forEach(p => {
      if (!notificationsActives.includes(p.id)) {
        toast({
          title: '⚠️ Protocole XR-7 Expirant',
          description: `Le protocole "${p.signalement_titre}" expire dans ${p.duree_restante_heures}h`,
          variant: 'destructive'
        });
        setNotificationsActives(prev => [...prev, p.id]);
      }
    });
  };

  const initialiserValidation = (signalementId: string) => {
    const validationsInitiales: ValidationNiveau[] = [
      {
        niveau: 'super_admin',
        statut: 'approuve',
        date_validation: new Date().toISOString(),
        commentaire: 'Validation initiale Super Admin'
      },
      {
        niveau: 'procureur',
        statut: 'en_attente',
        commentaire: 'En attente de validation du Procureur de la République'
      },
      {
        niveau: 'president',
        statut: 'en_attente',
        commentaire: 'En attente de validation présidentielle finale'
      }
    ];
    setValidations(validationsInitiales);
    setShowValidationDialog(true);
  };

  const validerNiveau = async (niveau: string, statut: 'approuve' | 'rejete', commentaire: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      setValidations(prev => prev.map(v => 
        v.niveau === niveau 
          ? {
              ...v,
              statut,
              date_validation: new Date().toISOString(),
              validateur_id: userData?.user?.id,
              commentaire
            }
          : v
      ));

      toast({
        title: statut === 'approuve' ? 'Niveau validé' : 'Niveau rejeté',
        description: `Validation niveau ${niveau}: ${statut}`,
      });

      if (statut === 'rejete') {
        toast({
          title: 'Activation bloquée',
          description: 'Le protocole XR-7 ne peut pas être activé sans toutes les validations',
          variant: 'destructive'
        });
        setShowValidationDialog(false);
      }

      const toutesApprouvees = validations.every(v => 
        v.niveau === niveau ? statut === 'approuve' : v.statut === 'approuve'
      );

      if (toutesApprouvees && niveau === 'president') {
        toast({
          title: '✅ Validation complète',
          description: 'Tous les niveaux sont validés. Vous pouvez activer le protocole XR-7',
        });
        setShowValidationDialog(false);
      }
    } catch (error: any) {
      console.error('Erreur validation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider le niveau',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    chargerSignalementsCritiques();
    chargerProtocolesActifs();
    chargerHistorique();

    const interval = setInterval(() => {
      chargerProtocolesActifs();
      verifierNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (protocoles.length > 0 || historique.length > 0) {
      chargerStatistiques();
    }
  }, [protocoles, historique]);

  useEffect(() => {
    verifierNotifications();
  }, [protocoles]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Alert className="border-red-500 bg-red-50/50 dark:bg-red-950/20 flex-1">
          <Radio className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900 dark:text-red-100">
            MODULE XR-7 - PROTOCOLE D'URGENCE JUDICIAIRE
          </AlertTitle>
          <AlertDescription className="text-red-800 dark:text-red-200">
            Ce module permet l'activation d'un protocole d'urgence pour la protection des témoins
            et la préservation des preuves dans les cas de corruption critiques nécessitant
            une intervention judiciaire immédiate.
          </AlertDescription>
        </Alert>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="ml-4"
          disabled={isLoading || isLoadingProtocoles || isLoadingHistorique}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isLoadingProtocoles || isLoadingHistorique) ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Protection Témoins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activation immédiate de la protection des témoins clés et des lanceurs d'alerte
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Préservation Preuves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sécurisation et horodatage blockchain de toutes les preuves documentaires
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-5 w-5 text-red-600" />
              Autorisation Judiciaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Traçabilité complète avec référence légale et validation procureur
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Protocoles Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {isLoadingProtocoles ? '...' : protocoles.filter(p => p.statut === 'actif').length}
            </div>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-5 flex-1 mr-4">
            <TabsTrigger value="activation">
              <Zap className="h-4 w-4 mr-2" />
              Activation
            </TabsTrigger>
            <TabsTrigger value="protocoles">
              <Activity className="h-4 w-4 mr-2" />
              Actifs ({protocoles.filter(p => p.statut === 'actif').length})
            </TabsTrigger>
            <TabsTrigger value="historique">
              <History className="h-4 w-4 mr-2" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="statistiques">
              <TrendingUp className="h-4 w-4 mr-2" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="cadre-legal">
              <BookOpen className="h-4 w-4 mr-2" />
              Cadre Légal
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              onClick={genererRapportPDF}
              variant="outline"
              size="sm"
              disabled={isGeneratingPDF || historique.length === 0}
            >
              <Download className={`h-4 w-4 mr-2 ${isGeneratingPDF ? 'animate-pulse' : ''}`} />
              {isGeneratingPDF ? 'Génération...' : 'Export PDF'}
            </Button>
            
            <Button
              onClick={() => setShowFiltres(true)}
              variant="outline"
              size="sm"
              className={filtres.statut.length > 0 || filtres.priorite.length > 0 || filtres.categorie.length > 0 ? 'border-blue-500 bg-blue-50' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {(filtres.statut.length + filtres.priorite.length + filtres.categorie.length) > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filtres.statut.length + filtres.priorite.length + filtres.categorie.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <TabsContent value="activation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conditions d'Activation XR-7</CardTitle>
              <CardDescription>
                Le protocole d'urgence ne peut être activé que si les conditions suivantes sont réunies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Cas de corruption avérée critique</div>
                  <div className="text-sm text-muted-foreground">
                    Montant ≥ 500M FCFA ou impact national majeur
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Autorisation judiciaire valide</div>
                  <div className="text-sm text-muted-foreground">
                    Ordonnance du Procureur de la République ou mandat présidentiel
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Risque imminent pour témoins ou preuves</div>
                  <div className="text-sm text-muted-foreground">
                    Menaces avérées ou tentatives de destruction de preuves
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Validation Protocole d'État</div>
                  <div className="text-sm text-muted-foreground">
                    Approbation présidentielle requise pour activation
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Cas Critiques Éligibles au Protocole XR-7
              </CardTitle>
              <CardDescription>
                {isLoading ? 'Chargement des signalements...' : `${signalements.length} signalements prioritaires nécessitant une activation immédiate`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : signalements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun signalement critique disponible pour le moment
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {signalements.slice(0, 6).map((cas) => (
                    <Card key={cas.id} className="border-red-200 bg-red-50/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="destructive">{cas.urgence || cas.priority}</Badge>
                            <Badge variant="outline">{cas.ai_priority_score}/100</Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSignalement(cas);
                              setActivationForm(prev => ({
                                ...prev,
                                signalement_id: cas.id
                              }));
                              setShowActivationDialog(true);
                            }}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Activer XR-7
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="font-medium text-sm">{cas.titre}</div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>Référence: {cas.reference_id}</div>
                            {cas.montant && <div>Montant: {cas.montant}</div>}
                            <div>Localisation: {cas.location}</div>
                            {cas.categorie && <div>Catégorie: {cas.categorie}</div>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setShowActivationDialog(true)}
              disabled={isLoading}
            >
              <Zap className="h-5 w-5 mr-2" />
              Activer Protocole XR-7
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="protocoles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Protocoles XR-7 Actifs
              </CardTitle>
              <CardDescription>
                {isLoadingProtocoles ? 'Chargement...' : `${protocoles.filter(p => p.statut === 'actif').length} protocole(s) en cours d'exécution`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProtocoles ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : protocoles.filter(p => p.statut === 'actif').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun protocole XR-7 actif pour le moment
                </div>
              ) : (
                <div className="space-y-4">
                  {protocoles.filter(p => p.statut === 'actif').map((protocole) => (
                    <Card key={protocole.id} className="border-blue-200 bg-blue-50/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default" className="bg-blue-600">
                                ACTIF
                              </Badge>
                              <Badge variant="outline">
                                {protocole.duree_restante_heures}h restantes
                              </Badge>
                            </div>
                            <div className="font-medium">{protocole.signalement_titre}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDesactiverProtocole(protocole.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Désactiver
                          </Button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Raison:</span> {protocole.raison}
                          </div>
                          <div>
                            <span className="font-medium">Autorisation:</span> {protocole.autorisation}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Activation: {new Date(protocole.date_activation).toLocaleString('fr-FR')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Expiration: {new Date(protocole.date_expiration).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historique" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600" />
                Historique des Activations XR-7
              </CardTitle>
              <CardDescription>
                {isLoadingHistorique ? 'Chargement...' : `${historique.length} activation(s) enregistrée(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistorique ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : historique.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun historique d'activation disponible
                </div>
              ) : (
                <div className="space-y-3">
                  {historique.map((item) => (
                    <Card key={item.id} className="border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{item.signalement_titre}</div>
                          <Badge variant={item.date_desactivation ? 'secondary' : 'default'}>
                            {item.date_desactivation ? 'Terminé' : 'En cours'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Durée: {item.duree_heures}h</div>
                          <div>Activation: {new Date(item.date_activation).toLocaleString('fr-FR')}</div>
                          {item.date_desactivation && (
                            <div>Désactivation: {new Date(item.date_desactivation).toLocaleString('fr-FR')}</div>
                          )}
                          <div className="text-xs mt-2">Raison: {item.raison}</div>
                          <div className="text-xs">Autorisation: {item.autorisation}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistiques" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Activations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{statistiques.total_activations}</div>
                <p className="text-xs text-muted-foreground mt-1">Depuis le début</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ce Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{statistiques.activations_mois}</div>
                <p className="text-xs text-muted-foreground mt-1">Activations en cours</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Durée Moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{statistiques.duree_moyenne}h</div>
                <p className="text-xs text-muted-foreground mt-1">Par protocole</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Taux Réussite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{statistiques.taux_reussite}%</div>
                <p className="text-xs text-muted-foreground mt-1">Objectif: 90%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  Activations par Mois
                </CardTitle>
                <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={statistiques.par_mois}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="activations" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Répartition par Catégorie
                </CardTitle>
                <CardDescription>Types de corruption détectés</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={statistiques.par_categorie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {statistiques.par_categorie.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-green-600" />
                  Statuts des Protocoles
                </CardTitle>
                <CardDescription>Distribution actuelle</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart data={statistiques.par_statut}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="statut" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Indicateurs de Performance
                </CardTitle>
                <CardDescription>KPIs Module XR-7</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Temps Réponse Moyen</span>
                      <span className="text-sm text-muted-foreground">2.4h</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Conformité Légale</span>
                      <span className="text-sm text-muted-foreground">98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Satisfaction Validateurs</span>
                      <span className="text-sm text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Protection Témoins</span>
                      <span className="text-sm text-muted-foreground">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cadre-legal" className="space-y-4">
          <Card className="border-orange-200 bg-orange-50/10 dark:bg-orange-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Cadre Légal et Responsabilités
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <strong>Fondement légal :</strong> Loi organique sur la lutte contre la corruption
                et l'enrichissement illicite (Gabon, 2021)
              </p>
              <p>
                <strong>Durée maximale :</strong> 72 heures renouvelables sur autorisation judiciaire
              </p>
              <p>
                <strong>Audit :</strong> Toutes les activations sont enregistrées et auditées
                par le Conseil Constitutionnel
              </p>
              <p className="text-orange-800 dark:text-orange-200">
                ⚠️ <strong>Avertissement :</strong> L'activation abusive du protocole XR-7 constitue
                une faute grave passible de sanctions pénales selon l'article 142 du Code Pénal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Références Légales Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {LOIS_ET_DECRETS.map((legal) => (
                  <Card key={legal.id} className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {legal.type === 'Loi' && <BookOpen className="h-5 w-5 text-blue-600" />}
                          {legal.type === 'Décret' && <Crown className="h-5 w-5 text-purple-600" />}
                          {legal.type === 'Ordonnance' && <Gavel className="h-5 w-5 text-red-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{legal.type}</Badge>
                            <span className="font-medium">{legal.numero}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{legal.reference}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {legal.article} • {legal.description}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-600" />
              Activation Protocole XR-7 - Urgence Judiciaire
            </DialogTitle>
            <DialogDescription>
              Veuillez renseigner les informations requises pour l'activation du protocole d'urgence
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
            {/* Recherche intelligente des signalements */}
            <div className="space-y-2">
              <Label>Signalement Concerné *</Label>
              <Popover open={showSignalementSearch} onOpenChange={setShowSignalementSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showSignalementSearch}
                    className="w-full justify-between min-h-[40px]"
                  >
                    {selectedSignalement ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedSignalement.priority === 'critique' ? 'destructive' : 'secondary'}>
                          {selectedSignalement.urgence}
                        </Badge>
                        <span className="truncate">{selectedSignalement.titre}</span>
                      </div>
                    ) : (
                      "Rechercher un signalement..."
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Rechercher par titre, référence, catégorie..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>Aucun signalement trouvé.</CommandEmpty>
                      <CommandGroup>
                        {filteredSignalements.map((signalement) => (
                          <CommandItem
                            key={signalement.id}
                            value={signalement.titre}
                            onSelect={() => handleSelectSignalement(signalement)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <Badge variant={signalement.priority === 'critique' ? 'destructive' : 'secondary'}>
                                {signalement.urgence}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{signalement.titre}</div>
                                <div className="text-sm text-muted-foreground">
                                  {signalement.reference_id} • {signalement.montant} • {signalement.location}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{signalement.ai_priority_score}/100</div>
                                <div className="text-xs text-muted-foreground">Score IA</div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Affichage du signalement sélectionné */}
              {selectedSignalement && (
                <Card className="mt-2 border-blue-200 bg-blue-50/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-blue-900 break-words">{selectedSignalement.titre}</div>
                        <div className="text-sm text-blue-700 mt-1 space-y-1">
                          <div className="break-words">Référence: {selectedSignalement.reference_id}</div>
                          <div>Montant: {selectedSignalement.montant}</div>
                          <div className="break-words">Localisation: {selectedSignalement.location}</div>
                          <div>Score IA: {selectedSignalement.ai_priority_score}/100</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sélection de raison préremplie */}
            <div className="space-y-2">
              <Label>Raison de l'Activation *</Label>
              <Popover open={showRaisonSearch} onOpenChange={setShowRaisonSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showRaisonSearch}
                    className="w-full justify-between min-h-[40px]"
                  >
                    {selectedRaison ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedRaison.urgence === 'Critique' ? 'destructive' : 'secondary'}>
                          {selectedRaison.urgence}
                        </Badge>
                        <span className="truncate">{selectedRaison.titre}</span>
                      </div>
                    ) : (
                      "Sélectionner une raison d'activation..."
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher une raison..." />
                    <CommandList>
                      <CommandEmpty>Aucune raison trouvée.</CommandEmpty>
                      <CommandGroup>
                        {RAISONS_PREEMPLIES.map((raison) => (
                          <CommandItem
                            key={raison.id}
                            value={raison.titre}
                            onSelect={() => handleSelectRaison(raison)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <Badge variant={raison.urgence === 'Critique' ? 'destructive' : 'secondary'}>
                                {raison.urgence}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{raison.titre}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {raison.description}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Durée recommandée: {raison.duree_recommandee}h
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Affichage de la raison sélectionnée */}
              {selectedRaison && (
                <Card className="mt-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-green-900 break-words">{selectedRaison.titre}</div>
                        <div className="text-sm text-green-700 mt-1 break-words">
                          {selectedRaison.description}
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          Durée recommandée: {selectedRaison.duree_recommandee} heures
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sélection de référence légale */}
            <div className="space-y-2">
              <Label>Autorisation Judiciaire *</Label>
              <Popover open={showLegalSearch} onOpenChange={setShowLegalSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showLegalSearch}
                    className="w-full justify-between min-h-[40px]"
                  >
                    {selectedLegal ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {selectedLegal.type}
                        </Badge>
                        <span className="truncate">{selectedLegal.numero}</span>
                      </div>
                    ) : (
                      "Sélectionner une autorisation judiciaire..."
                    )}
                    <Gavel className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher une loi ou décret..." />
                    <CommandList>
                      <CommandEmpty>Aucune référence trouvée.</CommandEmpty>
                      <CommandGroup>
                        {LOIS_ET_DECRETS.map((legal) => (
                          <CommandItem
                            key={legal.id}
                            value={legal.reference}
                            onSelect={() => handleSelectLegal(legal)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <div className="flex items-center gap-2">
                                {legal.type === 'Loi' && <BookOpen className="h-4 w-4 text-blue-600" />}
                                {legal.type === 'Décret' && <Crown className="h-4 w-4 text-purple-600" />}
                                {legal.type === 'Ordonnance' && <Gavel className="h-4 w-4 text-red-600" />}
                                <Badge variant="outline">{legal.type}</Badge>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{legal.numero}</div>
                                <div className="text-sm text-muted-foreground">
                                  {legal.reference}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {legal.article} • {legal.description}
                                </div>
                              </div>
            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Affichage de la référence légale sélectionnée */}
              {selectedLegal && (
                <Card className="mt-2 border-purple-200 bg-purple-50/50">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {selectedLegal.type === 'Loi' && <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />}
                        {selectedLegal.type === 'Décret' && <Crown className="h-5 w-5 text-purple-600 mt-0.5" />}
                        {selectedLegal.type === 'Ordonnance' && <Gavel className="h-5 w-5 text-purple-600 mt-0.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-purple-900 break-words">{selectedLegal.numero}</div>
                        <div className="text-sm text-purple-700 mt-1 break-words">
                          {selectedLegal.reference}
                        </div>
                        <div className="text-xs text-purple-600 mt-2 break-words">
                          {selectedLegal.article} • {selectedLegal.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Durée de protection avec suggestion automatique */}
            <div className="space-y-2">
              <Label>Durée de Protection (heures)</Label>
              <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="72"
                value={activationForm.duree_heures || 24}
                onChange={(e) => setActivationForm(prev => ({
                  ...prev,
                  duree_heures: parseInt(e.target.value)
                }))}
                  className="flex-1"
                />
                {selectedRaison && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActivationForm(prev => ({
                      ...prev,
                      duree_heures: selectedRaison.duree_recommandee
                    }))}
                  >
                    {selectedRaison.duree_recommandee}h
                  </Button>
                )}
              </div>
              {selectedRaison && (
                <p className="text-xs text-muted-foreground">
                  Durée recommandée pour cette raison: {selectedRaison.duree_recommandee} heures
                </p>
              )}
            </div>

            <Alert className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900 dark:text-red-100">
                L'activation du protocole XR-7 déclenchera immédiatement :
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Notification automatique du Procureur de la République</li>
                  <li>Protection renforcée des témoins identifiés</li>
                  <li>Horodatage blockchain de toutes les preuves</li>
                  <li>Audit trail complet pour traçabilité judiciaire</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowActivationDialog(false)}
              disabled={isActivating}
            >
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleActiverProtocole}
              disabled={isActivating}
            >
              {isActivating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Activation en cours...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Confirmer Activation XR-7
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFiltres} onOpenChange={setShowFiltres}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtres de Recherche Avancés
            </DialogTitle>
            <DialogDescription>
              Affinez vos critères de recherche pour trouver les signalements critiques
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <div className="grid grid-cols-2 gap-2">
                {['pending', 'in_progress', 'under_investigation', 'xr7_protocol_active'].map(statut => (
                  <div key={statut} className="flex items-center space-x-2">
                    <Checkbox
                      id={`statut-${statut}`}
                      checked={filtres.statut.includes(statut)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltres(prev => ({ ...prev, statut: [...prev.statut, statut] }));
                        } else {
                          setFiltres(prev => ({ ...prev, statut: prev.statut.filter(s => s !== statut) }));
                        }
                      }}
                    />
                    <Label htmlFor={`statut-${statut}`} className="cursor-pointer">
                      {statut === 'pending' ? 'En attente' : 
                       statut === 'in_progress' ? 'En cours' : 
                       statut === 'under_investigation' ? 'En enquête' : 'XR-7 Actif'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priorité</Label>
              <div className="grid grid-cols-2 gap-2">
                {['critique', 'urgent', 'high', 'normal'].map(priorite => (
                  <div key={priorite} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priorite-${priorite}`}
                      checked={filtres.priorite.includes(priorite)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltres(prev => ({ ...prev, priorite: [...prev.priorite, priorite] }));
                        } else {
                          setFiltres(prev => ({ ...prev, priorite: prev.priorite.filter(p => p !== priorite) }));
                        }
                      }}
                    />
                    <Label htmlFor={`priorite-${priorite}`} className="cursor-pointer capitalize">
                      {priorite}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Montant Minimum (Mrd FCFA)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filtres.montantMin}
                  onChange={(e) => setFiltres(prev => ({ ...prev, montantMin: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Montant Maximum (Mrd FCFA)</Label>
                <Input
                  type="number"
                  placeholder="Illimité"
                  value={filtres.montantMax}
                  onChange={(e) => setFiltres(prev => ({ ...prev, montantMax: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Score IA Minimum</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={filtres.scoreIAMin}
                  onChange={(e) => setFiltres(prev => ({ ...prev, scoreIAMin: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[50px] justify-center">
                  {filtres.scoreIAMin}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catégories</Label>
              <div className="grid grid-cols-2 gap-2">
                {['detournement_fonds', 'enrichissement_illicite', 'malversation_gab_peche', 'corruption_marches_publics'].map(cat => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={filtres.categorie.includes(cat)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltres(prev => ({ ...prev, categorie: [...prev.categorie, cat] }));
                        } else {
                          setFiltres(prev => ({ ...prev, categorie: prev.categorie.filter(c => c !== cat) }));
                        }
                      }}
                    />
                    <Label htmlFor={`cat-${cat}`} className="cursor-pointer text-xs">
                      {cat.replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Localisation</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Libreville', 'Franceville', 'Port-Gentil', 'Oyem', 'Moanda', 'Lambaréné'].map(loc => (
                  <div key={loc} className="flex items-center space-x-2">
                    <Checkbox
                      id={`loc-${loc}`}
                      checked={filtres.localisation.includes(loc)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltres(prev => ({ ...prev, localisation: [...prev.localisation, loc] }));
                        } else {
                          setFiltres(prev => ({ ...prev, localisation: prev.localisation.filter(l => l !== loc) }));
                        }
                      }}
                    />
                    <Label htmlFor={`loc-${loc}`} className="cursor-pointer text-xs">
                      {loc}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4 flex justify-between">
            <Button variant="outline" onClick={reinitialiserFiltres}>
              <CloseIcon className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFiltres(false)}>
                Annuler
              </Button>
              <Button onClick={appliquerFiltres}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Appliquer les Filtres
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              Validation Multi-Niveaux Protocole XR-7
            </DialogTitle>
            <DialogDescription>
              Le protocole XR-7 nécessite 3 niveaux de validation avant activation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {validations.map((validation, index) => (
              <Card key={validation.niveau} className={`border-2 ${
                validation.statut === 'approuve' ? 'border-green-500 bg-green-50/20' :
                validation.statut === 'rejete' ? 'border-red-500 bg-red-50/20' :
                'border-orange-500 bg-orange-50/20'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {validation.niveau === 'super_admin' && <UserCheck className="h-5 w-5 text-blue-600" />}
                      {validation.niveau === 'procureur' && <Gavel className="h-5 w-5 text-purple-600" />}
                      {validation.niveau === 'president' && <Crown className="h-5 w-5 text-yellow-600" />}
                      <div>
                        <div className="font-medium">
                          Niveau {index + 1}: {validation.niveau === 'super_admin' ? 'Super Admin' : 
                                               validation.niveau === 'procureur' ? 'Procureur de la République' : 
                                               'Président'}
                        </div>
                        {validation.date_validation && (
                          <div className="text-xs text-muted-foreground">
                            Validé le {new Date(validation.date_validation).toLocaleString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={
                      validation.statut === 'approuve' ? 'default' : 
                      validation.statut === 'rejete' ? 'destructive' : 
                      'secondary'
                    }>
                      {validation.statut === 'approuve' ? '✓ Approuvé' : 
                       validation.statut === 'rejete' ? '✗ Rejeté' : 
                       '⏳ En attente'}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{validation.commentaire}</p>

                  {validation.statut === 'en_attente' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-green-500 hover:bg-green-50"
                        onClick={() => validerNiveau(validation.niveau, 'approuve', 'Validé')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-500 hover:bg-red-50"
                        onClick={() => validerNiveau(validation.niveau, 'rejete', 'Rejeté')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Toutes les validations doivent être approuvées pour activer le protocole XR-7.
              Un rejet bloque immédiatement le processus.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    </div>
  );
}

