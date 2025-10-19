# 🔄 MISE À JOUR - Identifiants Réels

## ✅ Changements Appliqués

Les identifiants ont été mis à jour pour utiliser les **comptes réels existants** :

---

## 🔑 Anciens Identifiants (SUPPRIMÉS)

❌ ~~`president@ndjobi.ga` / `Admin2025Secure!`~~  
❌ ~~`admin.dgss@ndjobi.ga` / `Admin2025Secure!`~~  
❌ ~~`admin.dgr@ndjobi.ga` / `Admin2025Secure!`~~  
❌ ~~`admin.dglic@ndjobi.ga` / `Admin2025Secure!`~~  
❌ ~~`agent.mer@ndjobi.ga` / `Admin2025Secure!`~~  
❌ ~~`agent.interieur@ndjobi.ga` / `Admin2025Secure!`~~

---

## ✅ Nouveaux Identifiants (Comptes Existants)

### Format de Connexion

**Téléphone** + **Code PIN** (6 chiffres)

### Comptes Administrateurs

| Rôle | Téléphone | PIN | Email |
|------|-----------|-----|-------|
| **Super Admin Système** | +33661002616 | 999999 | 33661002616@ndjobi.com |
| **Président** | +24177888001 | 111111 | 24177888001@ndjobi.com |
| **Sous-Admin DGSS** | +24177888002 | 222222 | 24177888002@ndjobi.com |
| **Sous-Admin DGR** | +24177888003 | 333333 | 24177888003@ndjobi.com |

---

## 📝 Fichiers Mis à Jour

Les fichiers suivants ont été corrigés avec les vrais identifiants :

✅ **`scripts/import-simulation-data.js`**  
- Utilise les comptes existants
- Met à jour profils au lieu de créer
- Affiche les vrais téléphones et PINs

✅ **`IDENTIFIANTS-CONNEXION.md`**  
- Section complète avec vrais identifiants
- Format téléphone + PIN
- Détails de chaque compte

✅ **`VRAIS-IDENTIFIANTS.md`** (nouveau)  
- Guide complet identifiants réels
- Scénarios de test
- Instructions connexion

✅ **`DEMARRAGE-RAPIDE.md`**  
- Login mis à jour : +24177888001 / 111111

✅ **`SIMULATION-README.md`**  
- Tableau identifiants corrigé
- Format téléphone + PIN

---

## 🔄 Comportement du Script d'Import

### Ancienne Version (créait des comptes)

```javascript
// ❌ ANCIEN - Créait de nouveaux comptes
supabase.auth.admin.createUser({
  email: 'president@ndjobi.ga',
  password: 'Admin2025Secure!',
  ...
});
```

### Nouvelle Version (met à jour existants)

```javascript
// ✅ NOUVEAU - Met à jour comptes existants
// 1. Récupère l'utilisateur existant par email
const existingUser = users.find(u => u.email === '24177888001@ndjobi.com');

// 2. Met à jour uniquement le profil
supabase.from('profiles').upsert({
  id: existingUser.id,
  email: '24177888001@ndjobi.com',
  phone: '+24177888001',
  role: 'super_admin',
  ...
});

// 3. Met à jour le rôle
supabase.from('user_roles').upsert({
  user_id: existingUser.id,
  role: 'super_admin',
  is_active: true
});
```

---

## 🧪 Tester les Connexions

### Test 1 : Super Admin Système

```
1. Ouvrir: http://localhost:5173
2. Cliquer: "Connexion"
3. Téléphone: +33661002616
4. PIN: 999999
5. Vérifier: Accès dashboard super-admin
```

### Test 2 : Président

```
1. Téléphone: +24177888001
2. PIN: 111111
3. Vérifier: Dashboard présidentiel
4. Vérifier: Onglet "Validation" accessible
5. Vérifier: ~300 signalements visibles
```

### Test 3 : Sous-Admin DGSS

```
1. Téléphone: +24177888002
2. PIN: 222222
3. Vérifier: Dashboard admin DGSS
4. Vérifier: Vue sectorielle sécurité
```

### Test 4 : Sous-Admin DGR

```
1. Téléphone: +24177888003
2. PIN: 333333
3. Vérifier: Dashboard admin DGR
4. Vérifier: Vue renseignement
```

---

## 🎯 Comptes à NE PAS Créer

Le script **n'essaie plus** de créer ces comptes (qui n'existent pas) :

- ❌ ~~admin.dglic@ndjobi.ga~~
- ❌ ~~agent.mer@ndjobi.ga~~
- ❌ ~~agent.interieur@ndjobi.ga~~

**Raison :** Ces comptes n'existent pas dans Supabase Auth. Seuls les 4 comptes existants sont mis à jour.

---

## 📊 Résultat Attendu de l'Import

```
╔══════════════════════════════════════════════════════════════╗
║       NDJOBI - IMPORT DONNÉES DE SIMULATION                  ║
╚══════════════════════════════════════════════════════════════╝

🔌 Vérification connexion Supabase...
✅ Connexion Supabase OK

👑 Mise à jour des comptes administrateurs existants...
✅ Profil 33661002616@ndjobi.com mis à jour - Rôle: super_admin
✅ Profil 24177888001@ndjobi.com mis à jour - Rôle: super_admin
✅ Profil 24177888002@ndjobi.com mis à jour - Rôle: admin
✅ Profil 24177888003@ndjobi.com mis à jour - Rôle: admin

✅ Mise à jour admins terminée: 4 succès, 0 erreurs

🔑 COMPTES ADMINISTRATEURS (EXISTANTS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPER_ADMIN    | 33661002616@ndjobi.com           | +33661002616
SUPER_ADMIN    | 24177888001@ndjobi.com           | +24177888001
ADMIN          | 24177888002@ndjobi.com           | +24177888002
ADMIN          | 24177888003@ndjobi.com           | +24177888003
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Ces comptes existent déjà - profils et rôles mis à jour
🔐 Connexion avec téléphone + code PIN (voir Supabase Auth)

📥 Import des utilisateurs...
✅ User temoin_peche@secure.ndjobi.ga créé avec succès
...
```

---

## 🔍 Vérification Post-Import

### Requêtes SQL

```sql
-- Vérifier les profils admin
SELECT id, email, phone, role, full_name, fonction
FROM profiles
WHERE email IN (
  '33661002616@ndjobi.com',
  '24177888001@ndjobi.com',
  '24177888002@ndjobi.com',
  '24177888003@ndjobi.com'
);

-- Résultat attendu: 4 lignes avec rôles super_admin et admin

-- Vérifier les rôles assignés
SELECT ur.role, p.email, p.phone, ur.is_active
FROM user_roles ur
JOIN profiles p ON p.id = ur.user_id
WHERE p.email LIKE '%@ndjobi.com'
AND p.phone LIKE '+241%' OR p.phone LIKE '+336%';

-- Résultat attendu: 4 rôles actifs
```

---

## 📞 Support

Si les comptes ne fonctionnent pas après l'import :

1. **Vérifier dans Supabase** → Authentication → Users
2. **Vérifier** que les 4 emails existent
3. **Vérifier dans** Table Editor → profiles
4. **Vérifier** que les rôles sont corrects dans user_roles
5. **Exécuter** `npm run simulation:verify`

---

## 🎉 Résumé

✅ **4 comptes administrateurs** existants utilisés  
✅ **Profils** mis à jour avec rôles corrects  
✅ **Connexion** par téléphone + PIN  
✅ **Simulation** prête avec vrais comptes

**👉 Testez maintenant avec `npm run dev` !**

---

**🔐 Sécurité : Ces codes PIN sont pour test uniquement. En production, utilisez des codes complexes.**
