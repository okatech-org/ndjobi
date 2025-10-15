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
import { biometricAuth } from '@/services/biometricAuth';

// Fonction pour créer un schéma dynamique basé sur le pays
const createSignupSchema = (countryCode: string) => {
  const format = phoneFormats[countryCode];
  const pattern = format?.pattern || /^\d{8,15}$/;
  
  return z.object({
    countryCode: z.string().min(1, { message: 'Sélectionnez un indicatif' }),
    phoneNumber: z.string()
      .trim()
      .regex(pattern, { message: getPhoneErrorMessage(countryCode) }),
    pin: z.string()
      .length(6, { message: 'Le code PIN doit contenir 6 chiffres' })
      .regex(/^\d+$/, { message: 'Le code PIN ne doit contenir que des chiffres' }),
    confirmPin: z.string(),
  }).refine((data) => data.pin === data.confirmPin, {
    message: 'Les codes PIN ne correspondent pas',
    path: ['confirmPin'],
  });
};

type SignupFormData = {
  countryCode: string;
  phoneNumber: string;
  pin: string;
  confirmPin: string;
};

export const PhoneSignup = () => {
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
  } = useForm<SignupFormData>({
    resolver: zodResolver(createSignupSchema(countryCode)),
    defaultValues: {
      countryCode: '+241',
    },
  });

  // Mettre à jour le schéma quand le pays change
  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    setValue('countryCode', newCountryCode);
  };

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const fullPhone = `${data.countryCode}${data.phoneNumber}`;
      
      // Convertir le numéro en email pour l'authentification
      const email = `${fullPhone.replace('+', '')}@ndjobi.ga`;
      
      // Créer le compte avec email + PIN comme mot de passe
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: data.pin,
        options: {
          data: {
            phone: fullPhone,
            full_name: `User ${data.phoneNumber}`,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error('Ce numéro est déjà utilisé. Essayez de vous connecter.');
        }
        throw signUpError;
      }

      // Se connecter automatiquement
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: data.pin,
      });

      if (signInError) throw signInError;

      // Assigner le rôle user par défaut
      if (signInData?.user) {
        const { error: roleError } = await supabase.rpc('ensure_demo_user_role', {
          _user_id: signInData.user.id,
          _role: 'user'
        });
        if (roleError) console.error('Error assigning role:', roleError);

        // Enregistrer les données utilisateur pour l'authentification PWA
        await userPersistence.storeUser({
          id: signInData.user.id,
          phoneNumber: data.phoneNumber,
          countryCode: data.countryCode,
          fullName: `User ${data.phoneNumber}`,
          role: 'user'
        });

        // Proposer l'enregistrement biométrique si disponible
        const biometricCapabilities = biometricAuth.getCapabilities();
        if (biometricCapabilities.isSupported) {
          try {
            const biometricResult = await biometricAuth.registerBiometric(
              signInData.user.id,
              {
                name: `user_${data.phoneNumber}`,
                displayName: `User ${data.phoneNumber}`
              }
            );
            
            if (biometricResult.success) {
              userPersistence.setBiometricEnabled(true);
              toast({
                title: 'Compte créé !',
                description: 'Authentification biométrique activée. Bienvenue sur NDJOBI !',
              });
            } else {
              toast({
                title: 'Compte créé !',
                description: 'Bienvenue sur NDJOBI !',
              });
            }
          } catch (error) {
            console.warn('Erreur lors de l\'enregistrement biométrique:', error);
            toast({
              title: 'Compte créé !',
              description: 'Bienvenue sur NDJOBI !',
            });
          }
        } else {
          toast({
            title: 'Compte créé !',
            description: 'Bienvenue sur NDJOBI !',
          });
        }
      }

      const action = searchParams.get('action');
      const dashboardUrl = getDashboardUrl('user');
      if (action) {
        navigate(`${dashboardUrl}?action=${action}`);
      } else {
        navigate(dashboardUrl);
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.message || 'Une erreur est survenue',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-phone">Numéro de téléphone</Label>
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
              id="signup-phone"
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
            {...register('pin')}
          />
        </div>
        {errors.pin && (
          <p className="text-xs text-destructive">{errors.pin.message}</p>
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
            {...register('confirmPin')}
          />
        </div>
        {errors.confirmPin && (
          <p className="text-xs text-destructive">{errors.confirmPin.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création en cours...
          </>
        ) : (
          "Créer mon compte"
        )}
      </Button>
    </form>
  );
};
