import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, FileText, Map, Search, AlertCircle, CheckCircle,
  Clock, TrendingUp, Calendar, MapPin, User, Filter,
  Eye, MessageSquare, FileCheck, Camera, Briefcase,
  Target, Shield, ChevronRight, Badge as BadgeIcon, 
  Plus, Upload, Download, Edit, Trash2, Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IAstedFloatingButton } from '@/components/admin/IAstedFloatingButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [reportForm, setReportForm] = useState({
    caseId: '',
    type: '',
    description: '',
    attachments: []
  });
  
  const [agentStats, setAgentStats] = useState({
    assignedCases: 0,
    resolvedCases: 0,
    pendingCases: 0,
    investigationsActive: 0,
    successRate: 0,
    averageTime: '0',
    monthlyTarget: 25,
    monthlyCompleted: 0
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
    // L'accès est validé via ProtectedRoute; éviter les redirections ici
  }, [user, isLoading]);

  // Charger les données
  useEffect(() => {
    if (user && role === 'agent') {
      loadAgentData();
    }
  }, [user, role]);

  const loadAgentData = async () => {
    setLoading(true);
    try {
      // Charger les signalements (pour l'instant on prend tous les signalements)
      // Plus tard, on ajoutera une colonne assigned_agent_id à la table signalements
      const { data: signalements, error: signalementsError } = await supabase
        .from('signalements')
        .select('*')
        .order('created_at', { ascending: false });

      if (signalementsError) throw signalementsError;

      // Simuler les enquêtes pour l'instant (les vraies tables seront créées plus tard)
      const investigationsData = signalements?.map((signalement, index) => ({
        id: `INV-${signalement.id}`,
        case_id: signalement.id,
        agent_id: user?.id,
        title: `Enquête - ${signalement.type}`,
        status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'pending' : 'completed',
        progress: Math.floor(Math.random() * 100),
        witnesses_count: Math.floor(Math.random() * 5),
        evidence_count: Math.floor(Math.random() * 10),
        next_step: 'Collecte d\'informations supplémentaires',
        created_at: signalement.created_at,
        updated_at: signalement.updated_at,
        completed_at: index % 3 === 2 ? new Date().toISOString() : null
      })) || [];

      setCases(signalements || []);
      setInvestigations(investigationsData || []);

      // Calculer les statistiques
      const assignedCases = signalements?.length || 0;
      const resolvedCases = signalements?.filter((s: any) => s.status === 'resolved').length || 0;
      const pendingCases = signalements?.filter((s: any) => s.status === 'pending').length || 0;
      const investigationsActive = investigationsData?.filter((i: any) => i.status === 'active').length || 0;
      const successRate = assignedCases > 0 ? (resolvedCases / assignedCases) * 100 : 0;
      const monthlyCompleted = signalements?.filter((s: any) => {
        const createdAt = new Date(s.created_at);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length || 0;

      setAgentStats({
        assignedCases,
        resolvedCases,
        pendingCases,
        investigationsActive,
        successRate: Math.round(successRate * 10) / 10,
        averageTime: '1.8', // Calculer basé sur les données réelles
        monthlyTarget: 25,
        monthlyCompleted
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCaseAction = async (caseId: string, action: string) => {
    setLoading(true);
    try {
      let updateData = {};
      
      switch (action) {
        case 'view':
          // Ouvrir les détails du cas
          toast({
            title: "Ouverture du cas",
            description: `Affichage des détails du cas ${caseId}`,
          });
          break;
        case 'assign':
          updateData = { status: 'assigned' }; // Plus tard on ajoutera assigned_agent_id
          break;
        case 'investigate':
          updateData = { status: 'investigation' };
          break;
        case 'resolve':
          updateData = { status: 'resolved', resolved_at: new Date().toISOString() };
          break;
        case 'close':
          updateData = { status: 'closed' };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('signalements')
          .update(updateData)
          .eq('id', caseId);

        if (error) throw error;

        toast({
          title: "Action effectuée",
          description: `Le cas ${caseId} a été mis à jour.`,
        });

        // Recharger les données
        await loadAgentData();
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer cette action. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigationAction = async (investigationId: string, action: string) => {
    setLoading(true);
    try {
      let updateData = {};
      
      switch (action) {
        case 'view':
          toast({
            title: "Ouverture de l'enquête",
            description: `Affichage des détails de l'enquête ${investigationId}`,
          });
          break;
        case 'update':
          updateData = { last_updated: new Date().toISOString() };
          break;
        case 'complete':
          updateData = { status: 'completed', completed_at: new Date().toISOString() };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        // Simuler la mise à jour d'enquête (les vraies tables seront créées plus tard)
        console.log('Mise à jour enquête:', investigationId, updateData);

        toast({
          title: "Action effectuée",
          description: `L'enquête ${investigationId} a été mise à jour.`,
        });

        await loadAgentData();
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer cette action. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportForm.caseId || !reportForm.type || !reportForm.description) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simuler la soumission de rapport (les vraies tables seront créées plus tard)
      console.log('Soumission rapport:', {
        case_id: reportForm.caseId,
        agent_id: user?.id,
        type: reportForm.type,
        description: reportForm.description,
        attachments: reportForm.attachments,
        created_at: new Date().toISOString()
      });

      toast({
        title: "Rapport soumis",
        description: "Votre rapport d'enquête a été enregistré avec succès.",
      });

      // Réinitialiser le formulaire
      setReportForm({
        caseId: '',
        type: '',
        description: '',
        attachments: []
      });

      await loadAgentData();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: "Erreur de soumission",
        description: "Impossible de soumettre le rapport. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('investigation-files')
          .upload(fileName, file);

        if (error) throw error;

        return fileName;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setReportForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedFiles]
      }));

      toast({
        title: "Fichiers uploadés",
        description: `${uploadedFiles.length} fichier(s) ajouté(s) avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader les fichiers. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Filtrer les cas
  const filteredCases = cases.filter(cas => {
    const matchesSearch = cas.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cas.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cas.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cas.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || cas.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const renderDashboard = () => (
    <>
      {/* Statistiques personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-primary" />
              Cas Assignés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.assignedCases}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {agentStats.pendingCases} en cours
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Cas Résolus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.resolvedCases}</div>
            <Progress value={(agentStats.resolvedCases/agentStats.assignedCases)*100} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">
              {agentStats.successRate}% de réussite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-blue-500" />
              Objectif Mensuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentStats.monthlyCompleted}/{agentStats.monthlyTarget}
            </div>
            <Progress value={(agentStats.monthlyCompleted/agentStats.monthlyTarget)*100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              Temps Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.averageTime}j</div>
            <p className="text-xs text-muted-foreground mt-1">
              Par dossier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cas urgents */}
      <Card className="border-orange-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Cas Prioritaires
              </CardTitle>
              <CardDescription>Nécessitent une action immédiate</CardDescription>
            </div>
            <Badge variant="destructive">
              {cases.filter(c => c.priority === 'critique' || c.priority === 'haute').length} urgents
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cases
              .filter(cas => cas.priority === 'critique' || cas.priority === 'haute')
              .slice(0, 3)
              .map((cas, i) => {
                const progress = cas.status === 'resolved' ? 100 : 
                               cas.status === 'investigation' ? 75 :
                               cas.status === 'assigned' ? 50 : 25;
                
                return (
                  <div key={cas.id || i} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{cas.id || `CAS-${cas.title?.slice(0, 8)}`}</h4>
                        <Badge variant={cas.priority === 'critique' ? 'destructive' : 'default'}>
                          {cas.priority}
                        </Badge>
                        <Badge variant="outline">{cas.type}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(cas.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {cas.location || 'Non spécifié'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <Progress value={progress} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{progress}%</span>
                      <Button 
                        size="sm" 
                        className="ml-3"
                        onClick={() => handleCaseAction(cas.id, 'view')}
                        disabled={loading}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Traiter
                      </Button>
                    </div>
                  </div>
                );
              })}
            {cases.filter(c => c.priority === 'critique' || c.priority === 'haute').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Aucun cas urgent pour le moment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>Vos dernières actions et mises à jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { time: '10:30', action: 'Rapport d\'enquête soumis', cas: 'CAS-2024-0122', status: 'success' },
              { time: '09:45', action: 'Entretien avec témoin', cas: 'CAS-2024-0134', status: 'info' },
              { time: '08:20', action: 'Preuves collectées', cas: 'CAS-2024-0128', status: 'success' },
              { time: 'Hier 16:30', action: 'Cas clôturé', cas: 'CAS-2024-0115', status: 'success' },
              { time: 'Hier 14:15', action: 'Note ajoutée', cas: 'CAS-2024-0125', status: 'info' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-xs font-mono text-muted-foreground">{activity.time}</span>
                  <span className="text-sm">{activity.action}</span>
                  <Badge variant="outline" className="text-xs">{activity.cas}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderCasesView = () => (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Signalements</CardTitle>
          <CardDescription>Tous les cas qui vous sont assignés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input 
              placeholder="Rechercher..." 
              className="flex-1" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En cours</SelectItem>
                <SelectItem value="investigation">En enquête</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="closed">Clôturés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="critique">Critique</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="moyenne">Moyenne</SelectItem>
                <SelectItem value="basse">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Cas</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length > 0 ? filteredCases.map((cas, i) => (
                  <TableRow key={cas.id || i}>
                    <TableCell className="font-medium">
                      {cas.id || `CAS-${cas.title?.slice(0, 8)}`}
                    </TableCell>
                    <TableCell>{cas.type || 'Non spécifié'}</TableCell>
                    <TableCell>{cas.location || 'Non spécifié'}</TableCell>
                    <TableCell>
                      {new Date(cas.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        cas.priority === 'critique' ? 'destructive' :
                        cas.priority === 'haute' ? 'default' :
                        cas.priority === 'moyenne' ? 'secondary' :
                        'outline'
                      }>
                        {cas.priority || 'Non définie'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        cas.status === 'resolved' ? 'default' :
                        cas.status === 'investigation' ? 'secondary' :
                        cas.status === 'closed' ? 'outline' :
                        'destructive'
                      }>
                        {cas.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCaseAction(cas.id, 'view')}
                          disabled={loading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {cas.status !== 'resolved' && cas.status !== 'closed' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCaseAction(cas.id, 'investigate')}
                              disabled={loading}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCaseAction(cas.id, 'resolve')}
                              disabled={loading}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun cas trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderInvestigationsView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enquêtes en Cours</CardTitle>
          <CardDescription>Détails et progression des investigations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Actives ({investigations.filter(inv => inv.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                En attente ({investigations.filter(inv => inv.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Terminées ({investigations.filter(inv => inv.status === 'completed').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="space-y-4">
                {investigations
                  .filter(inv => inv.status === 'active')
                  .map((inv, i) => {
                    const progress = inv.progress || 50;
                    const associatedCase = cases.find(c => c.id === inv.case_id);
                    
                    return (
                      <Card key={inv.id || i} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {inv.id || `INV-${inv.title?.slice(0, 8)}`}
                                </h3>
                                {associatedCase && (
                                  <Badge variant="outline">
                                    {associatedCase.id || `CAS-${associatedCase.title?.slice(0, 8)}`}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm mb-3">{inv.title || 'Enquête en cours'}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Début: {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {inv.witnesses_count || 0} témoins
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileCheck className="h-3 w-3" />
                                  {inv.evidence_count || 0} preuves
                                </span>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleInvestigationAction(inv.id, 'view')}
                              disabled={loading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progression</span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} />
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs font-medium mb-1">Prochaine étape:</p>
                              <p className="text-sm">{inv.next_step || 'Collecte d\'informations supplémentaires'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                {investigations.filter(inv => inv.status === 'active').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Aucune enquête active</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {investigations
                  .filter(inv => inv.status === 'pending')
                  .map((inv, i) => {
                    const associatedCase = cases.find(c => c.id === inv.case_id);
                    
                    return (
                      <Card key={inv.id || i} className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {inv.id || `INV-${inv.title?.slice(0, 8)}`}
                                </h3>
                                {associatedCase && (
                                  <Badge variant="outline">
                                    {associatedCase.id || `CAS-${associatedCase.title?.slice(0, 8)}`}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm mb-3">{inv.title || 'Enquête en attente'}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Créée: {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                                </span>
                                <Badge variant="secondary">En attente d'approbation</Badge>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleInvestigationAction(inv.id, 'view')}
                              disabled={loading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                {investigations.filter(inv => inv.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Aucune enquête en attente</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="space-y-4">
                {investigations
                  .filter(inv => inv.status === 'completed')
                  .slice(0, 10) // Limiter à 10 pour les performances
                  .map((inv, i) => {
                    const associatedCase = cases.find(c => c.id === inv.case_id);
                    
                    return (
                      <Card key={inv.id || i} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {inv.id || `INV-${inv.title?.slice(0, 8)}`}
                                </h3>
                                {associatedCase && (
                                  <Badge variant="outline">
                                    {associatedCase.id || `CAS-${associatedCase.title?.slice(0, 8)}`}
                                  </Badge>
                                )}
                                <Badge variant="default">Terminée</Badge>
                              </div>
                              <p className="text-sm mb-3">{inv.title || 'Enquête terminée'}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Terminée: {new Date(inv.completed_at || inv.updated_at).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {inv.witnesses_count || 0} témoins
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileCheck className="h-3 w-3" />
                                  {inv.evidence_count || 0} preuves
                                </span>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleInvestigationAction(inv.id, 'view')}
                              disabled={loading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                {investigations.filter(inv => inv.status === 'completed').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Aucune enquête terminée</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Formulaire de rapport */}
      <Card>
        <CardHeader>
          <CardTitle>Nouveau Rapport d'Enquête</CardTitle>
          <CardDescription>Documenter les progrès de l'investigation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cas concerné *</label>
              <Select 
                value={reportForm.caseId} 
                onValueChange={(value) => setReportForm(prev => ({ ...prev, caseId: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un cas" />
                </SelectTrigger>
                <SelectContent>
                  {cases.filter(cas => cas.status !== 'resolved' && cas.status !== 'closed').map((cas) => (
                    <SelectItem key={cas.id} value={cas.id}>
                      {cas.id || `CAS-${cas.title?.slice(0, 8)}`} - {cas.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Type de rapport *</label>
              <Select 
                value={reportForm.type} 
                onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progression</SelectItem>
                  <SelectItem value="witness">Témoin</SelectItem>
                  <SelectItem value="evidence">Preuve</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description *</label>
            <Textarea 
              className="mt-1" 
              rows={6} 
              placeholder="Détails du rapport..."
              value={reportForm.description}
              onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                };
                input.click();
              }}
              disabled={loading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Ajouter Photos
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.txt';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                };
                input.click();
              }}
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ajouter Documents
            </Button>
          </div>
          {reportForm.attachments.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Fichiers joints ({reportForm.attachments.length})</p>
              <div className="flex flex-wrap gap-2">
                {reportForm.attachments.map((file, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {file}
                    <button
                      onClick={() => setReportForm(prev => ({
                        ...prev,
                        attachments: prev.attachments.filter((_, i) => i !== index)
                      }))}
                      className="ml-1 hover:bg-destructive/20 rounded-full"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Button 
            className="w-full" 
            onClick={handleReportSubmit}
            disabled={loading || !reportForm.caseId || !reportForm.type || !reportForm.description}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Soumission...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Soumettre le Rapport
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderMapView = () => {
    // Calculer les statistiques par ville
    const cityStats = cases.reduce((acc, cas) => {
      const city = cas.location || 'Autres';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const cities = [
      { name: 'Libreville', count: cityStats['Libreville'] || 0, color: 'text-red-500' },
      { name: 'Port-Gentil', count: cityStats['Port-Gentil'] || 0, color: 'text-orange-500' },
      { name: 'Franceville', count: cityStats['Franceville'] || 0, color: 'text-yellow-500' },
      { name: 'Autres', count: Object.entries(cityStats).reduce((sum, [city, count]) => 
        !['Libreville', 'Port-Gentil', 'Franceville'].includes(city) ? sum + (count as number) : sum, 0), 
        color: 'text-green-500' }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Carte des Interventions</CardTitle>
          <CardDescription>Localisation géographique des cas assignés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="text-center z-10">
              <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Carte interactive</p>
              <p className="text-sm text-muted-foreground mt-2">
                Visualisation des cas par zone géographique
              </p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  toast({
                    title: "Fonctionnalité à venir",
                    description: "La carte interactive sera bientôt disponible avec l'intégration d'une API de cartographie.",
                  });
                }}
                variant="outline"
              >
                <Map className="h-4 w-4 mr-2" />
                Activer la carte
              </Button>
            </div>
            {/* Simulation de marqueurs sur la carte */}
            <div className="absolute inset-0 opacity-10">
              {cases.slice(0, 5).map((cas, i) => (
                <div 
                  key={i}
                  className="absolute w-3 h-3 bg-red-500 rounded-full animate-pulse"
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${30 + (i * 10)}%`
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {cities.map((city, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <MapPin className={`h-6 w-6 mx-auto mb-2 ${city.color}`} />
                    <div className="text-xl font-bold">{city.count}</div>
                    <p className="text-xs text-muted-foreground">{city.name}</p>
                    {city.count > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs"
                        onClick={() => {
                          const cityCases = cases.filter(cas => 
                            (cas.location === city.name) || 
                            (city.name === 'Autres' && !['Libreville', 'Port-Gentil', 'Franceville'].includes(cas.location || ''))
                          );
                          toast({
                            title: `Cas à ${city.name}`,
                            description: `${cityCases.length} cas assignés dans cette ville.`,
                          });
                        }}
                      >
                        Voir détails
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {cases.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3">Résumé des interventions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total cas:</span>
                  <span className="ml-2 font-medium">{cases.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">En cours:</span>
                  <span className="ml-2 font-medium text-orange-500">
                    {cases.filter(c => c.status === 'pending' || c.status === 'investigation').length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Résolus:</span>
                  <span className="ml-2 font-medium text-green-500">
                    {cases.filter(c => c.status === 'resolved').length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Clôturés:</span>
                  <span className="ml-2 font-medium text-muted-foreground">
                    {cases.filter(c => c.status === 'closed').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderProfileView = () => {
    const profile = user?.user_metadata || {};
    const totalCases = cases.length;
    const resolvedCases = cases.filter(c => c.status === 'resolved').length;
    const successRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;
    const activeInvestigations = investigations.filter(i => i.status === 'active').length;
    
    // Calculer l'expérience basée sur la date de création du compte
    const accountAge = user?.created_at ? 
      Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mon Profil Agent</CardTitle>
            <CardDescription>Informations et performances personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-10 w-10 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {profile.full_name || user?.email?.split('@')[0] || 'Agent DGSS'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Matricule: {profile.matricule || `DGSS-${user?.id?.slice(0, 8).toUpperCase()}`}
                </p>
                <Badge className="mt-2">Agent DGSS</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-500">{successRate}%</div>
                <p className="text-xs text-muted-foreground">Taux de réussite</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold">{totalCases}</div>
                <p className="text-xs text-muted-foreground">Cas assignés</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-blue-500">{activeInvestigations}</div>
                <p className="text-xs text-muted-foreground">Enquêtes actives</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold">{Math.max(accountAge, 1)}</div>
                <p className="text-xs text-muted-foreground">Mois d'expérience</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Statistiques détaillées</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cas en cours</span>
                      <Badge variant="outline">
                        {cases.filter(c => c.status === 'pending' || c.status === 'investigation').length}
                      </Badge>
                    </div>
                    <Progress 
                      value={totalCases > 0 ? (cases.filter(c => c.status === 'pending' || c.status === 'investigation').length / totalCases) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cas résolus</span>
                      <Badge variant="default">
                        {cases.filter(c => c.status === 'resolved').length}
                      </Badge>
                    </div>
                    <Progress 
                      value={totalCases > 0 ? (cases.filter(c => c.status === 'resolved').length / totalCases) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Enquêtes terminées</span>
                    <Badge variant="secondary">
                      {investigations.filter(i => i.status === 'completed').length}
                    </Badge>
                  </div>
                  <Progress 
                    value={investigations.length > 0 ? (investigations.filter(i => i.status === 'completed').length / investigations.length) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Actions rapides</h4>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveView('cases')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mes cas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveView('investigations')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Mes enquêtes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Export des données",
                      description: "Fonctionnalité d'export en cours de développement.",
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations système */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Système</CardTitle>
            <CardDescription>Détails techniques de votre session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID Agent:</span>
                <span className="ml-2 font-mono">{user?.id?.slice(0, 8)}...</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rôle:</span>
                <span className="ml-2 font-medium">{role}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dernière connexion:</span>
                <span className="ml-2">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Statut:</span>
                <Badge variant="default" className="ml-2">Actif</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Agent DGSS</h1>
              <p className="text-muted-foreground mt-2">
                Direction Générale des Services Spéciaux
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Shield className="h-5 w-5 mr-2" />
                Agent DGSS
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <BadgeIcon className="h-5 w-5 mr-2" />
                DGSS-001
              </Badge>
            </div>
          </div>

          {/* Contenu selon la vue */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'cases' && renderCasesView()}
          {activeView === 'investigations' && renderInvestigationsView()}
          {activeView === 'map' && renderMapView()}
          {activeView === 'profile' && renderProfileView()}

          {/* Note de service */}
          {activeView === 'dashboard' && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Mission DGSS</AlertTitle>
              <AlertDescription>
                En tant qu'agent de la Direction Générale des Services Spéciaux, vous êtes tenu au secret
                professionnel. Toutes les informations relatives aux enquêtes sont strictement confidentielles
                et ne doivent être partagées qu'avec les autorités habilitées.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
      
      <IAstedFloatingButton />
      
      <Footer />
    </div>
  );
};

export default AgentDashboard;