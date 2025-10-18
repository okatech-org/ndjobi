# iAsted Backend API

Agent vocal intelligent multi-modal pour la plateforme anti-corruption **Ndjobi** au Gabon.

## 🏗️ Architecture

- **Framework**: FastAPI (Python 3.11+)
- **Base de données**: PostgreSQL 16 (RDS Multi-AZ)
- **Cache**: Redis (ElastiCache)
- **Queue**: RabbitMQ + Celery
- **IA Services**:
  - **STT**: Deepgram Nova-3 (français optimisé)
  - **TTS**: Google Cloud TTS Neural
  - **LLM**: Router intelligent (Gemini Flash / GPT-4o-mini / Claude Haiku)
- **Infrastructure**: AWS Cape Town (af-south-1)
- **Orchestration**: Kubernetes (EKS) + Terraform

## 🚀 Démarrage Rapide

### Développement Local (Docker Compose)

```bash
cd iasted/backend

cp .env.example .env

docker-compose up -d

docker-compose logs -f api
```

L'API sera disponible sur `http://localhost:8000`

- **Documentation Swagger**: http://localhost:8000/api/v1/docs
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### Sans Docker (Manuel)

```bash
python3.11 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

export DATABASE_URL="postgresql+asyncpg://iasted:password@localhost:5432/iasted_db"
export REDIS_URL="redis://localhost:6379/0"

uvicorn app.main:app --reload --port 8000
```

## 📦 Structure du Projet

```
backend/
├── app/
│   ├── api/              # Endpoints API
│   │   └── endpoints/
│   │       ├── auth.py         # OAuth2 + PKCE
│   │       ├── voice.py        # WebSocket vocal
│   │       ├── conversations.py
│   │       ├── artifacts.py    # Génération PDF
│   │       └── admin.py
│   ├── core/             # Configuration centrale
│   │   ├── auth.py            # JWT + RBAC
│   │   ├── redis_client.py
│   │   ├── metrics.py         # Prometheus
│   │   └── logging.py
│   ├── services/         # Services métier
│   │   ├── stt_service.py     # Deepgram STT
│   │   ├── tts_service.py     # Google/ElevenLabs TTS
│   │   ├── llm_router.py      # Router LLM intelligent
│   │   ├── semantic_cache.py  # Cache sémantique
│   │   └── artifact_service.py # Génération docs
│   ├── models/           # Modèles SQLAlchemy
│   ├── schemas/          # Schémas Pydantic
│   └── utils/            # Utilitaires
├── tests/                # Tests unitaires/intégration
├── alembic/              # Migrations DB
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## 🔑 Variables d'Environnement

Variables critiques à configurer (voir `.env.example`) :

```bash
DEEPGRAM_API_KEY=your-key
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
GOOGLE_AI_API_KEY=your-key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

DATABASE_URL=postgresql+asyncpg://...
REDIS_URL=redis://...

AWS_REGION=af-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_ARTIFACTS_BUCKET=iasted-artifacts

JWT_SECRET=your-secret
AUDIT_SECRET=your-secret
```

## 🧪 Tests

```bash
pytest tests/ -v

pytest tests/ --cov=app --cov-report=html

pytest tests/test_voice.py -v -s
```

## 📊 Endpoints Principaux

### Authentification
- `POST /api/v1/auth/authorize` - Initier OAuth2 + PKCE
- `POST /api/v1/auth/token` - Échanger code pour tokens
- `POST /api/v1/auth/refresh` - Rafraîchir access token

### Vocal
- `WS /api/v1/voice/ws/{session_id}` - WebSocket streaming vocal
- `POST /api/v1/voice/sessions` - Créer session vocale
- `DELETE /api/v1/voice/sessions/{id}` - Terminer session

### Conversations
- `GET /api/v1/conversations` - Liste conversations
- `GET /api/v1/conversations/{id}` - Détails conversation
- `DELETE /api/v1/conversations/{id}` - Supprimer conversation

### Artefacts
- `POST /api/v1/artifacts/generate` - Générer PDF/document
- `GET /api/v1/artifacts/{id}` - Télécharger artefact
- `GET /api/v1/artifacts` - Liste artefacts

### Administration
- `GET /api/v1/admin/users` - Liste utilisateurs
- `POST /api/v1/admin/users/{id}/role` - Changer rôle
- `GET /api/v1/admin/metrics` - Métriques système
- `GET /api/v1/admin/audit-logs` - Logs d'audit

## 🏭 Déploiement Production

### 1. Infrastructure Terraform

```bash
cd ../infrastructure/terraform

terraform init

terraform plan

terraform apply
```

### 2. Configuration Kubernetes

```bash
aws eks update-kubeconfig --region af-south-1 --name iasted-cluster-prod

kubectl apply -f ../kubernetes/base/namespace.yaml

kubectl create secret generic iasted-secrets \
  --namespace=iasted \
  --from-literal=database-url="..." \
  --from-literal=redis-url="..." \
  --from-literal=deepgram-api-key="..." \
  --from-literal=openai-api-key="..." \
  --from-literal=anthropic-api-key="..." \
  --from-literal=google-ai-api-key="..."

kubectl apply -f ../kubernetes/base/

kubectl get pods -n iasted
```

### 3. Build & Push Docker Image

```bash
docker build -t iasted-api:latest --target production .

docker tag iasted-api:latest <ECR_URL>/iasted-api:latest
docker push <ECR_URL>/iasted-api:latest

kubectl rollout restart deployment/iasted-api -n iasted
```

## 📈 Monitoring

- **Prometheus**: Métriques exposées sur `/metrics`
- **Grafana**: Dashboards pré-configurés
- **Logs**: JSON structured logging
- **Audit**: Traçabilité complète 7 ans (conformité CNPDCP)

Métriques clés trackées :
- Latence STT/LLM/TTS
- Tokens consommés par provider
- Coûts LLM en temps réel
- Cache hit rate
- Connexions WebSocket actives

## 🔒 Sécurité & Conformité

- **Auth**: OAuth2 + PKCE
- **RBAC**: 4 niveaux (user/agent/admin/super_admin)
- **Chiffrement**: TLS 1.3, AES-256-GCM au repos
- **Audit**: Logs immutables avec signature crypto
- **Conformité**: Loi gabonaise n°001/2011 + CNPDCP + Convention de Malabo
- **Rétention**: 90j conversations, 7 ans audit logs

## 🛠️ Développement

### Ajouter une nouvelle dépendance

```bash
pip install <package>
pip freeze > requirements.txt
```

### Créer une migration DB

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Lancer les workers Celery

```bash
celery -A app.core.celery_app worker --loglevel=info
```

## 📚 Documentation

- Architecture détaillée: Voir `/iasted/docs/ARCHITECTURE.md`
- Guide déploiement: Voir `/iasted/docs/DEPLOYMENT.md`
- API Reference: http://localhost:8000/api/v1/docs

## 🤝 Support

- Email technique: tech@ndjobi.ga
- DPO: dpo@ndjobi.ga
- CNPDCP: GA-2025-XXXXX

---

**Projet iAsted** - Plateforme Ndjobi - République Gabonaise

