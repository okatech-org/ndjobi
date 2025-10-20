import React from 'react';
import { Crown, Calendar, BarChart3, TrendingUp, Download, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProtocolEtat } from '@/hooks/useProtocolEtat';

export const RapportsStrategiques: React.FC = () => {
  const { kpis, genererRapport } = useProtocolEtat();
  const [timeRange, setTimeRange] = React.useState('30days');

  const rapports = [
    { type: 'executif', titre: 'Rapport Exécutif', icon: Crown, desc: 'Synthèse présidentielle', color: 'purple' },
    { type: 'hebdomadaire', titre: 'Rapport Hebdo', icon: Calendar, desc: 'Évolution 7 jours', color: 'blue' },
    { type: 'mensuel', titre: 'Rapport Mensuel', icon: BarChart3, desc: 'Performance mensuelle', color: 'green' },
    { type: 'annuel', titre: 'Rapport Annuel', icon: TrendingUp, desc: 'Vision 2025', color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold">Rapports Stratégiques</h3>
          <p className="text-muted-foreground mt-1">
            Analytics avancés et indicateurs Vision Gabon 2025
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] glass-effect border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="3months">3 derniers mois</SelectItem>
              <SelectItem value="1year">Dernière année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="glass-effect border-none">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rapports.map((rapport, idx) => (
          <Card key={idx} className="glass-effect border-none cursor-pointer transition-all hover:translate-y-[-4px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <rapport.icon className="h-5 w-5" />
                {rapport.titre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{rapport.desc}</p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full glass-effect border-none"
                onClick={() => genererRapport(rapport.type as 'executif' | 'hebdomadaire' | 'mensuel' | 'annuel')}
              >
                <Download className="h-4 w-4 mr-2" />
                Générer PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="glass-effect border-none bg-gradient-to-br from-green-500/10 to-transparent">
        <Target className="h-4 w-4 text-green-600" />
        <AlertTitle>Vision Gabon Émergent 2025</AlertTitle>
        <AlertDescription>
          La lutte anticorruption contribue directement aux objectifs de la Deuxième République. 
          Impact mesuré: réduction de 34% des cas de corruption vs 2023, récupération de {((kpis?.impact_economique || 0) / 1000000000).toFixed(1)} milliards FCFA, 
          amélioration de 18 points du score de transparence nationale.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RapportsStrategiques;

