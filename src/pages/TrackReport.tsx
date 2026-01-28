import { SEOHead } from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReportTracker from "@/components/ReportTracker";
import { Shield, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TrackReport = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Suivi de signalement - Ndjobi"
        description="Suivez l'état de votre signalement anonyme en toute confidentialité avec votre numéro de référence."
        keywords={['suivi signalement', 'corruption gabon', 'anonymat', 'tracking', 'référence']}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>

              {/* Icon */}
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/25">
                <Shield className="h-10 w-10 text-primary-foreground" />
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Suivi de signalement
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Consultez l'avancement de votre signalement en entrant le numéro de référence 
                qui vous a été communiqué lors de votre dépôt.
              </p>
            </div>
          </div>
        </section>

        {/* Tracker Component */}
        <ReportTracker />

        {/* Info Section */}
        <section className="container py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Info Card 1 */}
              <div className="p-6 rounded-xl bg-muted/50 border">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Anonymat préservé</h3>
                    <p className="text-sm text-muted-foreground">
                      Aucune information personnelle n'est requise pour consulter votre signalement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Card 2 */}
              <div className="p-6 rounded-xl bg-muted/50 border">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Conservez votre référence</h3>
                    <p className="text-sm text-muted-foreground">
                      Sans ce numéro, il est impossible de retrouver votre signalement anonyme.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <p className="text-muted-foreground mb-4">
                Vous souhaitez faire un nouveau signalement ?
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/#signalement-anonyme')}
                className="bg-gradient-to-r from-destructive to-destructive/80"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Faire un signalement
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TrackReport;
