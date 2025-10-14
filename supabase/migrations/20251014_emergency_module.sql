-- ============================================
-- MIGRATION: Module d'Urgence Sécurisé
-- Date: 2025-10-14
-- Description: Tables pour le module d'urgence avec décryptage contrôlé
-- ============================================

-- ⚠️ AVERTISSEMENT CRITIQUE ⚠️
-- Ce module est strictement encadré par la loi
-- Utilisation uniquement en cas d'état d'urgence déclaré

-- ============================================
-- TABLE: Autorisations Judiciaires
-- ============================================
CREATE TABLE IF NOT EXISTS public.judicial_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authorization_number TEXT UNIQUE NOT NULL,
  issued_by TEXT NOT NULL, -- Autorité émettrice
  issued_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL, -- Portée de l'autorisation
  legal_basis TEXT NOT NULL, -- Base légale
  status TEXT CHECK (status IN ('valid', 'expired', 'revoked', 'used')) DEFAULT 'valid',
  attached_documents JSONB, -- Documents joints
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.judicial_authorizations IS 'Autorisations judiciaires pour activation du mode urgence';

-- ============================================
-- TABLE: Activations d'Urgence
-- ============================================
CREATE TABLE IF NOT EXISTS public.emergency_activations (
  id TEXT PRIMARY KEY, -- Format: EMRG_timestamp_random
  
  -- Qui a activé
  activated_by UUID NOT NULL REFERENCES auth.users(id),
  activation_metadata JSONB, -- IP, user agent, etc.
  
  -- Pourquoi
  reason TEXT NOT NULL,
  legal_reference TEXT NOT NULL,
  judicial_authorization TEXT NOT NULL REFERENCES public.judicial_authorizations(authorization_number),
  
  -- Quand
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  duration_hours INTEGER NOT NULL,
  
  -- Statut
  status TEXT CHECK (status IN ('pending_approval', 'active', 'expired', 'revoked')) DEFAULT 'pending_approval',
  deactivated_at TIMESTAMPTZ,
  deactivation_reason TEXT,
  
  -- Validation multi-facteurs
  two_factor_validated BOOLEAN DEFAULT FALSE,
  biometric_validated BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emergency_activations_status ON public.emergency_activations(status);
CREATE INDEX idx_emergency_activations_activated_by ON public.emergency_activations(activated_by);

COMMENT ON TABLE public.emergency_activations IS 'Historique des activations du mode urgence';

-- ============================================
-- TABLE: Journal d'Audit Sécurisé
-- ============================================
CREATE TABLE IF NOT EXISTS public.emergency_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_id TEXT REFERENCES public.emergency_activations(id),
  event_type TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_activation ON public.emergency_audit_log(activation_id);
CREATE INDEX idx_audit_log_event_type ON public.emergency_audit_log(event_type);
CREATE INDEX idx_audit_log_timestamp ON public.emergency_audit_log(timestamp DESC);

COMMENT ON TABLE public.emergency_audit_log IS 'Journal d''audit complet - Toutes les actions sont enregistrées';

-- ============================================
-- TABLE: Données Décodées
-- ============================================
CREATE TABLE IF NOT EXISTS public.emergency_decoded_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_id TEXT NOT NULL REFERENCES public.emergency_activations(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  decoded_by UUID NOT NULL REFERENCES auth.users(id),
  decoded_data JSONB NOT NULL, -- Données décodées (chiffrées)
  decoded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decoded_data_activation ON public.emergency_decoded_data(activation_id);
CREATE INDEX idx_decoded_data_target ON public.emergency_decoded_data(target_user_id);
CREATE INDEX idx_decoded_data_by ON public.emergency_decoded_data(decoded_by);

COMMENT ON TABLE public.emergency_decoded_data IS 'Historique des données décodées en mode urgence';

-- ============================================
-- TABLE: Enregistrements Audio
-- ============================================
CREATE TABLE IF NOT EXISTS public.emergency_audio_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id TEXT UNIQUE NOT NULL,
  activation_id TEXT NOT NULL REFERENCES public.emergency_activations(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  encrypted_audio TEXT NOT NULL, -- Audio chiffré AES-256
  duration_seconds INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  legal_validation JSONB, -- Validation légale de l'enregistrement
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audio_recordings_activation ON public.emergency_audio_recordings(activation_id);
CREATE INDEX idx_audio_recordings_target ON public.emergency_audio_recordings(target_user_id);

COMMENT ON TABLE public.emergency_audio_recordings IS 'Enregistrements audio d''urgence (chiffrés)';

-- ============================================
-- TABLE: Notifications aux Autorités
-- ============================================
CREATE TABLE IF NOT EXISTS public.emergency_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_id TEXT NOT NULL REFERENCES public.emergency_activations(id),
  notified_authorities TEXT[] NOT NULL,
  notification_type TEXT NOT NULL,
  notification_content JSONB,
  notification_sent_at TIMESTAMPTZ NOT NULL,
  acknowledgment_received BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.emergency_notifications IS 'Notifications envoyées aux autorités de contrôle';

-- ============================================
-- TABLE: Rapports d'Audit
-- ============================================
CREATE TABLE IF NOT EXISTS public.emergency_audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_id TEXT REFERENCES public.emergency_activations(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_events INTEGER NOT NULL,
  events JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  transmitted_to TEXT[], -- Autorités ayant reçu le rapport
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.emergency_audit_reports IS 'Rapports d''audit consolidés';

-- ============================================
-- FONCTION: Vérifier si Super Admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_roles.user_id = is_super_admin.user_id 
    AND role = 'super_admin'
  );
END;
$$;

-- ============================================
-- FONCTION: Logger un événement de sécurité
-- ============================================
CREATE OR REPLACE FUNCTION public.log_emergency_event(
  p_event_type TEXT,
  p_details JSONB,
  p_activation_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.emergency_audit_log (
    activation_id,
    event_type,
    details,
    timestamp,
    ip_address,
    user_agent
  ) VALUES (
    p_activation_id,
    p_event_type,
    p_details,
    NOW(),
    inet_client_addr(),
    current_setting('request.headers')::json->>'user-agent'
  )
  RETURNING id INTO v_event_id;
  
  -- Alertes pour événements critiques
  IF p_event_type IN ('UNAUTHORIZED_ACTIVATION_ATTEMPT', 'UNAUTHORIZED_DECODE_ATTEMPT') THEN
    PERFORM public.send_security_alert(p_event_type, p_details);
  END IF;
  
  RETURN v_event_id;
END;
$$;

-- ============================================
-- FONCTION: Envoyer une alerte de sécurité
-- ============================================
CREATE OR REPLACE FUNCTION public.send_security_alert(
  p_event_type TEXT,
  p_details JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- En production : envoyer email/SMS aux administrateurs
  -- Pour l'instant, juste logger
  RAISE NOTICE '🚨 ALERTE SÉCURITÉ: % - %', p_event_type, p_details;
END;
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Judicial Authorizations: Lecture seule pour super admins
ALTER TABLE public.judicial_authorizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view judicial authorizations"
  ON public.judicial_authorizations
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "System can manage judicial authorizations"
  ON public.judicial_authorizations
  FOR ALL
  USING (auth.uid() = '00000000-0000-0000-0000-000000000000'); -- System user

-- Emergency Activations: Super admins uniquement
ALTER TABLE public.emergency_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view emergency activations"
  ON public.emergency_activations
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can create emergency activations"
  ON public.emergency_activations
  FOR INSERT
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update their own activations"
  ON public.emergency_activations
  FOR UPDATE
  USING (activated_by = auth.uid() AND public.is_super_admin(auth.uid()));

-- Audit Log: Lecture pour super admins, écriture système
ALTER TABLE public.emergency_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit log"
  ON public.emergency_audit_log
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "System can write to audit log"
  ON public.emergency_audit_log
  FOR INSERT
  WITH CHECK (TRUE); -- Les insertions sont contrôlées côté application

-- Decoded Data: Super admins qui ont activé le mode
ALTER TABLE public.emergency_decoded_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view decoded data from their activations"
  ON public.emergency_decoded_data
  FOR SELECT
  USING (
    decoded_by = auth.uid() 
    AND public.is_super_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.emergency_activations 
      WHERE id = emergency_decoded_data.activation_id 
      AND activated_by = auth.uid()
    )
  );

CREATE POLICY "Super admins can insert decoded data"
  ON public.emergency_decoded_data
  FOR INSERT
  WITH CHECK (
    decoded_by = auth.uid() 
    AND public.is_super_admin(auth.uid())
  );

-- Audio Recordings: Accès très restreint
ALTER TABLE public.emergency_audio_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audio from their activations"
  ON public.emergency_audio_recordings
  FOR SELECT
  USING (
    recorded_by = auth.uid() 
    AND public.is_super_admin(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.emergency_activations 
      WHERE id = emergency_audio_recordings.activation_id 
      AND activated_by = auth.uid()
      AND status = 'active'
    )
  );

-- Notifications: Lecture pour super admins
ALTER TABLE public.emergency_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view notifications"
  ON public.emergency_notifications
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- Audit Reports: Lecture pour super admins
ALTER TABLE public.emergency_audit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit reports"
  ON public.emergency_audit_reports
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- ============================================
-- TRIGGER: Auto-expiration des activations
-- ============================================
CREATE OR REPLACE FUNCTION public.check_emergency_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier si l'activation a expiré
  IF NEW.end_date < NOW() AND NEW.status = 'active' THEN
    NEW.status = 'expired';
    NEW.deactivated_at = NOW();
    NEW.deactivation_reason = 'AUTO_EXPIRATION';
    
    -- Logger l'expiration
    PERFORM public.log_emergency_event(
      'EMERGENCY_MODE_AUTO_EXPIRED',
      jsonb_build_object('activation_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_check_emergency_expiration
  BEFORE UPDATE ON public.emergency_activations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_emergency_expiration();

-- ============================================
-- FONCTION: Nettoyer les données expirées
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_emergency_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER := 0;
BEGIN
  -- Supprimer les enregistrements audio > 7 jours
  DELETE FROM public.emergency_audio_recordings
  WHERE created_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Supprimer les données décodées > 30 jours
  DELETE FROM public.emergency_decoded_data
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Archiver les logs > 90 jours
  -- (En production, les transférer vers un système d'archivage)
  
  RETURN v_deleted_count;
END;
$$;

-- ============================================
-- VUE: Statistiques du Module d'Urgence
-- ============================================
CREATE OR REPLACE VIEW public.emergency_statistics AS
SELECT 
  COUNT(DISTINCT ea.id) as total_activations,
  COUNT(DISTINCT ea.id) FILTER (WHERE ea.status = 'active') as active_activations,
  COUNT(DISTINCT edd.id) as total_decodings,
  COUNT(DISTINCT ear.id) as total_audio_recordings,
  COUNT(DISTINCT eal.id) FILTER (WHERE eal.event_type LIKE '%UNAUTHORIZED%') as unauthorized_attempts,
  AVG(ea.duration_hours) as avg_activation_duration,
  MAX(ea.created_at) as last_activation
FROM public.emergency_activations ea
LEFT JOIN public.emergency_decoded_data edd ON ea.id = edd.activation_id
LEFT JOIN public.emergency_audio_recordings ear ON ea.id = ear.activation_id
LEFT JOIN public.emergency_audit_log eal ON ea.id = eal.activation_id;

COMMENT ON VIEW public.emergency_statistics IS 'Statistiques globales du module d''urgence';

-- ============================================
-- DONNÉES D'EXEMPLE : Autorisation Judiciaire de Test
-- ============================================
-- Ne pas exécuter en production
/*
INSERT INTO public.judicial_authorizations (
  authorization_number,
  issued_by,
  issued_date,
  expiry_date,
  scope,
  legal_basis,
  status
) VALUES (
  'AJ-TEST-2025-001',
  'Tribunal de Grande Instance - Test',
  NOW(),
  NOW() + INTERVAL '30 days',
  'Test du système d''urgence - Environnement de développement uniquement',
  'Article Test - Développement',
  'valid'
);
*/

-- ============================================
-- GRANTS
-- ============================================
GRANT SELECT ON public.emergency_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_emergency_event TO authenticated;

-- ============================================
-- COMMENTAIRES DE SÉCURITÉ
-- ============================================
COMMENT ON SCHEMA public IS '
⚠️ MODULE D''URGENCE - AVERTISSEMENT CRITIQUE ⚠️

Ce module est soumis aux régulations suivantes:
- Loi n°2009-013 relative à la protection des données
- Décret constitutionnel sur l''état d''urgence
- Autorisation judiciaire obligatoire
- Notification aux autorités de contrôle

Toute utilisation abusive est passible de:
- Poursuites judiciaires
- Révocation immédiate des accès
- Sanctions pénales

Tous les accès sont enregistrés et audités.
';

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
