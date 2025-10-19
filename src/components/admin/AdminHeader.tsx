import { Menu, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

export function AdminHeader() {
  const { user } = useAuth();
  
  return (
    <header className="glass-effect border-b border-border/50 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Mobile menu button */}
        <SidebarTrigger className="lg:hidden">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>

        {/* Center: Title */}
        <div className="flex-1 text-center lg:text-left lg:ml-4">
          <h1 className="text-lg md:text-xl font-bold tracking-tight">
            Protocole d'État Intelligence
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Surveillance nationale • Niveau d'alerte : ÉLEVÉ
          </p>
        </div>

        {/* Right: Live badge + User profile */}
        <div className="flex items-center gap-3">
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-live-pulse" />
            LIVE
          </Badge>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border/50">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[hsl(var(--accent-intel))]/20 text-[hsl(var(--accent-intel))] text-xs font-bold">
                PE
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                Protocole d'État
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                ADMIN_NATIONAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
