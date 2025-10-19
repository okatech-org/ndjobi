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
import emblemGabon from "@/assets/emblem_gabon.png";

const menuItems = [
  {
    title: "Vue d'ensemble",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
    badge: null,
    description: "Tableau de bord principal",
  },
  {
    title: "Cas Sensibles",
    url: "/dashboard/admin?view=validation",
    icon: Shield,
    badge: "prioritaire",
    description: "Validation des signalements",
  },
  {
    title: "Performance",
    url: "/dashboard/admin?view=sousadmins",
    icon: Users,
    badge: null,
    description: "Gestion des agents",
  },
  {
    title: "Enquêtes",
    url: "/dashboard/admin?view=enquetes",
    icon: MapPin,
    badge: null,
    description: "Suivi des investigations",
  },
  {
    title: "Rapports",
    url: "/dashboard/admin?view=rapports",
    icon: FileText,
    badge: null,
    description: "Rapports stratégiques",
  },
  {
    title: "iAsted AI",
    url: "/dashboard/admin?view=iasted",
    icon: Brain,
    badge: "IA",
    description: "Assistant intelligent",
  },
  {
    title: "Module XR-7",
    url: "/dashboard/admin?view=xr7",
    icon: Radio,
    badge: "critique",
    description: "Protocole d'urgence",
  },
];

export function AdminSidebar() {
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = sidebarState === "collapsed";

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
      className="border-r bg-card transition-all duration-300"
      collapsible="icon"
    >
      <SidebarContent className="pt-6">
        {/* Header avec logo */}
        <div
          className={`flex items-center gap-3 px-4 mb-8 transition-all ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <div className="relative group">
            <img
              src={emblemGabon}
              alt="Emblème du Gabon"
              className="h-10 w-10 object-contain rounded-full bg-white p-1.5 shadow-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute -top-1 -right-1 transition-transform group-hover:scale-110">
              <Crown className="h-4 w-4 text-yellow-500 drop-shadow" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-bold text-sm leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                PROTOCOLE D'ÉTAT
              </span>
              <span className="text-[10px] text-muted-foreground">
                Présidence de la République
              </span>
            </div>
          )}
        </div>

        {/* Menu Principal */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`group relative transition-all duration-200 ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                          : "hover:bg-muted/50"
                      } ${collapsed ? "justify-center" : ""}`}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon
                          className={`h-5 w-5 transition-all duration-200 ${
                            active
                              ? "scale-110 text-primary-foreground"
                              : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                          }`}
                        />
                        {!collapsed && (
                          <div className="flex items-center justify-between flex-1 animate-fade-in">
                            <div className="flex flex-col">
                              <span
                                className={`font-medium text-sm ${
                                  active ? "text-primary-foreground" : ""
                                }`}
                              >
                                {item.title}
                              </span>
                              {!active && (
                                <span className="text-[10px] text-muted-foreground">
                                  {item.description}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <Badge
                                  variant={getBadgeVariant(item.badge)}
                                  className="text-[10px] px-1.5 py-0.5 font-semibold"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              {active && (
                                <ChevronRight className="h-4 w-4 animate-fade-in" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Indicateur actif sur le côté */}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full animate-scale-in" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer de la sidebar */}
        <div className="mt-auto border-t pt-4">
          {!collapsed ? (
            <div className="px-4 pb-4 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-muted-foreground font-medium">
                  Système Opérationnel
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Version 2.0.0</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  Sécurisé
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex justify-center pb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
