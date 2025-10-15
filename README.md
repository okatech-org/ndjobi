# 🚨 NDJOBI - Plateforme Anti-Corruption du Gabon

## 📋 **Vue d'ensemble**

**NDJOBI** est une plateforme web sécurisée permettant aux citoyens gabonais de dénoncer anonymement la corruption et de protéger leurs innovations avec un horodatage blockchain infalsifiable.

### 🎯 **Fonctionnalités principales**
- 🚨 **Signalements anonymes** de corruption via chatbot IA
- 🛡️ **Protection de projets** avec certificats blockchain
- 👥 **Système de rôles** (Citoyen, Agent DGSS, Admin, Super Admin)
- 🗺️ **Géolocalisation** et visualisation des cas
- 🔐 **Sécurité maximale** avec chiffrement et anonymat garanti

### 🏗️ **Architecture technique**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Déploiement**: Netlify + Supabase Cloud
- **Sécurité**: RLS + JWT + Chiffrement AES-256

## 📚 **Documentation complète**

### **Architecture et Plan**
- **[PLAN-DETAILLE-NDJOBI.md](./PLAN-DETAILLE-NDJOBI.md)** - Plan détaillé complet de l'application
- **[ARCHITECTURE-DIAGRAM.md](./ARCHITECTURE-DIAGRAM.md)** - Diagrammes d'architecture du système
- **[DOCUMENTATION-COMPLETE.md](./DOCUMENTATION-COMPLETE.md)** - Index de toute la documentation

### **Modules fonctionnels**
- **[VOLET-SIGNALEMENTS-DETAILLE.md](./VOLET-SIGNALEMENTS-DETAILLE.md)** - Système de signalements de corruption
- **[VOLET-PROJET-DETAILLE.md](./VOLET-PROJET-DETAILLE.md)** - Protection de projets et créations
- **[MODULE-XR7-DETAILLE.md](./MODULE-XR7-DETAILLE.md)** - Système d'urgence et protocoles spéciaux

### **Guides techniques**
- **[CORRECTIONS-SIGNALEMENTS.md](./CORRECTIONS-SIGNALEMENTS.md)** - Corrections apportées au système
- **[TEST-SIGNALEMENTS.md](./TEST-SIGNALEMENTS.md)** - Guide de test des fonctionnalités

## 🚀 **Installation et Développement**

### **Prérequis**
- **Node.js** 18+ et **npm** ou **bun**
- **Git** pour le contrôle de version
- **Supabase CLI** pour la base de données locale

### **Installation**
```bash
# 1. Cloner le repository
git clone https://github.com/okatech-org/ndjobi.git
cd ndjobi

# 2. Installer les dépendances
bun install
# ou
npm install

# 3. Configurer l'environnement
cp env.template .env.local
# Éditer .env.local avec vos clés Supabase

# 4. Démarrer Supabase local
supabase start

# 5. Appliquer les migrations
supabase db reset

# 6. Générer les types TypeScript
supabase gen types typescript --local > src/integrations/supabase/types.ts

# 7. Démarrer le serveur de développement
bun run dev
# ou
npm run dev
```

### **Scripts disponibles**
```bash
# Développement
bun run dev          # Serveur de développement
bun run build        # Build de production
bun run preview      # Preview du build

# Base de données
supabase start       # Démarrer Supabase local
supabase db reset    # Reset de la base
supabase gen types   # Générer les types TypeScript

# Tests et qualité
bun run test         # Tests unitaires
bun run lint         # Linting
bun run type-check   # Vérification TypeScript
```

### **Structure du projet**
```
src/
├── components/          # Composants réutilisables
│   ├── ai-agent/       # Chatbot IA pour signalements
│   ├── dashboard/      # Composants spécifiques aux dashboards
│   └── ui/             # Composants UI de base (shadcn/ui)
├── pages/              # Pages de l'application
│   └── dashboards/     # Dashboards par rôle
├── hooks/              # Hooks personnalisés React
├── services/           # Services métier
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## 🌐 **Déploiement**

### **Production**
- **Frontend** : Déployé automatiquement sur Netlify
- **Backend** : Supabase Cloud
- **Domaine** : Configuré via Netlify

### **Staging**
- **Frontend** : Netlify Preview pour les PR
- **Backend** : Supabase Cloud (environnement de test)

## 📞 **Support**

- **Issues** : [GitHub Issues](https://github.com/okatech-org/ndjobi/issues)
- **Documentation** : Voir les fichiers .md dans le repository
- **Contact** : Via les issues GitHub

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b4ae50a0-839f-4357-b969-63ae618cd959) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b4ae50a0-839f-4357-b969-63ae618cd959) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
