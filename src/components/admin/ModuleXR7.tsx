import { useState } from 'react';
import {
  Shield, Radio, AlertTriangle, Lock, Eye, Clock,
  FileText, CheckCircle, XCircle, Zap, Scale, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProtocoleActivation {
  signalement_id: string;
  raison: string;
  autorisation_judiciaire: string;
  duree_heures: number;
  reference_legale: string;
  protection_temoins: boolean;
  preservation_preuves: boolean;
}

export function ModuleXR7() {
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationForm, setActivationForm] = useState<Partial<ProtocoleActivation>>({
    duree_heures: 24,
    protection_temoins: true,
    preservation_preuves: true
  });
  const { toast } = useToast();

  const handleActiverProtocole = async () => {
    if (!activationForm.signalement_id || !activationForm.raison || !activationForm.autorisation_judiciaire) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    setIsActivating(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      const activationData = {
        id: crypto.randomUUID(),
        signalement_id: activationForm.signalement_id,
        reason: activationForm.raison,
        judicial_authorization: activationForm.autorisation_judiciaire,
        duration_hours: activationForm.duree_heures || 24,
        legal_reference: activationForm.reference_legale || 'Protocole XR-7 Emergency',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + (activationForm.duree_heures || 24) * 60 * 60 * 1000).toISOString(),
        activated_by: userData?.user?.id || '',
        status: 'active',
        activation_metadata: {
          protection_temoins: activationForm.protection_temoins,
          preservation_preuves: activationForm.preservation_preuves,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('emergency_activations')
        .insert([activationData]);

      if (error) throw error;

      await supabase
        .from('signalements')
        .update({
          status: 'xr7_protocol_active',
          priority: 'critique',
          metadata: {
            xr7_activated: true,
            xr7_activation_date: new Date().toISOString()
          }
        })
        .eq('id', activationForm.signalement_id);

      toast({
        title: '🚨 Protocole XR-7 Activé',
        description: `Protection judiciaire activée pour ${activationForm.duree_heures}h`,
      });

      setShowActivationDialog(false);
      setActivationForm({
        duree_heures: 24,
        protection_temoins: true,
        preservation_preuves: true
      });

    } catch (error: any) {
      console.error('Erreur activation XR-7:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer le protocole XR-7',
        variant: 'destructive'
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-red-500 bg-red-50/50 dark:bg-red-950/20">
        <Radio className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900 dark:text-red-100">
          MODULE XR-7 - PROTOCOLE D'URGENCE JUDICIAIRE
        </AlertTitle>
        <AlertDescription className="text-red-800 dark:text-red-200">
          Ce module permet l'activation d'un protocole d'urgence pour la protection des témoins
          et la préservation des preuves dans les cas de corruption critiques nécessitant
          une intervention judiciaire immédiate.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Protection Témoins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activation immédiate de la protection des témoins clés et des lanceurs d'alerte
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Préservation Preuves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sécurisation et horodatage blockchain de toutes les preuves documentaires
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-5 w-5 text-red-600" />
              Autorisation Judiciaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Traçabilité complète avec référence légale et validation procureur
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conditions d'Activation XR-7</CardTitle>
          <CardDescription>
            Le protocole d'urgence ne peut être activé que si les conditions suivantes sont réunies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium">Cas de corruption avérée critique</div>
              <div className="text-sm text-muted-foreground">
                Montant ≥ 500M FCFA ou impact national majeur
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium">Autorisation judiciaire valide</div>
              <div className="text-sm text-muted-foreground">
                Ordonnance du Procureur de la République ou mandat présidentiel
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium">Risque imminent pour témoins ou preuves</div>
              <div className="text-sm text-muted-foreground">
                Menaces avérées ou tentatives de destruction de preuves
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium">Validation Protocole d'État</div>
              <div className="text-sm text-muted-foreground">
                Approbation présidentielle requise pour activation
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/10 dark:bg-orange-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Cadre Légal et Responsabilités
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Fondement légal :</strong> Loi organique sur la lutte contre la corruption
            et l'enrichissement illicite (Gabon, 2021)
          </p>
          <p>
            <strong>Durée maximale :</strong> 72 heures renouvelables sur autorisation judiciaire
          </p>
          <p>
            <strong>Audit :</strong> Toutes les activations sont enregistrées et auditées
            par le Conseil Constitutionnel
          </p>
          <p className="text-orange-800 dark:text-orange-200">
            ⚠️ <strong>Avertissement :</strong> L'activation abusive du protocole XR-7 constitue
            une faute grave passible de sanctions pénales selon l'article 142 du Code Pénal.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setShowActivationDialog(true)}
        >
          <Zap className="h-5 w-5 mr-2" />
          Activer Protocole XR-7
        </Button>
      </div>

      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-600" />
              Activation Protocole XR-7 - Urgence Judiciaire
            </DialogTitle>
            <DialogDescription>
              Veuillez renseigner les informations requises pour l'activation du protocole d'urgence
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ID Signalement Concerné *</Label>
              <Input
                placeholder="ex: 123e4567-e89b-12d3-a456-426614174000"
                value={activationForm.signalement_id || ''}
                onChange={(e) => setActivationForm(prev => ({
                  ...prev,
                  signalement_id: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Raison de l'Activation *</Label>
              <Textarea
                placeholder="Décrivez la situation d'urgence justifiant l'activation..."
                value={activationForm.raison || ''}
                onChange={(e) => setActivationForm(prev => ({
                  ...prev,
                  raison: e.target.value
                }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Référence Autorisation Judiciaire *</Label>
              <Input
                placeholder="ex: Ordonnance N°2025/PGR/001"
                value={activationForm.autorisation_judiciaire || ''}
                onChange={(e) => setActivationForm(prev => ({
                  ...prev,
                  autorisation_judiciaire: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Référence Légale</Label>
              <Input
                placeholder="ex: Art. 142 Code Pénal Gabonais"
                value={activationForm.reference_legale || ''}
                onChange={(e) => setActivationForm(prev => ({
                  ...prev,
                  reference_legale: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Durée de Protection (heures)</Label>
              <Input
                type="number"
                min="1"
                max="72"
                value={activationForm.duree_heures || 24}
                onChange={(e) => setActivationForm(prev => ({
                  ...prev,
                  duree_heures: parseInt(e.target.value)
                }))}
              />
            </div>

            <Alert className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900 dark:text-red-100">
                L'activation du protocole XR-7 déclenchera immédiatement :
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Notification automatique du Procureur de la République</li>
                  <li>Protection renforcée des témoins identifiés</li>
                  <li>Horodatage blockchain de toutes les preuves</li>
                  <li>Audit trail complet pour traçabilité judiciaire</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActivationDialog(false)}
              disabled={isActivating}
            >
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleActiverProtocole}
              disabled={isActivating}
            >
              {isActivating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Activation en cours...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Confirmer Activation XR-7
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

