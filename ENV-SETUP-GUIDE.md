# Guide de Configuration Environnementale NDJOBI v2.0

## 🎯 Objectif

Configurer les variables d'environnement pour l'authentification sécurisée et les services externes.

## 📋 Pré-requis

- ✅ Accès au dashboard Supabase
- ✅ Terminal avec `openssl` installé (macOS/Linux par défaut)
- ✅ Droits d'écriture dans le projet

## 🚀 Configuration Rapide

### 1. Générer les Secrets Automatiquement

```bash
# Aller à la racine du projet
cd /Users/okatech/ndjobi

# Exécuter le générateur de secrets
./scripts/generate-env-secrets.sh
```

Le script génère automatiquement :
- ✅ Code Super Admin (6 chiffres)
- ✅ Mot de passe Super Admin (16 caractères)
- ✅ Clé de chiffrement de session (32 caractères)
- ✅ Secret JWT (64 caractères)
- ✅ Clé de sauvegarde (32 caractères)

**Option de sauvegarde sécurisée** : Le script propose de sauvegarder les secrets dans `~/.ndjobi-secrets-[timestamp].txt` avec permissions `600`.

### 2. Copier le Template

```bash
# Copier le template vers .env.local
cp env.template.v2 .env.local
```

### 3. Récupérer les Clés Supabase

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **Settings > API**
4. Copier :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys > anon public** → `VITE_SUPABASE_ANON_KEY`

### 4. Configurer .env.local

Ouvrir `.env.local` et remplacer :

```bash
# === SUPABASE CONFIGURATION ===
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon

# === SUPER ADMIN (coller les valeurs générées) ===
VITE_SUPER_ADMIN_CODE=123456
VITE_SUPER_ADMIN_EMAIL=superadmin@ndjobi.com
VITE_SUPER_ADMIN_PASSWORD=Azerty123!Qwerty

# === SECURITY (coller les valeurs générées) ===
VITE_SESSION_ENCRYPTION_KEY=abc123...
VITE_JWT_SECRET=xyz789...

# === BACKUP (coller les valeurs générées) ===
VITE_BACKUP_ENCRYPTION_KEY=def456...
```

### 5. (Optionnel) Clés API Externes

Si vous utilisez des services IA :

```bash
# OpenAI
VITE_OPENAI_API_KEY=sk-...

# Anthropic Claude
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
VITE_GOOGLE_AI_KEY=AIza...
```

### 6. Vérifier la Configuration

```bash
# Lancer le serveur de développement
bun run dev

# Le serveur devrait démarrer sans erreur
# Vérifier les logs pour confirmer que les variables sont chargées
```

## 🔐 Génération Manuelle des Secrets

Si vous préférez générer les secrets manuellement :

### Code Super Admin (6 chiffres)
```bash
openssl rand -hex 3 | tr -d 'a-f' | head -c 6
```

### Mot de passe sécurisé
```bash
openssl rand -base64 16
```

### Clé de chiffrement (32 caractères)
```bash
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
```

### Secret JWT (64 caractères)
```bash
openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
```

## 📝 Variables Critiques

### Obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL du projet Supabase | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | `eyJhbGc...` |
| `VITE_SUPER_ADMIN_CODE` | Code d'accès Super Admin | `123456` |
| `VITE_SUPER_ADMIN_EMAIL` | Email Super Admin | `superadmin@ndjobi.com` |
| `VITE_SUPER_ADMIN_PASSWORD` | Mot de passe Super Admin | `Azerty123!` |
| `VITE_SESSION_ENCRYPTION_KEY` | Chiffrement session | 32 caractères |

### Optionnelles

| Variable | Description | Par défaut |
|----------|-------------|------------|
| `VITE_DEBUG_MODE` | Mode debug | `false` |
| `VITE_APP_ENV` | Environnement | `development` |
| `VITE_ENABLE_AI_CHAT` | Activer chatbot IA | `true` |
| `VITE_MAX_SIGNALEMENTS_PER_DAY` | Limite signalements | `10` |

## 🚨 Sécurité

### ⚠️ À NE JAMAIS FAIRE

- ❌ Commiter `.env.local` dans Git
- ❌ Partager les secrets par email/chat
- ❌ Utiliser les mêmes secrets en dev et prod
- ❌ Hardcoder les secrets dans le code

### ✅ Bonnes Pratiques

- ✅ `.env.local` est dans `.gitignore`
- ✅ Secrets différents par environnement (dev/staging/prod)
- ✅ Rotation des secrets tous les 3-6 mois
- ✅ Utiliser un gestionnaire de secrets (1Password, Bitwarden, etc.)
- ✅ Backup sécurisé des secrets (chiffré)

## 🔄 Rotation des Secrets

Pour changer les secrets en production :

1. Générer de nouveaux secrets avec le script
2. Mettre à jour `.env.local` en production
3. Redéployer l'application
4. Mettre à jour le compte Super Admin dans Supabase
5. Invalider les anciennes sessions

## 🐛 Dépannage

### Erreur : "Code Super Admin non configuré"

**Cause** : Variable `VITE_SUPER_ADMIN_CODE` manquante ou vide

**Solution** :
```bash
# Vérifier que la variable est définie
echo $VITE_SUPER_ADMIN_CODE

# Si vide, regénérer avec le script
./scripts/generate-env-secrets.sh
```

### Erreur : "Invalid login credentials"

**Cause** : Mot de passe Super Admin ne correspond pas à celui dans Supabase

**Solution** :
1. Aller dans Supabase Dashboard > Authentication > Users
2. Chercher `superadmin@ndjobi.com`
3. Réinitialiser le mot de passe
4. Mettre à jour `VITE_SUPER_ADMIN_PASSWORD` dans `.env.local`

### Erreur : "Configuration manquante"

**Cause** : Variables d'environnement non chargées

**Solution** :
```bash
# Vérifier que .env.local existe
ls -la .env.local

# Redémarrer le serveur de dev
bun run dev
```

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OpenSSL Documentation](https://www.openssl.org/docs/)

## ✅ Checklist

- [ ] Script de génération exécuté
- [ ] Secrets générés et sauvegardés
- [ ] `.env.local` créé depuis template
- [ ] Clés Supabase récupérées et configurées
- [ ] Secrets collés dans `.env.local`
- [ ] Serveur de dev démarre sans erreur
- [ ] Connexion Super Admin testée
- [ ] Backup des secrets effectué (fichier chiffré)

---

**Version** : 2.0.0  
**Date** : 17/01/2025  
**Auteur** : NDJOBI Platform

