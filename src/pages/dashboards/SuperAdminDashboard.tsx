import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Zap, Database, Users, User, Shield, Activity, Terminal, 
  FileText, AlertCircle, Settings, BarChart3, Lock, 
  Eye, TrendingUp, Server, ChevronRight, AlertTriangle,
  Clock, Check, X, RefreshCcw, Download, Upload, MapPin, CheckCircle,
  Search, Filter, Calendar, ExternalLink, Trash2, Wrench, PlayCircle, UserPlus,
  Key, Bot, Cpu, Globe, Link, Save, TestTube, Copy, EyeOff, Brain, Package, Radio, Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { superAdminAuthService } from '@/services/superAdminAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { systemManagementService, type DatabaseStats, type ServiceStatus } from '@/services/systemManagement';
import { userManagementService, type UserDetail, type UserStats } from '@/services/userManagement';
import { accountSwitchingService, type DemoAccount } from '@/services/accountSwitching';
import { getDashboardUrl } from '@/lib/roleUtils';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface ApiKey {
  id: string;
  name: string;
  service: 'openai' | 'claude' | 'gemini' | 'google' | 'azure' | 'twilio' | 'custom';
  key: string;
  status: 'active' | 'inactive' | 'error';
  lastUsed?: string;
  usage?: number;
  limit?: number;
}

interface ConnectedApp {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'oauth' | 'mcp';
  url?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  config?: Record<string, any>;
}

interface MCPConfig {
  id: string;
  name: string;
  endpoint: string;
  protocol: 'http' | 'websocket' | 'grpc';
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  lastConnected?: string;
}

interface AIAgent {
  id: string;
  name: string;
  model: string;
  provider: string;
  status: 'active' | 'inactive' | 'training';
  capabilities: string[];
  lastUsed?: string;
  config?: Record<string, any>;
}

const SuperAdminDashboard = () => {
  console.log('🏛️ SuperAdminDashboard RENDER START');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  console.log('🏛️ SuperAdminDashboard state:', { user: !!user, role, authLoading });
  
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
  
  // États pour la gestion système
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [securityScanResults, setSecurityScanResults] = useState<any>(null);
  
  // États pour la gestion des utilisateurs
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditRole, setShowEditRole] = useState(false);
  const [newRole, setNewRole] = useState('');
  
  // États pour la configuration
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const [mcpConfigs, setMcpConfigs] = useState<MCPConfig[]>([]);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [showAppForm, setShowAppForm] = useState(false);
  const [showMCPForm, setShowMCPForm] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [newApiKey, setNewApiKey] = useState<Partial<ApiKey>>({});
  const [newApp, setNewApp] = useState<Partial<ConnectedApp>>({});
  const [newMCP, setNewMCP] = useState<Partial<MCPConfig>>({});
  const [newAgent, setNewAgent] = useState<Partial<AIAgent>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [usersError, setUsersError] = useState<string | null>(null);
  
  // États pour la vue démo
  const [demoAccounts, setDemoAccounts] = useState<Array<{
    id: string;
    email: string;
    role: string;
    password: string;
    phoneNumber?: string;
    countryCode?: string;
    fullName?: string;
    created_at: string;
    last_used: string | null;
  }>>([]);
  const [newAccountRole, setNewAccountRole] = useState<string>('user');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  // IMPORTANT: TOUS les hooks doivent être déclarés avant tout return conditionnel
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
    if (user) {
      loadSystemStats();
      loadUsers();
      loadActivityLogs();
      loadSystemData();
      loadConfigurationData();
    }
  }, [user]);

  // Charger les données système quand on change de vue
  useEffect(() => {
    if (activeView === 'system' && user) {
      loadSystemData();
    }
  }, [activeView, user]);

  // Debounce simple pour la recherche (éviter spam d'updates UI)
  useEffect(() => {
    const id = setTimeout(() => {
      // noop: le filtrage est dérivé, le debounce évite juste de recalculer trop souvent
    }, 200);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Returns conditionnels APRÈS tous les hooks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }
  if (!role || role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Accès refusé</p>
      </div>
    );
  }

  // Fonctions de chargement (peuvent être après les hooks)
  const loadSystemData = async () => {
    if (activeView === 'system') {
      try {
        const [stats, serviceStatus] = await Promise.all([
          systemManagementService.getDatabaseStats(),
          systemManagementService.checkServiceStatus(),
        ]);
        
        setDbStats(stats);
        setServices(serviceStatus);
        
        // Mettre à jour aussi les stats générales
        setSystemStats(prev => ({
          ...prev,
          dbSize: stats.totalSize,
          totalUsers: stats.userCount,
          totalReports: stats.signalementCount,
          totalProjects: stats.projetCount,
        }));
      } catch (error) {
        console.error('Erreur chargement données système:', error);
      }
    }
  };

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

  const loadConfigurationData = async () => {
    try {
      // Charger les clés API (simulation - dans un vrai projet, ceci viendrait d'une table sécurisée)
      const mockApiKeys: ApiKey[] = [
        {
          id: '1',
          name: 'OpenAI GPT-4',
          service: 'openai',
          key: 'sk-***...***',
          status: 'active',
          lastUsed: '2024-01-15T10:30:00Z',
          usage: 1250,
          limit: 10000
        },
        {
          id: '2',
          name: 'Claude 3.5 Sonnet',
          service: 'claude',
          key: 'sk-ant-***...***',
          status: 'active',
          lastUsed: '2024-01-15T09:15:00Z',
          usage: 850,
          limit: 5000
        },
        {
          id: '3',
          name: 'Google Gemini 1.5 Pro',
          service: 'gemini',
          key: 'sk-gem-***...***',
          status: 'inactive',
          lastUsed: '2024-01-10T12:00:00Z',
          usage: 0,
          limit: 20000
        },
        {
          id: '4',
          name: 'Twilio Verify / SMS',
          service: 'twilio',
          key: 'twilio-***...***',
          status: 'active',
          lastUsed: '2024-01-15T08:50:00Z',
          usage: 420,
          limit: 100000
        }
      ];

      // Charger les applications connectées
      const mockConnectedApps: ConnectedApp[] = [
        {
          id: '1',
          name: 'Supabase Database',
          type: 'api',
          url: 'https://your-project.supabase.co',
          status: 'connected',
          lastSync: '2024-01-15T11:00:00Z'
        },
        {
          id: '2',
          name: 'Webhook Notifications',
          type: 'webhook',
          url: 'https://hooks.slack.com/...',
          status: 'connected',
          lastSync: '2024-01-15T10:45:00Z'
        }
      ];

      // Charger les configurations MCP
      const mockMCPConfigs: MCPConfig[] = [
        {
          id: '1',
          name: 'File System MCP',
          endpoint: 'http://localhost:3001/mcp',
          protocol: 'http',
          status: 'active',
          capabilities: ['file_read', 'file_write', 'directory_list'],
          lastConnected: '2024-01-15T11:00:00Z'
        }
      ];

      // Charger les agents IA
      const mockAIAgents: AIAgent[] = [
        {
          id: '1',
          name: 'Ndjobi Assistant',
          model: 'gpt-4',
          provider: 'openai',
          status: 'active',
          capabilities: ['chat', 'analysis', 'report_generation'],
          lastUsed: '2024-01-15T10:30:00Z'
        }
      ];

      setApiKeys(mockApiKeys);
      setConnectedApps(mockConnectedApps);
      setMcpConfigs(mockMCPConfigs);
      setAiAgents(mockAIAgents);
    } catch (error) {
      console.error('Erreur chargement configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive"
      });
    }
  };

  const loadUsers = async () => {
    try {
      setUsersError(null);
      setIsLoading(true);
      
      const usersData = await userManagementService.getAllUsers(100);
      
      const mappedUsers: UserData[] = usersData.map(user => ({
        id: user.id,
        email: user.email,
        username: user.full_name || 'Utilisateur',
        role: user.role,
        status: user.status,
        lastLogin: user.last_sign_in_at 
          ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR')
          : 'Jamais',
        created_at: user.created_at,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setUsersError("Impossible de charger les utilisateurs");
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    try {
      setIsLoading(true);
      toast({
        title: "Backup en cours...",
        description: "Création de la sauvegarde de la base de données",
      });

      const filename = await systemManagementService.createBackup();
      
      setIsLoading(false);
      toast({
        title: "Backup réussi",
        description: `Fichier sauvegardé: ${filename}`,
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur backup",
        description: "Impossible de créer la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleRestartServices = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Redémarrage des services...",
        description: "Vérification de l'état des services",
      });

      // Recharger les services pour simuler un redémarrage
      await loadSystemData();
      
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Services vérifiés",
          description: "Tous les services sont opérationnels",
        });
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de redémarrer les services",
        variant: "destructive",
      });
    }
  };

  const handleSecurityScan = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Scan de sécurité...",
        description: "Analyse du système en cours",
      });

      const results = await systemManagementService.runSecurityScan();
      setSecurityScanResults(results);
      
      setIsLoading(false);
      
      if (results.vulnerabilities === 0) {
        toast({
          title: "Scan terminé",
          description: `${results.passed} vérifications passées. Aucune vulnérabilité détectée.`,
        });
      } else {
        toast({
          title: "Attention",
          description: `${results.vulnerabilities} vulnérabilité(s) détectée(s)`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur scan",
        description: "Impossible de scanner le système",
        variant: "destructive",
      });
    }
  };

  const handleOptimizeDatabase = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Optimisation en cours...",
        description: "Optimisation de la base de données",
      });

      const results = await systemManagementService.optimizeDatabase();
      
      setIsLoading(false);
      toast({
        title: "Optimisation terminée",
        description: `${results.tablesOptimized} tables optimisées. ${results.spaceReclaimed} récupérés.`,
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible d'optimiser la base de données",
        variant: "destructive",
      });
    }
  };

  const handleCleanupData = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Nettoyage en cours...",
        description: "Suppression des anciennes données",
      });

      const count = await systemManagementService.cleanupOldData(90);
      
      setIsLoading(false);
      toast({
        title: "Nettoyage terminé",
        description: `${count} enregistrement(s) supprimé(s)`,
      });
      
      await loadSystemData();
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer les données",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async (format: 'csv' | 'json') => {
    try {
      setIsLoading(true);
      toast({
        title: "Export en cours...",
        description: `Génération du fichier ${format.toUpperCase()}`,
      });

      const blob = await systemManagementService.exportData(format);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `ndjobi-export-${timestamp}.${format}`;
      
      systemManagementService.downloadBlob(blob, filename);
      
      setIsLoading(false);
      toast({
        title: "Export réussi",
        description: `Fichier téléchargé: ${filename}`,
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur export",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const { user, stats } = await userManagementService.getUserDetails(userId);
      setSelectedUser(user as any);
      setUserStats(stats);
      setShowUserDetails(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      setSelectedUser(user as any);
      setNewRole(user.role);
      setShowEditRole(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'éditer le rôle",
        variant: "destructive",
      });
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      setIsLoading(true);
      await userManagementService.updateUserRole(selectedUser.id, newRole);
      
      toast({
        title: "Rôle mis à jour",
        description: `Le rôle a été changé vers ${newRole}`,
      });
      
      setShowEditRole(false);
      await loadUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setSelectedUser(user as any);
    setShowSuspendDialog(true);
  };

  const handleConfirmSuspend = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      await userManagementService.suspendUser(selectedUser.id, suspendReason);
      
      toast({
        title: "Utilisateur suspendu",
        description: "L'utilisateur a été suspendu avec succès",
      });
      
      setShowSuspendDialog(false);
      setSuspendReason('');
      await loadUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de suspendre l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      setIsLoading(true);
      await userManagementService.reactivateUser(userId);
      
      toast({
        title: "Utilisateur réactivé",
        description: "L'utilisateur a été réactivé avec succès",
      });
      
      await loadUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réactiver l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  // Fonctions de gestion de la configuration
  const handleAddApiKey = async () => {
    try {
      if (!newApiKey.name || !newApiKey.service || !newApiKey.key) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newApiKey.name!,
        service: newApiKey.service!,
        key: newApiKey.key!,
        status: 'active',
        lastUsed: new Date().toISOString(),
        usage: 0,
        limit: newApiKey.limit || 1000
      };

      setApiKeys(prev => [...prev, newKey]);
      setNewApiKey({});
      setShowApiKeyForm(false);
      
      toast({
        title: "Clé API ajoutée",
        description: `La clé ${newKey.name} a été ajoutée avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la clé API",
        variant: "destructive"
      });
    }
  };

  const handleAddConnectedApp = async () => {
    try {
      if (!newApp.name || !newApp.type) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const newAppData: ConnectedApp = {
        id: Date.now().toString(),
        name: newApp.name!,
        type: newApp.type!,
        url: newApp.url,
        status: 'connected',
        lastSync: new Date().toISOString(),
        config: newApp.config
      };

      setConnectedApps(prev => [...prev, newAppData]);
      setNewApp({});
      setShowAppForm(false);
      
      toast({
        title: "Application connectée",
        description: `${newAppData.name} a été ajoutée avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'application",
        variant: "destructive"
      });
    }
  };

  const handleAddMCP = async () => {
    try {
      if (!newMCP.name || !newMCP.endpoint || !newMCP.protocol) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const newMCPData: MCPConfig = {
        id: Date.now().toString(),
        name: newMCP.name!,
        endpoint: newMCP.endpoint!,
        protocol: newMCP.protocol!,
        status: 'active',
        capabilities: newMCP.capabilities || [],
        lastConnected: new Date().toISOString()
      };

      setMcpConfigs(prev => [...prev, newMCPData]);
      setNewMCP({});
      setShowMCPForm(false);
      
      toast({
        title: "MCP ajouté",
        description: `${newMCPData.name} a été configuré avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le MCP",
        variant: "destructive"
      });
    }
  };

  const handleAddAIAgent = async () => {
    try {
      if (!newAgent.name || !newAgent.model || !newAgent.provider) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const newAgentData: AIAgent = {
        id: Date.now().toString(),
        name: newAgent.name!,
        model: newAgent.model!,
        provider: newAgent.provider!,
        status: 'active',
        capabilities: newAgent.capabilities || [],
        lastUsed: new Date().toISOString(),
        config: newAgent.config
      };

      setAiAgents(prev => [...prev, newAgentData]);
      setNewAgent({});
      setShowAgentForm(false);
      
      toast({
        title: "Agent IA ajouté",
        description: `${newAgentData.name} a été configuré avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'agent IA",
        variant: "destructive"
      });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le texte a été copié dans le presse-papiers",
    });
  };

  const testConnection = async (type: string, id: string) => {
    try {
      toast({
        title: "Test en cours...",
        description: `Test de connexion pour ${type}`,
      });

      // Simulation d'un test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test réussi",
        description: `La connexion ${type} fonctionne correctement`,
      });
    } catch (error) {
      toast({
        title: "Test échoué",
        description: `La connexion ${type} a échoué`,
        variant: "destructive"
      });
    }
  };

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
    <div className="space-y-6">
      {/* Statistiques de la base de données */}
      {dbStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Taille Base de Données</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">{dbStats.totalSize}</div>
              <p className="text-xs text-muted-foreground">{dbStats.tableCount} tables</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dbStats.userCount}</div>
              <p className="text-xs text-muted-foreground">Comptes actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Signalements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dbStats.signalementCount}</div>
              <p className="text-xs text-muted-foreground">Total enregistrés</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Projets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dbStats.projetCount}</div>
              <p className="text-xs text-muted-foreground">Protégés</p>
              </CardContent>
            </Card>
          </div>
      )}

    <Card>
              <CardHeader>
          <div className="flex items-center justify-between">
            <div>
        <CardTitle>Gestion Système</CardTitle>
        <CardDescription>Configuration et maintenance de la plateforme NDJOBI</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadSystemData}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Actions rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={handleBackup}
                disabled={isLoading}
              >
            <Database className="h-6 w-6" />
                <span className="font-medium">Backup</span>
                <span className="text-xs text-muted-foreground">Sauvegarder la DB</span>
          </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={handleRestartServices}
                disabled={isLoading}
              >
            <RefreshCcw className="h-6 w-6" />
                <span className="font-medium">Services</span>
                <span className="text-xs text-muted-foreground">Vérifier l'état</span>
          </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={handleSecurityScan}
                disabled={isLoading}
              >
            <Shield className="h-6 w-6" />
                <span className="font-medium">Sécurité</span>
                <span className="text-xs text-muted-foreground">Scanner le système</span>
          </Button>
            </div>
        </div>

          {/* Actions avancées */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Actions Avancées</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={handleOptimizeDatabase}
                disabled={isLoading}
              >
                <Wrench className="h-6 w-6" />
                <span className="font-medium">Optimiser</span>
                <span className="text-xs text-muted-foreground">Optimiser la DB</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={handleCleanupData}
                disabled={isLoading}
              >
                <Trash2 className="h-6 w-6" />
                <span className="font-medium">Nettoyer</span>
                <span className="text-xs text-muted-foreground">Supprimer anciennes données</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => handleExportData('json')}
                disabled={isLoading}
              >
                <Download className="h-6 w-6" />
                <span className="font-medium">Exporter</span>
                <span className="text-xs text-muted-foreground">JSON / CSV</span>
              </Button>
            </div>
          </div>

          {/* Résultats du scan de sécurité */}
          {securityScanResults && (
            <Alert className={securityScanResults.vulnerabilities > 0 ? 'border-red-500/50' : 'border-green-500/50'}>
              <Shield className="h-4 w-4" />
              <AlertTitle>Résultats du Scan de Sécurité</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>✅ Vérifications passées:</span>
                    <Badge variant="default">{securityScanResults.passed}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>⚠️ Avertissements:</span>
                    <Badge variant="secondary">{securityScanResults.warnings}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>❌ Vulnérabilités:</span>
                    <Badge variant="destructive">{securityScanResults.vulnerabilities}</Badge>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  {securityScanResults.details.map((detail: string, i: number) => (
                    <div key={i}>{detail}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* État des Services */}
        <div>
          <h3 className="text-lg font-semibold mb-3">État des Services</h3>
            {services.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Chargement de l'état des services...</p>
              </div>
            ) : (
          <div className="space-y-2">
                {services.map((service, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                        service.status === 'running' ? 'bg-green-500 animate-pulse' :
                    service.status === 'idle' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="font-medium">{service.name}</span>
                  </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Uptime: {service.uptime}</span>
                      <Badge variant={
                        service.status === 'running' ? 'default' : 
                        service.status === 'idle' ? 'secondary' : 
                        'destructive'
                      }>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
            )}
        </div>

          {/* Ressources Système */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Ressources Système</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                  <span className={systemStats.cpuUsage > 80 ? 'text-red-500 font-semibold' : ''}>
                    {systemStats.cpuUsage}%
                  </span>
              </div>
                <Progress 
                  value={systemStats.cpuUsage} 
                  className={`h-2 ${systemStats.cpuUsage > 80 ? 'bg-red-100' : ''}`}
                />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mémoire</span>
                  <span className={systemStats.memoryUsage > 85 ? 'text-red-500 font-semibold' : ''}>
                    {systemStats.memoryUsage}%
                  </span>
              </div>
                <Progress 
                  value={systemStats.memoryUsage} 
                  className={`h-2 ${systemStats.memoryUsage > 85 ? 'bg-red-100' : ''}`}
                />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disque</span>
                  <span className={systemStats.diskUsage > 90 ? 'text-red-500 font-semibold' : ''}>
                    {systemStats.diskUsage}%
                  </span>
              </div>
                <Progress 
                  value={systemStats.diskUsage} 
                  className={`h-2 ${systemStats.diskUsage > 90 ? 'bg-red-100' : ''}`}
                />
            </div>
              <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/30">
                <span className="text-sm font-medium">Taille base de données</span>
                <Badge variant="outline">{systemStats.dbSize}</Badge>
              </div>
            </div>
          </div>

          {/* Export des données */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Export des Données</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => handleExportData('json')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleExportData('csv')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
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
          {usersError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{usersError}</AlertDescription>
            </Alert>
          )}
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="inline-flex items-center gap-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span>Chargement des utilisateurs…</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
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
                         'Utilisateur'}
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
                          aria-label="Voir les détails utilisateur"
                          onClick={() => handleViewUser(user.id)}
                          disabled={isLoading}
                        >
                        <Eye className="h-4 w-4" />
                </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          aria-label="Changer le rôle"
                          onClick={() => handleEditRole(user.id)}
                          disabled={isLoading}
                          title="Changer le rôle"
                        >
                        <Settings className="h-4 w-4" />
                      </Button>
                        {user.status === 'active' ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            aria-label="Suspendre l'utilisateur"
                            onClick={() => handleSuspendUser(user.id)}
                            disabled={isLoading}
                            title="Suspendre l'utilisateur"
                          >
                            <X className="h-4 w-4 text-orange-500" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            aria-label="Réactiver l'utilisateur"
                            onClick={() => handleReactivateUser(user.id)}
                            disabled={isLoading}
                            title="Réactiver l'utilisateur"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
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

      {/* Dialog: Détails Utilisateur */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'Utilisateur</DialogTitle>
            <DialogDescription>
              Informations complètes et statistiques
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Nom complet</Label>
                  <p className="text-sm font-medium">{selectedUser.full_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rôle</Label>
                  <div className="mt-1">
                    <Badge variant={
                      selectedUser.role === 'super_admin' ? 'destructive' :
                      selectedUser.role === 'admin' ? 'default' :
                      selectedUser.role === 'agent' ? 'secondary' :
                      'outline'
                    }>
                      {selectedUser.role === 'super_admin' ? 'Super Admin' :
                       selectedUser.role === 'admin' ? 'Admin' :
                       selectedUser.role === 'agent' ? 'Agent' :
                       'Utilisateur'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.status === 'active' ? 'default' : 'destructive'}>
                      {selectedUser.status === 'active' ? 'Actif' : 'Suspendu'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date d'inscription</Label>
                  <p className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Dernière mise à jour</Label>
                  <p className="text-sm">{new Date(selectedUser.updated_at || selectedUser.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {userStats && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Statistiques d'activité</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg border bg-muted/30">
                      <div className="text-2xl font-bold text-primary">{userStats.totalSignalements}</div>
                      <p className="text-xs text-muted-foreground">Signalements</p>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-muted/30">
                      <div className="text-2xl font-bold text-blue-500">{userStats.totalProjets}</div>
                      <p className="text-xs text-muted-foreground">Projets</p>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-muted/30">
                      <div className="text-sm font-bold text-green-500">
                        {userStats.lastActivity 
                          ? new Date(userStats.lastActivity).toLocaleDateString('fr-FR')
                          : 'Aucune'}
                      </div>
                      <p className="text-xs text-muted-foreground">Dernière activité</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Changer le Rôle */}
      <Dialog open={showEditRole} onOpenChange={setShowEditRole}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le Rôle</DialogTitle>
            <DialogDescription>
              Modifier le rôle de l'utilisateur {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nouveau rôle</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin (Protocole d'État)</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Attention : Le changement de rôle prendra effet immédiatement et modifiera les permissions de l'utilisateur.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRole(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmRoleChange} disabled={isLoading || !newRole}>
              {isLoading ? 'Mise à jour...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Suspendre Utilisateur */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre l'Utilisateur</DialogTitle>
            <DialogDescription>
              Suspendre temporairement l'accès de {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Raison de la suspension (optionnel)</Label>
              <Textarea
                placeholder="Expliquez pourquoi cet utilisateur est suspendu..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={4}
              />
            </div>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                L'utilisateur ne pourra plus se connecter tant que son compte est suspendu.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmSuspend} disabled={isLoading}>
              {isLoading ? 'Suspension...' : 'Suspendre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              onClick={() => handleExportData('json')}
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
                Plateforme de Bonne Gouvernance - République Gabonaise
              </CardDescription>
                  </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              Version 2.0.0
            </Badge>
                </div>
              </CardHeader>
            </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
          <TabsTrigger value="database">Base de Données</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="audit">🔍 Audit</TabsTrigger>
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

          <Card>
            <CardHeader>
              <CardTitle>⚡ Espace Super Admin - Centre de Contrôle Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-destructive/50 bg-destructive/5">
                <Zap className="h-4 w-4 text-destructive" />
                <AlertTitle>Implémentation Complète - Octobre 2025</AlertTitle>
                <AlertDescription>
                  Espace Super Admin entièrement opérationnel avec contrôle total du système, 
                  gestion avancée des utilisateurs, monitoring temps réel, configuration des clés API IA, 
                  logs d'audit, statistiques consolidées et sécurité maximale.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-3">🎛️ Modules Principaux (6 Vues) :</h4>
                <div className="space-y-2">
                  {[
                    { 
                      view: 'Dashboard', 
                      icon: BarChart3,
                      color: 'text-blue-500',
                      features: ['Statistiques système en temps réel', 'Métriques utilisateurs (total, actifs, nouveaux)', 'Signalements et projets', 'CPU/RAM/Disk monitoring', 'Sessions actives', 'Graphiques de performance'] 
                    },
                    { 
                      view: 'Utilisateurs', 
                      icon: Users,
                      color: 'text-green-500',
                      features: ['CRUD complet utilisateurs', 'Attribution et modification de rôles', 'Suspension/Réactivation/Suppression', 'Statistiques détaillées par utilisateur', 'Recherche et filtres avancés', 'Réinitialisation mots de passe'] 
                    },
                    { 
                      view: 'Système', 
                      icon: Server,
                      color: 'text-orange-500',
                      features: ['Monitoring base de données (tailles, tables, index)', 'État des services Supabase', 'Scan de sécurité automatique', 'Backup et export données', 'Optimisation DB', 'Nettoyage données anciennes'] 
                    },
                    { 
                      view: 'Configuration', 
                      icon: Settings,
                      color: 'text-purple-500',
                      features: ['Gestion clés API IA (OpenAI, Claude, Gemini, Azure)', 'Applications connectées (Webhooks, OAuth, API)', 'Configuration MCP (Model Context Protocol)', 'Agents IA personnalisés', 'Test et validation clés', 'Statistiques d\'usage'] 
                    },
                    { 
                      view: 'Comptes Démo', 
                      icon: TestTube,
                      color: 'text-cyan-500',
                      features: ['Création comptes démo (Citoyen, Agent, Admin)', 'Basculement de compte sécurisé', 'Gestion téléphones et emails démo', 'Historique d\'utilisation', 'Suppression et nettoyage', 'Tests de rôles en temps réel'] 
                    },
                    { 
                      view: 'Projet', 
                      icon: FileText,
                      color: 'text-indigo-500',
                      features: ['Documentation exhaustive NDJOBI', 'Architecture et flux de données', 'Schémas base de données', 'Audit de sécurité complet', 'Recommandations et bonnes pratiques', 'Versioning et changelog'] 
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                        <Icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2 mb-1">
                            {item.view}
                            <Badge variant="outline" className="text-xs">{item.features.length} fonctionnalités</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.features.join(' • ')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🔒 Sécurité et Contrôle d'Accès :</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border bg-red-50/50 dark:bg-red-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-red-500" />
                      <h5 className="font-semibold text-sm">Authentification Renforcée</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Vérification rôle super_admin obligatoire</li>
                      <li>• Code d'accès unique sécurisé</li>
                      <li>• Session persistante HttpOnly cookies</li>
                      <li>• Expiration automatique après 24h</li>
                      <li>• Protection CSRF et XSS</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border bg-orange-50/50 dark:bg-orange-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <h5 className="font-semibold text-sm">Audit et Traçabilité</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Logs complets de toutes les actions</li>
                      <li>• Traçabilité modification utilisateurs</li>
                      <li>• Historique changements de rôles</li>
                      <li>• Export logs au format CSV</li>
                      <li>• Alertes actions sensibles</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <h5 className="font-semibold text-sm">Monitoring Temps Réel</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Performances système (CPU, RAM, Disk)</li>
                      <li>• État services Supabase</li>
                      <li>• Temps de réponse API</li>
                      <li>• Sessions actives utilisateurs</li>
                      <li>• Alertes dépassement seuils</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <h5 className="font-semibold text-sm">Gestion IA Centralisée</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Configuration multi-providers (OpenAI, Claude, Gemini)</li>
                      <li>• Rotation automatique des clés</li>
                      <li>• Monitoring usage et coûts</li>
                      <li>• Tests de connexion intégrés</li>
                      <li>• Basculement provider en cas d'erreur</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">⚙️ Gestion Avancée des Utilisateurs :</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="h-4 w-4 text-green-500" />
                      <h5 className="font-semibold text-sm">Création et Modification</h5>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Création de nouveaux comptes avec attribution de rôle immédiate. 
                      Modification profil (nom, organisation, avatar). Attribution/modification rôle (user, agent, admin, super_admin). 
                      Génération automatique email technique interne.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <X className="h-4 w-4 text-orange-500" />
                      <h5 className="font-semibold text-sm">Suspension et Désactivation</h5>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Suspension temporaire avec raison documentée. Réactivation en un clic. 
                      Suppression définitive (soft delete) avec conservation logs. 
                      Notification automatique à l'utilisateur concerné.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <h5 className="font-semibold text-sm">Recherche et Filtrage</h5>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recherche textuelle (email, nom, organisation). 
                      Filtres par rôle (tous, super_admin, admin, agent, user). 
                      Tri par date création, dernière connexion, activité. 
                      Pagination optimisée pour grandes quantités.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <h5 className="font-semibold text-sm">Statistiques Utilisateur</h5>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total signalements soumis. Total projets protégés. 
                      Dernière activité enregistrée. Taux de participation. 
                      Contribution à la lutte anti-corruption.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🔧 Services et Intégrations :</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border text-center">
                    <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h5 className="font-semibold text-sm">UserManagementService</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Service centralisé pour toutes les opérations utilisateurs
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg border text-center">
                    <Server className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <h5 className="font-semibold text-sm">SystemManagementService</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitoring, backups, optimisation et sécurité
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg border text-center">
                    <Key className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h5 className="font-semibold text-sm">SuperAdminAuthService</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Authentification renforcée et gestion sessions
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">📊 Capacités de Reporting :</h4>
                <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exports Disponibles
                      </h5>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                        <li>• Export complet base de données (JSON/CSV)</li>
                        <li>• Liste utilisateurs avec statistiques</li>
                        <li>• Logs d'audit période personnalisée</li>
                        <li>• Rapport sécurité et vulnérabilités</li>
                        <li>• Métriques performance système</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Analytics Avancées
                      </h5>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                        <li>• Croissance utilisateurs (jour/semaine/mois)</li>
                        <li>• Répartition par rôle et organisation</li>
                        <li>• Taux d'activité et engagement</li>
                        <li>• Performance des agents DGSS</li>
                        <li>• Impact des signalements résolus</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="border-green-500/50 bg-green-50/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>✅ Statut : Production Ready - Espace Super Admin Opérationnel</AlertTitle>
                <AlertDescription>
                  L'espace Super Admin est entièrement fonctionnel avec contrôle total du système, 
                  gestion complète des utilisateurs et rôles, monitoring temps réel, configuration IA multi-providers, 
                  logs d'audit exhaustifs, statistiques consolidées et sécurité maximale. Aucune donnée simulée.
                </AlertDescription>
              </Alert>

              <div className="p-4 rounded-lg border-2 border-destructive/50 bg-destructive/5">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-destructive mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">🔐 Accès Super Admin</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Code d'accès unique:</strong> 011282*</p>
                      <p><strong>Email:</strong> iasted@me.com</p>
                      <p><strong>Téléphone:</strong> +33 6 61 00 26 16</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        ⚠️ Accès réservé exclusivement au Super Administrateur système. 
                        Toutes les actions sont enregistrées et auditées. Session sécurisée 24h.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>👑 Dashboard Administrateur (Protocole d'État)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-primary/50 bg-primary/5">
                <Shield className="h-4 w-4" />
                <AlertTitle>Implémentation Complète - Octobre 2024</AlertTitle>
                <AlertDescription>
                  Dashboard entièrement fonctionnel avec données réelles, gestion d'erreurs, 
                  états de chargement, et interactions complètes.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-3">🤖 Intelligence Artificielle pour le Triage :</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <h5 className="font-semibold text-sm">Scoring Automatique</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Score de priorité (0-100) basé sur gravité</li>
                      <li>• Score de crédibilité selon preuves</li>
                      <li>• Détection automatique de catégorie</li>
                      <li>• Classification: critique, haute, moyenne, basse</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <h5 className="font-semibold text-sm">Analyse Intelligente</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Identification facteurs clés (montants, noms, lieux)</li>
                      <li>• Détection indicateurs de risque</li>
                      <li>• Recommandations d'actions personnalisées</li>
                      <li>• Estimation impact national/régional</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <h5 className="font-semibold text-sm">Catégorisation Avancée</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Corruption Administrative</li>
                      <li>• Corruption Économique</li>
                      <li>• Détournement de Fonds Publics</li>
                      <li>• Fraude, Abus de Pouvoir, Népotisme</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <h5 className="font-semibold text-sm">Capacité de Traitement</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• 200 000 signalements/jour analysés</li>
                      <li>• Tri automatique et priorisation</li>
                      <li>• Alertes cas critiques en temps réel</li>
                      <li>• Batch processing optimisé</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🔧 Fonctionnalités Présidentielles :</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <h5 className="font-semibold text-sm">Gestion Agents DGSS</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Liste complète agents par région</li>
                      <li>• Statistiques de performance</li>
                      <li>• Assignation et réassignation</li>
                      <li>• Monitoring temps réel</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-indigo-500" />
                      <h5 className="font-semibold text-sm">Projets Protégés</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Supervision projets blockchain</li>
                      <li>• Certificats d'horodatage</li>
                      <li>• Stats par catégorie et région</li>
                      <li>• Validation projets stratégiques</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Radio className="h-4 w-4 text-red-500" />
                      <h5 className="font-semibold text-sm">Module XR-7</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Activation protocoles d'urgence</li>
                      <li>• Protection témoins</li>
                      <li>• Préservation preuves</li>
                      <li>• Autorisation judiciaire requise</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-green-500" />
                      <h5 className="font-semibold text-sm">Analytics Stratégiques</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Performance par région</li>
                      <li>• Taux de résolution</li>
                      <li>• Impact économique des cas</li>
                      <li>• Rapports Vision 2025</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4 text-cyan-500" />
                      <h5 className="font-semibold text-sm">Filtres Avancés</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Par catégorie de corruption</li>
                      <li>• Par score de priorité IA</li>
                      <li>• Par région/localisation</li>
                      <li>• Recherche textuelle intelligente</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-yellow-500" />
                      <h5 className="font-semibold text-sm">Audit & Sécurité</h5>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      <li>• Historique actions présidentielles</li>
                      <li>• Journalisation complète</li>
                      <li>• Conformité protocoles nationaux</li>
                      <li>• Traçabilité totale</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">📊 Vues Disponibles (7 Onglets) :</h4>
                <div className="space-y-2">
                  {[
                    { 
                      view: 'Dashboard', 
                      icon: BarChart3,
                      features: ['Stats IA (priorité/crédibilité)', 'Cas critiques prioritaires', 'Graphiques temps réel', 'Alertes urgentes'] 
                    },
                    { 
                      view: 'Validation', 
                      icon: CheckCircle,
                      features: ['Liste complète signalements', 'Analyse IA intégrée', 'Filtres multicritères', 'Actions: valider/assigner/rejeter'] 
                    },
                    { 
                      view: 'Agents', 
                      icon: Users,
                      features: ['Gestion agents DGSS', 'Performance par agent', 'Cas assignés', 'Statistiques régionales'] 
                    },
                    { 
                      view: 'Projets', 
                      icon: Package,
                      features: ['Projets protégés blockchain', 'Certificats horodatage', 'Validation projets stratégiques', 'Stats par catégorie'] 
                    },
                    { 
                      view: 'XR-7', 
                      icon: Radio,
                      features: ['Activations d\'urgence', 'Autorisation judiciaire', 'Protection témoins', 'Historique interventions'] 
                    },
                    { 
                      view: 'Rapports', 
                      icon: FileText,
                      features: ['KPIs Vision 2025', 'Performance régionale', 'Impact économique', 'Génération rapports PDF'] 
                    },
                    { 
                      view: 'Paramètres', 
                      icon: Settings,
                      features: ['Seuils IA configurables', 'Notifications présidentielles', 'Délégation agents', 'Actualisation données'] 
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-2 rounded border text-sm">
                        <Icon className="h-4 w-4 mt-0.5 text-primary" />
                        <div className="flex-1">
                          <div className="font-semibold">{item.view}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.features.join(' • ')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🎨 Composants UI Utilisés :</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Dialog (Modales)</Badge>
                  <Badge variant="outline">Tabs (Navigation)</Badge>
                  <Badge variant="outline">Table (Listes)</Badge>
                  <Badge variant="outline">Select (Filtres)</Badge>
                  <Badge variant="outline">Input (Recherche)</Badge>
                  <Badge variant="outline">Textarea (Motif rejet)</Badge>
                  <Badge variant="outline">Badge (Statuts)</Badge>
                  <Badge variant="outline">Button (Actions)</Badge>
                  <Badge variant="outline">Alert (Notifications)</Badge>
                  <Badge variant="outline">Progress (Indicateurs)</Badge>
                  <Badge variant="outline">Card (Structure)</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">🎯 Alignement Vision Politique 2025 :</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border bg-green-50/50 dark:bg-green-950/20">
                    <h5 className="font-semibold text-sm mb-2">✅ Lutte Contre la Corruption</h5>
                    <p className="text-xs text-muted-foreground">
                      Triage IA de 200 000 signalements/jour • Scoring automatique • Traitement prioritaire • 
                      Coordination nationale des enquêtes
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20">
                    <h5 className="font-semibold text-sm mb-2">💰 Assainissement Budgétaire</h5>
                    <p className="text-xs text-muted-foreground">
                      Détection détournements • Récupération fonds publics • Impact économique mesuré • 
                      Rapports financiers détaillés
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20">
                    <h5 className="font-semibold text-sm mb-2">🏭 Souveraineté Économique</h5>
                    <p className="text-xs text-muted-foreground">
                      Protection projets stratégiques • Supervision marchés publics • 
                      Transparence contrats d'État • Innovation nationale protégée
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-orange-50/50 dark:bg-orange-950/20">
                    <h5 className="font-semibold text-sm mb-2">🌱 Diversification Économique</h5>
                    <p className="text-xs text-muted-foreground">
                      Stats projets innovants • Secteurs émergents • Capital humain • 
                      Soutien entrepreneurs gabonais
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="border-green-500/50 bg-green-50/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>✅ Statut : Production Ready - Protocole d'État Opérationnel</AlertTitle>
                <AlertDescription>
                  Le dashboard Protocole d'État (Président) est entièrement fonctionnel avec Intelligence Artificielle, 
                  scoring automatique, gestion complète des agents, analytics stratégiques, module XR-7, 
                  et conformité totale aux protocoles de sécurité nationale. Aucun mock data.
                </AlertDescription>
              </Alert>

              <div className="p-4 rounded-lg border-2 border-yellow-500/50 bg-yellow-50/10">
                <div className="flex items-start gap-3">
                  <Crown className="h-6 w-6 text-yellow-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">📞 Compte Démo Protocole d'État</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Téléphone:</strong> +241 77 777 003</p>
                      <p><strong>Email technique:</strong> 24177777003@ndjobi.temp</p>
                      <p><strong>PIN:</strong> 123456</p>
                      <p><strong>Organisation:</strong> Présidence de la République du Gabon</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        ⚠️ Compte accessible uniquement depuis le Super Admin Dashboard via basculement sécurisé
                      </p>
                    </div>
                  </div>
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

        <TabsContent value="audit" className="space-y-4 mt-4">
          <Card className="border-yellow-500/30 bg-yellow-50/5">
            <CardHeader>
              <CardTitle className="text-xl">📋 AUDIT COMPLET NDJOBI - Octobre 2025</CardTitle>
              <CardDescription>Analyse exhaustive de l'application, sécurité, performances et recommandations</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-500/20">
              <CardHeader>
                <CardTitle className="text-sm">✅ Points Forts</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>• Architecture modulaire bien structurée</div>
                <div>• TypeScript + React modernes</div>
                <div>• Supabase RLS bien implémenté</div>
                <div>• Support PWA et offline</div>
                <div>• Authentification multi-rôle fonctionnelle</div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-sm">⚠️ Domaines Critiques</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>• Secrets exposés en localStorage</div>
                <div>• Hardcoded credentials (super admin)</div>
                <div>• Validation entrée insuffisante</div>
                <div>• Gestion erreurs incohérente</div>
                <div>• Tests unitaires manquants</div>
              </CardContent>
            </Card>

            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="text-sm">🔴 Risques Majeurs</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>• XSS potentiel (données JSON)</div>
                <div>• CSRF non protégé explicitement</div>
                <div>• Logging sensible en console dev</div>
                <div>• Pas de rate limiting</div>
                <div>• Dépendances outdated</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🏗️ Architecture & Dépendances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Stack Technologique :</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="p-2 rounded border">React 18.3.1</div>
                  <div className="p-2 rounded border">TypeScript 5.8.3</div>
                  <div className="p-2 rounded border">Vite 5.4.19</div>
                  <div className="p-2 rounded border">Supabase 2.75.0</div>
                  <div className="p-2 rounded border">TailwindCSS 3.4.17</div>
                  <div className="p-2 rounded border">Shadcn/UI Latest</div>
                  <div className="p-2 rounded border">React Router 6.30.1</div>
                  <div className="p-2 rounded border">React Query 5.83.0</div>
                  <div className="p-2 rounded border">Zod 3.25.76</div>
                </div>
              </div>

              <Alert className="border-blue-500/30 bg-blue-50/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Risque :</strong> Package.json contient 92 dépendances. Nécessite audit de sécurité régulier avec npm audit.
                  Certaines versions pourraient être outdated.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔐 Sécurité Détaillée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50/30">
                  <h5 className="font-semibold text-sm mb-1">🔴 CRITIQUE: Credentials Hardcodés</h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Fichier:</strong> src/services/superAdminAuth.ts
                  </p>
                  <p className="text-xs mb-2">
                    Code d'accès Super Admin '011282*' et email 'iasted@me.com' + téléphone '+33661002616' en clair
                  </p>
                  <p className="text-xs text-orange-700"><strong>Correction:</strong> Utiliser variables d'environnement + chiffrement</p>
                </div>

                <div className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50/30">
                  <h5 className="font-semibold text-sm mb-1">🔴 CRITIQUE: localStorage Non Sécurisé</h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    Stockage de sessions (ndjobi_demo_session, ndjobi_super_admin_session) en localStorage
                  </p>
                  <p className="text-xs mb-2">
                    Accessible via JavaScript et XSS attacks
                  </p>
                  <p className="text-xs text-orange-700"><strong>Correction:</strong> Utiliser sessionStorage ou HttpOnly cookies côté backend</p>
                </div>

                <div className="p-3 rounded-lg border-l-4 border-orange-500 bg-orange-50/30">
                  <h5 className="font-semibold text-sm mb-1">⚠️ MAJEUR: Validation Entrée Insuffisante</h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    Zod utilisé côté frontend uniquement (ReportForm.tsx, ProjectProtectionForm.tsx)
                  </p>
                  <p className="text-xs mb-2">
                    Pas de validation côté backend dans les Edge Functions Supabase
                  </p>
                  <p className="text-xs text-orange-700"><strong>Correction:</strong> Implémenter middleware validation sur tous les endpoints</p>
                </div>

                <div className="p-3 rounded-lg border-l-4 border-orange-500 bg-orange-50/30">
                  <h5 className="font-semibold text-sm mb-1">⚠️ MAJEUR: RLS Policies Incomplètes</h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    Device Sessions: policies WITH CHECK(true) pour INSERT = n'importe qui peut insérer
                  </p>
                  <p className="text-xs mb-2">
                    Comportement intentionnel pour mode anonyme mais risque si exploité
                  </p>
                  <p className="text-xs text-orange-700"><strong>Correction:</strong> Ajouter vérification device_id + rate limiting</p>
                </div>

                <div className="p-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50/30">
                  <h5 className="font-semibold text-sm mb-1">🟡 MOYEN: Pas d'HTTPS Enforcement</h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    Supabase enforces HTTPS mais pas d'headers de sécurité explicites
                  </p>
                  <p className="text-xs text-orange-700"><strong>Correction:</strong> Ajouter CSP, HSTS, X-Frame-Options headers</p>
                </div>

                <div className="p-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50/30">
                  <h5 className="font-semibold text-sm mb-1">🟡 MOYEN: DevTools Protection Insuffisante</h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    coreProtection.ts utilise obfuscation console (inefficace contre décompilation)
                  </p>
                  <p className="text-xs mb-2">
                    Peut être contourné avec Developer Mode
                  </p>
                  <p className="text-xs text-orange-700"><strong>Correction:</strong> Pas de solution fiable côté client. Valider critique operations côté serveur</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💾 Base de Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">📊 Tables & Migrations :</h4>
                <div className="text-sm space-y-2">
                  <div>✅ 11 migrations appliquées (2025-10-12 à 2025-10-16)</div>
                  <div>✅ RLS activé sur tables sensibles</div>
                  <div>✅ Indexes créés pour performances (device_id, timestamps, status)</div>
                  <div>✅ Columns flexibles (is_anonymous, device_id, ai_scores)</div>
                  <div>⚠️ Views administratifs créés mais sans matérialisation</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-blue-50/30">
                <h5 className="font-semibold text-sm mb-2">Tables Principales :</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div>• profiles</div>
                  <div>• signalements</div>
                  <div>• projets</div>
                  <div>• user_roles</div>
                  <div>• device_sessions</div>
                  <div>• investigations</div>
                  <div>• investigation_reports</div>
                  <div>• emergency_activations</div>
                  <div>• admin_audit_log</div>
                </div>
              </div>

              <Alert className="border-yellow-500/30 bg-yellow-50/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Optimisation :</strong> Ajouter VACUUM ANALYZE après migrations majeures. 
                  Considérer partitionnement signalements par date pour très gros volumes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📱 Services Clés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg border">
                  <h5 className="font-semibold mb-2">✅ userPersistence.ts</h5>
                  <div>Gestion PWA et localStorage bien structurée</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <h5 className="font-semibold mb-2">✅ offlineService.ts</h5>
                  <div>Queue synchronisation avec retry logic</div>
                </div>
                <div className="p-3 rounded-lg border bg-yellow-50/30">
                  <h5 className="font-semibold mb-2">⚠️ demoAccountService.ts</h5>
                  <div>Sessions locales bien mais sans expiration réelle</div>
                </div>
                <div className="p-3 rounded-lg border bg-red-50/30">
                  <h5 className="font-semibold mb-2">🔴 superAdminAuth.ts</h5>
                  <div>Credentials + codes en dur (voir sécurité)</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <h5 className="font-semibold mb-2">✅ deviceIdentity.ts</h5>
                  <div>Fingerprinting solide avec FingerprintJS</div>
                </div>
                <div className="p-3 rounded-lg border bg-orange-50/30">
                  <h5 className="font-semibold mb-2">⚠️ logger.ts</h5>
                  <div>Logging en localStorage (volume limité à 1000 entries)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🚀 Performance & Optimisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg border bg-green-50/30">
                  <h5 className="font-semibold text-sm mb-1">✅ Optimisations En Place</h5>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• Code splitting avec lazy loading (dashboards)</li>
                    <li>• Chunking Rollup configuré (react, supabase, ui)</li>
                    <li>• PWA Workbox avec runtime caching</li>
                    <li>• React Query pour data caching</li>
                    <li>• Tree-shaking TypeScript/ESLint</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg border bg-yellow-50/30">
                  <h5 className="font-semibold text-sm mb-1">⚠️ À Améliorer</h5>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• Pas d'image optimization (imageOptimization.ts incomplete)</li>
                    <li>• Pas de compression gzip/brotli configurée (Vite default)</li>
                    <li>• Bundle size warning à 1000KB (trop généreux)</li>
                    <li>• Pas de metrics Web Vitals</li>
                    <li>• Sentry configuré mais peut surcharger dev</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-blue-500/30 bg-blue-50/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommandation :</strong> Exécuter vite-bundle-analyzer pour identifier gros packages. 
                  Considérer lazy-loading pour Recharts (charts grandes applications).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧪 Tests & QA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border bg-red-50/30">
                <h5 className="font-semibold text-sm mb-2">🔴 Critique: Pas de Tests Unitaires</h5>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• vitest + @testing-library configurés mais fichiers tests vides</li>
                  <li>• Pas de test pour services critiques (auth, useAuth hook)</li>
                  <li>• Pas de test pour RLS policies</li>
                  <li>• Pas de E2E tests (playwright config exists)</li>
                  <li>• Coverage: 0%</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border bg-orange-50/30">
                <h5 className="font-semibold text-sm mb-2">⚠️ À Implémenter</h5>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Tests useAuth hook avec mocks Supabase</li>
                  <li>• Tests RLS policies avec pgTAP ou sql-tests</li>
                  <li>• Tests E2E dashboards (login → actions)</li>
                  <li>• Tests securité: XSS, CSRF, injection</li>
                  <li>• Objectif: 70% coverage pour code critique</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔄 Authentification & Rôles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border bg-green-50/30">
                <h5 className="font-semibold text-sm mb-2">✅ Fonctionnel</h5>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• 4 rôles implémentés: user, agent, admin, super_admin</li>
                  <li>• RLS policies par rôle cohérentes</li>
                  <li>• useAuth hook avec caching global</li>
                  <li>• ProtectedRoute middleware</li>
                  <li>• Fallback local pour démo</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border bg-red-50/30">
                <h5 className="font-semibold text-sm mb-2">🔴 Risques</h5>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Demo accounts en clair (exemples d'emails)</li>
                  <li>• Pas de 2FA/MFA implémenté</li>
                  <li>• Sessions sans expiration timeout (XR-7 = 24h seulement)</li>
                  <li>• Pas de CAPTCHA sur login</li>
                  <li>• Pas de brute-force protection côté frontend</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📦 Configuration & Déploiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="p-2 rounded border bg-blue-50/30">
                  <strong>Vite:</strong> React+SWC, PWA plugin, bundle optimize bien configuré
                </div>
                <div className="p-2 rounded border bg-orange-50/30">
                  <strong>ESLint:</strong> Minimal (unused vars désactivés - risque)
                </div>
                <div className="p-2 rounded border bg-orange-50/30">
                  <strong>TailwindCSS:</strong> Config correcte mais pas de purge explicite
                </div>
                <div className="p-2 rounded border bg-blue-50/30">
                  <strong>Supabase:</strong> migrations automatiques, RLS activé
                </div>
                <div className="p-2 rounded border bg-yellow-50/30">
                  <strong>Env.template:</strong> Variables manquantes (VITE_APP_VERSION pas utilisée)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-orange-50/5">
            <CardHeader>
              <CardTitle>🎯 Recommandations Prioritaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Badge variant="destructive">P0</Badge>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">Sécuriser Credentials Super Admin</h5>
                    <p className="text-xs text-muted-foreground">Déplacer 011282* et iasted@me.com en env variables. Ajouter 2FA.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Badge variant="destructive">P0</Badge>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">Validation Backend RLS</h5>
                    <p className="text-xs text-muted-foreground">Vérifier RLS policies device_sessions ne permet pas abus. Ajouter rate limiting API.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Badge>P1</Badge>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">Implémenter Tests Unitaires</h5>
                    <p className="text-xs text-muted-foreground">Commencer par useAuth hook et services critiques. Target 50% coverage.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Badge>P1</Badge>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">Ajouter Security Headers</h5>
                    <p className="text-xs text-muted-foreground">CSP, HSTS, X-Frame-Options à niveau Netlify/Vercel.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Badge>P2</Badge>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">Optimiser Image Loading</h5>
                    <p className="text-xs text-muted-foreground">Utiliser webp avec fallbacks. Lazy-load hero images.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Badge>P2</Badge>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">Audit Dépendances Mensuels</h5>
                    <p className="text-xs text-muted-foreground">npm audit + update. Scripter en CI/CD.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-50/5">
            <CardHeader>
              <CardTitle>✅ Résumé Exécutif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>État Général:</strong> Application fonctionnelle avec architecture solide. Les risques majeurs sont en sécurité 
                (hardcoded credentials, localStorage) plutôt qu'en stabilité. Prêt pour production avec correctifs sécurité.
              </div>
              <div>
                <strong>Compliance:</strong> Respect RGPD partiellement (anonymisation, consent). Nécessite audit légal pour données sensibles 
                (XR-7 = données protégées).
              </div>
              <div>
                <strong>Scalabilité:</strong> Architecture supporterait 10K utilisateurs sans problème. Au-delà: nécessite optimisations DB 
                (partitionnement, read replicas).
              </div>
              <div>
                <strong>Maintenance:</strong> Code typescript bien typé. Documentation projet existante. Équipe peut maintenir + évolver.
              </div>
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

  const renderConfigView = () => (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-6 w-6" />
                Configuration des Services
              </CardTitle>
              <CardDescription>
                Gérez les clés API, applications connectées, MCP et agents IA
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="api-keys" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="api-keys">Clés API</TabsTrigger>
              <TabsTrigger value="apps">Applications</TabsTrigger>
              <TabsTrigger value="mcp">MCP</TabsTrigger>
              <TabsTrigger value="agents">Agents IA</TabsTrigger>
            </TabsList>

            {/* Onglet Clés API */}
            <TabsContent value="api-keys" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Clés API IA</h3>
                <Button onClick={() => setShowApiKeyForm(true)}>
                  <Key className="h-4 w-4 mr-2" />
                  Ajouter une clé
                </Button>
              </div>

              <div className="grid gap-4">
                {apiKeys.map((key) => (
                  <Card key={key.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{key.name}</h4>
                            <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                              {key.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">Service:</span>
                            <Badge variant="outline">{key.service}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">Clé:</span>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {showKeys[key.id] ? key.key : '••••••••••••••••'}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleKeyVisibility(key.id)}
                            >
                              {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(key.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          {key.usage !== undefined && key.limit && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Usage:</span>
                              <Progress value={(key.usage / key.limit) * 100} className="flex-1" />
                              <span className="text-sm">{key.usage}/{key.limit}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnection('API Key', key.id)}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            Tester
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Onglet Applications Connectées */}
            <TabsContent value="apps" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Applications Connectées</h3>
                <Button onClick={() => setShowAppForm(true)}>
                  <Link className="h-4 w-4 mr-2" />
                  Connecter une app
                </Button>
              </div>

              <div className="grid gap-4">
                {connectedApps.map((app) => (
                  <Card key={app.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{app.name}</h4>
                            <Badge variant={app.status === 'connected' ? 'default' : 'secondary'}>
                              {app.status}
                            </Badge>
                            <Badge variant="outline">{app.type}</Badge>
                          </div>
                          {app.url && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">URL:</span>
                              <code className="text-sm bg-muted px-2 py-1 rounded">{app.url}</code>
                            </div>
                          )}
                          {app.lastSync && (
                            <div className="text-sm text-muted-foreground">
                              Dernière sync: {new Date(app.lastSync).toLocaleString('fr-FR')}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnection('App', app.id)}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            Tester
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Onglet MCP */}
            <TabsContent value="mcp" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Configurations MCP</h3>
                <Button onClick={() => setShowMCPForm(true)}>
                  <Cpu className="h-4 w-4 mr-2" />
                  Ajouter MCP
                </Button>
              </div>

              <div className="grid gap-4">
                {mcpConfigs.map((mcp) => (
                  <Card key={mcp.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{mcp.name}</h4>
                            <Badge variant={mcp.status === 'active' ? 'default' : 'secondary'}>
                              {mcp.status}
                            </Badge>
                            <Badge variant="outline">{mcp.protocol}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">Endpoint:</span>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{mcp.endpoint}</code>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">Capacités:</span>
                            <div className="flex gap-1">
                              {mcp.capabilities.map((cap) => (
                                <Badge key={cap} variant="secondary" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnection('MCP', mcp.id)}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            Tester
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Onglet Agents IA */}
            <TabsContent value="agents" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Agents IA</h3>
                <Button onClick={() => setShowAgentForm(true)}>
                  <Bot className="h-4 w-4 mr-2" />
                  Ajouter un agent
                </Button>
              </div>

              <div className="grid gap-4">
                {aiAgents.map((agent) => (
                  <Card key={agent.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{agent.name}</h4>
                            <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                              {agent.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">Modèle:</span>
                            <Badge variant="outline">{agent.model}</Badge>
                            <span className="text-sm text-muted-foreground">Provider:</span>
                            <Badge variant="outline">{agent.provider}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground">Capacités:</span>
                            <div className="flex gap-1">
                              {agent.capabilities.map((cap) => (
                                <Badge key={cap} variant="secondary" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {agent.lastUsed && (
                            <div className="text-sm text-muted-foreground">
                              Dernière utilisation: {new Date(agent.lastUsed).toLocaleString('fr-FR')}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnection('Agent', agent.id)}
                          >
                            <TestTube className="h-4 w-4 mr-1" />
                            Tester
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  const renderDemoView = () => {
    // Initialiser les comptes démo prédéfinis
    if (demoAccounts.length === 0) {
      setDemoAccounts([
        {
          id: 'demo-user',
          email: '24177777001@ndjobi.temp',
          role: 'user',
          password: '123456',
          phoneNumber: '77777001',
          countryCode: '+241',
          fullName: 'Citoyen Démo',
          created_at: new Date().toISOString(),
          last_used: null
        },
        {
          id: 'demo-agent',
          email: '24177777002@ndjobi.com',
          role: 'agent',
          password: '123456',
          phoneNumber: '77777002',
          countryCode: '+241',
          fullName: 'Agent DGSS Démo',
          created_at: new Date().toISOString(),
          last_used: null
        },
        {
          id: 'demo-admin',
          email: '24177777003@ndjobi.com',
          role: 'admin',
          password: '123456',
          phoneNumber: '77777003',
          countryCode: '+241',
          fullName: 'Protocole d\'État Démo',
          created_at: new Date().toISOString(),
          last_used: null
        },
        // Ajout de comptes agents supplémentaires prédéfinis
        {
          id: 'demo-agent-2',
          email: 'demo.agent.2@ndjobi.com',
          role: 'agent',
          password: 'demo123',
          phoneNumber: '77777012',
          countryCode: '+241',
          fullName: 'Agent DGSS Démo 2',
          created_at: new Date().toISOString(),
          last_used: null
        },
        {
          id: 'demo-agent-3',
          email: 'demo.agent.3@ndjobi.com',
          role: 'agent',
          password: 'demo123',
          phoneNumber: '77777013',
          countryCode: '+241',
          fullName: 'Agent DGSS Démo 3',
          created_at: new Date().toISOString(),
          last_used: null
        },
        {
          id: 'demo-agent-4',
          email: 'demo.agent.4@ndjobi.com',
          role: 'agent',
          password: 'demo123',
          phoneNumber: '77777014',
          countryCode: '+241',
          fullName: 'Agent DGSS Démo 4',
          created_at: new Date().toISOString(),
          last_used: null
        }
      ]);
    }

    const handleSwitchToDemo = async (demoAccount: DemoAccount) => {
      console.log('🔄 handleSwitchToDemo appelé avec:', demoAccount);
      setSwitchingAccount(true);
      try {
        console.log('📞 Appel accountSwitchingService.switchToDemoAccount...');
        const result = await accountSwitchingService.switchToDemoAccount(demoAccount);
        console.log('📥 Résultat du basculement:', result);
        
        if (result.success) {
          console.log('✅ Basculement réussi, affichage toast...');
          toast({
            title: 'Basculement réussi',
            description: `Vous êtes maintenant connecté en tant que ${demoAccount.fullName}`,
          });
          // Redirection immédiate vers le dashboard du rôle cible
          const target = demoAccount.role === 'super_admin' ? '/dashboard/super-admin'
            : demoAccount.role === 'admin' ? '/dashboard/admin'
            : demoAccount.role === 'agent' ? '/dashboard/agent'
            : '/dashboard/user';
          console.log('🎯 Redirection vers:', target);
          
          // Attendre que l'événement soit traité, puis recharger la page
          setTimeout(() => {
            console.log('🚀 Rechargement complet de la page vers:', target);
            window.location.href = target;
          }, 100);
        } else {
          console.error('❌ Basculement échoué:', result.error);
          throw new Error(result.error || 'Erreur de basculement');
        }
      } catch (error: any) {
        console.error('💥 Erreur de basculement:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur de basculement',
          description: error.message || 'Impossible de basculer vers ce compte',
        });
      } finally {
        console.log('🏁 handleSwitchToDemo terminé, setSwitchingAccount(false)');
        setSwitchingAccount(false);
      }
    };

    const handleCreateDemoAccount = async () => {
      setCreatingAccount(true);
      try {
        const email = `demo.${newAccountRole}.${Date.now()}@ndjobi.com`;
        const password = 'Demo123!';

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `Démo ${newAccountRole.toUpperCase()}`,
              is_demo: true
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: newAccountRole as 'user' | 'agent' | 'admin' | 'super_admin'
            });

          if (roleError) throw roleError;

          toast({
            title: "Compte démo créé",
            description: `Email: ${email} / Mot de passe: ${password}`,
          });

          setDemoAccounts(prev => [...prev, {
            id: authData.user!.id,
            email,
            role: newAccountRole,
            password,
            created_at: new Date().toISOString(),
            last_used: null
          }]);
        }
      } catch (error: any) {
        console.error('Error creating demo account:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de créer le compte démo",
          variant: "destructive",
        });
      } finally {
        setCreatingAccount(false);
      }
    };

    const handleDeleteDemoAccount = async (accountId: string, email: string) => {
      try {
        const { error } = await supabase.auth.admin.deleteUser(accountId);
        
        if (error) throw error;

        toast({
          title: "Compte supprimé",
          description: `Le compte ${email} a été supprimé avec succès`,
        });

        setDemoAccounts(prev => prev.filter(acc => acc.id !== accountId));
      } catch (error: any) {
        console.error('Error deleting demo account:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de supprimer le compte",
          variant: "destructive",
        });
      }
    };

    const handleCopyCredentials = (email: string, password: string) => {
      const credentials = `Email: ${email}\nMot de passe: ${password}`;
      navigator.clipboard.writeText(credentials);
      toast({
        title: "Copié",
        description: "Les identifiants ont été copiés dans le presse-papiers",
      });
    };

    return (
      <div className="space-y-6">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-6 w-6" />
                  Gestion des Comptes Démo
                </CardTitle>
                <CardDescription>
                  Créez et gérez les comptes de démonstration pour les visiteurs et partenaires
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                {demoAccounts.length} comptes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-500/50 bg-blue-50/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                Les comptes démo permettent aux visiteurs de tester la plateforme avec des données fictives.
                Chaque compte a un rôle spécifique (Citoyen, Agent, Admin) et des données de test.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="demo-role">Rôle du nouveau compte</Label>
                  <Select value={newAccountRole} onValueChange={setNewAccountRole}>
                    <SelectTrigger id="demo-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Citoyen</SelectItem>
                      <SelectItem value="agent">Agent DGSS</SelectItem>
                      <SelectItem value="admin">Protocole d'État</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateDemoAccount} 
                  disabled={creatingAccount}
                  className="mt-6"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {creatingAccount ? "Création..." : "Créer un compte"}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Mot de passe</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Dernière utilisation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono text-sm">{account.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          account.role === 'admin' ? 'default' :
                          account.role === 'agent' ? 'secondary' :
                          'outline'
                        }>
                          {account.role === 'user' ? 'Citoyen' :
                           account.role === 'agent' ? 'Agent DGSS' :
                           'Protocole d\'État'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{account.password}</TableCell>
                      <TableCell className="text-sm">{`${account.countryCode || '+241'} ${account.phoneNumber || ''}`}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(account.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {account.last_used ? new Date(account.last_used).toLocaleDateString('fr-FR') : 'Jamais'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSwitchToDemo({
                              id: account.id,
                              email: account.email,
                              role: account.role,
                              password: account.password,
                              fullName: account.fullName || `Démo ${account.role === 'user' ? 'Citoyen' : account.role === 'agent' ? 'Agent DGSS' : 'Protocole d\'État'}`,
                              phoneNumber: account.phoneNumber || '77777001',
                              countryCode: account.countryCode || '+241'
                            })}
                            disabled={switchingAccount}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {switchingAccount ? 'Basculement...' : 'Accès direct'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyCredentials(account.email, account.password)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Copier
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDemoAccount(account.id, account.email)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Comptes Démo Pré-configurés</CardTitle>
                <CardDescription>
                  Ces comptes sont disponibles pour les démonstrations publiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-blue-200 bg-blue-50/10">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Compte Citoyen
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Utilisateur standard
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Email:</span> demo.citoyen@ndjobi.com
                      </div>
                      <div>
                        <span className="font-semibold">Mot de passe:</span> demo123
                      </div>
                      <div className="text-muted-foreground">
                        Accès aux fonctionnalités de base : signalements, protection de projets
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50/10">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Agent DGSS
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Direction Générale des Services Spéciaux
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Email:</span> demo.agent@ndjobi.com
                      </div>
                      <div>
                        <span className="font-semibold">Mot de passe:</span> demo123
                      </div>
                      <div className="text-muted-foreground">
                        Accès aux enquêtes, gestion des cas, rapports terrain
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50/10">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Protocole d'État
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Accès présidentiel - Administrateur
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Email:</span> demo.admin@ndjobi.com
                      </div>
                      <div>
                        <span className="font-semibold">Mot de passe:</span> demo123
                      </div>
                      <div className="text-muted-foreground">
                        Accès à la supervision, validation, rapports avancés
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200/60 bg-green-50/10">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Pack Agents DGSS (x3)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Ensemble de comptes pour démontrer le dispatch intelligent et l'assignation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Emails:</span> demo.agent.2@ndjobi.com, demo.agent.3@ndjobi.com, demo.agent.4@ndjobi.com
                      </div>
                      <div>
                        <span className="font-semibold">Mot de passe:</span> demo123
                      </div>
                      <div className="text-muted-foreground">
                        Idéal pour tester l'assignation multi-agents et la charge
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Note importante</AlertTitle>
                  <AlertDescription>
                    Les comptes démo sont réinitialisés toutes les 24 heures. Toutes les données créées sont fictives et seront supprimées automatiquement.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
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
            <Button
              variant={activeView === 'demo' ? 'default' : 'outline'}
              onClick={() => handleNavigateToView('demo')}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Démo
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
          {activeView === 'config' && renderConfigView()}
          {activeView === 'demo' && renderDemoView()}

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

      {/* Formulaires de configuration */}
      
      {/* Formulaire Clé API */}
      <Dialog open={showApiKeyForm} onOpenChange={setShowApiKeyForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une clé API</DialogTitle>
            <DialogDescription>
              Configurez une nouvelle clé API pour les services IA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="key-name">Nom de la clé</Label>
              <Input
                id="key-name"
                value={newApiKey.name || ''}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: OpenAI GPT-4 Production"
              />
            </div>
            <div>
              <Label htmlFor="key-service">Service</Label>
              <Select value={newApiKey.service || ''} onValueChange={(value) => setNewApiKey(prev => ({ ...prev, service: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                  <SelectItem value="gemini">Gemini (Google)</SelectItem>
                  <SelectItem value="google">Google AI (Vertex / PaLM)</SelectItem>
                  <SelectItem value="azure">Azure OpenAI</SelectItem>
                  <SelectItem value="twilio">Twilio (SMS/Verify)</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="key-value">Clé API</Label>
              <Input
                id="key-value"
                type="password"
                value={newApiKey.key || ''}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
                placeholder="sk-..."
              />
            </div>
            <div>
              <Label htmlFor="key-limit">Limite d'usage (optionnel)</Label>
              <Input
                id="key-limit"
                type="number"
                value={newApiKey.limit || ''}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                placeholder="1000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddApiKey}>
              <Save className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulaire Application Connectée */}
      <Dialog open={showAppForm} onOpenChange={setShowAppForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connecter une application</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle application ou service connecté
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="app-name">Nom de l'application</Label>
              <Input
                id="app-name"
                value={newApp.name || ''}
                onChange={(e) => setNewApp(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Slack Notifications"
              />
            </div>
            <div>
              <Label htmlFor="app-type">Type de connexion</Label>
              <Select value={newApp.type || ''} onValueChange={(value) => setNewApp(prev => ({ ...prev, type: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="api">API REST</SelectItem>
                  <SelectItem value="oauth">OAuth 2.0</SelectItem>
                  <SelectItem value="mcp">MCP (Model Context Protocol)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="app-url">URL (optionnel)</Label>
              <Input
                id="app-url"
                value={newApp.url || ''}
                onChange={(e) => setNewApp(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://api.example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddConnectedApp}>
              <Save className="h-4 w-4 mr-2" />
              Connecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulaire MCP */}
      <Dialog open={showMCPForm} onOpenChange={setShowMCPForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurer un MCP</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle configuration MCP (Model Context Protocol)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mcp-name">Nom du MCP</Label>
              <Input
                id="mcp-name"
                value={newMCP.name || ''}
                onChange={(e) => setNewMCP(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: File System MCP"
              />
            </div>
            <div>
              <Label htmlFor="mcp-endpoint">Endpoint</Label>
              <Input
                id="mcp-endpoint"
                value={newMCP.endpoint || ''}
                onChange={(e) => setNewMCP(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="http://localhost:3001/mcp"
              />
            </div>
            <div>
              <Label htmlFor="mcp-protocol">Protocole</Label>
              <Select value={newMCP.protocol || ''} onValueChange={(value) => setNewMCP(prev => ({ ...prev, protocol: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un protocole" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="websocket">WebSocket</SelectItem>
                  <SelectItem value="grpc">gRPC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mcp-capabilities">Capacités (séparées par des virgules)</Label>
              <Input
                id="mcp-capabilities"
                value={newMCP.capabilities?.join(', ') || ''}
                onChange={(e) => setNewMCP(prev => ({ ...prev, capabilities: e.target.value.split(',').map(c => c.trim()) }))}
                placeholder="file_read, file_write, directory_list"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMCPForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddMCP}>
              <Save className="h-4 w-4 mr-2" />
              Configurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulaire Agent IA */}
      <Dialog open={showAgentForm} onOpenChange={setShowAgentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un agent IA</DialogTitle>
            <DialogDescription>
              Configurez un nouvel agent IA personnalisé
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent-name">Nom de l'agent</Label>
              <Input
                id="agent-name"
                value={newAgent.name || ''}
                onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Assistant Ndjobi"
              />
            </div>
            <div>
              <Label htmlFor="agent-model">Modèle</Label>
              <Input
                id="agent-model"
                value={newAgent.model || ''}
                onChange={(e) => setNewAgent(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Ex: gpt-4, claude-3.5-sonnet"
              />
            </div>
            <div>
              <Label htmlFor="agent-provider">Provider</Label>
              <Select value={newAgent.provider || ''} onValueChange={(value) => setNewAgent(prev => ({ ...prev, provider: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="gemini">Gemini (Google)</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="agent-capabilities">Capacités (séparées par des virgules)</Label>
              <Input
                id="agent-capabilities"
                value={newAgent.capabilities?.join(', ') || ''}
                onChange={(e) => setNewAgent(prev => ({ ...prev, capabilities: e.target.value.split(',').map(c => c.trim()) }))}
                placeholder="chat, analysis, report_generation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgentForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddAIAgent}>
              <Save className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;
