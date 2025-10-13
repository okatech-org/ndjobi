import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Content */}
      <div className="container relative z-10 py-8 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
        <div className="max-w-4xl space-y-6 sm:space-y-8 animate-fade-in">
          <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full">
            <span className="text-xs sm:text-sm font-medium text-primary">
              🛡️ Protection garantie par cryptage AES-256
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Protégez vos projets,
            </span>
            <br />
            <span className="text-foreground">
              Combattez la corruption
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Plateforme citoyenne sécurisée pour signaler la corruption de manière <strong className="text-foreground">100% anonyme</strong> et protéger vos innovations avec un <strong className="text-foreground">horodatage infalsifiable</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
              <a href="#signaler" aria-label="Signaler un cas">🚨 Signaler un cas</a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
              <a href="#proteger" aria-label="Protéger mon projet">🔒 Protéger mon projet</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
