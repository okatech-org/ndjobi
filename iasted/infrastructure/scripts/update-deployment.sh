#!/bin/bash

###############################################################################
# Script de Mise à Jour Déploiement Kubernetes
# Deploy rapide d'une nouvelle version sans toucher Terraform
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

ENVIRONMENT="${1:-dev}"
REGION="${2:-af-south-1}"

echo "🔄 Mise à Jour Déploiement iAsted"
echo "=================================="
echo ""

# Récupérer le cluster EKS
EKS_CLUSTER_NAME="iasted-cluster-$ENVIRONMENT"

# Configure kubectl
aws eks update-kubeconfig --region "$REGION" --name "$EKS_CLUSTER_NAME"

# Build & Push nouvelle image
cd "$PROJECT_ROOT/backend"

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/iasted-api"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
NEW_TAG="$ENVIRONMENT-$TIMESTAMP"

echo "🔨 Build nouvelle image..."
docker build -t iasted-api:latest --target production .
docker tag iasted-api:latest "$ECR_REPOSITORY:$NEW_TAG"
docker tag iasted-api:latest "$ECR_REPOSITORY:latest"

echo "🔐 Login ECR..."
aws ecr get-login-password --region "$REGION" | \
    docker login --username AWS --password-stdin "$ECR_REPOSITORY"

echo "⬆️  Push vers ECR..."
docker push "$ECR_REPOSITORY:$NEW_TAG"
docker push "$ECR_REPOSITORY:latest"

echo "☸️  Mise à jour Kubernetes..."
kubectl set image deployment/iasted-api \
    api="$ECR_REPOSITORY:$NEW_TAG" \
    -n iasted

echo "⏳ Attente rollout..."
kubectl rollout status deployment/iasted-api -n iasted --timeout=10m

echo ""
echo "✅ Déploiement mis à jour avec succès !"
echo "  - Nouvelle image: $ECR_REPOSITORY:$NEW_TAG"
echo ""
echo "📋 Vérifications:"
kubectl get pods -n iasted
echo ""
echo "📊 Status:"
kubectl rollout history deployment/iasted-api -n iasted

