# 🚀 Instructions pour l'Import des Données de Simulation NDJOBI

## ✅ État Actuel
- ✅ Structure de dossiers créée
- ✅ Fichiers de données copiés dans `scripts/data/`
- ✅ Script d'import créé (`scripts/import-simulation-data.js`)
- ✅ Configuration des variables d'environnement préparée

## 🔧 Configuration Requise

### 1. Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```bash
# NDJOBI - Configuration Supabase
VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k

# ⚠️  IMPORTANT: Récupérez cette clé depuis Supabase Dashboard
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

### 2. Récupérer la Clé de Service Supabase

1. **Allez sur [Supabase Dashboard](https://app.supabase.com)**
2. **Sélectionnez votre projet NDJOBI**
3. **Allez dans Settings → API**
4. **Copiez la `service_role` key** (pas l'anon key)
5. **Remplacez `votre_service_role_key_ici` dans `.env.local`**

### 3. Initialiser la Base de Données

**IMPORTANT**: Avant d'exécuter l'import, vous devez d'abord initialiser la base de données avec le script SQL fourni.

1. **Allez sur [Supabase SQL Editor](https://app.supabase.com/project/_/sql)**
2. **Copiez le contenu du fichier `ndjobi-database-init-sql.sql`**
3. **Exécutez le script SQL** pour créer les tables et la structure

### 4. Exécuter l'Import

Une fois la base de données initialisée et le fichier `.env.local` configuré :

```bash
# Dans le terminal, à la racine du projet
node scripts/import-simulation-data.js
```

## 📊 Ce que l'Import va Créer

- **6 comptes administrateurs** avec différents rôles
- **100+ comptes utilisateurs** (anonymes et identifiés)
- **300+ signalements** avec preuves associées
- **Statistiques initiales** pour les dashboards

## 🔑 Identifiants de Connexion

Après l'import, vous aurez ces comptes de test :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| SUPER_ADMIN | president@ndjobi.ga | Admin2025Secure! |
| ADMIN | admin.dgss@ndjobi.ga | Admin2025Secure! |
| ADMIN | admin.dgr@ndjobi.ga | Admin2025Secure! |
| ADMIN | admin.dglic@ndjobi.ga | Admin2025Secure! |
| AGENT | agent.mer@ndjobi.ga | Admin2025Secure! |
| AGENT | agent.interieur@ndjobi.ga | Admin2025Secure! |

## 🚨 Résolution de Problèmes

### Erreur "Invalid API key"
- Vérifiez que vous avez bien copié la `service_role` key (pas l'anon key)
- Assurez-vous que le fichier `.env.local` est à la racine du projet

### Erreur "Table doesn't exist"
- Vous devez d'abord exécuter le script SQL d'initialisation
- Vérifiez que toutes les tables ont été créées dans Supabase

### Erreur de connexion
- Vérifiez que l'URL Supabase est correcte
- Assurez-vous que votre projet Supabase est actif

## 🎯 Prochaines Étapes

1. **Configurer `.env.local`** avec la clé de service
2. **Initialiser la base de données** avec le script SQL
3. **Exécuter l'import** des données de simulation
4. **Tester les dashboards** avec les données importées
5. **Configurer l'IA et le chatbot** selon le guide

---

**💡 Conseil**: Gardez ce fichier ouvert pendant l'import pour suivre les instructions étape par étape.
