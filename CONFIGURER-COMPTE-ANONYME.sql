-- Script pour configurer le compte anonyme par défaut
-- À exécuter dans le SQL Editor de Supabase

-- =====================================================
-- VÉRIFICATION ET CONFIGURATION DU COMPTE ANONYME
-- =====================================================

-- Vérifier que le compte anonyme existe
SELECT 
    'Vérification compte anonyme par défaut' as action,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            JOIN public.profiles p ON u.id = p.id
            JOIN public.user_roles ur ON u.id = ur.user_id
            WHERE u.email = '24177888009@ndjobi.com' 
            AND ur.role = 'user'
        ) THEN '✅ Compte anonyme par défaut configuré'
        ELSE '❌ Compte anonyme par défaut manquant'
    END as status;

-- =====================================================
-- CRÉER UNE TABLE POUR GÉRER LES SIGNALEMENTS ANONYMES
-- =====================================================

-- Table pour stocker les métadonnées des signalements anonymes
CREATE TABLE IF NOT EXISTS public.anonymous_reports_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.signalements(id) ON DELETE CASCADE,
    device_fingerprint TEXT,
    ip_info JSONB DEFAULT '{}',
    user_agent TEXT,
    screen_resolution TEXT,
    timezone TEXT,
    language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.anonymous_reports_metadata ENABLE ROW LEVEL SECURITY;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_anonymous_reports_metadata_report_id 
ON public.anonymous_reports_metadata(report_id);

-- RLS Policies pour les métadonnées anonymes
CREATE POLICY "Anonymous metadata view policy"
    ON public.anonymous_reports_metadata
    FOR SELECT
    USING (
        public.has_role(auth.uid(), 'agent') OR 
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'super_admin')
    );

CREATE POLICY "Anonymous metadata insert policy"
    ON public.anonymous_reports_metadata
    FOR INSERT
    WITH CHECK (true); -- Permettre l'insertion pour les signalements anonymes

-- =====================================================
-- FONCTION POUR CRÉER UN SIGNALEMENT ANONYME
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_anonymous_report(
    p_title TEXT,
    p_description TEXT,
    p_type TEXT,
    p_location TEXT DEFAULT NULL,
    p_device_info JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_anonymous_user_id UUID;
    v_report_id UUID;
BEGIN
    -- Trouver l'ID du compte anonyme par défaut
    SELECT u.id INTO v_anonymous_user_id
    FROM auth.users u
    JOIN public.user_roles ur ON u.id = ur.user_id
    WHERE u.email = '24177888009@ndjobi.com' 
    AND ur.role = 'user';
    
    IF v_anonymous_user_id IS NULL THEN
        RAISE EXCEPTION 'Compte anonyme par défaut non trouvé';
    END IF;
    
    -- Créer le signalement avec le compte anonyme
    INSERT INTO public.signalements (
        user_id,
        title,
        description,
        type,
        location,
        metadata,
        created_at
    ) VALUES (
        v_anonymous_user_id,
        p_title,
        p_description,
        p_type,
        p_location,
        p_device_info,
        NOW()
    ) RETURNING id INTO v_report_id;
    
    -- Ajouter les métadonnées anonymes
    INSERT INTO public.anonymous_reports_metadata (
        report_id,
        device_fingerprint,
        ip_info,
        user_agent,
        screen_resolution,
        timezone,
        language
    ) VALUES (
        v_report_id,
        p_device_info->>'device_fingerprint',
        p_device_info->'ip_info',
        p_device_info->>'user_agent',
        p_device_info->>'screen_resolution',
        p_device_info->>'timezone',
        p_device_info->>'language'
    );
    
    RETURN v_report_id;
END;
$$;

-- =====================================================
-- FONCTION POUR RÉCUPÉRER LES STATISTIQUES ANONYMES
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_anonymous_reports_stats()
RETURNS TABLE (
    total_anonymous_reports BIGINT,
    reports_last_24h BIGINT,
    reports_last_week BIGINT,
    reports_last_month BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_anonymous_reports,
        COUNT(*) FILTER (WHERE s.created_at >= NOW() - INTERVAL '24 hours') as reports_last_24h,
        COUNT(*) FILTER (WHERE s.created_at >= NOW() - INTERVAL '7 days') as reports_last_week,
        COUNT(*) FILTER (WHERE s.created_at >= NOW() - INTERVAL '30 days') as reports_last_month
    FROM public.signalements s
    JOIN public.anonymous_reports_metadata arm ON s.id = arm.report_id
    JOIN auth.users u ON s.user_id = u.id
    WHERE u.email = '24177888009@ndjobi.com';
END;
$$;

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

SELECT 
    'Configuration terminée' as status,
    'Compte anonyme par défaut configuré' as message,
    u.email,
    p.full_name,
    ur.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '24177888009@ndjobi.com';

-- Test de la fonction de création de signalement anonyme
-- (Commenté pour éviter la création d'un signalement de test)
/*
SELECT public.create_anonymous_report(
    'Test signalement anonyme',
    'Ceci est un test de signalement anonyme',
    'incident',
    'Libreville',
    '{"device_fingerprint": "test123", "user_agent": "Mozilla/5.0", "timezone": "Africa/Libreville"}'::jsonb
);
*/
