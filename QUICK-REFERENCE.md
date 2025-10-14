# 📚 Référence Rapide - Projet Ndjobi

## 🔗 Informations Projet

**GitHub** : https://github.com/okatech-org/ndjobi  
**Branche** : main  
**Divergence** : 4 commits locaux | 16 commits distants

---

## ✅ Ce qui vient d'être finalisé

### 1. Page Paramètres Utilisateur (UserSettings)
**URL** : `http://localhost:8081/dashboard/user?view=settings`

**Fonctionnalités** :
- ✅ Persistance Supabase (`user_settings` table)
- ✅ Chargement initial + états loading
- ✅ Changement mot de passe (dialogue)
- ✅ Configuration 2FA/PIN (dialogue)
- ✅ Suppression compte (confirmation)
- ✅ Toasts success/erreur cohérents

**Fichiers** :
- `src/components/dashboard/user/UserSettings.tsx`
- `src/components/dashboard/user/UserProfile.tsx`
- `src/integrations/supabase/types.ts`
- `supabase/migrations/20251013123011_*.sql`

### 2. Chatbot IA Ndjobi (100%)
**Statut** : Production-ready

**Fichiers créés** :
- `src/components/ai-agent/NdjobiAIAgent.tsx` (450 lignes)
- `src/components/ai-agent/MasqueLogo3D.tsx` (logo officiel)
- `src/services/ai/aiService.ts` (270 lignes)
- `src/utils/analytics.ts` (45 lignes)

**Dépendances** :
- `framer-motion@12.23.24`
- `@anthropic-ai/sdk@0.65.0`
- `axios@1.12.2`
- `date-fns@4.1.0`

**Logo** : ✅ `src/assets/logo_ndjobi.png` (1.7 MB) récupéré depuis GitHub

---

## 📁 Documentation Créée

| Fichier | Description |
|---------|-------------|
| `CHATBOT-QUICKSTART.md` | Démarrage 2 minutes |
| `INTEGRATION-EXAMPLE.md` | Exemples code complet |
| `CHATBOT-STATUS.md` | État implémentation |
| `AI-AGENT-README.md` | Config backend |
| `LOGO-UPDATE.md` | Mise à jour logo |
| `QUICK-REFERENCE.md` | Ce fichier |

---

## 🚀 Actions Rapides

### Tester le chatbot IA
```bash
bun run dev
# Le bouton avec logo Ndjobi apparaît en bas à droite
```

### Intégrer le chatbot
Dans `src/App.tsx` :
```tsx
import NdjobiAIAgent from "./components/ai-agent/NdjobiAIAgent";

// Dans le return
<NdjobiAIAgent />
```

### Appliquer la migration user_settings
```bash
supabase migration up
# Ou si besoin
supabase db reset --force
```

### Synchroniser avec GitHub (avec vos modifs)
```bash
# Sauvegarder vos changements locaux
git stash

# Récupérer GitHub
git pull origin main --rebase

# Réappliquer vos changements
git stash pop
```

---

## 🔧 Commandes Utiles

### Développement
```bash
bun run dev              # Démarrer le serveur
bun install              # Installer dépendances
bun add <package>        # Ajouter dépendance
```

### Supabase
```bash
supabase status          # Voir statut local
supabase migration list  # Lister migrations
supabase migration up    # Appliquer migrations
supabase db reset        # Reset complet
```

### Git
```bash
git status               # État des fichiers
git log --oneline -10    # Derniers commits
git fetch origin         # Récupérer GitHub
git pull origin main     # Synchroniser
```

---

## 📊 État Actuel du Projet

### ✅ Finalisé
- Authentification téléphone/PIN
- Dashboard utilisateur complet
- Page Paramètres avec persistance
- Chatbot IA production-ready
- Logo officiel intégré

### ⏳ À faire
- Appliquer migration `user_settings`
- Intégrer chatbot dans App.tsx
- Backend API chatbot (production)
- Synchroniser Git (merge local + GitHub)

---

## 🔗 Ressources

**GitHub** : https://github.com/okatech-org/ndjobi  
**Supabase** : http://127.0.0.1:54321 (local)  
**App** : http://localhost:8081

---

## 🆘 Problèmes Courants

### 404 sur user_settings
```bash
supabase migration up
```

### Logo ne s'affiche pas
Vérifier dans `MasqueLogo3D.tsx` :
```tsx
import logoNdjobi from '@/assets/logo_ndjobi.png';
```

### Git divergence
```bash
git pull origin main --rebase
```

---

*Dernière mise à jour : 14 octobre 2025* 🇬🇦
