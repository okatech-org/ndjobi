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
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-2 border-primary transition-all hover:shadow-lg">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Signalements Nationaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{kpis?.total_signalements?.toLocaleString() || 0}</div>
                <Badge variant="default" className="mt-1 md:mt-2 text-xs">{kpis?.tendance || '+0%'}</Badge>
            </div>
              <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 text-orange-500 opacity-70" />
            </div>
            <div className="mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground">
              {kpis?.signalements_critiques || 0} cas critiques
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500 transition-all hover:shadow-lg">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Impact Économique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold">
                  {((kpis?.impact_economique || 0) / 1000000000).toFixed(1)}Mrd
                </div>
                <div className="text-xs md:text-sm text-green-600 mt-1 md:mt-2">FCFA récupérés</div>
              </div>
              <DollarSign className="h-8 w-8 md:h-10 md:w-10 text-green-500 opacity-70" />
                </div>
            <div className="mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground">
              Fonds restitués
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500 transition-all hover:shadow-lg">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Taux de Résolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="text-2xl md:text-3xl font-bold mb-2">{kpis?.taux_resolution || 0}%</div>
                <Progress value={kpis?.taux_resolution || 0} className="h-2" />
              </div>
              <Target className="h-8 w-8 md:h-10 md:w-10 text-blue-500 opacity-70 ml-3" />
            </div>
            <div className="mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground">
              Objectif: 85%
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500 transition-all hover:shadow-lg">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Score Transparence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{kpis?.score_transparence || 0}/100</div>
                <Badge variant="outline" className="mt-1 md:mt-2 text-xs">Deuxième République</Badge>
              </div>
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-purple-500 opacity-70" />
            </div>
            <div className="mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground">
              Indice national
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution de la Lutte Anticorruption
            </CardTitle>
            <CardDescription>
              Tendances nationales - Signalements vs Résolutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolutionMensuelle}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="signalements" 
                  stroke="#2D5F1E" 
                  name="Signalements"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="resolutions" 
                  stroke="#4A8B3A" 
                  name="Cas résolus"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Vision Gabon 2025 - Piliers Stratégiques
            </CardTitle>
            <CardDescription>
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

      <Alert className="border-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900 dark:text-orange-100">
          Attention Requise
        </AlertTitle>
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          {kpis?.signalements_critiques || 0} cas critiques nécessitent une validation 
          présidentielle immédiate. Consulter l'onglet "Validation" pour prendre les décisions.
          {isSubscribed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm">Notifications temps réel actives</span>
            </div>
          )}
        </AlertDescription>
      </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <MapPin className="h-4 w-4 md:h-5 md:w-5" />
              Distribution Régionale
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold">Cas Sensibles - Validation Présidentielle</h3>
          <p className="text-muted-foreground mt-1">
            Dossiers critiques nécessitant votre décision stratégique
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes régions" />
                </SelectTrigger>
                <SelectContent>
              <SelectItem value="all">Toutes régions</SelectItem>
              <SelectItem value="estuaire">Estuaire</SelectItem>
              <SelectItem value="haut-ogooue">Haut-Ogooué</SelectItem>
              <SelectItem value="ogooue-maritime">Ogooué-Maritime</SelectItem>
                </SelectContent>
              </Select>
        </div>
            </div>

      {casSensibles.map((cas, idx) => (
        <Card key={idx} className="border-2 border-orange-200 bg-orange-50/10 dark:bg-orange-950/10">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="space-y-1 flex-1 min-w-[200px]">
                <CardTitle className="text-lg">{cas.title || cas.titre}</CardTitle>
                <CardDescription>Référence: {cas.id} • {new Date(cas.created_at).toLocaleDateString('fr-FR')}</CardDescription>
              </div>
                            <Badge variant={
                cas.priority === 'critique' || cas.urgence === 'Critique' ? 'destructive' :
                cas.priority === 'haute' || cas.urgence === 'Haute' ? 'default' :
                'secondary'
              } className="text-sm">
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

            <Alert className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
              <Brain className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <strong>Analyse IA:</strong> Score de priorité {cas.ai_priority_score || 0}%. 
                {cas.ai_analysis_summary || 'Analyse en cours...'}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 flex-wrap">
                            <Button 
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleValiderCas(cas.id, 'approuver')}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver l'Action
                            </Button>
                          <Button 
                            variant="outline" 
                onClick={() => handleValiderCas(cas.id, 'enquete')}
                disabled={isLoading}
                          >
                <Eye className="h-4 w-4 mr-2" />
                Enquête Approfondie
                          </Button>
                              <Button 
                variant="destructive"
                onClick={() => handleValiderCas(cas.id, 'rejeter')}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter le Dossier
                              </Button>
                              <Button 
                variant="ghost"
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
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
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
      <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold">Suivi des Enquêtes Nationales</h3>
          <p className="text-muted-foreground mt-1">
            État d'avancement des investigations en cours
          </p>
        </div>
        <Button variant="outline" onClick={reloadData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
                          </Button>
                        </div>

      <Card>
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

      <Card>
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="budget" 
                fill="#2D5F1E" 
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
          <h3 className="text-2xl font-bold">Gestion des Sous-Administrateurs</h3>
          <p className="text-muted-foreground mt-1">
            Supervision des directeurs sectoriels et performance
          </p>
            </div>
        <Button variant="default">
          <UserPlus className="h-4 w-4 mr-2" />
          Nommer Sous-Admin
              </Button>
            </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sousAdmins.map((admin, idx) => (
          <Card key={idx} className={
            admin.statut === 'Attention' ? 'border-orange-200 bg-orange-50/10 dark:bg-orange-950/10' : ''
          }>
            <CardHeader>
              <div className="flex items-center justify-between">
            <div>
                  <CardTitle className="text-lg">{admin.nom}</CardTitle>
                  <CardDescription>{admin.secteur}</CardDescription>
                </div>
                <Badge variant={
                  admin.statut === 'Actif' ? 'default' : 'destructive'
                }>
                  {admin.statut}
                            </Badge>
            </div>
        </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                  <div className="text-muted-foreground mb-1">Cas traités</div>
                  <div className="text-2xl font-bold">{admin.casTraites}</div>
              </div>
                <div>
                  <div className="text-muted-foreground mb-1">Taux succès</div>
                  <div className="text-2xl font-bold text-green-600">{admin.taux}%</div>
            </div>
              <div>
                  <div className="text-muted-foreground mb-1">Délai moyen</div>
                  <div className="text-2xl font-bold text-blue-600">{admin.delai}</div>
              </div>
              </div>

              <Progress value={admin.taux} className="h-2" />

              {admin.statut === 'Attention' && (
                <Alert className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-900 dark:text-orange-100">
                    Performance en baisse. Délai de traitement supérieur à la norme nationale.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir Détails
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport
              </Button>
            </div>
            </CardContent>
          </Card>
        ))}
              </div>

      <Alert className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
        <Users className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">
          Coordination Nationale
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          {sousAdmins.length} Sous-Administrateurs actifs coordonnent les agents 
          opérationnels sur l'ensemble du territoire national. 
          Performance globale: {Math.round(sousAdmins.reduce((acc, a) => acc + a.taux, 0) / sousAdmins.length)}%
        </AlertDescription>
      </Alert>
            </div>
  );

  const renderRapportsStrategiques = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
          <h3 className="text-2xl font-bold">Rapports Stratégiques</h3>
          <p className="text-muted-foreground mt-1">
            Analytics avancés et indicateurs Vision Gabon 2025
          </p>
              </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="3months">3 derniers mois</SelectItem>
              <SelectItem value="1year">Dernière année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
              </Button>
            </div>
              </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { type: 'executif', titre: 'Rapport Exécutif', icon: Crown, desc: 'Synthèse présidentielle', color: 'border-purple-200 hover:border-purple-400' },
          { type: 'hebdomadaire', titre: 'Rapport Hebdo', icon: Calendar, desc: 'Évolution 7 jours', color: 'border-blue-200 hover:border-blue-400' },
          { type: 'mensuel', titre: 'Rapport Mensuel', icon: BarChart3, desc: 'Performance mensuelle', color: 'border-green-200 hover:border-green-400' },
          { type: 'annuel', titre: 'Rapport Annuel', icon: TrendingUp, desc: 'Vision 2025', color: 'border-orange-200 hover:border-orange-400' }
        ].map((rapport, idx) => (
          <Card key={idx} className={`${rapport.color} cursor-pointer transition-all`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <rapport.icon className="h-5 w-5" />
                {rapport.titre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{rapport.desc}</p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => handleGenererRapport(rapport.type as any)}
              >
                <Download className="h-4 w-4 mr-2" />
                Générer PDF
              </Button>
            </CardContent>
          </Card>
        ))}
          </div>

      <Alert className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
        <Target className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900 dark:text-green-100">
          Vision Gabon Émergent 2025
        </AlertTitle>
        <AlertDescription className="text-green-800 dark:text-green-200">
          La lutte anticorruption contribue directement aux objectifs de la Deuxième République. 
          Impact mesuré: réduction de 34% des cas de corruption vs 2023, récupération de {((kpis?.impact_economique || 0) / 1000000000).toFixed(1)} milliards FCFA, 
          amélioration de 18 points du score de transparence nationale.
            </AlertDescription>
          </Alert>
    </div>
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col w-full bg-background">
          {/* En-tête moderne et épuré */}
          <header className="h-16 border-b bg-background backdrop-blur-sm sticky top-0 z-40">
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
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <div className="hidden md:block">
                      <h1 className="text-base font-bold">
                        PROTOCOLE D'ÉTAT
                      </h1>
                      <p className="text-[10px] text-muted-foreground">
                        Bonne gouvernance
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[10px] px-2 py-0.5">
                    <Shield className="h-2.5 w-2.5 mr-1" />
                    Admin
                  </Badge>
                </div>
              </div>
              
              {/* Droite: Actions et infos */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs">Nous Contacter</span>
                </Button>
                
                <div className="h-8 w-px bg-border hidden md:block" />
                
                <div className="hidden lg:flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-[10px] px-2">
                    Gabon - Vision 2025
                  </Badge>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu principal avec scroll */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container py-6 md:py-8 space-y-6 bg-background">
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
