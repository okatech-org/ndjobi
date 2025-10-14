import { supabase } from '@/integrations/supabase/client';

/**
 * SERVICE D'IDENTITÉ D'APPAREIL
 * 
 * Permet de reconnaître un appareil même sans authentification
 * et de lier l'historique anonyme à un compte créé ultérieurement
 */

interface DeviceFingerprint {
  deviceId: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  vendor: string;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  deviceMemory?: number;
  colorDepth: number;
  pixelRatio: number;
  touchSupport: boolean;
  canvas?: string;
  webgl?: string;
}

interface DeviceSession {
  deviceId: string;
  sessionToken: string;
  firstSeen: string;
  lastSeen: string;
  signalements: string[];
  projets: string[];
  userId?: string;
  linkedAt?: string;
}

class DeviceIdentityService {
  private deviceId: string | null = null;
  private fingerprint: DeviceFingerprint | null = null;

  /**
   * Génère un identifiant unique d'appareil
   */
  private generateDeviceId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `device_${timestamp}_${random}`;
  }

  /**
   * Génère une empreinte unique de l'appareil (Device Fingerprinting)
   */
  private async generateFingerprint(): Promise<DeviceFingerprint> {
    const nav = navigator as any;

    // Canvas fingerprinting
    const canvas = this.getCanvasFingerprint();
    
    // WebGL fingerprinting
    const webgl = this.getWebGLFingerprint();

    const fingerprint: DeviceFingerprint = {
      deviceId: this.deviceId!,
      userAgent: nav.userAgent || '',
      screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: nav.language || nav.userLanguage || '',
      platform: nav.platform || '',
      vendor: nav.vendor || '',
      cookiesEnabled: nav.cookieEnabled || false,
      doNotTrack: nav.doNotTrack || null,
      hardwareConcurrency: nav.hardwareConcurrency || 0,
      deviceMemory: nav.deviceMemory,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window || nav.maxTouchPoints > 0,
      canvas,
      webgl,
    };

    return fingerprint;
  }

  /**
   * Canvas fingerprinting
   */
  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      canvas.width = 200;
      canvas.height = 50;

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('NDJOBI 🎭', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Canvas fingerprint', 4, 17);

      return canvas.toDataURL();
    } catch {
      return '';
    }
  }

  /**
   * WebGL fingerprinting
   */
  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return '';

      const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      return `${vendor}~${renderer}`;
    } catch {
      return '';
    }
  }

  /**
   * Génère un hash de l'empreinte pour identifier l'appareil
   */
  private async hashFingerprint(fingerprint: DeviceFingerprint): Promise<string> {
    const fpString = JSON.stringify({
      ua: fingerprint.userAgent,
      screen: fingerprint.screenResolution,
      tz: fingerprint.timezone,
      lang: fingerprint.language,
      platform: fingerprint.platform,
      canvas: fingerprint.canvas,
      webgl: fingerprint.webgl,
    });

    const encoder = new TextEncoder();
    const data = encoder.encode(fpString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  /**
   * Initialise l'identité de l'appareil
   */
  async initialize(): Promise<string> {
    // 1. Vérifier si un deviceId existe déjà dans localStorage
    let storedDeviceId = localStorage.getItem('ndjobi_device_id');
    
    if (storedDeviceId) {
      this.deviceId = storedDeviceId;
      console.info('[Device Identity] Device ID récupéré:', this.deviceId);
    } else {
      // 2. Générer un nouveau deviceId
      this.deviceId = this.generateDeviceId();
      localStorage.setItem('ndjobi_device_id', this.deviceId);
      console.info('[Device Identity] Nouveau Device ID créé:', this.deviceId);
    }

    // 3. Générer l'empreinte de l'appareil
    this.fingerprint = await this.generateFingerprint();
    
    // 4. Générer le hash de l'empreinte
    const fingerprintHash = await this.hashFingerprint(this.fingerprint);
    
    // 5. Sauvegarder dans localStorage
    localStorage.setItem('ndjobi_fingerprint_hash', fingerprintHash);
    
    // 6. Vérifier si une session existe déjà dans la DB
    await this.syncDeviceSession(fingerprintHash);

    return this.deviceId;
  }

  /**
   * Synchronise la session de l'appareil avec la base de données
   */
  private async syncDeviceSession(fingerprintHash: string): Promise<void> {
    try {
      // Vérifier si une session existe pour ce fingerprint
      const { data: existingSession } = await supabase
        .from('device_sessions')
        .select('*')
        .eq('fingerprint_hash', fingerprintHash)
        .maybeSingle();

      if (existingSession) {
        // Mettre à jour la session existante
        this.deviceId = existingSession.device_id;
        localStorage.setItem('ndjobi_device_id', existingSession.device_id);
        
        await supabase
          .from('device_sessions')
          .update({ 
            last_seen: new Date().toISOString(),
            session_count: existingSession.session_count + 1,
          })
          .eq('id', existingSession.id);

        console.info('[Device Identity] Session existante mise à jour');
      } else {
        // Créer une nouvelle session
        const { error } = await supabase
          .from('device_sessions')
          .insert({
            device_id: this.deviceId,
            fingerprint_hash: fingerprintHash,
            fingerprint_data: this.fingerprint,
            first_seen: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            session_count: 1,
          });

        if (error) {
          console.warn('[Device Identity] Erreur création session:', error);
        } else {
          console.info('[Device Identity] Nouvelle session créée');
        }
      }
    } catch (error) {
      console.error('[Device Identity] Erreur sync session:', error);
    }
  }

  /**
   * Récupère l'ID de l'appareil
   */
  getDeviceId(): string | null {
    return this.deviceId || localStorage.getItem('ndjobi_device_id');
  }

  /**
   * Récupère l'empreinte de l'appareil
   */
  getFingerprint(): DeviceFingerprint | null {
    return this.fingerprint;
  }

  /**
   * Enregistre un signalement pour cet appareil (avant authentification)
   */
  async recordAnonymousSignalement(signalementId: string): Promise<void> {
    const deviceId = this.getDeviceId();
    if (!deviceId) return;

    try {
      await supabase
        .from('device_signalements')
        .insert({
          device_id: deviceId,
          signalement_id: signalementId,
          created_at: new Date().toISOString(),
        });

      console.info('[Device Identity] Signalement anonyme enregistré:', signalementId);
    } catch (error) {
      console.error('[Device Identity] Erreur enregistrement signalement:', error);
    }
  }

  /**
   * Enregistre un projet pour cet appareil (avant authentification)
   */
  async recordAnonymousProject(projectId: string): Promise<void> {
    const deviceId = this.getDeviceId();
    if (!deviceId) return;

    try {
      await supabase
        .from('device_projets')
        .insert({
          device_id: deviceId,
          projet_id: projectId,
          created_at: new Date().toISOString(),
        });

      console.info('[Device Identity] Projet anonyme enregistré:', projectId);
    } catch (error) {
      console.error('[Device Identity] Erreur enregistrement projet:', error);
    }
  }

  /**
   * Lie l'appareil à un compte utilisateur authentifié
   * MIGRATION DE L'HISTORIQUE ANONYME → COMPTE AUTHENTIFIÉ
   */
  async linkToUser(userId: string): Promise<{
    success: boolean;
    signalementsLinked: number;
    projetsLinked: number;
  }> {
    const deviceId = this.getDeviceId();
    const fingerprintHash = localStorage.getItem('ndjobi_fingerprint_hash');
    
    if (!deviceId || !fingerprintHash) {
      return { success: false, signalementsLinked: 0, projetsLinked: 0 };
    }

    try {
      console.info('[Device Identity] 🔗 Liaison appareil → utilisateur:', { deviceId, userId });

      // 1. Lier la session de l'appareil à l'utilisateur
      const { error: sessionError } = await supabase
        .from('device_sessions')
        .update({
          user_id: userId,
          linked_at: new Date().toISOString(),
        })
        .eq('device_id', deviceId);

      if (sessionError) throw sessionError;

      // 2. Récupérer tous les signalements de cet appareil
      const { data: deviceSignalements } = await supabase
        .from('device_signalements')
        .select('signalement_id')
        .eq('device_id', deviceId)
        .is('migrated_at', null);

      // 3. Mettre à jour le user_id des signalements
      let signalementsLinked = 0;
      if (deviceSignalements && deviceSignalements.length > 0) {
        const signalementIds = deviceSignalements.map(s => s.signalement_id);
        
        const { error: signalementError } = await supabase
          .from('signalements')
          .update({ 
            user_id: userId,
            is_anonymous: false,
          })
          .in('id', signalementIds);

        if (!signalementError) {
          // Marquer comme migrés
          await supabase
            .from('device_signalements')
            .update({ 
              migrated_at: new Date().toISOString(),
              migrated_to_user: userId,
            })
            .eq('device_id', deviceId);

          signalementsLinked = signalementIds.length;
        }
      }

      // 4. Récupérer tous les projets de cet appareil
      const { data: deviceProjets } = await supabase
        .from('device_projets')
        .select('projet_id')
        .eq('device_id', deviceId)
        .is('migrated_at', null);

      // 5. Mettre à jour le user_id des projets
      let projetsLinked = 0;
      if (deviceProjets && deviceProjets.length > 0) {
        const projetIds = deviceProjets.map(p => p.projet_id);
        
        const { error: projetError } = await supabase
          .from('projets')
          .update({ user_id: userId })
          .in('id', projetIds);

        if (!projetError) {
          // Marquer comme migrés
          await supabase
            .from('device_projets')
            .update({ 
              migrated_at: new Date().toISOString(),
              migrated_to_user: userId,
            })
            .eq('device_id', deviceId);

          projetsLinked = projetIds.length;
        }
      }

      console.info('[Device Identity] ✅ Migration réussie:', { 
        signalementsLinked, 
        projetsLinked 
      });

      return {
        success: true,
        signalementsLinked,
        projetsLinked,
      };
    } catch (error) {
      console.error('[Device Identity] ❌ Erreur liaison:', error);
      return { success: false, signalementsLinked: 0, projetsLinked: 0 };
    }
  }

  /**
   * Récupère l'historique de l'appareil (avant authentification)
   */
  async getDeviceHistory(): Promise<{
    signalements: any[];
    projets: any[];
  }> {
    const deviceId = this.getDeviceId();
    if (!deviceId) return { signalements: [], projets: [] };

    try {
      // Récupérer les signalements
      const { data: deviceSigs } = await supabase
        .from('device_signalements')
        .select(`
          signalement_id,
          signalements:signalement_id (*)
        `)
        .eq('device_id', deviceId)
        .is('migrated_at', null);

      // Récupérer les projets
      const { data: deviceProjs } = await supabase
        .from('device_projets')
        .select(`
          projet_id,
          projets:projet_id (*)
        `)
        .eq('device_id', deviceId)
        .is('migrated_at', null);

      return {
        signalements: deviceSigs?.map(s => (s as any).signalements).filter(Boolean) || [],
        projets: deviceProjs?.map(p => (p as any).projets).filter(Boolean) || [],
      };
    } catch (error) {
      console.error('[Device Identity] Erreur récupération historique:', error);
      return { signalements: [], projets: [] };
    }
  }

  /**
   * Nettoie les données locales (déconnexion complète)
   */
  clearDeviceData(): void {
    localStorage.removeItem('ndjobi_device_id');
    localStorage.removeItem('ndjobi_fingerprint_hash');
    this.deviceId = null;
    this.fingerprint = null;
    console.info('[Device Identity] Données locales nettoyées');
  }
}

// Instance singleton
export const deviceIdentityService = new DeviceIdentityService();

// Auto-initialisation au chargement
if (typeof window !== 'undefined') {
  deviceIdentityService.initialize().catch(console.error);
}

export default deviceIdentityService;

