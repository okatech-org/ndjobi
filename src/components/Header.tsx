import { Shield, LogOut, User, FileText, Settings, AlertCircle, FolderLock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, profile, signOut } = useAuth();

  // Menu pour les utilisateurs connectés - correspond au menu mobile
  const authenticatedMenuItems = [
    { label: "Mon Profil", path: "/dashboard/user", icon: User },
    { label: "Signaler", path: "/dashboard/user?view=report", icon: AlertCircle },
    { label: "Protéger", path: "/dashboard/user?view=project", icon: FolderLock },
    { label: "Mes Dossiers", path: "/dashboard/user?view=files", icon: FileText },
    { label: "Paramètres", path: "/dashboard/user?view=settings", icon: Settings },
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
          {user && authenticatedMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path.includes('?view=') && location.search.includes(item.path.split('?view=')[1]));
            return (
              <Button 
                key={item.label} 
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
          <div className="flex items-center gap-2 ml-4">
            {user ? (
              <>
                {role && (
                  <Badge variant={getRoleColor(role) as any} className="text-xs">
                    {getRoleLabel(role)}
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
                Se connecter
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile Auth Button */}
        <div className="md:hidden">
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
              Connexion
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
