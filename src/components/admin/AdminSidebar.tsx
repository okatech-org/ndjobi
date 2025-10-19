import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Settings,
  BarChart3,
  Brain,
  MapPin,
  Radio,
  Clock,
  Crown,
  ChevronRight,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { accountSwitchingService } from "@/services/accountSwitching";
import emblemGabon from "@/assets/emblem_gabon.png";
import { demoAccountService } from "@/services/demoAccountService";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
    badge: null,
    description: "Vue d'ensemble",
  },
  {
    title: "Gestion Agents",
    url: "/dashboard/admin?view=sousadmins",
    icon: Users,
    badge: null,
    description: "Performance des agents",
  },
  {
    title: "Validation Cas",
    url: "/dashboard/admin?view=validation",
    icon: Shield,
    badge: "prioritaire",
    description: "Cas sensibles",
  },
  {
    title: "Enquêtes",
    url: "/dashboard/admin?view=enquetes",
    icon: MapPin,
    badge: null,
    description: "Suivi terrain",
  },
  {
    title: "Rapports",
    url: "/dashboard/admin?view=rapports",
    icon: FileText,
    badge: null,
    description: "Documents stratégiques",
  },
  {
    title: "Module XR-7",
    url: "/dashboard/admin?view=xr7",
    icon: Radio,
    badge: "critique",
    description: "Protocole d'urgence",
  },
  {
    title: "iAsted AI",
    url: "/dashboard/admin?view=iasted",
    icon: Brain,
    badge: "IA",
    description: "Assistant intelligent",
  },
  {
    title: "Paramètres",
    url: "/dashboard/admin?view=settings",
    icon: Settings,
    badge: null,
    description: "Configuration",
  },
];

export function AdminSidebar() {
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = sidebarState === "collapsed";
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const isInSwitchedAccount = accountSwitchingService.isInSwitchedAccount();
  
  const handleSignOut = async () => {
    try {
      toast({
        title: "Déconnexion en cours...",
        description: "Veuillez patienter",
      });

      // Nettoyer les données locales (bascule + session démo)
      if (isInSwitchedAccount) {
        accountSwitchingService.clearAll();
        console.log('✅ Données de compte basculé nettoyées');
      }
      demoAccountService.clearLocalSession();

      // Déconnexion backend
      await signOut();
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur NDJOBI !",
      });

      // Redirection immédiate vers l'accueil avec reload propre
      window.location.replace('/');
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
          description: "Vous êtes de retour dans le compte Protocole d'État",
        });

        // Rediriger vers le dashboard Super Admin
        setTimeout(() => {
          navigate('/dashboard/super-admin', { replace: true });
          window.location.reload();
        }, 500);
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

  const isActive = (url: string) => {
    if (url === "/dashboard/admin") {
      return location.pathname === "/dashboard/admin" && !location.search;
    }
    const viewParam = url.split("?view=")[1];
    return location.search.includes(viewParam);
  };

  const getBadgeVariant = (badge: string | null) => {
    switch (badge) {
      case "prioritaire":
        return "destructive";
      case "IA":
        return "default";
      case "critique":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Sidebar
      className="border-r bg-background transition-all duration-300"
      collapsible="icon"
    >
      <SidebarContent className="pt-4">
        {/* Header avec logo - design moderne sans couronne */}
        <div
          className={`flex items-center gap-3 px-4 mb-6 transition-all ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-md group-hover:blur-lg transition-all" />
            <img
              src={emblemGabon}
              alt="Emblème du Gabon"
              className="relative h-10 w-10 object-contain rounded-full bg-white p-1.5 shadow-xl ring-2 ring-primary/20 transition-all group-hover:scale-105 group-hover:ring-primary/40"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-bold text-xs leading-tight tracking-wide">
                PROTOCOLE D'ÉTAT
              </span>
              <span className="text-[9px] text-muted-foreground font-medium">
                Présidence de la République
              </span>
            </div>
          )}
        </div>

        {/* Menu Principal - Design moderne */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`group relative transition-all duration-200 rounded-lg ${
                        active
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                          : "hover:bg-muted/70 hover:shadow-sm"
                      } ${collapsed ? "justify-center px-3 py-3" : "px-3 py-3"}`}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                            active
                              ? "text-primary-foreground"
                              : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        {!collapsed && (
                          <div className="flex items-center justify-between flex-1 gap-2 min-w-0 animate-fade-in">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span
                                className={`font-semibold text-sm leading-tight truncate ${
                                  active ? "text-primary-foreground" : "text-foreground"
                                }`}
                              >
                                {item.title}
                              </span>
                              {!active && (
                                <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                                  {item.description}
                                </span>
                              )}
                            </div>
                            {item.badge && (
                              <Badge
                                variant={getBadgeVariant(item.badge)}
                                className="text-[9px] px-1.5 py-0.5 font-bold uppercase flex-shrink-0"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Indicateur actif sur le côté - plus moderne */}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-primary-foreground rounded-r-full animate-scale-in" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Actions - Déconnexion et Retour */}
        <div className="mt-auto border-t pt-3 bg-gradient-to-t from-muted/20 to-transparent">
          {!collapsed ? (
            <div className="px-3 pb-3 space-y-2 animate-fade-in">
              {isInSwitchedAccount && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReturnToSuperAdmin}
                  className="w-full justify-start gap-2 text-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour Super Admin
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start gap-2 text-xs hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center pb-3 gap-2">
              {isInSwitchedAccount && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReturnToSuperAdmin}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Footer système */}
          {!collapsed ? (
            <div className="px-4 pb-4 pt-3 space-y-2.5 border-t">
              <div className="flex items-center gap-2 text-xs">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500/30 animate-ping" />
                </div>
                <span className="text-muted-foreground font-semibold text-[11px]">
                  Système Opérationnel
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1">
                <span className="font-medium">Version 2.0.0</span>
                <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-green-500/30 text-green-600">
                  <Shield className="h-2 w-2 mr-0.5" />
                  Sécurisé
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center pb-4 pt-3 gap-2 border-t">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500/30 animate-ping" />
              </div>
              <Shield className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
