import React from 'react';
import { Crown, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IAstedFloatingButton } from '@/components/admin/IAstedFloatingButton';
import emblemGabon from '@/assets/emblem_gabon.png';

interface PresidentLayoutProps {
  children: React.ReactNode;
}

export const PresidentLayout: React.FC<PresidentLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 via-green-600 to-blue-700 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36"></div>
          
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
              <img src={emblemGabon} alt="Armoiries du Gabon" className="w-20 h-20 object-contain" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Dashboard Présidentiel</h1>
              </div>
              <p className="text-green-100 text-lg">
                Vue stratégique de la gouvernance • République Gabonaise
              </p>
              <p className="text-green-200/80 text-sm mt-1">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="text-right">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2">
                <Activity className="h-3 w-3 mr-1" />
                TEMPS RÉEL
              </Badge>
              <p className="text-sm text-green-100">Mise à jour continue</p>
            </div>
          </div>
        </div>

        {children}
      </main>

      <Footer />
      <IAstedFloatingButton />
    </div>
  );
};

export default PresidentLayout;

