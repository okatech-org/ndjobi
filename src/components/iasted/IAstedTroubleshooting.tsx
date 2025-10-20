import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Settings, Mic, Volume2, Smartphone, Monitor, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TroubleshootingProps {
  isOpen: boolean;
  onClose: () => void;
  currentIssue?: string;
}

export function IAstedTroubleshooting({ isOpen, onClose, currentIssue }: TroubleshootingProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['ios']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const iosSettings = [
    {
      title: "Protection de la confidentialité lors des mesures publicitaires",
      description: "Ce paramètre bloque l'accès au microphone et à l'audio",
      steps: [
        "Ouvrez Réglages > Safari",
        "Appuyez sur 'Avancé'",
        "Désactivez 'Protection de la confidentialité lors des mesures publicitaires'"
      ],
      critical: true
    },
    {
      title: "Autorisations microphone",
      description: "Vérifiez que Safari peut accéder au microphone",
      steps: [
        "Ouvrez Réglages > Safari",
        "Appuyez sur 'Sites web'",
        "Sélectionnez 'Microphone'",
        "Autorisez pour ndjobi.com"
      ],
      critical: true
    },
    {
      title: "JavaScript activé",
      description: "iAsted nécessite JavaScript pour fonctionner",
      steps: [
        "Ouvrez Réglages > Safari",
        "Appuyez sur 'Avancé'",
        "Activez 'JavaScript'"
      ],
      critical: false
    },
    {
      title: "Bloquer tous les cookies",
      description: "Les cookies peuvent être nécessaires pour la session",
      steps: [
        "Ouvrez Réglages > Safari",
        "Appuyez sur 'Avancé'",
        "Désactivez 'Bloquer tous les cookies'"
      ],
      critical: false
    }
  ];

  const androidSettings = [
    {
      title: "Autorisations microphone",
      description: "Autorisez l'accès au microphone dans Chrome",
      steps: [
        "Ouvrez Chrome",
        "Appuyez sur les trois points > Paramètres",
        "Sélectionnez 'Paramètres du site'",
        "Trouvez ndjobi.com",
        "Activez 'Microphone'"
      ],
      critical: true
    },
    {
      title: "Mode navigation privée",
      description: "Évitez le mode navigation privée pour iAsted",
      steps: [
        "Utilisez Chrome en mode normal",
        "Évitez le mode incognito"
      ],
      critical: false
    }
  ];

  const desktopSettings = [
    {
      title: "Autorisations microphone",
      description: "Autorisez l'accès au microphone dans votre navigateur",
      steps: [
        "Cliquez sur l'icône de verrou à côté de l'URL",
        "Activez l'autorisation 'Microphone'",
        "Actualisez la page"
      ],
      critical: true
    },
    {
      title: "HTTPS requis",
      description: "iAsted nécessite une connexion sécurisée",
      steps: [
        "Vérifiez que l'URL commence par https://",
        "Acceptez le certificat SSL si demandé"
      ],
      critical: true
    }
  ];

  const detectCurrentIssue = () => {
    if (currentIssue === 'microphone') {
      return {
        icon: <Mic className="h-5 w-5 text-red-500" />,
        title: "Problème de microphone détecté",
        description: "Le microphone n'est pas accessible. Vérifiez les paramètres ci-dessous."
      };
    }
    if (currentIssue === 'audio') {
      return {
        icon: <Volume2 className="h-5 w-5 text-red-500" />,
        title: "Problème audio détecté",
        description: "La lecture audio ne fonctionne pas. Vérifiez les paramètres ci-dessous."
      };
    }
    return {
      icon: <HelpCircle className="h-5 w-5 text-blue-500" />,
      title: "Guide de dépannage iAsted",
      description: "Solutions pour les problèmes courants d'iAsted sur mobile et desktop."
    };
  };

  const issueInfo = detectCurrentIssue();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {issueInfo.icon}
              <div>
                <CardTitle className="text-lg">{issueInfo.title}</CardTitle>
                <CardDescription>{issueInfo.description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Alerte principale */}
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle>Problème connu sur iOS Safari</AlertTitle>
            <AlertDescription>
              La "Protection de la confidentialité lors des mesures publicitaires" bloque l'accès au microphone et à l'audio. 
              <strong>Cette protection doit être désactivée</strong> pour qu'iAsted fonctionne correctement.
            </AlertDescription>
          </Alert>

          {/* iOS Settings */}
          <Collapsible 
            open={expandedSections.includes('ios')} 
            onOpenChange={() => toggleSection('ios')}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold">iOS Safari</div>
                    <div className="text-sm text-muted-foreground">Paramètres pour iPhone/iPad</div>
                  </div>
                </div>
                {expandedSections.includes('ios') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pl-8">
              {iosSettings.map((setting, index) => (
                <Card key={index} className={`${setting.critical ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {setting.critical ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                        {setting.title}
                      </CardTitle>
                      {setting.critical && (
                        <Badge variant="destructive" className="text-xs">Critique</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{setting.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ol className="space-y-2 text-sm">
                      {setting.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {stepIndex + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Android Settings */}
          <Collapsible 
            open={expandedSections.includes('android')} 
            onOpenChange={() => toggleSection('android')}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-semibold">Android Chrome</div>
                    <div className="text-sm text-muted-foreground">Paramètres pour Android</div>
                  </div>
                </div>
                {expandedSections.includes('android') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pl-8">
              {androidSettings.map((setting, index) => (
                <Card key={index} className={`${setting.critical ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {setting.critical ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {setting.title}
                      </CardTitle>
                      {setting.critical && (
                        <Badge variant="destructive" className="text-xs">Critique</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{setting.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ol className="space-y-2 text-sm">
                      {setting.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {stepIndex + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Desktop Settings */}
          <Collapsible 
            open={expandedSections.includes('desktop')} 
            onOpenChange={() => toggleSection('desktop')}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-semibold">Desktop (Chrome/Firefox/Safari)</div>
                    <div className="text-sm text-muted-foreground">Paramètres pour ordinateur</div>
                  </div>
                </div>
                {expandedSections.includes('desktop') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pl-8">
              {desktopSettings.map((setting, index) => (
                <Card key={index} className={`${setting.critical ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {setting.critical ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                        )}
                        {setting.title}
                      </CardTitle>
                      {setting.critical && (
                        <Badge variant="destructive" className="text-xs">Critique</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{setting.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ol className="space-y-2 text-sm">
                      {setting.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {stepIndex + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Tips généraux */}
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-yellow-600" />
                Conseils généraux
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                <span>Actualisez la page après avoir modifié les paramètres</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                <span>Utilisez HTTPS pour une meilleure compatibilité</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                <span>Évitez le mode navigation privée sur mobile</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                <span>Testez d'abord en mode texte, puis passez au vocal</span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
