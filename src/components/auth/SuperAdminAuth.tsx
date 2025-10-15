import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, EyeOff, Smartphone, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { biometricAuth } from '@/services/biometricAuth';
import { superAdminAuthService } from '@/services/superAdminAuth';

interface SuperAdminAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminAuth = ({ isOpen, onClose }: SuperAdminAuthProps) => {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordMethod, setForgotPasswordMethod] = useState<'email' | 'phone' | null>(null);
  const [forgotPasswordCode, setForgotPasswordCode] = useState('');
  const [showForgotPasswordCode, setShowForgotPasswordCode] = useState(false);
  const [isProcessingForgotPassword, setIsProcessingForgotPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Obtenir les informations de validation
  const validationInfo = superAdminAuthService.getValidationInfo();

  useEffect(() => {
    // Vérifier la disponibilité biométrique
    const checkBiometric = async () => {
      const available = await biometricAuth.checkCapabilities();
      setBiometricAvailable(available);
    };
    checkBiometric();
  }, []);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');

    try {
      // Valider le code d'authentification
      const validation = superAdminAuthService.validateSuperAdminCode(code);
      
      if (!validation.success) {
        setError(validation.error || 'Code d\'authentification incorrect');
        return;
      }

      // Code correct - se connecter avec le compte Super Admin
      console.log('Tentative de connexion Super Admin avec:', '24177777000@ndjobi.ga');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: '24177777000@ndjobi.ga',
        password: '123456',
      });

      if (signInError) {
        console.error('Erreur de connexion Super Admin:', signInError);
        setError(`Erreur de connexion: ${signInError.message}`);
        return;
      }

      if (!signInData?.user) {
        console.error('Aucun utilisateur retourné par Supabase');
        setError('Compte Super Admin non trouvé');
        return;
      }

      console.log('Connexion Super Admin réussie:', signInData.user);

      // Créer la session Super Admin
      superAdminAuthService.createSuperAdminSession();

      toast({
        title: 'Authentification Super Admin réussie',
        description: 'Accès autorisé au système',
      });

      // Rediriger directement vers le dashboard Super Admin
      navigate('/dashboard/super-admin', { replace: true });
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'authentification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecoveryCode = async (method: 'email' | 'phone') => {
    setIsProcessingForgotPassword(true);
    setError('');

    try {
      // Envoyer le code de récupération
      const sendResult = await superAdminAuthService.sendValidationCode(method);
      
      if (!sendResult.success) {
        setError(sendResult.error || 'Erreur lors de l\'envoi du code');
        return;
      }

      toast({
        title: 'Code de récupération envoyé',
        description: `Un code de récupération a été envoyé à ${method === 'email' ? validationInfo.email : validationInfo.phone}`,
      });

      setForgotPasswordCode('');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsProcessingForgotPassword(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessingForgotPassword(true);
    setError('');

    try {
      // Valider le code de récupération
      const validation = superAdminAuthService.validateCode(forgotPasswordCode);
      
      if (!validation.success) {
        setError(validation.error || 'Code de récupération incorrect');
        return;
      }

      // Code correct - permettre la création d'un nouveau mot de passe
      toast({
        title: 'Code de récupération validé',
        description: 'Vous pouvez maintenant créer un nouveau mot de passe',
      });

      // Ici, on pourrait ouvrir un modal pour créer un nouveau mot de passe
      // Pour la démo, on ferme le modal
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la validation');
    } finally {
      setIsProcessingForgotPassword(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setIsLoading(true);
      setError('');

      const result = await biometricAuth.authenticateBiometric();
      
      if (result.success) {
        // Se connecter avec le compte Super Admin
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: '24177777000@ndjobi.ga',
          password: '123456',
        });

        if (signInError) {
          setError('Erreur de connexion au compte Super Admin');
          return;
        }

        if (!signInData?.user) {
          setError('Compte Super Admin non trouvé');
          return;
        }

        // Créer la session Super Admin
        superAdminAuthService.createSuperAdminSession();
        
        toast({
          title: 'Authentification biométrique réussie',
          description: 'Accès Super Admin autorisé',
        });
        
        navigate('/dashboard/super-admin', { replace: true });
        onClose();
      } else {
        setError('Authentification biométrique échouée');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur d\'authentification biométrique');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCode('');
    setForgotPasswordCode('');
    setError('');
    setShowForgotPassword(false);
    setForgotPasswordMethod(null);
    setShowCode(false);
    setShowForgotPasswordCode(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
            Authentification Super Admin
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!showForgotPassword ? (
            // Authentification principale
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="super-admin-code">
                  Code d'authentification
                </Label>
                <div className="relative">
                  <Input
                    id="super-admin-code"
                    type={showCode ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Saisissez le code d'accès"
                    className="pr-10"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !code}
                >
                  {isLoading ? (
                    <>
                      <Lock className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Accéder au système
                    </>
                  )}
                </Button>

                {biometricAvailable && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBiometricAuth}
                    disabled={isLoading}
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    Face ID / Touch ID
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Mot de passe oublié ?
                </Button>
              </div>
            </form>
          ) : (
            // Récupération de mot de passe
            <div className="space-y-4">
              {!forgotPasswordMethod ? (
                // Choix de la méthode de récupération
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Choisissez comment recevoir le code de récupération
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setForgotPasswordMethod('email');
                        handleSendRecoveryCode('email');
                      }}
                      disabled={isProcessingForgotPassword}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Par email ({validationInfo.email})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setForgotPasswordMethod('phone');
                        handleSendRecoveryCode('phone');
                      }}
                      disabled={isProcessingForgotPassword}
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Par SMS ({validationInfo.phone})
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Retour à l'authentification
                  </Button>
                </div>
              ) : (
                // Saisie du code de récupération
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      {forgotPasswordMethod === 'email' ? (
                        <>
                          <Mail className="h-4 w-4" />
                          Code envoyé à {validationInfo.email}
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-4 w-4" />
                          Code envoyé au {validationInfo.phone}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forgot-password-code">
                      Code de récupération
                    </Label>
                    <div className="relative">
                      <Input
                        id="forgot-password-code"
                        type={showForgotPasswordCode ? 'text' : 'password'}
                        value={forgotPasswordCode}
                        onChange={(e) => setForgotPasswordCode(e.target.value)}
                        placeholder="Saisissez le code reçu"
                        className="pr-10"
                        autoComplete="off"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowForgotPasswordCode(!showForgotPasswordCode)}
                      >
                        {showForgotPasswordCode ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setForgotPasswordMethod(null);
                        setForgotPasswordCode('');
                        setError('');
                      }}
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isProcessingForgotPassword || !forgotPasswordCode}
                    >
                      {isProcessingForgotPassword ? (
                        <>
                          <Lock className="mr-2 h-4 w-4 animate-spin" />
                          Validation...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Valider
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
