import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PhoneSignup } from './PhoneSignup';
import { PhoneLogin } from './PhoneLogin';
import { SocialAuth } from './SocialAuth';

export const PhoneAuth = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Authentification</CardTitle>
        <CardDescription className="text-center">
          Connectez-vous pour accéder à la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Social Auth */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Connexion rapide avec
          </p>
          <SocialAuth />
        </div>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Ou avec votre téléphone
            </span>
          </div>
        </div>

        {/* Phone Auth */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-6">
            <PhoneLogin />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <PhoneSignup />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
