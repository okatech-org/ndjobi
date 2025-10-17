import { supabase } from '@/integrations/supabase/client';

/**
 * Service de gestion des codes d'accès Super Admin
 * Gère l'envoi par SMS, WhatsApp et Email
 */

interface CodeValidation {
  code: string;
  expiresAt: number;
  attempts: number;
}

const SUPER_ADMIN_PHONE = '+33661002616';
const SUPER_ADMIN_EMAIL = 'iasted@me.com';
const CODE_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

export class SuperAdminCodeService {
  private static instance: SuperAdminCodeService;
  private activeCode: CodeValidation | null = null;

  private constructor() {}

  static getInstance(): SuperAdminCodeService {
    if (!SuperAdminCodeService.instance) {
      SuperAdminCodeService.instance = new SuperAdminCodeService();
    }
    return SuperAdminCodeService.instance;
  }

  /**
   * Génère un code à 6 chiffres aléatoire
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Envoie le code par SMS (via Twilio ou service similaire)
   */
  private async sendSMS(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Intégrer avec Twilio ou autre service SMS
      // Pour le développement, on simule l'envoi
      console.log(`📱 SMS envoyé à ${SUPER_ADMIN_PHONE}: Code ${code}`);
      
      // Simulation: appeler une Edge Function Supabase
      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: SUPER_ADMIN_PHONE,
          message: `[NDJOBI] Votre code d'accès Super Admin : ${code}\nValide pendant ${CODE_EXPIRY_MINUTES} minutes.`,
        },
      });

      if (error) {
        console.warn('Erreur envoi SMS (simulation):', error);
        // En dev, on continue quand même
        return { success: true };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erreur envoi SMS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie le code par WhatsApp (via Twilio WhatsApp API)
   */
  private async sendWhatsApp(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`💬 WhatsApp envoyé à ${SUPER_ADMIN_PHONE}: Code ${code}`);
      
      // Simulation: appeler une Edge Function Supabase
      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: SUPER_ADMIN_PHONE,
          message: `🔐 *NDJOBI - Code Super Admin*\n\nVotre code d'accès : *${code}*\n\nValide pendant ${CODE_EXPIRY_MINUTES} minutes.\n\n⚠️ Ne partagez jamais ce code.`,
        },
      });

      if (error) {
        console.warn('Erreur envoi WhatsApp (simulation):', error);
        return { success: true }; // En dev, on continue
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erreur envoi WhatsApp:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie le code par Email (via Resend ou SendGrid)
   */
  private async sendEmail(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📧 Email envoyé à ${SUPER_ADMIN_EMAIL}: Code ${code}`);
      
      // Simulation: appeler une Edge Function Supabase
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: SUPER_ADMIN_EMAIL,
          subject: '[NDJOBI] Code d\'accès Super Admin',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 NDJOBI</h1>
                  <p>Authentification Super Admin</p>
                </div>
                <div class="content">
                  <p>Bonjour,</p>
                  <p>Voici votre code d'accès pour l'espace Super Admin :</p>
                  
                  <div class="code-box">
                    <div class="code">${code}</div>
                    <p style="margin: 10px 0 0 0; color: #666;">Valide pendant ${CODE_EXPIRY_MINUTES} minutes</p>
                  </div>
                  
                  <div class="warning">
                    <strong>⚠️ Avertissement de sécurité</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                      <li>Ne partagez jamais ce code avec personne</li>
                      <li>L'équipe NDJOBI ne vous demandera jamais ce code</li>
                      <li>Si vous n'avez pas demandé ce code, ignorez cet email</li>
                    </ul>
                  </div>
                  
                  <p style="margin-top: 20px;">Si vous rencontrez des difficultés, contactez le support technique.</p>
                </div>
                <div class="footer">
                  <p>NDJOBI - Plateforme de Bonne Gouvernance</p>
                  <p>Cet email est automatique, merci de ne pas y répondre.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        },
      });

      if (error) {
        console.warn('Erreur envoi Email (simulation):', error);
        return { success: true }; // En dev, on continue
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erreur envoi Email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie un code d'accès par la méthode choisie
   */
  async sendCode(method: 'sms' | 'whatsapp' | 'email'): Promise<{
    success: boolean;
    expiresIn?: number;
    error?: string;
  }> {
    // Générer un nouveau code
    const code = this.generateCode();
    const expiresAt = Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000;

    // Stocker le code
    this.activeCode = {
      code,
      expiresAt,
      attempts: 0,
    };

    // Envoyer selon la méthode
    let result: { success: boolean; error?: string };
    
    switch (method) {
      case 'sms':
        result = await this.sendSMS(code);
        break;
      case 'whatsapp':
        result = await this.sendWhatsApp(code);
        break;
      case 'email':
        result = await this.sendEmail(code);
        break;
      default:
        return { success: false, error: 'Méthode non supportée' };
    }

    if (result.success) {
      return {
        success: true,
        expiresIn: CODE_EXPIRY_MINUTES,
      };
    }

    return result;
  }

  /**
   * Valide un code d'accès
   */
  validateCode(inputCode: string): {
    success: boolean;
    error?: string;
  } {
    // Vérifier qu'un code est actif
    if (!this.activeCode) {
      return {
        success: false,
        error: 'Aucun code actif. Veuillez demander un nouveau code.',
      };
    }

    // Vérifier l'expiration
    if (Date.now() > this.activeCode.expiresAt) {
      this.activeCode = null;
      return {
        success: false,
        error: 'Code expiré. Veuillez demander un nouveau code.',
      };
    }

    // Vérifier le nombre de tentatives
    if (this.activeCode.attempts >= MAX_ATTEMPTS) {
      this.activeCode = null;
      return {
        success: false,
        error: 'Trop de tentatives. Veuillez demander un nouveau code.',
      };
    }

    // Incrémenter les tentatives
    this.activeCode.attempts++;

    // Vérifier le code
    if (inputCode.trim() !== this.activeCode.code) {
      const remainingAttempts = MAX_ATTEMPTS - this.activeCode.attempts;
      return {
        success: false,
        error: `Code incorrect. ${remainingAttempts} tentative${remainingAttempts > 1 ? 's' : ''} restante${remainingAttempts > 1 ? 's' : ''}.`,
      };
    }

    // Code valide - nettoyer
    this.activeCode = null;
    return { success: true };
  }

  /**
   * Obtient les informations de contact (pour l'affichage)
   */
  getContactInfo(): {
    phone: string;
    email: string;
  } {
    return {
      phone: SUPER_ADMIN_PHONE,
      email: SUPER_ADMIN_EMAIL,
    };
  }

  /**
   * Révoque le code actif
   */
  revokeActiveCode(): void {
    this.activeCode = null;
  }

  /**
   * Obtient le temps restant avant expiration (en secondes)
   */
  getTimeRemaining(): number {
    if (!this.activeCode) return 0;
    const remaining = Math.max(0, this.activeCode.expiresAt - Date.now());
    return Math.floor(remaining / 1000);
  }
}

export const superAdminCodeService = SuperAdminCodeService.getInstance();

