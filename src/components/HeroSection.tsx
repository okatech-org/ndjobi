import heroImage from "@/assets/hero-ndjobi.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Protection citoyenne au Gabon" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/70" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-16 md:py-24">
        <div className="max-w-3xl space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Plateforme Citoyenne Officielle</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Protégeons ensemble
            <span className="block bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              notre Gabon
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Signalez anonymement les cas de corruption et protégez vos projets innovants 
            contre le vol d'idées. Ensemble, construisons une société plus transparente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a href="#signaler" className="group">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                🚨 Signaler un cas
              </button>
            </a>
            <a href="#proteger" className="group">
              <button className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                🔒 Protéger mon projet
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
