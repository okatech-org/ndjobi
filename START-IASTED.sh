#!/bin/bash

###############################################################################
# Script de Démarrage Rapide iAsted
# Lance le backend + frontend et ouvre le dashboard admin
###############################################################################

set -e

echo "🚀 Démarrage de iAsted - Assistant Vocal Ndjobi"
echo "================================================"
echo ""

# Couleurs pour output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher avec couleur
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier qu'on est dans le bon dossier
if [ ! -d "iasted" ]; then
    print_error "Erreur : Exécutez ce script depuis /Users/okatech/ndjobi"
    exit 1
fi

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé"
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

# 1. Vérifier configuration backend
echo "🔍 Vérification configuration backend..."

if [ ! -f "iasted/backend/.env" ]; then
    print_warning "Fichier .env manquant, création depuis template..."
    cp iasted/backend/env.template iasted/backend/.env
    print_warning "⚠️  IMPORTANT : Configurez vos clés API dans iasted/backend/.env"
    print_warning "    Au minimum : GOOGLE_AI_API_KEY (gratuit)"
    print_warning "    Obtenir sur : https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Voulez-vous continuer sans clés API ? (oui/non) : " confirm
    if [ "$confirm" != "oui" ]; then
        echo "Éditez iasted/backend/.env puis relancez ce script"
        exit 0
    fi
fi

# 2. Démarrer Backend
echo ""
echo "🐳 Démarrage du backend iAsted (Docker Compose)..."
cd iasted/backend

docker-compose up -d

echo "⏳ Attente démarrage services (30s)..."
sleep 30

# Vérifier santé API
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    print_success "Backend iAsted opérationnel sur http://localhost:8000"
else
    print_warning "Backend démarré mais health check échoue"
    echo "Vérifiez les logs : cd iasted/backend && docker-compose logs api"
fi

cd ../..

# 3. Vérifier .env.local frontend
echo ""
echo "🔍 Vérification configuration frontend..."

if ! grep -q "VITE_IASTED_API_URL" .env.local 2>/dev/null; then
    print_warning "Variables iAsted manquantes dans .env.local, ajout..."
    echo "" >> .env.local
    echo "# === iASTED BACKEND API ===" >> .env.local
    echo "VITE_IASTED_API_URL=http://localhost:8000/api/v1" >> .env.local
    echo "VITE_IASTED_WS_URL=ws://localhost:8000/api/v1" >> .env.local
    print_success "Variables ajoutées"
else
    print_success "Variables iAsted déjà configurées"
fi

# 4. Démarrer Frontend (en arrière-plan avec logs dans fichier)
echo ""
echo "⚛️  Démarrage du frontend Ndjobi..."
npm run dev > /tmp/ndjobi-dev.log 2>&1 &
FRONTEND_PID=$!

echo "⏳ Attente démarrage Vite (10s)..."
sleep 10

if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend Ndjobi démarré (PID: $FRONTEND_PID)"
else
    print_error "Erreur démarrage frontend"
    exit 1
fi

# 5. Résumé
echo ""
echo "======================================"
echo "✅ iAsted est OPÉRATIONNEL !"
echo "======================================"
echo ""
echo "📡 Services démarrés :"
echo "  - Backend API     : http://localhost:8000"
echo "  - Documentation   : http://localhost:8000/api/v1/docs"
echo "  - Frontend Ndjobi : http://localhost:5173"
echo "  - Grafana         : http://localhost:3001 (admin/admin)"
echo "  - Prometheus      : http://localhost:9090"
echo "  - RabbitMQ        : http://localhost:15672 (guest/guest)"
echo ""
echo "🎯 Pour tester iAsted :"
echo "  1. Ouvrir : http://localhost:5173/dashboard/admin"
echo "  2. Se connecter (iasted@me.com / 011282)"
echo "  3. Cliquer sur l'onglet 'iAsted IA' 🧠"
echo "  4. Cliquer 'Activer iAsted'"
echo "  5. Parler dans le micro !"
echo ""
echo "📋 Commandes utiles :"
echo "  - Logs backend  : cd iasted/backend && docker-compose logs -f api"
echo "  - Logs frontend : tail -f /tmp/ndjobi-dev.log"
echo "  - Arrêter tout  : ./STOP-IASTED.sh"
echo ""
echo "📚 Documentation complète : /Users/okatech/ndjobi/iasted/README.md"
echo ""

# Ouvrir automatiquement le navigateur (optionnel)
read -p "Ouvrir le dashboard admin dans le navigateur ? (oui/non) : " open_browser
if [ "$open_browser" = "oui" ]; then
    sleep 2
    open http://localhost:5173/dashboard/admin
    print_success "Navigateur ouvert !"
fi

echo ""
print_success "Démarrage terminé avec succès ! 🎉"
echo ""

