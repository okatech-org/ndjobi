import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu } from 'lucide-react';
import emblemGabon from '@/assets/emblem_gabon.png';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeView }) => {
  const [mobileMenuState, setMobileMenuState] = React.useState<'collapsed' | 'icons' | 'expanded'>('icons');

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full relative overflow-hidden">
        <div className="fixed inset-0 bg-pattern-grid pointer-events-none z-0" />
        
        <div className="fixed w-[400px] h-[400px] rounded-full opacity-[var(--orb-opacity)] blur-[100px] -top-[200px] -left-[200px] bg-gradient-to-br from-[hsl(var(--accent-intel))] via-[hsl(var(--accent-intel))] to-transparent animate-float-orb pointer-events-none" style={{ animationDuration: '25s' }} />
        <div className="fixed w-[300px] h-[300px] rounded-full opacity-[var(--orb-opacity)] blur-[100px] -bottom-[150px] -right-[150px] bg-gradient-to-br from-[hsl(var(--accent-warning))] via-[hsl(var(--accent-warning))] to-transparent animate-float-orb pointer-events-none" style={{ animationDuration: '30s', animationDelay: '-5s' }} />

        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        <div className="flex-1 flex flex-col w-full relative z-10">
          <header className="h-16 glass-effect sticky top-0 z-50">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={emblemGabon} 
                  alt="Emblème du Gabon"
                  className="h-8 w-8 object-contain rounded-full bg-white p-1 shadow-sm"
                />
                <div className="hidden md:block">
                  <h1 className="text-base font-bold">PROTOCOLE D'ÉTAT</h1>
                  <p className="text-[9px] text-muted-foreground">Intelligence • Vision 2025</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-live-pulse" />
                  <span className="text-xs font-medium text-red-500">LIVE</span>
                </div>
                
                <ThemeToggle />
                
                <button 
                  onClick={() => {
                    setMobileMenuState(prev => 
                      prev === 'collapsed' ? 'icons' : 
                      prev === 'icons' ? 'expanded' : 
                      'collapsed'
                    );
                  }}
                  className={`lg:hidden h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted border transition-all ${
                    mobileMenuState !== 'collapsed' ? 'border-primary bg-primary/10' : ''
                  }`}
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                <div className="hidden lg:flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-2 bg-[hsl(var(--accent-success))]/10 border-[hsl(var(--accent-success))]/30">
                    Gabon • Vision 2025
                  </Badge>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className={`container py-3 md:py-8 space-y-3 md:space-y-6 transition-all ${
              mobileMenuState === 'collapsed' ? 'pr-0' : 
              mobileMenuState === 'icons' ? 'pr-14' : 
              'pr-52'
            } lg:pr-0`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

