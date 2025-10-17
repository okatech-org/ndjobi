import { supabase } from '@/integrations/supabase/client';

type Channel = 'sms' | 'whatsapp' | 'email';

export const twilioVerifyService = {
  async start(to: string, channel: Channel = 'sms'): Promise<{ success: boolean; error?: string }> {
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
};


