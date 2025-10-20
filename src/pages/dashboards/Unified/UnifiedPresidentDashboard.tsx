import React, { useState, Suspense, lazy } from 'react';
import { 
  Eye, Users, AlertCircle, Target, Building2, Shield, MapPin, FileText, 
  Radio, Brain, Settings as SettingsIcon, Crown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import PresidentLayout from '../President/PresidentLayout';
import LoadingSpinner from '../shared/components/LoadingSpinner';

const VueEnsemble = lazy(() => import('../President/components/VueEnsemble'));
const OpinionPublique = lazy(() => import('../President/components/OpinionPublique'));
const SituationsCritiques = lazy(() => import('../President/components/SituationsCritiques'));
const VisionNationale = lazy(() => import('../President/components/VisionNationale'));

const GestionInstitutions = lazy(() => import('./views/GestionInstitutions'));
const ValidationCas = lazy(() => import('./views/ValidationCas'));
const SuiviEnquetes = lazy(() => import('./views/SuiviEnquetes'));
const RapportsStrategiques = lazy(() => import('./views/RapportsStrategiques'));

import { ModuleXR7 } from '@/components/admin/ModuleXR7';
import { IAstedChat } from '@/components/admin/IAstedChat';

type TabValue = 
  | 'vue-ensemble' | 'opinion' | 'situations' | 'vision'
  | 'gestion' | 'validation' | 'enquetes' | 'rapports' 
  | 'xr7' | 'iasted' | 'settings';

export const UnifiedPresidentDashboard: React.FC = () => {
  const { isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>(
    (searchParams.get('tab') as TabValue) || 'vue-ensemble'
  );

  const handleTabChange = (value: string) => {
    const newTab = value as TabValue;
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Chargement du Dashboard Présidentiel..." />;
  }

  return (
    <PresidentLayout>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-xl h-auto">
          {/* SECTION PRÉSIDENT - Vue Stratégique */}
          <TabsTrigger value="vue-ensemble" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <Eye className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Vue d'Ensemble</span>
            <span className="sm:hidden">Vue</span>
          </TabsTrigger>
          <TabsTrigger value="opinion" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Opinion</span>
            <span className="sm:hidden">Opinion</span>
          </TabsTrigger>
          <TabsTrigger value="situations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Situations</span>
            <span className="sm:hidden">Cas</span>
          </TabsTrigger>
          <TabsTrigger value="vision" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <Target className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Vision 2025</span>
            <span className="sm:hidden">Vision</span>
          </TabsTrigger>

          {/* SÉPARATEUR VISUEL */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-6 xl:col-span-12 flex items-center gap-3 py-2">
            <Separator className="flex-1" />
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50">
              <Crown className="h-3 w-3 mr-1" />
              GESTION OPÉRATIONNELLE
            </Badge>
            <Separator className="flex-1" />
          </div>

          {/* SECTION ADMIN - Gestion Opérationnelle */}
          <TabsTrigger value="gestion" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Building2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Institutions</span>
            <span className="sm:hidden">Inst.</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Validation</span>
            <span className="sm:hidden">Valid.</span>
          </TabsTrigger>
          <TabsTrigger value="enquetes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Enquêtes</span>
            <span className="sm:hidden">Enq.</span>
          </TabsTrigger>
          <TabsTrigger value="rapports" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Rapports</span>
            <span className="sm:hidden">Rapp.</span>
          </TabsTrigger>
          <TabsTrigger value="xr7" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Radio className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">XR-7</span>
            <span className="sm:hidden">XR-7</span>
          </TabsTrigger>
          <TabsTrigger value="iasted" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Brain className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">iAsted AI</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
            <SettingsIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Paramètres</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<LoadingSpinner message="Chargement..." />}>
          {/* ONGLETS PRÉSIDENT - Vue Stratégique */}
          <TabsContent value="vue-ensemble">
            <VueEnsemble />
          </TabsContent>
          <TabsContent value="opinion">
            <OpinionPublique />
          </TabsContent>
          <TabsContent value="situations">
            <SituationsCritiques />
          </TabsContent>
          <TabsContent value="vision">
            <VisionNationale />
          </TabsContent>

          {/* ONGLETS ADMIN - Gestion Opérationnelle */}
          <TabsContent value="gestion">
            <GestionInstitutions />
          </TabsContent>
          <TabsContent value="validation">
            <ValidationCas />
          </TabsContent>
          <TabsContent value="enquetes">
            <SuiviEnquetes />
          </TabsContent>
          <TabsContent value="rapports">
            <RapportsStrategiques />
          </TabsContent>
          <TabsContent value="xr7">
            <ModuleXR7 />
          </TabsContent>
          <TabsContent value="iasted">
            <IAstedChat isOpen={true} />
          </TabsContent>
          <TabsContent value="settings">
            <div className="p-8 text-center">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Paramètres</h3>
              <p className="text-muted-foreground">Configuration du dashboard (à venir)</p>
            </div>
          </TabsContent>
        </Suspense>
      </Tabs>
    </PresidentLayout>
  );
};

export default UnifiedPresidentDashboard;

