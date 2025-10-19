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
      className="border-r bg-gradient-to-b from-card to-card/80 transition-all duration-300"
      collapsible="icon"
    >
      <SidebarContent className="pt-4">
        {/* Header avec logo - design moderne */}
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
            <div className="absolute -top-1 -right-1 transition-transform group-hover:scale-110">
              <Crown className="h-4 w-4 text-yellow-500 drop-shadow-lg" />
            </div>
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
            <SidebarMenu className="space-y-0.5 px-2">
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
                      } ${collapsed ? "justify-center px-3 py-2.5" : "px-3 py-2.5"}`}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                          active 
                            ? "bg-primary-foreground/10" 
                            : "bg-muted/30 group-hover:bg-muted/50"
                        }`}>
                          <Icon
                            className={`h-4 w-4 transition-all duration-200 ${
                              active
                                ? "text-primary-foreground"
                                : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          />
                        </div>
                        {!collapsed && (
                          <div className="flex items-center justify-between flex-1 animate-fade-in">
                            <div className="flex flex-col">
                              <span
                                className={`font-semibold text-[13px] leading-tight ${
                                  active ? "text-primary-foreground" : "text-foreground"
                                }`}
                              >
                                {item.title}
                              </span>
                              {!active && (
                                <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                                  {item.description}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                <Badge
                                  variant={getBadgeVariant(item.badge)}
                                  className="text-[9px] px-1.5 py-0 font-bold uppercase"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
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

        {/* Footer de la sidebar - design amélioré */}
        <div className="mt-auto border-t pt-4 bg-gradient-to-t from-muted/20 to-transparent">
          {!collapsed ? (
            <div className="px-4 pb-4 space-y-2.5 animate-fade-in">
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
            <div className="flex flex-col items-center pb-4 gap-2">
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
