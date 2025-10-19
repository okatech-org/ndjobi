import { Shield, LogOut, User, FileText, Settings, AlertCircle, FolderLock, LayoutDashboard, Search, Map as MapIcon, Menu, X, ArrowLeft, MessageCircle, Key, Bot, Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { accountSwitchingService } from "@/services/accountSwitching";
import { demoAccountService } from "@/services/demoAccountService";
import { UserRole } from "@/types/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import logoNdjobi from "@/assets/logo_ndjobi.png";
import emblemGabon from "@/assets/emblem_gabon.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dériver un rôle à partir de l'URL courante pour fiabiliser le menu mobile
  const pathRole: UserRole | null = location.pathname.startsWith('/dashboard/super-admin') ? 'super_admin'
    : location.pathname.startsWith('/dashboard/admin') ? 'admin'
    : location.pathname.startsWith('/dashboard/agent') ? 'agent'
    : location.pathname.startsWith('/dashboard/user') ? 'user'
    : null;
  const currentRole = (pathRole || role) as UserRole | null;

  // Déterminer le path du dashboard selon le rôle
  const getDashboardPath = () => {
    switch (currentRole) {
      case 'super_admin': return '/dashboard/super-admin';
      case 'admin': return '/dashboard/admin';
      case 'agent': return '/dashboard/agent';
      case 'user': 
      default: return '/dashboard/user';
    }
  };

  const dashboardPath = getDashboardPath();

  // Menu adapté selon le rôle
  const authenticatedMenuItems = currentRole === 'super_admin' ? [
    { label: "Dashboard", path: dashboardPath, icon: User },
    { label: "Gestion Système", path: `${dashboardPath}?view=system`, icon: Settings },
    { label: "Utilisateurs", path: `${dashboardPath}?view=users`, icon: User },
    { label: "Projet", path: `${dashboardPath}?view=project`, icon: FileText },
    { label: "Module XR-7", path: `${dashboardPath}?view=xr7`, icon: AlertCircle },
    { label: "Configuration", path: `${dashboardPath}?view=config`, icon: Key },
  ] : currentRole === 'admin' ? [
    { label: "Dashboard", path: dashboardPath, icon: User },
    { label: "Gestion Agents", path: `${dashboardPath}?view=agents`, icon: User },
    { label: "Validation Cas", path: `${dashboardPath}?view=validation`, icon: AlertCircle },
    { label: "Rapports", path: `${dashboardPath}?view=reports`, icon: FileText },
    { label: "Paramètres", path: `${dashboardPath}?view=settings`, icon: Settings },
  ] : currentRole === 'agent' ? [
    { label: "Dashboard", path: dashboardPath, icon: LayoutDashboard },
    { label: "Signalements", path: `${dashboardPath}?view=cases`, icon: AlertCircle },
    { label: "Enquêtes", path: `${dashboardPath}?view=investigations`, icon: Search },
    { label: "Carte", path: `${dashboardPath}?view=map`, icon: MapIcon },
    { label: "Profil", path: `${dashboardPath}?view=profile`, icon: User },
  ] : [
    { label: "Mon Profil", path: dashboardPath, icon: User },
    // Masquer explicitement "Taper le Ndjobi" pour les rôles non-citoyens
    ...(currentRole === 'user' ? [
      { label: "Taper le Ndjobi", path: `${dashboardPath}?view=report`, icon: AlertCircle },
    ] : []),
    { label: "Protéger", path: `${dashboardPath}?view=project`, icon: FolderLock },
    { label: "Mes Dossiers", path: `${dashboardPath}?view=files`, icon: FileText },
    { label: "Paramètres", path: `${dashboardPath}?view=settings`, icon: Settings },
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
      toast({
        title: "Déconnexion en cours...",
        description: "Veuillez patienter",
      });

      // Nettoyer les sessions locales (compte basculé + session démo)
      if (accountSwitchingService.isInSwitchedAccount()) {
        accountSwitchingService.clearAll();
      }
      demoAccountService.clearLocalSession();

      // Déconnexion backend
      await signOut();
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur NDJOBI !",
      });

      // Redirection vers la page d'accueil (reload pour état propre)
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleReturnToSuperAdmin = async () => {
    try {
      toast({
        title: "Retour au Super Admin...",
        description: "Veuillez patienter",
      });

      const result = await accountSwitchingService.switchBackToOriginal();
      
      if (result.success) {
        toast({
          title: "Retour réussi",
          description: "Vous êtes maintenant déconnecté. Veuillez vous reconnecter en tant que Super Admin.",
        });

        // Rediriger vers la page d'authentification
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 1000);
      } else {
        throw new Error(result.error || 'Erreur de retour');
      }
    } catch (error: any) {
      console.error('Error returning to Super Admin:', error);
      toast({
        title: "Erreur de retour",
        description: error.message || "Impossible de retourner au compte Super Admin",
        variant: "destructive",
      });
    }
  };

  const handleContactUs = () => {
    const phoneNumber = '+33661002616';
    const message = encodeURIComponent('Bonjour, je souhaite obtenir des informations sur NDJOBI.');
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Ouverture de WhatsApp",
      description: "Redirection vers WhatsApp en cours...",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <img 
              src={currentRole === 'admin' ? emblemGabon : logoNdjobi} 
              alt={currentRole === 'admin' ? "Emblème du Gabon" : "Logo Ndjobi"}
              className="h-10 w-10 object-contain transition-transform group-hover:scale-110 rounded-full bg-white p-1 shadow-sm" 
            />
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">
              {currentRole === 'admin' ? 'PROTOCOLE D\'ÉTAT' : 'NDJOBI'}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">Bonne gouvernance</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {!user && (
            <Button 
              variant={location.pathname === '/statistiques' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate('/statistiques')}
              className="gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Statistiques
            </Button>
          )}
          {user && authenticatedMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path.includes('?view=') && location.search.includes(item.path.split('?view=')[1]));
            return (
              <Button 
                key={item.label} 
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  if (!isActive) {
                    navigate(item.path);
                  }
                }}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
          <div className="flex items-center gap-2 ml-4">
            <ThemeToggle />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleContactUs}
              className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Nous Contacter</span>
              <span className="inline md:hidden">Contact</span>
            </Button>
            
            {user ? (
              <>
                {currentRole && (
                  <Badge variant={getRoleColor(currentRole) as any} className="text-xs">
                    {getRoleLabel(currentRole)}
                  </Badge>
                )}
                {accountSwitchingService.isInSwitchedAccount() && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleReturnToSuperAdmin}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour Super Admin
                  </Button>
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

        {/* Mobile Menu */}
        <div className="md:hidden">
          {user ? (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {currentRole === 'agent' ? 'Menu Agent DGSS' : 
                     currentRole === 'admin' ? 'Menu Protocole d\'État' :
                     currentRole === 'super_admin' ? 'Menu Super Admin' :
                     'Menu Navigation'}
                  </SheetTitle>
                  <SheetDescription>
                    {currentRole && (
                      <Badge variant={getRoleColor(currentRole) as any} className="text-xs mt-2">
                        {getRoleLabel(currentRole)}
                      </Badge>
                    )}
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-8 space-y-2">
                  {authenticatedMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || 
                                   (item.path.includes('?view=') && location.search.includes(item.path.split('?view=')[1]));
                    return (
                      <Button
                        key={item.label}
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => {
                          if (!isActive) {
                            navigate(item.path);
                          }
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    );
                  })}
                  
                  <div className="pt-4 mt-4 border-t space-y-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm font-medium">Thème</span>
                      <ThemeToggle variant="ghost" />
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                      onClick={() => {
                        handleContactUs();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Nous Contacter
                    </Button>
                    
                    {accountSwitchingService.isInSwitchedAccount() && (
                      <Button
                        variant="secondary"
                        className="w-full justify-start gap-3 mb-2"
                        onClick={() => {
                          handleReturnToSuperAdmin();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <ArrowLeft className="h-5 w-5" />
                        Retour Super Admin
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleContactUs}
                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Nous Contacter</span>
                <span className="inline md:hidden">Contact</span>
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
                Connexion
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
