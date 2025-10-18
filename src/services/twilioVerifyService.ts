// src/services/twilioVerifyService.ts
import { supabase } from '@/integrations/supabase/client';

type Channel = 'sms' | 'whatsapp' | 'email';

export const twilioVerifyService = {
  async start(to: string, channel: Channel = 'sms'): Promise<{ success: boolean; error?: string }> {
    console.log(`📱 Démarrage vérification Twilio - Canal: ${channel}, Destinataire: ${to}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('start-verification', {
        body: { to, channel },
      });
      if (error) {
        console.error('❌ Erreur démarrage vérification Twilio:', error);
      };
      console.log('✅ Vérification Twilio démarrée avec succès');
      return { success: true };
    } catch (e: any) {
      console.error('❌ Erreur démarrage vérification Twilio:', e);
      return { success: false, error: e?.message || 'Erreur démarrage vérification' };
    }
  },

  async check(to: string, code: string): Promise<{ success: boolean; valid?: boolean; error?: string }> {
    console.log(`🔍 Vérification code Twilio - Code: ${code}, Destinataire: ${to}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('check-verification', {
        body: { to, code },
      });
      if (error) throw error;
      
      const isValid = data?.valid === true;
      console.log(`${isValid ? '✅' : '❌'} Validation Twilio: ${isValid ? 'SUCCESS' : 'FAILED'}`);
      
      return { success: true, valid: isValid };
    } catch (e: any) {
      console.error('❌ Erreur vérification code Twilio:', e);
      return { success: false, error: e?.message || 'Erreur vérification code' };
    }
  }
};
