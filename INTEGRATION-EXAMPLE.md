# 🔌 Exemple d'Intégration - Agent IA Ndjobi

## Option 1 : Intégration Globale (Recommandée)

Ajouter l'agent IA sur **toutes les pages** de votre application.

### Dans `src/App.tsx` :

```tsx
import { Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getDashboardUrl } from "@/lib/roleUtils";

// ⭐ AJOUT : Importer l'Agent IA
import NdjobiAIAgent from "./components/ai-agent/NdjobiAIAgent";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/dashboards/UserDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";

const queryClient = new QueryClient();

// ... vos composants ProtectedRoute et PublicRoute ...

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/user" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/agent" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/super-admin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* ⭐ AJOUT : Agent IA visible partout */}
          <NdjobiAIAgent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
```

---

## Option 2 : Intégration Conditionnelle

Afficher l'agent IA uniquement sur certaines pages.

### Exemple : Uniquement sur les dashboards

```tsx
import { useLocation } from "react-router-dom";
import NdjobiAIAgent from "./components/ai-agent/NdjobiAIAgent";

const App = () => {
  const location = useLocation();
  const showAIAgent = location.pathname.startsWith('/dashboard');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ... vos routes ... */}
          </Routes>

          {/* Agent IA conditionnel */}
          {showAIAgent && <NdjobiAIAgent />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
```

---

## Option 3 : Intégration par Page

Ajouter l'agent IA directement dans une page spécifique.

### Dans `src/pages/dashboards/UserDashboard.tsx` :

```tsx
import NdjobiAIAgent from '@/components/ai-agent/NdjobiAIAgent';

const UserDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Votre contenu */}
      </main>
      <Footer />

      {/* Agent IA uniquement sur cette page */}
      <NdjobiAIAgent />
    </div>
  );
};
```

---

## 🎨 Exemples de Personnalisation

### Thème sombre

```tsx
<NdjobiAIAgent theme="darkMode" />
```

### Position à gauche

```tsx
<NdjobiAIAgent position="bottom-left" />
```

### Ouvert par défaut

```tsx
<NdjobiAIAgent initialOpen={true} />
```

### Configuration complète

```tsx
<NdjobiAIAgent
  theme="default"
  position="bottom-right"
  initialOpen={false}
  enableVoice={false}
  enableFileUpload={false}
  maxMessageLength={500}
/>
```

---

## 🧪 Test après intégration

1. **Lancer le projet**
   ```bash
   bun run dev
   ```

2. **Ouvrir le navigateur**
   ```
   http://localhost:8081
   ```

3. **Vérifier l'affichage**
   - ✅ Bouton 🎭 en bas à droite
   - ✅ Animation de pulsation
   - ✅ Badge "!" visible

4. **Tester l'interaction**
   - Cliquer sur le bouton
   - Voir le message de bienvenue
   - Cliquer sur une question suggérée
   - Recevoir une réponse

---

## 📱 Responsive Mobile

L'agent est automatiquement responsive :

- **Desktop** : Chat 384px (w-96)
- **Tablet** : Chat 384px
- **Mobile** : Chat plein écran (à implémenter si besoin)

Pour forcer plein écran sur mobile, ajoutez dans `NdjobiAIAgent.tsx` :

```tsx
className={`fixed ${positionClasses[position]} 
  w-96 max-sm:w-full max-sm:h-full max-sm:bottom-0 max-sm:right-0 
  bg-white rounded-2xl max-sm:rounded-none shadow-2xl z-50 flex flex-col overflow-hidden`}
```

---

## ⚡ Performance

### Code Splitting (optionnel)

Pour charger l'agent IA uniquement quand nécessaire :

```tsx
import { lazy, Suspense } from 'react';

const NdjobiAIAgent = lazy(() => import('./components/ai-agent/NdjobiAIAgent'));

// Dans le render
<Suspense fallback={null}>
  <NdjobiAIAgent />
</Suspense>
```

---

## 🔍 Débogage

### Voir les événements analytics

Ouvrez la console (F12) et vérifiez :

```
[Analytics] chat_opened
[Analytics] message_sent { message_length: 25, conversation_id: null }
[Analytics] message_received { conversation_id: "conv-123" }
```

### Vérifier le localStorage

```javascript
// Dans la console
localStorage.getItem('ndjobi_chat_history')
```

---

## 📋 Checklist d'intégration

- [ ] Importer `NdjobiAIAgent` dans App.tsx
- [ ] Ajouter `<NdjobiAIAgent />` dans le render
- [ ] Lancer `bun run dev`
- [ ] Vérifier que le bouton s'affiche
- [ ] Tester l'ouverture du chat
- [ ] Envoyer un message test
- [ ] Vérifier l'historique (fermer/rouvrir)
- [ ] Tester sur mobile (responsive)

---

## 🎉 Terminé !

Votre Agent IA Ndjobi est maintenant intégré et fonctionnel ! 🚀

Pour aller plus loin :
- Consultez `CHATBOT-STATUS.md` pour l'état complet
- Voir `AI-AGENT-README.md` pour la configuration backend
- Personnalisez le logo dans `MasqueLogo3D.tsx`

