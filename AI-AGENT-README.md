# 🎭 Agent IA Ndjobi - Guide d'Intégration

## 📋 Vue d'ensemble

L'Agent IA Ndjobi est maintenant intégré dans votre projet. Ce document explique comment l'utiliser et le configurer.

## 📁 Structure des fichiers créés

```
src/
├── components/
│   └── ai-agent/              # À créer avec les composants React
│       ├── NdjobiAIAgent.tsx
│       └── MasqueLogo3D.tsx
├── services/
│   └── ai/
│       └── aiService.ts       # ✅ Créé
├── utils/
│   └── analytics.ts           # ✅ Créé
└── constants/
    └── aiPrompts.ts           # À créer si besoin
```

## 🔧 Configuration requise

### 1. Variables d'environnement

Créez ou mettez à jour votre fichier `.env.local` :

```bash
# API IA (choisir selon votre backend)
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
VITE_API_URL=http://localhost:3000/api

# Analytics (optionnel)
VITE_GA_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_VOICE_INPUT=false
VITE_ENABLE_FILE_UPLOAD=false
VITE_MAX_MESSAGE_LENGTH=500
```

### 2. Backend API requis

Vous devez créer les endpoints suivants dans votre backend :

#### POST `/api/ai/chat`
```json
{
  "message": "string",
  "conversationId": "string (optionnel)",
  "context": "ndjobi_assistant",
  "language": "fr"
}
```

Réponse :
```json
{
  "response": "string",
  "conversationId": "string",
  "metadata": {
    "model": "claude-sonnet-4-5",
    "tokensUsed": 150,
    "responseTime": 1234
  }
}
```

## 🚀 Prochaines étapes

### Étape 1 : Créer le composant NdjobiAIAgent

Copiez le fichier `ndjobi-ai-agent-production.ts` (fourni) dans :
```
src/components/ai-agent/NdjobiAIAgent.tsx
```

### Étape 2 : Créer le logo MasqueLogo3D

Créez un fichier basique ou utilisez une image SVG :
```tsx
// src/components/ai-agent/MasqueLogo3D.tsx
export default function MasqueLogo3D({ size = 64, animate = false }) {
  return (
    <div style={{ width: size, height: size }}>
      {/* Votre logo ici */}
      <span style={{ fontSize: size * 0.6 }}>🎭</span>
    </div>
  );
}
```

### Étape 3 : Intégrer dans votre App

Dans `src/App.tsx` ou votre layout principal :

```tsx
import NdjobiAIAgent from './components/ai-agent/NdjobiAIAgent';

function App() {
  return (
    <div>
      {/* Votre contenu existant */}
      
      {/* Agent IA - toujours visible */}
      <NdjobiAIAgent />
    </div>
  );
}
```

## 📊 Analytics configuré

Le système d'analytics est prêt. Pour l'activer :

```tsx
// Dans src/main.tsx
import { initAnalytics } from './utils/analytics';

initAnalytics();
```

## 🔒 Sécurité

⚠️ **IMPORTANT** : Ne mettez JAMAIS de clés API dans votre code frontend en production !

- Utilisez un backend proxy pour appeler l'API Claude/OpenAI
- Les clés doivent être stockées côté serveur
- Implémentez un rate limiting (20 messages/10min recommandé)

## 🧪 Test rapide

Pour tester sans backend, le service utilise une réponse simulée en fallback.

```bash
# Lancer le projet
bun run dev

# L'agent devrait apparaître en bas à droite
```

## 📚 Documentation complète

Consultez les fichiers fournis :
- `ndjobi-readme.md` - Documentation complète
- `ndjobi-github-deployment.md` - Guide de déploiement
- `ndjobi-ai-agent-production.ts` - Composant complet
- `ndjobi-ai-service.ts` - Service API détaillé

## 🐛 Dépannage

### L'agent ne s'affiche pas
- Vérifiez que Framer Motion est installé : `bun add framer-motion`
- Vérifiez les imports dans votre composant

### Erreur 404 sur /api/ai/chat
- Le backend n'est pas encore configuré
- Utilisez la réponse simulée en attendant

### Problème d'authentification
- Vérifiez que le token Supabase est bien récupéré
- Voir la configuration dans `aiService.ts` ligne 25-32

## 📞 Support

Pour toute question :
- GitHub Issues : https://github.com/okatech-org/ndjobi/issues
- Email : support@ndjobi.ga

---

**Status** : ✅ Services créés | ⏳ Composants React à créer | ⏳ Backend à implémenter

