import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneSignup } from './PhoneSignup';
import { PhoneLogin } from './PhoneLogin';

export const PhoneAuth = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Authentification Mobile</CardTitle>
        <CardDescription className="text-center">
          Connectez-vous avec votre numéro de téléphone
        </CardDescription>
      </CardHeader>
      <CardContent>
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
