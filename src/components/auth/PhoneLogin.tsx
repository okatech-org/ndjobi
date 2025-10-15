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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getDashboardUrl } from '@/lib/roleUtils';
import { phoneFormats, getPhoneErrorMessage } from '@/lib/phoneValidation';
import { userPersistence } from '@/services/userPersistence';

// Fonction pour créer un schéma dynamique basé sur le pays
const createLoginSchema = (countryCode: string) => {
  const format = phoneFormats[countryCode];
  const minDigits = format?.minDigits || 8;
  const maxDigits = format?.maxDigits || 15;
  const pattern = format?.pattern || /^\d{8,15}$/;
  
  return z.object({
    countryCode: z.string().min(1, { message: 'Sélectionnez un indicatif' }),
    phoneNumber: z.string()
      .trim()
      .regex(pattern, { message: getPhoneErrorMessage(countryCode) }),
    pin: z.string()
      .length(6, { message: 'Le code PIN doit contenir 6 chiffres' })
      .regex(/^\d+$/, { message: 'Le code PIN ne doit contenir que des chiffres' }),
  });
};

type LoginFormData = {
  countryCode: string;
  phoneNumber: string;
  pin: string;
};

export const PhoneLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+241');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(countryCode)),
    defaultValues: {
      countryCode: '+241',
    },
  });

  // Mettre à jour le schéma quand le pays change
  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    setValue('countryCode', newCountryCode);
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const fullPhone = `${data.countryCode}${data.phoneNumber}`;
      
      // Convertir le numéro en email pour l'authentification
      const email = `${fullPhone.replace('+', '')}@ndjobi.ga`;
      
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion...
          </>
        ) : (
          'Se connecter'
        )}
      </Button>
    </form>
  );
};
