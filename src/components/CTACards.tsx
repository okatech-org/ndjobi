import { AlertCircle, FolderLock, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import reportCaseImg from "@/assets/report-case.jpg";
import protectProjectImg from "@/assets/protect-project.jpg";
import myFilesImg from "@/assets/my-files.jpg";

const CTACards = () => {
  const cards = [
    {
      icon: AlertCircle,
      title: "Signaler un cas",
      description: "Corruption, extorsion, abus de pouvoir",
      gradient: "from-destructive/90 to-destructive/70",
      href: "#signalement",
      badge: null,
      image: reportCaseImg,
    },
    {
      icon: FolderLock,
      title: "Protéger un projet",
      description: "Enregistrez votre idée avec horodatage infalsifiable",
      gradient: "from-secondary/90 to-secondary/70",
      href: "#projet",
      badge: "Profil requis",
      image: protectProjectImg,
    },
    {
      icon: FileText,
      title: "Mes dossiers",
      description: "Consultez vos signalements et projets",
      gradient: "from-primary/90 to-primary/70",
      href: "#dossiers",
      badge: "3 actifs",
      image: myFilesImg,
    },
  ];

  return (
    <section id="signaler" className="container py-6 sm:py-16 md:py-20">
      <div className="text-center mb-6 sm:mb-12 space-y-3 sm:space-y-4 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
          Comment pouvons-nous vous aider ?
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
          Choisissez l'action adaptée à votre situation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <a key={index} href={card.href} className="block group">
              <Card className="h-full transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-xl border-2 hover:border-primary/50 relative overflow-hidden">
                {/* Image illustrative */}
                <div className="relative w-full overflow-hidden">
                  <AspectRatio ratio={4 / 3}>
                    <img 
                      src={card.image} 
                      alt={card.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                    />
                  </AspectRatio>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                </div>
                
                <CardHeader className="relative p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-0">
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    {card.badge && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg sm:text-xl mt-3 sm:mt-4">{card.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="relative p-4 sm:p-6 pt-0 sm:pt-0">
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
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
