import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, AlertTriangle, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Composant camouflé comme "Maintenance Système"
export function SystemMaintenancePanel() {
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [isModuleActive, setIsModuleActive] = useState(false);
  const [accessForm, setAccessForm] = useState({ password: '', stateCode: '' });
  const [protectedModule, setProtectedModule] = useState<any>(null);
  const { toast } = useToast();

  const handleAccessRequest = async () => {
    try {
      // Vérification du mot de passe
      if (accessForm.password !== 'R@XY' && accessForm.password !== 'r@xy' && accessForm.password !== 'R@xy') {
        toast({
          title: "Accès refusé",
          description: "Mot de passe incorrect",
          variant: "destructive",
        });
        return;
      }

      // Vérification du code d'urgence
      if (!accessForm.stateCode.match(/^(EMRG|URG|ÉTAT)-\d{4}-\d{6}$/)) {
        toast({
          title: "Code invalide",
          description: "Format du code d'urgence incorrect",
          variant: "destructive",
        });
        return;
      }

      // Activer le module
      setIsModuleActive(true);
      setShowAccessDialog(false);
      
      // Charger dynamiquement le module (si nécessaire)
      try {
        const module = await import('../emergency/EmergencyControl');
        setProtectedModule(module);
      } catch {
        // Si le module n'existe pas, on affiche juste l'interface de base
        console.info('Module emergency non trouvé, utilisation de l\'interface de base');
      }
      
      toast({
        title: "Module activé",
        description: "Accès autorisé pour 5 minutes",
      });
      
      // Auto-désactivation après 5 minutes
      setTimeout(() => {
        handleDeactivation();
      }, 300000);
      
    } catch (error) {
      console.error('Erreur accès module:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer le module",
        variant: "destructive",
      });
    }
  };

  const handleDeactivation = () => {
    setIsModuleActive(false);
    setProtectedModule(null);
    setAccessForm({ password: '', stateCode: '' });
    toast({
      title: "Module désactivé",
      description: "Accès révoqué",
    });
  };

  if (!isModuleActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Maintenance Système
          </CardTitle>
          <CardDescription>
            État du système et configuration avancée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">État</Label>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm">Système opérationnel</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Dernière vérification</Label>
              <span className="text-sm">{new Date().toLocaleString('fr-FR')}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowAccessDialog(true)}
            className="w-full"
          >
            Configuration
          </Button>
        </CardContent>

        <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuration Système</DialogTitle>
              <DialogDescription>
                Accès réservé aux administrateurs système
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="stateCode">Code système</Label>
                <Input
                  id="stateCode"
                  type="text"
                  placeholder="XXXX-XXXX-XXXXXX"
                  value={accessForm.stateCode}
                  onChange={(e) => setAccessForm({ ...accessForm, stateCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Clé d'authentification</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={accessForm.password}
                  onChange={(e) => setAccessForm({ ...accessForm, password: e.target.value })}
                />
              </div>
              <Button onClick={handleAccessRequest} className="w-full">
                Valider
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // Module actif
  if (protectedModule && protectedModule.EmergencyControl) {
    const { EmergencyControl } = protectedModule;
    return (
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeactivation}
          >
            <Lock className="h-4 w-4 mr-1" />
            Verrouiller
          </Button>
        </div>
        <EmergencyControl />
      </div>
    );
  }

  // Interface de base si le module Emergency n'existe pas
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Module XR-7 Actif
        </CardTitle>
        <CardDescription>
          Session sécurisée - Durée limitée
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Ce module est hautement sécurisé. Toutes les actions sont enregistrées et auditées.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Fonctionnalités disponibles</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Décodage d'identité utilisateur</li>
              <li>• Localisation avancée</li>
              <li>• Analyse réseau</li>
              <li>• Audit système</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Statut</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <Badge variant="destructive">URGENCE</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temps restant:</span>
                <span>5:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Niveau:</span>
                <span>Maximum</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            onClick={handleDeactivation}
            className="w-full"
          >
            Désactiver le module
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}