import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Zap, Loader2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PhoneAuth } from '@/components/auth/PhoneAuth';
import { Separator } from '@/components/ui/separator';
import { userPersistence } from '@/services/userPersistence';
import logoNdjobi from '@/assets/logo_ndjobi.png';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [hasStoredUser, setHasStoredUser] = useState(false);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'protect') {
      setActionMessage('🔒 Connectez-vous pour protéger votre projet');
    }
    
    setHasStoredUser(userPersistence.hasStoredUser());
  }, [searchParams]);

  const handleDemoLogin = async () => {
    setLoading('demo');
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: '24177777001@ndjobi.com',
        password: '123456',
      });

      if (error) throw error;

      toast({
        title: 'Connexion démo réussie !',
        description: 'Vous êtes connecté avec le compte citoyen démo',
      });
      
      navigate('/dashboard/user');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion démo',
        description: error?.message || 'Impossible de se connecter au compte démo',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-12">
      <div className="w-full max-w-7xl space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src={logoNdjobi} 
              alt="Logo Ndjobi"
              className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-full bg-white p-1 sm:p-2 shadow-sm" 
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">NDJOBI</h1>
          </div>
          {actionMessage ? (
            <p className="text-sm sm:text-base text-primary font-medium max-w-2xl mx-auto">
              {actionMessage}
            </p>
          ) : (
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Connectez-vous ou créez un&nbsp;compte pour accéder à&nbsp;la&nbsp;plateforme
            </p>
          )}
        </div>

        {/* Two Column Layout: Authentication & Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Authentication Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground text-center mb-6 flex items-center justify-center gap-3">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                Authentification
              </h2>
              
              {hasStoredUser && (
                <div className="mb-6">
                  <Button
                    onClick={() => navigate('/auth/pwa')}
                    className="w-full h-12 text-lg font-semibold"
                    variant="default"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Connexion rapide PWA
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Utilisez votre code PIN ou authentification biométrique
                  </p>
                </div>
              )}
              
              <PhoneAuth />
            </div>
          </div>

          {/* Demo Account Section */}
          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-center mb-2">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center text-xl sm:text-2xl">
                  Compte Démo Citoyen
                </CardTitle>
                <CardDescription className="text-center">
                  Testez la plateforme avec un compte pré-configuré
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Fonctionnalités disponibles :</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>✅ Créer des signalements</li>
                    <li>✅ Protéger des projets</li>
                    <li>✅ Consulter vos documents</li>
                    <li>✅ Gérer votre profil</li>
                  </ul>
                </div>
                
                <Button
                  onClick={handleDemoLogin}
                  disabled={loading === 'demo'}
                  className="w-full h-12 text-lg font-semibold"
                  variant="outline"
                >
                  {loading === 'demo' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <UserCircle className="mr-2 h-5 w-5" />
                      Accéder au compte démo
                    </>
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground pt-2 border-t">
                  <p className="font-mono">Email: 24177777001@ndjobi.com</p>
                  <p className="font-mono">Mot de passe: 123456</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Auth;
