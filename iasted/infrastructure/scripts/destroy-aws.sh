#!/bin/bash

###############################################################################
# Script de Destruction Infrastructure AWS pour iAsted
# Supprime proprement Kubernetes + Terraform
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"
K8S_DIR="$SCRIPT_DIR/../kubernetes"

ENVIRONMENT="${1:-dev}"
REGION="${2:-af-south-1}"

echo "⚠️  Destruction Infrastructure iAsted sur AWS"
echo "=============================================="
echo "Environnement: $ENVIRONMENT"
echo "Région: $REGION"
echo ""
echo "⚠️  ATTENTION: Cette action est IRRÉVERSIBLE !"
echo ""

read -p "Confirmer la destruction complète ? (tapez 'DELETE'): " confirm
if [ "$confirm" != "DELETE" ]; then
    echo "❌ Destruction annulée"
    exit 1
fi

destroy_kubernetes() {
    echo ""
    echo "☸️  Suppression Kubernetes..."
    echo "=============================="
    
    cd "$K8S_DIR/base"
    
    echo "🗑️  Suppression manifestes..."
    kubectl delete -f ingress.yaml --ignore-not-found=true
    kubectl delete -f hpa.yaml --ignore-not-found=true
    kubectl delete -f deployment.yaml --ignore-not-found=true
    kubectl delete namespace iasted --ignore-not-found=true
    
    echo "✅ Ressources Kubernetes supprimées"
}

destroy_terraform() {
    echo ""
    echo "☁️  Destruction Infrastructure Terraform..."
    echo "==========================================="
    
    cd "$TERRAFORM_DIR"
    
    echo "🔧 Terraform destroy..."
    terraform destroy -auto-approve
    
    echo "✅ Infrastructure AWS supprimée"
}

cleanup_local() {
    echo ""
    echo "🧹 Nettoyage local..."
    echo "====================="
    
    rm -f "$TERRAFORM_DIR/terraform.tfstate"
    rm -f "$TERRAFORM_DIR/terraform.tfstate.backup"
    rm -f "$TERRAFORM_DIR/tfplan"
    
    echo "✅ Fichiers locaux nettoyés"
}

main() {
    destroy_kubernetes
    destroy_terraform
    cleanup_local
    
    echo ""
    echo "✅ Destruction terminée !"
    echo ""
    echo "📋 Ressources supprimées:"
    echo "  - Cluster EKS"
    echo "  - Base PostgreSQL RDS"
    echo "  - Cluster Redis ElastiCache"
    echo "  - Buckets S3"
    echo "  - VPC et sous-réseaux"
    echo ""
}

main "$@"

