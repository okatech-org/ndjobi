import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Crown, FileText, Shield, BarChart3, Settings, Users, 
  TrendingUp, Activity, AlertCircle, CheckCircle, Clock,
  Eye, Filter, Search, ChevronRight, Calendar, MapPin,
  UserPlus, UserCheck, UserX, Briefcase, Scale, Download,
  XCircle, Loader2, Zap, Brain, AlertTriangle, Package,
  Radio, FileCheck, RefreshCw, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  analyzeSignalement, 
  scoreAndUpdateSignalement, 
  getTopPrioritySignalements,
  type SignalementScoring 
} from '@/services/signalementScoring';

interface Signalement {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string | null;
  location: string | null;
  created_at: string;
  user_id: string | null;
  is_anonymous: boolean | null;
  attachments: any;
  resolved_at: string | null;
  resolved_by: string | null;
  metadata?: any;
  ai_priority_score?: number;
  ai_credibility_score?: number;
  corruption_category?: string;
  ai_analysis?: any;
}

interface Agent {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  organization: string | null;
  created_at: string;
}

interface Projet {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  protection_type: string | null;
  protection_number: string | null;
  protected_at: string | null;
  created_at: string;
  user_id: string | null;
  is_anonymous: boolean | null;
}

interface EmergencyActivation {
  id: string;
  reason: string;
  status: string;
  start_date: string;
  end_date: string;
  activated_by: string;
  duration_hours: number;
  judicial_authorization: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [emergencyActivations, setEmergencyActivations] = useState<EmergencyActivation[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const [selectedCase, setSelectedCase] = useState<Signalement | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [scoringDialogOpen, setScoringDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [currentScoring, setCurrentScoring] = useState<SignalementScoring | null>(null);
  
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    inProgressCases: 0,
    resolvedCases: 0,
    rejectedCases: 0,
    totalAgents: 0,
    activeAgents: 0,
    totalProjects: 0,
    protectedProjects: 0,
    activeEmergencies: 0,
    monthlyResolution: 0,
    averageTime: '0',
    satisfaction: 0,
    avgPriorityScore: 0,
    avgCredibilityScore: 0,
    highPriorityCases: 0
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    if (view) {
      setActiveView(view);
    } else {
      setActiveView('dashboard');
    }
  }, [location.search]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (user && role !== 'admin' && role !== 'super_admin') {
      navigate(getDashboardUrl(role));
    } else if (user) {
      fetchData();
    }
  }, [user, isLoading, role, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSignalements(),
        fetchAgents(),
        fetchProjets(),
        fetchEmergencyActivations(),
        calculateStats()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSignalements = async () => {
    try {
      const { data, error } = await supabase
        .from('signalements')
        .select('*')
        .order('ai_priority_score', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignalements(data || []);
    } catch (error) {
      console.error('Erreur fetch signalements:', error);
      throw error;
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, organization, created_at')
        .eq('role', 'agent');

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Erreur fetch agents:', error);
      throw error;
    }
  };

  const fetchProjets = async () => {
    try {
      const { data, error } = await supabase
        .from('projets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjets(data || []);
    } catch (error) {
      console.error('Erreur fetch projets:', error);
      throw error;
    }
  };

  const fetchEmergencyActivations = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_activations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEmergencyActivations(data || []);
    } catch (error) {
      console.error('Erreur fetch emergencies:', error);
      throw error;
    }
  };

  const calculateStats = async () => {
    try {
      const { data: allCases, error } = await supabase
        .from('signalements')
        .select('status, created_at, resolved_at, ai_priority_score, ai_credibility_score');

      if (error) throw error;

      const total = allCases?.length || 0;
      const pending = allCases?.filter(c => c.status === 'pending').length || 0;
      const inProgress = allCases?.filter(c => c.status === 'in_progress').length || 0;
      const resolved = allCases?.filter(c => c.status === 'resolved').length || 0;
      const rejected = allCases?.filter(c => c.status === 'rejected').length || 0;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthCases = allCases?.filter(c => {
        const date = new Date(c.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }) || [];
      
      const monthResolved = monthCases.filter(c => c.status === 'resolved').length;
      const resolutionRate = monthCases.length > 0 ? Math.round((monthResolved / monthCases.length) * 100) : 0;

      const resolvedWithTime = allCases?.filter(c => c.resolved_at && c.created_at) || [];
      let avgDays = 0;
      if (resolvedWithTime.length > 0) {
        const totalDays = resolvedWithTime.reduce((sum, c) => {
          const start = new Date(c.created_at).getTime();
          const end = new Date(c.resolved_at!).getTime();
          return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0);
        avgDays = totalDays / resolvedWithTime.length;
      }

      const scoredCases = signalements.filter(c => c.ai_priority_score !== null && c.ai_priority_score !== undefined) || [];
      const avgPriority = scoredCases.length > 0
        ? Math.round(scoredCases.reduce((sum, c) => sum + (c.ai_priority_score || 0), 0) / scoredCases.length)
        : 0;
      
      const avgCredibility = scoredCases.length > 0
        ? Math.round(scoredCases.reduce((sum, c) => sum + (c.ai_credibility_score || 0), 0) / scoredCases.length)
        : 0;

      const highPriority = signalements.filter(c => (c.ai_priority_score || 0) >= 75).length || 0;

      setStats({
        totalCases: total,
        pendingCases: pending,
        inProgressCases: inProgress,
        resolvedCases: resolved,
        rejectedCases: rejected,
        totalAgents: agents.length,
        activeAgents: agents.length,
        totalProjects: projets.length,
        protectedProjects: projets.filter(p => p.status === 'protected').length,
        activeEmergencies: emergencyActivations.filter(e => e.status === 'active').length,
        monthlyResolution: resolutionRate,
        averageTime: avgDays.toFixed(1),
        satisfaction: 4.7,
        avgPriorityScore: avgPriority,
        avgCredibilityScore: avgCredibility,
        highPriorityCases: highPriority
      });
    } catch (error) {
      console.error('Erreur calcul stats:', error);
      throw error;
    }
  };

  const handleAnalyzeWithAI = async (cas: Signalement) => {
    setActionLoading(cas.id);
    try {
      const scoring = await scoreAndUpdateSignalement({
        id: cas.id,
        title: cas.title,
        description: cas.description,
        type: cas.type,
        location: cas.location || undefined,
        attachments: cas.attachments,
        created_at: cas.created_at
      });

      setCurrentScoring(scoring);
      setSelectedCase(cas);
      setScoringDialogOpen(true);

      toast({
        title: 'Analyse IA terminée',
        description: `Score de priorité: ${scoring.priorityScore}/100, Crédibilité: ${scoring.credibilityScore}/100`
      });

      await fetchData();
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'analyser le signalement',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleValidateCase = async (caseId: string) => {
    setActionLoading(caseId);
    try {
      const { error } = await supabase
        .from('signalements')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;


      toast({
        title: 'Cas validé',
        description: 'Le cas a été validé et est maintenant en cours de traitement'
      });

      await fetchData();
    } catch (error) {
      console.error('Erreur validation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de valider le cas',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCase = async () => {
    if (!selectedCase || !rejectReason.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez fournir une raison pour le rejet',
        variant: 'destructive'
      });
      return;
    }

    setActionLoading(selectedCase.id);
    try {
      const { error } = await supabase
        .from('signalements')
        .update({ 
          status: 'rejected',
          metadata: {
            ...selectedCase.metadata,
            rejection_reason: rejectReason,
            rejected_at: new Date().toISOString(),
            rejected_by: user?.id
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCase.id);

      if (error) throw error;


      toast({
        title: 'Cas rejeté',
        description: 'Le cas a été rejeté avec succès'
      });

      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedCase(null);
      await fetchData();
    } catch (error) {
      console.error('Erreur rejet:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter le cas',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignCase = async () => {
    if (!selectedCase || !selectedAgent) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un agent',
        variant: 'destructive'
      });
      return;
    }

    setActionLoading(selectedCase.id);
    try {
      const { error } = await supabase
        .from('signalements')
        .update({ 
          metadata: {
            ...selectedCase.metadata,
            assigned_to: selectedAgent,
            assigned_at: new Date().toISOString(),
            assigned_by: user?.id
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCase.id);

      if (error) throw error;


      toast({
        title: 'Agent assigné',
        description: 'L\'agent a été assigné au cas avec succès'
      });

      setAssignDialogOpen(false);
      setSelectedAgent('');
      setSelectedCase(null);
      await fetchData();
    } catch (error) {
      console.error('Erreur assignation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'assigner l\'agent',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (cas: Signalement) => {
    setSelectedCase(cas);
    setDetailsDialogOpen(true);
  };

  const handleOpenAssignDialog = (cas: Signalement) => {
    setSelectedCase(cas);
    setAssignDialogOpen(true);
  };

  const handleOpenRejectDialog = (cas: Signalement) => {
    setSelectedCase(cas);
    setRejectDialogOpen(true);
  };

  const getFilteredCases = () => {
    return signalements.filter(cas => {
      const matchesSearch = searchTerm === '' || 
        cas.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cas.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || cas.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || cas.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || cas.corruption_category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || 
        (priorityFilter === 'critique' && (cas.ai_priority_score || 0) >= 80) ||
        (priorityFilter === 'haute' && (cas.ai_priority_score || 0) >= 65 && (cas.ai_priority_score || 0) < 80) ||
        (priorityFilter === 'moyenne' && (cas.ai_priority_score || 0) >= 45 && (cas.ai_priority_score || 0) < 65) ||
        (priorityFilter === 'basse' && (cas.ai_priority_score || 0) < 45);

      return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesPriority;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Il y a moins d\'1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const getPriorityBadge = (score: number | null | undefined) => {
    if (!score) return null;
    if (score >= 80) return <Badge variant="destructive">Critique ({score})</Badge>;
    if (score >= 65) return <Badge variant="default" className="bg-orange-500">Haute ({score})</Badge>;
    if (score >= 45) return <Badge variant="default">Moyenne ({score})</Badge>;
    return <Badge variant="secondary">Basse ({score})</Badge>;
  };

  const getCredibilityBadge = (score: number | null | undefined) => {
    if (!score) return null;
    if (score >= 70) return <Badge variant="default" className="bg-green-600">Crédible ({score})</Badge>;
    if (score >= 50) return <Badge variant="outline">Modéré ({score})</Badge>;
    return <Badge variant="secondary">Faible ({score})</Badge>;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des données du Protocole d'État...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              Signalements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stats.pendingCases} en attente
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.highPriorityCases} prioritaires
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-purple-500" />
              Scoring IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Priorité moyenne</span>
                  <span className="font-bold">{stats.avgPriorityScore}/100</span>
                </div>
                <Progress value={stats.avgPriorityScore} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Crédibilité moyenne</span>
                  <span className="font-bold">{stats.avgCredibilityScore}/100</span>
                </div>
                <Progress value={stats.avgCredibilityScore} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Taux de Résolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyResolution}%</div>
            <Progress value={stats.monthlyResolution} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.resolvedCases} cas résolus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-500" />
              Agents DGSS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                {stats.activeAgents} actifs
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-indigo-500" />
              Projets Protégés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.protectedProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur {stats.totalProjects} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Radio className="h-4 w-4 text-red-500" />
              Urgences XR-7
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmergencies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Activations actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-orange-500" />
              Temps Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageTime}j</div>
            <p className="text-xs text-muted-foreground mt-1">Par dossier</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cas Prioritaires (IA)</CardTitle>
              <CardDescription>Signalements à forte priorité nécessitant votre attention</CardDescription>
            </div>
            <Badge variant="destructive">{stats.highPriorityCases} critiques</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {signalements.filter(s => (s.ai_priority_score || 0) >= 75 && s.status === 'pending').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun cas prioritaire en attente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signalements
                .filter(s => (s.ai_priority_score || 0) >= 75 && s.status === 'pending')
                .slice(0, 5)
                .map((cas) => (
                  <div key={cas.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors border-l-4 border-l-red-500">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="font-medium">{cas.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap mt-1">
                          <span>{cas.corruption_category || cas.type}</span>
                          {cas.location && (
                            <>
                              <span>•</span>
                              <MapPin className="h-3 w-3" />
                              <span>{cas.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPriorityBadge(cas.ai_priority_score)}
                        {getCredibilityBadge(cas.ai_credibility_score)}
                        {cas.is_anonymous && (
                          <Badge variant="outline">Anonyme</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(cas.created_at)}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(cas)}
                        disabled={actionLoading === cas.id}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleValidateCase(cas.id)}
                        disabled={actionLoading === cas.id}
                      >
                        {actionLoading === cas.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Valider
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Responsabilité Présidentielle</AlertTitle>
        <AlertDescription>
          En tant qu'administrateur du Protocole d'État, vous supervisez la lutte nationale contre la corruption.
          Toutes vos actions sont enregistrées conformément aux protocoles de sécurité nationale.
        </AlertDescription>
      </Alert>
    </>
  );

  const renderValidationView = () => {
    const filteredCases = getFilteredCases();

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Validation des Signalements</CardTitle>
            <CardDescription>Examinez et approuvez les signalements avec assistance IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Input 
                placeholder="Rechercher..." 
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  <SelectItem value="corruption_administrative">Corruption Administrative</SelectItem>
                  <SelectItem value="corruption_economique">Corruption Économique</SelectItem>
                  <SelectItem value="detournement_fonds">Détournement de Fonds</SelectItem>
                  <SelectItem value="fraude">Fraude</SelectItem>
                  <SelectItem value="abus_pouvoir">Abus de Pouvoir</SelectItem>
                  <SelectItem value="nepotisme">Népotisme</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes priorités</SelectItem>
                  <SelectItem value="critique">Critique (≥80)</SelectItem>
                  <SelectItem value="haute">Haute (65-79)</SelectItem>
                  <SelectItem value="moyenne">Moyenne (45-64)</SelectItem>
                  <SelectItem value="basse">Basse (&lt;45)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolus</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                  <SelectItem value="all">Tous</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                  setStatusFilter('pending');
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>

            {filteredCases.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun cas trouvé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCases.map((cas) => (
                  <Card key={cas.id} className={`border-l-4 ${
                    (cas.ai_priority_score || 0) >= 80 ? 'border-l-red-500' :
                    (cas.ai_priority_score || 0) >= 65 ? 'border-l-orange-500' :
                    'border-l-primary'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg">{cas.title}</h3>
                            {getPriorityBadge(cas.ai_priority_score)}
                            {getCredibilityBadge(cas.ai_credibility_score)}
                            <Badge variant="outline">{cas.corruption_category || cas.type}</Badge>
                            {cas.is_anonymous && (
                              <Badge variant="outline">Anonyme</Badge>
                            )}
                            {cas.attachments && Object.keys(cas.attachments).length > 0 && (
                              <Badge variant="outline" className="bg-green-50">
                                <FileText className="h-3 w-3 mr-1" />
                                Preuves
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm line-clamp-2">{cas.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            {cas.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cas.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(cas.created_at)}
                            </span>
                            <Badge variant={
                              cas.status === 'pending' ? 'secondary' :
                              cas.status === 'in_progress' ? 'default' :
                              cas.status === 'resolved' ? 'outline' :
                              'destructive'
                            }>
                              {cas.status === 'pending' ? 'En attente' :
                               cas.status === 'in_progress' ? 'En cours' :
                               cas.status === 'resolved' ? 'Résolu' :
                               'Rejeté'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4 flex-wrap">
                          {!cas.ai_priority_score && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAnalyzeWithAI(cas)}
                              disabled={actionLoading === cas.id}
                            >
                              <Brain className="h-4 w-4 mr-1" />
                              Analyser IA
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(cas)}
                            disabled={actionLoading === cas.id}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                          {cas.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenAssignDialog(cas)}
                                disabled={actionLoading === cas.id}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Assigner
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleValidateCase(cas.id)}
                                disabled={actionLoading === cas.id}
                              >
                                {actionLoading === cas.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Valider
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleOpenRejectDialog(cas)}
                                disabled={actionLoading === cas.id}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Rejeter
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAgentsView = () => {
    const getAgentCaseCount = (agentId: string) => {
      return signalements.filter(s => 
        s.metadata && typeof s.metadata === 'object' && 
        'assigned_to' in s.metadata && s.metadata.assigned_to === agentId
      ).length;
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestion des Agents DGSS</h2>
          <Button onClick={() => {
            toast({
              title: 'Fonctionnalité en développement',
              description: 'L\'ajout d\'agents sera disponible prochainement'
            });
          }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nouvel Agent
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{agents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cas Assignés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {signalements.filter(s => s.metadata && 'assigned_to' in s.metadata).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{agents.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Agents</CardTitle>
            <CardDescription>Tous les agents sous votre supervision</CardDescription>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun agent enregistré</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Cas Assignés</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="font-medium">{agent.full_name || 'Agent'}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{agent.email}</span>
                      </TableCell>
                      <TableCell>{agent.organization || 'DGSS'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getAgentCaseCount(agent.id)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Actif</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: 'Détails de l\'agent',
                                description: `Agent: ${agent.full_name || 'Agent'}`
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: 'Fonctionnalité en développement',
                                description: 'La configuration sera disponible prochainement'
                              });
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProjetsView = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projets Protégés</CardTitle>
          <CardDescription>Supervision des projets protégés par blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          {projets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun projet protégé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projets.map((projet) => (
                <Card key={projet.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{projet.title}</h3>
                          <Badge>{projet.category}</Badge>
                          <Badge variant={projet.status === 'protected' ? 'default' : 'secondary'}>
                            {projet.status === 'protected' ? 'Protégé' : 'En attente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{projet.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {projet.protection_number && (
                            <span>N° {projet.protection_number}</span>
                          )}
                          <span>{formatDate(projet.created_at)}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEmergencyView = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500" />
            Module d'Urgence XR-7
          </CardTitle>
          <CardDescription>Activations d'urgence et protocoles judiciaires</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Accès Restreint</AlertTitle>
            <AlertDescription>
              Le module XR-7 nécessite une autorisation judiciaire préalable. 
              Toutes les activations sont enregistrées et auditées.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Activations Actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.activeEmergencies}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Activations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emergencyActivations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Taux de Succès</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
              </CardContent>
            </Card>
          </div>

          {emergencyActivations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune activation d'urgence</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emergencyActivations.map((activation) => (
                <Card key={activation.id} className={`border-l-4 ${
                  activation.status === 'active' ? 'border-l-red-500' : 'border-l-gray-400'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{activation.reason}</h3>
                          <Badge variant={activation.status === 'active' ? 'destructive' : 'secondary'}>
                            {activation.status === 'active' ? 'Active' : 'Terminée'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Durée: {activation.duration_hours}h</span>
                          <span>Autorisation: {activation.judicial_authorization}</span>
                          <span>{formatDate(activation.created_at)}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderReportsView = () => {
    const handleGenerateReport = (type: string) => {
      toast({
        title: 'Génération du rapport',
        description: `Le rapport ${type} sera disponible dans quelques instants`
      });
    };

    const regionStats = signalements.reduce((acc, sig) => {
      const region = sig.location || 'Non spécifié';
      if (!acc[region]) {
        acc[region] = { total: 0, resolved: 0, avgPriority: 0, prioritySum: 0, count: 0 };
      }
      acc[region].total++;
      if (sig.status === 'resolved') {
        acc[region].resolved++;
      }
      if (sig.ai_priority_score) {
        acc[region].prioritySum += sig.ai_priority_score;
        acc[region].count++;
      }
      return acc;
    }, {} as Record<string, { total: number; resolved: number; avgPriority: number; prioritySum: number; count: number }>);

    const regionData = Object.entries(regionStats).map(([region, data]) => ({
      region,
      signaled: data.total,
      resolved: data.resolved,
      rate: data.total > 0 ? ((data.resolved / data.total) * 100).toFixed(1) : 0,
      avgPriority: data.count > 0 ? Math.round(data.prioritySum / data.count) : 0
    }));

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rapports Stratégiques</CardTitle>
            <CardDescription>Analyses pour la vision politique 2025</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Efficacité Globale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">{stats.monthlyResolution}%</div>
                  <Progress value={stats.monthlyResolution} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Objectif: assainissement budgétaire
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Impact Économique</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.resolvedCases}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cas résolus contribuant à la souveraineté économique
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Innovation Protégée</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">{stats.protectedProjects}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Projets soutenant la diversification
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => handleGenerateReport('mensuel')}
              >
                <FileText className="h-6 w-6" />
                <span>Rapport Mensuel</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => handleGenerateReport('tendances')}
              >
                <TrendingUp className="h-6 w-6" />
                <span>Analyse Tendances</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => handleGenerateReport('statistiques')}
              >
                <BarChart3 className="h-6 w-6" />
                <span>Statistiques</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => handleGenerateReport('juridique')}
              >
                <Scale className="h-6 w-6" />
                <span>Rapport Juridique</span>
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Performance par Région</h3>
              {regionData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune donnée régionale disponible</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Région</TableHead>
                      <TableHead>Cas Signalés</TableHead>
                      <TableHead>Cas Résolus</TableHead>
                      <TableHead>Taux de Résolution</TableHead>
                      <TableHead>Priorité Moyenne</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regionData.map((data, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{data.region}</TableCell>
                        <TableCell>{data.signaled}</TableCell>
                        <TableCell>{data.resolved}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={Number(data.rate)} className="w-20 h-2" />
                            <span>{data.rate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {data.avgPriority > 0 ? (
                            <Badge variant={data.avgPriority >= 75 ? 'destructive' : 'default'}>
                              {data.avgPriority}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSettingsView = () => {
    const handleSettingClick = (setting: string) => {
      toast({
        title: 'Paramètre',
        description: `Configuration de ${setting} disponible prochainement`
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Paramètres Présidentiels</CardTitle>
          <CardDescription>Configuration et préférences du système</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <div>
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">Recevoir les alertes pour les cas critiques</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSettingClick('notifications')}
              >
                Configurer
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <div>
                <h3 className="font-medium">Seuils d'Alerte IA</h3>
                <p className="text-sm text-muted-foreground">Définir les scores de priorité automatiques</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSettingClick('seuils IA')}
              >
                Modifier
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <div>
                <h3 className="font-medium">Délégation</h3>
                <p className="text-sm text-muted-foreground">Gérer les permissions des agents</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSettingClick('délégation')}
              >
                Gérer
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <div>
                <h3 className="font-medium">Templates de Rapports</h3>
                <p className="text-sm text-muted-foreground">Modèles personnalisés pour le Président</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSettingClick('templates')}
              >
                Voir
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <div>
                <h3 className="font-medium">Actualiser les données</h3>
                <p className="text-sm text-muted-foreground">Rafraîchir toutes les statistiques et analyses IA</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  fetchData();
                  toast({
                    title: 'Actualisation',
                    description: 'Les données sont en cours d\'actualisation'
                  });
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </>
                )}
              </Button>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Sécurité Nationale</AlertTitle>
            <AlertDescription>
              Toutes les modifications des paramètres présidentiels sont journalisées, auditées 
              et tracées conformément aux protocoles de sécurité de la République du Gabon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  };

  const getDashboardUrl = (userRole: string | null) => {
    switch (userRole) {
      case 'super_admin': return '/dashboard/super-admin';
      case 'admin': return '/dashboard/admin';
      case 'agent': return '/dashboard/agent';
      default: return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Crown className="h-8 w-8 text-yellow-500" />
                Protocole d'État
              </h1>
              <p className="text-muted-foreground mt-2">
                Tableau de bord présidentiel - Supervision nationale et intelligence artificielle
              </p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              <Crown className="h-5 w-5 mr-2" />
              Administrateur
            </Badge>
          </div>

          <Card>
            <CardContent className="p-6">
              <Tabs value={activeView} onValueChange={setActiveView}>
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="validation" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Validation</span>
                  </TabsTrigger>
                  <TabsTrigger value="agents" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Agents</span>
                  </TabsTrigger>
                  <TabsTrigger value="projets" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Projets</span>
                  </TabsTrigger>
                  <TabsTrigger value="emergency" className="flex items-center gap-2">
                    <Radio className="h-4 w-4" />
                    <span className="hidden sm:inline">XR-7</span>
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Rapports</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Paramètres</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-6">
                  <div className="space-y-6">
                    {renderDashboard()}
                  </div>
                </TabsContent>
                <TabsContent value="validation" className="mt-6">
                  {renderValidationView()}
                </TabsContent>
                <TabsContent value="agents" className="mt-6">
                  {renderAgentsView()}
                </TabsContent>
                <TabsContent value="projets" className="mt-6">
                  {renderProjetsView()}
                </TabsContent>
                <TabsContent value="emergency" className="mt-6">
                  {renderEmergencyView()}
                </TabsContent>
                <TabsContent value="reports" className="mt-6">
                  {renderReportsView()}
                </TabsContent>
                <TabsContent value="settings" className="mt-6">
                  {renderSettingsView()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du Signalement</DialogTitle>
            <DialogDescription>Informations complètes avec analyse IA</DialogDescription>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Titre</h3>
                <p>{selectedCase.title}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedCase.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Type / Catégorie</h3>
                  <Badge>{selectedCase.corruption_category || selectedCase.type}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Priorité IA</h3>
                  {getPriorityBadge(selectedCase.ai_priority_score)}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Crédibilité IA</h3>
                  {getCredibilityBadge(selectedCase.ai_credibility_score)}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Statut</h3>
                  <Badge variant="outline">{selectedCase.status}</Badge>
                </div>
              </div>
              {selectedCase.location && (
                <div>
                  <h3 className="font-semibold mb-2">Localisation</h3>
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedCase.location}
                  </p>
                </div>
              )}
              {selectedCase.ai_analysis && (
                <div>
                  <h3 className="font-semibold mb-2">Analyse IA</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Résumé:</strong> {selectedCase.ai_analysis.summary}</p>
                    {selectedCase.ai_analysis.keyFactors && selectedCase.ai_analysis.keyFactors.length > 0 && (
                      <div>
                        <strong>Facteurs clés:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {selectedCase.ai_analysis.keyFactors.map((factor: string, i: number) => (
                            <li key={i}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedCase.ai_analysis.suggestedActions && selectedCase.ai_analysis.suggestedActions.length > 0 && (
                      <div>
                        <strong>Actions suggérées:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {selectedCase.ai_analysis.suggestedActions.map((action: string, i: number) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {selectedCase.is_anonymous && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Signalement Anonyme</AlertTitle>
                  <AlertDescription>
                    Ce signalement a été soumis de manière anonyme. L'identité du signalant est protégée.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scoringDialogOpen} onOpenChange={setScoringDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Résultats de l'Analyse IA</DialogTitle>
            <DialogDescription>Scoring et recommandations pour le signalement</DialogDescription>
          </DialogHeader>
          {currentScoring && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Score de Priorité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{currentScoring.priorityScore}/100</div>
                    <Progress value={currentScoring.priorityScore} className="mt-2" />
                    <Badge className="mt-2" variant={
                      currentScoring.urgency === 'critique' ? 'destructive' : 'default'
                    }>
                      {currentScoring.urgency}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Score de Crédibilité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{currentScoring.credibilityScore}/100</div>
                    <Progress value={currentScoring.credibilityScore} className="mt-2" />
                  </CardContent>
                </Card>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Catégorie Détectée</h3>
                <Badge>{currentScoring.corruptionType}</Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Impact Estimé</h3>
                <p className="text-sm">{currentScoring.estimatedImpact}</p>
              </div>
              {currentScoring.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recommandations</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {currentScoring.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Analyse Détaillée</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Résumé:</strong> {currentScoring.aiAnalysis.summary}</p>
                  {currentScoring.aiAnalysis.keyFactors.length > 0 && (
                    <div>
                      <strong>Facteurs clés:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {currentScoring.aiAnalysis.keyFactors.map((factor, i) => (
                          <li key={i}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setScoringDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un Agent DGSS</DialogTitle>
            <DialogDescription>Sélectionnez un agent pour traiter ce cas</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.full_name || agent.email} - {agent.organization || 'DGSS'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAssignDialogOpen(false);
              setSelectedAgent('');
            }}>
              Annuler
            </Button>
            <Button 
              onClick={handleAssignCase}
              disabled={!selectedAgent || actionLoading === selectedCase?.id}
            >
              {actionLoading === selectedCase?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assignation...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assigner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le Signalement</DialogTitle>
            <DialogDescription>Veuillez fournir une raison détaillée pour le rejet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Raison du rejet..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason('');
            }}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectCase}
              disabled={!rejectReason.trim() || actionLoading === selectedCase?.id}
            >
              {actionLoading === selectedCase?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejet...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
