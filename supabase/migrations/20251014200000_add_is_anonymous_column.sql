-- Migration pour ajouter la colonne is_anonymous manquante
-- Date: 2025-10-14
-- Description: Ajoute la colonne is_anonymous aux tables signalements et projets

-- Ajouter is_anonymous à la table signalements
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

-- Ajouter is_anonymous à la table projets
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projets' 
        AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE public.projets ADD COLUMN is_anonymous boolean DEFAULT false;
        COMMENT ON COLUMN public.projets.is_anonymous IS 'Indique si le projet est anonyme';
    END IF;
END $$;

-- Créer l'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_signalements_is_anonymous ON public.signalements(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_projets_is_anonymous ON public.projets(is_anonymous);

