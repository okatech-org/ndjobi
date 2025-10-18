-- =====================================================
-- Ajout du rôle 'sub_admin' à l'enum app_role
-- =====================================================

-- Ajouter le rôle sub_admin à l'enum existant
ALTER TYPE public.app_role ADD VALUE 'sub_admin';

-- Vérification
SELECT unnest(enum_range(NULL::app_role)) as roles_disponibles;
