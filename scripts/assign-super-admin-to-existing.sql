-- =====================================================
-- ATTRIBUER LE RÔLE SUPER ADMIN AU COMPTE EXISTANT
-- User: 33661002616@ndjobi.com
-- UID: 84401dfc-f23e-46e7-b201-868f2140ab73
-- =====================================================

BEGIN;

DO $$
DECLARE
    v_user_id uuid := '84401dfc-f23e-46e7-b201-868f2140ab73';
BEGIN
    -- Vérifier que le compte existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
        RAISE EXCEPTION '❌ Compte non trouvé avec cet ID';
    END IF;
    
    -- Mettre à jour ou créer le profil
    INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
    VALUES (
        v_user_id,
        '33661002616@ndjobi.com',
        'Super Administrateur',
        '+33661002616',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Profil mis à jour';
    
    -- Attribuer le rôle super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'super_admin';
    
    RAISE NOTICE '✅ Rôle super_admin attribué';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '  ✅ COMPTE SUPER ADMIN CONFIGURÉ !';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Email : 33661002616@ndjobi.com';
    RAISE NOTICE '📱 Numéro : +33661002616';
    RAISE NOTICE '🆔 User ID : 84401dfc-f23e-46e7-b201-868f2140ab73';
    RAISE NOTICE '🔐 PIN : (votre PIN actuel)';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Connexion :';
    RAISE NOTICE '   - Double-clic sur 🛡️';
    RAISE NOTICE '   - Numéro : +33661002616';
    RAISE NOTICE '   - PIN : (votre PIN)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT :';
    RAISE NOTICE '   Le compte utilise votre PIN actuel.';
    RAISE NOTICE '   Si vous ne connaissez pas votre PIN, utilisez "PIN oublié".';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    
END $$;

COMMIT;

-- Vérification finale
SELECT 
    '✅ VÉRIFICATION' as statut,
    u.id as user_id,
    u.email,
    u.email_confirmed_at as email_confirme,
    p.full_name,
    p.phone,
    ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.id = '84401dfc-f23e-46e7-b201-868f2140ab73';

