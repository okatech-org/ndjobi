import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Phone, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Numéro de téléphone invalide (format: +242XXXXXXXXX)' })
    .max(20, { message: 'Numéro trop long' }),
  pin: z.string()
    .length(6, { message: 'Le code PIN doit contenir 6 chiffres' })
    .regex(/^\d+$/, { message: 'Le code PIN ne doit contenir que des chiffres' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const PhoneLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      // First, get user by phone number
      const { data: { user }, error: userError } = await supabase.auth.signInWithOtp({
        phone: data.phone,
        options: {
          shouldCreateUser: false,
        },
      });

      if (userError) throw userError;

      // Verify PIN via edge function
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-pin', {
        body: {
          phone: data.phone,
          pin: data.pin,
        },
      });

      if (verifyError || !verifyResult?.success) {
        throw new Error('Code PIN incorrect');
      }

      toast({
        title: 'Connexion réussie !',
        description: 'Vous êtes maintenant connecté',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error?.message || 'Vérifiez vos identifiants',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-phone">Numéro de téléphone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-phone"
            type="tel"
            placeholder="+242 XX XXX XXXX"
            className="pl-10"
            {...register('phone')}
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
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
