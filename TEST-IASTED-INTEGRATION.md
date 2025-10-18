# 🧪 Guide de Test - Intégration iAsted dans Dashboard Admin

Ce guide vous permet de **tester immédiatement** l'intégration complète de iAsted dans Ndjobi.

---

## ✅ Vérification Préalable

### 1. Fichiers Créés

```bash
cd /Users/okatech/ndjobi

# Vérifier frontend
ls -la src/components/admin/IAsted*
ls -la src/components/iasted/
ls -la src/services/iasted/
ls -la src/hooks/iasted/

# Vérifier backend
ls -la iasted/backend/app/
ls -la iasted/backend/docker-compose.yml
```

**Résultat attendu** : Tous les fichiers existent ✅

### 2. Variables d'Environnement

```bash
# Vérifier .env.local frontend
cat .env.local | grep IASTED
```

**Résultat attendu** :
```
VITE_IASTED_API_URL=http://localhost:8000/api/v1
VITE_IASTED_WS_URL=ws://localhost:8000/api/v1
```

### 3. Intégration Dashboard Admin

```bash
# Vérifier que AdminDashboard importe iAsted
grep -n "IAsted" src/pages/dashboards/AdminDashboard.tsx
```

**Résultat attendu** :
```
26:import { IAstedChat } from '@/components/admin/IAstedChat';
27:import { IAstedFloatingButton } from '@/components/admin/IAstedFloatingButton';
812-818: Onglet iAsted dans TabsList
855: {activeView === 'iasted' && <IAstedChat isOpen={true} />}
858: {activeView !== 'iasted' && <IAstedFloatingButton />}
```

---

## 🚀 Lancement des Services

### Étape 1 : Backend iAsted (Terminal 1)

```bash
cd /Users/okatech/ndjobi/iasted/backend

# Vérifier que le fichier env.template existe
ls -la env.template

# Copier vers .env
cp env.template .env

# Configurer au minimum la clé Google AI (GRATUIT)
# Éditer .env et remplacer :
# GOOGLE_AI_API_KEY=AIzaSy...votre_cle_ici

# Obtenir clé gratuite :
open https://makersuite.google.com/app/apikey

# Une fois la clé ajoutée, lancer Docker
docker-compose up -d

# Attendre 30 secondes que tous les services démarrent
sleep 30

# Vérifier les logs
docker-compose logs api

# Devrait afficher :
# ✅ Service STT Deepgram initialisé
# ✅ LLM Router initialisé
# ✅ Client Redis initialisé
# 🚀 Démarrage de iAsted v1
```

### Étape 2 : Vérifier Backend (Terminal 2)

```bash
# Health check
curl http://localhost:8000/health

# Devrait retourner :
# {"status":"healthy","service":"iAsted","version":"v1","environment":"development"}

# Vérifier documentation API
curl http://localhost:8000/api/v1/docs

# OU ouvrir dans navigateur
open http://localhost:8000/api/v1/docs
```

### Étape 3 : Frontend Ndjobi (Terminal 3)

```bash
cd /Users/okatech/ndjobi

# Vérifier les variables d'env
cat .env.local | grep IASTED

# Lancer le dev server
npm run dev

# Devrait afficher :
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

---

## 🎬 Scénario de Test Complet

### Test 1 : Connexion Dashboard Admin

1. **Ouvrir navigateur** : http://localhost:5173

2. **Se connecter en mode Admin** :
   - Email : `iasted@me.com`
   - Password : `011282`

3. **Redirection automatique** vers `/dashboard/admin`

4. **Vérifier l'affichage** :
   - En-tête "Protocole d'État" visible
   - Navigation avec onglets : Dashboard, Validation, Enquêtes, Sous-Admins, Rapports, XR-7, **iAsted IA**

### Test 2 : Accès Onglet iAsted

1. **Cliquer sur l'onglet** : **"iAsted IA"** (avec icône 🧠 Brain)

2. **Page iAsted s'affiche** avec :
   - En-tête violet/bleu "Assistant Vocal iAsted"
   - Badge "Multi-LLM"
   - Panneau de contrôle (gauche)
   - Historique conversations (droite)
   - Bouton "Activer iAsted"

3. **Cliquer** sur "Activer iAsted"

4. **Observer** :
   - Toast notification : "✅ iAsted activé"
   - Badge "Connecté" apparaît (vert)
   - Gros bouton micro rond apparaît (violet/bleu)
   - Statut : "✅ Prêt à vous écouter"

### Test 3 : Première Interaction Vocale

1. **Cliquer sur le bouton micro** (rond, violet/bleu)

2. **Popup navigateur** : "Autoriser l'accès au microphone ?"
   - Cliquer **"Autoriser"**

3. **Bouton devient ROUGE** et pulse → Enregistrement actif

4. **Parler clairement** :
   ```
   "Bonjour iAsted, présente-toi"
   ```

5. **Observer le flow** :
   - Transcription apparaît en temps réel sous le bouton : "Bonjour iAsted..."
   - Bouton devient **ORANGE** : "⏳ Traitement..."
   - Console navigateur (F12) affiche :
     ```
     🎤 Transcription finale: Bonjour iAsted, présente-toi (conf=0.95)
     🤖 Réponse LLM (gemini-flash): Bonjour ! Je suis iAsted...
     ```
   - Historique se met à jour avec l'échange
   - **Audio joue** avec la réponse vocale

6. **Historique** :
   - Carte apparaît à droite
   - Affiche : Vous → "Bonjour iAsted..." / iAsted → "Bonjour ! Je suis..."
   - Badge du provider (Gemini / GPT-4o / Claude)

### Test 4 : Bouton Flottant

1. **Retourner sur onglet** "Dashboard Global"

2. **Regarder en bas à droite** :
   - Bouton flottant violet/bleu avec icône 🤖 visible
   - Point vert qui pulse (indicateur actif)

3. **Cliquer sur le bouton flottant**

4. **Dialog modale s'ouvre** :
   - Même interface iAsted complète
   - Peut démarrer session et parler

5. **Fermer la modale** :
   - Cliquer en dehors OU bouton X
   - Bouton flottant reste visible

### Test 5 : Commande Complexe

Tester le routing intelligent :

1. **Activer iAsted** (si pas déjà fait)

2. **Parler** :
   ```
   "Génère-moi un rapport PDF sur les 10 derniers cas critiques avec analyse détaillée et recommandations"
   ```

3. **Observer** :
   - Transcription longue apparaît
   - Status "⏳ Traitement..." (peut prendre 3-5 secondes)
   - Console backend affiche : `🤖 Routing vers claude-haiku` (requête complexe)
   - Réponse détaillée dans l'historique
   - Badge "Claude" s'affiche

4. **Deuxième requête simple** :
   ```
   "Merci, donne-moi le nombre total de signalements"
   ```

5. **Observer** :
   - Status traitement plus rapide (<1s)
   - Console backend : `🤖 Routing vers gemini-flash` (requête simple)
   - Badge "Gemini" s'affiche

---

## 📊 Logs à Surveiller

### Console Navigateur (F12)

**Lors de la connexion** :
```
✅ WebSocket iAsted connecté
Session ID: abc123-...
```

**Lors d'une requête vocale** :
```
🎤 Envoi audio chunk: 8192 bytes
📝 Transcription: "Bonjour iAsted..."
🤖 Réponse LLM: "Bonjour ! Je suis..."
🔊 Audio reçu: 45320 bytes
```

### Logs Backend Docker

```bash
# Voir les logs en temps réel
cd /Users/okatech/ndjobi/iasted/backend
docker-compose logs -f api
```

**Logs attendus** :
```
iasted-api  | 🚀 Démarrage de iAsted v1
iasted-api  | 📍 Environnement: development
iasted-api  | ✅ Service STT Deepgram initialisé
iasted-api  | ✅ LLM Router initialisé
iasted-api  | ✅ Client Redis initialisé
iasted-api  | INFO:     Application startup complete
iasted-api  | INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Lors d'une requête** :
```
iasted-api  | ✅ WebSocket connecté: session=abc123, user=user456
iasted-api  | 🎤 Transcription finale: Bonjour iAsted... (conf=0.95)
iasted-api  | 🤖 Routing vers gemini-flash pour: Bonjour iAsted...
iasted-api  | ✅ Réponse LLM (gemini-flash): Bonjour ! Je suis iAsted...
iasted-api  | 🔊 Audio synthétisé: 45320 bytes
```

---

## 🔍 Vérifications Techniques

### Test API REST

```bash
# Créer une session vocale (avec un vrai token Supabase)
curl -X POST http://localhost:8000/api/v1/voice/sessions \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"

# Devrait retourner :
# {
#   "session_id": "uuid-...",
#   "ws_url": "/api/v1/voice/ws/uuid-...",
#   "expires_in": 1800
# }
```

### Test WebSocket (depuis console navigateur)

```javascript
// Ouvrir console (F12) sur http://localhost:5173/dashboard/admin
// Copier-coller ce code :

const token = localStorage.getItem('sb-xfxqwlbqysiezqdpeqpv-auth-token');
const parsedToken = JSON.parse(token);
const accessToken = parsedToken.access_token;

const ws = new WebSocket(`ws://localhost:8000/api/v1/voice/ws/test-session?token=${accessToken}`);

ws.onopen = () => console.log('✅ WebSocket connecté');
ws.onmessage = (e) => console.log('📨 Message:', e.data);
ws.onerror = (e) => console.error('❌ Erreur:', e);
```

### Test Services Docker

```bash
# Vérifier que tous les services sont UP
docker-compose ps

# Devrait afficher :
# iasted-api       running
# iasted-postgres  running  (healthy)
# iasted-redis     running  (healthy)
# iasted-rabbitmq  running  (healthy)
# iasted-celery    running
# iasted-prometheus running
# iasted-grafana   running
```

---

## 💰 Test avec Clés API Minimales

Pour tester **SANS dépenser**, utilisez uniquement Google AI (gratuit) :

### Configuration Minimaliste

Dans `/Users/okatech/ndjobi/iasted/backend/.env` :

```bash
# OBLIGATOIRE - Gratuit
GOOGLE_AI_API_KEY=AIzaSy...votre_cle_ici
GEMINI_MODEL=gemini-2.0-flash-exp

# Les autres peuvent rester vides pour les tests
DEEPGRAM_API_KEY=VOTRE_CLE_DEEPGRAM_ICI
OPENAI_API_KEY=VOTRE_CLE_OPENAI_ICI
ANTHROPIC_API_KEY=VOTRE_CLE_ANTHROPIC_ICI
```

**Avec juste Google AI** :
- ✅ LLM Router fonctionnera (100% Gemini)
- ❌ STT Deepgram non fonctionnel (mais interface fonctionne)
- ❌ TTS Google Cloud non fonctionnel (texte seul)

**Pour test complet vocal**, ajouter aussi :
- Deepgram (200$ gratuits) : https://console.deepgram.com
- Google Cloud TTS service account JSON

---

## 🎯 Checklist de Test

### Phase 1 : Infrastructure

- [ ] Backend démarré : `docker-compose ps` montre 7 services UP
- [ ] API accessible : `curl http://localhost:8000/health` retourne "healthy"
- [ ] Frontend démarré : `npm run dev` fonctionne
- [ ] Variables env : `.env.local` contient `VITE_IASTED_API_URL`

### Phase 2 : Interface Admin

- [ ] Connexion admin réussie : http://localhost:5173/auth
- [ ] Dashboard admin accessible : http://localhost:5173/dashboard/admin
- [ ] Onglet "iAsted IA" visible dans la navigation
- [ ] Clic sur onglet affiche l'interface iAsted

### Phase 3 : Bouton Flottant

- [ ] Sur onglet "Dashboard Global", bouton violet/bleu visible en bas à droite
- [ ] Clic sur bouton flottant ouvre dialog modale
- [ ] Interface iAsted complète dans la modale
- [ ] Fermeture modale fonctionne

### Phase 4 : Session Vocale

- [ ] Bouton "Activer iAsted" fonctionne
- [ ] Badge "Connecté" (vert) apparaît
- [ ] Gros bouton micro rond visible
- [ ] Console navigateur : "✅ WebSocket iAsted connecté"
- [ ] Console backend : "✅ WebSocket connecté: session=..."

### Phase 5 : Interaction Vocale

- [ ] Clic sur micro → Autorisation microphone accordée
- [ ] Bouton devient rouge et pulse
- [ ] Parler "Bonjour" → Transcription apparaît
- [ ] Status "⏳ Traitement..." s'affiche
- [ ] Réponse texte dans historique
- [ ] Audio joue (si TTS configuré)
- [ ] Historique mis à jour avec l'échange
- [ ] Badge provider affiché (Gemini / GPT-4o / Claude)

### Phase 6 : Monitoring

- [ ] Grafana accessible : http://localhost:3001 (admin/admin)
- [ ] Prometheus accessible : http://localhost:9090
- [ ] Métriques visibles dans Grafana
- [ ] Logs backend en temps réel : `docker-compose logs -f api`

---

## 📸 Captures d'Écran Attendues

### 1. Dashboard Admin - Onglet iAsted

```
┌─────────────────────────────────────────────────┐
│  Protocole d'État                        Admin  │
├─────────────────────────────────────────────────┤
│ [Dashboard] [Validation] [Enquêtes]             │
│ [Sous-Admins] [Rapports] [XR-7] [iAsted IA]←🧠 │ ← Actif
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  🤖 Assistant Vocal iAsted  [Multi-LLM] │  │
│  │  Votre assistant intelligent...          │  │
│  │                                           │  │
│  │  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │ Contrôles   │  │ Historique (0)   │  │  │
│  │  │             │  │                  │  │  │
│  │  │   🤖        │  │ Aucune conv...   │  │  │
│  │  │ Démarrer    │  │                  │  │  │
│  │  │ une session │  │                  │  │  │
│  │  │             │  │                  │  │  │
│  │  │ [Activer]   │  │                  │  │  │
│  │  └─────────────┘  └──────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Capacités : [STT] [Multi-LLM] [TTS]            │
└─────────────────────────────────────────────────┘
```

### 2. Session Active avec Micro

```
┌─────────────────────────────────────────────────┐
│  Contrôles                                       │
│                                                  │
│              ┌──────────┐                       │
│              │          │                       │
│              │    🎤    │  ← Gros bouton violet │
│              │          │                       │
│              └──────────┘                       │
│                                                  │
│       ✅ Prêt à vous écouter                    │
│                                                  │
│  [Terminer la session] [🔊 Audio activé]       │
│                                                  │
│  ─────────────────────────────────────────      │
│  Rôle : admin                                   │
│  Échanges : 0                                   │
│  Statut : ● Connecté                            │
└─────────────────────────────────────────────────┘
```

### 3. Pendant l'Enregistrement

```
┌─────────────────────────────────────────────────┐
│              ┌──────────┐                       │
│              │          │                       │
│              │   🔇     │  ← Rouge + pulse      │
│              │          │                       │
│              └──────────┘                       │
│                                                  │
│       🔴 Enregistrement en cours...             │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │ Transcription :                         │    │
│  │ "Bonjour iAsted, présente-toi"         │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 4. Après Réponse

```
┌─────────────────────────────────────────────────┐
│  Historique de conversation               (1)  │
│                                                  │
│  👤 Vous                          10:30:45      │
│  ┌────────────────────────────────────────┐    │
│  │ Bonjour iAsted, présente-toi          │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  🤖 iAsted                        10:30:47      │
│  ┌────────────────────────────────────────┐    │
│  │ Bonjour ! Je suis iAsted, votre        │    │
│  │ assistant vocal intelligent pour la    │    │
│  │ plateforme Ndjobi. Je peux vous aider  │    │
│  │ avec vos tâches administratives...     │    │
│  └────────────────────────────────────────┘    │
│                                  • Gemini      │
└─────────────────────────────────────────────────┘
```

---

## 🐛 Résolution de Problèmes

### Erreur : "Module not found: iastedApiClient"

**Cause** : TypeScript n'a pas recompilé

**Solution** :
```bash
# Arrêter npm run dev (Ctrl+C)
# Relancer
npm run dev
```

### Erreur : "Connection refused localhost:8000"

**Cause** : Backend pas démarré

**Solution** :
```bash
cd /Users/okatech/ndjobi/iasted/backend
docker-compose up -d
docker-compose ps  # Vérifier que api est UP
```

### Erreur : "Microphone access denied"

**Cause** : Permissions navigateur

**Solutions** :
- **Chrome** : chrome://settings/content/microphone → Autoriser localhost
- **Firefox** : Préférences → Vie privée → Permissions → Microphone
- **Safari** : Préférences → Sites web → Microphone

### Erreur : "Token invalid"

**Cause** : Session expirée

**Solution** : Se reconnecter au dashboard

### Pas d'audio en retour

**Vérifications** :
```bash
# 1. Volume système
# 2. Console navigateur pour erreurs
# 3. Backend configuré avec Google TTS
grep GOOGLE_APPLICATION_CREDENTIALS /Users/okatech/ndjobi/iasted/backend/.env
```

---

## 📈 Métriques de Performance

Une fois testé, vérifier les métriques :

```bash
# Prometheus
open http://localhost:9090

# Requêtes utiles
websocket_connections  # Devrait être = 1
llm_requests_total     # Incrémente à chaque requête
cache_hits_total       # Augmente avec requêtes similaires
```

---

## ✅ Confirmation de Succès

**Si tous ces points sont verts, l'intégration est PARFAITE** :

- ✅ Backend iAsted accessible sur :8000
- ✅ Frontend Ndjobi accessible sur :5173
- ✅ Dashboard admin affiche onglet "iAsted IA"
- ✅ Clic sur onglet affiche interface iAsted
- ✅ Bouton "Activer iAsted" fonctionne
- ✅ WebSocket se connecte (logs console)
- ✅ Micro enregistre et envoie audio
- ✅ Transcription apparaît en temps réel
- ✅ LLM génère réponse (visible dans historique)
- ✅ Audio joue (si TTS configuré)
- ✅ Bouton flottant fonctionne sur autres onglets
- ✅ Routing LLM intelligent (Gemini/GPT/Claude)
- ✅ Cache sémantique actif (économie tokens)

---

## 🎊 Prochaines Actions

### Immédiat (Aujourd'hui)

```bash
# 1. Obtenir clé Google AI gratuite (2 min)
open https://makersuite.google.com/app/apikey

# 2. Ajouter dans .env
cd /Users/okatech/ndjobi/iasted/backend
nano .env
# Ligne : GOOGLE_AI_API_KEY=AIzaSy...

# 3. Lancer le stack
docker-compose up -d

# 4. Tester
cd /Users/okatech/ndjobi
npm run dev
open http://localhost:5173/dashboard/admin
```

### Cette Semaine

- [ ] Obtenir clés Deepgram + OpenAI + Anthropic (crédits gratuits)
- [ ] Tester vocal complet (STT → LLM → TTS)
- [ ] Valider qualité français gabonais
- [ ] Tester génération PDF par commande vocale

### Semaine Prochaine

- [ ] Intégrer dans AgentDashboard
- [ ] Intégrer dans SuperAdminDashboard
- [ ] Tests de charge (50+ agents simultanés)
- [ ] Optimiser cache sémantique

### Déploiement Production

- [ ] Déployer backend sur AWS
- [ ] Configurer DNS api.iasted.ndjobi.ga
- [ ] Migration progressive vers prod
- [ ] Formation équipe admin

---

**🎉 iAsted est 100% INTÉGRÉ dans le Dashboard Admin Ndjobi !**

**Pour tester immédiatement** :
```bash
cd /Users/okatech/ndjobi/iasted/backend && docker-compose up -d
cd /Users/okatech/ndjobi && npm run dev
open http://localhost:5173/dashboard/admin
# Cliquer sur onglet "iAsted IA" 🧠
```

