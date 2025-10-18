# 🚀 Démarrage Rapide iAsted

Guide de démarrage en **5 minutes** pour lancer iAsted en local.

## Prérequis

- **Docker** et **Docker Compose** installés
- **Python 3.11+** (optionnel pour dev local sans Docker)
- Clés API pour les services IA (voir ci-dessous)

## Étape 1 : Cloner et Configurer

```bash
cd /Users/okatech/ndjobi/iasted/backend

cp env.template .env
```

Éditer `.env` avec vos clés API :

```bash
DEEPGRAM_API_KEY=your-deepgram-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-key
```

## Étape 2 : Démarrer les Services

### Option A : Docker Compose (Recommandé)

```bash
make dev

# Ou directement:
docker-compose up -d
```

### Option B : Manuel (Sans Docker)

```bash
# 1. Démarrer PostgreSQL
brew install postgresql@16
brew services start postgresql@16
createdb iasted_db

# 2. Démarrer Redis
brew install redis
brew services start redis

# 3. Installer dépendances Python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Lancer l'API
make dev-local
```

## Étape 3 : Vérifier l'Installation

```bash
# Health check
curl http://localhost:8000/health

# Documentation interactive
open http://localhost:8000/api/v1/docs
```

## Étape 4 : Tester l'API Vocale

### Créer une session vocale

```bash
curl -X POST http://localhost:8000/api/v1/voice/sessions \
  -H "Authorization: Bearer <token>"
```

### Se connecter via WebSocket

```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/voice/ws/<session_id>?token=<token>');

ws.onopen = () => {
  console.log('Connecté !');
  // Envoyer des chunks audio
  ws.send(audioChunk);
};

ws.onmessage = (event) => {
  console.log('Réponse:', event.data);
};
```

## Services Disponibles

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:8000 | - |
| Swagger Docs | http://localhost:8000/api/v1/docs | - |
| Grafana | http://localhost:3001 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| RabbitMQ | http://localhost:15672 | guest/guest |
| PostgreSQL | localhost:5432 | iasted/iasted_pass |
| Redis | localhost:6379 | - |

## Commandes Utiles

```bash
# Voir les logs
make logs

# Arrêter les services
make stop

# Nettoyer
make clean

# Tests
make test

# Migrations DB
make migrate

# Shell interactif
make shell
```

## Obtenir les Clés API

### Deepgram (STT)
1. Créer compte sur https://console.deepgram.com
2. Créer un projet
3. Générer une API Key
4. **Prix** : ~0.0077$/min (Nova-3)

### OpenAI
1. https://platform.openai.com/api-keys
2. Créer une clé API
3. **Prix** : GPT-4o-mini ~0.15$/1M tokens

### Anthropic
1. https://console.anthropic.com
2. Générer une clé API
3. **Prix** : Claude Haiku ~1.00$/1M tokens

### Google AI (Gemini)
1. https://makersuite.google.com/app/apikey
2. Créer une clé API
3. **Prix** : Gemini Flash ~0.10$/1M tokens

### Google Cloud TTS
1. Créer projet sur https://console.cloud.google.com
2. Activer Text-to-Speech API
3. Créer service account et télécharger JSON
4. `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`

## Architecture Simplifiée

```
┌─────────────┐
│   Client    │ (Mobile/Web)
└──────┬──────┘
       │ WebSocket + Audio
       │
┌──────▼──────┐
│  FastAPI    │ (:8000)
│  WebSocket  │
└──────┬──────┘
       │
       ├──► Deepgram (STT)     → Transcription
       ├──► LLM Router         → Intelligence
       │    ├─► Gemini Flash   (60% requêtes)
       │    ├─► GPT-4o-mini    (30% requêtes)
       │    └─► Claude Haiku   (10% requêtes)
       ├──► Google TTS         → Synthèse vocale
       │
       ├──► PostgreSQL         → Données persistantes
       ├──► Redis              → Cache + Sessions
       └──► RabbitMQ/Celery    → Tâches async
```

## Troubleshooting

### Port déjà utilisé

```bash
# Trouver le process utilisant le port 8000
lsof -ti:8000 | xargs kill -9
```

### Erreur de connexion DB

```bash
# Vérifier PostgreSQL
docker-compose logs postgres

# Recréer la DB
docker-compose down -v
docker-compose up -d postgres
```

### Erreur clé API

Vérifier que toutes les clés sont présentes dans `.env` :
```bash
grep -E "(DEEPGRAM|OPENAI|ANTHROPIC|GOOGLE)" .env
```

## Prochaines Étapes

1. ✅ Lire la documentation complète : `backend/README.md`
2. ✅ Explorer l'API : http://localhost:8000/api/v1/docs
3. ✅ Voir les métriques : http://localhost:3001 (Grafana)
4. ✅ Consulter l'architecture : `/iasted/docs/ARCHITECTURE.md`

## Support

- **Email** : tech@ndjobi.ga
- **Documentation** : http://localhost:8000/api/v1/redoc

---

**iAsted** - Agent Vocal Intelligent pour Ndjobi 🇬🇦

