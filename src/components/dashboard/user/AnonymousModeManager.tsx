import { useState, useEffect } from 'react';
import { Shield, Copy, Download, AlertTriangle, Eye, EyeOff, KeyRound, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { anonymousModeService } from '@/services/anonymousMode';

export const AnonymousModeManager = () => {
  const { toast } = useToast();
  const [hasSession, setHasSession] = useState(false);
  const [showPhrase, setShowPhrase] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [stats, setStats] = useState<{ reports: number; projects: number; daysActive: number } | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    const active = anonymousModeService.hasActiveSession();
    setHasSession(active);
    
    if (active) {
      const sessionStats = anonymousModeService.getSessionStats();
      setStats(sessionStats);
    }
  };

  const handleCreateSession = () => {
    const session = anonymousModeService.generateAnonymousSession();
    setRecoveryPhrase(session.recoveryPhrase);
    setHasSession(true);
    setShowPhrase(true);
    
    toast({
      title: 'Session anonyme créée',
      description: 'Votre phrase de récupération a été générée. Conservez-la précieusement !',
    });

    checkSession();
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(recoveryPhrase);
    toast({
      title: 'Copié !',
      description: 'La phrase de récupération a été copiée dans le presse-papier',
    });
  };

  const handleDownloadPhrase = () => {
    try {
      const exportData = anonymousModeService.exportSession();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ndjobi-anonymous-session-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Exporté',
        description: 'Votre session a été exportée avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter la session',
        variant: 'destructive',
      });
    }
  };

  const handleRecoverSession = () => {
    setIsRecovering(true);
    
    const session = anonymousModeService.recoverSession(recoveryInput.trim().toLowerCase());
    
    if (session) {
      setHasSession(true);
      setRecoveryInput('');
      checkSession();
      
      toast({
        title: 'Récupération réussie',
        description: 'Votre session anonyme a été récupérée avec succès',
      });
    } else {
      toast({
        title: 'Échec de récupération',
        description: 'Phrase de récupération invalide. Veuillez vérifier et réessayer.',
        variant: 'destructive',
      });
    }
    
    setIsRecovering(false);
  };

  const handleClearSession = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre session anonyme ? Cette action est irréversible.')) {
      anonymousModeService.clearSession();
      setHasSession(false);
      setRecoveryPhrase('');
      setStats(null);
      
      toast({
        title: 'Session supprimée',
        description: 'Votre session anonyme a été supprimée',
      });
    }
  };

  if (!hasSession) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Mode Anonyme
            </CardTitle>
            <CardDescription>
              Créez une session anonyme pour protéger votre identité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Qu'est-ce que le mode anonyme ?
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Aucune donnée personnelle requise</li>
                    <li>Identifiant unique généré automatiquement</li>
                    <li>Phrase de récupération pour retrouver vos dossiers</li>
                    <li>Chiffrement complet de vos données</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateSession} className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                Créer une session anonyme
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Récupérer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Récupérer une session anonyme</DialogTitle>
                    <DialogDescription>
                      Entrez votre phrase de récupération de 12 mots
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recovery-phrase">Phrase de récupération</Label>
                      <Textarea
                        id="recovery-phrase"
                        value={recoveryInput}
                        onChange={(e) => setRecoveryInput(e.target.value)}
                        placeholder="mot1 mot2 mot3 ..."
                        rows={4}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Séparez les mots par des espaces
                      </p>
                    </div>

                    <Button 
                      onClick={handleRecoverSession}
                      disabled={isRecovering || !recoveryInput.trim()}
                      className="w-full"
                    >
                      {isRecovering ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Récupération...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Récupérer ma session
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Mode Anonyme Actif
              </CardTitle>
              <CardDescription>
                Votre session est protégée et chiffrée
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Actif
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{stats.reports}</p>
                <p className="text-xs text-muted-foreground">Signalements</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{stats.projects}</p>
                <p className="text-xs text-muted-foreground">Projets</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{stats.daysActive}</p>
                <p className="text-xs text-muted-foreground">Jours</p>
              </div>
            </div>
          )}

          {recoveryPhrase && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Phrase de récupération</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhrase(!showPhrase)}
                >
                  {showPhrase ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Masquer
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Afficher
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <Input
                  readOnly
                  value={showPhrase ? recoveryPhrase : '••••••••••••••••••••••••••••••••'}
                  className="font-mono text-sm pr-20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPhrase}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Important :</strong> Conservez cette phrase en lieu sûr. C'est le seul moyen de récupérer votre session.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDownloadPhrase}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearSession}
            >
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

