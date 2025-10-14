import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ReportFormStepper } from '@/components/dashboard/user/ReportFormStepper';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Report = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">🚨 Taper le Ndjobi</h1>
            <p className="text-muted-foreground">
              {user 
                ? 'Signalez un cas de corruption. Vous pouvez choisir de rester anonyme ou de déclarer votre identité.'
                : 'Votre signalement est anonyme par défaut. Aucune connexion requise.'
              }
            </p>
          </div>

          <ReportFormStepper
            onSuccess={() => navigate('/')}
            onCancel={() => navigate('/')}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Report;

