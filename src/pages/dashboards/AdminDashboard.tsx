import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Crown, FileText, Shield, BarChart3, Settings, Users, 
  TrendingUp, Activity, AlertCircle, CheckCircle, Clock,
  Eye, Filter, Search, ChevronRight, Calendar, MapPin,
  UserPlus, UserCheck, UserX, Briefcase, Scale
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [stats] = useState({
    totalCases: 3456,
    pendingCases: 134,
    resolvedCases: 2891,
    rejectedCases: 431,
    totalAgents: 45,
    activeAgents: 38,
    monthlyResolution: 89,
    averageTime: '2.3',
    satisfaction: 4.7
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
          <div className="space-y-3">
            {[
              { id: 'CAS-2024-0134', type: 'Corruption', location: 'Libreville', priority: 'haute', date: 'Il y a 2h', agent: null },
              { id: 'CAS-2024-0133', type: 'Abus de pouvoir', location: 'Port-Gentil', priority: 'moyenne', date: 'Il y a 5h', agent: 'Agent #12' },
              { id: 'CAS-2024-0132', type: 'Détournement', location: 'Franceville', priority: 'haute', date: 'Il y a 8h', agent: null },
              { id: 'CAS-2024-0131', type: 'Fraude', location: 'Oyem', priority: 'basse', date: 'Hier', agent: 'Agent #7' },
            ].map((cas, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{cas.id}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{cas.type}</span>
                      <span>•</span>
                      <MapPin className="h-3 w-3" />
                      <span>{cas.location}</span>
                    </div>
                  </div>
                  <Badge variant={
                    cas.priority === 'haute' ? 'destructive' :
                    cas.priority === 'moyenne' ? 'default' :
                    'secondary'
                  }>
                    {cas.priority}
                  </Badge>
                  {cas.agent && (
                    <Badge variant="outline">{cas.agent}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{cas.date}</span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Examiner
                  </Button>
                  <Button variant="default" size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valider
                  </Button>
                </div>
              </div>
            ))}
          </div>
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

  const renderAgentsView = () => (
    <div className="space-y-6">
      {/* Actions rapides */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Agents DGSS</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Nouvel Agent
        </Button>
      </div>

      {/* Statistiques agents */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.activeAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En Congé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">7</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des agents */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Agents</CardTitle>
          <CardDescription>Tous les agents sous votre supervision</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Cas Assignés</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: 'Agent Alpha', id: 'DGSS-001', specialty: 'Corruption', cases: 23, status: 'active', performance: 92 },
                { name: 'Agent Beta', id: 'DGSS-002', specialty: 'Fraude', cases: 18, status: 'active', performance: 88 },
                { name: 'Agent Gamma', id: 'DGSS-003', specialty: 'Abus de pouvoir', cases: 15, status: 'mission', performance: 95 },
                { name: 'Agent Delta', id: 'DGSS-004', specialty: 'Détournement', cases: 20, status: 'active', performance: 85 },
                { name: 'Agent Epsilon', id: 'DGSS-005', specialty: 'Corruption', cases: 8, status: 'congé', performance: 90 },
              ].map((agent, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-medium">{agent.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{agent.id}</Badge>
                  </TableCell>
                  <TableCell>{agent.specialty}</TableCell>
                  <TableCell>{agent.cases}</TableCell>
                  <TableCell>
                    <Badge variant={
                      agent.status === 'active' ? 'default' :
                      agent.status === 'mission' ? 'secondary' :
                      'outline'
                    }>
                      {agent.status === 'active' ? 'Actif' :
                       agent.status === 'mission' ? 'En Mission' :
                       'En Congé'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={agent.performance} className="w-20 h-2" />
                      <span className="text-sm">{agent.performance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
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

  const renderValidationView = () => (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Validation des Cas</CardTitle>
          <CardDescription>Examinez et approuvez les signalements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input placeholder="Rechercher un cas..." className="w-full" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type de cas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="corruption">Corruption</SelectItem>
                <SelectItem value="fraude">Fraude</SelectItem>
                <SelectItem value="abus">Abus de pouvoir</SelectItem>
                <SelectItem value="detournement">Détournement</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="pending">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="validated">Validés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
                <SelectItem value="all">Tous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {[
              { 
                id: 'CAS-2024-0134', 
                type: 'Corruption', 
                description: 'Demande de pot-de-vin par un fonctionnaire du ministère',
                location: 'Libreville - Ministère des Finances',
                reporter: 'Anonyme',
                date: '14/10/2024 10:30',
                priority: 'haute',
                evidence: true,
                status: 'pending'
              },
              { 
                id: 'CAS-2024-0133', 
                type: 'Abus de pouvoir', 
                description: 'Utilisation abusive de véhicules de fonction',
                location: 'Port-Gentil - Mairie',
                reporter: 'Citoyen vérifié',
                date: '14/10/2024 08:15',
                priority: 'moyenne',
                evidence: true,
                status: 'pending'
              },
              { 
                id: 'CAS-2024-0132', 
                type: 'Détournement', 
                description: 'Suspicion de détournement de fonds publics',
                location: 'Franceville - Direction régionale',
                reporter: 'Agent interne',
                date: '13/10/2024 16:45',
                priority: 'haute',
                evidence: false,
                status: 'pending'
              },
            ].map((cas, i) => (
              <Card key={i} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{cas.id}</h3>
                        <Badge variant={
                          cas.priority === 'haute' ? 'destructive' :
                          cas.priority === 'moyenne' ? 'default' :
                          'secondary'
                        }>
                          Priorité {cas.priority}
                        </Badge>
                        <Badge variant="outline">{cas.type}</Badge>
                        {cas.evidence && (
                          <Badge variant="outline" className="bg-green-50">
                            <FileText className="h-3 w-3 mr-1" />
                            Preuves fournies
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{cas.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {cas.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {cas.reporter}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {cas.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserCheck className="h-4 w-4 mr-1" />
                        Assigner
                      </Button>
                      <Button variant="default" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Valider
                      </Button>
                      <Button variant="destructive" size="sm">
                        <UserX className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rapports et Analyses</CardTitle>
          <CardDescription>Vue d'ensemble des performances et statistiques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Efficacité Globale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">89%</div>
                <Progress value={89} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Satisfaction Citoyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.7/5</div>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-2 w-8 rounded ${i <= 4.7 ? 'bg-yellow-500' : 'bg-gray-200'}`} />
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
                  342 cas résolus ce mois
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapports */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Rapport Mensuel</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Analyse Tendances</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Statistiques</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <Scale className="h-6 w-6" />
              <span>Rapport Juridique</span>
            </Button>
          </div>

          {/* Tableau des performances par région */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Performance par Région</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Région</TableHead>
                  <TableHead>Cas Signalés</TableHead>
                  <TableHead>Cas Résolus</TableHead>
                  <TableHead>Taux de Résolution</TableHead>
                  <TableHead>Temps Moyen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { region: 'Libreville', signaled: 892, resolved: 756, rate: 84.7, time: '2.1j' },
                  { region: 'Port-Gentil', signaled: 456, resolved: 412, rate: 90.3, time: '1.8j' },
                  { region: 'Franceville', signaled: 234, resolved: 198, rate: 84.6, time: '2.5j' },
                  { region: 'Oyem', signaled: 187, resolved: 172, rate: 91.9, time: '1.6j' },
                  { region: 'Moanda', signaled: 123, resolved: 108, rate: 87.8, time: '2.2j' },
                ].map((data, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{data.region}</TableCell>
                    <TableCell>{data.signaled}</TableCell>
                    <TableCell>{data.resolved}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={data.rate} className="w-20 h-2" />
                        <span>{data.rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{data.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres Administratifs</CardTitle>
        <CardDescription>Configuration et préférences du système</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h3 className="font-medium">Notifications</h3>
              <p className="text-sm text-muted-foreground">Recevoir les alertes pour les nouveaux cas</p>
            </div>
            <Button variant="outline" size="sm">Configurer</Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h3 className="font-medium">Seuils d'Alerte</h3>
              <p className="text-sm text-muted-foreground">Définir les priorités automatiques</p>
            </div>
            <Button variant="outline" size="sm">Modifier</Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h3 className="font-medium">Délégation</h3>
              <p className="text-sm text-muted-foreground">Gérer les permissions des agents</p>
            </div>
            <Button variant="outline" size="sm">Gérer</Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h3 className="font-medium">Templates</h3>
              <p className="text-sm text-muted-foreground">Modèles de rapports et documents</p>
            </div>
            <Button variant="outline" size="sm">Voir</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          {/* En-tête */}
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

          {/* Contenu selon la vue */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'agents' && renderAgentsView()}
          {activeView === 'validation' && renderValidationView()}
          {activeView === 'reports' && renderReportsView()}
          {activeView === 'settings' && renderSettingsView()}

          {/* Note administrative */}
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
    </div>
  );
};

export default AdminDashboard;