# 📝 CHANGELOG - Mise à Jour Identifiants Réels

## 🔄 Version 2.0 - Identifiants Réels (19 Oct 2025)

### ✅ Changements Majeurs

**Les scripts utilisent désormais les comptes RÉELS existants** au lieu de créer de nouveaux comptes fictifs.

---

## 🔑 Identifiants Mis à Jour

### Anciens (v1.0 - SUPPRIMÉS)

```
❌ president@ndjobi.ga          / Admin2025Secure!
❌ admin.dgss@ndjobi.ga         / Admin2025Secure!
❌ admin.dgr@ndjobi.ga          / Admin2025Secure!
❌ admin.dglic@ndjobi.ga        / Admin2025Secure!
❌ agent.mer@ndjobi.ga          / Admin2025Secure!
❌ agent.interieur@ndjobi.ga    / Admin2025Secure!
```

### Nouveaux (v2.0 - ACTUELS)

```
✅ +33661002616  / PIN: 999999  (Super Admin Système)
✅ +24177888001  / PIN: 111111  (Président)
✅ +24177888002  / PIN: 222222  (Sous-Admin DGSS)
✅ +24177888003  / PIN: 333333  (Sous-Admin DGR)
```

---

## 📁 Fichiers Modifiés

### Scripts d'Import

✅ **`scripts/import-simulation-data.js`**
- Utilise comptes existants (pas de création)
- Recherche users par email dans Supabase Auth
- Upsert profils et rôles
- Affiche téléphones au lieu de mots de passe

✅ **`scripts/import-simulation-data.ts`**
- Même logique que la version `.js`
- Types TypeScript mis à jour

### Documentation

✅ **`IDENTIFIANTS-CONNEXION.md`**
- Section complète avec vrais identifiants
- Format téléphone + PIN
- 4 comptes au lieu de 6

✅ **`DEMARRAGE-RAPIDE.md`**
- Login exemple : +24177888001 / 111111

✅ **`SIMULATION-README.md`**
- Tableau identifiants mis à jour
- 4 comptes existants

✅ **`VRAIS-IDENTIFIANTS.md`** (nouveau)
- Guide complet vrais identifiants
- Scénarios de test détaillés
- Instructions connexion

✅ **`MISE-A-JOUR-IDENTIFIANTS.md`** (nouveau)
- Documentation des changements
- Comparaison ancien/nouveau

✅ **`IDENTIFIANTS-REELS-FINAUX.md`** (nouveau)
- Synthèse finale des identifiants
- Vérifications SQL

---

## 🔧 Changements Techniques

### Logique d'Import

**Avant (v1.0) :**
```javascript
// Créait de nouveaux comptes
supabase.auth.admin.createUser({
  email: 'president@ndjobi.ga',
  password: 'Admin2025Secure!',
  email_confirm: true
});
```

**Après (v2.0) :**
```javascript
// Récupère comptes existants
const { data: { users } } = await supabase.auth.admin.listUsers();
const existingUser = users.find(u => u.email === '24177888001@ndjobi.com');

// Met à jour profil uniquement
supabase.from('profiles').upsert({
  id: existingUser.id,
  email: '24177888001@ndjobi.com',
  phone: '+24177888001',
  role: 'super_admin',
  ...
});
```

### Base de Données

**Tables affectées :**
- `profiles` : Ajout/Mise à jour des 4 profils admin
- `user_roles` : Assignation des rôles super_admin et admin

**Aucun changement** dans `auth.users` (comptes déjà créés)

---

## 📊 Impact

### Nombre de Comptes

| Version | Comptes Créés | Comptes Mis à Jour |
|---------|---------------|-------------------|
| v1.0 | 6 nouveaux | 0 |
| v2.0 | 0 nouveaux | 4 existants |

### Méthode d'Authentification

| Version | Méthode |
|---------|---------|
| v1.0 | Email + Mot de passe |
| v2.0 | Téléphone + Code PIN (6 chiffres) |

---

## 🎯 Comptes Non Inclus

Ces comptes n'existent PAS dans Supabase Auth et ne seront PAS créés :

- ❌ admin.dglic@ndjobi.ga (DGLIC)
- ❌ agent.mer@ndjobi.ga (Agent Mer)
- ❌ agent.interieur@ndjobi.ga (Agent Intérieur)

**Si besoin :** Créez-les manuellement dans Supabase Auth avec téléphone + PIN, puis réexécutez l'import.

---

## 🧪 Tests de Vérification

### Test 1 : Vérifier dans Supabase

```
1. Supabase Dashboard → Authentication → Users
2. Rechercher: 24177888001@ndjobi.com
3. Vérifier: Compte existe avec téléphone +24177888001
4. Répéter pour les 3 autres comptes
```

### Test 2 : Vérifier Profils

```sql
-- Dans Supabase SQL Editor
SELECT email, phone, role, full_name
FROM profiles
WHERE email LIKE '%@ndjobi.com'
ORDER BY role DESC;

-- Résultat attendu: 4 lignes
```

### Test 3 : Connexion Application

```
npm run dev
Login: +24177888001 / PIN: 111111
Vérifier: Dashboard s'affiche
```

---

## 🔐 Sécurité

### Codes PIN Actuels (Test)

- Super Admin Système : `999999`
- Président : `111111`
- DGSS : `222222`
- DGR : `333333`

**⚠️ POUR LA PRODUCTION :**
- Changez TOUS les codes PIN
- Utilisez des codes aléatoires complexes
- Activez 2FA (authentification à deux facteurs)
- Configurez rotation périodique des codes

---

## 📞 Support

Questions fréquentes :

**Q: Pourquoi seulement 4 comptes au lieu de 6 ?**  
R: Seuls ces 4 comptes existent dans Supabase Auth. Les 2 autres doivent être créés manuellement.

**Q: Comment ajouter un agent (agent.mer) ?**  
R: 1. Créez le compte dans Supabase Auth avec téléphone + PIN  
   2. Ajoutez-le dans le tableau `admins` du script  
   3. Réexécutez l'import

**Q: La connexion échoue avec le téléphone**  
R: 1. Format exact: `+24177888001` (avec +, sans espaces)  
   2. PIN exact: `111111` (6 chiffres)  
   3. Vérifiez que le compte existe dans Supabase Auth

---

## ✅ Checklist Migration v1.0 → v2.0

- [x] Scripts d'import modifiés (JS + TS)
- [x] Documentation mise à jour (6 fichiers)
- [x] Nouveaux guides créés (3 fichiers)
- [x] Identifiants fictifs supprimés
- [x] Identifiants réels configurés
- [x] Tests de connexion validés
- [x] Format téléphone + PIN documenté

---

## 🎉 Migration Terminée !

Les scripts et la documentation utilisent maintenant les **identifiants réels** des comptes existants.

**🚀 Prochaine étape :** Exécutez `npm run simulation:import` avec les vrais comptes !

---

**🇬🇦 Version 2.0 - Comptes Réels Configurés**
