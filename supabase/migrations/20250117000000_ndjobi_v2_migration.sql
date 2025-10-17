-- ============================================
-- SCRIPT DE MIGRATION NDJOBI v2.0
-- Nettoyage des comptes démo et restructuration
-- ============================================

-- 1. SAUVEGARDE DES DONNÉES IMPORTANTES
-- --------------------------------------
-- Créer une table de sauvegarde des données critiques avant migration
CREATE TABLE IF NOT EXISTS migration_backup (
    id SERIAL PRIMARY KEY,
    table_name TEXT,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sauvegarder les signalements importants
INSERT INTO migration_backup (table_name, data)
SELECT 'signalements', to_jsonb(s.*)
FROM signalements s
WHERE s.status IN ('investigation', 'resolved')
   OR s.priority = 'critique';

-- 2. NETTOYAGE DES COMPTES DÉMO
-- ------------------------------
DO $$
DECLARE
    v_demo_emails TEXT[] := ARRAY[
        '24177777001@ndjobi.temp',
        '24177777002@ndjobi.temp', 
        '24177777003@ndjobi.temp',
        '24177777001@ndjobi.ga',
        '24177777002@ndjobi.ga',
        '24177777003@ndjobi.ga'
    ];
    v_email TEXT;
    v_user_id UUID;
BEGIN
    -- Désactiver temporairement les contraintes
    SET session_replication_role = 'replica';
    
    -- Parcourir et supprimer les comptes démo
    FOREACH v_email IN ARRAY v_demo_emails
    LOOP
        -- Récupérer l'ID utilisateur
        SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
        
        IF v_user_id IS NOT NULL THEN
            -- Supprimer les données associées
            DELETE FROM signalements WHERE user_id = v_user_id;
            DELETE FROM investigations WHERE assigned_agent_id = v_user_id;
            DELETE FROM user_roles WHERE user_id = v_user_id;
            DELETE FROM profiles WHERE id = v_user_id;
            DELETE FROM device_sessions WHERE user_id = v_user_id;
            
            -- Supprimer le compte utilisateur
            DELETE FROM auth.users WHERE id = v_user_id;
            
            RAISE NOTICE 'Compte démo supprimé: %', v_email;
        END IF;
    END LOOP;
    
    -- Réactiver les contraintes
    SET session_replication_role = 'origin';
END $$;

-- 3. MIGRATION DU COMPTE SUPER ADMIN
-- -----------------------------------
DO $$
DECLARE
    v_super_admin_id UUID;
    v_old_email TEXT := '24177777000@ndjobi.ga';
    v_new_email TEXT := 'superadmin@ndjobi.com'; -- Email professionnel
BEGIN
    -- Chercher le compte super admin existant
    SELECT id INTO v_super_admin_id 
    FROM auth.users 
    WHERE email = v_old_email;
    
    IF v_super_admin_id IS NOT NULL THEN
        -- Mettre à jour l'email
        UPDATE auth.users 
        SET 
            email = v_new_email,
            raw_user_meta_data = jsonb_set(
                COALESCE(raw_user_meta_data, '{}'),
                '{email}',
                to_jsonb(v_new_email)
            ),
            updated_at = NOW()
        WHERE id = v_super_admin_id;
        
        -- Mettre à jour le profil
        UPDATE profiles 
        SET 
            email = v_new_email,
            username = 'Super Administrateur',
            full_name = 'Administrateur Système',
            avatar_url = '/avatars/super-admin.png',
            organization = 'NDJOBI Platform',
            updated_at = NOW()
        WHERE id = v_super_admin_id;
        
        -- S'assurer que le rôle est correct
        INSERT INTO user_roles (user_id, role)
        VALUES (v_super_admin_id, 'super_admin')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'super_admin', updated_at = NOW();
        
        RAISE NOTICE 'Super Admin migré vers: %', v_new_email;
    ELSE
        RAISE NOTICE 'Compte Super Admin non trouvé, création nécessaire';
    END IF;
END $$;

-- 4. CRÉATION DES COMPTES SYSTÈME NÉCESSAIRES
-- --------------------------------------------

-- Fonction pour créer un compte système sécurisé
CREATE OR REPLACE FUNCTION create_system_account(
    p_email TEXT,
    p_role app_role,
    p_full_name TEXT,
    p_organization TEXT
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Générer un UUID
    v_user_id := gen_random_uuid();
    
    -- Créer le profil
    INSERT INTO profiles (id, email, full_name, organization, created_at, updated_at)
    VALUES (v_user_id, p_email, p_full_name, p_organization, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    -- Assigner le rôle
    INSERT INTO user_roles (user_id, role, created_at, updated_at)
    VALUES (v_user_id, p_role, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET role = p_role, updated_at = NOW();
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Créer les comptes système nécessaires
DO $$
BEGIN
    -- Compte Admin (Protocole d'État)
    PERFORM create_system_account(
        'protocole@presidence.ga',
        'admin',
        'Protocole d''État',
        'Présidence de la République'
    );
    
    -- Compte Agent DGSS Principal
    PERFORM create_system_account(
        'dgss.principal@securite.ga',
        'agent',
        'Agent Principal DGSS',
        'Direction Générale de la Sécurité et de la Surveillance'
    );
    
    -- Compte Agent Lutte Anti-corruption
    PERFORM create_system_account(
        'agent.lac@justice.ga',
        'agent',
        'Agent LAC',
        'Commission de Lutte Anti-Corruption'
    );
    
    RAISE NOTICE 'Comptes système créés avec succès';
END $$;

-- 5. NETTOYAGE DES SESSIONS OBSOLÈTES
-- ------------------------------------
DELETE FROM device_sessions 
WHERE last_seen < NOW() - INTERVAL '30 days'
   OR user_id NOT IN (SELECT id FROM auth.users);

-- Nettoyer les signalements orphelins
UPDATE signalements 
SET user_id = NULL 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 6. CRÉATION D'INDEX POUR PERFORMANCE
-- -------------------------------------
CREATE INDEX IF NOT EXISTS idx_signalements_status_priority 
ON signalements(status, priority) 
WHERE status != 'closed';

CREATE INDEX IF NOT EXISTS idx_investigations_status 
ON investigations(status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_roles_role 
ON user_roles(role);

-- 7. MISE À JOUR DES POLITIQUES RLS
-- ----------------------------------
-- Désactiver les anciennes politiques pour les comptes démo
DROP POLICY IF EXISTS "demo_access_policy" ON signalements;
DROP POLICY IF EXISTS "demo_access_policy" ON investigations;

-- Créer les nouvelles politiques strictes
DROP POLICY IF EXISTS "authenticated_users_own_data" ON signalements;
CREATE POLICY "authenticated_users_own_data" ON signalements
    FOR ALL
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'agent')
        )
    );

DROP POLICY IF EXISTS "agents_assigned_investigations" ON investigations;
CREATE POLICY "agents_assigned_investigations" ON investigations
    FOR ALL
    USING (
        auth.uid() = assigned_agent_id
        OR EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 8. RAPPORT DE MIGRATION
-- -----------------------
SELECT 
    'Migration complétée' as status,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT CASE WHEN ur.role = 'super_admin' THEN u.id END) as super_admins,
    COUNT(DISTINCT CASE WHEN ur.role = 'admin' THEN u.id END) as admins,
    COUNT(DISTINCT CASE WHEN ur.role = 'agent' THEN u.id END) as agents,
    COUNT(DISTINCT CASE WHEN ur.role = 'user' THEN u.id END) as users
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email NOT LIKE '%@ndjobi.temp';

-- Afficher les comptes système créés
SELECT 
    ur.role,
    p.email,
    p.full_name,
    p.organization,
    p.created_at
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role IN ('super_admin', 'admin', 'agent')
ORDER BY 
    CASE ur.role 
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'agent' THEN 3
    END;

