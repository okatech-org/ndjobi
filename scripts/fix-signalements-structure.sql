-- Script SQL pour corriger la structure de la table signalements
-- À exécuter dans Supabase SQL Editor
-- Date: 2025-10-14

-- 1. Rendre user_id nullable pour permettre les signalements anonymes
ALTER TABLE public.signalements 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Ajouter la colonne is_anonymous
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN is_anonymous boolean DEFAULT true;
        COMMENT ON COLUMN public.signalements.is_anonymous IS 'Indique si le signalement est anonyme';
    END IF;
END $$;

-- 3. Ajouter les colonnes GPS
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'gps_latitude'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN gps_latitude double precision;
        COMMENT ON COLUMN public.signalements.gps_latitude IS 'Latitude GPS du signalement';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'gps_longitude'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN gps_longitude double precision;
        COMMENT ON COLUMN public.signalements.gps_longitude IS 'Longitude GPS du signalement';
    END IF;
END $$;

-- 4. Ajouter submission_method
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'submission_method'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN submission_method text DEFAULT 'form';
        COMMENT ON COLUMN public.signalements.submission_method IS 'Méthode de soumission: form, chat_ai, api';
    END IF;
END $$;

-- 5. Ajouter device_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'signalements' 
        AND column_name = 'device_id'
    ) THEN
        ALTER TABLE public.signalements ADD COLUMN device_id text;
        COMMENT ON COLUMN public.signalements.device_id IS 'ID de l''appareil pour les signalements anonymes';
    END IF;
END $$;

-- 6. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_signalements_is_anonymous ON public.signalements(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_signalements_device_id ON public.signalements(device_id);
CREATE INDEX IF NOT EXISTS idx_signalements_user_id ON public.signalements(user_id);
CREATE INDEX IF NOT EXISTS idx_signalements_status ON public.signalements(status);
CREATE INDEX IF NOT EXISTS idx_signalements_type ON public.signalements(type);

-- 7. Mettre à jour les politiques RLS pour permettre les signalements anonymes
DROP POLICY IF EXISTS "Users can insert signalements" ON public.signalements;
CREATE POLICY "Users can insert signalements" ON public.signalements
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

DROP POLICY IF EXISTS "Users can view their own signalements" ON public.signalements;
CREATE POLICY "Users can view their own signalements" ON public.signalements
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL
    );

-- 8. Permettre aux agents et admins de voir tous les signalements
DROP POLICY IF EXISTS "Agents and admins can view all signalements" ON public.signalements;
CREATE POLICY "Agents and admins can view all signalements" ON public.signalements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('agent', 'admin', 'super_admin')
        )
    );

-- 9. Mettre à jour les signalements existants pour ajouter un titre si manquant
UPDATE public.signalements 
SET title = CONCAT('Signalement de ', type)
WHERE title IS NULL OR title = '';

-- 10. Afficher un résumé des modifications
DO $$
DECLARE
    total_signalements integer;
    anonymous_signalements integer;
BEGIN
    SELECT COUNT(*) INTO total_signalements FROM public.signalements;
    SELECT COUNT(*) INTO anonymous_signalements FROM public.signalements WHERE user_id IS NULL;
    
    RAISE NOTICE 'Migration terminée avec succès!';
    RAISE NOTICE 'Total de signalements: %', total_signalements;
    RAISE NOTICE 'Signalements anonymes: %', anonymous_signalements;
END $$;

