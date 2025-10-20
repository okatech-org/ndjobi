import React from 'react';
import { Shield, CheckCircle, Eye, XCircle, Download, Brain, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProtocolEtat } from '@/hooks/useProtocolEtat';
import { useToast } from '@/hooks/use-toast';

export const ValidationCas: React.FC = () => {
  const { casSensibles, isLoading, enregistrerDecision, genererRapport } = useProtocolEtat();
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = React.useState('all');

  const handleValiderCas = async (casId: string, decision: 'approuver' | 'rejeter' | 'enquete') => {
    const result = await enregistrerDecision(casId, decision);
    if (result.success) {
      toast({
        title: '✅ Décision enregistrée',
        description: `La décision présidentielle "${decision}" a été enregistrée avec succès.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold">Cas Sensibles - Validation Présidentielle</h3>
          <p className="text-muted-foreground mt-1">
            Dossiers critiques nécessitant votre décision stratégique
          </p>
        </div>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[180px] glass-effect border-none">
            <SelectValue placeholder="Toutes régions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes régions</SelectItem>
            <SelectItem value="estuaire">Estuaire</SelectItem>
            <SelectItem value="haut-ogooue">Haut-Ogooué</SelectItem>
            <SelectItem value="ogooue-maritime">Ogooué-Maritime</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {casSensibles.map((cas, idx) => (
        <Card key={idx} className="glass-effect border-none bg-gradient-to-br from-orange-500/5 to-transparent">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="space-y-1">
                <CardTitle className="text-lg">{cas.title || cas.titre}</CardTitle>
                <CardDescription>Référence: {cas.id} • {new Date(cas.created_at).toLocaleDateString('fr-FR')}</CardDescription>
              </div>
              <Badge variant={cas.priority === 'critique' ? 'destructive' : 'default'}>
                {cas.urgence || cas.priority || 'Moyenne'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Montant impliqué</div>
                <div className="font-bold text-red-600">{cas.montant || 'N/A'}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Type</div>
                <div className="font-semibold">{cas.type}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Statut</div>
                <Badge variant="outline">{cas.status}</Badge>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Localisation</div>
                <div className="font-semibold">{cas.location}</div>
              </div>
            </div>

            <Alert className="glass-effect border-none bg-blue-50/50">
              <Brain className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <strong>Analyse IA:</strong> Score de priorité {cas.ai_priority_score || 0}%. 
                {cas.ai_analysis_summary || 'Analyse en cours...'}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 flex-wrap">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleValiderCas(cas.id, 'approuver')}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver l'Action
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleValiderCas(cas.id, 'enquete')}
                disabled={isLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Enquête Approfondie
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleValiderCas(cas.id, 'rejeter')}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter le Dossier
              </Button>
              <Button 
                variant="ghost"
                onClick={() => genererRapport('executif')}
              >
                <Download className="h-4 w-4 mr-2" />
                Rapport Détaillé
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {casSensibles.length === 0 && (
        <Card className="glass-effect border-none">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucun cas sensible en attente</h3>
            <p className="text-muted-foreground">
              Tous les dossiers critiques ont été traités.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ValidationCas;

