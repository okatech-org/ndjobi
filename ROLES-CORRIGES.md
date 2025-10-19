# ✅ RÔLES CORRIGÉS - Hiérarchie Stricte NDJOBI

## 🎯 Rôles Finaux Configurés

### Hiérarchie Stricte

```
┌──────────────────────────────────────────┐
│        SUPER_ADMIN (1 seul)              │
│    33661002616@ndjobi.com                │
│    Super Administrateur Système          │
└──────────────┬───────────────────────────┘
               │
        ┌──────┴───────┐
        │              │
┌───────▼──────┐  ┌───▼────────────┐
│    ADMIN     │  │  SOUS_ADMIN    │
│              │  │                │
│ Président    │  │ DGSS + DGR     │
│ 241778880001 │  │ 241778880002/3 │
└──────────────┘  └────────────────┘
```

---

## 📋 Rôles Exacts par Compte

### 👑 Super Admin (1 compte)

**Email :** `33661002616@ndjobi.com`  
**Téléphone :** `+33661002616`  
**PIN :** `999999`  
**Rôle Base de Données :** `super_admin`  
**Fonction :** Super Administrateur Système

**Privilèges :**
- ✅ Accès système complet
- ✅ Configuration totale
- ✅ Gestion utilisateurs
- ✅ Tous les dashboards

---

### 🏛️ Admin - Président (1 compte)

**Email :** `24177888001@ndjobi.com`  
**Téléphone :** `+24177888001`  
**PIN :** `111111`  
**Rôle Base de Données :** `admin`  
**Fonction :** Admin - Président de la République  
**Organisation :** Présidence de la République

**Privilèges :**
- ✅ Vue nationale complète
- ✅ Validation cas critiques
- ✅ Rapports présidentiels
- ✅ Dashboard administratif
- 🔒 Pas de config système (réservé super_admin)

---

### 🛡️ Sous-Admin DGSS (1 compte)

**Email :** `24177888002@ndjobi.com`  
**Téléphone :** `+24177888002`  
**PIN :** `222222`  
**Rôle Base de Données :** `sous_admin`  
**Fonction :** Sous-Admin DGSS  
**Organisation :** DGSS (Direction Générale de la Sécurité d'État)

**Privilèges :**
- ✅ Vue sectorielle DGSS
- ✅ Assignation agents secteur
- ✅ Statistiques DGSS
- 🔒 Accès limité à son secteur

---

### 🕵️ Sous-Admin DGR (1 compte)

**Email :** `24177888003@ndjobi.com`  
**Téléphone :** `+24177888003`  
**PIN :** `333333`  
**Rôle Base de Données :** `sous_admin`  
**Fonction :** Sous-Admin DGR  
**Organisation :** DGR (Direction Générale du Renseignement)

**Privilèges :**
- ✅ Vue sectorielle DGR
- ✅ Renseignement anticorruption
- ✅ Enquêtes sensibles
- 🔒 Accès limité à son secteur

---

## 📊 Résumé des Rôles

| Compte | Email | Rôle DB | Hiérarchie |
|--------|-------|---------|------------|
| Super Admin Système | 33661002616@ndjobi.com | `super_admin` | Niveau 1 (top) |
| Président | 24177888001@ndjobi.com | `admin` | Niveau 2 |
| DGSS | 24177888002@ndjobi.com | `sous_admin` | Niveau 3 |
| DGR | 24177888003@ndjobi.com | `sous_admin` | Niveau 3 |

---

## 🗄️ Types PostgreSQL à Créer

Si `sous_admin` n'existe pas dans votre enum `user_role`, vous devez le créer :

### Option 1 : Modifier l'Enum Existant

```sql
-- Dans Supabase SQL Editor
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sous_admin';
```

### Option 2 : Utiliser 'admin' pour les Sous-Admins

Si vous ne pouvez pas modifier l'enum, changez le script :

```javascript
// Pour DGSS et DGR
role: 'admin'  // au lieu de 'sous_admin'
```

**Différenciation** : Utiliser le champ `fonction` pour distinguer Admin vs Sous-Admin

---

## 🔧 Script Import - Résultat Attendu

```
👑 Mise à jour des comptes administrateurs existants...
✅ Profil 33661002616@ndjobi.com mis à jour - Rôle: super_admin
✅ Profil 24177888001@ndjobi.com mis à jour - Rôle: admin
✅ Profil 24177888002@ndjobi.com mis à jour - Rôle: sous_admin
✅ Profil 24177888003@ndjobi.com mis à jour - Rôle: sous_admin

✅ Mise à jour admins terminée: 4 succès, 0 erreurs

🔑 COMPTES ADMINISTRATEURS (EXISTANTS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPER_ADMIN    | 33661002616@ndjobi.com           | +33661002616
ADMIN          | 24177888001@ndjobi.com           | +24177888001
SOUS_ADMIN     | 24177888002@ndjobi.com           | +24177888002
SOUS_ADMIN     | 24177888003@ndjobi.com           | +24177888003
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔍 Vérification SQL

```sql
-- Vérifier les rôles assignés
SELECT email, role, full_name, fonction
FROM profiles
WHERE email IN (
  '33661002616@ndjobi.com',
  '24177888001@ndjobi.com',
  '24177888002@ndjobi.com',
  '24177888003@ndjobi.com'
)
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'sous_admin' THEN 3
  END;
```

**Résultat attendu :**

```
email                      | role        | full_name            | fonction
---------------------------+-------------+----------------------+---------------------------
33661002616@ndjobi.com     | super_admin | Super Administrateur | Super Administrateur Système
24177888001@ndjobi.com     | admin       | Président            | Admin - Président
24177888002@ndjobi.com     | sous_admin  | DGSS                 | Sous-Admin DGSS
24177888003@ndjobi.com     | sous_admin  | DGR                  | Sous-Admin DGR
```

---

## 🎯 Dashboards par Rôle

| Rôle | Dashboard | Route |
|------|-----------|-------|
| `super_admin` | Super Admin | `/dashboard/super-admin` |
| `admin` | Admin | `/dashboard/admin` |
| `sous_admin` | Sous-Admin | `/dashboard/sous-admin` |

**OU** si même dashboard pour admin et sous_admin :

| Rôle | Dashboard | Route |
|------|-----------|-------|
| `super_admin` | Super Admin | `/dashboard/super-admin` |
| `admin` | Admin | `/dashboard/admin` |
| `sous_admin` | Admin (vue limitée) | `/dashboard/admin` |

---

## ⚠️ Note Importante

Si le type `sous_admin` n'existe PAS dans votre enum `user_role`, vous avez 2 options :

### Option A : Créer le Type (Recommandé)

```sql
-- Ajouter 'sous_admin' à l'enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sous_admin';
```

### Option B : Utiliser 'admin' pour Tous

Modifier le script pour utiliser `admin` pour les 3 comptes :

```javascript
// 24177888001 → admin
// 24177888002 → admin (avec fonction "Sous-Admin DGSS")
// 24177888003 → admin (avec fonction "Sous-Admin DGR")
```

La différenciation se fera par le champ `fonction`.

---

## 🚀 Import avec Rôles Corrigés

```bash
npm run simulation:import
```

Les rôles seront strictement respectés :
- 1 `super_admin`
- 1 `admin`
- 2 `sous_admin`

---

**✅ RÔLES CORRIGÉS SELON VOS SPÉCIFICATIONS !**

**🇬🇦 Prêt à importer avec la hiérarchie exacte !**
