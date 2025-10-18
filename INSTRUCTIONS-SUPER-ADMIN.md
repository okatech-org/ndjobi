# Instructions pour Créer le Compte Super Admin

## 🚨 **Problème Identifié**

Le compte Super Admin n'existe pas dans la base de données, c'est pourquoi vous obtenez l'erreur "Compte Super Admin introuvable".

## 🔧 **Solution : Création Manuelle du Compte**

### **Étape 1 : Ouvrir le Dashboard Supabase**
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet NDJOBI

### **Étape 2 : Ouvrir le SQL Editor**
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"**

### **Étape 3 : Exécuter le Script SQL**
1. Copiez le contenu du fichier `CREER-SUPER-ADMIN-MANUEL-SIMPLE.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur **"Run"** pour exécuter le script

### **Étape 4 : Vérifier la Création**
Le script devrait afficher :
```
✅ Compte Super Admin créé avec succès !
ID: [UUID]
Email: 33661002616@ndjobi.com
Téléphone: +33661002616
PIN: 999999
```

## 📋 **Informations du Compte Super Admin**

Une fois créé, le compte aura les caractéristiques suivantes :

- **Email** : `33661002616@ndjobi.com`
- **Téléphone** : `+33661002616`
- **PIN** : `999999`
- **Nom** : `Super Administrateur`
- **Organisation** : `Administration Système`
- **Rôle** : `super_admin`

## 🎯 **Test de la Connexion**

Après avoir créé le compte :

1. **Rechargez la page** de votre application
2. **Ouvrez le modal Super Admin** (cliquez sur l'icône Super Admin)
3. **Entrez le PIN** : `999999`
4. **Cliquez sur "Se connecter"**

La connexion devrait maintenant fonctionner !

## 🔍 **Vérification Alternative**

Si vous voulez vérifier que le compte existe, vous pouvez exécuter ce SQL dans le SQL Editor :

```sql
SELECT 
    u.id,
    u.email,
    u.phone,
    p.full_name,
    ur.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '33661002616@ndjobi.com';
```

## ❌ **En Cas de Problème**

Si vous rencontrez des erreurs :

1. **Vérifiez les permissions** : Assurez-vous d'avoir les droits d'administration sur le projet Supabase
2. **Vérifiez la connexion** : Assurez-vous d'être connecté au bon projet
3. **Vérifiez les tables** : Les tables `auth.users`, `public.profiles` et `public.user_roles` doivent exister

## 📞 **Support**

Si le problème persiste :
1. Vérifiez les logs de la console du navigateur
2. Vérifiez les logs de Supabase dans le dashboard
3. Contactez le support technique

---

**Une fois le compte créé, vous devriez pouvoir vous connecter avec le PIN `999999` !** 🎉
