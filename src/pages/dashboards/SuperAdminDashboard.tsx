import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Database, Users, Shield, Activity, Terminal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SuperAdminDashboard = () => {
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
              <Zap className="h-8 w-8 text-destructive" />
              <h1 className="text-3xl font-bold">Super Admin</h1>
            </div>
            <p className="text-muted-foreground">
              Console technique système - Accès complet
            </p>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardDescription>Utilisateurs totaux</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,247</div>
                <Badge variant="outline" className="mt-2">+12 aujourd'hui</Badge>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardDescription>Signalements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3,891</div>
                <Badge variant="secondary" className="mt-2">Total</Badge>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardDescription>Uptime système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">99.9%</div>
                <Badge className="mt-2">30 jours</Badge>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardDescription>Base de données</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.4GB</div>
                <Badge variant="outline" className="mt-2">Optimal</Badge>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardDescription>Sessions actives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">47</div>
                <Badge variant="destructive" className="mt-2">En ligne</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Database className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle className="text-xl">Base de données</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Gestion complète des tables, migrations et sauvegardes
                </CardDescription>
                <Button className="w-full" variant="destructive">
                  Console DB
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Gestion utilisateurs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Administration des comptes, rôles et permissions
                </CardDescription>
                <Button className="w-full" variant="outline">
                  Gérer les users
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Shield className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Sécurité</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Logs d'audit, authentification et pare-feu
                </CardDescription>
                <Button className="w-full" variant="secondary">
                  Sécurité
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Monitoring</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Surveillance temps réel et alertes système
                </CardDescription>
                <Button className="w-full" variant="outline">
                  Voir les métriques
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Terminal className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Console système</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Accès terminal et commandes système avancées
                </CardDescription>
                <Button className="w-full" variant="outline">
                  Ouvrir terminal
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Database className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Sauvegardes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Gestion des backups et restauration système
                </CardDescription>
                <Button className="w-full" variant="secondary">
                  Sauvegardes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Warning Notice */}
          <Card className="border-destructive/30 bg-gradient-to-br from-destructive/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-destructive" />
                <CardTitle>Accès Super Admin</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vous disposez d'un accès complet au système. Toutes les actions administratives sont 
                enregistrées et peuvent avoir des conséquences critiques. Utilisez ces outils avec prudence.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
