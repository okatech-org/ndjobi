import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, AlertCircle, FolderLock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || role !== 'user')) {
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
            <h1 className="text-3xl font-bold">Espace Citoyen</h1>
            <p className="text-muted-foreground">
              Bienvenue dans votre espace personnel sécurisé
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle className="text-xl">Signaler un cas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Signaler un cas de corruption de manière anonyme et sécurisée
                </CardDescription>
                <Button className="w-full" variant="destructive">
                  Nouveau signalement
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <FolderLock className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Protéger un projet</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Enregistrer votre idée avec horodatage infalsifiable
                </CardDescription>
                <Button className="w-full" variant="secondary">
                  Nouveau projet
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Mes dossiers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Consulter vos signalements et projets protégés
                </CardDescription>
                <Button className="w-full" variant="outline">
                  Voir mes dossiers
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Vos données sont protégées</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tous vos signalements sont chiffrés avec AES-256 et votre identité reste 100% confidentielle. 
                Nos serveurs sont hébergés au Gabon et respectent la souveraineté des données.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
