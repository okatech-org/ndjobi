import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Crown, BarChart3, CheckCircle, Users, Package, 
  FileText, TrendingUp, Shield, AlertTriangle, Eye, Filter,
  Download, MapPin, Calendar, Activity, Zap, Brain, Scale,
  Building2, Flag, Target, DollarSign, Clock, ChevronRight,
  AlertCircle, XCircle, RefreshCw, Search, UserPlus, Menu
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
          <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">Gestion des Sous-Administrateurs</h3>
          <p className="text-muted-foreground mt-1">
            Supervision des directeurs sectoriels et performance
          </p>
            </div>
        <Button className="bg-[hsl(var(--accent-intel))] hover:bg-[hsl(var(--accent-intel))]/90 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Nommer Sous-Admin
              </Button>
            </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sousAdmins.map((admin, idx) => (
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
              <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                  <div className="text-muted-foreground mb-1">Cas traités</div>
                  <div className="text-2xl font-bold tabular-nums">{admin.casTraites}</div>
              </div>
                <div>
                  <div className="text-muted-foreground mb-1">Taux succès</div>
                  <div className="text-2xl font-bold tabular-nums text-[hsl(var(--accent-success))]">{admin.taux}%</div>
            </div>
              <div>
                  <div className="text-muted-foreground mb-1">Délai moyen</div>
                  <div className="text-2xl font-bold tabular-nums text-[hsl(var(--accent-intel))]">{admin.delai}</div>
              </div>
              </div>

              <Progress value={admin.taux} className="h-2" />

              {admin.statut === 'Attention' && (
                <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-warning))]/10 to-transparent">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--accent-warning))]" />
                  <AlertDescription className="text-muted-foreground">
                    Performance en baisse. Délai de traitement supérieur à la norme nationale.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 glass-effect border-none">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir Détails
                </Button>
                <Button variant="outline" size="sm" className="flex-1 glass-effect border-none">
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport
              </Button>
            </div>
            </CardContent>
          </Card>
        ))}
              </div>

      <Alert className="glass-effect border-none bg-gradient-to-br from-[hsl(var(--accent-intel))]/10 to-transparent">
        <Users className="h-4 w-4 text-[hsl(var(--accent-intel))]" />
        <AlertTitle className="text-foreground">
          Coordination Nationale
        </AlertTitle>
        <AlertDescription className="text-muted-foreground">
          {sousAdmins.length} Sous-Administrateurs actifs coordonnent les agents 
          opérationnels sur l'ensemble du territoire national. 
          Performance globale: {Math.round(sousAdmins.reduce((acc, a) => acc + a.taux, 0) / sousAdmins.length)}%
        </AlertDescription>
      </Alert>
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
              {activeView === 'sousadmins' && renderGestionSousAdmins()}
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
