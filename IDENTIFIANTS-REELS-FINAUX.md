# 🔑 IDENTIFIANTS RÉELS FINAUX - NDJOBI

## ✅ Comptes Administrateurs Configurés

Les scripts d'import utilisent désormais les **comptes réels existants** dans Supabase.

---

## 👤 COMPTES EXISTANTS (4)

### 👑 Super Administrateur Système

```
Email:      33661002616@ndjobi.com
Téléphone:  +33661002616
Code PIN:   999999
Rôle:       super_admin
```

**Utilisation :** Administration technique, configuration système

---

### 🏛️ Président de la République

```
Email:      24177888001@ndjobi.com
Téléphone:  +24177888001
Code PIN:   111111
Rôle:       super_admin (Protocole d'État)
Org:        Présidence de la République
```

**Utilisation :** Décisions stratégiques, validation cas critiques, rapports présidentiels

---

### 🛡️ Sous-Admin DGSS

```
Email:      24177888002@ndjobi.com
Téléphone:  +24177888002
Code PIN:   222222
Rôle:       admin
Org:        DGSS (Direction Générale de la Sécurité d'État)
```

**Utilisation :** Vue sectorielle sécurité, assignation agents

---

### 🕵️ Sous-Admin DGR

```
Email:      24177888003@ndjobi.com
Téléphone:  +24177888003
Code PIN:   333333
Rôle:       admin
Org:        DGR (Direction Générale du Renseignement)
```

**Utilisation :** Vue sectorielle renseignement, enquêtes sensibles

---

## 🚀 Test de Connexion

### Depuis l'Application

```
1. npm run dev
2. http://localhost:5173
3. Cliquer "Connexion"
4. Saisir: +24177888001 (format international avec +)
5. Saisir PIN: 111111
6. ✅ Accès dashboard présidentiel
```

---

## 📊 Résultat Import

Après `npm run simulation:import` :

```
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
🔐 Connexion avec téléphone + code PIN
```

---

## 🔄 Changements Appliqués

### Scripts Modifiés

✅ `scripts/import-simulation-data.js`  
✅ `scripts/import-simulation-data.ts`  

**Modifications :**
- ❌ Ne crée PLUS de nouveaux comptes
- ✅ Récupère les comptes existants par email
- ✅ Met à jour profils et rôles uniquement
- ✅ Affiche les vrais téléphones

### Documentation Modifiée

✅ `IDENTIFIANTS-CONNEXION.md`  
✅ `DEMARRAGE-RAPIDE.md`  
✅ `SIMULATION-README.md`  
✅ `VRAIS-IDENTIFIANTS.md` (nouveau)  
✅ `MISE-A-JOUR-IDENTIFIANTS.md` (nouveau)  
✅ `IDENTIFIANTS-REELS-FINAUX.md` (ce fichier)

---

## 📋 Tableau Récapitulatif

| Compte | Téléphone | PIN | Email | Rôle | Dashboard |
|--------|-----------|-----|-------|------|-----------|
| Super Admin Sys | +33661002616 | 999999 | 33661002616@ndjobi.com | super_admin | /dashboard/super-admin |
| Président | +24177888001 | 111111 | 24177888001@ndjobi.com | super_admin | /dashboard/super-admin |
| DGSS | +24177888002 | 222222 | 24177888002@ndjobi.com | admin | /dashboard/admin |
| DGR | +24177888003 | 333333 | 24177888003@ndjobi.com | admin | /dashboard/admin |

---

## ⚠️ Comptes NON Créés

Ces comptes ne seront **PAS** créés car ils n'existent pas dans Supabase Auth :

- ❌ ~~admin.dglic@ndjobi.ga~~
- ❌ ~~agent.mer@ndjobi.ga~~
- ❌ ~~agent.interieur@ndjobi.ga~~

**Si vous souhaitez ces comptes** : Créez-les manuellement dans Supabase Auth d'abord, puis réexécutez l'import.

---

## 🔍 Vérification

### SQL - Vérifier les Profils

```sql
SELECT 
  email,
  phone,
  role,
  full_name,
  fonction
FROM profiles
WHERE email IN (
  '33661002616@ndjobi.com',
  '24177888001@ndjobi.com',
  '24177888002@ndjobi.com',
  '24177888003@ndjobi.com'
)
ORDER BY role DESC, email;
```

**Résultat attendu :** 4 lignes avec rôles super_admin et admin

### SQL - Vérifier les Rôles

```sql
SELECT 
  p.email,
  p.phone,
  ur.role,
  ur.is_active
FROM user_roles ur
JOIN profiles p ON p.id = ur.user_id
WHERE p.email LIKE '%@ndjobi.com'
AND (p.phone LIKE '+241%' OR p.phone LIKE '+336%');
```

**Résultat attendu :** 4 rôles actifs

---

## 🎯 Prochaines Étapes

1. ✅ **Exécuter l'import** : `npm run simulation:import`
2. ✅ **Vérifier** : `npm run simulation:verify`
3. ✅ **Tester connexion** : `npm run dev`
4. ✅ **Login Président** : +24177888001 / 111111

---

## 📞 Support

Si connexion échoue :

1. Vérifiez que les comptes existent dans Supabase → Authentication
2. Vérifiez le format téléphone : `+24177888001` (avec +, sans espaces)
3. Vérifiez le PIN : 6 chiffres exacts (`111111`)
4. Consultez `VRAIS-IDENTIFIANTS.md` pour détails complets

---

**✅ IDENTIFIANTS RÉELS CONFIGURÉS ET PRÊTS !**

**🇬🇦 Testez maintenant avec les vrais comptes !**
