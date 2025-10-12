import { Shield, Mail, Phone, Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">NDJOBI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Plateforme citoyenne officielle de lutte contre la corruption au Gabon.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Accueil</a></li>
              <li><a href="#signaler" className="text-muted-foreground hover:text-primary transition-colors">Signaler</a></li>
              <li><a href="#proteger" className="text-muted-foreground hover:text-primary transition-colors">Protéger</a></li>
              <li><a href="#statistiques" className="text-muted-foreground hover:text-primary transition-colors">Statistiques</a></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold mb-4">Informations légales</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#cgu" className="text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#confidentialite" className="text-muted-foreground hover:text-primary transition-colors">Politique de confidentialité</a></li>
              <li><a href="#mentions" className="text-muted-foreground hover:text-primary transition-colors">Mentions légales</a></li>
              <li><a href="#aide" className="text-muted-foreground hover:text-primary transition-colors">Centre d'aide</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@ndjobi.ga" className="hover:text-primary transition-colors">
                  contact@ndjobi.ga
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:+24101234567" className="hover:text-primary transition-colors">
                  +241 01 23 45 67
                </a>
              </li>
            </ul>

            {/* Social */}
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} NDJOBI - République Gabonaise. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
