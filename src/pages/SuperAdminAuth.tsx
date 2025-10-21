import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
// Logo dans le dossier public

const SuperAdminAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInSuperAdmin } = useAuth();
  
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Focus automatique sur le premier champ au chargement
    pinInputRefs[0].current?.focus();
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      pinInputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const fullPin = pin.join('');
    if (fullPin.length !== 6) {
      setError('Veuillez saisir les 6 chiffres du PIN');
      return;
    }

    setIsLoading(true);

    try {
      // Passer le numéro de téléphone Super Admin
      const result = await signInSuperAdmin(fullPin, '+33661002616');
     
      if (result.success) {
        toast({ 
          title: 'Authentification réussie', 
          description: 'Bienvenue dans l\'espace Super Admin' 
        });
        // La redirection est gérée par le hook useAuth
      } else {
        setError(result.error || 'Code PIN incorrect');
        setPin(['', '', '', '', '', '']);
        pinInputRefs[0].current?.focus();
      }
    } catch (err: any) {
      console.error('Erreur authentification Super Admin:', err);
      setError(err?.message || 'Erreur système lors de l\'authentification');
      setPin(['', '', '', '', '', '']);
      pinInputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Bouton Retour */}
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/logo_ndjobi.png" 
              alt="Logo Ndjobi"
              className="h-16 w-16 object-contain rounded-full bg-white p-2 shadow-sm" 
            />
            <h1 className="text-4xl font-bold">NDJOBI</h1>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold">Super Admin</h2>
          </div>
          <p className="text-muted-foreground">
            Accès sécurisé à l'administration système
          </p>
        </div>

        {/* Formulaire d'authentification */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Authentification</CardTitle>
            <CardDescription className="text-center">
              Système unifié : Numéro + PIN (6 chiffres)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Numéro de téléphone (fixe, non modifiable) */}
              <div className="space-y-3">
                <Label htmlFor="phone-number" className="text-sm font-medium">
                  Numéro de téléphone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone-number"
                    type="tel"
                    value="+33 6 61 00 26 16"
                    disabled
                    className="pl-10 bg-muted cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Numéro configuré pour le compte Super Admin
                </p>
              </div>

              {/* Message d'erreur */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {/* Code PIN */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Code PIN à 6 chiffres
                </Label>
                <div className="flex gap-2 justify-center">
                  {pin.map((digit, index) => (
                    <Input
                      key={index}
                      ref={pinInputRefs[index]}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Entrez le code PIN du compte Super Admin
                </p>
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isLoading || pin.join('').length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Se connecter
                  </>
                )}
              </Button>

              {/* Informations de sécurité */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-xs text-center text-muted-foreground">
                  🔐 <strong>Système unifié</strong> : Numéro + PIN (6 chiffres)
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  Même système que les autres utilisateurs
                </p>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  ⚠️ <strong>Accès réservé</strong> aux administrateurs système
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information supplémentaire */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Si vous n'êtes pas autorisé à accéder à cet espace,<br />
            veuillez utiliser la <a href="/auth" className="text-primary hover:underline">connexion standard</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAuth;

