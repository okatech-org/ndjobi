#!/bin/bash

###############################################################################
# Script de Déploiement Complet AWS pour iAsted
# Provisionne l'infrastructure Terraform + Déploie sur Kubernetes
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"
K8S_DIR="$SCRIPT_DIR/../kubernetes"

ENVIRONMENT="${1:-dev}"
REGION="${2:-af-south-1}"

echo "🚀 Déploiement iAsted sur AWS"
echo "================================"
echo "Environnement: $ENVIRONMENT"
echo "Région: $REGION"
echo ""

check_prerequisites() {
    echo "📋 Vérification des prérequis..."
    
    command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform non installé"; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl non installé"; exit 1; }
    command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI non installé"; exit 1; }
    command -v docker >/dev/null 2>&1 || { echo "❌ Docker non installé"; exit 1; }
    
    aws sts get-caller-identity >/dev/null 2>&1 || { 
        echo "❌ Credentials AWS invalides ou expirées"
        echo "Exécutez: aws configure"
        exit 1
    }
    
    echo "✅ Tous les prérequis sont satisfaits"
}

deploy_terraform() {
    echo ""
    echo "☁️ Déploiement Infrastructure Terraform..."
    echo "==========================================="
    
    cd "$TERRAFORM_DIR"
    
    if [ ! -f "terraform.tfvars" ]; then
        echo "⚠️  terraform.tfvars non trouvé, création..."
        cat > terraform.tfvars <<EOF
environment = "$ENVIRONMENT"
aws_region = "$REGION"
project_name = "iasted"

# Base de données
db_username = "iasted_admin"
db_password = "CHANGE_THIS_PASSWORD_$(openssl rand -base64 12)"

# EKS Configuration
eks_node_instance_types = ["t3.medium"]
eks_node_min_size = 3
eks_node_max_size = 10
eks_node_desired_size = 3

# RDS Configuration
rds_instance_class = "db.t3.medium"
rds_allocated_storage = 100
rds_max_allocated_storage = 500

# Redis Configuration
redis_node_type = "cache.t3.micro"
EOF
        echo "✅ terraform.tfvars créé (personnalisez si nécessaire)"
    fi
    
    echo "🔧 Terraform init..."
    terraform init
    
    echo "📋 Terraform plan..."
    terraform plan -out=tfplan
    
    read -p "Continuer avec le déploiement ? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "❌ Déploiement annulé"
        exit 1
    fi
    
    echo "🚀 Terraform apply..."
    terraform apply tfplan
    
    echo "✅ Infrastructure déployée"
    
    export EKS_CLUSTER_NAME=$(terraform output -raw eks_cluster_name)
    export RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
    export REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
    export S3_ARTIFACTS_BUCKET=$(terraform output -raw s3_artifacts_bucket)
    
    echo ""
    echo "📊 Outputs Terraform:"
    echo "  - EKS Cluster: $EKS_CLUSTER_NAME"
    echo "  - RDS Endpoint: $RDS_ENDPOINT"
    echo "  - Redis Endpoint: $REDIS_ENDPOINT"
    echo "  - S3 Artifacts: $S3_ARTIFACTS_BUCKET"
}

configure_kubectl() {
    echo ""
    echo "⚙️  Configuration kubectl..."
    echo "============================"
    
    aws eks update-kubeconfig \
        --region "$REGION" \
        --name "$EKS_CLUSTER_NAME"
    
    kubectl cluster-info
    
    echo "✅ kubectl configuré"
}

build_and_push_docker() {
    echo ""
    echo "🐳 Build & Push Image Docker..."
    echo "==============================="
    
    cd "$PROJECT_ROOT/backend"
    
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REPOSITORY="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/iasted-api"
    
    echo "📦 Création ECR repository..."
    aws ecr create-repository --repository-name iasted-api --region "$REGION" || true
    
    echo "🔐 Login ECR..."
    aws ecr get-login-password --region "$REGION" | \
        docker login --username AWS --password-stdin "$ECR_REPOSITORY"
    
    echo "🔨 Build image Docker..."
    docker build -t iasted-api:latest --target production .
    
    echo "🏷️  Tag image..."
    docker tag iasted-api:latest "$ECR_REPOSITORY:latest"
    docker tag iasted-api:latest "$ECR_REPOSITORY:$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"
    
    echo "⬆️  Push vers ECR..."
    docker push "$ECR_REPOSITORY:latest"
    docker push "$ECR_REPOSITORY:$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"
    
    export DOCKER_IMAGE="$ECR_REPOSITORY:latest"
    
    echo "✅ Image Docker publiée: $DOCKER_IMAGE"
}

create_kubernetes_secrets() {
    echo ""
    echo "🔐 Création des Secrets Kubernetes..."
    echo "====================================="
    
    kubectl create namespace iasted || true
    
    read -sp "Deepgram API Key: " DEEPGRAM_API_KEY
    echo ""
    read -sp "OpenAI API Key: " OPENAI_API_KEY
    echo ""
    read -sp "Anthropic API Key: " ANTHROPIC_API_KEY
    echo ""
    read -sp "Google AI API Key: " GOOGLE_AI_API_KEY
    echo ""
    
    DATABASE_URL="postgresql+asyncpg://iasted_admin:$DB_PASSWORD@$RDS_ENDPOINT:5432/iasted"
    REDIS_URL="redis://$REDIS_ENDPOINT:6379/0"
    
    kubectl create secret generic iasted-secrets \
        --namespace=iasted \
        --from-literal=database-url="$DATABASE_URL" \
        --from-literal=redis-url="$REDIS_URL" \
        --from-literal=deepgram-api-key="$DEEPGRAM_API_KEY" \
        --from-literal=openai-api-key="$OPENAI_API_KEY" \
        --from-literal=anthropic-api-key="$ANTHROPIC_API_KEY" \
        --from-literal=google-ai-api-key="$GOOGLE_AI_API_KEY" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    echo "✅ Secrets créés"
}

deploy_kubernetes() {
    echo ""
    echo "☸️  Déploiement Kubernetes..."
    echo "============================="
    
    cd "$K8S_DIR/base"
    
    sed -i.bak "s|image: iasted-api:latest|image: $DOCKER_IMAGE|g" deployment.yaml
    
    kubectl apply -f namespace.yaml
    kubectl apply -f deployment.yaml
    kubectl apply -f hpa.yaml
    kubectl apply -f ingress.yaml
    
    mv deployment.yaml.bak deployment.yaml
    
    echo "✅ Manifestes Kubernetes appliqués"
    
    echo ""
    echo "⏳ Attente du déploiement..."
    kubectl rollout status deployment/iasted-api -n iasted --timeout=10m
    
    echo "✅ Déploiement terminé"
}

run_migrations() {
    echo ""
    echo "🗄️  Exécution des migrations DB..."
    echo "==================================="
    
    POD=$(kubectl get pods -n iasted -l app=iasted-api -o jsonpath='{.items[0].metadata.name}')
    
    echo "📦 Migration sur pod: $POD"
    kubectl exec -n iasted "$POD" -- alembic upgrade head
    
    echo "✅ Migrations appliquées"
}

display_summary() {
    echo ""
    echo "🎉 Déploiement Terminé avec Succès !"
    echo "====================================="
    echo ""
    echo "📊 Informations de Déploiement:"
    echo "  - Environnement: $ENVIRONMENT"
    echo "  - Région AWS: $REGION"
    echo "  - Cluster EKS: $EKS_CLUSTER_NAME"
    echo "  - Image Docker: $DOCKER_IMAGE"
    echo ""
    echo "🔗 Endpoints:"
    echo "  - API: https://api.iasted.ndjobi.ga"
    echo "  - WebSocket: wss://api.iasted.ndjobi.ga/api/v1/voice/ws"
    echo ""
    echo "📋 Commandes Utiles:"
    echo "  - Voir pods: kubectl get pods -n iasted"
    echo "  - Logs API: kubectl logs -f deployment/iasted-api -n iasted"
    echo "  - Describe HPA: kubectl describe hpa iasted-api-hpa -n iasted"
    echo "  - Port-forward: kubectl port-forward -n iasted svc/iasted-api 8000:8000"
    echo ""
    echo "🧪 Tests:"
    echo "  curl https://api.iasted.ndjobi.ga/health"
    echo ""
}

main() {
    echo "🔍 Mode: Déploiement Complet AWS"
    
    check_prerequisites
    deploy_terraform
    configure_kubectl
    build_and_push_docker
    create_kubernetes_secrets
    deploy_kubernetes
    run_migrations
    display_summary
    
    echo "✅ Script terminé avec succès !"
}

main "$@"

