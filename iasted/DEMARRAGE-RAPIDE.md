# ⚡ Démarrage Rapide iAsted - Mode d'Emploi

Guide ultra-rapide pour lancer iAsted en **moins de 10 minutes**.

---

## 🚀 Option 1 : Test Local (Docker)

### Étape 1 : Configurer les Clés API

```bash
cd /Users/okatech/ndjobi/iasted/backend

# Créer fichier de configuration
cp env.template .env

# Éditer avec vos clés (voir SETUP-API-KEYS.md)
nano .env
```

Remplacer au minimum :
```bash
DEEPGRAM_API_KEY=votre_cle_deepgram
OPENAI_API_KEY=votre_cle_openai
ANTHROPIC_API_KEY=votre_cle_anthropic
GOOGLE_AI_API_KEY=votre_cle_google
```

### Étape 2 : Lancer Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f api
```

Services lancés :
- ✅ API iAsted (port 8000)
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ RabbitMQ (port 5672 + 15672 management)
- ✅ Celery Worker
- ✅ Prometheus (port 9090)
- ✅ Grafana (port 3001)

### Étape 3 : Tester l'API

```bash
# Health check
curl http://localhost:8000/health

# Documentation interactive
open http://localhost:8000/api/v1/docs

# Grafana
open http://localhost:3001  # admin/admin
```

---

## 🎨 Option 2 : Intégration Frontend React

### Étape 1 : Configurer Environnement

Ajouter dans `/Users/okatech/ndjobi/.env` :

```bash
VITE_IASTED_API_URL=http://localhost:8000/api/v1
VITE_IASTED_WS_URL=ws://localhost:8000/api/v1
```

### Étape 2 : Ajouter Composant iAsted

Dans n'importe quelle page React :

```tsx
import { IAstedVoiceButton } from '@/components/iasted';

function MaPage() {
  return (
    <div>
      {/* Votre contenu */}
      
      {/* Bouton vocal iAsted */}
      <div className="fixed bottom-6 right-6 z-50">
        <IAstedVoiceButton size="lg" showLabel />
      </div>
    </div>
  );
}
```

### Étape 3 : Lancer Frontend

```bash
cd /Users/okatech/ndjobi

# Démarrer en dev
npm run dev
```

Ouvrir http://localhost:5174 et tester le bouton micro !

---

## ☁️ Option 3 : Déploiement AWS Production

### Prérequis

```bash
# Installer outils
brew install awscli terraform kubectl

# Configurer AWS
aws configure
```

### Déploiement Complet

```bash
cd /Users/okatech/ndjobi/iasted/infrastructure/scripts

# Lancer déploiement automatique
./deploy-aws.sh prod af-south-1
```

Le script va tout faire automatiquement (20-30 min) :
1. Infrastructure Terraform (VPC, EKS, RDS, Redis, S3)
2. Build Docker image
3. Déploiement Kubernetes
4. Migrations base de données

---

## 🧪 Tests Rapides

### Test 1 : Health Check

```bash
curl http://localhost:8000/health
```

**Réponse attendue** :
```json
{
  "status": "healthy",
  "service": "iAsted",
  "version": "v1"
}
```

### Test 2 : WebSocket Vocal (via Frontend)

1. Ouvrir http://localhost:5174
2. Cliquer sur le bouton micro
3. Autoriser accès microphone
4. Parler : "Bonjour iAsted"
5. Écouter la réponse audio

### Test 3 : Génération PDF

```bash
curl -X POST http://localhost:8000/api/v1/artifacts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test Rapport Anti-corruption",
    "sections": ["Introduction", "Analyse", "Recommandations"],
    "artifact_type": "pdf_report"
  }'
```

---

## 📋 Commandes Utiles

### Docker

```bash
# Démarrer
cd /Users/okatech/ndjobi/iasted/backend
make dev

# Voir logs
make logs

# Arrêter
make stop

# Nettoyer tout
make clean

# Tests
make test

# Migrations DB
make migrate
```

### Développement

```bash
# Backend seul (sans Docker)
cd iasted/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend React
cd /Users/okatech/ndjobi
npm run dev
```

### Production AWS

```bash
# Déployer
./infrastructure/scripts/deploy-aws.sh prod af-south-1

# Mettre à jour
./infrastructure/scripts/update-deployment.sh prod af-south-1

# Détruire (⚠️ ATTENTION)
./infrastructure/scripts/destroy-aws.sh prod af-south-1
```

### Kubernetes

```bash
# Voir pods
kubectl get pods -n iasted

# Logs temps réel
kubectl logs -f deployment/iasted-api -n iasted

# Port-forward local
kubectl port-forward -n iasted svc/iasted-api 8000:8000

# Shell dans pod
kubectl exec -it -n iasted <pod-name> -- /bin/bash

# Restart déploiement
kubectl rollout restart deployment/iasted-api -n iasted
```

---

## 🐛 Problèmes Fréquents

### Port 8000 déjà utilisé

```bash
lsof -ti:8000 | xargs kill -9
```

### Erreur connexion DB

```bash
docker-compose down -v
docker-compose up -d postgres
sleep 10
docker-compose up -d api
```

### Microphone non détecté

- Chrome/Edge : Autoriser dans Paramètres → Confidentialité → Micro
- Firefox : Autoriser dans Préférences → Vie privée → Permissions
- Safari : Préférences Système → Sécurité → Micro

### WebSocket timeout

Vérifier que le backend est lancé :
```bash
docker-compose ps
docker-compose logs api
```

---

## 📊 Monitoring

### Prometheus

```bash
# Local
open http://localhost:9090

# Requêtes utiles
llm_cost_dollars        # Coût total LLM
websocket_connections   # Connexions actives
cache_hits_total        # Cache hit rate
```

### Grafana

```bash
# Local
open http://localhost:3001  # admin/admin

# Production
kubectl port-forward -n iasted svc/grafana 3000:3000
open http://localhost:3000
```

---

## 🎯 Prochaines Étapes

1. ✅ **Tester localement** avec Docker Compose
2. ✅ **Intégrer** dans le frontend React Ndjobi
3. ✅ **Obtenir clés API** production (voir SETUP-API-KEYS.md)
4. ✅ **Déployer sur AWS** avec script automatisé
5. ✅ **Configurer DNS** (api.iasted.ndjobi.ga)
6. ✅ **Former les agents** à l'utilisation vocale
7. ✅ **Monitor** avec Prometheus/Grafana

---

## 📚 Documentation Complète

- **Backend** : `backend/README.md`
- **Clés API** : `SETUP-API-KEYS.md`
- **Frontend** : `INTEGRATION-FRONTEND-REACT.md`
- **Déploiement AWS** : `DEPLOYMENT-AWS-GUIDE.md`
- **Architecture** : `IMPLEMENTATION-COMPLETE.md`

---

## 🆘 Support

Problème ? Consulter dans l'ordre :

1. **Logs** : `docker-compose logs -f api`
2. **Health check** : `curl http://localhost:8000/health`
3. **Documentation** : Lire les guides ci-dessus
4. **Tests** : `make test` dans backend

---

**iAsted - Assistant Vocal pour Ndjobi** 🇬🇦  
**Prêt à démarrer en quelques minutes !** ⚡

