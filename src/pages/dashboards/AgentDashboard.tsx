import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, FileText, Map, Search, AlertCircle, CheckCircle,
  Clock, TrendingUp, Calendar, MapPin, User, Filter,
  Eye, MessageSquare, FileCheck, Camera, Briefcase,
  Target, Shield, ChevronRight, Badge as BadgeIcon
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [agentStats] = useState({
    assignedCases: 23,
    resolvedCases: 18,
    pendingCases: 5,
    investigationsActive: 3,
    successRate: 78.3,
    averageTime: '1.8',
    monthlyTarget: 25,
    monthlyCompleted: 18
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
    }
  }, [user, isLoading, navigate]);

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
            <Badge variant="destructive">3 urgents</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                id: 'CAS-2024-0134', 
                type: 'Corruption', 
                location: 'Ministère des Finances',
                priority: 'critique',
                deadline: 'Dans 2 heures',
                progress: 65
              },
              { 
                id: 'CAS-2024-0128', 
                type: 'Abus de pouvoir', 
                location: 'Commissariat Central',
                priority: 'haute',
                deadline: 'Aujourd\'hui',
                progress: 40
              },
              { 
                id: 'CAS-2024-0125', 
                type: 'Fraude', 
                location: 'Direction des Impôts',
                priority: 'haute',
                deadline: 'Demain',
                progress: 85
              },
            ].map((cas, i) => (
              <div key={i} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{cas.id}</h4>
                    <Badge variant={cas.priority === 'critique' ? 'destructive' : 'default'}>
                      {cas.priority}
                    </Badge>
                    <Badge variant="outline">{cas.type}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{cas.deadline}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {cas.location}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Progress value={cas.progress} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">{cas.progress}%</span>
                  <Button size="sm" className="ml-3">
                    <Eye className="h-4 w-4 mr-1" />
                    Traiter
                  </Button>
                </div>
              </div>
            ))}
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
            <Input placeholder="Rechercher..." className="flex-1" />
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En cours</SelectItem>
                <SelectItem value="investigation">En enquête</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {[
                { id: 'CAS-2024-0134', type: 'Corruption', location: 'Libreville', date: '14/10/2024', priority: 'haute', status: 'enquête' },
                { id: 'CAS-2024-0128', type: 'Abus de pouvoir', location: 'Port-Gentil', date: '13/10/2024', priority: 'moyenne', status: 'en cours' },
                { id: 'CAS-2024-0125', type: 'Fraude', location: 'Franceville', date: '12/10/2024', priority: 'haute', status: 'enquête' },
                { id: 'CAS-2024-0122', type: 'Détournement', location: 'Oyem', date: '11/10/2024', priority: 'basse', status: 'résolu' },
                { id: 'CAS-2024-0115', type: 'Corruption', location: 'Moanda', date: '10/10/2024', priority: 'moyenne', status: 'résolu' },
              ].map((cas, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{cas.id}</TableCell>
                  <TableCell>{cas.type}</TableCell>
                  <TableCell>{cas.location}</TableCell>
                  <TableCell>{cas.date}</TableCell>
                  <TableCell>
                    <Badge variant={
                      cas.priority === 'haute' ? 'destructive' :
                      cas.priority === 'moyenne' ? 'default' :
                      'secondary'
                    }>
                      {cas.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      cas.status === 'résolu' ? 'default' :
                      cas.status === 'enquête' ? 'secondary' :
                      'outline'
                    }>
                      {cas.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <TabsTrigger value="active">Actives (3)</TabsTrigger>
              <TabsTrigger value="pending">En attente (2)</TabsTrigger>
              <TabsTrigger value="completed">Terminées (18)</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="space-y-4">
                {[
                  {
                    id: 'INV-2024-045',
                    cas: 'CAS-2024-0134',
                    subject: 'Pot-de-vin au Ministère des Finances',
                    startDate: '10/10/2024',
                    progress: 65,
                    witnesses: 3,
                    evidence: 7,
                    nextStep: 'Audition du suspect principal'
                  },
                  {
                    id: 'INV-2024-044',
                    cas: 'CAS-2024-0128',
                    subject: 'Abus de pouvoir - Commissariat Central',
                    startDate: '08/10/2024',
                    progress: 40,
                    witnesses: 2,
                    evidence: 4,
                    nextStep: 'Collecte de témoignages supplémentaires'
                  },
                  {
                    id: 'INV-2024-043',
                    cas: 'CAS-2024-0125',
                    subject: 'Fraude fiscale organisée',
                    startDate: '05/10/2024',
                    progress: 85,
                    witnesses: 5,
                    evidence: 12,
                    nextStep: 'Rédaction du rapport final'
                  },
                ].map((inv, i) => (
                  <Card key={i} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{inv.id}</h3>
                            <Badge variant="outline">{inv.cas}</Badge>
                          </div>
                          <p className="text-sm mb-3">{inv.subject}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Début: {inv.startDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {inv.witnesses} témoins
                            </span>
                            <span className="flex items-center gap-1">
                              <FileCheck className="h-3 w-3" />
                              {inv.evidence} preuves
                            </span>
                          </div>
                        </div>
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progression</span>
                            <span className="font-medium">{inv.progress}%</span>
                          </div>
                          <Progress value={inv.progress} />
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium mb-1">Prochaine étape:</p>
                          <p className="text-sm">{inv.nextStep}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>2 enquêtes en attente d'approbation</p>
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>18 enquêtes terminées ce mois</p>
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
              <label className="text-sm font-medium">Cas concerné</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un cas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cas1">CAS-2024-0134</SelectItem>
                  <SelectItem value="cas2">CAS-2024-0128</SelectItem>
                  <SelectItem value="cas3">CAS-2024-0125</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Type de rapport</label>
              <Select>
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
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              className="mt-1" 
              rows={6} 
              placeholder="Détails du rapport..."
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Ajouter Photos
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Ajouter Documents
            </Button>
          </div>
          <Button className="w-full">Soumettre le Rapport</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderMapView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Carte des Interventions</CardTitle>
        <CardDescription>Localisation géographique des cas assignés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Carte interactive</p>
            <p className="text-sm text-muted-foreground mt-2">
              Visualisation des cas par zone géographique
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <div className="text-xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Libreville</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Port-Gentil</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <div className="text-xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Franceville</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">Autres</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileView = () => (
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
              <h3 className="text-xl font-semibold">Agent Alpha</h3>
              <p className="text-sm text-muted-foreground">Matricule: DGSS-001</p>
              <Badge className="mt-2">Spécialiste Anti-Corruption</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-500">92%</div>
              <p className="text-xs text-muted-foreground">Taux de réussite</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">Cas traités</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-500">4.8</div>
              <p className="text-xs text-muted-foreground">Note moyenne</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Mois d'expérience</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Compétences</h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Investigation</span>
                  <span>95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Analyse</span>
                  <span>88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Rapport</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Terrain</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
      <Footer />
    </div>
  );
};

export default AgentDashboard;