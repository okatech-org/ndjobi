import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Phone, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { phoneFormats, getPhoneErrorMessage } from '@/lib/phoneValidation';
import { supabase } from '@/integrations/supabase/client';
import { userPersistence } from '@/services/userPersistence';
import { twilioVerifyService } from '@/services/twilioVerifyService';

// Fonction pour créer un schéma dynamique basé sur le pays
const createLoginSchema = (countryCode: string) => {
  const format = phoneFormats[countryCode];
  const minDigits = format?.minDigits || 8;
  const maxDigits = format?.maxDigits || 15;
  const pattern = format?.pattern || /^\d{8,15}$/;
  
  return z.object({
    channel: z.enum(['sms', 'whatsapp', 'email']).default('sms'),
    countryCode: z.string().min(1, { message: 'Sélectionnez un indicatif' }),
    phoneNumber: z.string()
      .trim()
      .regex(pattern, { message: getPhoneErrorMessage(countryCode) }),
    emailAddress: z.string().email({ message: 'E-mail invalide' }).optional(),
    pin: z.string()
      .length(6, { message: 'Le code PIN doit contenir 6 chiffres' })
      .regex(/^\d+$/, { message: 'Le code PIN ne doit contenir que des chiffres' }),
    otpCode: z.string().length(6, { message: 'Code OTP à 6 chiffres' }).optional(),
  });
};

type LoginFormData = {
  channel: 'sms' | 'whatsapp' | 'email';
  countryCode: string;
  phoneNumber: string;
  emailAddress?: string;
  pin: string;
  otpCode?: string;
};

const getDashboardUrl = (role: string): string => {
  switch (role) {
    case 'super_admin':
      return '/dashboard/super-admin';
    case 'admin':
      return '/dashboard/admin';
    case 'agent':
      return '/dashboard/agent';
    default:
      return '/dashboard/user';
  }
};

export const PhoneLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+241');
  const [channel, setChannel] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otpVerified, setOtpVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(countryCode)),
    defaultValues: {
      channel: 'sms',
      countryCode: '+241',
    },
  });

  // Mettre à jour le schéma quand le pays change
  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    setValue('countryCode', newCountryCode);
  };

  const handleChannelChange = (newChannel: 'sms' | 'whatsapp' | 'email') => {
    setChannel(newChannel);
    setValue('channel', newChannel);
  };

  const buildTo = (data: LoginFormData): string => {
    if (data.channel === 'email') {
      return (data.emailAddress || '').trim();
    }
    return `${data.countryCode}${data.phoneNumber}`;
  };

  const onRequestOtp = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const to = buildTo(data);
      if (!to) throw new Error('Destinataire manquant');
      const res = await twilioVerifyService.start(to, data.channel);
      if (!res.success) throw new Error(res.error || 'Échec envoi OTP');
      toast({ title: 'Code envoyé', description: `Vérifiez votre ${data.channel === 'email' ? 'e-mail' : data.channel}` });
      setStep('verify');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: e?.message || 'Échec envoi OTP' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const fullPhone = `${data.countryCode}${data.phoneNumber}`;
      
      if (!otpVerified) {
        if (!data.otpCode || data.otpCode.length !== 6) {
          throw new Error('Entrez le code OTP reçu');
        }
        const to = data.channel === 'email' ? (data.emailAddress || '').trim() : fullPhone;
        const vr = await twilioVerifyService.check(to, data.otpCode);
        if (!vr.success || vr.valid !== true) {
          throw new Error(vr.error || 'Code OTP invalide');
        }
        setOtpVerified(true);
      }

      // Convertir le numéro en email pour l'authentification
      const email = `${fullPhone.replace('+', '')}@ndjobi.com`;
      
      // Authentification avec email + PIN (password)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: data.pin,
      });

      if (signInError) {
        console.error('Auth error:', signInError);
        throw new Error('Numéro ou code PIN incorrect');
      }

      // Récupérer le rôle de l'utilisateur
      let dashboardUrl = '/dashboard/user';
      let userRole = 'user';
      if (signInData?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', signInData.user.id)
          .order('role', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (roleData?.role) {
          userRole = roleData.role;
          dashboardUrl = getDashboardUrl(roleData.role);
        }

        // Enregistrer les données utilisateur pour l'authentification PWA
        await userPersistence.storeUser({
          id: signInData.user.id,
          phoneNumber: data.phoneNumber,
          countryCode: data.countryCode,
          fullName: signInData.user.user_metadata?.full_name || `User ${data.phoneNumber}`,
          role: userRole
        });
      }

      toast({
        title: 'Connexion réussie !',
        description: 'Bienvenue sur NDJOBI',
      });
      
      const action = searchParams.get('action');
      if (action) {
        navigate(`${dashboardUrl}?action=${action}`);
      } else {
        navigate(dashboardUrl);
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error?.message || 'Numéro ou code PIN incorrect',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="channel">Canal de vérification</Label>
        <Select value={channel} onValueChange={(v) => handleChannelChange(v as any)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register('channel')} value={channel} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-phone">Numéro de téléphone</Label>
        <div className="flex gap-2">
          <Select value={countryCode} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {Object.values(phoneFormats).map((format) => (
                <SelectItem key={format.countryCode} value={format.countryCode}>
                  {format.flag} {format.countryCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-phone"
              type="tel"
              placeholder={phoneFormats[countryCode]?.example || "XX XXX XXXX"}
              className="pl-10"
              {...register('phoneNumber')}
            />
            <input type="hidden" {...register('countryCode')} value={countryCode} />
          </div>
        </div>
        {errors.phoneNumber && (
          <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
        )}
      </div>

      {channel === 'email' && (
        <div className="space-y-2">
          <Label htmlFor="email">E-mail pour OTP</Label>
          <Input id="email" type="email" placeholder="votre@email.com" {...register('emailAddress')} />
          {errors.emailAddress && (
            <p className="text-xs text-destructive">{String(errors.emailAddress.message)}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="pin">Code PIN (6 chiffres)</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            className="pl-10"
            {...register('pin')}
          />
        </div>
        {errors.pin && (
          <p className="text-xs text-destructive">{errors.pin.message}</p>
        )}
      </div>

      {step === 'verify' && (
        <div className="space-y-2">
          <Label htmlFor="otp">Code OTP reçu</Label>
          <Input id="otp" type="text" inputMode="numeric" maxLength={6} placeholder="123456" {...register('otpCode')} />
          {errors.otpCode && (
            <p className="text-xs text-destructive">{String(errors.otpCode.message)}</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={handleSubmit(onRequestOtp)} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi...
            </>
          ) : (
            'Envoyer le code'
          )}
        </Button>

        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Vérification...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
      </div>
    </form>
  );
};
