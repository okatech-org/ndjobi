#!/bin/bash

# =====================================================
# Script de Résolution - Authentification Super Admin
# =====================================================

echo ""
echo "🔧 Résolution du problème d'authentification Super Admin"
echo "================================================"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "${BLUE}➜${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

# 1. Vérifier que nous sommes dans le bon répertoire
if [ ! -f "vite.config.ts" ]; then
    error "Erreur: Ce script doit être exécuté depuis la racine du projet NDJOBI"
    exit 1
fi

step "Vérification de l'environnement..."

# 2. Vérifier que les fichiers modifiés existent
if [ -f "vite.config.ts" ]; then
    success "vite.config.ts trouvé"
else
    error "vite.config.ts manquant"
    exit 1
fi

if [ -f "src/hooks/useAuth.ts" ]; then
    success "useAuth.ts trouvé"
else
    error "useAuth.ts manquant"
    exit 1
fi

if [ -f "src/pages/dashboards/SuperAdminDashboard.tsx" ]; then
    success "SuperAdminDashboard.tsx trouvé"
else
    error "SuperAdminDashboard.tsx manquant"
    exit 1
fi

echo ""
step "Les fichiers ont été optimisés:"
echo "  • vite.config.ts - Variables d'environnement exposées"
echo "  • useAuth.ts - Optimisations et réduction des logs"
echo "  • SuperAdminDashboard.tsx - Réduction des re-renders"
echo ""

# 3. Proposer les options
echo "================================================"
echo "📋 OPTIONS DE RÉSOLUTION"
echo "================================================"
echo ""
echo "1️⃣  Créer le compte Super Admin via l'API (automatique)"
echo "2️⃣  Afficher les instructions pour création manuelle"
echo "3️⃣  Redémarrer le serveur de développement"
echo "4️⃣  Afficher le guide complet (FIX-SUPER-ADMIN-AUTH.md)"
echo "5️⃣  Quitter"
echo ""

read -p "Choisissez une option (1-5): " choice

case $choice in
    1)
        echo ""
        step "Création automatique du compte Super Admin..."
        echo ""
        
        if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
            warning "Variable SUPABASE_SERVICE_ROLE_KEY non définie"
            echo ""
            echo "Pour obtenir cette clé:"
            echo "  1. Aller sur: https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api"
            echo "  2. Copier la clé 'service_role key' (secret)"
            echo "  3. Exporter: export SUPABASE_SERVICE_ROLE_KEY=\"votre_clé_ici\""
            echo ""
            read -p "Appuyez sur Entrée après avoir exporté la clé..."
        fi
        
        # Exécuter le script Node.js
        node scripts/create-super-admin-via-api.js
        ;;
    
    2)
        echo ""
        echo "================================================"
        echo "📝 INSTRUCTIONS MANUELLES"
        echo "================================================"
        echo ""
        echo "1. Accéder à l'interface Supabase:"
        echo "   https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/auth/users"
        echo ""
        echo "2. Cliquer sur 'Add user' → 'Create new user'"
        echo ""
        echo "3. Entrer les informations:"
        echo "   • Email: superadmin@ndjobi.com"
        echo "   • Password: ChangeMeStrong!123"
        echo "   • ✅ Cocher 'Auto Confirm User'"
        echo ""
        echo "4. Aller dans SQL Editor:"
        echo "   https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/sql"
        echo ""
        echo "5. Copier et exécuter le script:"
        echo "   scripts/create-super-admin-final.sql"
        echo ""
        echo "6. Vérifier le message de succès"
        echo ""
        ;;
    
    3)
        echo ""
        step "Redémarrage du serveur de développement..."
        echo ""
        
        # Arrêter les processus npm run dev existants
        pkill -f "vite" 2>/dev/null
        sleep 2
        
        success "Serveur arrêté"
        echo ""
        echo "Pour redémarrer le serveur, exécutez:"
        echo "  npm run dev"
        echo ""
        ;;
    
    4)
        echo ""
        if [ -f "FIX-SUPER-ADMIN-AUTH.md" ]; then
            cat FIX-SUPER-ADMIN-AUTH.md
        else
            error "Guide FIX-SUPER-ADMIN-AUTH.md non trouvé"
        fi
        ;;
    
    5)
        echo ""
        echo "Au revoir! 👋"
        exit 0
        ;;
    
    *)
        error "Option invalide"
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "✅ PROCHAINES ÉTAPES"
echo "================================================"
echo ""
echo "1. Si le compte n'est pas encore créé, créez-le"
echo "2. Redémarrez le serveur: npm run dev"
echo "3. Testez la connexion: http://localhost:5173/auth/super-admin"
echo "4. Utilisez le code OTP: 999999"
echo ""
echo "📖 Guide complet: FIX-SUPER-ADMIN-AUTH.md"
echo ""

success "Script terminé avec succès!"
echo ""

