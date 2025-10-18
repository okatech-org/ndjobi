-- =====================================================
-- VÉRIFICATION ET CRÉATION DU COMPTE SUPER ADMIN
-- Email: superadmin@ndjobi.com
-- PIN: 999999
-- =====================================================

-- ÉTAPE 1: Vérifier si le compte existe
SELECT 
    '🔍 VÉRIFICATION DU COMPTE' as action,
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at
FROM auth.users u
WHERE u.email = 'superadmin@ndjobi.com';

-- ÉTAPE 2: Si le compte existe, configurer le profil et le rôle
BEGIN;

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Récupérer l'ID de l'utilisateur
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'superadmin@ndjobi.com';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION '
        
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ❌ COMPTE NON TROUVÉ DANS SUPABASE AUTH               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Le compte superadmin@ndjobi.com n''existe pas encore dans Supabase Auth.

🚀 ACTION REQUISE :

1️⃣ Ouvrir : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/auth/users

2️⃣ Cliquer "Add user"

3️⃣ Remplir :
   Email : superadmin@ndjobi.com
   Password : 999999
   ✅ Auto Confirm User (COCHER)

4️⃣ Cliquer "Create user"

5️⃣ Relancer ce script SQL

═══════════════════════════════════════════════════════════
        ';
    END IF;
    
    RAISE NOTICE '✅ Compte trouvé dans auth.users : %', v_user_id;
    
    -- Créer ou mettre à jour le profil
    INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
    VALUES (
        v_user_id,
        'superadmin@ndjobi.com',
        'Super Administrateur',
        '+33661002616',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Profil créé/mis à jour';
    
    -- Attribuer le rôle super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'super_admin';
    
    RAISE NOTICE '✅ Rôle super_admin attribué';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '  ✅ CONFIGURATION TERMINÉE !';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Email : superadmin@ndjobi.com';
    RAISE NOTICE '📱 Numéro : +33661002616';
    RAISE NOTICE '🔐 PIN : 999999';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Connexion :';
    RAISE NOTICE '   - Double-clic sur 🛡️';
    RAISE NOTICE '   - Numéro : +33661002616';
    RAISE NOTICE '   - PIN : 999999';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT :';
    RAISE NOTICE '   Le password du compte dans Supabase Auth DOIT être : 999999';
    RAISE NOTICE '   Si vous obtenez "Invalid login credentials", vérifiez le password.';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    
END $$;

COMMIT;

-- ÉTAPE 3: Vérification finale complète
SELECT 
    '✅ VÉRIFICATION FINALE' as statut,
    u.id as user_id,
    u.email,
    u.email_confirmed_at as email_confirme,
    u.created_at as compte_cree_le,
    p.full_name,
    p.phone,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'superadmin@ndjobi.com';

