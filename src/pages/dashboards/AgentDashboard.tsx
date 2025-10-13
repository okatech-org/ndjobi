import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileSearch, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || role !== 'agent')) {
      navigate('/auth');
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Espace Agent DGSS</h1>
            <p className="text-muted-foreground">
              Direction Générale des Services Spéciaux - Tableau de bord opérationnel
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Signalements en attente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <Badge variant="destructive" className="mt-2">Priorité haute</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>En cours de traitement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8</div>
                <Badge variant="secondary" className="mt-2">En analyse</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Clôturés ce mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
                <Badge variant="outline" className="mt-2">+15%</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Taux de résolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87%</div>
                <Badge className="mt-2">Excellent</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <FileSearch className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle className="text-xl">Signalements prioritaires</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Consulter et traiter les signalements nécessitant une attention immédiate
                </CardDescription>
                <Button className="w-full" variant="destructive">
                  Voir les signalements
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Gestion des citoyens</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Accéder aux profils et historiques des citoyens
                </CardDescription>
                <Button className="w-full" variant="outline">
                  Gérer les profils
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Statistiques</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Analyser les tendances et générer des rapports
                </CardDescription>
                <Button className="w-full" variant="secondary">
                  Voir les stats
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Sécurité</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Journaux d'audit et paramètres de sécurité
                </CardDescription>
                <Button className="w-full" variant="outline">
                  Accéder
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgentDashboard;
