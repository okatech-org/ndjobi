# Installation des Comptes de Démonstration NDJOBI

## 🎯 Objectif
Créer tous les comptes de démonstration dans la base de données Supabase selon la logique complète des rôles et permissions.

## 📋 Prérequis
- Accès au dashboard Supabase sur Lovable
- Droits d'administration sur la base de données

## 🚀 Étapes d'Installation

### Étape 1 : Accéder au Dashboard Supabase

1. Connectez-vous à votre compte Lovable
2. Ouvrez votre projet NDJOBI
3. Allez dans l'onglet **Database** ou **SQL Editor**

### Étape 2 : Exécuter le Script SQL

1. Copiez le contenu du fichier : `scripts/create-demo-accounts-logique-complete.sql`
2. Collez-le dans l'éditeur SQL de Supabase
3. Cliquez sur **Run** ou **Execute**

### Étape 3 : Vérifier la Création

Exécutez cette requête pour vérifier que tous les comptes ont été créés :

```sql
SELECT 
    ur.role AS "Rôle",
    p.full_name AS "Nom",
    p.phone AS "Téléphone",
    p.organization AS "Organisation",
    u.email AS "Email",
    u.created_at AS "Date création"
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email LIKE '24177888%@ndjobi.com'
ORDER BY ur.role, p.organization;
```

## ✅ Comptes Créés

Après l'exécution du script, vous aurez les comptes suivants :

| Rôle | Nom | Téléphone | PIN | Organisation |
|------|-----|-----------|-----|--------------|
| super_admin | Super Administrateur | +33 6 61 00 26 16 | 999999 | NDJOBI Platform |
| admin | Président / Administrateur | +241 77 888 001 | 111111 | Présidence de la République |
| sub_admin | Sous-Admin DGSS | +241 77 888 002 | 222222 | Direction Générale Sécurité |
| sub_admin | Sous-Admin DGR | +241 77 888 003 | 333333 | Direction Générale Renseignements |
| agent | Agent Ministère Défense | +241 77 888 004 | 444444 | Ministère de la Défense |
| agent | Agent Ministère Justice | +241 77 888 005 | 555555 | Ministère de la Justice |
| agent | Agent Lutte Anti-Corruption | +241 77 888 006 | 666666 | Commission LAC |
| agent | Agent Ministère Intérieur | +241 77 888 007 | 777777 | Ministère de l'Intérieur |
| user | Citoyen Démo | +241 77 888 008 | 888888 | - |
| user | Citoyen Anonyme | +241 77 888 009 | 999999 | - |

## 🔐 Test de Connexion

Pour tester un compte :

1. Ouvrez l'application NDJOBI
2. Saisissez un numéro de téléphone (ex: +241 77 888 001)
3. Saisissez le PIN correspondant (ex: 111111)
4. Vous serez redirigé vers le dashboard correspondant à votre rôle

## 🛠️ Dépannage

### Erreur : "Role 'sub_admin' does not exist"

Si vous recevez cette erreur, exécutez d'abord :

```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sub_admin';
```

### Erreur : "User already exists"

Le script gère automatiquement les utilisateurs existants. Si vous voulez réinitialiser, exécutez d'abord :

```sql
-- Supprimer les comptes de démonstration existants
DELETE FROM public.user_roles WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '24177888%@ndjobi.com'
);
DELETE FROM public.profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email LIKE '24177888%@ndjobi.com'
);
DELETE FROM auth.users WHERE email LIKE '24177888%@ndjobi.com';
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez que les politiques RLS sont actives
2. Vérifiez que l'enum `app_role` contient tous les rôles
3. Vérifiez les logs Supabase pour plus de détails

## ⚠️ Important

- Ces comptes sont pour **DÉMONSTRATION** uniquement
- **NE PAS** utiliser en production avec ces PINs
- Changer les PINs et numéros pour un usage réel
- Les numéros doivent être réels pour recevoir les codes OTP en production
