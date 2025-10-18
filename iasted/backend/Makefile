.PHONY: help install dev build test clean deploy

help:
	@echo "📘 iAsted Backend - Commandes disponibles:"
	@echo ""
	@echo "  make install       - Installer les dépendances"
	@echo "  make dev           - Lancer en mode développement (Docker)"
	@echo "  make dev-local     - Lancer en mode développement (local)"
	@echo "  make build         - Build l'image Docker"
	@echo "  make test          - Lancer les tests"
	@echo "  make lint          - Vérifier le code (black, flake8)"
	@echo "  make format        - Formater le code"
	@echo "  make clean         - Nettoyer les fichiers temporaires"
	@echo "  make migrate       - Appliquer les migrations DB"
	@echo "  make logs          - Voir les logs Docker"
	@echo "  make deploy        - Déployer en production (K8s)"
	@echo ""

install:
	@echo "📦 Installation des dépendances..."
	pip install --upgrade pip
	pip install -r requirements.txt

dev:
	@echo "🚀 Démarrage en mode développement (Docker)..."
	docker-compose up -d
	@echo "✅ API disponible sur http://localhost:8000"
	@echo "📊 Grafana: http://localhost:3001 (admin/admin)"
	@echo "🐰 RabbitMQ: http://localhost:15672 (guest/guest)"

dev-local:
	@echo "🚀 Démarrage en mode développement (local)..."
	uvicorn app.main:app --reload --port 8000

build:
	@echo "🔨 Build de l'image Docker..."
	docker build -t iasted-api:latest --target production .

test:
	@echo "🧪 Lancement des tests..."
	pytest tests/ -v --cov=app --cov-report=html
	@echo "✅ Rapport de couverture: htmlcov/index.html"

test-watch:
	@echo "🧪 Tests en mode watch..."
	pytest-watch tests/ -v

lint:
	@echo "🔍 Vérification du code..."
	flake8 app/ tests/ --max-line-length=100
	mypy app/

format:
	@echo "✨ Formatage du code..."
	black app/ tests/
	isort app/ tests/

clean:
	@echo "🧹 Nettoyage..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache .coverage htmlcov/

migrate:
	@echo "🗄️ Application des migrations..."
	alembic upgrade head

migrate-create:
	@echo "📝 Création d'une nouvelle migration..."
	@read -p "Description de la migration: " desc; \
	alembic revision --autogenerate -m "$$desc"

db-reset:
	@echo "⚠️ Réinitialisation de la base de données..."
	@read -p "Confirmer la réinitialisation (yes/no)? " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		alembic downgrade base; \
		alembic upgrade head; \
		echo "✅ Base réinitialisée"; \
	fi

logs:
	@echo "📜 Logs Docker..."
	docker-compose logs -f api

shell:
	@echo "🐚 Shell interactif..."
	docker-compose exec api /bin/bash

redis-cli:
	@echo "💾 Redis CLI..."
	docker-compose exec redis redis-cli

psql:
	@echo "🐘 PostgreSQL CLI..."
	docker-compose exec postgres psql -U iasted -d iasted_db

stop:
	@echo "🛑 Arrêt des services..."
	docker-compose down

restart:
	@echo "🔄 Redémarrage..."
	docker-compose restart api

deploy-terraform:
	@echo "☁️ Déploiement infrastructure Terraform..."
	cd ../infrastructure/terraform && \
	terraform init && \
	terraform apply

deploy-k8s:
	@echo "☸️ Déploiement Kubernetes..."
	kubectl apply -f ../infrastructure/kubernetes/base/
	kubectl rollout status deployment/iasted-api -n iasted

deploy: deploy-terraform deploy-k8s
	@echo "✅ Déploiement complet terminé"

status:
	@echo "📊 Status des services..."
	docker-compose ps

health:
	@echo "🏥 Vérification santé API..."
	curl -s http://localhost:8000/health | jq

metrics:
	@echo "📈 Métriques Prometheus..."
	curl -s http://localhost:8000/metrics | head -20

