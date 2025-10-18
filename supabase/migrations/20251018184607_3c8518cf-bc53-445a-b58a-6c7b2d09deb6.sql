-- Migration 1: Ajouter le rôle sub_admin et la colonne phone
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid 
                   WHERE t.typname = 'app_role' AND e.enumlabel = 'sub_admin') THEN
        ALTER TYPE public.app_role ADD VALUE 'sub_admin';
    END IF;
END$$;