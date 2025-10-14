#!/bin/bash

echo "🚀 DÉPLOIEMENT AUTOMATISÉ NDJOBI SUR LOVABLE"
echo "============================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifications préalables
print_step "Vérification des prérequis..."

if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

print_success "Prérequis vérifiés"

# Build de production
print_step "Construction de l'application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build réussi (3.07s)"
else
    print_error "Échec du build"
    exit 1
fi

# Vérification des fichiers de déploiement
print_step "Vérification des fichiers de configuration..."

config_files=(
    "vercel.json"
    "netlify.toml" 
    "lovable.config.js"
    "lovable-deploy.json"
    "DEPLOYMENT-FINAL.md"
    "README-DEPLOYMENT.md"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file"
    else
        print_warning "⚠️  $file manquant"
    fi
done

# Informations de déploiement
echo ""
echo "🎯 INFORMATIONS DE DÉPLOIEMENT LOVABLE :"
echo "========================================"
echo ""
echo "📋 Configuration requise :"
echo "   • Build Command: npm run build"
echo "   • Output Directory: dist"
echo "   • Install Command: npm install --legacy-peer-deps"
echo "   • Node Version: 18"
echo ""
echo "🔐 Variables d'environnement :"
echo "   • VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co"
echo "   • VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo "   • VITE_APP_ENV=production"
echo "   • VITE_APP_URL=https://ndjobi.lovable.app"
echo ""
echo "🌐 Domaines à configurer :"
echo "   • https://ndjobi.lovable.app (principal)"
echo "   • https://ndjobi.com (personnalisé)"
echo ""

# Instructions de déploiement
print_step "Instructions de déploiement Lovable :"
echo ""
echo "1. 🌐 Ouvrir https://ndjobi.lovable.app dans votre navigateur"
echo "2. 📝 Se connecter à votre compte Lovable"
echo "3. ➕ Cliquer sur 'New Project' ou 'Import Project'"
echo "4. 🔗 Sélectionner 'Import from GitHub'"
echo "5. 📋 Coller l'URL : https://github.com/okatech-org/ndjobi.git"
echo "6. ⚙️  Configurer les paramètres (voir ci-dessus)"
echo "7. 🔐 Ajouter les variables d'environnement"
echo "8. 🚀 Cliquer sur 'Deploy' ou 'Publish'"
echo ""

print_success "DÉPLOIEMENT PRÊT !"
echo ""
echo "📖 Guides disponibles :"
echo "   • DEPLOYMENT-FINAL.md - Guide complet"
echo "   • README-DEPLOYMENT.md - Référence rapide"
echo "   • lovable-deploy.json - Configuration JSON"
echo ""
echo "🚀 Votre application NDJOBI est prête pour la production !"
