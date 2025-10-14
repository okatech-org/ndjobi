-- Script de correction pour la base de données Supabase NDJOBI
-- À exécuter dans l'interface Supabase SQL Editor
-- Date: 2025-10-14

-- 1. Ajouter la colonne 'role' à la table profiles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role text;
        COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur: user, agent, admin, super_admin';
    END IF;
END $$;

-- 2. Créer la table device_sessions
CREATE TABLE IF NOT EXISTS public.device_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id text NOT NULL,
    fingerprint_hash text NOT NULL,
    user_agent text,
    ip_address inet,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    linked_at timestamp with time zone,
    last_activity timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    UNIQUE(device_id),
    UNIQUE(fingerprint_hash)
);

-- 3. Créer la table device_signalements
CREATE TABLE IF NOT EXISTS public.device_signalements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id text NOT NULL,
    signalement_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    migrated_at timestamp with time zone,
    migrated_to_user uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(device_id, signalement_id)
);

-- 4. Créer la table device_projets
CREATE TABLE IF NOT EXISTS public.device_projets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id text NOT NULL,
    projet_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    migrated_at timestamp with time zone,
    migrated_to_user uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(device_id, projet_id)
);

-- 5. Ajouter les colonnes manquantes à signalements
DO $$ 
BEGIN
    -- device_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'device_id'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN device_id text;
    END IF;

    -- gps_latitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'gps_latitude'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN gps_latitude double precision;
    END IF;

    -- gps_longitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'gps_longitude'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN gps_longitude double precision;
    END IF;

    -- submission_method
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'submission_method'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN submission_method text DEFAULT 'form';
    END IF;

    -- Permettre user_id NULL
    ALTER TABLE public.signalements ALTER COLUMN user_id DROP NOT NULL;
END $$;

-- 6. Ajouter device_id à projets
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projets' 
        AND column_name = 'device_id'
    ) THEN
        ALTER TABLE public.projets ADD COLUMN device_id text;
    END IF;
    ALTER TABLE public.projets ALTER COLUMN user_id DROP NOT NULL;
END $$;

-- 7. Créer les index
CREATE INDEX IF NOT EXISTS idx_device_sessions_device_id ON public.device_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_fingerprint_hash ON public.device_sessions(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON public.device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_signalements_device_id ON public.device_signalements(device_id);
CREATE INDEX IF NOT EXISTS idx_device_projets_device_id ON public.device_projets(device_id);
CREATE INDEX IF NOT EXISTS idx_signalements_device_id ON public.signalements(device_id);
CREATE INDEX IF NOT EXISTS idx_projets_device_id ON public.projets(device_id);

-- 8. Activer RLS sur les nouvelles tables
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_projets ENABLE ROW LEVEL SECURITY;

-- 9. Créer les politiques RLS
DROP POLICY IF EXISTS "Users can view their own device sessions" ON public.device_sessions;
CREATE POLICY "Users can view their own device sessions" ON public.device_sessions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "System can insert device sessions" ON public.device_sessions;
CREATE POLICY "System can insert device sessions" ON public.device_sessions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update device sessions" ON public.device_sessions;
CREATE POLICY "System can update device sessions" ON public.device_sessions
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "System can manage device signalements" ON public.device_signalements;
CREATE POLICY "System can manage device signalements" ON public.device_signalements
    FOR ALL USING (true);

DROP POLICY IF EXISTS "System can manage device projets" ON public.device_projets;
CREATE POLICY "System can manage device projets" ON public.device_projets
    FOR ALL USING (true);

-- 10. Mettre à jour les politiques existantes
DROP POLICY IF EXISTS "Users can view their own signalements" ON public.signalements;
CREATE POLICY "Users can view their own signalements" ON public.signalements
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        device_id IN (
            SELECT device_id FROM public.device_sessions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view their own projets" ON public.projets;
CREATE POLICY "Users can view their own projets" ON public.projets
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR 
        device_id IN (
            SELECT device_id FROM public.device_sessions 
            WHERE user_id = auth.uid()
        )
    );

-- 11. Créer les fonctions utilitaires
CREATE OR REPLACE FUNCTION public.migrate_device_to_user(device_id_param text, user_id_param uuid)
RETURNS TABLE (
    signalements_linked integer,
    projets_linked integer
) AS $$
DECLARE
    signalements_count integer := 0;
    projets_count integer := 0;
BEGIN
    -- Migrer les signalements
    UPDATE public.signalements 
    SET user_id = user_id_param, is_anonymous = false
    WHERE id IN (
        SELECT signalement_id 
        FROM public.device_signalements 
        WHERE device_id = device_id_param AND migrated_at IS NULL
    );
    
    GET DIAGNOSTICS signalements_count = ROW_COUNT;
    
    -- Marquer comme migrés
    UPDATE public.device_signalements 
    SET migrated_at = now(), migrated_to_user = user_id_param
    WHERE device_id = device_id_param AND migrated_at IS NULL;
    
    -- Migrer les projets
    UPDATE public.projets 
    SET user_id = user_id_param, is_anonymous = false
    WHERE id IN (
        SELECT projet_id 
        FROM public.device_projets 
        WHERE device_id = device_id_param AND migrated_at IS NULL
    );
    
    GET DIAGNOSTICS projets_count = ROW_COUNT;
    
    -- Marquer comme migrés
    UPDATE public.device_projets 
    SET migrated_at = now(), migrated_to_user = user_id_param
    WHERE device_id = device_id_param AND migrated_at IS NULL;
    
    -- Lier la session
    UPDATE public.device_sessions 
    SET user_id = user_id_param, linked_at = now()
    WHERE device_id = device_id_param;
    
    RETURN QUERY SELECT signalements_count, projets_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Ajouter des commentaires
COMMENT ON TABLE public.device_sessions IS 'Sessions des appareils pour le suivi anonyme';
COMMENT ON TABLE public.device_signalements IS 'Liens entre appareils et signalements anonymes';
COMMENT ON TABLE public.device_projets IS 'Liens entre appareils et projets anonymes';
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur: user, agent, admin, super_admin';
COMMENT ON COLUMN public.signalements.device_id IS 'ID de l''appareil pour les signalements anonymes';
COMMENT ON COLUMN public.signalements.gps_latitude IS 'Latitude GPS du signalement';
COMMENT ON COLUMN public.signalements.gps_longitude IS 'Longitude GPS du signalement';
COMMENT ON COLUMN public.signalements.submission_method IS 'Méthode de soumission: form, chat_ai, api';

-- Message de confirmation
SELECT 'Base de données NDJOBI corrigée avec succès!' as status;
