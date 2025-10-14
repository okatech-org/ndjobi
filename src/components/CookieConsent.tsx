import { useState, useEffect } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'ndjobi-cookie-consent';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      const saved = JSON.parse(consent);
      setPreferences(saved);
      applyPreferences(saved);
    }
  }, []);

  const applyPreferences = (prefs: CookiePreferences) => {
    if (prefs.analytics) {
      console.log('Analytics cookies enabled');
    }

    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    savePreferences(allAccepted);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    savePreferences(necessaryOnly);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    applyPreferences(prefs);
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t shadow-lg">
        <div className="container max-w-6xl">
          <Card className="border-0 shadow-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">Respect de votre vie privée</h3>
                  <p className="text-sm text-muted-foreground">
                    Nous utilisons des cookies pour améliorer votre expérience. Les cookies nécessaires sont
                    obligatoires pour le fonctionnement du site. Vous pouvez personnaliser vos préférences.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Personnaliser
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAcceptNecessary}
                  className="w-full sm:w-auto"
                >
                  Nécessaires uniquement
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto"
                >
                  Tout accepter
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Préférences de cookies
            </DialogTitle>
            <DialogDescription>
              Gérez vos préférences de confidentialité
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-1 flex-1">
                <Label htmlFor="necessary" className="font-medium">
                  Cookies nécessaires
                </Label>
                <p className="text-xs text-muted-foreground">
                  Requis pour le fonctionnement du site (authentification, sécurité)
                </p>
              </div>
              <Switch
                id="necessary"
                checked={preferences.necessary}
                disabled
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-1 flex-1">
                <Label htmlFor="analytics" className="font-medium">
                  Cookies analytiques
                </Label>
                <p className="text-xs text-muted-foreground">
                  Nous aident à améliorer le site en comprenant comment vous l'utilisez
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-1 flex-1">
                <Label htmlFor="marketing" className="font-medium">
                  Cookies marketing
                </Label>
                <p className="text-xs text-muted-foreground">
                  Personnalisent votre expérience et les contenus que vous voyez
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, marketing: checked })
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveCustom}
              className="flex-1"
            >
              Enregistrer mes choix
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

