# 🔧 GUIDE DE RÉSOLUTION - AUTHENTIFICATION DÉMO

## ❌ PROBLÈMES IDENTIFIÉS

1. **Port incorrect** : L'app tournait sur 8080 au lieu de 5173
2. **Rôles non assignés** : Les comptes démo existent mais sans rôles
3. **Redirection échouée** : `/dashboard` redirige vers `/auth` si pas de rôle

## ✅ SOLUTIONS APPLIQUÉES

### 1️⃣ PORT CORRIGÉ (5173)

**Changement dans `vite.config.ts` :**
```typescript
server: {
  port: 5173,  // Était 8080
}
```

**Action :** Redémarrez le serveur
```bash
# Arrêter l'ancien serveur
pkill -f "node.*vite"

# Redémarrer sur le bon port
bun run dev
```

L'app sera maintenant sur : **http://localhost:5173**

---

### 2️⃣ ASSIGNER LES RÔLES AUX COMPTES DÉMO

**Méthode 1 : Via Supabase Studio** ⭐ (Recommandé)

1. Ouvrez : http://127.0.0.1:54323/project/default/editor
2. Copiez-collez le contenu de : `/scripts/fix-demo-accounts.sql`
3. Cliquez sur **"Run"**
4. Vous verrez :
   ```
   ✅ Super Admin configuré
   ✅ Admin configuré
   ✅ Agent configuré
   ✅ Citoyen configuré
   ```

**Méthode 2 : Test Interactif**

1. Ouvrez : `/scripts/test-auth.html` dans votre navigateur
2. Cliquez sur chaque bouton de compte
3. Vérifiez que le rôle s'affiche

---

### 3️⃣ FLUX D'AUTHENTIFICATION CORRIGÉ

Le système fonctionne maintenant ainsi :

1. **Connexion** → Email technique (`24177777000@ndjobi.ga`)
2. **Vérification** → Mot de passe (`123456`)
3. **Récupération du rôle** → Table `user_roles`
4. **Redirection** :
   - Super Admin → `/dashboard/super-admin`
   - Admin → `/dashboard/admin`
   - Agent → `/dashboard/agent`
   - Citoyen → `/dashboard/user`

---

## 📝 ÉTAPES DE RÉSOLUTION

### **ÉTAPE 1 : Redémarrer l'Application**

```bash
cd /Users/okatech/ndjobi

# Arrêter le serveur actuel
pkill -f "node.*vite"

# Redémarrer sur le port 5173
bun run dev
```

### **ÉTAPE 2 : Exécuter le SQL de Réparation**

Ouvrez : http://127.0.0.1:54323/project/default/editor

Exécutez :
```sql
-- Contenu du fichier /scripts/fix-demo-accounts.sql
```

### **ÉTAPE 3 : Tester la Connexion**

1. Allez sur : http://localhost:5173/auth
2. Cliquez sur la carte **"Super Admin"**
3. Ou utilisez le formulaire :
   - Numéro : `77777000`
   - PIN : `123456`

---

## 🔍 VÉRIFICATION

### **Test 1 : Vérifier les Comptes dans Supabase**

SQL à exécuter :
```sql
SELECT 
  u.email,
  ur.role,
  p.username
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%@ndjobi.ga';
```

Résultat attendu :
```
24177777000@ndjobi.ga | super_admin | Super Admin
24177777003@ndjobi.ga | admin      | Protocole État
24177777002@ndjobi.ga | agent      | Agent DGSS
24177777001@ndjobi.ga | user       | Citoyen
```

### **Test 2 : Page de Test**

Ouvrez dans votre navigateur :
```
file:///Users/okatech/ndjobi/scripts/test-auth.html
```

Cliquez sur chaque bouton pour vérifier la connexion.

---

## 🎯 RÉSULTAT FINAL

Après ces corrections :

1. ✅ L'app tourne sur **http://localhost:5173**
2. ✅ Les comptes démo fonctionnent
3. ✅ Les redirections sont correctes :
   - Super Admin → `/dashboard/super-admin`
   - Admin → `/dashboard/admin`
   - Agent → `/dashboard/agent`
   - Citoyen → `/dashboard/user`
4. ✅ Module XR-7 accessible (Super Admin uniquement)

---

## 📱 TABLEAU RÉCAPITULATIF

| Compte | Numéro | PIN | Dashboard |
|--------|--------|-----|-----------|
| **Super Admin** ⚡ | 77777000 | 123456 | `/dashboard/super-admin` |
| Admin 👑 | 77777003 | 123456 | `/dashboard/admin` |
| Agent 👥 | 77777002 | 123456 | `/dashboard/agent` |
| Citoyen 👤 | 77777001 | 123456 | `/dashboard/user` |

---

## ⚠️ SI ÇA NE FONCTIONNE TOUJOURS PAS

1. **Vider le cache du navigateur**
   ```
   Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
   ```

2. **Vérifier Supabase**
   ```bash
   supabase status
   ```
   Doit montrer les services actifs

3. **Réinitialiser tout**
   ```bash
   supabase db reset
   ./scripts/quick-setup.sh
   ```
   Puis exécuter le SQL `fix-demo-accounts.sql`

4. **Mode Incognito**
   Testez dans une fenêtre privée

---

## 📞 SUPPORT

Si le problème persiste après toutes ces étapes :

1. Vérifiez la console du navigateur (F12)
2. Regardez les logs Supabase
3. Utilisez la page de test `/scripts/test-auth.html`

**Commande de diagnostic complète :**
```bash
# Vérifier les services
supabase status

# Voir les logs d'auth
supabase logs auth

# Lister les utilisateurs (dans SQL Editor)
SELECT * FROM auth.users WHERE email LIKE '%@ndjobi.ga';
```

---

**✅ Le système devrait maintenant fonctionner correctement !**
