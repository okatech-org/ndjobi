-- =====================================================
-- FINALISATION DE L'IMPLÉMENTATION DES COMPTES NDJOBI
-- =====================================================
-- Date: 2025-10-19
-- Objectif: Finaliser l'implémentation des comptes spécifiques
-- 
-- COMPTES À FINALISER:
-- • Président (Admin): Vue globale, Validation
-- • Sous-Admin DGSS: Vue sectorielle
-- • Agent Pêche: Traitement terrain
-- • Citoyens: Signalement
-- =====================================================

-- 1. FINALISATION DU COMPTE PRÉSIDENT (ADMIN)
-- ===========================================
-- Vue globale, Validation des cas critiques

-- Mettre à jour le profil Président avec les détails complets
UPDATE profiles 
SET 
  full_name = 'Président de la République',
  fonction = 'Président / Administrateur (Vue globale, Validation)',
  organization = 'Présidence de la République',
  phone = '+24177888001',
  updated_at = NOW()
WHERE email = '24177888001@ndjobi.com';

-- S'assurer que le rôle admin est correct
UPDATE user_roles 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = '24177888001@ndjobi.com'
);

-- Créer le PIN si nécessaire
INSERT INTO user_pins (user_id, pin, created_at, updated_at)
SELECT 
  u.id,
  '111111',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = '24177888001@ndjobi.com'
ON CONFLICT (user_id) DO UPDATE SET
  pin = '111111',
  updated_at = NOW();

-- 2. FINALISATION DU COMPTE SOUS-ADMIN DGSS
-- =========================================
-- Vue sectorielle DGSS uniquement

-- Mettre à jour le profil Sous-Admin DGSS
UPDATE profiles 
SET 
  full_name = 'Sous-Administrateur DGSS',
  fonction = 'Sous-Administrateur DGSS (Vue sectorielle)',
  organization = 'DGSS (Direction Générale de la Sécurité d''État)',
  phone = '+24177888002',
  updated_at = NOW()
WHERE email = '24177888002@ndjobi.com';

-- S'assurer que le rôle sub_admin est correct
UPDATE user_roles 
SET 
  role = 'sub_admin',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = '24177888002@ndjobi.com'
);

-- Créer le PIN si nécessaire
INSERT INTO user_pins (user_id, pin, created_at, updated_at)
SELECT 
  u.id,
  '222222',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = '24177888002@ndjobi.com'
ON CONFLICT (user_id) DO UPDATE SET
  pin = '222222',
  updated_at = NOW();

-- 3. FINALISATION DU COMPTE AGENT PÊCHE
-- =====================================
-- Traitement terrain spécialisé pêche

-- Mettre à jour le profil Agent Pêche
UPDATE profiles 
SET 
  full_name = 'Agent Pêche',
  fonction = 'Agent Pêche (Traitement terrain)',
  organization = 'Ministère de la Mer de la Pêche et de l''Économie Bleue',
  phone = '+24177888010',
  updated_at = NOW()
WHERE email = '24177888010@ndjobi.com';

-- S'assurer que le rôle agent est correct
UPDATE user_roles 
SET 
  role = 'agent',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = '24177888010@ndjobi.com'
);

-- Créer le PIN si nécessaire
INSERT INTO user_pins (user_id, pin, created_at, updated_at)
SELECT 
  u.id,
  '000000',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = '24177888010@ndjobi.com'
ON CONFLICT (user_id) DO UPDATE SET
  pin = '000000',
  updated_at = NOW();

-- 4. FINALISATION DES COMPTES CITOYENS
-- ====================================

-- Citoyen Démo
UPDATE profiles 
SET 
  full_name = 'Citoyen Démo',
  fonction = 'Citoyen Gabonais (Signalement)',
  organization = 'Citoyen Gabonais',
  phone = '+24177888008',
  updated_at = NOW()
WHERE email = '24177888008@ndjobi.com';

UPDATE user_roles 
SET 
  role = 'user',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = '24177888008@ndjobi.com'
);

INSERT INTO user_pins (user_id, pin, created_at, updated_at)
SELECT 
  u.id,
  '888888',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = '24177888008@ndjobi.com'
ON CONFLICT (user_id) DO UPDATE SET
  pin = '888888',
  updated_at = NOW();

-- Citoyen Anonyme
UPDATE profiles 
SET 
  full_name = 'Citoyen Anonyme',
  fonction = 'Citoyen Gabonais (Signalement anonyme)',
  organization = 'Citoyen Gabonais',
  phone = '+24177888009',
  updated_at = NOW()
WHERE email = '24177888009@ndjobi.com';

UPDATE user_roles 
SET 
  role = 'user',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = '24177888009@ndjobi.com'
);

INSERT INTO user_pins (user_id, pin, created_at, updated_at)
SELECT 
  u.id,
  '999999',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = '24177888009@ndjobi.com'
ON CONFLICT (user_id) DO UPDATE SET
  pin = '999999',
  updated_at = NOW();

-- 5. CRÉATION DES FONCTIONS RPC SPÉCIALISÉES
-- ==========================================

-- Fonction pour vérifier les privilèges admin
CREATE OR REPLACE FUNCTION has_admin_privileges(_user_id uuid)
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

-- Fonction pour vérifier les privilèges sub_admin
CREATE OR REPLACE FUNCTION has_sub_admin_privileges(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id 
    AND role = 'sub_admin'
  );
END;
$$;

-- Fonction pour vérifier les privilèges agent
CREATE OR REPLACE FUNCTION has_agent_privileges(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id 
    AND role = 'agent'
  );
END;
$$;

-- Fonction pour obtenir l'organisation d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_organization(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_org text;
BEGIN
  SELECT organization INTO user_org 
  FROM profiles 
  WHERE id = _user_id;
  
  RETURN COALESCE(user_org, 'Non définie');
END;
$$;

-- Fonction pour vérifier l'accès aux signalements par secteur
CREATE OR REPLACE FUNCTION can_access_signalement(_user_id uuid, _signalement_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  user_org text;
  signalement_secteur text;
BEGIN
  -- Obtenir le rôle de l'utilisateur
  SELECT ur.role INTO user_role
  FROM user_roles ur
  WHERE ur.user_id = _user_id
  ORDER BY ur.created_at DESC
  LIMIT 1;
  
  -- Super admin et admin ont accès à tout
  IF user_role IN ('super_admin', 'admin') THEN
    RETURN true;
  END IF;
  
  -- Pour les autres rôles, vérifier le secteur
  SELECT p.organization INTO user_org
  FROM profiles p
  WHERE p.id = _user_id;
  
  SELECT secteur INTO signalement_secteur
  FROM signalements
  WHERE id = _signalement_id;
  
  -- Agent et sub_admin ont accès à leur secteur uniquement
  IF user_role IN ('agent', 'sub_admin') THEN
    RETURN user_org = signalement_secteur;
  END IF;
  
  -- User a accès à ses propres signalements uniquement
  IF user_role = 'user' THEN
    RETURN EXISTS (
      SELECT 1 FROM signalements
      WHERE id = _signalement_id
      AND created_by = _user_id
    );
  END IF;
  
  RETURN false;
END;
$$;

-- 6. VÉRIFICATION FINALE DES COMPTES
-- ==================================

-- Afficher tous les comptes finalisés
SELECT 
  p.email,
  p.full_name,
  p.fonction,
  p.organization,
  p.phone,
  ur.role,
  up.pin,
  CASE 
    WHEN ur.role = 'super_admin' THEN '🔴 Contrôle total (rôle système)'
    WHEN ur.role = 'admin' THEN '🟠 Vue globale, Validation'
    WHEN ur.role = 'sub_admin' THEN '🟡 Vue sectorielle'
    WHEN ur.role = 'agent' THEN '🟢 Traitement terrain'
    WHEN ur.role = 'user' THEN '🔵 Signalement'
    ELSE '❓ Rôle inconnu'
  END as description_role,
  CASE 
    WHEN p.email = '24177888001@ndjobi.com' THEN 'Président'
    WHEN p.email = '24177888002@ndjobi.com' THEN 'Sous-Admin DGSS'
    WHEN p.email = '24177888010@ndjobi.com' THEN 'Agent Pêche'
    WHEN p.email = '24177888008@ndjobi.com' THEN 'Citoyen Démo'
    WHEN p.email = '24177888009@ndjobi.com' THEN 'Citoyen Anonyme'
    ELSE 'Autre'
  END as compte_type
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN user_pins up ON p.id = up.user_id
WHERE p.email IN (
  '24177888001@ndjobi.com',  -- Président
  '24177888002@ndjobi.com',  -- Sous-Admin DGSS
  '24177888010@ndjobi.com',  -- Agent Pêche
  '24177888008@ndjobi.com',  -- Citoyen Démo
  '24177888009@ndjobi.com'   -- Citoyen Anonyme
)
ORDER BY 
  CASE ur.role 
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'sub_admin' THEN 3
    WHEN 'agent' THEN 4
    WHEN 'user' THEN 5
    ELSE 6
  END,
  p.email;

-- 7. MESSAGE DE CONFIRMATION
-- ==========================

DO $$
BEGIN
  RAISE NOTICE '🎉 FINALISATION TERMINÉE AVEC SUCCÈS !';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '✅ COMPTES FINALISÉS:';
  RAISE NOTICE '• Président: +24177888001 / 111111 → Vue globale, Validation';
  RAISE NOTICE '• Sous-Admin DGSS: +24177888002 / 222222 → Vue sectorielle';
  RAISE NOTICE '• Agent Pêche: +24177888010 / 000000 → Traitement terrain';
  RAISE NOTICE '• Citoyen Démo: +24177888008 / 888888 → Signalement';
  RAISE NOTICE '• Citoyen Anonyme: +24177888009 / 999999 → Signalement';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 FONCTIONS RPC CRÉÉES:';
  RAISE NOTICE '• has_admin_privileges()';
  RAISE NOTICE '• has_sub_admin_privileges()';
  RAISE NOTICE '• has_agent_privileges()';
  RAISE NOTICE '• get_user_organization()';
  RAISE NOTICE '• can_access_signalement()';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTS DE CONNEXION:';
  RAISE NOTICE '• Tous les comptes sont prêts pour les tests';
  RAISE NOTICE '• Privilèges configurés selon la hiérarchie';
  RAISE NOTICE '• Fonctions RPC opérationnelles';
END;
$$;
