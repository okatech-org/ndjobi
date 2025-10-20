import { useState, useEffect } from 'react';
import { 
  Crown, TrendingUp, AlertCircle, Users, Target, 
  FileText, Shield, MapPin, DollarSign, CheckCircle,
  Activity, ThumbsUp, ThumbsDown, Zap, Flag, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useProtocolEtat } from '@/hooks/useProtocolEtat';
import { IAstedFloatingButton } from '@/components/admin/IAstedFloatingButton';
import { ModuleXR7 } from '@/components/admin/ModuleXR7';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import emblemGabon from '@/assets/emblem_gabon.png';

export default function PresidentDashboard() {
  const { user, role, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    kpis,
    casSensibles,
    distributionRegionale,
    performanceMinisteres,
    evolutionMensuelle,
    visionData,
    isLoading,
    enregistrerDecision,
    genererRapport
  } = useProtocolEtat();

  const [activeTab, setActiveTab] = useState('vue-ensemble');

  // Données d'opinion publique (simulées pour démo)
  const opinionPublique = {
    satisfactionGlobale: 62,
    tendance: 'stable',
    sentimentDominant: 'Préoccupé mais optimiste',
    principauxGriefs: [
      { categorie: 'Corruption', intensite: 85, evolution: '+5%' },
      { categorie: 'Pouvoir d\'achat', intensite: 78, evolution: '-2%' },
      { categorie: 'Sécurité', intensite: 65, evolution: 'stable' },
      { categorie: 'Santé publique', intensite: 72, evolution: '+8%' },
      { categorie: 'Emploi jeunes', intensite: 81, evolution: '+3%' }
    ],
    zonesRisque: [
      { region: 'Estuaire', niveau: 'Haute', description: '128 cas signalés' },
      { region: 'Haut-Ogooué', niveau: 'Moyenne', description: '87 cas signalés' }
    ]
  };

  const recommandationsStrategiques = [
    {
      priorite: 'Critique',
      titre: 'Renforcer lutte Gab Pêche',
      description: '18 cas critiques détectés. Action immédiate requise.',
      impact: 'Très élevé',
      delai: '15 jours'
    },
    {
      priorite: 'Haute',
      titre: 'Audit CNSS',
      description: 'Enrichissement illicite détecté (6,7 Mrd FCFA)',
      impact: 'Élevé',
      delai: '30 jours'
    },
    {
      priorite: 'Haute',
      titre: 'Protection lanceurs d\'alerte',
      description: 'Menaces signalées dans secteur santé',
      impact: 'Moyen',
      delai: '7 jours'
    }
  ];

  const COLORS = ['#2D5F1E', '#4A8B3A', '#6BB757', '#8FD977', '#3B82F6'];

  const formatMontant = (montant: number) => {
    if (montant >= 1000000000) {
      return `${(montant / 1000000000).toFixed(2)} Mrd FCFA`;
    }
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(0)} M FCFA`;
    }
    return `${montant.toLocaleString()} FCFA`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critique': return 'destructive';
      case 'haute': return 'default';
      case 'moyenne': return 'secondary';
      default: return 'outline';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-medium">Chargement du Dashboard Présidentiel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* En-tête présidentiel */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 via-green-600 to-blue-700 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36"></div>
          
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
              <img src={emblemGabon} alt="Armoiries du Gabon" className="w-20 h-20 object-contain" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Dashboard Présidentiel</h1>
              </div>
              <p className="text-green-100 text-lg">
                Vue stratégique de la gouvernance • République Gabonaise
              </p>
              <p className="text-green-200/80 text-sm mt-1">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="text-right">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2">
                <Activity className="h-3 w-3 mr-1" />
                TEMPS RÉEL
              </Badge>
              <p className="text-sm text-green-100">Mise à jour continue</p>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-xl">
            <TabsTrigger value="vue-ensemble" className="data-[state=active]:bg-white">
              <Eye className="h-4 w-4 mr-2" />
              Vue d'Ensemble
            </TabsTrigger>
            <TabsTrigger value="opinion" className="data-[state=active]:bg-white">
              <Users className="h-4 w-4 mr-2" />
              Opinion Publique
            </TabsTrigger>
            <TabsTrigger value="situations" className="data-[state=active]:bg-white">
              <AlertCircle className="h-4 w-4 mr-2" />
              Situations Critiques
            </TabsTrigger>
            <TabsTrigger value="vision" className="data-[state=active]:bg-white">
              <Target className="h-4 w-4 mr-2" />
              Vision Nationale
            </TabsTrigger>
          </TabsList>

          {/* Onglet 1: Vue d'Ensemble */}
          <TabsContent value="vue-ensemble" className="space-y-6">
            {/* KPIs Nationaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardDescription>Signalements Totaux</CardDescription>
                  <CardTitle className="text-3xl font-bold">
                    {kpis?.total_signalements || 320}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{kpis?.tendance || '+12%'}</span>
                    <span className="text-muted-foreground ml-1">vs mois dernier</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <CardDescription>Cas Critiques</CardDescription>
                  <CardTitle className="text-3xl font-bold text-red-600">
                    {kpis?.signalements_critiques || 28}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Nécessitent validation</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardDescription>Taux de Résolution</CardDescription>
                  <CardTitle className="text-3xl font-bold text-green-600">
                    {kpis?.taux_resolution || 67}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={kpis?.taux_resolution || 67} className="h-2" />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <CardDescription>Fonds Récupérés</CardDescription>
                  <CardTitle className="text-2xl font-bold text-yellow-700">
                    {formatMontant(kpis?.impact_economique || 7200000000)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>Impact économique</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Score de Transparence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Indice National de Transparence
                </CardTitle>
                <CardDescription>
                  Mesure de la confiance citoyenne et de l'efficacité anti-corruption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold text-blue-600">
                      {kpis?.score_transparence || 78}/100
                    </span>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      Bon Niveau
                    </Badge>
                  </div>
                  <Progress value={kpis?.score_transparence || 78} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    Objectif 2025: 85/100 • Progression constante depuis 6 mois
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Régionale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Situation par Région
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {distributionRegionale?.slice(0, 5).map((region, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 font-medium">{region.region}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">
                            {region.cas} cas • {region.resolus} résolus
                          </span>
                          <span className="text-sm font-medium">{region.taux}%</span>
                        </div>
                        <Progress value={region.taux} className="h-2" />
                      </div>
                      <Badge 
                        variant={region.priorite === 'Haute' ? 'destructive' : 'secondary'}
                        className="w-20 justify-center"
                      >
                        {region.priorite}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Évolution Mensuelle */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution sur 6 Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionMensuelle?.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="signalements" 
                      stroke="#2D5F1E" 
                      strokeWidth={2}
                      name="Signalements"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolutions" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Résolus"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet 2: Opinion Publique */}
          <TabsContent value="opinion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Satisfaction Globale */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    Satisfaction Globale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-bold text-green-600">
                      {opinionPublique.satisfactionGlobale}%
                    </div>
                    <Progress value={opinionPublique.satisfactionGlobale} className="h-3" />
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Badge variant="secondary">
                        Tendance: {opinionPublique.tendance}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {opinionPublique.sentimentDominant}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Dominant */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition du Sentiment National</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Satisfaits', value: 62 },
                          { name: 'Neutres', value: 23 },
                          { name: 'Insatisfaits', value: 15 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Principaux Griefs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Préoccupations Citoyennes Principales
                </CardTitle>
                <CardDescription>
                  Sujets les plus mentionnés dans les signalements et enquêtes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opinionPublique.principauxGriefs.map((grief, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{grief.categorie}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{grief.evolution}</span>
                          <Badge variant="outline">{grief.intensite}%</Badge>
                        </div>
                      </div>
                      <Progress value={grief.intensite} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Zones à Risque */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-orange-600" />
                  Zones Nécessitant une Attention Particulière
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {opinionPublique.zonesRisque.map((zone, index) => (
                    <Alert key={index} variant={zone.niveau === 'Haute' ? 'destructive' : 'default'}>
                      <MapPin className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>{zone.region}</span>
                        <Badge variant={zone.niveau === 'Haute' ? 'destructive' : 'secondary'}>
                          Priorité: {zone.niveau}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>{zone.description}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet 3: Situations Critiques */}
          <TabsContent value="situations" className="space-y-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">
                {casSensibles?.length || 4} situations nécessitent votre validation
              </AlertTitle>
              <AlertDescription className="text-red-700">
                Ces cas critiques dépassent 2 milliards FCFA ou impliquent des hauts fonctionnaires
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {casSensibles?.slice(0, 4).map((cas, index) => (
                <Card key={index} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="uppercase">
                            {cas.reference_id}
                          </Badge>
                          <Badge variant="outline">
                            Score IA: {cas.ai_priority_score}%
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{cas.titre}</CardTitle>
                        <CardDescription>{cas.location}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {cas.montant}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {cas.categorie}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        🤖 Analyse Intelligence Artificielle:
                      </p>
                      <p className="text-sm text-blue-800">{cas.ai_analysis_summary}</p>
                    </div>

                    {cas.metadata?.action_recommandee && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-orange-900 mb-1">
                          Action Recommandée:
                        </p>
                        <p className="text-sm text-orange-800">
                          {cas.metadata.action_recommandee}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          enregistrerDecision(cas.id, 'approuver');
                          toast.success('Cas approuvé', {
                            description: 'Enquête lancée automatiquement'
                          });
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver Enquête
                      </Button>
                      <Button 
                        onClick={() => {
                          enregistrerDecision(cas.id, 'enquete', 'Investigation approfondie requise');
                          toast.info('Investigation ordonnée');
                        }}
                        variant="outline" 
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ordonner Investigation
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          genererRapport('executif');
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Rapport
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommandations Stratégiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Recommandations Stratégiques
                </CardTitle>
                <CardDescription>
                  Actions prioritaires identifiées par l'analyse des données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommandationsStrategiques.map((rec, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Badge variant={getPriorityColor(rec.priorite)}>
                        {rec.priorite}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{rec.titre}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rec.description}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Impact: <strong>{rec.impact}</strong></span>
                          <span>Délai: <strong>{rec.delai}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet 4: Vision Nationale */}
          <TabsContent value="vision" className="space-y-6">
            <Card className="border-t-4 border-t-blue-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Target className="h-6 w-6 text-blue-600" />
                      Vision Gabon Émergent 2025
                    </CardTitle>
                    <CardDescription>
                      Progression des piliers stratégiques nationaux
                    </CardDescription>
                  </div>
                  <Button onClick={() => genererRapport('annuel')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Rapport Annuel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {visionData?.map((pilier, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{pilier.pilier}</h4>
                          <p className="text-sm text-muted-foreground">
                            Objectif: {pilier.objectif}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {pilier.score}/100
                          </div>
                          <Badge variant="secondary">{pilier.statut}</Badge>
                        </div>
                      </div>
                      <Progress value={pilier.score} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance des Ministères */}
            <Card>
              <CardHeader>
                <CardTitle>Performance des Institutions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceMinisteres}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ministere" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="taux" fill="#2D5F1E" name="Taux de Résolution %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Synthèse Stratégique */}
            <Card className="bg-gradient-to-br from-blue-50 to-green-50">
              <CardHeader>
                <CardTitle>Synthèse Stratégique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm">
                    <strong>Réduction 34%</strong> des cas de corruption vs 2023
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm">
                    <strong>7,2 milliards FCFA</strong> récupérés depuis janvier
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <p className="text-sm">
                    <strong>+18 points</strong> au score de transparence nationale
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                  <p className="text-sm">
                    <strong>62% satisfaction</strong> des citoyens sur la lutte anti-corruption
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Accès Protocole XR-7 */}
        <Card className="border-2 border-red-500 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Protocole d'État XR-7
            </CardTitle>
            <CardDescription className="text-red-700">
              Situations d'urgence nationale nécessitant une intervention présidentielle directe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModuleXR7 />
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Assistant IA iAsted */}
      <IAstedFloatingButton />
    </div>
  );
}

