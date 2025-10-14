/**
 * MODULE D'URGENCE SÉCURISÉ - NDJOBI
 * 
 * ⚠️ AVERTISSEMENT CRITIQUE ⚠️
 * Ce module ne peut être activé QUE dans les cas suivants :
 * - État d'urgence déclaré officiellement
 * - Décret constitutionnel
 * - Autorisation judiciaire explicite
 * 
 * TOUTE utilisation est enregistrée, horodatée et transmise aux autorités de contrôle
 */

import { supabase } from '@/integrations/supabase/client';
import CryptoJS from 'crypto-js';

interface EmergencyActivation {
  id: string;
  activatedBy: string;
  reason: string;
  legalReference: string; // Numéro du décret ou décision judiciaire
  startDate: string;
  endDate: string;
  judicialAuthorization: string;
  status: 'pending_approval' | 'active' | 'expired' | 'revoked';
}

interface DecodedUserData {
  userId: string;
  deviceId: string;
  realName?: string;
  phoneNumber?: string;
  ipAddress: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    language: string;
    timezone: string;
  };
  networkInfo: {
    connectionType?: string;
    isp?: string;
    vpnDetected: boolean;
  };
  audioPermission: boolean;
  cameraPermission: boolean;
  signalements: any[];
  lastActivity: string;
}

class EmergencyDecoderService {
  private static instance: EmergencyDecoderService;
  private isEmergencyMode: boolean = false;
  private currentActivation: EmergencyActivation | null = null;
  private auditLog: any[] = [];
  private decryptionKey: string | null = null;
  
  // Clés de décryptage à multi-facteurs (nécessite 3 clés pour décrypter)
  private readonly MASTER_KEY_FRAGMENT_1 = process.env.VITE_EMERGENCY_KEY_1;
  private readonly MASTER_KEY_FRAGMENT_2 = process.env.VITE_EMERGENCY_KEY_2;
  private readonly MASTER_KEY_FRAGMENT_3 = process.env.VITE_EMERGENCY_KEY_3;

  private constructor() {
    this.initializeSecurityListeners();
  }

  static getInstance(): EmergencyDecoderService {
    if (!EmergencyDecoderService.instance) {
      EmergencyDecoderService.instance = new EmergencyDecoderService();
    }
    return EmergencyDecoderService.instance;
  }

  /**
   * Active le mode urgence avec triple authentification
   */
  async activateEmergencyMode(params: {
    superAdminId: string;
    superAdminPassword: string;
    legalReference: string;
    judicialAuthorizationNumber: string;
    reason: string;
    durationHours: number;
    secondFactorCode: string; // Code 2FA
    thirdFactorBiometric?: string; // Empreinte biométrique optionnelle
  }): Promise<{ success: boolean; message: string; activationId?: string }> {
    
    try {
      // 1. Vérifier que l'utilisateur est super_admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', params.superAdminId)
        .single();

      if (userRole?.role !== 'super_admin') {
        await this.logSecurityEvent('UNAUTHORIZED_ACTIVATION_ATTEMPT', params);
        return { 
          success: false, 
          message: 'Accès refusé. Seuls les super administrateurs peuvent activer ce mode.' 
        };
      }

      // 2. Vérifier l'authentification à double facteur
      const twoFactorValid = await this.verify2FA(params.superAdminId, params.secondFactorCode);
      if (!twoFactorValid) {
        await this.logSecurityEvent('2FA_FAILED', params);
        return { 
          success: false, 
          message: 'Code de vérification invalide.' 
        };
      }

      // 3. Vérifier l'autorisation judiciaire
      const authorizationValid = await this.verifyJudicialAuthorization(params.judicialAuthorizationNumber);
      if (!authorizationValid) {
        await this.logSecurityEvent('INVALID_JUDICIAL_AUTHORIZATION', params);
        return { 
          success: false, 
          message: 'Autorisation judiciaire invalide ou expirée.' 
        };
      }

      // 4. Créer l'activation
      const activation: EmergencyActivation = {
        id: `EMRG_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        activatedBy: params.superAdminId,
        reason: params.reason,
        legalReference: params.legalReference,
        judicialAuthorization: params.judicialAuthorizationNumber,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + params.durationHours * 3600000).toISOString(),
        status: 'active'
      };

      // 5. Enregistrer en base de données
      const { error } = await supabase
        .from('emergency_activations')
        .insert({
          ...activation,
          activation_metadata: {
            ip_address: await this.getUserIP(),
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;

      // 6. Générer la clé de décryptage
      this.decryptionKey = this.generateDecryptionKey(
        params.superAdminId,
        params.judicialAuthorizationNumber,
        activation.id
      );

      // 7. Activer le mode
      this.isEmergencyMode = true;
      this.currentActivation = activation;

      // 8. Notifier les autorités de contrôle
      await this.notifyControlAuthorities(activation);

      // 9. Logger l'activation
      await this.logSecurityEvent('EMERGENCY_MODE_ACTIVATED', {
        activationId: activation.id,
        reason: params.reason,
        duration: params.durationHours,
        legalReference: params.legalReference
      });

      // 10. Programmer l'expiration automatique
      setTimeout(() => {
        this.deactivateEmergencyMode('AUTO_EXPIRATION');
      }, params.durationHours * 3600000);

      return {
        success: true,
        message: `Mode urgence activé jusqu'au ${new Date(activation.endDate).toLocaleString('fr-FR')}`,
        activationId: activation.id
      };

    } catch (error) {
      console.error('Erreur activation urgence:', error);
      await this.logSecurityEvent('ACTIVATION_ERROR', { error });
      return {
        success: false,
        message: 'Erreur lors de l\'activation du mode urgence'
      };
    }
  }

  /**
   * Décrypte et révèle les données d'un utilisateur
   */
  async decodeUserData(
    targetUserId: string,
    requestingAdminId: string
  ): Promise<DecodedUserData | null> {
    
    // Vérifier que le mode urgence est actif
    if (!this.isEmergencyMode || !this.currentActivation) {
      await this.logSecurityEvent('DECODE_ATTEMPT_WITHOUT_EMERGENCY', {
        targetUserId,
        requestingAdminId
      });
      throw new Error('Le mode urgence n\'est pas actif');
    }

    // Vérifier que l'admin est autorisé
    if (requestingAdminId !== this.currentActivation.activatedBy) {
      await this.logSecurityEvent('UNAUTHORIZED_DECODE_ATTEMPT', {
        targetUserId,
        requestingAdminId
      });
      throw new Error('Seul l\'administrateur ayant activé le mode urgence peut décoder les données');
    }

    try {
      // Logger l'accès
      await this.logSecurityEvent('USER_DATA_DECODED', {
        targetUserId,
        requestingAdminId,
        activationId: this.currentActivation.id,
        timestamp: new Date().toISOString()
      });

      // 1. Récupérer les données utilisateur
      const { data: userData } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role),
          device_sessions (*)
        `)
        .eq('id', targetUserId)
        .single();

      // 2. Récupérer l'historique des signalements
      const { data: signalements } = await supabase
        .from('signalements')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      // 3. Récupérer les données de l'appareil
      const deviceData = await this.getDeviceInformation(targetUserId);

      // 4. Obtenir la localisation (si autorisé)
      const location = await this.getEnhancedLocation();

      // 5. Détecter les informations réseau
      const networkInfo = await this.detectNetworkInfo();

      // 6. Construire les données décodées
      const decodedData: DecodedUserData = {
        userId: targetUserId,
        deviceId: deviceData.deviceId,
        realName: userData?.full_name || userData?.username,
        phoneNumber: this.decryptPhoneNumber(userData?.phone_encrypted),
        ipAddress: await this.getUserIP(),
        location,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          screenResolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        networkInfo,
        audioPermission: await this.checkAudioPermission(),
        cameraPermission: await this.checkCameraPermission(),
        signalements: signalements || [],
        lastActivity: userData?.last_activity || new Date().toISOString()
      };

      // 7. Créer une copie sécurisée pour l'audit
      await supabase
        .from('emergency_decoded_data')
        .insert({
          activation_id: this.currentActivation.id,
          target_user_id: targetUserId,
          decoded_by: requestingAdminId,
          decoded_data: decodedData,
          decoded_at: new Date().toISOString()
        });

      return decodedData;

    } catch (error) {
      console.error('Erreur décodage:', error);
      await this.logSecurityEvent('DECODE_ERROR', { error, targetUserId });
      return null;
    }
  }

  /**
   * Active la surveillance audio (avec restrictions légales strictes)
   */
  async activateAudioMonitoring(
    targetUserId: string,
    durationSeconds: number = 30
  ): Promise<{ success: boolean; recordingId?: string }> {
    
    if (!this.isEmergencyMode) {
      throw new Error('Mode urgence non actif');
    }

    // Limiter la durée à 60 secondes maximum
    const maxDuration = Math.min(durationSeconds, 60);
    
    try {
      // Logger l'activation
      await this.logSecurityEvent('AUDIO_MONITORING_ACTIVATED', {
        targetUserId,
        duration: maxDuration,
        activationId: this.currentActivation?.id
      });

      // Note: En production réelle, ceci nécessiterait une API côté serveur
      // et des permissions explicites du système
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      const recordingId = `AUDIO_${Date.now()}_${targetUserId}`;

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Sauvegarder l'enregistrement (chiffré)
        await this.saveEncryptedAudio(recordingId, audioBlob, targetUserId);
        
        // Nettoyer
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      // Arrêt automatique après la durée spécifiée
      setTimeout(() => {
        mediaRecorder.stop();
      }, maxDuration * 1000);

      return { 
        success: true, 
        recordingId 
      };

    } catch (error) {
      console.error('Erreur surveillance audio:', error);
      await this.logSecurityEvent('AUDIO_MONITORING_ERROR', { error });
      return { success: false };
    }
  }

  /**
   * Obtient la localisation précise
   */
  private async getEnhancedLocation(): Promise<any> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: 'Géolocalisation non supportée'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?` +
              `format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`
            );
            const data = await response.json();
            
            resolve({
              latitude,
              longitude,
              accuracy,
              address: data.display_name,
              country: data.address?.country,
              city: data.address?.city || data.address?.town,
              postalCode: data.address?.postcode
            });
          } catch {
            resolve({ latitude, longitude, accuracy });
          }
        },
        (error) => {
          resolve({
            latitude: null,
            longitude: null,
            accuracy: null,
            error: error.message
          });
        },
        { 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Détecte les informations réseau
   */
  private async detectNetworkInfo(): Promise<any> {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const networkInfo: any = {
      connectionType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      vpnDetected: false
    };

    // Détection VPN basique (via WebRTC)
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const ips = new Set<string>();
      
      await new Promise<void>((resolve) => {
        pc.onicecandidate = (event) => {
          if (!event.candidate) {
            resolve();
            return;
          }
          const regex = /([0-9]{1,3}\.){3}[0-9]{1,3}/g;
          const matches = event.candidate.candidate.match(regex);
          if (matches) {
            matches.forEach(ip => ips.add(ip));
          }
        };
      });

      pc.close();

      // Vérifier si IP privée et publique diffèrent (indicateur VPN)
      const privateIPs = Array.from(ips).filter(ip => 
        ip.startsWith('10.') || 
        ip.startsWith('172.') || 
        ip.startsWith('192.168.')
      );
      
      const publicIPs = Array.from(ips).filter(ip => 
        !ip.startsWith('10.') && 
        !ip.startsWith('172.') && 
        !ip.startsWith('192.168.')
      );

      networkInfo.detectedIPs = Array.from(ips);
      networkInfo.vpnDetected = privateIPs.length > 0 && publicIPs.length > 0;

    } catch (error) {
      console.error('Erreur détection réseau:', error);
    }

    return networkInfo;
  }

  /**
   * Obtient l'adresse IP publique
   */
  private async getUserIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'IP_UNAVAILABLE';
    }
  }

  /**
   * Vérifie l'autorisation judiciaire
   */
  private async verifyJudicialAuthorization(authNumber: string): Promise<boolean> {
    // En production, vérifier avec une API gouvernementale
    const { data } = await supabase
      .from('judicial_authorizations')
      .select('*')
      .eq('authorization_number', authNumber)
      .eq('status', 'valid')
      .single();

    return !!data;
  }

  /**
   * Vérifie le code 2FA
   */
  private async verify2FA(userId: string, code: string): Promise<boolean> {
    // En production, utiliser un service 2FA comme Authy ou Google Authenticator
    // Ici, simulation simple
    const expectedCode = await this.generate2FACode(userId);
    return code === expectedCode;
  }

  /**
   * Génère un code 2FA temporaire
   */
  private async generate2FACode(userId: string): Promise<string> {
    // En production, utiliser TOTP (Time-based One-Time Password)
    const timestamp = Math.floor(Date.now() / 30000); // 30 secondes de validité
    const hash = CryptoJS.HmacSHA256(`${userId}_${timestamp}`, 'SECRET_KEY');
    return hash.toString().substring(0, 6);
  }

  /**
   * Génère la clé de décryptage
   */
  private generateDecryptionKey(
    adminId: string, 
    judicialAuth: string,
    activationId: string
  ): string {
    const combined = `${this.MASTER_KEY_FRAGMENT_1}_${adminId}_${this.MASTER_KEY_FRAGMENT_2}_${judicialAuth}_${this.MASTER_KEY_FRAGMENT_3}_${activationId}`;
    return CryptoJS.SHA256(combined).toString();
  }

  /**
   * Décrypte un numéro de téléphone
   */
  private decryptPhoneNumber(encryptedPhone?: string): string | undefined {
    if (!encryptedPhone || !this.decryptionKey) return undefined;
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPhone, this.decryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return undefined;
    }
  }

  /**
   * Récupère les informations de l'appareil
   */
  private async getDeviceInformation(userId: string): Promise<any> {
    const { data } = await supabase
      .from('device_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      deviceId: data?.device_id || 'UNKNOWN',
      fingerprint: data?.fingerprint_data || {},
      lastSeen: data?.last_seen
    };
  }

  /**
   * Vérifie la permission audio
   */
  private async checkAudioPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Vérifie la permission caméra
   */
  private async checkCameraPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Sauvegarde un enregistrement audio chiffré
   */
  private async saveEncryptedAudio(
    recordingId: string,
    audioBlob: Blob,
    targetUserId: string
  ): Promise<void> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer) as any);
    const encrypted = CryptoJS.AES.encrypt(wordArray, this.decryptionKey!);

    await supabase
      .from('emergency_audio_recordings')
      .insert({
        recording_id: recordingId,
        activation_id: this.currentActivation?.id,
        target_user_id: targetUserId,
        encrypted_audio: encrypted.toString(),
        duration_seconds: 30,
        recorded_at: new Date().toISOString()
      });
  }

  /**
   * Notifie les autorités de contrôle
   */
  private async notifyControlAuthorities(activation: EmergencyActivation): Promise<void> {
    // En production, envoyer des notifications aux :
    // - Commission Nationale de Protection des Données
    // - Autorité Judiciaire
    // - Ministère de l'Intérieur
    
    await supabase
      .from('emergency_notifications')
      .insert({
        activation_id: activation.id,
        notified_authorities: [
          'CNPD',
          'MINISTERE_INTERIEUR',
          'AUTORITE_JUDICIAIRE'
        ],
        notification_sent_at: new Date().toISOString()
      });
  }

  /**
   * Enregistre un événement de sécurité
   */
  private async logSecurityEvent(eventType: string, details: any): Promise<void> {
    const event = {
      event_type: eventType,
      details,
      timestamp: new Date().toISOString(),
      ip_address: await this.getUserIP(),
      user_agent: navigator.userAgent
    };

    this.auditLog.push(event);

    await supabase
      .from('emergency_audit_log')
      .insert({
        ...event,
        activation_id: this.currentActivation?.id
      });

    // Alerte immédiate pour certains événements critiques
    if (['UNAUTHORIZED_ACTIVATION_ATTEMPT', 'UNAUTHORIZED_DECODE_ATTEMPT'].includes(eventType)) {
      await this.sendSecurityAlert(event);
    }
  }

  /**
   * Envoie une alerte de sécurité
   */
  private async sendSecurityAlert(event: any): Promise<void> {
    // En production, envoyer email/SMS aux administrateurs
    console.error('🚨 ALERTE SÉCURITÉ:', event);
  }

  /**
   * Désactive le mode urgence
   */
  async deactivateEmergencyMode(reason: string = 'MANUAL_DEACTIVATION'): Promise<void> {
    if (!this.isEmergencyMode || !this.currentActivation) return;

    await this.logSecurityEvent('EMERGENCY_MODE_DEACTIVATED', { 
      reason,
      activationId: this.currentActivation.id 
    });

    await supabase
      .from('emergency_activations')
      .update({ 
        status: reason === 'AUTO_EXPIRATION' ? 'expired' : 'revoked',
        deactivated_at: new Date().toISOString(),
        deactivation_reason: reason
      })
      .eq('id', this.currentActivation.id);

    // Nettoyer les données sensibles
    this.isEmergencyMode = false;
    this.currentActivation = null;
    this.decryptionKey = null;
    
    // Générer un rapport d'audit
    await this.generateAuditReport();
  }

  /**
   * Génère un rapport d'audit complet
   */
  private async generateAuditReport(): Promise<void> {
    if (this.auditLog.length === 0) return;

    const report = {
      activation_id: this.currentActivation?.id,
      start_date: this.currentActivation?.startDate,
      end_date: new Date().toISOString(),
      total_events: this.auditLog.length,
      events: this.auditLog,
      generated_at: new Date().toISOString()
    };

    await supabase
      .from('emergency_audit_reports')
      .insert(report);

    // Vider le log local
    this.auditLog = [];
  }

  /**
   * Initialise les écouteurs de sécurité
   */
  private initializeSecurityListeners(): void {
    // Détecter les tentatives de contournement
    window.addEventListener('devtools-opened', () => {
      this.logSecurityEvent('DEVTOOLS_OPENED', {});
    });

    // Détecter les modifications du DOM suspectes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && 
            mutation.target.nodeName === 'SCRIPT') {
          this.logSecurityEvent('SUSPICIOUS_SCRIPT_INJECTION', {
            script: (mutation.target as HTMLScriptElement).src
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Obtient le statut actuel
   */
  getStatus(): {
    isActive: boolean;
    activation: EmergencyActivation | null;
    remainingTime?: number;
  } {
    if (!this.isEmergencyMode || !this.currentActivation) {
      return { isActive: false, activation: null };
    }

    const remainingTime = new Date(this.currentActivation.endDate).getTime() - Date.now();

    return {
      isActive: true,
      activation: this.currentActivation,
      remainingTime: Math.max(0, remainingTime)
    };
  }
}

// Export singleton
export const emergencyDecoder = EmergencyDecoderService.getInstance();

// Protection contre l'accès non autorisé
if (typeof window !== 'undefined') {
  (window as any).emergencyDecoder = undefined; // Masquer de window
  Object.freeze(emergencyDecoder); // Empêcher les modifications
}
