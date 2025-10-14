import { AlertCircle, FolderLock, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";
import reportCaseImg from "@/assets/report-case.jpg";
import protectProjectImg from "@/assets/protect-project.jpg";
import myFilesImg from "@/assets/my-files.jpg";

const CTACards = () => {
  const navigate = useNavigate();

  const cards = [
    {
      icon: AlertCircle,
      title: "Taper le Ndjobi",
      description: "Corruption, extorsion, abus de pouvoir",
      gradient: "from-destructive/90 to-destructive/70",
      action: () => navigate('/report'),
      badge: "Anonyme",
      image: reportCaseImg,
    },
    {
      icon: FolderLock,
      title: "Protéger un projet",
      description: "Enregistrez votre idée avec horodatage infalsifiable",
      gradient: "from-secondary/90 to-secondary/70",
      action: () => navigate('/auth?action=protect'),
      badge: "Connexion requise",
      image: protectProjectImg,
    },
    {
      icon: FileText,
      title: "Mes dossiers",
      description: "Consultez vos dénonciations et projets",
      gradient: "from-primary/90 to-primary/70",
      action: () => navigate('/auth'),
      badge: "Connexion requise",
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
            <div key={index} onClick={card.action} className="block group cursor-pointer">
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
                  {card.badge && (
                    <Badge variant="secondary" className="absolute top-3 right-3 text-[10px] sm:text-xs whitespace-normal text-center leading-tight">
                      {card.badge}
                    </Badge>
                  )}
                </div>
                
                <CardHeader className="relative p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg flex-shrink-0`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-4 sm:p-6 pt-0 sm:pt-0">
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CTACards;
