import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, User, Users, Crown, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DemoAccount } from '@/types/auth';
import { PhoneAuth } from '@/components/auth/PhoneAuth';
import { Separator } from '@/components/ui/separator';
import { getDashboardUrl } from '@/lib/roleUtils';
import { userPersistence } from '@/services/userPersistence';
import logoNdjobi from '@/assets/logo_ndjobi.png';

// Comptes démo avec emails mappés aux numéros de téléphone
// Seul le compte Citoyen est accessible publiquement
// Les comptes Agent DGSS et Protocole d'État sont réservés au Super Admin
// Le compte Super Admin est accessible uniquement via double-clic sur l'icône Shield
const demoAccounts: DemoAccount[] = [
  {
    email: '24177777001@ndjobi.ga', // Email technique pour auth
    password: '123456',
    role: 'user',
    label: 'Citoyen',
    description: 'Accès utilisateur standard pour taper le Ndjobi et protéger',
    icon: 'User',
    color: 'from-primary/90 to-primary/70',
    displayPhone: '+241 77 777 001', // Numéro affiché
  },
];

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
    
    // Vérifier si l'utilisateur a des données stockées
    setHasStoredUser(userPersistence.hasStoredUser());
  }, [searchParams]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'User': return User;
      case 'Users': return Users;
      case 'Crown': return Crown;
      case 'Zap': return Zap;
      default: return Shield;
    }
  };

  const handleDemoLogin = async (account: DemoAccount) => {
    setLoading(account.email);

    try {
      // Pour les comptes démo, utiliser email (fonctionne par défaut avec Supabase)
      let { data: signInData, error: signInError }: any = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      // Si l'utilisateur n'existe pas, créer le compte
      if (signInError && (signInError.status === 400 || signInError.message?.includes('Invalid'))) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: { 
              full_name: account.label,
              role: account.role 
            },
          },
        });

        if (signUpError) throw signUpError;

        // Se connecter après inscription
        const res = await supabase.auth.signInWithPassword({
          email: account.email,
          password: account.password,
        });
        signInData = res.data;
        signInError = res.error;
      }

      if (signInError) throw signInError;

      // Assigner le rôle directement dans la table profiles
      if (signInData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signInData.user.id,
            full_name: account.label,
            role: account.role,
            updated_at: new Date().toISOString()
          });
        
        if (profileError) console.error('Error updating profile:', profileError);
      }

      toast({ 
        title: 'Connexion réussie !', 
        description: `Bienvenue, ${account.label}` 
      });
      
      // Récupérer l'action demandée
      const action = searchParams.get('action');
      
      // Rediriger vers le dashboard approprié avec l'action
      const dashboardUrl = getDashboardUrl(account.role);
      console.log('Redirecting to:', dashboardUrl, 'for role:', account.role, 'with action:', action);
      
      // Attendre un peu pour s'assurer que l'auth est bien établie
      setTimeout(() => {
        if (action) {
          navigate(`${dashboardUrl}?action=${action}`, { replace: true });
        } else {
          navigate(dashboardUrl, { replace: true });
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error?.message || 'Une erreur est survenue lors de la connexion',
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
              className="h-12 w-12 sm:h-16 sm:w-16 object-contain" 
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

          {/* Demo Accounts Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground text-center mb-6 flex items-center justify-center gap-3">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                Comptes Démo
              </h2>
              <p className="text-sm text-center text-muted-foreground mb-6">
                Essayez la plateforme avec un compte de démonstration
              </p>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {demoAccounts.map((account) => {
            const Icon = getIcon(account.icon);
            const isLoading = loading === account.email;

            return (
              <Card
                key={account.email}
                className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl group"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${account.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                <CardHeader className="relative p-3 sm:p-4 pb-2 sm:pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${account.color} shadow-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg mb-1">{account.label}</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs line-clamp-2 leading-tight">
                        {account.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative p-3 sm:p-4 pt-0">
                  {account.displayPhone && (
                    <div className="mb-2 text-xs text-muted-foreground text-center font-mono">
                      📱 {account.displayPhone}
                    </div>
                  )}
                  <Button
                    onClick={() => handleDemoLogin(account)}
                    disabled={!!loading}
                    className="w-full"
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Connexion Directe'
                    )}
                  </Button>
                  <div className="mt-1 text-[10px] text-muted-foreground text-center">
                    PIN: 123456
                  </div>
                </CardContent>
              </Card>
            );
          })}
              </div>
              
              {/* Information Card */}
              <Card className="bg-muted/30 border-border/50 mt-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 text-left">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">Comptes de démonstration</p>
                      <p>
                        Ces comptes sont pré-configurés pour découvrir les différents niveaux d'accès
                        de la plateforme NDJOBI. Les données sont partagées entre tous les utilisateurs démo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Auth;
