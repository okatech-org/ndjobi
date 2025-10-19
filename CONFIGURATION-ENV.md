# Configuration des Variables d'Environnement

## Étape 1: Créer le fichier .env.local

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```bash
# NDJOBI - Configuration Supabase
# Variables d'environnement pour l'application et les scripts

# URL du projet Supabase
VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co

# Clé publique/anonyme Supabase
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k

# Clé publique (alias pour compatibilité)
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k

# Clé de service (nécessaire pour les scripts d'import et administration)
# ⚠️  IMPORTANT: Cette clé ne doit JAMAIS être exposée côté client
# Elle est utilisée uniquement pour les scripts serveur et l'import de données
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Configuration de l'environnement
NODE_ENV=development
```

## Étape 2: Récupérer la clé de service Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet NDJOBI
3. Allez dans **Settings** → **API**
4. Copiez la **service_role key** (pas l'anon key)
5. Remplacez `YOUR_SERVICE_ROLE_KEY_HERE` dans le fichier `.env.local`

## Étape 3: Vérifier la configuration

Une fois le fichier `.env.local` créé avec la bonne clé de service, vous pouvez exécuter le script d'import :

```bash
# Installer les dépendances si nécessaire
npm install

# Exécuter le script d'import
npx ts-node scripts/import-simulation-data.ts
```

## Sécurité

- ⚠️  **JAMAIS** commiter le fichier `.env.local` dans Git
- ⚠️  La clé de service a des privilèges administrateur complets
- ⚠️  Ne l'exposez jamais côté client ou dans des logs publics
