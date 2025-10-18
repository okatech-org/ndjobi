import logoNdjobi from "@/assets/logo_ndjobi.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-10 sm:py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 max-w-3xl mx-auto">
          {/* Logo & Description */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src={logoNdjobi} 
                alt="Logo Ndjobi"
                className="h-6 w-6 sm:h-8 sm:w-8 object-contain rounded-full bg-white p-1 shadow-sm" 
              />
              <span className="text-base sm:text-lg font-bold">NDJOBI</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Plateforme citoyenne officielle pour la bonne gouvernance au Gabon.
            </p>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Informations légales</h3>
            <ul className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <li><a href="#cgu" className="text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#confidentialite" className="text-muted-foreground hover:text-primary transition-colors">Politique de confidentialité</a></li>
              <li><a href="#mentions" className="text-muted-foreground hover:text-primary transition-colors">Mentions légales</a></li>
              <li><a href="#aide" className="text-muted-foreground hover:text-primary transition-colors">Centre d'aide</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 sm:mt-10 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {currentYear} NDJOBI - République Gabonaise. Tous droits réservés.</p>
          <p className="mt-2">
            <a href="/auth/super-admin" className="text-muted-foreground/50 hover:text-primary transition-colors text-xs">Administration Système</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
