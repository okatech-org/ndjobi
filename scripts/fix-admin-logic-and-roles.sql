-- =====================================================
-- CORRECTION DES COMPTES ADMIN SELON LA LOGIQUE DU DIAGRAMME
-- =====================================================
-- Date: 2025-10-19
-- Objectif: Implémenter la hiérarchie correcte des rôles
-- 
-- LOGIQUE DU DIAGRAMME:
-- • Super Admin: Contrôle total (rôle système)
-- • Président/Admin: Vue globale, Validation
-- • Sous-Admin: Vue sectorielle
-- =====================================================

-- 1. CORRECTION DU COMPTE PRÉSIDENT
-- =================================
-- Changer le rôle de super_admin vers admin (Vue globale, Validation)

UPDATE user_roles 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = '24177888001@ndjobi.com'
);

-- Mettre à jour le profil avec la description correcte
UPDATE profiles 
SET 
  fonction = 'Président / Administrateur (Vue globale, Validation)',
  updated_at = NOW()
WHERE email = '24177888001@ndjobi.com';

-- 2. CORRECTION DU COMPTE SOUS-ADMIN DGSS
-- =======================================
-- Changer le rôle de admin vers sub_admin (Vue sectorielle)

UPDATE user_roles 
SET 
  role = 'sub_admin',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = '24177888002@ndjobi.com'
);

-- Mettre à jour le profil avec la description correcte
UPDATE profiles 
SET 
  fonction = 'Sous-Administrateur DGSS (Vue sectorielle)',
  updated_at = NOW()
WHERE email = '24177888002@ndjobi.com';

-- 3. CORRECTION DU COMPTE SOUS-ADMIN DGR
-- ======================================
-- Changer le rôle de admin vers sub_admin (Vue sectorielle)

UPDATE user_roles 
SET 
  role = 'sub_admin',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = '24177888003@ndjobi.com'
);

-- Mettre à jour le profil avec la description correcte
UPDATE profiles 
SET 
  fonction = 'Sous-Administrateur DGR (Vue sectorielle)',
  updated_at = NOW()
WHERE email = '24177888003@ndjobi.com';

-- 4. VÉRIFICATION DES RÔLES CORRIGÉS
-- ==================================

-- Afficher tous les rôles après correction
SELECT 
  p.email,
  p.full_name,
  p.fonction,
  ur.role,
  p.organization,
  CASE 
    WHEN ur.role = 'super_admin' THEN '🔴 Contrôle total (rôle système)'
    WHEN ur.role = 'admin' THEN '🟠 Vue globale, Validation'
    WHEN ur.role = 'sub_admin' THEN '🟡 Vue sectorielle'
    WHEN ur.role = 'agent' THEN '🟢 Traitement terrain'
    WHEN ur.role = 'user' THEN '🔵 Signalement'
    ELSE '❓ Rôle inconnu'
  END as description_role
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email IN (
  '33661002616@ndjobi.com',  -- Super Admin Système
  '24177888001@ndjobi.com',  -- Président
  '24177888002@ndjobi.com',  -- Sous-Admin DGSS
  '24177888003@ndjobi.com'   -- Sous-Admin DGR
)
ORDER BY 
  CASE ur.role 
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'sub_admin' THEN 3
    WHEN 'agent' THEN 4
    WHEN 'user' THEN 5
    ELSE 6
  END;

-- 5. CRÉATION DES FONCTIONS RPC MANQUANTES (si nécessaire)
-- ========================================================

-- Fonction pour vérifier un rôle
CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role 
  FROM user_roles 
  WHERE user_id = _user_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Fonction pour vérifier si c'est un président
CREATE OR REPLACE FUNCTION is_president(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.id = ur.user_id
    WHERE p.id = _user_id 
    AND p.fonction ILIKE '%président%'
    AND ur.role = 'admin'
  );
END;
$$;

-- Fonction pour vérifier si c'est un admin
CREATE OR REPLACE FUNCTION is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id 
    AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- Fonction pour obtenir les informations complètes d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_info(_user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  organization text,
  fonction text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.organization,
    p.fonction,
    ur.role,
    p.created_at
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  WHERE p.id = _user_id;
END;
$$;

-- Fonction pour vérifier le PIN d'un utilisateur
CREATE OR REPLACE FUNCTION verify_user_pin(_user_id uuid, _pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_pins 
    WHERE user_id = _user_id AND pin = _pin
  );
END;
$$;

-- 6. MESSAGE DE CONFIRMATION
-- ==========================

DO $$
BEGIN
  RAISE NOTICE '✅ CORRECTION TERMINÉE AVEC SUCCÈS !';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '📊 HIÉRARCHIE CORRIGÉE SELON LE DIAGRAMME:';
  RAISE NOTICE '🔴 Super Admin: Contrôle total (rôle système)';
  RAISE NOTICE '🟠 Président/Admin: Vue globale, Validation';
  RAISE NOTICE '🟡 Sous-Admin: Vue sectorielle';
  RAISE NOTICE '🟢 Agent: Traitement terrain';
  RAISE NOTICE '🔵 User: Signalement';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTS DE CONNEXION:';
  RAISE NOTICE '• Président: +24177888001 / 111111 → /dashboard/admin';
  RAISE NOTICE '• Sous-Admin DGSS: +24177888002 / 222222 → /dashboard/admin';
  RAISE NOTICE '• Sous-Admin DGR: +24177888003 / 333333 → /dashboard/admin';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 FONCTIONS RPC CRÉÉES:';
  RAISE NOTICE '• has_role(), get_user_role(), is_president()';
  RAISE NOTICE '• is_admin(), get_user_info(), verify_user_pin()';
END;
$$;
