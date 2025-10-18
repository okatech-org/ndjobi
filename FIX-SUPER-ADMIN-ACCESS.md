# 🔧 Fix Accès Super Admin - Solution Rapide

## 🎯 Problème

Tu ne peux pas accéder au dashboard super admin après authentification par téléphone `+33661002616`.

**Cause** : L'OTP est validé ✅ mais la session n'est pas créée car le compte téléphone n'a pas le rôle `super_admin`.

---

## ✅ Solution Immédiate (1 minute)

### Utiliser l'Email au lieu du Téléphone

**Credentials configurés** (depuis `.env.local`) :
- **Email** : `iasted@me.com`
- **Password** : `011282`

### Étapes

1. **Aller sur** : http://localhost:5173/auth

2. **Connexion par Email** :
   - Ne PAS utiliser l'authentification par téléphone
   - Utiliser le formulaire Email/Password (onglet "Email" ou "Connexion")
   - Email : `iasted@me.com`
   - Password : `011282`

3. **Cliquer** "Se connecter"

4. **Redirection automatique** vers `/dashboard/super-admin` ✅

**C'est tout ! Ça fonctionne immédiatement** 🎯

---

## 🔧 Solution Permanente (Lier Téléphone au Super Admin)

Si tu veux te connecter avec `+33661002616` :

### Méthode 1 : Via Supabase Dashboard (5 minutes)

1. **Ouvrir Supabase Dashboard** : https://supabase.com/dashboard

2. **SQL Editor** → Nouvelle requête

3. **Exécuter ce script** : `/scripts/fix-super-admin-phone.sql`

```sql
-- Créer compte avec téléphone +33661002616
INSERT INTO auth.users (...)
VALUES (...);

-- Assigner rôle super_admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users 
WHERE email = '33661002616@ndjobi.com';
```

4. **Tester** :
   - Téléphone : `+33661002616`
   - PIN : `123456` (ou le PIN que tu as configuré)

### Méthode 2 : Utiliser Script Automatique

```bash
cd /Users/okatech/ndjobi

# Exécuter le script de fix
psql $DATABASE_URL -f scripts/fix-super-admin-phone.sql
```

---

## 📋 Vérification du Compte

### Vérifier que le compte existe

```sql
-- Dans Supabase SQL Editor
SELECT 
  u.id,
  u.email,
  u.phone,
  ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('iasted@me.com', '33661002616@ndjobi.com');
```

**Résultat attendu** :
```
| id | email | phone | role |
|----|-------|-------|------|
| uuid-123 | iasted@me.com | NULL | super_admin |
| uuid-456 | 33661002616@ndjobi.com | +33661002616 | super_admin |
```

---

## 🚀 Test Rapide

### Option A : Email (MAINTENANT)

```
1. http://localhost:5173/auth
2. Onglet Email/Password
3. Email: iasted@me.com
4. Password: 011282
5. → Dashboard Super-Admin ✅
```

### Option B : Téléphone (Après fix SQL)

```
1. http://localhost:5173/auth
2. Authentification par téléphone
3. Téléphone: +33661002616
4. PIN: 123456
5. Code OTP: 123456
6. → Dashboard Super-Admin ✅
```

---

## 🔍 Debug

Si le problème persiste avec l'email :

```bash
# Ouvrir console navigateur (F12)
# Vérifier localStorage
localStorage.getItem('sb-xfxqwlbqysiezqdpeqpv-auth-token')

# Vérifier sessionStorage
sessionStorage.getItem('ndjobi_session')

# Vérifier localStorage démo
localStorage.getItem('ndjobi_demo_session')
```

Si tout est null, **nettoyer le cache** :

```javascript
// Console navigateur
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Puis réessayer avec `iasted@me.com / 011282`

---

## ✅ Solution Recommandée

**Utilise l'email `iasted@me.com` avec password `011282`** pour te connecter en super admin.

C'est la méthode la plus rapide et elle fonctionne immédiatement ! 🎯

