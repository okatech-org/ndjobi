import { Bell, Shield, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminHeaderProps {
  unreadNotifications: number;
}

export function AdminHeader({ unreadNotifications }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-effect border-b border-border/50 h-20">
      <div className="h-full px-6 flex items-center justify-between gap-6">
        {/* Gauche: Bouton menu mobile uniquement */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <SidebarTrigger className="lg:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-muted/50 transition-all">
              <Menu className="h-5 w-5" />
            </Button>
          </SidebarTrigger>
        </div>
        
        {/* Centre: Titre principal */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
            Centre de Commandement Intelligence
          </h1>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>Surveillance en temps réel</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Niveau d'alerte : <span className="text-[hsl(var(--accent-danger))] font-semibold">ÉLEVÉ</span></span>
          </p>
        </div>
        
        {/* Droite: Badge LIVE + Profil utilisateur */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Badge LIVE */}
          <Badge className="bg-[hsl(var(--accent-danger))]/10 text-[hsl(var(--accent-danger))] border-[hsl(var(--accent-danger))]/30 px-3 py-1.5 text-xs font-bold">
            <div className="relative mr-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent-danger))] animate-live-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-[hsl(var(--accent-danger))]/30 animate-ping" />
            </div>
            LIVE
          </Badge>
          
          {/* Profil utilisateur */}
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg glass-effect border border-border/50">
            <Avatar className="h-8 w-8 bg-[hsl(var(--accent-intel))]/20">
              <AvatarFallback className="bg-[hsl(var(--accent-intel))]/20 text-[hsl(var(--accent-intel))] font-bold text-sm">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">Agent Dubois</span>
              <span className="text-[10px] text-muted-foreground leading-tight">INTEL_AGENT</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
