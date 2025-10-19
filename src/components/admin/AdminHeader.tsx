import { Bell, Shield, Menu, Activity, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AdminHeaderProps {
  unreadNotifications: number;
}

export function AdminHeader({ unreadNotifications }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-effect border-b border-border/50 h-16">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Gauche: Logo et titre */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Bouton menu mobile avec meilleur style */}
          <SidebarTrigger className="lg:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-muted/50 transition-all glass-effect">
              <Menu className="h-5 w-5" />
            </Button>
          </SidebarTrigger>
          
          {/* Logo et titre animés - compact */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-intel))]/30 to-[hsl(var(--accent-warning))]/30 rounded-lg blur-lg animate-pulse-glow" />
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-intel))] to-[hsl(var(--accent-warning))] flex items-center justify-center shadow-xl">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="hidden md:flex flex-col">
              <h1 className="text-sm font-bold tracking-wide">
                PROTOCOLE D'ÉTAT
              </h1>
              <p className="text-[9px] text-muted-foreground font-medium">Intelligence • Vision 2025</p>
            </div>
          </div>
        </div>
        
        {/* Centre: Indicateurs en temps réel - design amélioré */}
        <div className="hidden lg:flex items-center gap-3 flex-1 justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-effect border border-red-500/30 hover:border-red-500/50 transition-all shadow-lg shadow-red-500/10">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-live-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500/30 animate-ping" />
            </div>
            <span className="text-xs font-bold text-red-500 tracking-wide">LIVE</span>
          </div>
          
          <div className="h-5 w-px bg-border/30" />
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-effect border border-[hsl(var(--accent-success))]/30 hover:border-[hsl(var(--accent-success))]/50 transition-all">
            <Activity className="h-3.5 w-3.5 text-[hsl(var(--accent-success))] animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">Surveillance Active</span>
          </div>
        </div>
        
        {/* Droite: Actions et indicateurs - alignement amélioré */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notification badge avec meilleur style */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative glass-effect hover:bg-muted/50 transition-all h-9 w-9 rounded-lg hover-lift"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </Button>
          
          <ThemeToggle />
          
          <div className="h-6 w-px bg-border/30 hidden lg:block mx-1" />
          
          {/* Badge Vision 2025 avec animation */}
          <div className="hidden lg:flex items-center">
            <Badge className="text-[10px] px-2.5 py-1.5 bg-[hsl(var(--accent-success))]/10 text-[hsl(var(--accent-success))] border-[hsl(var(--accent-success))]/30 hover:bg-[hsl(var(--accent-success))]/20 transition-all cursor-default">
              <Flag className="h-3 w-3 mr-1.5 animate-bounce-subtle" />
              <span className="font-semibold">Gabon • Vision 2025</span>
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
