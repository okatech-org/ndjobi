# 🚨 NDJOBI - Plateforme Anti-Corruption du Gabon

## 📋 **Vue d'ensemble**

**NDJOBI** est une plateforme web sécurisée permettant aux citoyens gabonais de dénoncer anonymement la corruption et de protéger leurs innovations avec un horodatage blockchain infalsifiable.

### 🎯 **Fonctionnalités principales**
- 🚨 **Signalements anonymes** de corruption via chatbot IA
- 🛡️ **Protection de projets** avec certificats blockchain
- 👥 **Système de rôles** (Citoyen, Agent DGSS, Admin, Super Admin)
- 🗺️ **Géolocalisation** et visualisation des cas
- 🔐 **Sécurité maximale** avec chiffrement et anonymat garanti
- 🤖 **iAsted - Assistant IA Vocal Présidentiel** pour l'administration

---

## 🤖 **iAsted - Assistant IA Vocal Présidentiel**

### **Vue d'ensemble**
**iAsted** est un assistant IA conversationnel multimodal (texte et voix) conçu pour l'administration présidentielle. Il offre une interface naturelle et intuitive pour interagir avec le système NDJOBI via des conversations vocales ou textuelles en temps réel.

### **🎯 Objectifs**
- Fournir une interface conversationnelle naturelle pour l'administration
- Permettre l'accès mains-libres aux fonctionnalités via commandes vocales
- Offrir des réponses contextuelles et personnalisées selon le rôle de l'utilisateur
- Garantir une expérience utilisateur fluide avec des transitions d'états visuelles

### **🔐 Contrôle d'accès**
L'accès à iAsted est strictement contrôlé par rôle :
- ✅ **Super Admin** : Accès complet à toutes les fonctionnalités
- ✅ **Admin (Président)** : Accès aux fonctionnalités d'administration
- ✅ **Sub Admin** : Accès aux fonctionnalités de sous-administration
- ❌ **Agent, User** : Pas d'accès à iAsted

### **📱 Interface utilisateur**

#### **Bouton flottant sphérique**
- **Design** : Bouton 3D avec animations organiques (battements de cœur, ondes, respiration)
- **Position** : Déplaçable par drag-and-drop sur toute la surface de l'écran
- **Persistance** : La position est sauvegardée dans le localStorage
- **Visibilité** : Visible uniquement pour les rôles autorisés

#### **États visuels du bouton**
Le bouton affiche différentes icônes selon l'état actuel :

| État | Icône | Animation | Description |
|------|-------|-----------|-------------|
| **Inactif** | Alternance (iAsted/Mic/Chat/Brain) | Rotation douce | Alterne toutes les icônes disponibles |
| **Écoute** | 🎤 Microphone | Ondes + contractions intensives | Détection de la parole utilisateur |
| **Parole** | 📝 Texte "iAsted" | Pulsations douces | iAsted parle à l'utilisateur |
| **Traitement** | 🧠 Cerveau | Rotation + éclat | Analyse et réflexion en cours |
| **Interface ouverte** | 💬 Chat | Statique | Interface de chat affichée |

#### **Animations organiques**
Le bouton possède des animations naturelles qui s'intensifient selon l'action :
- **Membranes organiques** : Palpitations et expansions
- **Ondes émises** : Propagation synchronisée avec les battements
- **Contractions musculaires** : Réponse aux interactions utilisateur
- **Rayons lumineux** : Effets visuels adaptatifs

### **🎙️ Modes d'interaction**

#### **1. Mode Texte**
**Activation** : Simple clic sur le bouton iAsted
- Interface de chat s'ouvre à côté du bouton
- Saisie de texte classique avec historique
- Réponses instantanées en texte
- Sauvegarde automatique de la conversation

#### **2. Mode Vocal**
**Activation** : Double clic sur le bouton iAsted

**Flux de conversation :**
```
1. Double-clic → Message de salutation vocal
2. Début d'écoute automatique (VAD activé)
3. Détection de fin de parole (silence de 800ms)
4. Message de transition : "Laissez-moi réfléchir..."
5. Traitement de la demande (état cerveau)
6. Réponse vocale complète
7. Retour à l'état inactif
```

**Caractéristiques vocales :**
- Détection automatique de fin de parole (VAD adaptatif)
- Transcription en temps réel (Deepgram)
- Synthèse vocale naturelle (ElevenLabs - voix Charlotte FR)
- Fallback sur Web Speech API si échec
- Gestion du contexte conversationnel

### **⚙️ Architecture technique**

#### **Services principaux**

##### **1. IAstedService** (`src/services/iAstedService.ts`)
Service de gestion des conversations et interactions avec l'IA.

**Fonctionnalités :**
- Envoi de messages à l'IA (Lovable AI - Gemini 2.5 Flash)
- Gestion du contexte conversationnel
- Adaptation du système prompt selon le rôle utilisateur
- Gestion des erreurs et retry automatique

**Prompts système par rôle :**
- **Super Admin** : "Asted, assistant système avec accès complet"
- **Admin (Président)** : "Excellence, assistant présidentiel formel"
- **Sub Admin** : "Assistant administratif avec ton professionnel"

##### **2. IAstedVoiceService** (`src/services/iAstedVoiceService.ts`)
Service de gestion des fonctionnalités vocales (STT et TTS).

**Speech-to-Text (STT) :**
- API principale : **Deepgram** via edge function (`iasted-stt`)
- Codec : audio/webm avec opus
- Fallback : Web Speech API (moins précis)
- Configuration : échoCancellation, noiseSuppression, autoGainControl

**Text-to-Speech (TTS) :**
- API principale : **ElevenLabs** via edge function (`iasted-tts`)
- Voix : Charlotte (FR) - ID: `XB0fDUnXU5powFXDhCwa`
- Format : audio/mpeg (MP3)
- Fallback : Web Speech API avec voix française
- Attente de fin de lecture pour synchronisation des états

**Gestion de l'enregistrement :**
- MediaRecorder avec collecte de chunks
- Détection de durée minimale (1000 bytes)
- Nettoyage automatique des ressources (stream, tracks)

##### **3. IAstedStorageService** (`src/services/iAstedStorageService.ts`)
Service de persistance des conversations et fichiers audio.

**Fonctionnalités :**
- Sauvegarde des conversations dans Supabase
- Upload des fichiers audio dans le bucket `conversations`
- Génération d'URLs publiques temporaires
- Métadonnées : session_id, mode, timestamps, response_time_ms

#### **Composants React**

##### **IAstedFloatingButton** (`src/components/admin/IAstedFloatingButton.tsx`)
Composant principal du bouton flottant et de l'interface de chat.

**États React :**
```typescript
- isOpen: boolean          // Interface chat ouverte
- mode: 'voice' | 'text'   // Mode d'interaction
- isListening: boolean     // En écoute active
- isSpeaking: boolean      // En train de parler
- isProcessing: boolean    // Traitement en cours
- messages: Message[]      // Historique de la conversation
- position: {x, y}         // Position du bouton
```

**Gestion du drag-and-drop :**
- Détection des événements mouse et touch
- Contraintes dans les limites de l'écran
- Sauvegarde de la position dans localStorage
- Prévention des clics après drag

**Gestion des clics :**
- Simple clic : Mode texte (ouvre l'interface)
- Double clic : Mode vocal (lance la conversation)
- Fenêtre de détection : 350ms

##### **IAstedButton** (`src/components/ui/iAstedButton.tsx`)
Bouton sphérique avec animations organiques complexes.

**Animations CSS :**
- `global-heartbeat` : Battement de cœur global (2.8s)
- `membrane-palpitation` : Pulsations de membranes (intensifié selon état)
- `wave-emission` : Émission d'ondes (synchronisé avec battements)
- `morphing-bg` : Fond morphing multicolore (25s)
- `muscle-contraction` : Contraction au clic (1.2s)

**Classes d'états vocaux :**
- `.voice-listening` : Animations accélérées (0.6s-0.8s)
- `.voice-speaking` : Animations rythmées (0.4s-0.5s)
- Normal : Animations lentes (2.8s)

**Props :**
```typescript
{
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  voiceListening?: boolean
  voiceSpeaking?: boolean
  voiceProcessing?: boolean
  isInterfaceOpen?: boolean
}
```

### **🎤 Détection vocale avancée (VAD)**

#### **Voice Activity Detection (VAD) adaptatif**
Système de détection automatique de fin de parole avec adaptation au volume.

**Paramètres :**
- **Fréquence d'analyse** : 100ms
- **Taille du buffer** : 2048 samples (FFT)
- **Durée silence** : 800ms (plus réactif)
- **Durée parole minimale** : 500ms

**Seuils adaptatifs :**
```typescript
RMS_SPEECH = max(0.015, maxRMS * 0.15)  // Détection de parole
RMS_SILENCE = RMS_SPEECH * 0.5          // Détection de silence
```

**États de détection :**
1. **Aucune parole** : Attente de signal audio
2. **Parole détectée** : Début d'énoncé (RMS > seuil)
3. **Zone grise** : Entre parole et silence (incrément lent)
4. **Silence** : Fin d'énoncé confirmée (800ms continu)

**Calcul RMS (Root Mean Square) :**
```typescript
const rms = Math.sqrt(sumSquares / bufferLength)
```

**Logs de debug :**
- 🗣️ Parole détectée - Début d'énoncé
- 🔇 Silence: XXXms / 800ms (progression)
- ✅ Fin de parole détectée - Traitement...
- 📊 Seuils adaptés: Parole=0.XXXX, Silence=0.XXXX

### **🔌 Edge Functions Supabase**

#### **1. iasted-chat** (`supabase/functions/iasted-chat/index.ts`)
Gestion des conversations textuelles avec l'IA.

**Fonctionnalités :**
- Authentification JWT et récupération du rôle utilisateur
- Adaptation du système prompt selon le rôle
- Appel à Lovable AI (google/gemini-2.5-flash)
- Gestion des erreurs et logs détaillés

**Configuration :**
```toml
[functions.iasted-chat]
verify_jwt = true  # Authentification requise
```

#### **2. iasted-stt** (`supabase/functions/iasted-stt/index.ts`)
Transcription audio (Speech-to-Text) via Deepgram.

**Fonctionnalités :**
- Réception d'audio en base64
- Conversion et envoi à Deepgram API
- Retour de la transcription en texte
- Gestion des erreurs avec fallback

**Configuration :**
```toml
[functions.iasted-stt]
verify_jwt = true
```

**Variables d'environnement :**
- `DEEPGRAM_API_KEY` : Clé API Deepgram

#### **3. iasted-tts** (`supabase/functions/iasted-tts/index.ts`)
Synthèse vocale (Text-to-Speech) via ElevenLabs.

**Fonctionnalités :**
- Réception de texte à synthétiser
- Appel à ElevenLabs API avec voix Charlotte
- Retour de l'audio en base64
- Optimisation de la qualité vocale

**Configuration :**
```toml
[functions.iasted-tts]
verify_jwt = true
```

**Variables d'environnement :**
- `ELEVENLABS_API_KEY` : Clé API ElevenLabs

**Paramètres de synthèse :**
```typescript
{
  model_id: "eleven_multilingual_v2",
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  }
}
```

### **💾 Structure de données**

#### **Conversation Message**
```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  mode: 'voice' | 'text'
  audioUrl?: string
}
```

#### **Sauvegarde Supabase**
```typescript
{
  session_id: string           // UUID de la session
  mode: 'voice' | 'text'       // Mode d'interaction
  user_message: string         // Message utilisateur
  user_message_transcription?: string  // Transcription si vocal
  assistant_message: string    // Réponse de l'assistant
  assistant_audio_url?: string // URL audio si vocal
  context_data: {
    timestamp: string
    sessionId: string
  }
  response_time_ms: number     // Temps de réponse
}
```

### **🔧 Configuration et personnalisation**

#### **Voix ElevenLabs disponibles**
- **Charlotte** (XB0fDUnXU5powFXDhCwa) : Voix féminine FR élégante [DÉFAUT]
- **Aria** (9BWtsMINqrJLrRacOk9x) : Voix féminine EN naturelle
- **Roger** (CwhRBWXzGAHq8TQ4Fs17) : Voix masculine EN professionnelle

#### **Modèles IA disponibles (Lovable AI)**
- **google/gemini-2.5-flash** : Rapide, efficace, multimodal [DÉFAUT]
- **google/gemini-2.5-pro** : Plus puissant, raisonnement complexe
- **openai/gpt-5-mini** : Équilibré, bon rapport qualité/prix

#### **Personnalisation du comportement**
Modifier les constantes dans `IAstedFloatingButton.tsx` :
```typescript
const SILENCE_DURATION = 800        // Durée silence (ms)
const MIN_SPEECH_DURATION = 500     // Durée parole min (ms)
const RMS_SPEECH = 0.018            // Seuil activation parole
const RMS_SILENCE = 0.01            // Seuil détection silence
```

### **🐛 Debugging et logs**

#### **Console logs disponibles**
```typescript
🎭 iAsted Button State      // État du bouton (icône, animation)
🎙️ Mode vocal activé        // Activation mode vocal
🗣️ Parole détectée          // Détection de parole
🔇 Silence: XXXms           // Progression du silence
✅ Fin de parole détectée   // Fin confirmée
💬 iAsted parle             // Synthèse vocale en cours
🧠 iAsted réfléchit         // Traitement IA
🤖 Demande à l'IA           // Envoi à l'API
✅ Réponse IA reçue         // Réponse reçue
📊 Seuils adaptés           // Adaptation VAD
```

#### **Gestion des erreurs**
Toutes les erreurs sont capturées et affichées via toasts :
- Erreur accès microphone
- Erreur transcription (Deepgram indisponible)
- Erreur synthèse vocale (ElevenLabs indisponible)
- Erreur API IA (timeout, rate limit)
- Erreur sauvegarde conversation

### **🚀 Améliorations futures possibles**

1. **Streaming de réponses** : Afficher la réponse IA en temps réel
2. **Multi-langue** : Support EN, ES en plus du FR
3. **Commandes vocales** : "iAsted, ouvre les signalements"
4. **Historique persistant** : Reprise de conversation après déconnexion
5. **Mode dictée** : Transcription continue sans limite
6. **Personnalisation voix** : Choix de la voix par l'utilisateur
7. **Raccourcis clavier** : Ctrl+Space pour activer le vocal
8. **Mode mains-libres** : Activation par mot-clé "Hey iAsted"

---

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
