import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Shield, MapPin, Calendar, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  totalReports: number;
  totalProjects: number;
  resolvedCases: number;
  pendingCases: number;
  reportsByType: { name: string; value: number }[];
  reportsByMonth: { month: string; reports: number; projects: number }[];
  reportsByRegion: { region: string; count: number }[];
}

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalReports: 0,
    totalProjects: 0,
    resolvedCases: 0,
    pendingCases: 0,
    reportsByType: [],
    reportsByMonth: [],
    reportsByRegion: [],
  });
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '3months' | '1year' | 'all'>('30days');

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    setLoading(true);
    
    try {
      const mockStats: StatsData = {
        totalReports: 1247,
        totalProjects: 389,
        resolvedCases: 823,
        pendingCases: 424,
        reportsByType: [
          { name: 'Détournement', value: 387 },
          { name: 'Pot-de-vin', value: 298 },
          { name: 'Abus de pouvoir', value: 245 },
          { name: 'Extorsion', value: 189 },
          { name: 'Népotisme', value: 128 },
        ],
        reportsByMonth: [
          { month: 'Jan', reports: 87, projects: 25 },
          { month: 'Fév', reports: 92, projects: 31 },
          { month: 'Mar', reports: 105, projects: 28 },
          { month: 'Avr', reports: 118, projects: 35 },
          { month: 'Mai', reports: 134, projects: 42 },
          { month: 'Juin', reports: 145, projects: 38 },
          { month: 'Juil', reports: 156, projects: 45 },
          { month: 'Aoû', reports: 142, projects: 41 },
          { month: 'Sep', reports: 128, projects: 36 },
          { month: 'Oct', reports: 115, projects: 33 },
          { month: 'Nov', reports: 98, projects: 27 },
          { month: 'Déc', reports: 27, projects: 8 },
        ],
        reportsByRegion: [
          { region: 'Estuaire', count: 456 },
          { region: 'Haut-Ogooué', count: 234 },
          { region: 'Ogooué-Maritime', count: 189 },
          { region: 'Moyen-Ogooué', count: 156 },
          { region: 'Ngounié', count: 98 },
          { region: 'Nyanga', count: 67 },
          { region: 'Ogooué-Ivindo', count: 47 },
        ],
      };

      await new Promise(resolve => setTimeout(resolve, 800));
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ndjobi-stats-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#2D5F1E', '#1E40AF', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Statistiques - Impact de la lutte contre la corruption au Gabon"
        description={`${stats.totalReports.toLocaleString()} signalements traités, ${stats.resolvedCases.toLocaleString()} cas résolus. Découvrez l'impact de Ndjobi dans la lutte contre la corruption.`}
        keywords={['statistiques corruption', 'impact ndjobi', 'cas résolus', 'transparence gabon']}
      />
      <Header />
      
      <main className="flex-1 container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Statistiques Ndjobi</h1>
            <p className="text-muted-foreground mt-1">
              Transparence et impact de la lutte contre la corruption
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as '7days' | '30days' | '3months' | '1year' | 'all')}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 derniers jours</SelectItem>
                <SelectItem value="30days">30 derniers jours</SelectItem>
                <SelectItem value="3months">3 derniers mois</SelectItem>
                <SelectItem value="1year">Cette année</SelectItem>
                <SelectItem value="all">Depuis le début</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Total Signalements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalReports.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +12% ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Projets Protégés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProjects.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +8% ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Cas Résolus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.resolvedCases.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">
                66% taux de résolution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                En Attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingCases.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Traitement en cours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Reports by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Signalements par type</CardTitle>
              <CardDescription>Répartition des types de corruption</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.reportsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2D5F1E" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Reports by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution des signalements</CardTitle>
              <CardDescription>Vue d'ensemble par catégorie</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.reportsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.reportsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line Chart - Trend over time */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Évolution mensuelle</CardTitle>
              <CardDescription>Signalements et projets protégés au fil du temps</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.reportsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reports" stroke="#2D5F1E" strokeWidth={2} name="Signalements" />
                  <Line type="monotone" dataKey="projects" stroke="#1E40AF" strokeWidth={2} name="Projets" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart - Regional distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Signalements par région
              </CardTitle>
              <CardDescription>Distribution géographique des cas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.reportsByRegion} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="region" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1E40AF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-primary text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Contribuez à la transparence</h2>
            <p className="mb-6 opacity-90">
              Tapez le Ndjobi ou protégez votre projet innovant dès aujourd'hui
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" onClick={() => window.location.href = '/auth'}>
                <AlertCircle className="h-4 w-4 mr-2" />
                Taper le Ndjobi
              </Button>
              <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-gray-100" onClick={() => window.location.href = '/auth'}>
                <Shield className="h-4 w-4 mr-2" />
                Protéger un projet
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

