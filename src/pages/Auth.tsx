import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Users, Crown, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DemoAccount } from '@/types/auth';
import { PhoneAuth } from '@/components/auth/PhoneAuth';
import { Separator } from '@/components/ui/separator';

const demoAccounts: DemoAccount[] = [
  {
    email: 'citoyen+v2@demo.ndjobi.ga',
    password: 'demo123456',
    role: 'user',
    label: 'Citoyen',
    description: 'Accès utilisateur standard pour signaler et protéger',
    icon: 'User',
    color: 'from-primary/90 to-primary/70',
  },
  {
    email: 'agent+v2@demo.ndjobi.ga',
    password: 'demo123456',
    role: 'agent',
    label: 'Agent DGSS',
    description: 'Direction Générale des Services Spéciaux',
    icon: 'Users',
    color: 'from-secondary/90 to-secondary/70',
  },
  {
    email: 'president+v2@demo.ndjobi.ga',
    password: 'demo123456',
    role: 'admin',
    label: 'Protocole d\'État',
    description: 'Accès présidentiel - Administrateur',
    icon: 'Crown',
    color: 'from-accent/90 to-accent/70',
  },
  {
    email: 'superadmin+v2@demo.ndjobi.ga',
    password: 'demo123456',
    role: 'super_admin',
    label: 'Super Admin',
    description: 'Accès technique complet - Gestion système',
    icon: 'Zap',
    color: 'from-destructive/90 to-destructive/70',
  },
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

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

    const makeUniqueEmail = (email: string) => {
      const [local, domain] = email.split('@');
      const ts = Date.now();
      // Preserve existing +tag if present, append timestamp to ensure uniqueness
      const [name, tag] = local.split('+');
      const newLocal = tag ? `${name}+${tag}.${ts}` : `${name}+${ts}`;
      return `${newLocal}@${domain}`;
    };

    try {
      const redirectUrl = `${window.location.origin}/`;

      // 1) Try to ensure account exists and is confirmed (auto-confirm enabled)
      const { error: signUpError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: account.label },
        },
      });
      // Ignore if already registered

      // 2) Try to sign in
      let emailToUse = account.email;
      let { data: signInData, error: signInError }: any = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: account.password,
      });

      // 3) If blocked due to old unconfirmed user, create a fresh unique account and sign in
      if (signInError && (signInError.code === 'email_not_confirmed' || /Email not confirmed/i.test(signInError.message))) {
        const uniqueEmail = makeUniqueEmail(account.email);
        const { error: su2 } = await supabase.auth.signUp({
          email: uniqueEmail,
          password: account.password,
          options: { emailRedirectTo: redirectUrl, data: { full_name: account.label } },
        });
        if (su2) throw su2;
        emailToUse = uniqueEmail;
        const res2 = await supabase.auth.signInWithPassword({ email: emailToUse, password: account.password });
        signInData = res2.data;
        signInError = res2.error;
      }

      if (signInError) throw signInError;

      // 4) Attempt to assign role (best-effort; may be restricted by policies)
      if (signInData?.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: signInData.user.id, role: account.role });
        if (roleError) console.error('Error assigning role:', roleError);
      }

      toast({ title: 'Connexion réussie !', description: `Bienvenue, ${account.label}` });
      navigate('/');
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
      <div className="w-full max-w-6xl space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">NDJOBI</h1>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
            Authentification
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Connectez-vous ou créez un compte pour accéder à la plateforme
          </p>
        </div>

        {/* Auth Methods */}
        <PhoneAuth />

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou essayez avec un compte démo
            </span>
          </div>
        </div>

        {/* Demo Accounts */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-center mb-4 sm:mb-6">
            Comptes de Démonstration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                      'Se connecter'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 sm:mt-12 text-center">
          <Card className="bg-muted/30 border-border/50 max-w-2xl mx-auto">
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
  );
};

export default Auth;
