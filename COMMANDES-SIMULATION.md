# 🛠️ COMMANDES - Simulation NDJOBI

## ⚡ Commandes Essentielles

### Diagnostic et Vérification

```bash
# Diagnostic complet de la configuration
# ✅ Vérifie env, fichiers, connexion, tables, import
npm run simulation:diagnostic
```

```bash
# Vérification après import
# ✅ Vérifie admins, users, signalements, stats, RLS
npm run simulation:verify
```

---

### Import des Données

```bash
# Import complet de la simulation
# ⏱️  Durée: 2-5 minutes
# 📊 Importe: admins, users, signalements, stats
npm run simulation:import
```

**OU (équivalent) :**

```bash
node scripts/import-simulation-data.js
```

---

### Application

```bash
# Lancer en développement
npm run dev

# Ouvrir automatiquement: http://localhost:5173
```

```bash
# Build pour production
npm run build
```

```bash
# Prévisualiser le build
npm run preview
```

---

## 🔧 Commandes de Développement

### Tests

```bash
# Tests unitaires
npm test

# Tests avec interface UI
npm run test:ui

# Tests avec coverage
npm run test:coverage
```

```bash
# Tests end-to-end (E2E)
npm run test:e2e

# E2E avec interface UI
npm run test:e2e:ui

# E2E en mode debug
npm run test:e2e:debug
```

---

### Linting et Formatage

```bash
# Vérifier le code (ESLint)
npm run lint

# Corriger automatiquement
npm run lint:fix

# Vérifier les types TypeScript
npm run type-check
```

---

### Blockchain (Optionnel)

```bash
# Compiler les smart contracts
npm run blockchain:compile

# Déployer sur testnet
npm run blockchain:deploy
```

---

## 🗄️ Commandes SQL Directes (Supabase)

### Vérifications Rapides

```sql
-- Nombre total de signalements (attendu: ~300)
SELECT COUNT(*) FROM signalements;

-- Distribution par urgence
SELECT urgence, COUNT(*) 
FROM signalements 
GROUP BY urgence;

-- Cas Gab Pêche (attendu: ~80)
SELECT COUNT(*) 
FROM signalements 
WHERE categorie = 'malversation_gab_peche';

-- Comptes admin (attendu: 6)
SELECT email, role, full_name 
FROM profiles 
WHERE role IN ('super_admin', 'admin', 'agent');

-- Statistiques nationales
SELECT * FROM dashboard_national;
```

### Requêtes Utiles

```sql
-- Signalements par région
SELECT region, COUNT(*) as cas
FROM signalements
WHERE region IS NOT NULL
GROUP BY region
ORDER BY cas DESC;

-- Top 10 cas par montant
SELECT reference_id, titre, montant_estime, urgence
FROM signalements
WHERE montant_estime IS NOT NULL
ORDER BY montant_estime DESC
LIMIT 10;

-- Cas critiques en attente
SELECT reference_id, titre, ministere_concerne, montant_estime
FROM signalements
WHERE urgence = 'critique' AND statut = 'nouveau'
ORDER BY date_signalement DESC;

-- Performance régionale
SELECT * FROM performance_regionale;
```

---

## 🧹 Commandes de Nettoyage

### Reset Données (⚠️ DANGER)

```sql
-- Supprimer TOUTES les données (Supabase SQL Editor)
-- ⚠️ ATTENTION: Opération irréversible !

TRUNCATE signalements CASCADE;
TRUNCATE profiles CASCADE;
TRUNCATE user_roles CASCADE;
TRUNCATE statistiques_cache CASCADE;

-- Puis réexécuter: npm run simulation:import
```

### Nettoyer Cache Local

```bash
# Nettoyer cache Vite
npm run clean

# Réinstaller et relancer (fresh start)
npm run fresh
```

---

## 📦 Commandes d'Installation

### Première Installation

```bash
# Installer toutes les dépendances
npm install

# OU avec Bun (plus rapide)
bun install
```

### Installer Playwright (E2E tests)

```bash
npm run playwright:install
```

---

## 🔐 Commandes de Sécurité

### Vérifier RLS Policies

```sql
-- Supabase SQL Editor

-- Lister toutes les policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public';

-- Vérifier qu'un agent ne voit que ses cas
-- (Connectez-vous avec agent.mer@ndjobi.ga dans l'app)
-- Puis exécutez:
SELECT COUNT(*) FROM signalements;
-- Résultat attendu: Seulement cas Gab Pêche
```

### Audit Logs

```sql
-- Voir les dernières actions
SELECT * FROM audit_logs
ORDER BY timestamp DESC
LIMIT 20;
```

---

## 🚀 Commandes de Déploiement

### Netlify

```bash
# Installer CLI Netlify
npm install -g netlify-cli

# Login
netlify login

# Déployer
netlify deploy --prod
```

### Vercel

```bash
# Installer CLI Vercel
npm install -g vercel

# Login
vercel login

# Déployer
vercel --prod
```

---

## 🔍 Commandes de Debug

### Mode Debug Vite

```bash
# Lancer avec logs détaillés
npm run dev:debug
```

### Vérifier Build

```bash
# Build en mode développement
npm run build:dev

# Analyser la taille du bundle
npm run build:analyze
```

---

## 📊 Commandes Utilitaires

### Optimisation Images

```bash
npm run images:optimize
```

### Build Optimisé

```bash
npm run build:optimized
```

---

## 🎯 Workflow Typique

### Pour Développement

```bash
1. npm run simulation:diagnostic      # Vérifier config
2. npm run dev                        # Lancer app
3. npm run lint                       # Vérifier code
4. npm test                           # Tester
5. npm run build                      # Build
```

### Pour Import Initial

```bash
1. npm run simulation:diagnostic      # Vérifier avant
2. npm run simulation:import          # Importer
3. npm run simulation:verify          # Vérifier après
4. npm run dev                        # Tester
```

### Pour Debug Import

```bash
1. npm run simulation:diagnostic      # Identifier problème
2. # Corriger selon recommandations
3. npm run simulation:import          # Réessayer
4. npm run simulation:verify          # Vérifier
```

---

## 📋 Résumé des Commandes par Catégorie

### 🎯 Simulation

| Commande | Description | Durée |
|----------|-------------|-------|
| `npm run simulation:diagnostic` | Diagnostic config | 10s |
| `npm run simulation:import` | Import données | 2-5min |
| `npm run simulation:verify` | Vérification | 15s |

### 🚀 Application

| Commande | Description |
|----------|-------------|
| `npm run dev` | Dev mode |
| `npm run build` | Build prod |
| `npm run preview` | Preview build |

### 🧪 Tests

| Commande | Description |
|----------|-------------|
| `npm test` | Tests unitaires |
| `npm run test:e2e` | Tests E2E |
| `npm run test:coverage` | Coverage |

### 🧹 Maintenance

| Commande | Description |
|----------|-------------|
| `npm run clean` | Nettoyer cache |
| `npm run fresh` | Fresh install |
| `npm run lint:fix` | Fix code |

---

## 🆘 Commandes de Dépannage

### Problème : Import échoue

```bash
# 1. Diagnostiquer
npm run simulation:diagnostic

# 2. Vérifier fichiers
ls -lh scripts/data/

# 3. Vérifier connexion Supabase (SQL Editor)
SELECT COUNT(*) FROM profiles;

# 4. Réessayer
npm run simulation:import
```

### Problème : Dashboard vide

```bash
# 1. Vérifier import
npm run simulation:verify

# 2. Vérifier dans Supabase
# Table Editor → signalements

# 3. Si vide, réimporter
npm run simulation:import
```

### Problème : Erreur TypeScript

```bash
# Vérifier types
npm run type-check

# Nettoyer et reconstruire
npm run clean
npm install
npm run dev
```

---

## 📞 Aide

Pour chaque commande, vous pouvez ajouter `--help` (si supporté) ou consulter :

- **Documentation** : `SIMULATION-README.md`
- **Dépannage** : `ETAPES-SUIVANTES.md`
- **Architecture** : `ARCHITECTURE-SIMULATION.md`

---

**🎯 Toutes les commandes pour gérer votre simulation NDJOBI !**
