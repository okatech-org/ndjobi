import React, { Suspense, lazy } from 'react';
import { Eye, Users, AlertCircle, Target, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import PresidentLayout from './PresidentLayout';
import { usePresidentDashboard } from './hooks/usePresidentDashboard';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import { ModuleXR7 } from '@/components/admin/ModuleXR7';

const VueEnsemble = lazy(() => import('./components/VueEnsemble'));
const OpinionPublique = lazy(() => import('./components/OpinionPublique'));
const SituationsCritiques = lazy(() => import('./components/SituationsCritiques'));
const VisionNationale = lazy(() => import('./components/VisionNationale'));

export const PresidentDashboard: React.FC = () => {
  const { isLoading: authLoading } = useAuth();
  const { activeTab, setActiveTab } = usePresidentDashboard();

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Chargement du Dashboard Présidentiel..." />;
  }

  return (
    <PresidentLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-xl">
          <TabsTrigger value="vue-ensemble" className="data-[state=active]:bg-white">
            <Eye className="h-4 w-4 mr-2" />
            Vue d'Ensemble
          </TabsTrigger>
          <TabsTrigger value="opinion" className="data-[state=active]:bg-white">
            <Users className="h-4 w-4 mr-2" />
            Opinion Publique
          </TabsTrigger>
          <TabsTrigger value="situations" className="data-[state=active]:bg-white">
            <AlertCircle className="h-4 w-4 mr-2" />
            Situations Critiques
          </TabsTrigger>
          <TabsTrigger value="vision" className="data-[state=active]:bg-white">
            <Target className="h-4 w-4 mr-2" />
            Vision Nationale
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<LoadingSpinner message="Chargement..." />}>
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
        </Suspense>
      </Tabs>

      <Card className="border-2 border-red-500 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Protocole d'État XR-7
          </CardTitle>
          <CardDescription className="text-red-700">
            Situations d'urgence nationale nécessitant une intervention présidentielle directe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModuleXR7 />
        </CardContent>
      </Card>
    </PresidentLayout>
  );
};

export default PresidentDashboard;

