import { useState } from 'react';
import { Brain, Loader2, CheckCircle, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { gptService } from '@/services/ai/gptService';

interface AIAnalysisProps {
  type: 'report' | 'project';
  data: {
    title?: string;
    type?: string;
    category?: string;
    description: string;
    location?: string;
    innovationLevel?: string;
  };
  onAnalysisComplete?: (analysis: any) => void;
}

export const AIAnalysis = ({ type, data, onAnalysisComplete }: AIAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      let result;
      
      if (type === 'report') {
        result = await gptService.analyzeReport(
          data.type || '',
          data.description,
          data.location || '',
        );
      } else {
        result = await gptService.analyzeProject(
          data.title || '',
          data.category || '',
          data.description,
          data.innovationLevel || '',
        );
      }

      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Erreur lors de l\'analyse IA. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevé';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      default: return severity;
    }
  };

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Analyse IA
          </CardTitle>
          <CardDescription>
            Obtenez une analyse automatique par intelligence artificielle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              L'analyse IA vous fournira :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Un résumé détaillé</li>
                <li>Les points clés identifiés</li>
                {type === 'report' && <li>Le niveau de gravité</li>}
                <li>Des recommandations d'actions</li>
                <li>Une estimation de l'impact</li>
              </ul>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !data.description}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Lancer l'analyse IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Analyse IA Complétée
              </CardTitle>
              <CardDescription>
                Résultats générés par intelligence artificielle
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAnalysis(null);
                setError(null);
              }}
            >
              Nouvelle analyse
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">
              Résumé
            </h3>
            <p className="text-sm">{String(analysis.summary || '')}</p>
          </div>

          {/* Severity (for reports only) */}
          {type === 'report' && analysis.severity && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Niveau de gravité
              </h3>
              <Badge className={getSeverityColor(String(analysis.severity || ''))}>
                {getSeverityLabel(String(analysis.severity || ''))}
              </Badge>
            </div>
          )}

          {/* Key Points */}
          {Array.isArray(analysis.keyPoints) && analysis.keyPoints.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Points clés
              </h3>
              <ul className="space-y-2">
                {(analysis.keyPoints as string[]).map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{String(point)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recommandations
              </h3>
              <ul className="space-y-2">
                {(analysis.recommendations as string[]).map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm bg-muted p-2 rounded">
                    <span className="font-bold text-primary">{index + 1}.</span>
                    <span>{String(rec)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estimated Impact */}
          {analysis.estimatedImpact && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Impact estimé
              </h3>
              <p className="text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                {String(analysis.estimatedImpact || '')}
              </p>
            </div>
          )}

          {/* Related Categories */}
          {Array.isArray(analysis.relatedCategories) && analysis.relatedCategories.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Catégories liées
              </h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.relatedCategories as string[]).map((category: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {String(category)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

