import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Users, Crown, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DemoAccount } from '@/types/auth';

const demoAccounts: DemoAccount[] = [
  {
    email: 'citoyen@demo.ndjobi.ga',
    password: 'demo123456',
    role: 'user',
    label: 'Citoyen',
    description: 'Accès utilisateur standard pour signaler et protéger',
    icon: 'User',
    color: 'from-primary/90 to-primary/70',
  },
  {
    email: 'agent@demo.ndjobi.ga',
    password: 'demo123456',
    role: 'agent',
    label: 'Agent DGSS',
    description: 'Direction Générale des Services Spéciaux',
    icon: 'Users',
    color: 'from-secondary/90 to-secondary/70',
  },
  {
    email: 'president@demo.ndjobi.ga',
    password: 'demo123456',
    role: 'admin',
    label: 'Protocole d\'État',
    description: 'Accès présidentiel - Administrateur',
    icon: 'Crown',
    color: 'from-accent/90 to-accent/70',
  },
  {
    email: 'superadmin@demo.ndjobi.ga',
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
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        // If account doesn't exist, create it
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Création du compte démo...',
            description: 'Premier accès, initialisation en cours',
          });

          const { error: signUpError } = await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                full_name: account.label,
              },
            },
          });

          if (signUpError) throw signUpError;

          // Try to sign in again
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: account.email,
            password: account.password,
          });

          if (signInError) throw signInError;

          // Assign role
          if (signInData.user) {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: signInData.user.id,
                role: account.role,
              });

            if (roleError) {
              console.error('Error assigning role:', roleError);
            }
          }
        } else {
          throw error;
        }
      }

      toast({
        title: 'Connexion réussie !',
        description: `Bienvenue, ${account.label}`,
      });

      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.message || 'Une erreur est survenue lors de la connexion',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-12">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">NDJOBI</h1>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
            Accès Démo
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Connectez-vous en un clic avec l'un des comptes de démonstration
          </p>
        </div>

        {/* Demo Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

                <CardHeader className="relative p-4 sm:p-6 pb-3 sm:pb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${account.color} shadow-lg mb-3 sm:mb-4 flex items-center justify-center`}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{account.label}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm line-clamp-2">
                    {account.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative p-4 sm:p-6 pt-0 sm:pt-0">
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

                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center font-mono">
                      {account.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
