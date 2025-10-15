import { Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TrustSection = () => {
  return (
    <section className="container py-8 sm:py-12 md:py-16 bg-muted/30 rounded-2xl my-8">
      <div className="text-center mb-8 sm:mb-10 space-y-2 sm:space-y-3 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Pourquoi faire confiance à NDJOBI ?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 flex-shrink-0 transition-transform duration-300 hover:scale-110">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Anonymat garanti</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-sm sm:text-base space-y-2 text-muted-foreground">
              <p className="font-medium text-foreground">Protection par cryptage AES-256</p>
              <p className="leading-relaxed">Votre identité reste 100% confidentielle. Nos serveurs sont hébergés au Gabon et respectent la souveraineté des données.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 rounded-lg bg-secondary/10 flex-shrink-0 transition-transform duration-300 hover:scale-110">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Traitement rapide</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="text-sm sm:text-base space-y-2 text-muted-foreground">
              <p className="font-medium text-foreground">Réponse sous 48 heures</p>
              <p className="leading-relaxed">Votre dénonciation est analysée par notre équipe et les autorités compétentes. Vous recevez des notifications à chaque étape.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TrustSection;
