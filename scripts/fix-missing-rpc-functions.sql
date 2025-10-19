-- Script pour créer les fonctions RPC manquantes dans Supabase
-- Ces fonctions sont nécessaires pour l'authentification et la gestion des rôles

-- 1. Fonction pour vérifier si un utilisateur a un rôle spécifique
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = _user_id 
    AND role = _role
  );
END;
$$;

-- 2. Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_roles 
  WHERE user_id = _user_id
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- 3. Fonction pour vérifier si un utilisateur est président
CREATE OR REPLACE FUNCTION is_president(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = _user_id 
    AND role IN ('super_admin', 'president')
  );
END;
$$;

-- 4. Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = _user_id 
    AND role IN ('super_admin', 'admin', 'sub_admin')
  );
END;
$$;

-- 5. Fonction pour obtenir les informations complètes d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_info(_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_info JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'phone', p.phone,
    'full_name', p.full_name,
    'role', ur.role,
    'fonction', p.fonction,
    'organisation', p.organisation,
    'created_at', p.created_at
  ) INTO user_info
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  WHERE p.id = _user_id;
  
  RETURN user_info;
END;
$$;

-- 6. Fonction pour vérifier un PIN utilisateur
CREATE OR REPLACE FUNCTION verify_user_pin(_user_id UUID, _pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_pins 
    WHERE user_id = _user_id 
    AND pin = _pin
  );
END;
$$;

-- 7. Fonction pour créer un profil utilisateur complet
CREATE OR REPLACE FUNCTION create_user_profile(
  _user_id UUID,
  _email TEXT,
  _phone TEXT,
  _full_name TEXT,
  _role TEXT,
  _fonction TEXT DEFAULT NULL,
  _organisation TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer le profil
  INSERT INTO profiles (id, email, phone, full_name, fonction, organisation, created_at, updated_at)
  VALUES (_user_id, _email, _phone, _full_name, _fonction, _organisation, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    fonction = EXCLUDED.fonction,
    organisation = EXCLUDED.organisation,
    updated_at = NOW();
  
  -- Créer le rôle
  INSERT INTO user_roles (user_id, role, created_at)
  VALUES (_user_id, _role, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role;
  
  RETURN TRUE;
END;
$$;

-- 8. Fonction pour obtenir les statistiques des signalements
CREATE OR REPLACE FUNCTION get_signalement_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'critiques', COUNT(*) FILTER (WHERE priority = 'critique'),
    'en_cours', COUNT(*) FILTER (WHERE status IN ('pending', 'under_investigation')),
    'resolus', COUNT(*) FILTER (WHERE status = 'resolved'),
    'par_categorie', (
      SELECT json_object_agg(categorie, count)
      FROM (
        SELECT categorie, COUNT(*) as count
        FROM signalements
        GROUP BY categorie
      ) t
    )
  ) INTO stats
  FROM signalements;
  
  RETURN stats;
END;
$$;

-- 9. Fonction pour vérifier les permissions d'accès
CREATE OR REPLACE FUNCTION check_access_permission(_user_id UUID, _resource TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_roles 
  WHERE user_id = _user_id
  LIMIT 1;
  
  -- Logique de permissions basée sur le rôle
  CASE user_role
    WHEN 'super_admin' THEN
      RETURN TRUE; -- Accès total
    WHEN 'admin' THEN
      RETURN _resource IN ('dashboard', 'validation', 'enquetes', 'rapports');
    WHEN 'sub_admin' THEN
      RETURN _resource IN ('dashboard', 'validation', 'enquetes');
    WHEN 'agent' THEN
      RETURN _resource IN ('dashboard', 'enquetes');
    ELSE
      RETURN _resource = 'dashboard';
  END CASE;
END;
$$;

-- 10. Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les tentatives de PIN expirées (plus de 24h)
  DELETE FROM pin_attempts 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_signalements_priority ON signalements(priority);
CREATE INDEX IF NOT EXISTS idx_signalements_status ON signalements(status);
CREATE INDEX IF NOT EXISTS idx_user_pins_user_id ON user_pins(user_id);

-- Commentaires sur les fonctions
COMMENT ON FUNCTION has_role(UUID, TEXT) IS 'Vérifie si un utilisateur a un rôle spécifique';
COMMENT ON FUNCTION get_user_role(UUID) IS 'Retourne le rôle d''un utilisateur';
COMMENT ON FUNCTION is_president(UUID) IS 'Vérifie si un utilisateur est président ou super admin';
COMMENT ON FUNCTION is_admin(UUID) IS 'Vérifie si un utilisateur est admin ou supérieur';
COMMENT ON FUNCTION get_user_info(UUID) IS 'Retourne les informations complètes d''un utilisateur';
COMMENT ON FUNCTION verify_user_pin(UUID, TEXT) IS 'Vérifie le PIN d''un utilisateur';
COMMENT ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) IS 'Crée un profil utilisateur complet';
COMMENT ON FUNCTION get_signalement_stats() IS 'Retourne les statistiques des signalements';
COMMENT ON FUNCTION check_access_permission(UUID, TEXT) IS 'Vérifie les permissions d''accès d''un utilisateur';
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Nettoie les sessions expirées';
