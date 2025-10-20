import React from 'react';
import { AlertCircle, CheckCircle, Eye, FileText, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePresidentData } from '../hooks/usePresidentData';
import { useToast } from '@/hooks/use-toast';
import { getPriorityVariant } from '../../shared/utils/formatters';

export const SituationsCritiques: React.FC = () => {
  const { casSensibles, recommandationsStrategiques, enregistrerDecision, genererRapport } = usePresidentData();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-800">
          {casSensibles?.length || 4} situations nécessitent votre validation
        </AlertTitle>
        <AlertDescription className="text-red-700">
          Ces cas critiques dépassent 2 milliards FCFA ou impliquent des hauts fonctionnaires
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {casSensibles?.slice(0, 4).map((cas, index) => (
          <Card key={index} className="border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="uppercase">
                      {cas.reference_id}
                    </Badge>
                    <Badge variant="outline">
                      Score IA: {cas.ai_priority_score}%
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{cas.titre}</CardTitle>
                  <CardDescription>{cas.location}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {cas.montant}
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {cas.categorie}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  🤖 Analyse Intelligence Artificielle:
                </p>
                <p className="text-sm text-blue-800">{cas.ai_analysis_summary}</p>
              </div>

              {cas.metadata?.action_recommandee && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-orange-900 mb-1">
                    Action Recommandée:
                  </p>
                  <p className="text-sm text-orange-800">
                    {cas.metadata.action_recommandee}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    enregistrerDecision(cas.id, 'approuver');
                    toast({
                      title: 'Cas approuvé',
                      description: 'Enquête lancée automatiquement'
                    });
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver Enquête
                </Button>
                <Button 
                  onClick={() => {
                    enregistrerDecision(cas.id, 'enquete', 'Investigation approfondie requise');
                    toast({
                      title: 'Investigation ordonnée'
                    });
                  }}
                  variant="outline" 
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ordonner Investigation
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => genererRapport('executif')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Recommandations Stratégiques
          </CardTitle>
          <CardDescription>
            Actions prioritaires identifiées par l'analyse des données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommandationsStrategiques.map((rec, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Badge variant={getPriorityVariant(rec.priorite)}>
                  {rec.priorite}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{rec.titre}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Impact: <strong>{rec.impact}</strong></span>
                    <span>Délai: <strong>{rec.delai}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SituationsCritiques;

