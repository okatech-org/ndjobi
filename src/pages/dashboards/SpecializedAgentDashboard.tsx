import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users, FileText, BarChart3, Eye, Search, AlertCircle, CheckCircle,
    Clock, TrendingUp, Calendar, MapPin, Shield, ChevronRight,
    Target, Briefcase, Activity, Filter, PieChart, ArrowUpRight, Map
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
    AgentRole,
    AGENT_ROLE_CONFIG,
    getTypesForAgentRole,
    SIGNALEMENT_TYPES
} from '@/services/signalementRouting';
import AgentRealtimeNotifications from '@/components/agent/AgentRealtimeNotifications';
import MonthlyEvolutionChart from '@/components/agent/MonthlyEvolutionChart';
import SignalementsMapView from '@/components/agent/SignalementsMapView';

interface SpecializedAgentDashboardProps {
    agentRole: AgentRole;
}

interface Signalement {
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string;
    location: string;
    description: string;
    reference_number?: string;
    assigned_agent_role?: string;
    created_at: string;
    updated_at: string;
    resolved_at?: string;
}

interface AgentStats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    successRate: number;
    avgResponseTime: string;
    thisMonth: number;
    lastMonth: number;
    byType: Record<string, number>;
}

const SpecializedAgentDashboard = ({ agentRole }: SpecializedAgentDashboardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, role, isLoading } = useAuth();
    const { toast } = useToast();

    const [activeView, setActiveView] = useState<'dashboard' | 'statistics' | 'tracking' | 'cases' | 'map'>('dashboard');
    
    // Callback for realtime notifications
    const handleNewSignalement = useCallback(() => {
        loadData();
    }, []);
    const [loading, setLoading] = useState(false);
    const [signalements, setSignalements] = useState<Signalement[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState<AgentStats>({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        successRate: 0,
        avgResponseTime: '0',
        thisMonth: 0,
        lastMonth: 0,
        byType: {},
    });

    const roleConfig = AGENT_ROLE_CONFIG[agentRole];
    const allowedTypes = getTypesForAgentRole(agentRole);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const view = params.get('view');
        if (view && ['dashboard', 'statistics', 'tracking', 'cases', 'map'].includes(view)) {
            setActiveView(view as typeof activeView);
        }
    }, [location.search]);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, agentRole]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Charger les signalements assignés à ce rôle
            const { data, error } = await supabase
                .from('signalements')
                .select('*')
                .eq('assigned_agent_role', agentRole)
                .order('created_at', { ascending: false }) as { data: Signalement[] | null; error: any };

            if (error) throw error;

            setSignalements(data || []);
            calculateStats(data || []);
        } catch (error) {
            console.error('Erreur chargement:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les données",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Signalement[]) => {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const pending = data.filter(s => s.status === 'pending').length;
        const inProgress = data.filter(s => ['investigation', 'assigned', 'in_progress'].includes(s.status)).length;
        const resolved = data.filter(s => ['resolved', 'closed'].includes(s.status)).length;
        const total = data.length;

        const thisMonthCount = data.filter(s => new Date(s.created_at) >= thisMonth).length;
        const lastMonthCount = data.filter(s => {
            const date = new Date(s.created_at);
            return date >= lastMonth && date < thisMonth;
        }).length;

        const byType: Record<string, number> = {};
        data.forEach(s => {
            byType[s.type] = (byType[s.type] || 0) + 1;
        });

        setStats({
            total,
            pending,
            inProgress,
            resolved,
            successRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
            avgResponseTime: '2.4',
            thisMonth: thisMonthCount,
            lastMonth: lastMonthCount,
            byType,
        });
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
            if (newStatus === 'resolved') {
                updates.resolved_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('signalements')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            toast({ title: "Statut mis à jour", description: `Signalement passé à "${newStatus}"` });
            await loadData();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "destructive" });
        }
    };

    const filteredSignalements = signalements.filter(s => {
        const matchesSearch = s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* En-tête du rôle */}
            <Card className={`border-l-4 ${roleConfig.color.replace('bg-', 'border-l-')}`}>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${roleConfig.color} text-white text-2xl`}>
                            {roleConfig.icon}
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{roleConfig.label}</CardTitle>
                            <CardDescription>{roleConfig.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" />
                            Total Signalements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.thisMonth > stats.lastMonth ? '+' : ''}{stats.thisMonth - stats.lastMonth} ce mois
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            En Attente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-500">{stats.pending}</div>
                        <Progress value={(stats.pending / (stats.total || 1)) * 100} className="h-1 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            En Cours
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-500">{stats.inProgress}</div>
                        <Progress value={(stats.inProgress / (stats.total || 1)) * 100} className="h-1 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Résolus
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">{stats.resolved}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stats.successRate}% taux de résolution</p>
                    </CardContent>
                </Card>
            </div>

            {/* Signalements récents */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Signalements Récents</CardTitle>
                            <CardDescription>Les derniers signalements assignés à votre service</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => setActiveView('cases')}>
                            Voir tout <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {signalements.slice(0, 5).map((s) => (
                            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Badge variant={s.status === 'pending' ? 'destructive' : s.status === 'resolved' ? 'default' : 'secondary'}>
                                        {s.status}
                                    </Badge>
                                    <div>
                                        <p className="font-medium">{s.reference_number || s.id.slice(0, 8)}</p>
                                        <p className="text-sm text-muted-foreground">{s.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(s.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(s.id, 'investigation')}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {signalements.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Shield className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>Aucun signalement assigné</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderStatistics = () => (
        <div className="space-y-6">
            {/* Graphique d'évolution mensuelle */}
            <MonthlyEvolutionChart 
                signalements={signalements}
                title={`Évolution - ${roleConfig.label}`}
                description="Tendance des signalements reçus et résolus sur 6 mois"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Indicateurs de Performance
                    </CardTitle>
                    <CardDescription>Métriques clés pour {roleConfig.label}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Taux de résolution */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Taux de Résolution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                                            <circle
                                                cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                                                className="text-green-500"
                                                strokeDasharray={`${stats.successRate * 2.51} 251`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold">{stats.successRate}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Objectif: 80%</p>
                                        <p className={`text-sm ${stats.successRate >= 80 ? 'text-green-500' : 'text-orange-500'}`}>
                                            {stats.successRate >= 80 ? '✓ Atteint' : '↗ En progression'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Temps de réponse */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Temps de Réponse Moyen</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-primary">{stats.avgResponseTime}j</div>
                                <p className="text-sm text-muted-foreground mt-2">Par signalement</p>
                                <Progress value={75} className="h-2 mt-2" />
                            </CardContent>
                        </Card>

                        {/* Activité mensuelle */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Comparaison Mensuelle</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-2 h-20">
                                    <div className="flex-1 bg-muted rounded" style={{ height: `${(stats.lastMonth / Math.max(stats.thisMonth, stats.lastMonth, 1)) * 100}%` }}>
                                        <div className="text-xs text-center mt-1">{stats.lastMonth}</div>
                                    </div>
                                    <div className="flex-1 bg-primary rounded" style={{ height: `${(stats.thisMonth / Math.max(stats.thisMonth, stats.lastMonth, 1)) * 100}%` }}>
                                        <div className="text-xs text-center mt-1 text-primary-foreground">{stats.thisMonth}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>Mois dernier</span>
                                    <span>Ce mois</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Répartition par type */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-sm">Répartition par Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(stats.byType).map(([type, count]) => {
                                    const typeInfo = SIGNALEMENT_TYPES.find(t => t.value === type);
                                    const percentage = Math.round((count / (stats.total || 1)) * 100);
                                    return (
                                        <div key={type} className="flex items-center gap-3">
                                            <span className="w-32 text-sm">{typeInfo?.label || type}</span>
                                            <Progress value={percentage} className="flex-1 h-2" />
                                            <span className="text-sm font-medium w-16 text-right">{count} ({percentage}%)</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );

    const renderTracking = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Suivi des Signalements
                    </CardTitle>
                    <CardDescription>Historique et progression des dossiers</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filtres */}
                    <div className="flex gap-4 mb-6">
                        <Input
                            placeholder="Rechercher par référence..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="investigation">En enquête</SelectItem>
                                <SelectItem value="resolved">Résolu</SelectItem>
                                <SelectItem value="closed">Clôturé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tableau de suivi */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Créé le</TableHead>
                                <TableHead>Dernière MAJ</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSignalements.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-mono">{s.reference_number || s.id.slice(0, 8)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{s.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            s.status === 'resolved' ? 'default' :
                                                s.status === 'pending' ? 'destructive' :
                                                    'secondary'
                                        }>
                                            {s.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(s.created_at).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>{new Date(s.updated_at).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(s.id, 'investigation')}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {s.status !== 'resolved' && (
                                                <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(s.id, 'resolved')}>
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredSignalements.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Aucun signalement trouvé
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );

    const renderCases = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Tous les Signalements</CardTitle>
                    <CardDescription>Liste complète des dossiers assignés à {roleConfig.label}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <Input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="investigation">En enquête</SelectItem>
                                <SelectItem value="resolved">Résolu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        {filteredSignalements.map((s) => (
                            <Card key={s.id} className="hover:border-primary/50 transition-colors">
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-mono font-bold">{s.reference_number || s.id.slice(0, 8)}</span>
                                                <Badge variant="outline">{s.type}</Badge>
                                                <Badge variant={s.status === 'pending' ? 'destructive' : 'secondary'}>{s.status}</Badge>
                                            </div>
                                            <h3 className="font-medium">{s.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {s.location || 'Non spécifié'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(s.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                            <div className="flex gap-1 mt-2">
                                                <Button size="sm" onClick={() => handleStatusUpdate(s.id, 'investigation')}>
                                                    Traiter
                                                </Button>
                                            </div>
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

    const renderMap = () => (
        <div className="space-y-6">
            <SignalementsMapView 
                signalements={signalements}
                onSelectSignalement={(s) => {
                    toast({
                        title: `Signalement ${s.reference_number || s.id.slice(0, 8)}`,
                        description: s.title
                    });
                }}
            />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Realtime notifications */}
            <AgentRealtimeNotifications 
                agentRole={agentRole} 
                onNewSignalement={handleNewSignalement} 
            />
            
            <Header />
            <main className="flex-1 container py-8">
                {/* Navigation */}
                <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)} className="mb-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="dashboard" className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span className="hidden sm:inline">Tableau de bord</span>
                            <span className="sm:hidden">Accueil</span>
                        </TabsTrigger>
                        <TabsTrigger value="statistics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Statistiques</span>
                            <span className="sm:hidden">Stats</span>
                        </TabsTrigger>
                        <TabsTrigger value="map" className="flex items-center gap-2">
                            <Map className="h-4 w-4" />
                            Carte
                        </TabsTrigger>
                        <TabsTrigger value="tracking" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Suivi
                        </TabsTrigger>
                        <TabsTrigger value="cases" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Signalements</span>
                            <span className="sm:hidden">Cas</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {activeView === 'dashboard' && renderDashboard()}
                        {activeView === 'statistics' && renderStatistics()}
                        {activeView === 'map' && renderMap()}
                        {activeView === 'tracking' && renderTracking()}
                        {activeView === 'cases' && renderCases()}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default SpecializedAgentDashboard;
