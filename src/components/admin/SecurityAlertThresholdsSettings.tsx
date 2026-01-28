import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Zap,
  TrendingUp,
  AlertCircle,
  Clock,
  Activity,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useSecurityAlertThresholds, SecurityAlertThresholds } from '@/hooks/useSecurityAlertThresholds';
import { toast } from '@/hooks/use-toast';

interface ThresholdInputProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  icon?: React.ReactNode;
}

const ThresholdInput: React.FC<ThresholdInputProps> = ({
  label,
  description,
  value,
  onChange,
  min = 1,
  max = 999,
  suffix = '',
  icon,
}) => (
  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
    {icon && <div className="mt-1 text-muted-foreground">{icon}</div>}
    <div className="flex-1 space-y-2">
      <Label className="font-medium">{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
        className="w-20 text-center"
        min={min}
        max={max}
      />
      {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
    </div>
  </div>
);

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  severity: 'critical' | 'warning' | 'info';
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  label,
  description,
  checked,
  onCheckedChange,
  severity,
}) => {
  const severityColors = {
    critical: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
    warning: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
    info: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
      <div className="flex items-center gap-3">
        <Badge className={severityColors[severity]}>{label}</Badge>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};

export const SecurityAlertThresholdsSettings: React.FC = () => {
  const { thresholds, updateThreshold, resetToDefaults, defaultThresholds } = useSecurityAlertThresholds();

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: 'Seuils réinitialisés',
      description: 'Les seuils de détection ont été remis aux valeurs par défaut.',
    });
  };

  const isModified = JSON.stringify(thresholds) !== JSON.stringify(defaultThresholds);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration des Alertes de Sécurité
              </CardTitle>
              <CardDescription className="mt-2">
                Personnalisez les seuils de détection des activités suspectes et les préférences de notification
              </CardDescription>
            </div>
            {isModified && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Seuils de détection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Seuils de Détection
          </CardTitle>
          <CardDescription>
            Définissez les limites qui déclenchent les alertes automatiques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Actions rapides */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Actions Rapides
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <ThresholdInput
                label="Nombre d'actions"
                description="Nombre minimum d'actions pour déclencher une alerte"
                value={thresholds.rapidActionsCount}
                onChange={(v) => updateThreshold('rapidActionsCount', v)}
                suffix="actions"
              />
              <ThresholdInput
                label="Fenêtre de temps"
                description="Période pendant laquelle les actions sont comptées"
                value={thresholds.rapidActionsWindowMinutes}
                onChange={(v) => updateThreshold('rapidActionsWindowMinutes', v)}
                suffix="min"
              />
            </div>
          </div>

          <Separator />

          {/* Modifications de statut en masse */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Modifications de Statut en Masse
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <ThresholdInput
                label="Nombre de modifications"
                description="Nombre minimum de changements de statut"
                value={thresholds.massStatusChangesCount}
                onChange={(v) => updateThreshold('massStatusChangesCount', v)}
                suffix="modifs"
              />
              <ThresholdInput
                label="Fenêtre de temps"
                description="Période pendant laquelle les modifications sont comptées"
                value={thresholds.massStatusChangesWindowMinutes}
                onChange={(v) => updateThreshold('massStatusChangesWindowMinutes', v)}
                suffix="min"
              />
            </div>
          </div>

          <Separator />

          {/* Rejets multiples */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Rejets Multiples (Critique)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <ThresholdInput
                label="Nombre de rejets"
                description="Nombre minimum de rejets pour déclencher une alerte critique"
                value={thresholds.massRejectionsCount}
                onChange={(v) => updateThreshold('massRejectionsCount', v)}
                suffix="rejets"
              />
              <ThresholdInput
                label="Fenêtre de temps"
                description="Période pendant laquelle les rejets sont comptés"
                value={thresholds.massRejectionsWindowMinutes}
                onChange={(v) => updateThreshold('massRejectionsWindowMinutes', v)}
                suffix="min"
              />
            </div>
          </div>

          <Separator />

          {/* Résolutions rapides */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              Résolutions Rapides
            </h4>
            <div className="pl-6">
              <ThresholdInput
                label="Délai minimum"
                description="Temps minimum entre consultation et résolution pour ne pas déclencher d'alerte"
                value={thresholds.quickResolutionMinutes}
                onChange={(v) => updateThreshold('quickResolutionMinutes', v)}
                suffix="min"
                min={1}
                max={60}
              />
            </div>
          </div>

          <Separator />

          {/* Heures hors bureau */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Activité Hors Heures Normales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <ThresholdInput
                label="Heure de début"
                description="Début de la plage horaire hors bureau (0-23)"
                value={thresholds.offHoursStart}
                onChange={(v) => updateThreshold('offHoursStart', v)}
                suffix="h"
                min={0}
                max={23}
              />
              <ThresholdInput
                label="Heure de fin"
                description="Fin de la plage horaire hors bureau (0-23)"
                value={thresholds.offHoursEnd}
                onChange={(v) => updateThreshold('offHoursEnd', v)}
                suffix="h"
                min={0}
                max={23}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences de notification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications Push
          </CardTitle>
          <CardDescription>
            Configurez les notifications en temps réel pour chaque niveau de sévérité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationToggle
            label="Critique"
            description="Recevoir des notifications pour les alertes critiques (rejets multiples)"
            checked={thresholds.enableCriticalNotifications}
            onCheckedChange={(v) => updateThreshold('enableCriticalNotifications', v)}
            severity="critical"
          />
          <NotificationToggle
            label="Attention"
            description="Recevoir des notifications pour les alertes d'attention (actions rapides, modifications en masse)"
            checked={thresholds.enableWarningNotifications}
            onCheckedChange={(v) => updateThreshold('enableWarningNotifications', v)}
            severity="warning"
          />
          <NotificationToggle
            label="Info"
            description="Recevoir des notifications pour les alertes informatives (hors heures, résolutions rapides)"
            checked={thresholds.enableInfoNotifications}
            onCheckedChange={(v) => updateThreshold('enableInfoNotifications', v)}
            severity="info"
          />

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              {thresholds.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-muted-foreground" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label className="font-medium">Son de notification</Label>
                <p className="text-sm text-muted-foreground">
                  Jouer un son lors de la réception d'une alerte critique
                </p>
              </div>
            </div>
            <Switch
              checked={thresholds.soundEnabled}
              onCheckedChange={(v) => updateThreshold('soundEnabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Résumé des seuils actifs */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="bg-background">
              <Zap className="h-3 w-3 mr-1" />
              ≥{thresholds.rapidActionsCount} actions / {thresholds.rapidActionsWindowMinutes}min
            </Badge>
            <Badge variant="outline" className="bg-background">
              <TrendingUp className="h-3 w-3 mr-1" />
              ≥{thresholds.massStatusChangesCount} modifs / {thresholds.massStatusChangesWindowMinutes}min
            </Badge>
            <Badge variant="outline" className="bg-background">
              <AlertCircle className="h-3 w-3 mr-1" />
              ≥{thresholds.massRejectionsCount} rejets / {thresholds.massRejectionsWindowMinutes}min
            </Badge>
            <Badge variant="outline" className="bg-background">
              <Clock className="h-3 w-3 mr-1" />
              Résolution &lt;{thresholds.quickResolutionMinutes}min
            </Badge>
            <Badge variant="outline" className="bg-background">
              <Clock className="h-3 w-3 mr-1" />
              Hors heures: {thresholds.offHoursStart}h-{thresholds.offHoursEnd}h
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAlertThresholdsSettings;
