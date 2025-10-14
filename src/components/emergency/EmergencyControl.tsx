import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Activity, Lock } from 'lucide-react';

export function EmergencyControl() {
  const [isActive, setIsActive] = useState(true);
  
  return (
    <Card className="border-red-500/50 bg-red-50/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Shield className="h-6 w-6" />
          Module d'Urgence XR-7
        </CardTitle>
        <CardDescription>
          Module de sécurité nationale - Accès restreint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>AVERTISSEMENT:</strong> Ce module est sous surveillance judiciaire. 
            Toute utilisation non autorisée est passible de poursuites.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">État du Module</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Statut:</span>
                  {isActive ? (
                    <Badge variant="destructive">ACTIF</Badge>
                  ) : (
                    <Badge variant="outline">INACTIF</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Niveau:</span>
                  <Badge variant="destructive">MAXIMUM</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Autorisation:</span>
                  <Badge variant="outline">JUDICIAIRE</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Capacités Actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span>Décodage identité</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span>Géolocalisation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span>Analyse réseau</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-yellow-500" />
                  <span>Audio (limité)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Journal d'Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs font-mono">
              <div>[{new Date().toISOString()}] Module activé - Super Admin</div>
              <div>[{new Date().toISOString()}] Autorisation judiciaire vérifiée</div>
              <div>[{new Date().toISOString()}] Surveillance active</div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50/50">
          <div>
            <p className="font-semibold text-red-900">Temps restant</p>
            <p className="text-2xl font-mono text-red-600">04:58</p>
          </div>
          <Button 
            variant="destructive"
            size="lg"
            onClick={() => setIsActive(false)}
          >
            <Lock className="h-4 w-4 mr-2" />
            Désactiver d'urgence
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            Module conforme aux articles L.811-3 et L.851-1 du Code de la sécurité intérieure.
            Utilisation soumise à autorisation préfectorale ou judiciaire.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}