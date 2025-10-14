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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getDashboardUrl } from '@/lib/roleUtils';

const signupSchema = z.object({
  countryCode: z.string().min(1, { message: 'Sélectionnez un indicatif' }),
  phoneNumber: z.string()
    .trim()
    .regex(/^\d{9,}$/, { message: 'Numéro de téléphone invalide (9 chiffres minimum)' })
    .max(15, { message: 'Numéro trop long' }),
  pin: z.string()
    .length(6, { message: 'Le code PIN doit contenir 6 chiffres' })
    .regex(/^\d+$/, { message: 'Le code PIN ne doit contenir que des chiffres' }),
  confirmPin: z.string(),
}).refine((data) => data.pin === data.confirmPin, {
  message: 'Les codes PIN ne correspondent pas',
  path: ['confirmPin'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const PhoneSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+241');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      countryCode: '+241',
    },
  });

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
      }

      toast({
        title: 'Compte créé !',
        description: 'Bienvenue sur NDJOBI',
      });

      navigate(getDashboardUrl('user'));
      
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
              <SelectItem value="+1">🇺🇸🇨🇦 +1</SelectItem>
              <SelectItem value="+86">🇨🇳 +86</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-phone"
              type="tel"
              placeholder="XX XXX XXXX"
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
