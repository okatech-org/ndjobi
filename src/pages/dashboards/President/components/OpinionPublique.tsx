import React from 'react';
import { ThumbsUp, AlertCircle, MapPin, Flag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { usePresidentData } from '../hooks/usePresidentData';
import { CHART_COLORS } from '../../shared/utils/constants';

export const OpinionPublique: React.FC = () => {
  const { opinionPublique } = usePresidentData();

  const sentimentData = [
    { name: 'Satisfaits', value: 62 },
    { name: 'Neutres', value: 23 },
    { name: 'Insatisfaits', value: 15 }
  ];

  const COLORS = [CHART_COLORS.PRIMARY, CHART_COLORS.SECONDARY, CHART_COLORS.ACCENT_1];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              Satisfaction Globale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-green-600">
                {opinionPublique.satisfactionGlobale}%
              </div>
              <Progress value={opinionPublique.satisfactionGlobale} className="h-3" />
              <div className="flex items-center justify-center gap-2 text-sm">
                <Badge variant="secondary">
                  Tendance: {opinionPublique.tendance}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {opinionPublique.sentimentDominant}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition du Sentiment National</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Préoccupations Citoyennes Principales
          </CardTitle>
          <CardDescription>
            Sujets les plus mentionnés dans les signalements et enquêtes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opinionPublique.principauxGriefs.map((grief, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{grief.categorie}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{grief.evolution}</span>
                    <Badge variant="outline">{grief.intensite}%</Badge>
                  </div>
                </div>
                <Progress value={Number(grief.intensite)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-600" />
            Zones Nécessitant une Attention Particulière
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opinionPublique.zonesRisque.map((zone, index) => (
              <Alert key={index} variant={zone.niveau === 'Haute' ? 'destructive' : 'default'}>
                <MapPin className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{zone.region}</span>
                  <Badge variant={zone.niveau === 'Haute' ? 'destructive' : 'secondary'}>
                    Priorité: {zone.niveau}
                  </Badge>
                </AlertTitle>
                <AlertDescription>{zone.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpinionPublique;

