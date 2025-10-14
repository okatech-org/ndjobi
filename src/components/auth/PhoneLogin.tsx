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

const loginSchema = z.object({
  countryCode: z.string().min(1, { message: 'Sélectionnez un indicatif' }),
  phoneNumber: z.string()
    .trim()
    .regex(/^\d{9,}$/, { message: 'Numéro de téléphone invalide (9 chiffres minimum)' })
    .max(15, { message: 'Numéro trop long' }),
  pin: z.string()
    .length(6, { message: 'Le code PIN doit contenir 6 chiffres' })
    .regex(/^\d+$/, { message: 'Le code PIN ne doit contenir que des chiffres' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      countryCode: '+241',
    },
  });

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
      if (signInData?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', signInData.user.id)
          .order('role', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (roleData?.role) {
          dashboardUrl = getDashboardUrl(roleData.role);
        }
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
              id="login-phone"
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
