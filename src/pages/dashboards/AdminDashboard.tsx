import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Crown, FileText, Shield, BarChart3, Settings, Users, 
  TrendingUp, Activity, AlertCircle, CheckCircle, Clock,
  Eye, Filter, Search, ChevronRight, Calendar, MapPin,
  UserPlus, UserCheck, UserX, Briefcase, Scale, Download,
  XCircle, Loader2
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
}

interface Agent {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  organization: string | null;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  
  const [selectedCase, setSelectedCase] = useState<Signalement | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    resolvedCases: 0,
    rejectedCases: 0,
    totalAgents: 0,
    activeAgents: 0,
    monthlyResolution: 0,
    averageTime: '0',
    satisfaction: 0
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
    } else if (user) {
      fetchData();
    }
  }, [user, isLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSignalements(),
        fetchAgents(),
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

  const calculateStats = async () => {
    try {
      const { data: allCases, error } = await supabase
        .from('signalements')
        .select('status, created_at, resolved_at');

      if (error) throw error;

      const total = allCases?.length || 0;
      const pending = allCases?.filter(c => c.status === 'pending').length || 0;
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

      setStats({
        totalCases: total,
        pendingCases: pending,
        resolvedCases: resolved,
        rejectedCases: rejected,
        totalAgents: agents.length,
        activeAgents: agents.length,
        monthlyResolution: resolutionRate,
        averageTime: avgDays.toFixed(1),
        satisfaction: 4.7
      });
    } catch (error) {
      console.error('Erreur calcul stats:', error);
      throw error;
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

      return matchesSearch && matchesType && matchesStatus;
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

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    const variants: Record<string, 'destructive' | 'default' | 'secondary'> = {
      'haute': 'destructive',
      'urgente': 'destructive',
      'moyenne': 'default',
      'basse': 'secondary'
    };
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const renderDashboard = () => (
    <>
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              Cas Totaux
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
            <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
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

      {/* Cas récents à valider */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cas en Attente de Validation</CardTitle>
              <CardDescription>Signalements nécessitant votre approbation</CardDescription>
            </div>
            <Badge variant="destructive">{stats.pendingCases} nouveaux</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {signalements.filter(s => s.status === 'pending').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun cas en attente de validation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signalements.filter(s => s.status === 'pending').slice(0, 5).map((cas) => (
                <div key={cas.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{cas.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{cas.type}</span>
                        {cas.location && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{cas.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {getPriorityBadge(cas.priority)}
                    {cas.is_anonymous && (
                      <Badge variant="outline">Anonyme</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(cas.created_at)}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(cas)}
                      disabled={actionLoading === cas.id}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Examiner
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

      {/* Graphique d'activité */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Mensuelle</CardTitle>
          <CardDescription>Évolution des cas sur les 30 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const height = Math.random() * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );

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

  const renderValidationView = () => {
    const filteredCases = getFilteredCases();

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Validation des Cas</CardTitle>
            <CardDescription>Examinez et approuvez les signalements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input 
                  placeholder="Rechercher un cas..." 
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type de cas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="corruption">Corruption</SelectItem>
                  <SelectItem value="fraude">Fraude</SelectItem>
                  <SelectItem value="abus_pouvoir">Abus de pouvoir</SelectItem>
                  <SelectItem value="detournement">Détournement</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
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
            </div>

            {filteredCases.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun cas trouvé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCases.map((cas) => (
                  <Card key={cas.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg">{cas.title}</h3>
                            {getPriorityBadge(cas.priority)}
                            <Badge variant="outline">{cas.type}</Badge>
                            {cas.is_anonymous && (
                              <Badge variant="outline">Anonyme</Badge>
                            )}
                            {cas.attachments && Object.keys(cas.attachments).length > 0 && (
                              <Badge variant="outline" className="bg-green-50">
                                <FileText className="h-3 w-3 mr-1" />
                                Pièces jointes
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
                        <div className="flex gap-2 ml-4">
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
        acc[region] = { total: 0, resolved: 0 };
      }
      acc[region].total++;
      if (sig.status === 'resolved') {
        acc[region].resolved++;
      }
      return acc;
    }, {} as Record<string, { total: number; resolved: number }>);

    const regionData = Object.entries(regionStats).map(([region, data]) => ({
      region,
      signaled: data.total,
      resolved: data.resolved,
      rate: data.total > 0 ? ((data.resolved / data.total) * 100).toFixed(1) : 0
    }));

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rapports et Analyses</CardTitle>
            <CardDescription>Vue d'ensemble des performances et statistiques</CardDescription>
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
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Satisfaction Citoyenne</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.satisfaction}/5</div>
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-2 w-8 rounded ${i <= stats.satisfaction ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Impact Social</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">Élevé</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.resolvedCases} cas résolus au total
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
          <CardTitle>Paramètres Administratifs</CardTitle>
          <CardDescription>Configuration et préférences du système</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <div>
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">Recevoir les alertes pour les nouveaux cas</p>
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
                <h3 className="font-medium">Seuils d'Alerte</h3>
                <p className="text-sm text-muted-foreground">Définir les priorités automatiques</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSettingClick('seuils d\'alerte')}
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
                <h3 className="font-medium">Templates</h3>
                <p className="text-sm text-muted-foreground">Modèles de rapports et documents</p>
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
                <p className="text-sm text-muted-foreground">Rafraîchir toutes les statistiques et cas</p>
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
                  <>Actualiser</>
                )}
              </Button>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Sécurité du Système</AlertTitle>
            <AlertDescription>
              Toutes les modifications des paramètres sont journalisées et tracées pour des raisons de sécurité.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Protocole d'État</h1>
              <p className="text-muted-foreground mt-2">
                Tableau de bord présidentiel - Supervision et validation
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
                <TabsList className="grid w-full grid-cols-5">
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
                  {renderDashboard()}
                </TabsContent>
                <TabsContent value="validation" className="mt-6">
                  {renderValidationView()}
                </TabsContent>
                <TabsContent value="agents" className="mt-6">
                  {renderAgentsView()}
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

          {activeView === 'dashboard' && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Responsabilité Présidentielle</AlertTitle>
              <AlertDescription>
                En tant qu'administrateur du Protocole d'État, vous êtes responsable de la validation
                et du suivi de tous les cas sensibles. Toutes vos actions sont enregistrées conformément
                aux protocoles de sécurité nationale.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Cas</DialogTitle>
            <DialogDescription>Informations complètes sur le signalement</DialogDescription>
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
                  <h3 className="font-semibold mb-2">Type</h3>
                  <Badge>{selectedCase.type}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Priorité</h3>
                  {getPriorityBadge(selectedCase.priority)}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Statut</h3>
                  <Badge variant="outline">{selectedCase.status}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Date de création</h3>
                  <p className="text-sm">{formatDate(selectedCase.created_at)}</p>
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
              {selectedCase.is_anonymous && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Signalement Anonyme</AlertTitle>
                  <AlertDescription>
                    Ce signalement a été soumis de manière anonyme.
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

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un Agent</DialogTitle>
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
            <DialogTitle>Rejeter le Cas</DialogTitle>
            <DialogDescription>Veuillez fournir une raison pour le rejet</DialogDescription>
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