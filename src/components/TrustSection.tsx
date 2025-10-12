import { Shield, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TrustSection = () => {
  return (
    <section className="container py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Anonymat garanti</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base space-y-2">
              <p className="font-medium text-foreground">Protection par cryptage AES-256</p>
              <p>Votre identité reste 100% confidentielle. Nos serveurs sont hébergés au Gabon et respectent la souveraineté des données.</p>
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">Traitement rapide</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base space-y-2">
              <p className="font-medium text-foreground">Réponse sous 48 heures</p>
              <p>Votre signalement est analysé par notre équipe et les autorités compétentes. Vous recevez des notifications à chaque étape.</p>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TrustSection;
