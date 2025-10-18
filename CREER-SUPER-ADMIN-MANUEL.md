# 🔧 Création manuelle du compte Super Admin

## 🚨 Problème identifié
L'erreur "Compte Super Admin introuvable" vient du fait que le compte n'existe pas dans la base de données avec le bon email.

## ✅ Solution

### 1. Accéder au Dashboard Supabase
1. Connectez-vous à votre compte Lovable
2. Ouvrez votre projet NDJOBI
3. Allez dans l'onglet **SQL Editor**

### 2. Exécuter le script SQL
Copiez et exécutez ce script SQL dans l'éditeur :

```sql
-- Script de vérification et création du compte Super Admin
-- Utilise le même format que les autres comptes : Numéro + PIN

-- Vérifier si le compte Super Admin existe
SELECT 
    'Vérification compte Super Admin' as action,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = '33661002616@ndjobi.com'
        ) THEN '✅ Compte existe dans auth.users'
        ELSE '❌ Compte manquant dans auth.users'
    END as auth_users_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE email = '33661002616@ndjobi.com'
        ) THEN '✅ Profil existe dans public.profiles'
        ELSE '❌ Profil manquant dans public.profiles'
    END as profiles_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN auth.users u ON ur.user_id = u.id
            WHERE u.email = '33661002616@ndjobi.com' 
            AND ur.role = 'super_admin'
        ) THEN '✅ Rôle super_admin assigné'
        ELSE '❌ Rôle super_admin manquant'
    END as role_status;

-- Créer le compte Super Admin s'il n'existe pas
DO $$
DECLARE
    v_super_admin_id uuid;
    v_phone TEXT := '+33661002616';
    v_email TEXT := '33661002616@ndjobi.com';
BEGIN
    -- Vérifier si l'utilisateur existe déjà
    SELECT id INTO v_super_admin_id
    FROM auth.users
    WHERE email = v_email;

    IF v_super_admin_id IS NULL THEN
        -- Créer l'utilisateur dans auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            phone,
            phone_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt('999999', gen_salt('bf')), -- PIN 999999
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}',
            jsonb_build_object(
                'full_name', 'Super Administrateur',
                'phone', v_phone,
                'organization', 'NDJOBI Platform'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_super_admin_id;

        RAISE NOTICE '✅ Utilisateur Super Admin créé avec ID: %', v_super_admin_id;
    ELSE
        RAISE NOTICE '⚠️  Utilisateur Super Admin existe déjà avec ID: %', v_super_admin_id;
    END IF;

    -- Créer ou mettre à jour le profil
    INSERT INTO public.profiles (id, email, full_name, phone, organization, created_at, updated_at)
    VALUES (
        v_super_admin_id,
        v_email,
        'Super Administrateur',
        v_phone,
        'NDJOBI Platform',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        organization = EXCLUDED.organization,
        updated_at = NOW();

    -- Assigner le rôle super_admin
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (v_super_admin_id, 'super_admin', NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'super_admin';

    RAISE NOTICE '✅ Compte Super Admin configuré correctement !';
    RAISE NOTICE 'Email: %', v_email;
    RAISE NOTICE 'Téléphone: %', v_phone;
    RAISE NOTICE 'PIN: 999999 (6 chiffres)';
    RAISE NOTICE 'Système: Numéro + PIN (comme les autres utilisateurs)';

END $$;

-- Vérification finale
SELECT 
    'Vérification finale' as action,
    u.email,
    p.full_name,
    p.phone,
    ur.role,
    u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';
```

### 3. Vérifier le résultat
Après l'exécution, vous devriez voir :
- ✅ Utilisateur Super Admin créé
- ✅ Profil créé
- ✅ Rôle super_admin assigné

### 4. Test de connexion
Maintenant, testez la connexion Super Admin :
1. Numéro : `+33661002616`
2. PIN : `999999`

## 📋 Format du compte Super Admin
- **Email** : `33661002616@ndjobi.com`
- **Téléphone** : `+33661002616`
- **PIN** : `999999`
- **Rôle** : `super_admin`

## 🔍 Vérification supplémentaire
Si vous voulez vérifier que le compte existe, exécutez cette requête :

```sql
SELECT 
    u.email,
    p.full_name,
    p.phone,
    ur.role,
    u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';
```

Cette requête doit retourner une ligne avec les informations du Super Admin.
