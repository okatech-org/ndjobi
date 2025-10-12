import { AlertCircle, FolderLock, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CTACards = () => {
  const cards = [
    {
      icon: AlertCircle,
      title: "Signaler un cas",
      description: "Corruption, extorsion, abus de pouvoir",
      gradient: "from-destructive/90 to-destructive/70",
      href: "#signalement",
      badge: null,
    },
    {
      icon: FolderLock,
      title: "Protéger un projet",
      description: "Enregistrez votre idée avec horodatage infalsifiable",
      gradient: "from-secondary/90 to-secondary/70",
      href: "#projet",
      badge: "Profil requis",
    },
    {
      icon: FileText,
      title: "Mes dossiers",
      description: "Consultez vos signalements et projets",
      gradient: "from-primary/90 to-primary/70",
      href: "#dossiers",
      badge: "3 actifs",
    },
  ];

  return (
    <section id="signaler" className="container py-16">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Comment pouvons-nous vous aider ?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choisissez l'action adaptée à votre situation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <a key={index} href={card.href} className="block group">
              <Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-primary/50 relative overflow-hidden">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {card.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-4">{card.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="relative">
                  <CardDescription className="text-base">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default CTACards;
