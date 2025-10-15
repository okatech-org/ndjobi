-- Migration pour corriger le schéma de la base de données NDJOBI
-- Date: 2025-10-14
-- Description: Ajout des colonnes manquantes et création des tables pour le système d'identité des appareils

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

-- 2. Créer la table device_sessions si elle n'existe pas
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

-- 3. Créer la table device_signalements si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.device_signalements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id text NOT NULL,
    signalement_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    migrated_at timestamp with time zone,
    migrated_to_user uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(device_id, signalement_id)
);

-- 4. Créer la table device_projets si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.device_projets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id text NOT NULL,
    projet_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    migrated_at timestamp with time zone,
    migrated_to_user uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(device_id, projet_id)
);

-- 5. Ajouter les colonnes manquantes à la table signalements
DO $$ 
BEGIN
    -- Ajouter device_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'device_id'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN device_id text;
    END IF;

    -- Ajouter gps_latitude si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'gps_latitude'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN gps_latitude double precision;
    END IF;

    -- Ajouter gps_longitude si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'gps_longitude'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN gps_longitude double precision;
    END IF;

    -- Ajouter submission_method si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'submission_method'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN submission_method text DEFAULT 'form';
    END IF;

    -- Permettre user_id NULL pour les signalements anonymes
    ALTER TABLE public.signalements ALTER COLUMN user_id DROP NOT NULL;
END $$;

-- 6. Ajouter les colonnes manquantes à la table projets
DO $$ 
BEGIN
    -- Ajouter device_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projets' 
        AND column_name = 'device_id'
    ) THEN
        ALTER TABLE public.projets ADD COLUMN device_id text;
    END IF;

    -- Permettre user_id NULL pour les projets anonymes
    ALTER TABLE public.projets ALTER COLUMN user_id DROP NOT NULL;
END $$;

-- 7. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_device_sessions_device_id ON public.device_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_fingerprint_hash ON public.device_sessions(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON public.device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_signalements_device_id ON public.device_signalements(device_id);
CREATE INDEX IF NOT EXISTS idx_device_signalements_signalement_id ON public.device_signalements(signalement_id);
CREATE INDEX IF NOT EXISTS idx_device_projets_device_id ON public.device_projets(device_id);
CREATE INDEX IF NOT EXISTS idx_device_projets_projet_id ON public.device_projets(projet_id);
CREATE INDEX IF NOT EXISTS idx_signalements_device_id ON public.signalements(device_id);
CREATE INDEX IF NOT EXISTS idx_projets_device_id ON public.projets(device_id);

-- 8. Créer les politiques RLS pour les nouvelles tables
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_projets ENABLE ROW LEVEL SECURITY;

-- Politiques pour device_sessions
DROP POLICY IF EXISTS "Users can view their own device sessions" ON public.device_sessions;
CREATE POLICY "Users can view their own device sessions" ON public.device_sessions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "System can insert device sessions" ON public.device_sessions;
CREATE POLICY "System can insert device sessions" ON public.device_sessions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update device sessions" ON public.device_sessions;
CREATE POLICY "System can update device sessions" ON public.device_sessions
    FOR UPDATE USING (true);

-- Politiques pour device_signalements
DROP POLICY IF EXISTS "System can manage device signalements" ON public.device_signalements;
CREATE POLICY "System can manage device signalements" ON public.device_signalements
    FOR ALL USING (true);

-- Politiques pour device_projets
DROP POLICY IF EXISTS "System can manage device projets" ON public.device_projets;
CREATE POLICY "System can manage device projets" ON public.device_projets
    FOR ALL USING (true);

-- 9. Créer les fonctions utilitaires
DROP FUNCTION IF EXISTS public.get_device_history(text);
CREATE FUNCTION public.get_device_history(device_id_param text)
RETURNS TABLE (
    signalements_count bigint,
    projets_count bigint,
    last_activity timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ds.signalement_id) as signalements_count,
        COUNT(DISTINCT dp.projet_id) as projets_count,
        MAX(GREATEST(ds.created_at, dp.created_at)) as last_activity
    FROM public.device_signalements ds
    FULL OUTER JOIN public.device_projets dp ON ds.device_id = dp.device_id
    WHERE ds.device_id = device_id_param OR dp.device_id = device_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Créer la fonction de migration des appareils vers utilisateurs
DROP FUNCTION IF EXISTS public.migrate_device_to_user(text, uuid);
CREATE FUNCTION public.migrate_device_to_user(device_id_param text, user_id_param uuid)
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
    
    -- Marquer les signalements comme migrés
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
    
    -- Marquer les projets comme migrés
    UPDATE public.device_projets 
    SET migrated_at = now(), migrated_to_user = user_id_param
    WHERE device_id = device_id_param AND migrated_at IS NULL;
    
    -- Lier la session de l'appareil à l'utilisateur
    UPDATE public.device_sessions 
    SET user_id = user_id_param, linked_at = now()
    WHERE device_id = device_id_param;
    
    RETURN QUERY SELECT signalements_count, projets_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Créer le trigger pour la migration automatique lors de l'inscription
DROP TRIGGER IF EXISTS trigger_auto_migrate_device ON auth.users;
DROP FUNCTION IF EXISTS public.auto_migrate_device_on_signup() CASCADE;
CREATE FUNCTION public.auto_migrate_device_on_signup()
RETURNS trigger AS $$
DECLARE
    device_id_param text;
BEGIN
    -- Récupérer le device_id depuis les données de l'utilisateur
    -- Cette fonction sera appelée après l'inscription d'un utilisateur
    -- et tentera de migrer les données de l'appareil si un device_id est fourni
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Créer une vue pour les statistiques des appareils
CREATE OR REPLACE VIEW public.device_statistics AS
SELECT 
    COUNT(*) as total_devices,
    COUNT(user_id) as linked_devices,
    COUNT(*) - COUNT(user_id) as anonymous_devices,
    COUNT(DISTINCT ds.device_id) as devices_with_signalements,
    COUNT(DISTINCT dp.device_id) as devices_with_projects
FROM public.device_sessions ds
LEFT JOIN public.device_signalements ds2 ON ds.device_id = ds2.device_id
LEFT JOIN public.device_projets dp ON ds.device_id = dp.device_id;

-- 13. Commentaires sur les tables
COMMENT ON TABLE public.device_sessions IS 'Sessions des appareils pour le suivi anonyme';
COMMENT ON TABLE public.device_signalements IS 'Liens entre appareils et signalements anonymes';
COMMENT ON TABLE public.device_projets IS 'Liens entre appareils et projets anonymes';
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur: user, agent, admin, super_admin';
COMMENT ON COLUMN public.signalements.device_id IS 'ID de l''appareil pour les signalements anonymes';
COMMENT ON COLUMN public.signalements.gps_latitude IS 'Latitude GPS du signalement';
COMMENT ON COLUMN public.signalements.gps_longitude IS 'Longitude GPS du signalement';
COMMENT ON COLUMN public.signalements.submission_method IS 'Méthode de soumission: form, chat_ai, api';

-- 14. Mettre à jour les politiques RLS existantes pour permettre les signalements anonymes
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

-- 15. Nettoyage et optimisation
-- Note: VACUUM doit être exécuté manuellement en dehors d'une transaction
-- VACUUM ANALYZE public.device_sessions;
-- VACUUM ANALYZE public.device_signalements;
-- VACUUM ANALYZE public.device_projets;
-- VACUUM ANALYZE public.signalements;
-- VACUUM ANALYZE public.projets;
