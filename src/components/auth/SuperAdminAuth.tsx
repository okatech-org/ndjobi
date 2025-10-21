import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, KeyRound, AlertCircle, Phone, Smartphone, MessageSquare, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { twilioVerifyService } from '@/services/twilioVerifyService';
import { superAdminCodeService } from '@/services/auth/superAdminCodeService';
import { supabase } from '@/integrations/supabase/client';

interface SuperAdminAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminAuth = ({ isOpen, onClose }: SuperAdminAuthProps) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('+33661002616');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [channel, setChannel] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const { toast } = useToast();
  const { signInSuperAdmin, resetSuperAdminPin, isLoading, error: authError, clearError } = useAuth();
  const contactInfo = superAdminCodeService.getContactInfo();
  
  const pinInputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  const otpInputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (!otpSent || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setOtpSent(false);
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
  }, [otpSent, timeRemaining, toast]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      pinInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, refs: any[], state: string[]) => {
    if (e.key === 'Backspace' && !state[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      toast({ 
        variant: 'destructive', 
        title: 'Numéro manquant', 
        description: 'Veuillez saisir votre numéro de téléphone' 
      });
      return;
    }

    setIsSendingOtp(true);
    clearError();

    try {
      const to = channel === 'email' ? contactInfo.email : phoneNumber;
      const startRes = await twilioVerifyService.start(to, channel);
      
      if (!startRes.success) {
        throw new Error(startRes.error || 'Échec envoi OTP');
      }
      
      setOtpSent(true);
      setTimeRemaining(10 * 60);
      setOtpCode(['', '', '', '', '', '']);

      const methodLabel = channel === 'sms' ? 'SMS' : channel === 'whatsapp' ? 'WhatsApp' : 'Email';
      
      toast({ 
        title: 'Code envoyé', 
        description: `Un code de vérification a été envoyé par ${methodLabel}.` 
      });
      
      setTimeout(() => otpInputRefs[0].current?.focus(), 100);
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Erreur', 
        description: error?.message || 'Impossible d\'envoyer le code' 
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpCode.join('');
    if (fullOtp.length !== 6) {
      toast({ 
        variant: 'destructive', 
        title: 'Code incomplet', 
        description: 'Veuillez saisir les 6 chiffres du code OTP' 
      });
      return;
    }

    try {
      const to = channel === 'email' ? contactInfo.email : phoneNumber;
      const verifyRes = await twilioVerifyService.check(to, fullOtp);
      
      if (!verifyRes.success || verifyRes.valid !== true) {
        toast({ 
          variant: 'destructive', 
          title: 'Code invalide', 
          description: verifyRes.error || 'Le code OTP est invalide' 
        });
        setOtpCode(['', '', '', '', '', '']);
        otpInputRefs[0].current?.focus();
        return;
      }

      setOtpVerified(true);
      toast({ 
        title: 'Code vérifié', 
        description: 'Vous pouvez maintenant créer votre nouveau PIN' 
      });
      
      setTimeout(() => pinInputRefs[0].current?.focus(), 100);
    } catch (err: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Erreur', 
        description: err?.message || 'Vérification OTP impossible' 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const fullPin = pin.join('');
    if (fullPin.length !== 6) {
      toast({ 
        variant: 'destructive', 
        title: 'PIN incomplet', 
        description: 'Veuillez saisir les 6 chiffres du PIN' 
      });
      return;
    }

    if (!phoneNumber || phoneNumber.length < 8) {
      toast({ 
        variant: 'destructive', 
        title: 'Numéro manquant', 
        description: 'Veuillez saisir votre numéro de téléphone' 
      });
      return;
    }

    if (mode === 'forgot' && !otpVerified) {
      toast({ 
        variant: 'destructive', 
        title: 'Vérification requise', 
        description: 'Veuillez d\'abord vérifier le code OTP' 
      });
      return;
    }

    try {
      let result;
      
      // Si en mode "forgot", réinitialiser le PIN d'abord
      if (mode === 'forgot' && otpVerified) {
        result = await resetSuperAdminPin(fullPin);
      } else {
        // Mode login normal - passer le numéro de téléphone
        result = await signInSuperAdmin(fullPin, phoneNumber);
      }
     
      if (result.success) {
        toast({ 
          title: mode === 'forgot' ? 'PIN réinitialisé avec succès' : 'Authentification réussie', 
          description: 'Bienvenue dans l\'espace Super Admin' 
        });
        onClose();
      } else {
        toast({ 
          variant: 'destructive', 
          title: 'Erreur d\'authentification', 
          description: result.error || 'Code PIN incorrect' 
        });
        setPin(['', '', '', '', '', '']);
        pinInputRefs[0].current?.focus();
      }
    } catch (err: any) {
      console.error('Erreur authentification Super Admin:', err);
      toast({ 
        variant: 'destructive', 
        title: 'Erreur système', 
        description: err?.message || 'Authentification impossible' 
      });
    }
  };

  const resetForm = () => {
    setPin(['', '', '', '', '', '']);
    setOtpCode(['', '', '', '', '', '']);
    setPhoneNumber('');
    setMode('login');
    setOtpSent(false);
    setOtpVerified(false);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
            Authentification Super Admin
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login' ? 'Accès sécurisé à l\'administration système' : 'Réinitialisation du code PIN'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="phone-number" className="text-sm font-medium">
              Numéro de téléphone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone-number"
                type="tel"
                placeholder="+33 6 61 00 26 16"
                className="pl-10"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={true}
                autoComplete="tel"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Numéro configuré pour le compte Super Admin
            </p>
          </div>

          {mode === 'forgot' && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Canal de réception</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={channel === 'sms' ? 'default' : 'outline'}
                    className="flex-col h-auto py-3 px-2"
                    onClick={() => setChannel('sms')}
                    disabled={isSendingOtp || isLoading || otpVerified}
                  >
                    <Smartphone className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">SMS</span>
                  </Button>

                  <Button
                    type="button"
                    variant={channel === 'whatsapp' ? 'default' : 'outline'}
                    className="flex-col h-auto py-3 px-2"
                    onClick={() => setChannel('whatsapp')}
                    disabled={isSendingOtp || isLoading || otpVerified}
                  >
                    <MessageSquare className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">WhatsApp</span>
                  </Button>

                  <Button
                    type="button"
                    variant={channel === 'email' ? 'default' : 'outline'}
                    className="flex-col h-auto py-3 px-2"
                    onClick={() => setChannel('email')}
                    disabled={isSendingOtp || isLoading || otpVerified}
                  >
                    <Mail className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Email</span>
                  </Button>
                </div>
              </div>

              {!otpVerified && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || isLoading || !phoneNumber}
                >
                  {isSendingOtp ? 'Envoi...' : otpSent ? 'Renvoyer le code' : 'Envoyer le code'}
                </Button>
              )}

              {otpSent && !otpVerified && (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Code envoyé ! Expire dans {formatTime(timeRemaining)}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Code OTP reçu</Label>
                    <div className="flex gap-2 justify-center">
                      {otpCode.map((digit, index) => (
                        <Input
                          key={index}
                          ref={otpInputRefs[index]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e, otpInputRefs, otpCode)}
                          className="w-12 h-14 text-center text-xl font-bold"
                          disabled={isLoading}
                          autoComplete="off"
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="default"
                    className="w-full"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otpCode.join('').length !== 6}
                  >
                    Vérifier le code
                  </Button>
                </>
              )}
            </>
          )}

          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{authError}</AlertDescription>
            </Alert>
          )}

          {(mode === 'login' || otpVerified) && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {mode === 'forgot' ? 'Nouveau code PIN à 6 chiffres' : 'Code PIN à 6 chiffres'}
                </Label>
                <div className="flex gap-2 justify-center">
                  {pin.map((digit, index) => (
                    <Input
                      key={index}
                      ref={pinInputRefs[index]}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e, pinInputRefs, pin)}
                      className="w-12 h-14 text-center text-xl font-bold"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {mode === 'forgot' ? 'Créez votre nouveau PIN' : 'Entrez le code PIN du compte Super Admin'}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || pin.join('').length !== 6}
              >
                {isLoading ? (
                  <>
                    <KeyRound className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    {mode === 'forgot' ? 'Réinitialiser et se connecter' : 'Se connecter'}
                  </>
                )}
              </Button>
            </>
          )}

          {mode === 'login' && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={() => {
                  setMode('forgot');
                  setPin(['', '', '', '', '', '']);
                }}
              >
                PIN oublié ? (Réinitialisation par SMS/WhatsApp)
              </Button>
            </div>
          )}

          {mode === 'forgot' && !otpVerified && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={() => {
                  setMode('login');
                  setOtpSent(false);
                  setOtpCode(['', '', '', '', '', '']);
                }}
              >
                ← Retour à la connexion
              </Button>
            </div>
          )}

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              🔐 Système unifié : Numéro + PIN (6 chiffres)
            </p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Même système que les autres utilisateurs
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
