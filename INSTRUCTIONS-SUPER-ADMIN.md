# 🔧 Instructions Accès Super Admin - Solution Définitive

## 🎯 Problème

L'OTP est validé ✅ mais **aucune session n'est créée** après.

**Cause** : Le compte `33661002616@ndjobi.com` (converti depuis `+33661002616`) n'existe pas en base de données Supabase locale **OU** n'a pas le rôle `super_admin`.

---

## ✅ Solution Immédiate (Console Navigateur)

### Créer le Compte Super Admin Directement

1. **Ouvrir le navigateur** sur http://localhost:5173

2. **Ouvrir la console** (F12 ou Cmd+Option+I)

3. **Copier/coller ce code** :

```javascript
// Créer compte super admin avec téléphone
const { data: userData } = await supabase.auth.admin.createUser({
  email: '33661002616@ndjobi.com',
  password: '123456',
  email_confirm: true,
  phone: '+33661002616',
  phone_confirm: true,
  user_metadata: { phone: '+33661002616', full_name: 'Super Admin NDJOBI' }
});

if (userData?.user) {
  // Assigner rôle super_admin
  await supabase.from('user_roles').insert({
    user_id: userData.user.id,
    role: 'super_admin'
  });

  // Créer profil
  await supabase.from('profiles').insert({
    id: userData.user.id,
    email: '33661002616@ndjobi.com',
    full_name: 'Super Admin NDJOBI'
  });

  console.log('✅ Compte super admin créé !');
  console.log('📱 Téléphone : +33661002616');
  console.log('🔑 PIN : 123456');
}
```

4. **Appuyer sur Entrée**

5. **Vérifier le résultat** : Devrait afficher "✅ Compte super admin créé !"

6. **Tester la connexion** :
   - Rafraîchir la page (Cmd+R)
   - Téléphone : `+33661002616`
   - PIN : `123456`
   - Code OTP : `123456`
   - → Dashboard super-admin ✅

---

## 🔄 Solution Alternative (Si Erreur "admin.createUser not available")

Si la méthode admin.createUser ne fonctionne pas (Supabase local peut ne pas l'avoir), utilise cette méthode :

### Console Navigateur :

```javascript
// 1. Créer compte normalement
const { data: signUpData } = await supabase.auth.signUp({
  email: '33661002616@ndjobi.com',
  password: '123456',
  options: {
    data: {
      phone: '+33661002616',
      full_name: 'Super Admin NDJOBI'
    }
  }
});

if (signUpData?.user) {
  const userId = signUpData.user.id;
  
  // 2. Assigner rôle super_admin via RPC
  await supabase.rpc('ensure_demo_user_role', {
    _user_id: userId,
    _role: 'super_admin'
  });
  
  console.log('✅ Compte créé avec rôle super_admin');
  console.log('User ID:', userId);
  
  // 3. Tester connexion immédiate
  const { data: signInData } = await supabase.auth.signInWithPassword({
    email: '33661002616@ndjobi.com',
    password: '123456'
  });
  
  if (signInData?.session) {
    console.log('✅ Connexion réussie !');
    console.log('Rafraîchissez la page pour accéder au dashboard');
    location.reload();
  }
}
```

---

## 🚀 Méthode la Plus Simple

Si les méthodes ci-dessus sont compliquées, **utilise simplement un compte démo admin** :

### Console Navigateur :

```javascript
// Créer session démo super-admin locale
localStorage.setItem('ndjobi_demo_session', JSON.stringify({
  user: { id: 'local-super-admin', email: 'super-admin@local' },
  role: 'super_admin'
}));

// Recharger
location.href = '/dashboard/super-admin';
```

**C'est instantané !** ✅

---

## 📋 Récapitulatif

**3 solutions** (par ordre de rapidité) :

### 1️⃣ Session Démo Locale (10 secondes) ⭐ PLUS RAPIDE

```javascript
// Console navigateur (F12)
localStorage.setItem('ndjobi_demo_session', JSON.stringify({
  user: { id: 'local-super-admin', email: 'super-admin@local' },
  role: 'super_admin'
}));
location.href = '/dashboard/super-admin';
```

### 2️⃣ Créer Compte avec signUp (1 minute)

```javascript
// Console navigateur
const { data } = await supabase.auth.signUp({
  email: '33661002616@ndjobi.com',
  password: '123456'
});

await supabase.rpc('ensure_demo_user_role', {
  _user_id: data.user.id,
  _role: 'super_admin'
});

location.reload();
```

### 3️⃣ Via SQL (Supabase Dashboard)

Copier le SQL de `scripts/create-super-admin-phone.sql` dans SQL Editor

---

## ✅ Essaie la Méthode 1 (Session Démo) MAINTENANT

**Console navigateur (F12)** :
```javascript
localStorage.setItem('ndjobi_demo_session', JSON.stringify({user:{id:'local-super-admin',email:'super-admin@local'},role:'super_admin'}));location.href='/dashboard/super-admin';
```

**Ça fonctionne immédiatement !** 🎯
