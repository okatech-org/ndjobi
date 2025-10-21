#!/bin/bash

# Script d'installation de la configuration Super Admin
# Date: 21 Octobre 2025

echo "🚀 Installation de la configuration Super Admin..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI n'est pas installé${NC}"
    echo "Installation:"
    echo "  brew install supabase/tap/supabase"
    echo "  ou"
    echo "  npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI détecté${NC}"

# Vérifier si le projet est linké
if [ ! -f ".supabase/config.toml" ] && [ ! -f "supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Projet non linké à Supabase${NC}"
    echo ""
    echo "Pour lier votre projet:"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Ou si vous utilisez un projet local:"
    echo "  supabase start"
    echo ""
    read -p "Voulez-vous appliquer la migration manuellement? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}📋 Instructions pour installation manuelle:${NC}"
        echo ""
        echo "1. Connectez-vous à votre dashboard Supabase:"
        echo "   https://supabase.com/dashboard"
        echo ""
        echo "2. Allez dans SQL Editor"
        echo ""
        echo "3. Copiez et exécutez le contenu de:"
        echo "   supabase/migrations/20251021000000_super_admin_config_tables.sql"
        echo ""
        echo "4. Vérifiez que les tables sont créées:"
        echo "   - api_keys"
        echo "   - connected_apps"
        echo "   - mcp_configs"
        echo "   - ai_agents"
        echo ""
        exit 0
    else
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ Configuration Supabase détectée${NC}"
echo ""

# Appliquer les migrations
echo "📦 Application de la migration..."
echo ""

npx supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migration appliquée avec succès!${NC}"
    echo ""
    echo "🎉 Configuration Super Admin installée!"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "  1. Vérifiez les tables dans votre dashboard Supabase"
    echo "  2. Lancez le serveur: npm run dev"
    echo "  3. Testez: http://localhost:8080/dashboard/super-admin/config"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erreur lors de l'application de la migration${NC}"
    echo ""
    echo "Solutions possibles:"
    echo "  1. Vérifiez votre connexion Supabase"
    echo "  2. Assurez-vous que le projet est correctement linké"
    echo "  3. Appliquez la migration manuellement (voir instructions ci-dessus)"
    echo ""
    exit 1
fi

