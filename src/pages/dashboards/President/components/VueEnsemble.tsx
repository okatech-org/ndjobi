import React from 'react';
import { TrendingUp, AlertCircle, DollarSign, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KPICard } from '../../shared/components/KPICard';
import { ChartContainer } from '../../shared/components/ChartContainer';
import { usePresidentData } from '../hooks/usePresidentData';
import { formatMontant } from '../../shared/utils/formatters';

export const VueEnsemble: React.FC = () => {
  const { kpis, distributionRegionale, evolutionMensuelle } = usePresidentData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Signalements Totaux"
          value={kpis?.total_signalements || 320}
          icon={TrendingUp}
          trend={{ value: kpis?.tendance || '+12%', label: 'vs mois dernier' }}
          color="blue"
        />

        <KPICard
          title="Cas Critiques"
          value={kpis?.signalements_critiques || 28}
          icon={AlertCircle}
          description="Nécessitent validation"
          color="red"
        />

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardDescription>Taux de Résolution</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-600">
              {kpis?.taux_resolution || 67}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={kpis?.taux_resolution || 67} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardDescription>Fonds Récupérés</CardDescription>
            <CardTitle className="text-2xl font-bold text-yellow-700">
              {formatMontant(kpis?.impact_economique || 7200000000)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>Impact économique</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="h-5 w-5 text-blue-600" />
            Indice National de Transparence
          </CardTitle>
          <CardDescription>
            Mesure de la confiance citoyenne et de l'efficacité anti-corruption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-blue-600">
                {kpis?.score_transparence || 78}/100
              </span>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Bon Niveau
              </Badge>
            </div>
            <Progress value={kpis?.score_transparence || 78} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Objectif 2025: 85/100 • Progression constante depuis 6 mois
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Situation par Région
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {distributionRegionale?.slice(0, 5).map((region, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 font-medium">{region.region}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      {region.cas} cas • {region.resolus} résolus
                    </span>
                    <span className="text-sm font-medium">{region.taux}%</span>
                  </div>
                  <Progress value={region.taux} className="h-2" />
                </div>
                <Badge 
                  variant={region.priorite === 'Haute' ? 'destructive' : 'secondary'}
                  className="w-20 justify-center"
                >
                  {region.priorite}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ChartContainer title="Évolution sur 6 Mois">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolutionMensuelle?.slice(-6)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="signalements" 
              stroke="#2D5F1E" 
              strokeWidth={2}
              name="Signalements"
            />
            <Line 
              type="monotone" 
              dataKey="resolutions" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Résolus"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default VueEnsemble;

