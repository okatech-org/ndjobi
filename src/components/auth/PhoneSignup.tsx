import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Phone, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const phoneSchema = z.object({
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Numéro de téléphone invalide (format: +242XXXXXXXXX)' })
    .max(20, { message: 'Numéro trop long' }),
});

const pinSchema = z.object({
  pin: z.string()
    .length(6, { message: 'Le code PIN doit contenir 6 chiffres' })
    .regex(/^\d+$/, { message: 'Le code PIN ne doit contenir que des chiffres' }),
  confirmPin: z.string(),
}).refine((data) => data.pin === data.confirmPin, {
  message: 'Les codes PIN ne correspondent pas',
  path: ['confirmPin'],
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type PinFormData = z.infer<typeof pinSchema>;

export const PhoneSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp' | 'pin'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const {
    register: registerPin,
    handleSubmit: handleSubmitPin,
    formState: { errors: pinErrors },
  } = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
  });

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: data.phone,
      });

      if (error) throw error;

      setPhoneNumber(data.phone);
      setStep('otp');
      toast({
        title: 'Code envoyé !',
        description: 'Vérifiez votre SMS pour le code de vérification',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.message || 'Impossible d\'envoyer le code',
      });
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async () => {
    if (otpCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Code invalide',
        description: 'Le code doit contenir 6 chiffres',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpCode,
        type: 'sms',
      });

      if (error) throw error;

      setStep('pin');
      toast({
        title: 'Téléphone vérifié !',
        description: 'Créez maintenant votre code PIN à 6 chiffres',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Code invalide',
        description: error?.message || 'Vérifiez le code et réessayez',
      });
    } finally {
      setLoading(false);
    }
  };

  const onPinSubmit = async (data: PinFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Hash the PIN (using simple hash for demo, use bcrypt in production)
      const pinHash = btoa(data.pin);

      const { error } = await supabase
        .from('user_pins')
        .insert({
          user_id: user.id,
          pin_hash: pinHash,
        });

      if (error) throw error;

      toast({
        title: 'Inscription réussie !',
        description: 'Votre compte a été créé avec succès',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.message || 'Impossible de créer le code PIN',
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <form onSubmit={handleSubmitPhone(onPhoneSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+242 XX XXX XXXX"
              className="pl-10"
              {...registerPhone('phone')}
            />
          </div>
          {phoneErrors.phone && (
            <p className="text-xs text-destructive">{phoneErrors.phone.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi...
            </>
          ) : (
            'Envoyer le code'
          )}
        </Button>
      </form>
    );
  }

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Code de vérification</Label>
          <p className="text-sm text-muted-foreground">
            Entrez le code à 6 chiffres envoyé au {phoneNumber}
          </p>
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            className="w-full"
          >
            <InputOTPGroup className="w-full gap-2">
              <InputOTPSlot index={0} className="flex-1" />
              <InputOTPSlot index={1} className="flex-1" />
              <InputOTPSlot index={2} className="flex-1" />
              <InputOTPSlot index={3} className="flex-1" />
              <InputOTPSlot index={4} className="flex-1" />
              <InputOTPSlot index={5} className="flex-1" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button onClick={onOtpSubmit} className="w-full" disabled={loading || otpCode.length !== 6}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Vérification...
            </>
          ) : (
            'Vérifier le code'
          )}
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setStep('phone')}
          disabled={loading}
        >
          Changer de numéro
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitPin(onPinSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pin">Créer un code PIN (6 chiffres)</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            className="pl-10"
            {...registerPin('pin')}
          />
        </div>
        {pinErrors.pin && (
          <p className="text-xs text-destructive">{pinErrors.pin.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPin">Confirmer le code PIN</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            className="pl-10"
            {...registerPin('confirmPin')}
          />
        </div>
        {pinErrors.confirmPin && (
          <p className="text-xs text-destructive">{pinErrors.confirmPin.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création...
          </>
        ) : (
          'Créer mon compte'
        )}
      </Button>
    </form>
  );
};
