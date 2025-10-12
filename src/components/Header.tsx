import { useState } from "react";
import { Menu, X, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, profile, signOut } = useAuth();

  const menuItems = [
    { label: "Accueil", href: "#" },
    { label: "Mon Profil", href: "#profil" },
    { label: "Mes Dossiers", href: "#dossiers" },
    { label: "Statistiques", href: "#statistiques" },
    { label: "Aide & Tutoriels", href: "#aide" },
    { label: "Paramètres", href: "#parametres" },
  ];

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Protocole d\'État';
      case 'agent': return 'Agent DGSS';
      case 'user': return 'Citoyen';
      default: return 'Utilisateur';
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'agent': return 'secondary';
      case 'user': return 'outline';
      default: return 'outline';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">NDJOBI</span>
            <span className="text-[10px] text-muted-foreground leading-none">Plateforme Anti-Corruption</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => (
            <Button key={item.label} variant="ghost" asChild>
              <a href={item.href}>{item.label}</a>
            </Button>
          ))}
          <div className="flex items-center gap-2 ml-4">
            {role && (
              <Badge variant={getRoleColor(role) as any} className="text-xs">
                {getRoleLabel(role)}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[350px]">
            <nav className="flex flex-col space-y-4 mt-8">
              {role && (
                <div className="pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground mb-2">Connecté en tant que</p>
                  <Badge variant={getRoleColor(role) as any}>
                    {getRoleLabel(role)}
                  </Badge>
                  {profile?.full_name && (
                    <p className="text-sm font-medium mt-2">{profile.full_name}</p>
                  )}
                  {profile?.email && (
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  )}
                </div>
              )}
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button variant="destructive" className="mt-4" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
