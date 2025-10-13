import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Phone, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getDashboardUrl } from '@/lib/roleUtils';

const phoneSchema = z.object({
  countryCode: z.string().min(1, { message: 'Sélectionnez un indicatif' }),
  phoneNumber: z.string()
    .trim()
    .regex(/^\d{9,}$/, { message: 'Numéro de téléphone invalide (9 chiffres minimum)' })
    .max(15, { message: 'Numéro trop long' }),
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
  const [countryCode, setCountryCode] = useState('+241');

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: '+241',
      phoneNumber: '',
    },
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
      const fullPhone = `${data.countryCode}${data.phoneNumber}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) throw error;

      setPhoneNumber(fullPhone);
      setStep('otp');
      toast({
        title: 'Code envoyé !',
        description: 'Vérifiez votre SMS pour le code de vérification',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.message || "Impossible d'envoyer le code",
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

      // Fetch user role for redirect (defaults to user role for signups)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      let dashboardUrl = '/dashboard/user';
      if (currentUser) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id)
          .order('role', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (roleData?.role) {
          dashboardUrl = getDashboardUrl(roleData.role);
        }
      }

      toast({
        title: 'Inscription réussie !',
        description: 'Votre compte a été créé avec succès',
      });
      navigate(dashboardUrl);
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
          <div className="flex gap-2">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="+241">🇬🇦 +241</SelectItem>
                <SelectItem value="+242">🇨🇬 +242</SelectItem>
                <SelectItem value="+237">🇨🇲 +237</SelectItem>
                <SelectItem value="+225">🇨🇮 +225</SelectItem>
                <SelectItem value="+33">🇫🇷 +33</SelectItem>
                <SelectItem value="+32">🇧🇪 +32</SelectItem>
                <SelectItem value="+49">🇩🇪 +49</SelectItem>
                <SelectItem value="+44">🇬🇧 +44</SelectItem>
                <SelectItem value="+34">🇪🇸 +34</SelectItem>
                <SelectItem value="+221">🇸🇳 +221</SelectItem>
                <SelectItem value="+212">🇲🇦 +212</SelectItem>
                <SelectItem value="+27">🇿🇦 +27</SelectItem>
                <SelectItem value="+233">🇬🇭 +233</SelectItem>
                <SelectItem value="+240">🇬🇶 +240</SelectItem>
                <SelectItem value="+1">🇺🇸 +1</SelectItem>
                <SelectItem value="+1">🇨🇦 +1</SelectItem>
                <SelectItem value="+86">🇨🇳 +86</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="XX XXX XXXX"
                className="pl-10"
                {...registerPhone('phoneNumber')}
              />
              <input type="hidden" {...registerPhone('countryCode')} value={countryCode} />
            </div>
          </div>
          {phoneErrors.phoneNumber && (
            <p className="text-xs text-destructive">{phoneErrors.phoneNumber.message}</p>
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
