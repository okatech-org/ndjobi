import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, User, Shield, ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PINInput } from './PINInput';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getDashboardUrl } from '@/lib/roleUtils';
import { biometricAuth } from '@/services/biometricAuth';
import { userPersistence } from '@/services/userPersistence';
import logoNdjobi from '@/assets/logo_ndjobi.png';

export const PWAAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [storedUser, setStoredUser] = useState(userPersistence.getStoredUser());
  const [biometricCapabilities, setBiometricCapabilities] = useState(biometricAuth.getCapabilities());

  useEffect(() => {
    // Vérifier si l'utilisateur a des données stockées
    const user = userPersistence.getStoredUser();
    if (user) {
      console.log('Utilisateur stocké trouvé:', {
        id: user.id,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        role: user.role,
        lastLogin: user.lastLoginAt
      });
    } else {
      console.log('Aucun utilisateur stocké trouvé');
    }
    setStoredUser(user);
  }, []);

  const handlePINComplete = async (completedPin: string) => {
    if (!storedUser) {
      setError('Aucun utilisateur trouvé');
      return;
    }

    // Vérifier que le PIN a 6 chiffres
    if (completedPin.length !== 6) {
      setError('Le code PIN doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Construire l'email à partir des données stockées
      const email = `${storedUser.countryCode.replace('+', '')}${storedUser.phoneNumber}@ndjobi.ga`;
      
      console.log('Tentative de connexion PWA:', { 
        email, 
        pinLength: completedPin.length,
        storedUser: {
          id: storedUser.id,
          phoneNumber: storedUser.phoneNumber,
          countryCode: storedUser.countryCode,
          role: storedUser.role
        }
      });

      // Vérifier d'abord si l'utilisateur existe dans Supabase
      const { data: existingUser, error: userCheckError } = await supabase.auth.getUser();
      if (userCheckError && userCheckError.message.includes('Invalid JWT')) {
        console.log('Aucune session active, tentative de connexion...');
      }
      
      // Authentification avec le PIN
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: completedPin,
      });

      if (signInError) {
        console.error('Erreur d\'authentification PWA:', signInError);
        throw new Error(`Code PIN incorrect: ${signInError.message}`);
      }

      // Vérifier que l'utilisateur a bien un rôle
      if (!signInData?.user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Mettre à jour la dernière connexion
      userPersistence.updateLastLogin();

      console.log('Connexion PWA réussie:', {
        userId: signInData.user.id,
        email: signInData.user.email,
        role: storedUser.role
      });

      toast({
        title: 'Connexion réussie !',
        description: `Bienvenue, ${storedUser.fullName}`,
      });

      // Rediriger vers le dashboard approprié
      const action = searchParams.get('action');
      const dashboardUrl = getDashboardUrl(storedUser.role);
      
      console.log('Redirection vers:', dashboardUrl);
      
      if (action) {
        navigate(`${dashboardUrl}?action=${action}`, { replace: true });
      } else {
        navigate(dashboardUrl, { replace: true });
      }

    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setError(error.message || 'Code PIN incorrect');
      setPin(''); // Réinitialiser le PIN
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!storedUser) {
      setError('Aucun utilisateur trouvé');
      return;
    }

    setBiometricLoading(true);
    setError('');

    try {
      const result = await biometricAuth.authenticateBiometric(storedUser.id);
      
      if (result.success) {
        // Mettre à jour la dernière connexion
        userPersistence.updateLastLogin();

        toast({
          title: 'Authentification réussie !',
          description: `Bienvenue, ${storedUser.fullName}`,
        });

        // Rediriger vers le dashboard approprié
        const action = searchParams.get('action');
        const dashboardUrl = getDashboardUrl(storedUser.role);
        
        if (action) {
          navigate(`${dashboardUrl}?action=${action}`);
        } else {
          navigate(dashboardUrl);
        }
      } else {
        // Ne pas afficher d'erreur pour les annulations utilisateur
        if (result.error?.includes('annulée') || result.error?.includes('refusée')) {
          // L'utilisateur a annulé, pas besoin d'afficher d'erreur
          console.log('Authentification biométrique annulée par l\'utilisateur');
        } else {
          setError(result.error || 'Authentification biométrique échouée');
        }
      }
    } catch (error: any) {
      console.error('Erreur d\'authentification biométrique:', error);
      setError(error.message || 'Authentification biométrique échouée');
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleLogout = () => {
    userPersistence.clearStoredUser();
    setStoredUser(null);
    setPin('');
    setError('');
    
    // Rediriger vers la page d'accueil
    navigate('/', { replace: true });
  };

  const handleResetBiometric = async () => {
    if (!storedUser) return;
    
    try {
      await biometricAuth.resetBiometricRegistration(storedUser.id);
      userPersistence.setBiometricEnabled(false);
      
      toast({
        title: 'Authentification biométrique réinitialisée',
        description: 'Vous pouvez la réactiver lors de votre prochaine connexion',
      });
      
      // Recharger les données utilisateur
      setStoredUser(userPersistence.getStoredUser());
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de réinitialiser l\'authentification biométrique',
      });
    }
  };

  const handleBackToFullAuth = () => {
    navigate('/auth');
  };

  // Si aucun utilisateur stocké, rediriger vers l'authentification complète
  if (!storedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src={logoNdjobi} 
                alt="Logo Ndjobi"
                className="h-12 w-12 object-contain" 
              />
              <h1 className="text-2xl font-bold">NDJOBI</h1>
            </div>
            <CardTitle>Authentification PWA</CardTitle>
            <CardDescription>
              Aucun utilisateur enregistré localement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Pour utiliser l'authentification rapide, vous devez d'abord vous inscrire ou vous connecter.
              </AlertDescription>
            </Alert>
            <Button onClick={handleBackToFullAuth} className="w-full">
              <User className="mr-2 h-4 w-4" />
              Aller à l'authentification complète
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src={logoNdjobi} 
              alt="Logo Ndjobi"
              className="h-12 w-12 object-contain" 
            />
            <h1 className="text-2xl font-bold">NDJOBI</h1>
          </div>
          <CardTitle>Connexion rapide</CardTitle>
          <CardDescription>
            Bon retour, {storedUser.fullName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations utilisateur */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{userPersistence.getStoredPhoneDisplay()}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {storedUser.role === 'user' && 'Citoyen'}
              {storedUser.role === 'agent' && 'Agent DGSS'}
              {storedUser.role === 'admin' && 'Protocole d\'État'}
              {storedUser.role === 'super_admin' && 'Super Admin'}
            </div>
          </div>

          {/* Authentification biométrique */}
          {biometricCapabilities.isSupported && storedUser.biometricEnabled && (
            <div className="space-y-3">
              <Button
                onClick={handleBiometricAuth}
                disabled={biometricLoading}
                variant="outline"
                className="w-full h-12 text-lg"
              >
                {biometricLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authentification...
                  </>
                ) : (
                  <>
                    <span className="text-2xl mr-2">{biometricAuth.getBiometricIcon()}</span>
                    {biometricAuth.getBiometricLabel()}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Séparateur */}
          {biometricCapabilities.isSupported && storedUser.biometricEnabled && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou avec votre code PIN
                </span>
              </div>
            </div>
          )}

          {/* Saisie du code PIN */}
          <div className="space-y-4">
            <div className="text-center">
              <label className="text-sm font-medium">
                Code PIN (6 chiffres)
              </label>
            </div>
            
            <PINInput
              value={pin}
              onChange={setPin}
              onComplete={handlePINComplete}
              disabled={loading}
              error={!!error}
              autoFocus={true}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Vérification...</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleBackToFullAuth}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Autre méthode de connexion
            </Button>
            
            {storedUser.biometricEnabled && (
              <Button
                onClick={handleResetBiometric}
                variant="ghost"
                className="w-full text-orange-600 hover:text-orange-700"
              >
                <Settings className="mr-2 h-4 w-4" />
                Réinitialiser l'authentification biométrique
              </Button>
            )}
            
            {/* Bouton de débogage temporaire */}
            <Button
              onClick={() => {
                console.log('Données utilisateur stockées:', storedUser);
                console.log('Données localStorage:', localStorage.getItem('ndjobi_user_data'));
                console.log('Données sessionStorage:', sessionStorage.getItem('ndjobi_user_data'));
              }}
              variant="ghost"
              className="w-full text-blue-600 hover:text-blue-700 text-xs"
            >
              🔍 Debug (voir console)
            </Button>
            
            {/* Bouton de réinitialisation complète */}
            <Button
              onClick={() => {
                userPersistence.clearStoredUser();
                setStoredUser(null);
                setPin('');
                setError('');
                toast({
                  title: 'Données PWA réinitialisées',
                  description: 'Veuillez vous reconnecter avec votre numéro de téléphone',
                });
                navigate('/auth');
              }}
              variant="ghost"
              className="w-full text-red-600 hover:text-red-700 text-xs"
            >
              🔄 Réinitialiser PWA
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-destructive hover:text-destructive"
            >
              <Settings className="mr-2 h-4 w-4" />
              Changer d'utilisateur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
