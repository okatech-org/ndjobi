import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getDashboardUrl } from '@/lib/roleUtils';

export const SocialAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    setLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error?.message || `Impossible de se connecter avec ${provider}`,
      });
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      <Button
        className="h-10 w-20 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 transition-colors"
        onClick={() => handleSocialLogin('google')}
        disabled={!!loading}
        title="Continuer avec Google"
      >
        {loading === 'google' ? (
          <Loader2 className="h-9 w-9 animate-spin" />
        ) : (
          <svg className="h-9 w-9" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        )}
      </Button>

      <Button
        className="h-10 w-20 bg-black hover:bg-gray-800 text-white border-0 transition-colors"
        onClick={() => handleSocialLogin('apple')}
        disabled={!!loading}
        title="Continuer avec Apple"
      >
        {loading === 'apple' ? (
          <Loader2 className="h-9 w-9 animate-spin" />
        ) : (
          <svg className="h-9 w-9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        )}
      </Button>

      <Button
        className="h-10 w-20 bg-[#1877F2] hover:bg-[#145dbf] text-white border-0 transition-colors"
        onClick={() => handleSocialLogin('facebook')}
        disabled={!!loading}
        title="Continuer avec Facebook"
      >
        {loading === 'facebook' ? (
          <Loader2 className="h-9 w-9 animate-spin" />
        ) : (
          <svg className="h-9 w-9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
      </Button>
    </div>
  );
};
