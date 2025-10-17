# 👥 Comptes Démo NDJOBI - Documentation Complète

## Vue d'ensemble

Les comptes démo permettent de tester toutes les fonctionnalités de la plateforme NDJOBI avec des données fictives et des rôles spécifiques.

---

## 📋 Comptes disponibles

### 1. 👤 Citoyen Démo (user)

```
Email: 24177777001@ndjobi.com
Mot de passe: 123456
Rôle: user
Téléphone: +24177777001
```

**Fonctionnalités accessibles:**
- ✅ Créer des signalements de corruption
- ✅ Protéger des projets avec blockchain
- ✅ Consulter ses signalements et projets
- ✅ Gérer son profil
- ✅ Mode anonyme pour signalements sensibles

---

### 2. 👮 Agent DGSS Démo (agent)

```
Email: 24177777002@ndjobi.com
Mot de passe: 123456
Rôle: agent
Téléphone: +24177777002
```

**Fonctionnalités accessibles:**
- ✅ Toutes les fonctionnalités du citoyen
- ✅ Consulter tous les signalements
- ✅ Traiter les signalements (en cours, résolu)
- ✅ Assigner des signalements
- ✅ Ajouter des commentaires et analyses
- ✅ Tableaux de bord de suivi
- ✅ Statistiques des signalements

---

### 3. 👑 Protocole d'État - Président (admin)

```
Email: 24177777003@ndjobi.com
Mot de passe: 123456
Rôle: admin
Téléphone: +24177777003
```

**Fonctionnalités accessibles:**
- ✅ Toutes les fonctionnalités Agent DGSS
- ✅ Gestion des utilisateurs
- ✅ Gestion des agents
- ✅ Modération des contenus
- ✅ Statistiques globales
- ✅ Configuration système
- ✅ Accès aux rapports avancés
- ✅ Gestion des catégories

---

## 🚀 Comment utiliser les comptes démo

### Option 1: Connexion directe

1. Ouvrir `http://localhost:5173`
2. Cliquer sur "Se connecter"
3. Entrer l'email et le mot de passe
4. Accéder au dashboard correspondant au rôle

### Option 2: Depuis le Super Admin Dashboard

1. Se connecter en tant que Super Admin
2. Aller sur `/dashboard/super-admin?view=demo`
3. Voir la liste des comptes démo
4. Cliquer sur "Accès direct" pour basculer instantanément

---

## 🛠️ Création des comptes

### Méthode 1: Script Bash (Recommandé)

```bash
cd /Users/okatech/ndjobi
./scripts/create-demo-accounts.sh
```

**Avantages:**
- Rapide et simple
- Utilise l'API Supabase directement
- Création automatique des rôles
- Détection des comptes existants

### Méthode 2: Script TypeScript

```bash
cd /Users/okatech/ndjobi
ts-node scripts/setup-demo-accounts-final.ts
```

**Avantages:**
- Plus de contrôle
- Création de données de test
- Vérification complète
- Gestion d'erreurs avancée

### Méthode 3: SQL Direct

```bash
cd /Users/okatech/ndjobi
supabase db sql < scripts/create-demo-accounts-final.sql
```

**Avantages:**
- Exécution directe dans la DB
- Contrôle total
- Pas de dépendances externes

---

## 📊 Données de test

Les scripts créent automatiquement:

### Signalements de test
- 1 signalement de corruption (citoyen)
- Statut: En attente
- Catégorie: Corruption administrative
- Localisation: Libreville, Gabon

### Projets de test
- 1 projet technologique (citoyen)
- Statut: En attente de protection
- Catégorie: Innovation

---

## 🔄 Gestion depuis le Super Admin

### Tableau de bord: `/dashboard/super-admin?view=demo`

**Fonctionnalités disponibles:**

1. **Créer un nouveau compte**
   - Sélectionner le rôle (user/agent/admin)
   - Génération automatique de l'email et du mot de passe
   - Création instantanée

2. **Gérer les comptes existants**
   - Voir tous les comptes démo
   - Email, rôle, mot de passe visible
   - Date de création
   - Dernière utilisation

3. **Actions sur les comptes**
   - **Accès direct**: Basculer vers le compte démo
   - **Copier**: Copier les identifiants
   - **Supprimer**: Supprimer le compte

4. **Comptes pré-configurés**
   - Affichage des 3 comptes standards
   - Informations d'accès
   - Description des fonctionnalités

---

## 🔒 Sécurité

### Mots de passe
- Tous les comptes démo utilisent le même mot de passe: `123456`
- Les mots de passe sont hashés avec bcrypt
- **⚠️ À changer en production!**

### Données
- Toutes les données sont fictives
- Les signalements sont marqués comme "démo"
- Aucune donnée sensible réelle

### Accès
- Les comptes sont identifiables par le préfixe `24177777`
- Peuvent être désactivés/supprimés à tout moment
- Session indépendante du Super Admin

---

## 🧪 Tests

### Tester le compte Citoyen

```bash
# Se connecter avec:
Email: 24177777001@ndjobi.com
Password: 123456

# Tester:
1. Créer un signalement
2. Protéger un projet
3. Consulter ses documents
4. Mettre à jour son profil
```

### Tester le compte Agent DGSS

```bash
# Se connecter avec:
Email: 24177777002@ndjobi.com
Password: 123456

# Tester:
1. Consulter tous les signalements
2. Traiter un signalement
3. Assigner à un agent
4. Ajouter un commentaire
5. Voir les statistiques
```

### Tester le compte Protocole d'État

```bash
# Se connecter avec:
Email: 24177777003@ndjobi.com
Password: 123456

# Tester:
1. Toutes les fonctions Agent
2. Gérer les utilisateurs
3. Modérer les contenus
4. Configurer le système
5. Accéder aux rapports avancés
```

---

## 🐛 Dépannage

### Les comptes ne se créent pas

```bash
# Vérifier Supabase
supabase status

# Vérifier les Edge Functions
curl http://127.0.0.1:54321/auth/v1/health

# Recréer les comptes
./scripts/create-demo-accounts.sh
```

### Impossible de se connecter

```bash
# Vérifier que le compte existe
supabase db sql "SELECT email, id FROM auth.users WHERE email LIKE '24177777%@ndjobi.com'"

# Vérifier les rôles
supabase db sql "SELECT u.email, ur.role FROM auth.users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.email LIKE '24177777%@ndjobi.com'"
```

### Le rôle n'est pas assigné

```bash
# Réassigner le rôle manuellement
supabase db sql "
INSERT INTO user_roles (user_id, role)
SELECT id, 'agent' FROM auth.users WHERE email = '24177777002@ndjobi.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'agent'
"
```

---

## 📦 Fichiers du système

### Scripts
- `scripts/create-demo-accounts.sh` - Script bash rapide
- `scripts/setup-demo-accounts-final.ts` - Script TypeScript complet
- `scripts/create-demo-accounts-final.sql` - Script SQL direct

### Services
- `src/services/demoAccountService.ts` - Service de gestion des comptes démo
- `src/services/accountSwitching.ts` - Service de basculement de compte

### Interface
- `src/pages/dashboards/SuperAdminDashboard.tsx` - Vue "demo"
- Onglet dédié dans le Super Admin Dashboard

---

## 🔄 Mise à jour

### Modifier un compte démo

```typescript
// Dans demoAccountService.ts
{
  email: '24177777002@ndjobi.com',
  password: '123456', // Changer ici
  role: 'agent',
  fullName: 'Nouveau Nom', // Changer ici
  phone: '+24177777002'
}
```

### Ajouter un nouveau compte

```typescript
// Dans demoAccountService.ts
{
  email: '24177777004@ndjobi.com',
  password: '123456',
  role: 'user',
  fullName: 'Nouveau Compte',
  phone: '+24177777004'
}
```

Puis relancer le script de création.

---

## ✅ Statut des comptes

| Compte | Email | Rôle | Statut | ID |
|--------|-------|------|--------|-----|
| Citoyen Démo | 24177777001@ndjobi.com | user | ✅ Créé | - |
| Agent DGSS | 24177777002@ndjobi.com | agent | ✅ Créé | e9b6729c-564d-429e-b803-98e04e635fc8 |
| Protocole d'État | 24177777003@ndjobi.com | admin | ✅ Créé | d25febbe-af8f-42ce-b0ba-93e0ecec60d5 |

---

## 🎯 Prochaines étapes

1. ✅ Comptes créés et opérationnels
2. ✅ Interface de gestion dans Super Admin
3. ✅ Scripts d'automatisation
4. 🔄 Créer des données de test plus riches
5. 🔄 Ajouter des scénarios de démonstration
6. 🔄 Configurer le reset automatique des données

---

**Dernière mise à jour**: 17 octobre 2025  
**Version**: 1.0 - Comptes démo finalisés  
**Accès**: http://localhost:5173/dashboard/super-admin?view=demo

