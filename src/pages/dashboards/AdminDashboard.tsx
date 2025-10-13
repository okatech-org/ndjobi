import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, FileText, Shield, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-accent" />
              <h1 className="text-3xl font-bold">Protocole d'État</h1>
            </div>
            <p className="text-muted-foreground">
              Tableau de bord présidentiel - Vue d'ensemble stratégique
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-accent/30">
              <CardHeader className="pb-3">
                <CardDescription>Signalements totaux</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">157</div>
                <Badge variant="outline" className="mt-2">Ce mois</Badge>
              </CardContent>
            </Card>

            <Card className="border-accent/30">
              <CardHeader className="pb-3">
                <CardDescription>Cas critiques</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">5</div>
                <Badge variant="destructive" className="mt-2">Action requise</Badge>
              </CardContent>
            </Card>

            <Card className="border-accent/30">
              <CardHeader className="pb-3">
                <CardDescription>Taux de résolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92%</div>
                <Badge className="mt-2">+5% vs mois dernier</Badge>
              </CardContent>
            </Card>

            <Card className="border-accent/30">
              <CardHeader className="pb-3">
                <CardDescription>Agents actifs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">23</div>
                <Badge variant="secondary" className="mt-2">DGSS</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Rapports présidentiels</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Synthèses exécutives et rapports d'analyse stratégique
                </CardDescription>
                <Button className="w-full">
                  Consulter les rapports
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Shield className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle className="text-xl">Cas sensibles</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Dossiers nécessitant une attention présidentielle
                </CardDescription>
                <Button className="w-full" variant="destructive">
                  Voir les cas
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Tableaux de bord</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Analyses statistiques et indicateurs de performance
                </CardDescription>
                <Button className="w-full" variant="outline">
                  Accéder aux stats
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Settings className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Administration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Gestion des agents et configuration de la plateforme
                </CardDescription>
                <Button className="w-full" variant="secondary">
                  Paramètres
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-accent" />
                <CardTitle>Accès Présidentiel</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cet espace est réservé au Protocole d'État. Toutes les actions sont enregistrées et auditées 
                conformément aux protocoles de sécurité nationale.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
