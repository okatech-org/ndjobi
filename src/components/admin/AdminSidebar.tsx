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
      className="border-none bg-transparent transition-all duration-300 relative z-20"
      collapsible="icon"
    >
      <div className="absolute inset-0 glass-effect rounded-r-2xl" />
      <SidebarContent className="pt-4 relative z-10">
        {/* Header avec logo - design glassmorphism */}
        <div
          className={`flex items-center gap-3 px-4 mb-6 pb-4 border-b border-border/50 transition-all ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-intel))]/20 to-[hsl(var(--accent-intel))]/5 rounded-lg blur-md group-hover:blur-lg transition-all animate-pulse-glow" />
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-intel))] to-[hsl(var(--accent-warning))] flex items-center justify-center animate-pulse-glow">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-bold text-sm leading-tight tracking-wide">
                PROTOCOLE
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                État • Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Menu Principal - Design glassmorphism */}
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
                  <SidebarMenuItem key={item.title} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`group relative transition-all duration-300 rounded-xl overflow-hidden hover:translate-x-1 ${
                        active
                          ? "bg-gradient-to-r from-[hsl(var(--accent-intel))] to-[hsl(var(--accent-intel))]/80 text-white shadow-lg hover:shadow-xl scale-105"
                          : "hover:bg-muted/50"
                      } ${collapsed ? "justify-center px-3 py-3" : "px-3 py-3"}`}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      {/* Shimmer effect on hover */}
                      {!active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--accent-intel))]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
                      )}
                      
                      {/* Glow effect for active item */}
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--accent-intel))]/50 to-[hsl(var(--accent-warning))]/30 blur-xl animate-pulse" />
                      )}
                      
                      <div className="flex items-center gap-3 w-full min-w-0 relative z-10">
                        <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                          active 
                            ? "bg-white/20 shadow-inner animate-bounce-subtle" 
                            : "bg-muted/30 group-hover:bg-[hsl(var(--accent-intel))]/10 group-hover:scale-110"
                        }`}>
                          <Icon
                            className={`h-4 w-4 flex-shrink-0 transition-all duration-300 group-hover:rotate-3 ${
                              active
                                ? "text-white animate-pulse"
                                : "text-muted-foreground group-hover:text-[hsl(var(--accent-intel))]"
                            }`}
                          />
                        </div>
                        {!collapsed && (
                          <div className="flex items-center justify-between flex-1 gap-2 min-w-0 animate-fade-in">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span
                                className={`font-semibold text-sm leading-tight truncate transition-all duration-300 ${
                                  active ? "text-white" : "text-foreground group-hover:text-[hsl(var(--accent-intel))] group-hover:translate-x-0.5"
                                }`}
                              >
                                {item.title}
                              </span>
                              {!active && (
                                <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate group-hover:text-muted-foreground/80 transition-colors">
                                  {item.description}
                                </span>
                              )}
                            </div>
                            {item.badge && (
                              <Badge
                                className={`text-[9px] px-1.5 py-0.5 font-bold uppercase flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                                  item.badge === 'prioritaire' || item.badge === 'critique'
                                    ? 'bg-[hsl(var(--accent-danger))]/20 text-[hsl(var(--accent-danger))] border-[hsl(var(--accent-danger))]/30 animate-pulse'
                                    : item.badge === 'IA'
                                    ? 'bg-[hsl(var(--accent-intel))]/20 text-[hsl(var(--accent-intel))] border-[hsl(var(--accent-intel))]/30 animate-pulse-glow'
                                    : 'bg-muted/50 text-muted-foreground'
                                }`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Indicateur actif sur le côté avec animation */}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-scale-in" />
                      )}
                      {/* Bordure lumineuse pour l'item actif */}
                      {active && (
                        <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none animate-pulse" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer de la sidebar - design glassmorphism */}
        <div className="mt-auto border-t border-border/50 pt-4 glass-effect rounded-br-2xl">
          {!collapsed ? (
            <div className="px-4 pb-4 space-y-2.5 animate-fade-in glass-effect rounded-lg p-3 hover:bg-muted/30 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-[hsl(var(--accent-success))]/10 group-hover:bg-[hsl(var(--accent-success))]/15 transition-colors">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent-success))] animate-live-pulse" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-[hsl(var(--accent-success))]/30 animate-ping" />
                </div>
                <span className="text-muted-foreground font-semibold text-[11px] group-hover:text-foreground transition-colors">
                  Système Opérationnel
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1 group-hover:text-foreground transition-colors">
                <span className="font-medium">Version 2.0.0</span>
                <Badge className="text-[8px] px-1.5 py-0 bg-[hsl(var(--accent-success))]/20 text-[hsl(var(--accent-success))] border-[hsl(var(--accent-success))]/30 group-hover:scale-105 transition-transform">
                  <Shield className="h-2 w-2 mr-0.5 animate-glow-pulse" />
                  Actif
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center pb-4 gap-2 glass-effect rounded-lg p-2 mx-2 hover:bg-muted/30 transition-all duration-300 cursor-pointer group">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent-success))] animate-live-pulse" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[hsl(var(--accent-success))]/30 animate-ping" />
              </div>
              <Shield className="h-3 w-3 text-muted-foreground group-hover:text-[hsl(var(--accent-success))] transition-colors" />
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
