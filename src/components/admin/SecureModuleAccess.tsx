import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CoreProtection from '@/services/security/coreProtection';

// Composant camouflé sous un nom générique
export function SystemMaintenancePanel() {
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [isModuleActive, setIsModuleActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accessForm, setAccessForm] = useState({
    password: '',
    stateCode: ''
  });
  const [protectedModule, setProtectedModule] = useState<any>(null);
  const { toast } = useToast();

  // Vérifier si le module est activé via variable d'environnement
  useEffect(() => {
    const xr7Enabled = import.meta.env.VITE_XR7_ENABLED === 'true';
    if (!xr7Enabled) {
      console.log('Module système désactivé');
    }
  }, []);

  const handleAccessRequest = async () => {
    try {
      // Initialiser le système de protection avec le mot de passe
      const protectionSystem = CoreProtection.init(accessForm.password);
      
      if (!protectionSystem) {
        toast({
          title: "Accès refusé",
          description: "Mot de passe invalide",
          variant: "destructive"
        });
        return;
      }

      // Vérifier l'autorisation complète
      const authorized = await protectionSystem.auth.verifyModificationAuth(
        accessForm.password,
        accessForm.stateCode
      );

      if (authorized) {
        // Charger le module de manière obfusquée
        try {
          const module = await protectionSystem.loader.loadModule('SystemManager');
          setProtectedModule(module);
          setIsModuleActive(true);
          setShowAccessDialog(false);
          
          toast({
            title: "Accès autorisé",
            description: "Module système activé pour 5 minutes",
          });

          // Auto-désactivation après 5 minutes
          setTimeout(() => {
            handleDeactivation();
          }, 300000);

        } catch (error) {
          console.error('Erreur chargement module:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger le module",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Accès refusé",
          description: "Code d'état d'urgence invalide",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur accès:', error);
      toast({
        title: "Erreur système",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleDeactivation = () => {
    const protectionSystem = CoreProtection.init('R@XY');
    if (protectionSystem) {
      protectionSystem.loader.clearModules();
    }
    setIsModuleActive(false);
    setProtectedModule(null);
    toast({
      title: "Module désactivé",
      description: "Accès révoqué",
    });
  };

  // Interface publique - apparence normale
  if (!isModuleActive) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Maintenance Système</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAccessDialog(true)}
            >
              <Lock className="h-4 w-4 mr-1" />
              Configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>État du système : Nominal</p>
            <p>Dernière vérification : {new Date().toLocaleString('fr-FR')}</p>
            <p>Prochaine maintenance : Non planifiée</p>
          </div>
        </CardContent>

        {/* Dialog d'accès caché */}
        <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Accès Maintenance Avancée
              </DialogTitle>
              <DialogDescription>
                Configuration système niveau 3. Autorisation requise.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert variant="default">
                <AlertDescription>
                  L'accès à ce module nécessite une autorisation spéciale.
                  Toute tentative non autorisée sera enregistrée.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="state-code">Code Système</Label>
                <Input
                  id="state-code"
                  placeholder="Format: EMRG-XXXX-XXXXXX"
                  value={accessForm.stateCode}
                  onChange={(e) => setAccessForm({...accessForm, stateCode: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="auth-password">Clé d'Authentification</Label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••"
                    value={accessForm.password}
                    onChange={(e) => setAccessForm({...accessForm, password: e.target.value})}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAccessDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleAccessRequest}
                disabled={!accessForm.password || !accessForm.stateCode}
              >
                Valider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // Module actif - charger le vrai composant
  if (protectedModule && protectedModule.EmergencyControl) {
    const { EmergencyControl } = protectedModule;
    return (
      <div className="relative">
        {/* Bouton de désactivation flottant */}
        <Button
          className="absolute top-2 right-2 z-50"
          variant="destructive"
          size="sm"
          onClick={handleDeactivation}
        >
          <Lock className="h-4 w-4 mr-1" />
          Verrouiller
        </Button>
        
        {/* Composant d'urgence réel */}
        <EmergencyControl />
      </div>
    );
  }

  return null;
}
