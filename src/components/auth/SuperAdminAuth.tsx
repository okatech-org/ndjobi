import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, EyeOff, Smartphone, Mail, AlertCircle, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { biometricAuth } from '@/services/biometricAuth';
import { superAdminCodeService } from '@/services/auth/superAdminCodeService';
import { twilioVerifyService } from '@/services/twilioVerifyService';

interface SuperAdminAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminAuth = ({ isOpen, onClose }: SuperAdminAuthProps) => {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showSendCode, setShowSendCode] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [lastMethod, setLastMethod] = useState<'sms' | 'whatsapp' | 'email' | null>(null);
  const [fallbackInfo, setFallbackInfo] = useState<string | null>(null);

  const { toast } = useToast();
  const { signInSuperAdmin, isLoading, error: authError, clearError } = useAuth();
  const contactInfo = superAdminCodeService.getContactInfo();

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await biometricAuth.checkCapabilities();
      setBiometricAvailable(available);
    };
    checkBiometric();
  }, []);

  // Countdown timer pour le code
  useEffect(() => {
    if (!codeSent || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setCodeSent(false);
          toast({
            variant: 'destructive',
            title: 'Code expiré',
            description: 'Le code a expiré. Veuillez en demander un nouveau.',
          });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [codeSent, timeRemaining, toast]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      const channel = lastMethod || 'sms';
      const to = channel === 'email' ? contactInfo.email : contactInfo.phone;
      if (!to) {
        toast({ variant: 'destructive', title: 'Contact manquant', description: 'Aucun destinataire configuré' });
        return;
      }

      // Vérifier le code OTP via Twilio Verify
      const verifyRes = await twilioVerifyService.check(to, code);
      if (!verifyRes.success || verifyRes.valid !== true) {
        toast({ variant: 'destructive', title: 'Code invalide', description: verifyRes.error || 'Le code OTP est invalide' });
        return;
      }

      // OTP validé: on utilise le code attendu par signInSuperAdmin depuis l'env
      const envCode = import.meta.env.VITE_SUPER_ADMIN_CODE as string;
      const result = await signInSuperAdmin(envCode);
      if (result.success) {
        toast({ title: 'Authentification réussie', description: 'Bienvenue dans l\'espace Super Admin' });
        onClose();
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err?.message || 'Vérification OTP impossible' });
    }
  };

  const handleSendCode = async (method: 'sms' | 'whatsapp' | 'email') => {
    setIsSendingCode(true);
    clearError();

    try {
      const to = method === 'email' ? contactInfo.email : contactInfo.phone;
      const startRes = await twilioVerifyService.start(to, method);
      if (!startRes.success) throw new Error(startRes.error || 'Échec envoi OTP');
      setLastMethod(method);
      setCodeSent(true);
      setShowSendCode(false);
      setTimeRemaining(10 * 60); // 10 minutes (Aligné avec la conf courante)

      const methodLabel = method === 'sms' ? 'SMS' : method === 'whatsapp' ? 'WhatsApp' : 'Email';
      toast({ title: 'Code envoyé', description: `Un code d'accès a été envoyé par ${methodLabel}.` });
    } catch (error: any) {
      // Fallback automatique vers E-mail en cas d'échec (CORS / réseau / canal bloqué)
      try {
        if (method !== 'email') {
          const emailRes = await twilioVerifyService.start(contactInfo.email, 'email');
          if (emailRes.success) {
            setLastMethod('email');
            setCodeSent(true);
            setShowSendCode(false);
            setTimeRemaining(10 * 60);
            setFallbackInfo("Nous avons détecté un blocage d'envoi. Un code vous a été envoyé par e‑mail.");
            toast({ title: 'Code envoyé par e‑mail', description: `Nous avons basculé automatiquement sur l'e‑mail: ${contactInfo.email}` });
            return;
          }
        }
        toast({ variant: 'destructive', title: 'Erreur', description: error?.message || 'Impossible d\'envoyer le code' });
      } catch (fallbackErr: any) {
        toast({ variant: 'destructive', title: 'Erreur', description: fallbackErr?.message || 'Impossible d\'envoyer le code' });
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleBiometricAuth = async () => {
    clearError();
    
    const biometricResult = await biometricAuth.authenticateBiometric();
    
    if (biometricResult.success) {
      const storedCode = localStorage.getItem('ndjobi_super_admin_code_encrypted');
      if (storedCode) {
        const result = await signInSuperAdmin(storedCode);
        if (result.success) {
          onClose();
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Code non trouvé',
          description: 'Veuillez vous authentifier une fois avec le code',
        });
      }
    }
  };

  const resetForm = () => {
    setCode('');
    setShowCode(false);
    setShowSendCode(false);
    setCodeSent(false);
    setTimeRemaining(0);
    clearError();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
            Authentification Super Admin
          </DialogTitle>
          <DialogDescription className="text-center">
            Accès sécurisé à l'administration système
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showSendCode ? (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="super-admin-code">
                  Code d'authentification
                </Label>
                <div className="relative">
                  <Input
                    id="super-admin-code"
                    type={showCode ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Saisissez le code à 6 chiffres"
                    className="pr-10"
                    autoComplete="off"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {codeSent && timeRemaining > 0 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Code expire dans {formatTime(timeRemaining)}
                  </p>
                )}
              </div>

              {authError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
            {fallbackInfo && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fallbackInfo}</AlertDescription>
              </Alert>
            )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !code || code.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Lock className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Valider le code
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSendCode(true)}
                  disabled={isLoading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {codeSent ? 'Renvoyer un code' : 'Recevoir un code'}
                </Button>

                {biometricAvailable && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBiometricAuth}
                    disabled={isLoading}
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    Face ID / Touch ID
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Choisissez comment recevoir votre code d'accès
                </p>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                  <p className="font-medium mb-1">Informations de contact :</p>
                  <p>📱 {contactInfo.phone}</p>
                  <p>📧 {contactInfo.email}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSendCode('sms')}
                  disabled={isSendingCode}
                >
                  <Smartphone className="mr-2 h-5 w-5" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">SMS</div>
                    <div className="text-xs text-muted-foreground">
                      {contactInfo.phone}
                    </div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSendCode('whatsapp')}
                  disabled={isSendingCode}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">WhatsApp</div>
                    <div className="text-xs text-muted-foreground">
                      {contactInfo.phone}
                    </div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSendCode('email')}
                  disabled={isSendingCode}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Email</div>
                    <div className="text-xs text-muted-foreground">
                      {contactInfo.email}
                    </div>
                  </div>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                En cas d'échec sur SMS/WhatsApp, un envoi par e‑mail pourra être tenté automatiquement.
              </p>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setShowSendCode(false)}
                disabled={isSendingCode}
              >
                Retour
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
