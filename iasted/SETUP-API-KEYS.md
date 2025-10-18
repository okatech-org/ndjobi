# 🔑 Guide d'Obtention des Clés API pour iAsted

Ce guide détaille comment obtenir **gratuitement** ou à faible coût toutes les clés API nécessaires pour faire fonctionner iAsted.

---

## 📋 Récapitulatif des Services Requis

| Service | Prix | Crédit Gratuit | Nécessité |
|---------|------|----------------|-----------|
| **Deepgram** | 0.0077$/min | 200$ offerts | ⚠️ **OBLIGATOIRE** (STT) |
| **OpenAI** | 0.15$/1M tokens | 5$ offerts | ⚠️ **OBLIGATOIRE** (LLM) |
| **Anthropic** | 1$/1M tokens | 5$ offerts | ⚠️ **OBLIGATOIRE** (LLM) |
| **Google AI** | 0.10$/1M tokens | Gratuit jusqu'à limite | ⚠️ **OBLIGATOIRE** (LLM) |
| **Google Cloud TTS** | 6$/mois | 90j gratuits | Recommandé (TTS) |
| **ElevenLabs** | 99$/mois | Version gratuite limitée | Optionnel (TTS fallback) |

---

## 1. Deepgram (Speech-to-Text) ⚠️ OBLIGATOIRE

**Service** : Transcription audio en texte (français optimisé)  
**Prix** : 0.0077$/minute (~0.46$/heure)  
**Crédit gratuit** : 200$ offerts (25,974 minutes = 433 heures)

### Étapes d'inscription

1. **Créer un compte**  
   👉 https://console.deepgram.com/signup

2. **Vérifier l'email**  
   Cliquer sur le lien de confirmation

3. **Créer un projet**  
   - Nom : `iAsted Ndjobi`
   - Region : Choisir la plus proche (Europe/Afrique)

4. **Générer une API Key**  
   - Dashboard → API Keys → Create New Key
   - Nom : `iAsted Backend`
   - Scope : `usage:write` (pour tracking)
   - **Copier la clé** (elle ne sera affichée qu'une fois !)

5. **Ajouter au .env**
   ```bash
   DEEPGRAM_API_KEY=votre_cle_ici
   ```

### Test de la clé

```bash
curl -X POST https://api.deepgram.com/v1/listen \
  -H "Authorization: Token VOTRE_CLE" \
  -H "Content-Type: audio/wav" \
  --data-binary @test.wav
```

---

## 2. OpenAI (GPT-4o-mini) ⚠️ OBLIGATOIRE

**Service** : LLM pour 30% des requêtes (cas moyens)  
**Prix** : 0.15$/1M tokens (~0.15$ pour 30,000 messages)  
**Crédit gratuit** : 5$ offerts

### Étapes d'inscription

1. **Créer un compte OpenAI**  
   👉 https://platform.openai.com/signup

2. **Vérifier identité**  
   - Numéro de téléphone requis
   - Carte bancaire (sera chargée uniquement après crédit épuisé)

3. **Générer une API Key**  
   - Dashboard → API Keys → Create new secret key
   - Nom : `iAsted Backend`
   - Permissions : Full access
   - **Copier la clé immédiatement**

4. **Configurer limite de dépense**  
   - Settings → Billing → Usage limits
   - Hard limit : 10$ (sécurité)
   - Soft limit : 5$ (alerte email)

5. **Ajouter au .env**
   ```bash
   OPENAI_API_KEY=sk-proj-votre_cle_ici
   ```

### Test de la clé

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer VOTRE_CLE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Bonjour"}]
  }'
```

---

## 3. Anthropic Claude (Haiku) ⚠️ OBLIGATOIRE

**Service** : LLM pour 10% des requêtes (cas complexes)  
**Prix** : 1$/1M tokens  
**Crédit gratuit** : 5$ offerts

### Étapes d'inscription

1. **Créer un compte Anthropic**  
   👉 https://console.anthropic.com/signup

2. **Vérifier email et téléphone**

3. **Générer une API Key**  
   - Settings → API Keys → Create Key
   - Nom : `iAsted`
   - **Copier la clé**

4. **Configurer workspace**  
   - Workspace settings → Billing
   - Définir budget mensuel : 20$

5. **Ajouter au .env**
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-votre_cle_ici
   ```

### Test de la clé

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: VOTRE_CLE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-haiku-20241022",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Bonjour"}]
  }'
```

---

## 4. Google AI (Gemini Flash) ⚠️ OBLIGATOIRE

**Service** : LLM pour 60% des requêtes (cas simples)  
**Prix** : 0.10$/1M tokens (le moins cher !)  
**Crédit gratuit** : Gratuit jusqu'à quotas généreux

### Étapes d'inscription

1. **Créer un compte Google Cloud**  
   👉 https://cloud.google.com

2. **Activer AI Studio**  
   👉 https://makersuite.google.com/app/apikey

3. **Créer une API Key**  
   - Cliquer "Create API Key"
   - Sélectionner projet (ou créer nouveau)
   - **Copier la clé**

4. **Quotas gratuits**
   - 15 requêtes/minute
   - 1,500 requêtes/jour
   - 1M tokens/mois gratuits

5. **Ajouter au .env**
   ```bash
   GOOGLE_AI_API_KEY=AIzaSy...votre_cle_ici
   ```

### Test de la clé

```bash
curl "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=VOTRE_CLE" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts":[{"text": "Bonjour"}]}]
  }'
```

---

## 5. Google Cloud TTS (Text-to-Speech) - Recommandé

**Service** : Synthèse vocale française Neural  
**Prix** : 6$/mois après période gratuite  
**Crédit gratuit** : 300$ sur 90 jours

### Étapes d'inscription

1. **Créer projet Google Cloud**  
   👉 https://console.cloud.google.com

2. **Activer Text-to-Speech API**  
   - APIs & Services → Enable APIs
   - Rechercher "Text-to-Speech API"
   - Cliquer "Enable"

3. **Créer Service Account**  
   - IAM & Admin → Service Accounts → Create
   - Nom : `iasted-tts`
   - Role : `Text-to-Speech User`

4. **Générer clé JSON**  
   - Cliquer sur le service account créé
   - Keys → Add Key → Create new key → JSON
   - **Télécharger le fichier JSON**

5. **Placer le fichier**
   ```bash
   mv ~/Downloads/service-account-key.json /Users/okatech/ndjobi/iasted/backend/
   ```

6. **Ajouter au .env**
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json
   ```

### Test de la clé

```bash
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://texttospeech.googleapis.com/v1/text:synthesize \
  -d '{
    "input": {"text": "Bonjour"},
    "voice": {"languageCode": "fr-FR", "name": "fr-FR-Neural2-B"},
    "audioConfig": {"audioEncoding": "MP3"}
  }'
```

---

## 6. ElevenLabs TTS (Optionnel)

**Service** : TTS haute qualité (fallback si Google TTS indisponible)  
**Prix** : 99$/mois  
**Version gratuite** : 10,000 caractères/mois

### Inscription (si besoin)

1. **Créer compte**  
   👉 https://elevenlabs.io/sign-up

2. **Générer API Key**  
   - Profile → API Keys → Create

3. **Choisir une voix**  
   - Voice Library → Filtrer par langue française
   - Copier le Voice ID

4. **Ajouter au .env** (optionnel)
   ```bash
   ELEVENLABS_API_KEY=votre_cle
   ELEVENLABS_VOICE_ID=voice_id
   ```

---

## 📝 Récapitulatif : Éditer le .env

Une fois toutes les clés obtenues, éditer `/Users/okatech/ndjobi/iasted/backend/.env` :

```bash
# STT (OBLIGATOIRE)
DEEPGRAM_API_KEY=abc123...

# LLM (OBLIGATOIRE)
OPENAI_API_KEY=sk-proj-xyz...
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_AI_API_KEY=AIzaSy...

# TTS (Recommandé)
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json

# TTS Fallback (Optionnel)
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

---

## ✅ Vérification des Clés

Après configuration, tester avec le script fourni :

```bash
cd /Users/okatech/ndjobi/iasted/backend
python3 scripts/test-api-keys.py
```

Le script vérifiera :
- ✅ Deepgram : Connexion + quota restant
- ✅ OpenAI : Test requête + solde
- ✅ Anthropic : Test message
- ✅ Google AI : Test génération
- ✅ Google TTS : Test synthèse

---

## 💰 Estimation Coûts Mensuels

Pour **50 agents actifs** (2h vocal/jour) :

| Service | Usage Mensuel | Coût |
|---------|---------------|------|
| Deepgram | 3,000 heures | 1,380$ |
| OpenAI | 15M tokens | 2.25$ |
| Anthropic | 5M tokens | 5$ |
| Google AI | 30M tokens | 3$ |
| Google TTS | Forfait | 6$ |
| **TOTAL** | | **~1,396$/mois** |

Avec les **crédits gratuits** : premiers mois **< 500$** !

---

## 🆘 Support

Problème avec une clé API ?

- **Deepgram** : support@deepgram.com
- **OpenAI** : https://help.openai.com
- **Anthropic** : support@anthropic.com
- **Google Cloud** : https://cloud.google.com/support

---

**Prêt à démarrer iAsted !** 🚀

