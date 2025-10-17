// src/services/twilioVerifyService.ts
import { supabase } from '@/integrations/supabase/client';

type Channel = 'sms' | 'whatsapp' | 'email';

// Mode développement: utiliser un code fixe pour les tests
const DEV_MODE = import.meta.env.MODE === 'development';
const DEV_OTP_CODE = '123456'; // Code fixe pour le développement

export const twilioVerifyService = {
  async start(to: string, channel: Channel = 'sms'): Promise<{ success: boolean; error?: string }> {
    // Mode développement: simulation sans appel API
    if (DEV_MODE) {
      console.log(`🧪 [DEV MODE] Code OTP simulé: ${DEV_OTP_CODE}`);
      console.log(`📱 Canal: ${channel}`);
      console.log(`📧 Destinataire: ${to}`);
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { 
        success: true 
      };
    }

    // Mode production: appel réel à l'Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('start-verification', {
        body: { to, channel },
      });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Erreur démarrage vérification' };
    }
  },

  async check(to: string, code: string): Promise<{ success: boolean; valid?: boolean; error?: string }> {
    // Mode développement: vérifier contre le code fixe
    if (DEV_MODE) {
      console.log(`🧪 [DEV MODE] Vérification du code: ${code}`);
      console.log(`✅ Code attendu: ${DEV_OTP_CODE}`);
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const isValid = code === DEV_OTP_CODE;
      console.log(`${isValid ? '✅' : '❌'} Validation: ${isValid ? 'SUCCESS' : 'FAILED'}`);
      
      return { 
        success: true, 
        valid: isValid 
      };
    }

    // Mode production: appel réel à l'Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('check-verification', {
        body: { to, code },
      });
      if (error) throw error;
      return { success: true, valid: data?.valid === true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Erreur vérification code' };
    }
  },

  // Récupérer le code de développement pour l'afficher à l'utilisateur
  getDevCode(): string | null {
    return DEV_MODE ? DEV_OTP_CODE : null;
  },

  isDevMode(): boolean {
    return DEV_MODE;
  }
};
