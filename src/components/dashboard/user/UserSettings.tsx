import { useEffect, useMemo, useState } from 'react';
import { Bell, Shield, Eye, Globe, Smartphone, Mail, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { z } from 'zod';

type SettingsState = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  reportUpdates: boolean;
  projectUpdates: boolean;
  securityAlerts: boolean;
  profileVisibility: 'private' | 'agents' | 'public';
  showEmail: boolean;
  showPhone: boolean;
  anonymousReports: boolean;
  language: 'fr' | 'en';
  theme: 'light' | 'dark' | 'system';
  timezone: string;
};

const defaultSettings: SettingsState = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    reportUpdates: true,
    projectUpdates: true,
    securityAlerts: true,
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    anonymousReports: true,
    language: 'fr',
    theme: 'system',
    timezone: 'Africa/Libreville',
};

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Mot de passe trop court (min 8 caractères)'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Les mots de passe ne correspondent pas',
});

const pinSchema = z.object({
  pin: z.string().length(6, 'Le code PIN doit contenir 6 chiffres').regex(/^\d+$/, 'Uniquement des chiffres'),
  confirmPin: z.string(),
}).refine((data) => data.pin === data.confirmPin, {
  path: ['confirmPin'],
  message: 'Les codes PIN ne correspondent pas',
});

export const UserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [initialLoading, setInitialLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<keyof SettingsState | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinForm, setPinForm] = useState({ pin: '', confirmPin: '' });
  const [pinErrors, setPinErrors] = useState<{ pin?: string; confirmPin?: string }>({});
  const [pinLoading, setPinLoading] = useState(false);

  const mapToRow = useMemo(() => (s: SettingsState) => ({
    user_id: user?.id,
    email_notifications: s.emailNotifications,
    sms_notifications: s.smsNotifications,
    push_notifications: s.pushNotifications,
    report_updates: s.reportUpdates,
    project_updates: s.projectUpdates,
    security_alerts: s.securityAlerts,
    profile_visibility: s.profileVisibility,
    show_email: s.showEmail,
    show_phone: s.showPhone,
    anonymous_reports: s.anonymousReports,
    language: s.language,
    theme: s.theme,
    timezone: s.timezone,
  }), [user?.id]);

  const mapFromRow = (row: any): SettingsState => ({
    emailNotifications: !!row?.email_notifications,
    smsNotifications: !!row?.sms_notifications,
    pushNotifications: !!row?.push_notifications,
    reportUpdates: !!row?.report_updates,
    projectUpdates: !!row?.project_updates,
    securityAlerts: !!row?.security_alerts,
    profileVisibility: (row?.profile_visibility || 'private') as SettingsState['profileVisibility'],
    showEmail: !!row?.show_email,
    showPhone: !!row?.show_phone,
    anonymousReports: !!row?.anonymous_reports,
    language: (row?.language || 'fr') as SettingsState['language'],
    theme: (row?.theme || 'system') as SettingsState['theme'],
    timezone: row?.timezone || 'Africa/Libreville',
  });

  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.id) return;
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (data) setSettings(mapFromRow(data));

        const { data: pinData } = await supabase
          .from('user_pins')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        setIs2FAEnabled(!!pinData?.id);
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Erreur de chargement', description: e?.message || 'Impossible de charger vos paramètres' });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleSettingChange = async (key: keyof SettingsState, value: any) => {
    const next = { ...settings, [key]: value } as SettingsState;
    setSettings(next);
    if (!user?.id) return;
    setSavingKey(key);
    try {
      const row = mapToRow(next);
      const { error } = await supabase.from('user_settings').upsert(row, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Paramètre mis à jour', description: 'Votre préférence a été enregistrée.' });
    } catch (e: any) {
      setSettings((prev) => ({ ...prev, [key]: settings[key] } as SettingsState));
      toast({ variant: 'destructive', title: 'Échec de la mise à jour', description: e?.message || 'Réessayez plus tard' });
    } finally {
      setSavingKey(null);
    }
  };

  const submitPassword = async () => {
    const parsed = passwordSchema.safeParse(passwordForm);
    if (!parsed.success) {
      const fieldErrors: any = {};
      parsed.error.issues.forEach((i) => { if (i.path[0]) fieldErrors[i.path[0]] = i.message; });
      setPasswordErrors(fieldErrors);
      return;
    }
    setPasswordErrors({});
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      toast({ title: 'Mot de passe mis à jour', description: 'Votre mot de passe a été modifié.' });
      setPasswordDialogOpen(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: e?.message || 'Impossible de changer le mot de passe' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const submitPin = async () => {
    const parsed = pinSchema.safeParse(pinForm);
    if (!parsed.success) {
      const fieldErrors: any = {};
      parsed.error.issues.forEach((i) => { if (i.path[0]) fieldErrors[i.path[0]] = i.message; });
      setPinErrors(fieldErrors);
      return;
    }
    setPinErrors({});
    setPinLoading(true);
    try {
      if (!user?.id) throw new Error('Utilisateur introuvable');
      const pinHash = btoa(pinForm.pin);
      const { error } = await supabase.from('user_pins').upsert({ user_id: user.id, pin_hash: pinHash });
      if (error) throw error;
      setIs2FAEnabled(true);
      toast({ title: '2FA configurée', description: 'Votre code PIN a été enregistré.' });
      setPinDialogOpen(false);
      setPinForm({ pin: '', confirmPin: '' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: e?.message || 'Impossible de configurer le PIN' });
    } finally {
      setPinLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      if (!user?.id) throw new Error('Utilisateur introuvable');
      const { error } = await supabase.from('user_pins').delete().eq('user_id', user.id);
      if (error) throw error;
      setIs2FAEnabled(false);
      toast({ title: '2FA désactivée', description: 'Vous pouvez la reconfigurer à tout moment.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: e?.message || 'Impossible de désactiver la 2FA' });
    }
  };

  const requestAccountDeletion = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ data: { delete_requested_at: new Date().toISOString() } as any });
      if (error) throw error;
      toast({ title: 'Demande envoyée', description: 'Un administrateur traitera votre demande.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Suppression impossible', description: e?.message || "Contactez le support" });
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Gérez comment vous souhaitez être informé</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez des mises à jour importantes par email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                disabled={savingKey === 'emailNotifications'}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smsNotifications">Notifications SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Alertes urgentes par SMS
                </p>
              </div>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                disabled={savingKey === 'smsNotifications'}
                onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications">Notifications push</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications en temps réel dans le navigateur
                </p>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                disabled={savingKey === 'pushNotifications'}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <p className="text-sm font-medium">Types de notifications</p>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reportUpdates">Mises à jour des signalements</Label>
                <p className="text-sm text-muted-foreground">
                  Statut et suivi de vos signalements
                </p>
              </div>
              <Switch
                id="reportUpdates"
                checked={settings.reportUpdates}
                onCheckedChange={(checked) => handleSettingChange('reportUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="projectUpdates">Mises à jour des projets</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications sur vos projets protégés
                </p>
              </div>
              <Switch
                id="projectUpdates"
                checked={settings.projectUpdates}
                onCheckedChange={(checked) => handleSettingChange('projectUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="securityAlerts">Alertes de sécurité</Label>
                <p className="text-sm text-muted-foreground">
                  Connexions suspectes et activités inhabituelles
                </p>
              </div>
              <Switch
                id="securityAlerts"
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => handleSettingChange('securityAlerts', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidentialité */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Confidentialité</CardTitle>
              <CardDescription>Contrôlez vos informations personnelles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileVisibility">Visibilité du profil</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value) => handleSettingChange('profileVisibility', value)}
              >
                <SelectTrigger id="profileVisibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Privé - Visible uniquement par vous</SelectItem>
                  <SelectItem value="agents">Agents DGSS uniquement</SelectItem>
                  <SelectItem value="public">Public - Visible par tous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showEmail">Afficher l'email</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux agents de voir votre email
                </p>
              </div>
              <Switch
                id="showEmail"
                checked={settings.showEmail}
                disabled={savingKey === 'showEmail'}
                onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymousReports">Signalements anonymes par défaut</Label>
                <p className="text-sm text-muted-foreground">
                  Toujours taper le Ndjobi de manière anonyme
                </p>
              </div>
              <Switch
                id="anonymousReports"
                checked={settings.anonymousReports}
                disabled={savingKey === 'anonymousReports'}
                onCheckedChange={(checked) => handleSettingChange('anonymousReports', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Préférences</CardTitle>
              <CardDescription>Personnalisez votre expérience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleSettingChange('language', value)}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Thème</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => handleSettingChange('theme', value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleSettingChange('timezone', value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Libreville">Libreville (GMT+1)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>Protégez votre compte</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Changer le mot de passe</p>
                  <p className="text-sm text-muted-foreground">
                    Dernière modification il y a 3 mois
                  </p>
                </div>
              </div>
              <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogTrigger asChild>
              <Button variant="outline">Modifier</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Changer le mot de passe</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))} />
                      {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer</Label>
                      <Input id="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
                      {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Annuler</Button>
                    <Button onClick={submitPassword} disabled={passwordLoading}>
                      {passwordLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>) : 'Enregistrer'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Authentification à deux facteurs</p>
                  <p className="text-sm text-muted-foreground">
                    {is2FAEnabled ? '2FA activée' : 'Ajoutez une couche de sécurité supplémentaire'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {is2FAEnabled && (
                  <Button variant="outline" onClick={disable2FA}>Désactiver</Button>
                )}
                <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                  <DialogTrigger asChild>
              <Button variant="outline">Configurer</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{is2FAEnabled ? 'Mettre à jour le PIN' : 'Configurer le PIN (2FA)'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="pin">PIN (6 chiffres)</Label>
                        <Input id="pin" type="password" inputMode="numeric" maxLength={6} value={pinForm.pin} onChange={(e) => setPinForm((f) => ({ ...f, pin: e.target.value }))} />
                        {pinErrors.pin && <p className="text-xs text-destructive">{pinErrors.pin}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPin">Confirmer le PIN</Label>
                        <Input id="confirmPin" type="password" inputMode="numeric" maxLength={6} value={pinForm.confirmPin} onChange={(e) => setPinForm((f) => ({ ...f, confirmPin: e.target.value }))} />
                        {pinErrors.confirmPin && <p className="text-xs text-destructive">{pinErrors.confirmPin}</p>}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPinDialogOpen(false)}>Annuler</Button>
                      <Button onClick={submitPin} disabled={pinLoading}>
                        {pinLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>) : 'Enregistrer'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email de récupération</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Badge variant="outline">Vérifié</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone dangereuse */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
              <CardDescription>Actions irréversibles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              La suppression de votre compte est définitive et entraînera la perte de tous vos 
              signalements et projets protégés.
            </AlertDescription>
          </Alert>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4">Supprimer mon compte</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Votre demande sera transmise aux administrateurs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={requestAccountDeletion}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
