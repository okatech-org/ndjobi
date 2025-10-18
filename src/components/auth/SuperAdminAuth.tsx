import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Smartphone, Mail, AlertCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { superAdminCodeService } from '@/services/auth/superAdminCodeService';
import { twilioVerifyService } from '@/services/twilioVerifyService';

interface SuperAdminAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminAuth = ({ isOpen, onClose }: SuperAdminAuthProps) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp' | 'email' | null>(null);
  const [fallbackInfo, setFallbackInfo] = useState<string | null>(null);

  const { toast } = useToast();
  const { signInSuperAdmin, isLoading, error: authError, clearError } = useAuth();
  const contactInfo = superAdminCodeService.getContactInfo();
  
  // Refs pour les inputs de code
  const inputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

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

  // Gérer la saisie dans les cases de code
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus sur la case suivante
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Gérer la touche Backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Soumettre le code OTP
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast({ variant: 'destructive', title: 'Code incomplet', description: 'Veuillez saisir les 6 chiffres' });
      return;
    }

    try {
      const channel = selectedChannel || 'sms';
      const to = channel === 'email' ? contactInfo.email : contactInfo.phone;
      if (!to) {
        toast({ variant: 'destructive', title: 'Contact manquant', description: 'Aucun destinataire configuré' });
        return;
      }

      // Vérifier le code OTP via Twilio Verify
      const verifyRes = await twilioVerifyService.check(to, fullCode);
      if (!verifyRes.success || verifyRes.valid !== true) {
        toast({ variant: 'destructive', title: 'Code invalide', description: verifyRes.error || 'Le code OTP est invalide' });
        // Réinitialiser le code
        setCode(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
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
    setSelectedChannel(method);

    try {
      const to = method === 'email' ? contactInfo.email : contactInfo.phone;
      const startRes = await twilioVerifyService.start(to, method);
      if (!startRes.success) throw new Error(startRes.error || 'Échec envoi OTP');
      
      setCodeSent(true);
      setTimeRemaining(10 * 60);
      setCode(['', '', '', '', '', '']);

      const methodLabel = method === 'sms' ? 'SMS' : method === 'whatsapp' ? 'WhatsApp' : 'Email';
      
      toast({ 
        title: 'Code envoyé', 
        description: `Un code d'accès a été envoyé par ${methodLabel}.` 
      });
      
      // Focus sur la première case de code
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    } catch (error: any) {
      // Fallback automatique vers E-mail en cas d'échec
      try {
        if (method !== 'email') {
          const emailRes = await twilioVerifyService.start(contactInfo.email, 'email');
          if (emailRes.success) {
            setSelectedChannel('email');
            setCodeSent(true);
            setTimeRemaining(10 * 60);
            setFallbackInfo("Basculement automatique sur l'e‑mail suite à un blocage d'envoi.");
            
            toast({ 
              title: 'Code envoyé par e‑mail', 
              description: `Envoi automatique sur l'e‑mail` 
            });
            
            setTimeout(() => inputRefs[0].current?.focus(), 100);
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

  const resetForm = () => {
    setCode(['', '', '', '', '', '']);
    setCodeSent(false);
    setTimeRemaining(0);
    setSelectedChannel(null);
    setFallbackInfo(null);
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

  // Masquer les informations sensibles
  const maskPhone = (phone: string) => {
    if (phone.length < 4) return phone;
    return phone.slice(0, -4).replace(/\d/g, '●') + phone.slice(-4);
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    const maskedLocal = local[0] + local.slice(1, -1).replace(/./g, '●') + local.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
            Authentification Super Admin
          </DialogTitle>
          <DialogDescription className="text-center">
            Accès sécurisé à l'administration système
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCodeSubmit} className="space-y-6">
          {/* Sélection du canal - Aligné sur une ligne */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choisir le canal de réception</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={selectedChannel === 'sms' ? 'default' : 'outline'}
                className="flex-col h-auto py-3 px-2"
                onClick={() => handleSendCode('sms')}
                disabled={isSendingCode || isLoading}
              >
                <Smartphone className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">SMS</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {maskPhone(contactInfo.phone)}
                </span>
              </Button>

              <Button
                type="button"
                variant={selectedChannel === 'whatsapp' ? 'default' : 'outline'}
                className="flex-col h-auto py-3 px-2"
                onClick={() => handleSendCode('whatsapp')}
                disabled={isSendingCode || isLoading}
              >
                <MessageSquare className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">WhatsApp</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {maskPhone(contactInfo.phone)}
                </span>
              </Button>

              <Button
                type="button"
                variant={selectedChannel === 'email' ? 'default' : 'outline'}
                className="flex-col h-auto py-3 px-2"
                onClick={() => handleSendCode('email')}
                disabled={isSendingCode || isLoading}
              >
                <Mail className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Email</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">
                  {maskEmail(contactInfo.email)}
                </span>
              </Button>
            </div>
          </div>

          
          {fallbackInfo && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{fallbackInfo}</AlertDescription>
            </Alert>
          )}

          {codeSent && timeRemaining > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Code envoyé ! Expire dans {formatTime(timeRemaining)}
              </AlertDescription>
            </Alert>
          )}

          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{authError}</AlertDescription>
            </Alert>
          )}

          {/* Cases de code à 6 chiffres */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Code d'authentification à 6 chiffres</Label>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold"
                  disabled={!codeSent || isLoading}
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          {/* Bouton de validation */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !codeSent || code.join('').length !== 6}
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

          <p className="text-xs text-center text-muted-foreground">
            En cas d'échec SMS/WhatsApp, un envoi automatique par e‑mail est tenté
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

