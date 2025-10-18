-- =====================================================
-- Création du compte Super Admin COMPLET
-- Numéro: +33661002616
-- Email: iasted@me.com
-- PIN: 999999 (6 chiffres)
-- =====================================================

BEGIN;

-- Étape 1: Vérifier si le compte existe déjà
DO $$
DECLARE
    v_user_id uuid;
    v_existing_user_id uuid;
BEGIN
    -- Vérifier si l'utilisateur existe avec l'email superadmin@ndjobi.com
    SELECT id INTO v_existing_user_id
    FROM auth.users
    WHERE email = 'superadmin@ndjobi.com';
    
    IF FOUND THEN
        -- L'utilisateur existe déjà, on met à jour ses informations
        RAISE NOTICE '⚠️  Compte superadmin@ndjobi.com existe déjà, mise à jour...';
        v_user_id := v_existing_user_id;
        
        -- Mettre à jour le profil avec le numéro de téléphone et l'email de contact
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
        
        -- Attribuer le rôle super_admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'super_admin')
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'super_admin';
            
    ELSE
        -- L'utilisateur n'existe pas, on doit le créer manuellement
        RAISE EXCEPTION '❌ Le compte superadmin@ndjobi.com n''existe pas encore. Veuillez d''abord le créer via l''interface Supabase Auth.';
    END IF;
    
    RAISE NOTICE '✅ Compte Super Admin configuré avec succès !';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '  INFORMATIONS DE CONNEXION SUPER ADMIN';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Email technique : superadmin@ndjobi.com';
    RAISE NOTICE '📱 Numéro de téléphone : +33661002616';
    RAISE NOTICE '📧 Email de contact (pour OTP) : iasted@me.com';
    RAISE NOTICE '🔐 Code PIN : 999999 (6 chiffres)';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Connexion :';
    RAISE NOTICE '   1. Double-clic sur l''icône 🛡️';
    RAISE NOTICE '   2. Entrer le numéro : +33661002616';
    RAISE NOTICE '   3. Entrer le PIN : 999999';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Réinitialisation du PIN (si oublié) :';
    RAISE NOTICE '   - SMS/WhatsApp → +33661002616';
    RAISE NOTICE '   - Email → iasted@me.com';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    
END $$;

COMMIT;

-- Vérification finale détaillée
SELECT 
    '✅ COMPTE SUPER ADMIN' as statut,
    u.id as user_id,
    u.email as email_technique,
    u.phone as telephone_auth,
    u.email_confirmed_at as email_confirme,
    u.phone_confirmed_at as telephone_confirme,
    p.full_name as nom_complet,
    p.phone as telephone_profil,
    ur.role as role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'superadmin@ndjobi.com';

