# 🚀 Création du Compte Super Admin - EXÉCUTER MAINTENANT

## 📋 **Instructions Immédiates**

### **Option 1 : Exécution SQL dans Supabase (RECOMMANDÉ)** ⚡

1. **Ouvrez le SQL Editor de Supabase** :
   - Allez sur : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/sql/new
   - (Vous devez être connecté à votre compte Supabase)

2. **Copiez-collez ce script SQL complet** :

```sql
-- =====================================================
-- CRÉATION COMPTE SUPER ADMIN
-- =====================================================

-- Désactiver temporairement RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Créer le profil pour le Super Admin
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    organization,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    'Super Administrateur',
    u.phone,
    'Administration Système',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    organization = EXCLUDED.organization,
    updated_at = NOW();

-- Attribuer le rôle super_admin
INSERT INTO public.user_roles (
    user_id,
    role,
    created_at
)
SELECT 
    u.id,
    'super_admin',
    NOW()
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com'
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Réactiver RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Vérification finale
SELECT 
    'VÉRIFICATION SUPER ADMIN' as status,
    u.id,
    u.email,
    u.phone,
    p.full_name,
    p.organization,
    ur.role,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';
```

3. **Cliquez sur "Run"** (ou "Exécuter")

4. **Vérifiez le résultat** :
   - Vous devriez voir une ligne avec toutes les informations du Super Admin
   - Si `full_name`, `organization` et `role` sont renseignés, c'est réussi ! ✅

---

### **Option 2 : Si le compte n'existe pas encore dans auth.users** 🆕

Si la requête ci-dessus ne retourne rien, cela signifie que le compte n'existe pas du tout dans `auth.users`. Dans ce cas, exécutez ce script complet :

```sql
-- =====================================================
-- CRÉATION COMPLÈTE DU COMPTE SUPER ADMIN
-- =====================================================

DO $$
DECLARE
    v_user_id uuid;
    v_email TEXT := '33661002616@ndjobi.com';
    v_phone TEXT := '+33661002616';
    v_pin TEXT := '999999';
BEGIN
    -- Désactiver temporairement RLS
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

    -- Vérifier si l'utilisateur existe dans auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;

    -- Si l'utilisateur n'existe pas, le créer
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Création du compte dans auth.users...';
        
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
            crypt(v_pin, gen_salt('bf')),
            NOW(),
            v_phone,
            NOW(),
            '{"provider":"phone","providers":["phone"]}'::jsonb,
            jsonb_build_object(
                'full_name', 'Super Administrateur',
                'phone', v_phone,
                'organization', 'Administration Système'
            ),
            NOW(),
            NOW(),
            '',
            ''
        ) RETURNING id INTO v_user_id;

        RAISE NOTICE '✅ Compte créé dans auth.users avec ID: %', v_user_id;
    ELSE
        RAISE NOTICE '⚠️ Compte existe déjà dans auth.users avec ID: %', v_user_id;
    END IF;

    -- Créer/Mettre à jour le profil
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        organization,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        v_email,
        'Super Administrateur',
        v_phone,
        'Administration Système',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        organization = EXCLUDED.organization,
        updated_at = NOW();

    RAISE NOTICE '✅ Profil créé/mis à jour';

    -- Attribuer le rôle
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_at
    ) VALUES (
        v_user_id,
        'super_admin',
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

    RAISE NOTICE '✅ Rôle super_admin attribué';

    -- Réactiver RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE '--- Compte Super Admin configuré ---';
    RAISE NOTICE 'Email: %', v_email;
    RAISE NOTICE 'Téléphone: %', v_phone;
    RAISE NOTICE 'PIN: %', v_pin;

END $$;

-- Vérification finale
SELECT 
    'VÉRIFICATION FINALE' as status,
    u.id,
    u.email,
    u.phone,
    p.full_name,
    p.organization,
    ur.role,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';
```

---

## ✅ **Ce que vous devez voir après exécution**

Dans les résultats, vous devriez voir une ligne avec :

| Champ | Valeur Attendue |
|-------|-----------------|
| **email** | `33661002616@ndjobi.com` |
| **phone** | `+33661002616` |
| **full_name** | `Super Administrateur` |
| **organization** | `Administration Système` |
| **role** | `super_admin` |

---

## 🧪 **Tester immédiatement**

Après avoir exécuté le script :

1. **Allez sur** : `https://votre-domaine.com/auth/super-admin`

2. **Entrez le PIN** : `999999`

3. **Cliquez sur "Se connecter"**

4. **Résultat attendu** : Redirection vers `/dashboard/super-admin`

---

## 🔧 **Si ça ne fonctionne toujours pas**

Exécutez cette requête de diagnostic dans Supabase :

```sql
-- Diagnostic complet
SELECT 
    'auth.users' as table_name,
    u.id,
    u.email,
    u.phone,
    u.created_at
FROM auth.users u
WHERE u.email = '33661002616@ndjobi.com' OR u.phone = '+33661002616'

UNION ALL

SELECT 
    'public.profiles' as table_name,
    p.id,
    p.email,
    p.phone,
    p.created_at
FROM public.profiles p
WHERE p.email = '33661002616@ndjobi.com' OR p.phone = '+33661002616'

UNION ALL

SELECT 
    'public.user_roles' as table_name,
    ur.user_id as id,
    ur.role as email,
    NULL as phone,
    ur.created_at
FROM public.user_roles ur
WHERE ur.user_id IN (
    SELECT id FROM auth.users 
    WHERE email = '33661002616@ndjobi.com' OR phone = '+33661002616'
);
```

Cela vous montrera exactement ce qui existe et ce qui manque.

---

## 📞 **Résumé**

**Actions à faire MAINTENANT :**

1. ✅ Ouvrez Supabase SQL Editor
2. ✅ Copiez le script SQL (Option 1 ou 2)
3. ✅ Cliquez sur "Run"
4. ✅ Vérifiez les résultats
5. ✅ Testez sur `/auth/super-admin` avec PIN `999999`

**Le système est prêt côté code, il ne manque que le compte en base !** 🚀

