# 🔧 Diagnostic Super Admin - Guide de Résolution

## 📋 Informations du Compte Super Admin

- **Email :** `24177777000@ndjobi.com`
- **Mot de passe :** `123456`
- **Code d'authentification :** `011282*`
- **Rôle requis :** `super_admin`

## 🔍 Diagnostic Étape par Étape

### 1. Vérifier le Code d'Authentification

Le code correct est : **`011282*`** (avec l'astérisque à la fin)

### 2. Vérifier l'Existence du Compte

**Option A - Via l'interface Supabase :**
1. Allez sur votre dashboard Supabase
2. Section "Authentication" → "Users"
3. Cherchez l'email : `24177777000@ndjobi.com`

**Option B - Via SQL :**
```sql
-- Exécuter dans l'éditeur SQL de Supabase
SELECT email, id, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = '24177777000@ndjobi.com';
```

### 3. Vérifier le Rôle

```sql
-- Vérifier si le rôle super_admin existe
SELECT ur.role, au.email, au.id
FROM user_roles ur 
JOIN auth.users au ON au.id = ur.user_id 
WHERE au.email = '24177777000@ndjobi.com';
```

### 4. Solutions selon le Problème

#### ❌ **Problème : Le compte n'existe pas**

**Solution 1 - Création manuelle :**
1. Allez sur `/auth` dans votre application
2. Cliquez sur "Inscription"
3. Utilisez :
   - Numéro : `+241 77 777 000`
   - Nom : `Super Administrateur`
   - Email sera généré automatiquement : `24177777000@ndjobi.com`
   - Mot de passe : `123456`

**Solution 2 - Via console navigateur :**
1. Ouvrez la console (F12) sur la page `/auth`
2. Copiez-collez le contenu de `scripts/create-super-admin-ndjobi-com.js`
3. Appuyez sur Entrée

#### ❌ **Problème : Le compte existe mais mauvais domaine**

Si le compte existe avec `@ndjobi.ga`, exécutez dans Supabase SQL :
```sql
-- Mettre à jour l'email
UPDATE auth.users 
SET email = '24177777000@ndjobi.com',
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'),
        '{email}',
        '"24177777000@ndjobi.com"'
    )
WHERE email = '24177777000@ndjobi.ga';

-- Mettre à jour le profil
UPDATE profiles 
SET email = '24177777000@ndjobi.com'
WHERE email = '24177777000@ndjobi.ga';
```

#### ❌ **Problème : Le compte existe mais pas de rôle super_admin**

```sql
-- Ajouter le rôle (remplacez USER_ID par l'ID réel)
INSERT INTO user_roles (user_id, role) 
VALUES ('USER_ID_ICI', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

#### ❌ **Problème : Email non confirmé**

```sql
-- Confirmer l'email manuellement
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = '24177777000@ndjobi.com';
```

### 5. Test de Connexion

Après avoir résolu le problème :

1. Allez sur `/auth`
2. Cliquez sur "Super Admin" (bouton rouge en bas)
3. Entrez le code : `011282*`
4. Cliquez sur "Accéder au système"

## 🚨 Messages d'Erreur Courants

### "Code d'authentification incorrect"
- ✅ Vérifiez que vous tapez bien `011282*` (avec l'astérisque)
- ✅ Pas d'espaces avant ou après

### "Erreur de connexion: Invalid login credentials"
- ❌ Le compte n'existe pas ou mauvais mot de passe
- 🔧 Créez le compte ou réinitialisez le mot de passe

### "Compte Super Admin non trouvé"
- ❌ Le compte existe mais l'email ne correspond pas
- 🔧 Vérifiez que l'email est bien `24177777000@ndjobi.com`

### "Accès refusé"
- ❌ Le rôle `super_admin` n'est pas assigné
- 🔧 Ajoutez le rôle dans la table `user_roles`

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs de la console navigateur (F12)
2. Vérifiez les logs Supabase
3. Exécutez le script de diagnostic complet

## ✅ Vérification Finale

Une fois connecté, vous devriez :
- Être redirigé vers `/dashboard/super-admin`
- Voir le menu avec : Dashboard, Gestion Système, Utilisateurs, Projet, Module XR-7, Configuration, Démo
- Avoir accès à toutes les fonctionnalités Super Admin
