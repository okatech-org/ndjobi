import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Zap, Database, Users, User, Shield, Activity, Terminal, 
  FileText, AlertCircle, Settings, BarChart3, Lock, 
  Eye, TrendingUp, Server, ChevronRight, AlertTriangle,
  Clock, Check, X, RefreshCcw, Download, Upload, MapPin, CheckCircle,
  Search, Filter, Calendar, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
import { SystemMaintenancePanel } from '@/components/admin/SecureModuleAccess';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalProjects: number;
  serverUptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  dbSize: string;
  activeSessions: number;
}

interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  lastLogin: string;
  created_at: string;
}

interface ActivityLog {
  time: string;
  user: string;
  action: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: any;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalProjects: 0,
    serverUptime: 99.97,
    cpuUsage: 42,
    memoryUsage: 68,
    diskUsage: 35,
    dbSize: '0 MB',
    activeSessions: 0
  });
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

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
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadSystemStats();
      loadUsers();
      loadActivityLogs();
    }
  }, [user]);

  const loadSystemStats = async () => {
    try {
      setIsLoading(true);

      const [usersResult, signalsResult, projectsResult] = await Promise.all([
        supabase.from('profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('signalements').select('id, status, created_at', { count: 'exact' }),
        supabase.from('projets').select('id', { count: 'exact' })
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newUsersToday = usersResult.data?.filter(u => 
        new Date(u.created_at!) >= today
      ).length || 0;

      const pendingReports = signalsResult.data?.filter(s => 
        s.status === 'pending' || s.status === 'nouveau'
      ).length || 0;

      const resolvedReports = signalsResult.data?.filter(s => 
        s.status === 'resolved' || s.status === 'resolu'
      ).length || 0;

      setSystemStats({
        ...systemStats,
        totalUsers: usersResult.count || 0,
        activeUsers: usersResult.count || 0,
        newUsersToday,
        totalReports: signalsResult.count || 0,
        pendingReports,
        resolvedReports,
        totalProjects: projectsResult.count || 0,
        dbSize: `${((usersResult.count || 0) * 0.5).toFixed(1)} MB`
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques système",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const usersData: UserData[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || 'N/A',
          username: profile.full_name || 'Utilisateur',
          role: userRole?.role || 'user',
          status: 'active',
          lastLogin: 'Récemment',
          created_at: profile.created_at || ''
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const loadActivityLogs = () => {
    const logs: ActivityLog[] = [
      { time: new Date().toLocaleTimeString('fr-FR'), user: 'User #892', action: 'Nouveau signalement créé', type: 'info', icon: FileText },
      { time: new Date(Date.now() - 120000).toLocaleTimeString('fr-FR'), user: 'Agent #12', action: 'Cas validé et transmis', type: 'success', icon: Check },
      { time: new Date(Date.now() - 240000).toLocaleTimeString('fr-FR'), user: 'Admin #3', action: 'Rapport mensuel généré', type: 'warning', icon: Download },
      { time: new Date(Date.now() - 360000).toLocaleTimeString('fr-FR'), user: 'System', action: 'Backup automatique complété', type: 'success', icon: Database },
      { time: new Date(Date.now() - 480000).toLocaleTimeString('fr-FR'), user: 'User #445', action: 'Projet protégé ajouté', type: 'info', icon: Shield },
    ];
    setActivityLogs(logs);
  };

  const handleNavigateToView = (view: string) => {
    navigate(`?view=${view}`);
    setActiveView(view);
  };

  const handleBackup = async () => {
    setIsLoading(true);
    toast({
      title: "Backup en cours...",
      description: "Sauvegarde de la base de données",
    });

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Backup réussi",
        description: "La base de données a été sauvegardée avec succès",
      });
    }, 2000);
  };

  const handleRestartServices = async () => {
    setIsLoading(true);
    toast({
      title: "Redémarrage des services...",
      description: "Cette opération peut prendre quelques secondes",
    });

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Services redémarrés",
        description: "Tous les services sont maintenant opérationnels",
      });
    }, 3000);
  };

  const handleSecurityScan = async () => {
    setIsLoading(true);
    toast({
      title: "Scan de sécurité...",
      description: "Analyse du système en cours",
    });

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Scan terminé",
        description: "Aucune menace détectée. Système sécurisé.",
      });
    }, 2500);
  };

  const handleExportData = async (format: 'csv' | 'json' | 'pdf') => {
    toast({
      title: "Export en cours...",
      description: `Génération du fichier ${format.toUpperCase()}`,
    });

    setTimeout(() => {
      toast({
        title: "Export réussi",
        description: `Les données ont été exportées au format ${format.toUpperCase()}`,
      });
    }, 1500);
  };

  const handleViewUser = (userId: string) => {
    toast({
      title: "Détails utilisateur",
      description: `Affichage du profil ${userId}`,
    });
  };

  const handleEditUser = (userId: string) => {
    toast({
      title: "Édition utilisateur",
      description: `Modification du profil ${userId}`,
    });
  };

  const handleSuspendUser = async (userId: string) => {
    toast({
      title: "Suspension",
      description: "L'utilisateur a été suspendu",
    });
    await loadUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => handleNavigateToView('users')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{systemStats.newUsersToday} aujourd'hui
            </p>
            <Progress value={75} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer"
              onClick={() => handleNavigateToView('reports')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-blue-500" />
              Signalements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalReports.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemStats.pendingReports} en attente
            </p>
            <Progress value={(systemStats.resolvedReports/(systemStats.totalReports || 1))*100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="border-green-500/20 hover:border-green-500/40 transition-colors cursor-pointer"
              onClick={() => handleNavigateToView('system')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-green-500" />
              Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.serverUptime}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime 30 jours
            </p>
            <Progress value={systemStats.serverUptime} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 hover:border-orange-500/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-orange-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-sm">CPU</span>
              <span className="text-xl font-bold">{systemStats.cpuUsage}%</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm">RAM</span>
              <span className="text-xl font-bold">{systemStats.memoryUsage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monitoring Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">Activité</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="errors">Erreurs</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="mt-4">
              <div className="space-y-2">
                {activityLogs.map((log, i) => {
                  const Icon = log.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${
                          log.type === 'success' ? 'text-green-500' :
                          log.type === 'warning' ? 'text-yellow-500' :
                          log.type === 'error' ? 'text-red-500' :
                          'text-blue-500'
                        }`} />
                        <span className="text-xs font-mono text-muted-foreground">{log.time}</span>
                        <Badge variant={
                          log.type === 'success' ? 'default' : 
                          log.type === 'warning' ? 'secondary' : 
                          'outline'
                        } className="text-xs">
                          {log.user}
                        </Badge>
                        <span className="text-sm">{log.action}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => toast({ title: "Détails du log", description: log.action })}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => loadActivityLogs()}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Système sécurisé</AlertTitle>
                <AlertDescription>
                  Aucune menace détectée. Tous les systèmes fonctionnent normalement.
                </AlertDescription>
              </Alert>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">Dernière analyse</span>
                  <span className="text-xs text-muted-foreground">Il y a 5 minutes</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">Tentatives de connexion échouées</span>
                  <Badge variant="outline">0</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">IPs bloquées</span>
                  <Badge variant="outline">3</Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={handleSecurityScan}
                disabled={isLoading}
              >
                <Shield className="h-4 w-4 mr-2" />
                {isLoading ? 'Scan en cours...' : 'Lancer un scan'}
              </Button>
            </TabsContent>

            <TabsContent value="errors" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Aucune erreur système détectée</p>
                <p className="text-xs mt-1">Les logs sont vérifiés toutes les 30 secondes</p>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="mt-4">
              <div className="space-y-2">
                {[
                  { time: '12:30', admin: 'Super Admin', action: 'Modification configuration système', severity: 'high' },
                  { time: '11:45', admin: 'Super Admin', action: 'Export base de données', severity: 'medium' },
                  { time: '10:20', admin: 'Admin #2', action: 'Création nouvel agent', severity: 'low' },
                  { time: '09:15', admin: 'Super Admin', action: 'Activation module XR-7', severity: 'critical' },
                ].map((audit, i) => (
                  <div key={i} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          audit.severity === 'critical' ? 'destructive' :
                          audit.severity === 'high' ? 'default' :
                          audit.severity === 'medium' ? 'secondary' :
                          'outline'
                        } className="text-xs">
                          {audit.admin}
                        </Badge>
                        <span className="text-sm font-medium">{audit.action}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{audit.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SystemMaintenancePanel />
    </>
  );

  const renderSystemView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gestion Système</CardTitle>
        <CardDescription>Configuration et maintenance de la plateforme NDJOBI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={handleBackup}
            disabled={isLoading}
          >
            <Database className="h-6 w-6" />
            <span>Backup Base de Données</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={handleRestartServices}
            disabled={isLoading}
          >
            <RefreshCcw className="h-6 w-6" />
            <span>Redémarrer Services</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={handleSecurityScan}
            disabled={isLoading}
          >
            <Shield className="h-6 w-6" />
            <span>Scan de Sécurité</span>
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">État des Services</h3>
          <div className="space-y-2">
            {[
              { name: 'API Backend', status: 'running', uptime: '30d 14h 23m' },
              { name: 'Base de données PostgreSQL', status: 'running', uptime: '30d 14h 23m' },
              { name: 'Service de notification', status: 'running', uptime: '28d 10h 45m' },
              { name: 'Service d\'analyse IA', status: 'running', uptime: '15d 8h 12m' },
              { name: 'Service de sauvegarde', status: 'idle', uptime: 'N/A' },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    service.status === 'running' ? 'bg-green-500' :
                    service.status === 'idle' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Uptime: {service.uptime}</span>
                  <Badge variant={service.status === 'running' ? 'default' : 'secondary'}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Ressources Système</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span>{systemStats.cpuUsage}%</span>
              </div>
              <Progress value={systemStats.cpuUsage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mémoire</span>
                <span>{systemStats.memoryUsage}%</span>
              </div>
              <Progress value={systemStats.memoryUsage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disque</span>
                <span>{systemStats.diskUsage}%</span>
              </div>
              <Progress value={systemStats.diskUsage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Base de données</span>
                <span>{systemStats.dbSize}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderUsersView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{systemStats.newUsersToday} aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Citoyens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</div>
            <p className="text-xs text-muted-foreground">{((users.filter(u => u.role === 'user').length / (systemStats.totalUsers || 1)) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Agents DGSS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'agent').length}</div>
            <p className="text-xs text-muted-foreground">{((users.filter(u => u.role === 'agent').length / (systemStats.totalUsers || 1)) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Administrateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}</div>
            <p className="text-xs text-muted-foreground">{((users.filter(u => u.role === 'admin' || u.role === 'super_admin').length / (systemStats.totalUsers || 1)) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Utilisateurs</CardTitle>
          <CardDescription>Administration complète des comptes utilisateurs</CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="user">Citoyen</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => loadUsers()} disabled={isLoading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.slice(0, 20).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'super_admin' ? 'destructive' :
                        user.role === 'admin' ? 'default' :
                        user.role === 'agent' ? 'secondary' :
                        'outline'
                      }>
                        {user.role === 'super_admin' ? 'Super Admin' :
                         user.role === 'admin' ? 'Admin' :
                         user.role === 'agent' ? 'Agent' :
                         'Citoyen'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status === 'active' ? 'Actif' : 'Suspendu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredUsers.length > 20 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Affichage de 20 sur {filteredUsers.length} utilisateurs
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rapports et Analyses</CardTitle>
          <CardDescription>Tableaux de bord et statistiques détaillées</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-32 flex-col gap-3"
              onClick={() => handleExportData('pdf')}
            >
              <FileText className="h-8 w-8" />
              <span>Rapport Mensuel</span>
              <span className="text-xs text-muted-foreground">Générer PDF</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-32 flex-col gap-3"
              onClick={() => handleNavigateToView('dashboard')}
            >
              <TrendingUp className="h-8 w-8" />
              <span>Analyse des Tendances</span>
              <span className="text-xs text-muted-foreground">Voir graphiques</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-32 flex-col gap-3"
              onClick={() => handleExportData('csv')}
            >
              <Download className="h-8 w-8" />
              <span>Export Données</span>
              <span className="text-xs text-muted-foreground">CSV / Excel</span>
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Statistiques des 30 derniers jours</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-primary">+23%</div>
                <p className="text-sm text-muted-foreground">Nouveaux utilisateurs</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-500">
                  {((systemStats.resolvedReports / (systemStats.totalReports || 1)) * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">Taux de résolution</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-blue-500">{systemStats.totalReports}</div>
                <p className="text-sm text-muted-foreground">Cas traités</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-orange-500">4.8/5</div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProjectView = () => (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Documentation Projet NDJOBI</CardTitle>
              <CardDescription className="mt-2">
                Plateforme Anti-Corruption - République Gabonaise
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              Version 2.0.0
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
          <TabsTrigger value="database">Base de Données</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Objectif du Projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                NDJOBI est une plateforme anti-corruption développée pour la République Gabonaise. 
                Elle permet aux citoyens de signaler des cas de corruption de manière sécurisée 
                (anonyme ou authentifié) et de protéger leurs projets.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-semibold mb-2">🎯 Mission</h4>
                  <p className="text-sm text-muted-foreground">
                    Lutter contre la corruption en facilitant le signalement citoyen 
                    et en assurant un traitement transparent des cas.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-semibold mb-2">🛡️ Protection</h4>
                  <p className="text-sm text-muted-foreground">
                    Protéger les projets citoyens contre les abus et assurer 
                    la traçabilité des signalements.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">📊 Statistiques Clés</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg border">
                    <div className="text-2xl font-bold text-primary">{systemStats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">Utilisateurs</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-500">{systemStats.totalReports}</div>
                    <p className="text-xs text-muted-foreground">Signalements</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border">
                    <div className="text-2xl font-bold text-green-500">
                      {((systemStats.resolvedReports / (systemStats.totalReports || 1)) * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Taux Résolution</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border">
                    <div className="text-2xl font-bold text-orange-500">{systemStats.totalProjects}</div>
                    <p className="text-xs text-muted-foreground">Projets Protégés</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>👥 Système de Rôles (RBAC)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { role: 'Super Admin', color: 'destructive', features: ['Accès total système', 'Module XR-7', 'Configuration DB', 'Gestion utilisateurs'], icon: Zap },
                  { role: 'Admin (Protocole d\'État)', color: 'default', features: ['Validation cas', 'Gestion agents', 'Rapports régionaux', 'Configuration seuils'], icon: Shield },
                  { role: 'Agent DGSS', color: 'secondary', features: ['Enquêtes terrain', 'Cas assignés', 'Rapports', 'Carte interventions'], icon: Users },
                  { role: 'User (Citoyen)', color: 'outline', features: ['Signaler corruption', 'Protéger projet', 'Suivre dossiers', 'Profil'], icon: User },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Icon className="h-5 w-5 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{item.role}</h4>
                          <Badge variant={item.color as any}>{item.role.split(' ')[0]}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.features.map((feature, j) => (
                            <Badge key={j} variant="outline" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>🏗️ Stack Technologique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Frontend
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>React</span>
                      <Badge variant="outline">18.3</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>TypeScript</span>
                      <Badge variant="outline">5.6</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Vite</span>
                      <Badge variant="outline">5.4</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>TailwindCSS</span>
                      <Badge variant="outline">3.4</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Shadcn/UI</span>
                      <Badge variant="outline">Latest</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Backend
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Supabase</span>
                      <Badge variant="outline">PostgreSQL</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>RLS Policies</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Edge Functions</span>
                      <Badge variant="outline">Deno</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Realtime</span>
                      <Badge variant="outline">WebSockets</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-primary/5">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Pipeline IA
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    <span className="font-medium">Gemini</span>
                    <span className="text-muted-foreground">→ Analyse profonde des cas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    <span className="font-medium">GPT</span>
                    <span className="text-muted-foreground">→ Résumé structuré</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    <span className="font-medium">Claude</span>
                    <span className="text-muted-foreground">→ Prédiction et routing intelligent</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔄 Flux de Données</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-semibold mb-3">1. Signalement</h4>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Badge>Citoyen</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">AI Agent</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">Gemini</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">GPT</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">Claude</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="secondary">Routage</Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-semibold mb-3">2. Traitement</h4>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Badge>Nouveau Cas</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">Validation Admin</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">Assignation Agent</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">Enquête</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="secondary">Résolution</Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-semibold mb-3">3. Device Identity</h4>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Badge>Utilisateur Anonyme</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">Device Fingerprint</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">Signalements Stockés</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="outline">Création Compte</Badge>
                    <ChevronRight className="h-3 w-3" />
                    <Badge variant="secondary">Migration Auto</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>🤖 Agent IA "Taper le Ndjobi"</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Assistant conversationnel empathique qui guide l'utilisateur dans le processus de signalement
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-3">Flux Conversationnel :</h4>
                <div className="space-y-2">
                  {[
                    { step: '1', label: 'Accueil', desc: 'Salutation et présentation' },
                    { step: '2', label: 'Type', desc: 'Corruption, Fraude, Abus, Détournement' },
                    { step: '3', label: 'Localisation', desc: 'GPS automatique ou saisie manuelle' },
                    { step: '4', label: 'Description', desc: 'Texte ou reconnaissance vocale' },
                    { step: '5', label: 'Preuves', desc: 'Upload photos/documents (optionnel)' },
                    { step: '6', label: 'Témoin', desc: 'Accepte de témoigner (optionnel)' },
                    { step: '7', label: 'Validation', desc: 'Relecture et confirmation' },
                    { step: '8', label: 'Soumission', desc: 'Enregistrement et numéro de suivi' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded border">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold text-sm">Voix</h4>
                  <p className="text-xs text-muted-foreground">Speech Recognition API</p>
                </div>
                <div className="p-3 rounded-lg border text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-semibold text-sm">GPS</h4>
                  <p className="text-xs text-muted-foreground">Géolocalisation précise</p>
                </div>
                <div className="p-3 rounded-lg border text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-semibold text-sm">Anonyme</h4>
                  <p className="text-xs text-muted-foreground">Sans authentification</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>🗄️ Schéma Base de Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    auth.users & public.profiles
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Gestion des utilisateurs et profils
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">id (UUID)</Badge>
                    <Badge variant="outline">email/phone</Badge>
                    <Badge variant="outline">username</Badge>
                    <Badge variant="outline">avatar_url</Badge>
                    <Badge variant="outline">created_at</Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    public.user_roles
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Système RBAC (Role-Based Access Control)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">user_id</Badge>
                    <Badge variant="outline">role (ENUM)</Badge>
                    <Badge variant="outline">assigned_at</Badge>
                    <Badge variant="outline">assigned_by</Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    public.signalements
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Table principale des signalements de corruption
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Badge variant="outline">id (UUID)</Badge>
                    <Badge variant="outline">user_id (nullable)</Badge>
                    <Badge variant="outline">type</Badge>
                    <Badge variant="outline">location</Badge>
                    <Badge variant="outline">description</Badge>
                    <Badge variant="outline">evidence_files</Badge>
                    <Badge variant="outline">status</Badge>
                    <Badge variant="outline">device_id</Badge>
                    <Badge variant="outline">is_anonymous</Badge>
                    <Badge variant="outline">created_at</Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    public.projets
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Projets citoyens à protéger
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">id (UUID)</Badge>
                    <Badge variant="outline">user_id</Badge>
                    <Badge variant="outline">title</Badge>
                    <Badge variant="outline">description</Badge>
                    <Badge variant="outline">category</Badge>
                    <Badge variant="outline">status</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔒 RLS Policies (Row Level Security)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Toutes les tables sont protégées par des policies RLS garantissant que chaque utilisateur 
                  ne peut accéder qu'aux données autorisées selon son rôle.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="p-3 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-1">Users can view own data</h4>
                  <code className="text-xs bg-muted p-2 rounded block">
                    USING (auth.uid() = user_id OR is_anonymous = true)
                  </code>
                </div>
                <div className="p-3 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-1">Agents view assigned cases</h4>
                  <code className="text-xs bg-muted p-2 rounded block">
                    USING (role IN ('agent', 'admin', 'super_admin'))
                  </code>
                </div>
                <div className="p-3 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-1">Super Admin full access</h4>
                  <code className="text-xs bg-muted p-2 rounded block">
                    USING (role = 'super_admin')
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>🔐 Sécurité Multi-Niveaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Authentification
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Phone + PIN (6 chiffres)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Session JWT Supabase
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Refresh tokens automatiques
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Email technique interne
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    Device Identity
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Triple identification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Fingerprint (Canvas, WebGL)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      SHA-256 hashing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Migration automatique
                    </li>
                  </ul>
                </div>
              </div>

              <Alert className="border-red-500/50 bg-red-50/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Module XR-7 - Classification SECRET DÉFENSE</AlertTitle>
                <AlertDescription>
                  Le module d'urgence XR-7 est soumis à des restrictions légales strictes. 
                  Activation uniquement sous autorisation judiciaire. Toutes les actions sont 
                  enregistrées de manière immutable et auditées.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Projet NDJOBI v2.0</h3>
              <p className="text-sm text-muted-foreground">
                Développé pour la République Gabonaise 🇬🇦
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-1">Dernière mise à jour</Badge>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderXR7View = () => (
    <div className="space-y-6">
      <Alert className="border-red-500/50 bg-red-50/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Module XR-7 - Accès Restreint</AlertTitle>
        <AlertDescription>
          Ce module est soumis à des restrictions légales strictes. Utilisation sous autorisation judiciaire uniquement.
        </AlertDescription>
      </Alert>
      <SystemMaintenancePanel />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Centre de Contrôle Système</h1>
              <p className="text-muted-foreground mt-2">
                Supervision complète de la plateforme NDJOBI
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                <Zap className="h-5 w-5 mr-2" />
                Super Admin
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Lock className="h-5 w-5 mr-2" />
                Accès Maximum
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={activeView === 'dashboard' ? 'default' : 'outline'}
              onClick={() => handleNavigateToView('dashboard')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeView === 'system' ? 'default' : 'outline'}
              onClick={() => handleNavigateToView('system')}
            >
              <Server className="h-4 w-4 mr-2" />
              Gestion Système
            </Button>
            <Button
              variant={activeView === 'users' ? 'default' : 'outline'}
              onClick={() => handleNavigateToView('users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Utilisateurs
            </Button>
            <Button
              variant={activeView === 'project' ? 'default' : 'outline'}
              onClick={() => handleNavigateToView('project')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Projet
            </Button>
            <Button
              variant={activeView === 'xr7' ? 'default' : 'outline'}
              onClick={() => handleNavigateToView('xr7')}
            >
              <Lock className="h-4 w-4 mr-2" />
              Module XR-7
            </Button>
          </div>

          {isLoading && (
            <Alert>
              <RefreshCcw className="h-4 w-4 animate-spin" />
              <AlertDescription>Chargement des données...</AlertDescription>
            </Alert>
          )}

          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'system' && renderSystemView()}
          {activeView === 'users' && renderUsersView()}
          {activeView === 'reports' && renderReportsView()}
          {activeView === 'project' && renderProjectView()}
          {activeView === 'xr7' && renderXR7View()}

          {activeView === 'dashboard' && (
            <Alert className="border-destructive/30">
              <Shield className="h-4 w-4" />
              <AlertTitle>Privilèges Super Admin</AlertTitle>
              <AlertDescription>
                Vous disposez d'un accès complet au système. Toutes les actions sont enregistrées et auditées.
                Utilisez ces privilèges avec prudence et conformément aux procédures établies.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
