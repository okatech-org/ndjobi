# 🚀 Guide de Déploiement - Ndjobi

## 📋 Prérequis

- Node.js 18+ ou Bun 1.0+
- Compte Supabase (gratuit)
- Compte OpenAI (optionnel, pour IA)
- Compte Vercel/Netlify/autre hébergeur (pour production)

---

## ⚙️ Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase (REQUIS)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-cle-anon

# OpenAI (OPTIONNEL - pour fonctionnalités IA)
VITE_OPENAI_API_KEY=sk-votre-cle-openai

# Application
VITE_APP_NAME=Ndjobi
VITE_APP_URL=https://ndjobi.com
VITE_APP_ENV=production

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_OFFLINE_MODE=true
```

### 2. Base de données Supabase

Exécutez les migrations dans l'ordre :

```bash
# Dans le dashboard Supabase > SQL Editor
# Exécutez les fichiers dans supabase/migrations/ dans l'ordre chronologique
```

### 3. Storage Buckets Supabase

Créez deux buckets publics :
- `report-evidence` (pour les preuves de signalements)
- `project-documents` (pour les documents de projets)

Politique d'accès :
```sql
-- Bucket report-evidence
CREATE POLICY "Utilisateurs peuvent uploader leurs preuves"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-evidence' AND auth.uid() = owner);

CREATE POLICY "Utilisateurs peuvent voir leurs preuves"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-evidence' AND auth.uid() = owner);

-- Bucket project-documents
CREATE POLICY "Utilisateurs peuvent uploader leurs documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-documents' AND auth.uid() = owner);

CREATE POLICY "Utilisateurs peuvent voir leurs documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-documents' AND auth.uid() = owner);
```

---

## 🏗️ Build de Production

### Option 1 : Build local

```bash
# Installation des dépendances
bun install

# Vérification TypeScript
bun run type-check

# Tests
bun run test

# Build optimisé
bun run build

# Preview du build
bun run preview
```

### Option 2 : Build optimisé avec script

```bash
chmod +x scripts/build-optimized.sh
./scripts/build-optimized.sh
```

---

## 🌐 Déploiement

### Option 1 : Vercel (Recommandé)

```bash
# Installation Vercel CLI
bun add -g vercel

# Déploiement
vercel

# Production
vercel --prod
```

Configuration `vercel.json` :
```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_PUBLISHABLE_KEY": "@supabase_key"
  }
}
```

### Option 2 : Netlify

```bash
# Installation Netlify CLI
bun add -g netlify-cli

# Déploiement
netlify deploy

# Production
netlify deploy --prod
```

Configuration `netlify.toml` :
```toml
[build]
  command = "bun run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3 : Serveur Linux (VPS)

```bash
# Sur le serveur
git clone https://github.com/votre-repo/ndjobi.git
cd ndjobi

# Installation
bun install

# Build
bun run build

# Servir avec nginx
sudo cp -r dist/* /var/www/ndjobi/
sudo systemctl restart nginx
```

Configuration Nginx :
```nginx
server {
    listen 80;
    server_name ndjobi.com www.ndjobi.com;
    root /var/www/ndjobi;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;
}
```

---

## 🔒 Sécurité

### Headers de sécurité

Ajoutez ces headers dans votre configuration :

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), microphone=(self)
```

### SSL/TLS

**Obligatoire** pour la production. Utilisez :
- Let's Encrypt (gratuit)
- Cloudflare (gratuit avec proxy)
- Certificat fourni par l'hébergeur

---

## 📊 Performance

### Optimisations appliquées

- ✅ Code splitting automatique
- ✅ Lazy loading des routes
- ✅ PWA avec Service Worker
- ✅ Cache Supabase API
- ✅ Compression gzip
- ✅ Images optimisées (WebP)

### Vérification

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage

# Bundle analyzer
bun run build:analyze
```

---

## 🔧 Maintenance

### Mise à jour des dépendances

```bash
# Vérifier les packages obsolètes
bun outdated

# Mettre à jour
bun update
```

### Monitoring

Activez Sentry pour le monitoring des erreurs :

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 0.1,
});
```

### Backup Base de Données

```bash
# Via Supabase CLI
supabase db dump -f backup.sql

# Restauration
supabase db reset
psql -f backup.sql
```

---

## 🧪 Tests en Production

### Checklist avant déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Storage buckets créés et sécurisés
- [ ] Tests E2E passent
- [ ] Performance > 90 (Lighthouse)
- [ ] HTTPS activé
- [ ] Monitoring activé
- [ ] Backup configuré

### Tests post-déploiement

1. Créer un compte utilisateur
2. Taper un Ndjobi (signalement)
3. Protéger un projet
4. Vérifier upload de fichiers
5. Tester mode hors ligne
6. Vérifier mode anonyme
7. Tester géolocalisation
8. Enregistrer un audio

---

## 🆘 Troubleshooting

### Build échoue

```bash
# Nettoyer et rebuild
rm -rf node_modules dist .vite
bun install
bun run build
```

### Erreurs Supabase

- Vérifier les credentials dans .env.local
- Vérifier les RLS policies
- Vérifier les migrations appliquées

### Service Worker ne s'active pas

- Vérifier HTTPS en production
- Vider le cache navigateur
- Désinscrire l'ancien SW : `navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))`

---

## 📞 Support

- Documentation : https://docs.ndjobi.com
- Issues : https://github.com/votre-repo/ndjobi/issues
- Email : support@ndjobi.com

---

**Dernière mise à jour :** Octobre 2025

