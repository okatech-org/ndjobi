# 🎨 Guide d'Intégration Frontend React pour iAsted

Ce guide explique comment intégrer les composants iAsted dans l'interface React Ndjobi existante.

---

## 📦 Fichiers Créés

### Services (`/src/services/iasted/`)
- ✅ **`iastedApiClient.ts`** - Client HTTP pour API REST
- ✅ **`iastedWebSocket.ts`** - Client WebSocket pour vocal temps réel

### Hooks (`/src/hooks/iasted/`)
- ✅ **`useIAstedVoice.ts`** - Hook pour gestion conversations vocales

### Composants (`/src/components/iasted/`)
- ✅ **`IAstedVoiceButton.tsx`** - Bouton micro pour activer l'assistant
- ✅ **`IAstedConversationHistory.tsx`** - Affichage historique conversations
- ✅ **`index.ts`** - Export centralisé

---

## 🚀 Installation

### 1. Variables d'Environnement

Ajouter dans `/Users/okatech/ndjobi/.env` :

```bash
# iAsted Backend API
VITE_IASTED_API_URL=http://localhost:8000/api/v1
VITE_IASTED_WS_URL=ws://localhost:8000/api/v1
```

### 2. Vérifier les Dépendances

Les dépendances suivantes doivent être présentes dans `package.json` :

```json
{
  "dependencies": {
    "axios": "^1.12.2",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.462.0"
  }
}
```

✅ **Déjà installées dans le projet Ndjobi !**

---

## 💡 Utilisation des Composants

### Exemple 1 : Bouton Micro Simple

Ajouter dans n'importe quelle page (Dashboard, Rapports, etc.) :

```tsx
import { IAstedVoiceButton } from '@/components/iasted';

function MaPage() {
  return (
    <div className="p-4">
      <h1>Ma Page</h1>
      
      {/* Bouton micro flottant en bas à droite */}
      <div className="fixed bottom-6 right-6 z-50">
        <IAstedVoiceButton size="lg" />
      </div>
    </div>
  );
}
```

### Exemple 2 : Assistant avec Historique

Créer une page dédiée `/src/pages/IAstedAssistant.tsx` :

```tsx
import { useState } from 'react';
import { IAstedVoiceButton, IAstedConversationHistory } from '@/components/iasted';
import { useIAstedVoice } from '@/hooks/iasted/useIAstedVoice';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function IAstedAssistant() {
  const { session } = useAuth();
  const token = session?.access_token || '';

  const {
    isConnected,
    isRecording,
    conversationHistory,
    startSession,
    stopSession,
    toggleRecording,
  } = useIAstedVoice(token, {
    onError: (error) => console.error('Erreur iAsted:', error),
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span>🎤</span>
            Assistant Vocal iAsted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Zone contrôle */}
          <div className="flex justify-center">
            <IAstedVoiceButton size="lg" showLabel />
          </div>

          {/* Statut */}
          <div className="text-center">
            {isConnected ? (
              <p className="text-green-600 font-medium">✅ Connecté</p>
            ) : (
              <p className="text-gray-500">⚪ Déconnecté</p>
            )}
          </div>

          {/* Historique */}
          <IAstedConversationHistory 
            history={conversationHistory} 
            maxHeight="600px"
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Exemple 3 : Intégration dans le Dashboard Agent

Modifier `/src/pages/dashboards/AgentDashboard.tsx` :

```tsx
import { IAstedVoiceButton } from '@/components/iasted';

export default function AgentDashboard() {
  return (
    <div className="p-6">
      {/* Contenu existant du dashboard */}
      <h1>Dashboard Agent</h1>
      
      {/* ... autres composants ... */}

      {/* Bouton iAsted flottant */}
      <div className="fixed bottom-8 right-8 z-50">
        <IAstedVoiceButton 
          size="lg" 
          showLabel
          variant="default"
        />
      </div>
    </div>
  );
}
```

### Exemple 4 : Utiliser directement le Hook

Pour un contrôle total :

```tsx
import { useIAstedVoice } from '@/hooks/iasted/useIAstedVoice';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

function MonComposant() {
  const { session } = useAuth();
  const token = session?.access_token || '';

  const {
    isConnected,
    isRecording,
    currentTranscript,
    conversationHistory,
    startSession,
    stopSession,
    toggleRecording,
  } = useIAstedVoice(token);

  const handleStart = async () => {
    await startSession();
  };

  return (
    <div>
      <Button onClick={handleStart} disabled={isConnected}>
        Démarrer iAsted
      </Button>

      {isConnected && (
        <>
          <Button onClick={toggleRecording}>
            {isRecording ? 'Arrêter' : 'Parler'}
          </Button>

          {currentTranscript && (
            <p className="text-sm text-muted-foreground">
              Transcription : {currentTranscript}
            </p>
          )}

          <div className="mt-4">
            <h3>Historique ({conversationHistory.length})</h3>
            {conversationHistory.map((turn) => (
              <div key={turn.id}>
                <p><strong>Vous :</strong> {turn.userTranscript}</p>
                <p><strong>iAsted :</strong> {turn.assistantResponse}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 🎨 Personnalisation

### Changer la Taille du Bouton

```tsx
<IAstedVoiceButton size="sm" />   {/* Petit */}
<IAstedVoiceButton size="md" />   {/* Moyen (défaut) */}
<IAstedVoiceButton size="lg" />   {/* Grand */}
```

### Changer le Variant

```tsx
<IAstedVoiceButton variant="default" />  {/* Bouton coloré */}
<IAstedVoiceButton variant="outline" />  {/* Bordure seule */}
<IAstedVoiceButton variant="ghost" />    {/* Transparent */}
```

### Afficher/Masquer le Label

```tsx
<IAstedVoiceButton showLabel={true} />   {/* Avec label */}
<IAstedVoiceButton showLabel={false} />  {/* Sans label */}
```

### Personnaliser l'Historique

```tsx
<IAstedConversationHistory 
  history={conversationHistory}
  maxHeight="400px"  // Hauteur max avant scroll
/>
```

---

## 🔗 Ajouter une Route Dédiée

Dans `/src/App.tsx`, ajouter la route iAsted :

```tsx
import IAstedAssistant from './pages/IAstedAssistant';

// Dans <Routes>
<Route
  path="/iasted"
  element={
    <ProtectedRoute>
      <IAstedAssistant />
    </ProtectedRoute>
  }
/>
```

Puis dans la navigation, ajouter un lien :

```tsx
import { Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

<Link to="/iasted" className="nav-link">
  <Mic className="mr-2" />
  Assistant Vocal
</Link>
```

---

## 🔒 Gestion des Permissions RBAC

iAsted respecte automatiquement les permissions Ndjobi via le token JWT.

### Activer selon le Rôle

```tsx
import { useAuth } from '@/hooks/useAuth';

function MaPage() {
  const { role } = useAuth();

  // Activer uniquement pour agents et admins
  const canUseIAsted = ['agent', 'admin', 'super_admin'].includes(role || '');

  return (
    <div>
      {canUseIAsted && (
        <IAstedVoiceButton size="lg" />
      )}
    </div>
  );
}
```

---

## 🧪 Tester l'Intégration

### 1. Démarrer le Backend

```bash
cd /Users/okatech/ndjobi/iasted/backend
docker-compose up -d
```

### 2. Vérifier l'API

```bash
curl http://localhost:8000/health
```

Devrait retourner :
```json
{
  "status": "healthy",
  "service": "iAsted",
  "version": "v1"
}
```

### 3. Démarrer le Frontend React

```bash
cd /Users/okatech/ndjobi
npm run dev
```

### 4. Tester dans le Navigateur

1. Se connecter à Ndjobi
2. Aller sur la page avec le bouton iAsted
3. Cliquer sur le micro
4. Autoriser l'accès au microphone
5. Parler dans le micro
6. Voir la transcription s'afficher
7. Entendre la réponse audio

---

## 🐛 Dépannage

### Erreur "WebSocket connection failed"

**Cause** : Backend iAsted non démarré

**Solution** :
```bash
cd /Users/okatech/ndjobi/iasted/backend
docker-compose up -d
docker-compose logs -f api
```

### Erreur "Microphone access denied"

**Cause** : Permissions navigateur

**Solution** : Autoriser l'accès au micro dans les paramètres du navigateur

### Erreur "Token invalide"

**Cause** : Token JWT expiré ou manquant

**Solution** : Se reconnecter à Ndjobi

### Pas d'audio en retour

**Vérifications** :
1. Volume du système activé
2. Backend iAsted configuré avec clé TTS Google
3. Console navigateur pour erreurs JavaScript

---

## 📊 Exemple Complet : Page iAsted Standalone

Créer `/src/pages/IAstedPage.tsx` :

```tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIAstedVoice } from '@/hooks/iasted/useIAstedVoice';
import { IAstedConversationHistory } from '@/components/iasted';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function IAstedPage() {
  const { session, role } = useAuth();
  const { toast } = useToast();
  const [sessionStarted, setSessionStarted] = useState(false);

  const token = session?.access_token || '';

  const {
    isConnected,
    isRecording,
    isProcessing,
    currentTranscript,
    conversationHistory,
    error,
    startSession,
    stopSession,
    toggleRecording,
  } = useIAstedVoice(token, {
    onError: (errorMsg) => {
      toast({
        title: 'Erreur iAsted',
        description: errorMsg,
        variant: 'destructive',
      });
    },
  });

  const handleStartSession = async () => {
    try {
      await startSession();
      setSessionStarted(true);
      toast({
        title: 'Session démarrée',
        description: 'iAsted est prêt à vous écouter',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopSession = async () => {
    await stopSession();
    setSessionStarted(false);
    toast({
      title: 'Session terminée',
      description: 'À bientôt !',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-full">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Assistant Vocal iAsted</h1>
        <p className="text-muted-foreground">
          Votre assistant intelligent pour la plateforme Ndjobi
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Colonne gauche : Contrôles */}
        <Card>
          <CardHeader>
            <CardTitle>Contrôles</CardTitle>
            <CardDescription>
              Démarrez une session vocale et commencez à parler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {!sessionStarted ? (
              <Button 
                onClick={handleStartSession} 
                size="lg" 
                className="w-full"
                disabled={!token}
              >
                <Bot className="mr-2" />
                Démarrer une session
              </Button>
            ) : (
              <>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className={`w-32 h-32 rounded-full ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                    onClick={toggleRecording}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-12 h-12 animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="w-12 h-12" />
                    ) : (
                      <Mic className="w-12 h-12" />
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isRecording
                      ? '🔴 Enregistrement en cours...'
                      : isProcessing
                      ? '⏳ Traitement...'
                      : '✅ Prêt à écouter'}
                  </p>
                  {currentTranscript && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{currentTranscript}"
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleStopSession}
                  variant="outline"
                  className="w-full"
                >
                  Terminer la session
                </Button>
              </>
            )}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Statut</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Connexion :</span>
                  <span className={isConnected ? 'text-green-600' : 'text-gray-400'}>
                    {isConnected ? '✅ Connecté' : '⚪ Déconnecté'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rôle :</span>
                  <span className="font-medium capitalize">{role}</span>
                </div>
                <div className="flex justify-between">
                  <span>Échanges :</span>
                  <span className="font-medium">{conversationHistory.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colonne droite : Historique */}
        <div>
          <IAstedConversationHistory 
            history={conversationHistory}
            maxHeight="calc(100vh - 200px)"
          />
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Checklist d'Intégration

- [x] Services créés (`iastedApiClient`, `iastedWebSocket`)
- [x] Hook `useIAstedVoice` créé
- [x] Composants UI créés (`IAstedVoiceButton`, `IAstedConversationHistory`)
- [ ] Variables d'env ajoutées (`.env`)
- [ ] Route `/iasted` ajoutée dans `App.tsx`
- [ ] Lien navigation ajouté
- [ ] Backend iAsted démarré
- [ ] Tests effectués (micro, transcription, audio)

---

**Intégration iAsted dans Ndjobi terminée !** 🎉  
Prêt à activer l'assistant vocal pour les agents.

