# 🎯 Guide de Connexion - Compte Président

## ❓ Problème

Vous vous connectez mais vous n'obtenez pas l'interface admin complète avec les 11 onglets :
- Dashboard
- Gestion Institutions (Agents sectoriels)
- Gestion Spéciale (Sous-administrateurs)
- Gestion Citoyens (Comptes citoyens)
- Validation Cas (Cas sensibles prioritaire)
- Enquêtes (Suivi terrain)
- Rapports (Documents stratégiques)
- Module XR-7 (Protocole d'urgence critique)
- iAsted AI (Assistant intelligent IA)
- Paramètres (Configuration)

## ✅ Solution

Vous devez vous connecter avec le **compte Président** spécifique qui active l'interface hybride.

---

## 🔑 Identifiants du Compte Président

```
📞 Téléphone : 24177888001
🔐 PIN       : 111111
📧 Email     : 24177888001@ndjobi.com
👤 Rôle      : Président de la République
```

---

## 📋 Étapes de Connexion

### 1️⃣ Déconnexion (si nécessaire)

Si vous êtes déjà connecté avec un autre compte :
- Cliquez sur votre profil en haut à droite
- Cliquez sur "Déconnexion"

### 2️⃣ Page de Connexion

Allez sur : `http://localhost:8080/auth`

### 3️⃣ Saisie des Identifiants

Dans le formulaire de connexion :
- **Numéro de téléphone** : `24177888001` (sans le +)
- **Code PIN** : `111111`

### 4️⃣ Connexion

- Cliquez sur "Se connecter"
- Vous serez automatiquement redirigé vers `/admin`
- L'interface hybride avec 11 onglets s'affiche

---

## 🔍 Vérification du Compte

Pour vérifier si le compte existe dans votre base de données :

```bash
cd /Users/okatech/ndjobi

# Méthode 1 : Via script TypeScript (recommandé)
export SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key"
npx ts-node scripts/verify-president-account.ts

# Méthode 2 : Via SQL dans Supabase Dashboard
# Allez sur https://supabase.com/dashboard/project/.../editor
# Exécutez :
SELECT 
  u.id,
  u.email,
  u.phone,
  p.full_name,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '24177888001@ndjobi.com';
```

---

## 🛠️ Création du Compte (si absent)

Si le compte n'existe pas, deux options :

### Option A : Script Automatique

```bash
cd /Users/okatech/ndjobi
export SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key"
npx ts-node scripts/create-production-accounts.ts
```

### Option B : SQL Manuel

Dans Supabase SQL Editor :

```sql
-- Exécuter le fichier
scripts/create-admin-complete.sql
```

Ou directement :

```sql
DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    INSERT INTO auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        phone, phone_confirmed_at,
        raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(), 'authenticated', 'authenticated',
        '24177888001@ndjobi.com',
        crypt('111111', gen_salt('bf')),
        NOW(), '+24177888001', NOW(),
        '{"full_name":"Président de la République"}'::jsonb,
        NOW(), NOW()
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_admin_id;

    IF v_admin_id IS NULL THEN
        SELECT id INTO v_admin_id FROM auth.users 
        WHERE email = '24177888001@ndjobi.com';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, phone, organization)
    VALUES (
        v_admin_id, '24177888001@ndjobi.com',
        'Président de la République', '+24177888001',
        'Présidence de la République'
    )
    ON CONFLICT (id) DO NOTHING;

    DELETE FROM public.user_roles WHERE user_id = v_admin_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_admin_id, 'admin'::app_role);

    RAISE NOTICE 'Compte créé avec succès: %', v_admin_id;
END $$;
```

---

## 🚨 Dépannage

### Problème 1 : "Code PIN incorrect"

- ✅ Vérifiez que vous entrez bien `111111` (6 fois le chiffre 1)
- ✅ Pas d'espaces avant ou après
- ✅ Assurez-vous que le compte existe (voir section Vérification)

### Problème 2 : Interface standard au lieu de l'interface hybride

Cela arrive si vous êtes connecté avec un autre compte admin.

**Diagnostic** : Ouvrez la console navigateur (F12) et vérifiez :

```javascript
// Dans la console du navigateur
console.log(window.localStorage.getItem('ndjobi_session'));
console.log(window.sessionStorage.getItem('ndjobi_session'));
```

Si l'email affiché n'est pas `24177888001@ndjobi.com`, vous êtes connecté avec le mauvais compte.

**Solution** :
1. Déconnectez-vous complètement
2. Effacez le cache : `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)
3. Reconnectez-vous avec `24177888001` / `111111`

### Problème 3 : Le compte n'existe pas

Suivez la section "Création du Compte" ci-dessus.

---

## 🏗️ Architecture Technique

Le compte Président est détecté dans `AdminDashboard.tsx` :

```typescript
const isPresident = user?.email === '24177888001@ndjobi.com' || 
                    user?.phone === '+24177888001';

if (isPresident) {
  return renderPresidentHybrid(); // Interface à 11 onglets
}

return renderStandardAdmin(); // Interface standard avec sidebar
```

Cette détection garantit que **SEUL** le compte `24177888001@ndjobi.com` accède à l'interface hybride complète.

---

## 📞 Récapitulatif des Comptes Admin

NDJOBI a plusieurs niveaux d'admin :

| Téléphone | PIN | Rôle | Interface |
|-----------|-----|------|-----------|
| 24177888001 | 111111 | **Président** | **Interface hybride 11 onglets** ✅ |
| 24177888002 | 222222 | Sous-Admin DGSS | Interface standard |
| 24177888003 | 333333 | Sous-Admin DGR | Interface standard |

**👉 Vous voulez le premier : 24177888001 / 111111**

---

## ✅ Checklist Finale

- [ ] Compte Président existe dans Supabase
- [ ] Email = `24177888001@ndjobi.com`
- [ ] Phone = `+24177888001`
- [ ] Role = `admin` (dans table `user_roles`)
- [ ] Password = `111111`
- [ ] Déconnecté de tout autre compte
- [ ] Cache navigateur effacé
- [ ] Connexion avec `24177888001` / `111111`
- [ ] Redirection vers `/admin`
- [ ] Interface hybride à 11 onglets visible ✅

---

**🎉 Une fois connecté, vous devriez voir l'interface complète avec tous les onglets listés !**

