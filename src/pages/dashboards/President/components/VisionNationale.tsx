import React from 'react';
import { Target, FileText, CheckCircle, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '../../shared/components/ChartContainer';
import { usePresidentData } from '../hooks/usePresidentData';

export const VisionNationale: React.FC = () => {
  const { visionData, performanceMinisteres, kpis, genererRapport } = usePresidentData();

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                Vision Gabon Émergent 2025
              </CardTitle>
              <CardDescription>
                Progression des piliers stratégiques nationaux
              </CardDescription>
            </div>
            <Button onClick={() => genererRapport('annuel')}>
              <FileText className="h-4 w-4 mr-2" />
              Rapport Annuel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {visionData?.map((pilier, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{pilier.pilier}</h4>
                    <p className="text-sm text-muted-foreground">
                      Objectif: {pilier.objectif}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {pilier.score}/100
                    </div>
                    <Badge variant="secondary">{pilier.statut}</Badge>
                  </div>
                </div>
                <Progress value={pilier.score} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ChartContainer title="Performance des Institutions">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceMinisteres}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ministere" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="taux" fill="#2D5F1E" name="Taux de Résolution %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <Card className="bg-gradient-to-br from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle>Synthèse Stratégique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm">
              <strong>Réduction 34%</strong> des cas de corruption vs 2023
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            <p className="text-sm">
              <strong>7,2 milliards FCFA</strong> récupérés depuis janvier
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <p className="text-sm">
              <strong>+18 points</strong> au score de transparence nationale
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
            <p className="text-sm">
              <strong>62% satisfaction</strong> des citoyens sur la lutte anti-corruption
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisionNationale;

