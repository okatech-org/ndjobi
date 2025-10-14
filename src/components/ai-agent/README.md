# 🎭 Agent IA Ndjobi - Composant React

## ✅ Installation Complète

Le composant Agent IA Ndjobi est maintenant **100% fonctionnel** dans votre projet !

## 📁 Fichiers créés

```
src/
├── components/ai-agent/
│   ├── NdjobiAIAgent.tsx      ✅ Créé (composant principal)
│   └── MasqueLogo3D.tsx        ✅ Créé (logo placeholder)
├── services/ai/
│   └── aiService.ts            ✅ Créé (service API)
└── utils/
    └── analytics.ts            ✅ Créé (tracking)
```

## 🚀 Utilisation

### 1. Intégrer dans votre App

Ajoutez le composant dans votre `src/App.tsx` ou votre layout principal :

```tsx
import NdjobiAIAgent from './components/ai-agent/NdjobiAIAgent';

function App() {
  return (
    <div>
      {/* Votre contenu existant */}
      <YourRoutes />
      
      {/* Agent IA - toujours visible */}
      <NdjobiAIAgent />
    </div>
  );
}
```

### 2. Options de personnalisation

```tsx
<NdjobiAIAgent
  initialOpen={false}              // Ouvrir au chargement
  theme="default"                  // "default" | "darkMode"
  position="bottom-right"          // "bottom-right" | "bottom-left"
  enableVoice={false}              // Activer micro (futur)
  enableFileUpload={false}         // Activer upload (futur)
  maxMessageLength={500}           // Longueur max des messages
/>
```

## 🎨 Logo Ndjobi

Le logo officiel Ndjobi est maintenant intégré ! 

**Fichier** : `src/assets/logo_ndjobi.png` (1.7 MB)  
**Composant** : `MasqueLogo3D.tsx` utilise automatiquement ce logo

Si vous souhaitez le remplacer, modifiez `src/components/ai-agent/MasqueLogo3D.tsx` :

```tsx
export default function MasqueLogo3D({ size = 64, animate = false }) {
  return (
    <img 
      src="/src/assets/votre-logo.png" 
      alt="Votre Logo"
      width={size}
      height={size}
      className="object-contain"
    />
  );
}
```

## 🔧 Configuration Backend (Requis pour production)

### Option A : Réponses simulées (Dev/Test)

Le service utilise déjà des réponses simulées en fallback. Ça marche immédiatement !

### Option B : Backend réel (Production)

Créez l'endpoint `/api/ai/chat` dans votre backend :

```typescript
// POST /api/ai/chat
{
  "message": "Comment signaler un cas ?",
  "conversationId": "optional-id"
}

// Réponse attendue
{
  "response": "Pour signaler...",
  "conversationId": "conv-123"
}
```

Voir le fichier `AI-AGENT-README.md` à la racine pour l'implémentation backend complète.

## 🧪 Test rapide

```bash
# Lancer le projet
bun run dev

# Ouvrir http://localhost:8081
# L'agent devrait apparaître en bas à droite 🎭
```

## ⚡ Fonctionnalités incluses

- ✅ Bouton flottant animé
- ✅ Interface chat complète
- ✅ Historique persistant (localStorage)
- ✅ Questions suggérées
- ✅ Indicateur de frappe
- ✅ Mode minimisé
- ✅ Retry automatique (3 tentatives)
- ✅ Gestion d'erreurs
- ✅ Analytics intégrée
- ✅ Responsive mobile

## 📊 Analytics

Les événements suivants sont automatiquement trackés :

- `chat_opened` - Ouverture du chat
- `chat_closed` - Fermeture du chat
- `message_sent` - Envoi d'un message
- `message_received` - Réception d'une réponse
- `message_error` - Erreur survenue
- `history_cleared` - Historique effacé

Pour activer Google Analytics, ajoutez dans `.env.local` :

```env
VITE_GA_ID=G-XXXXXXXXXX
```

Puis dans `src/main.tsx` :

```tsx
import { initAnalytics } from './utils/analytics';
initAnalytics();
```

## 🔒 Sécurité

⚠️ **Important** : En production, n'appelez JAMAIS l'API Claude/OpenAI directement depuis le frontend !

- Utilisez un backend proxy (voir documentation complète)
- Implémentez un rate limiting
- Validez tous les inputs côté serveur

## 🐛 Dépannage

### L'agent ne s'affiche pas
- Vérifiez que Framer Motion est installé : `bun list framer-motion`
- Vérifiez les imports dans votre App.tsx

### Erreur "Cannot find module"
```bash
bun add framer-motion @anthropic-ai/sdk axios date-fns
```

### Le chat ne répond pas
- Normal ! Le backend n'est pas encore configuré
- Les réponses simulées devraient fonctionner en attendant
- Vérifiez la console pour les erreurs

## 📚 Documentation complète

- `AI-AGENT-README.md` - Guide d'intégration complet (racine du projet)
- `ndjobi-readme.md` - Documentation détaillée (Downloads)
- `ndjobi-github-deployment.md` - Guide backend (Downloads)

## 🎉 C'est prêt !

Votre Agent IA Ndjobi est maintenant **100% fonctionnel** en mode développement.

Pour le passer en production, consultez `AI-AGENT-README.md` pour configurer le backend.

