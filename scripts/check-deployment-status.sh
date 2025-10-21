#!/bin/bash

# Script de vérification du statut de déploiement NDJOBI
# Vérifie GitHub Actions et Lovable

echo "🔍 NDJOBI - Vérification Statut de Déploiement"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs
PROD_URL="https://ndjobi.lovable.app"
GITHUB_ACTIONS="https://github.com/okatech-org/ndjobi/actions"
LOVABLE_DASHBOARD="https://lovable.app/dashboard"

echo -e "${BLUE}📊 Vérification du commit...${NC}"
LAST_COMMIT=$(git log --oneline -1)
echo "   Dernier commit: $LAST_COMMIT"
echo ""

echo -e "${BLUE}🌐 Vérification de la production...${NC}"
echo "   URL: $PROD_URL"
echo ""

# Vérifier si le site répond
if curl -s --head --max-time 10 "$PROD_URL" | head -n 1 | grep "200" > /dev/null; then
    echo -e "   ${GREEN}✅ Site accessible${NC}"
    
    # Vérifier la page de connexion Président
    if curl -s --head --max-time 10 "$PROD_URL/connexion-president.html" | head -n 1 | grep "200" > /dev/null; then
        echo -e "   ${GREEN}✅ Page connexion Président déployée${NC}"
    else
        echo -e "   ${YELLOW}⏳ Page connexion Président en cours de déploiement...${NC}"
    fi
    
    # Vérifier le guide
    if curl -s --max-time 10 "$PROD_URL/GUIDE-CONNEXION-PRESIDENT.md" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Guide de connexion déployé${NC}"
    else
        echo -e "   ${YELLOW}⏳ Guide en cours de déploiement...${NC}"
    fi
else
    echo -e "   ${YELLOW}⏳ Site en cours de déploiement...${NC}"
    echo -e "   ${YELLOW}   Le déploiement prend généralement 5-8 minutes${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Liens utiles:${NC}"
echo ""
echo "   📱 Production:"
echo "      Site principal    : $PROD_URL"
echo "      Connexion Président: $PROD_URL/connexion-president.html"
echo "      Guide             : $PROD_URL/GUIDE-CONNEXION-PRESIDENT.md"
echo ""
echo "   🔧 Monitoring:"
echo "      GitHub Actions    : $GITHUB_ACTIONS"
echo "      Lovable Dashboard : $LOVABLE_DASHBOARD"
echo ""

echo -e "${BLUE}📋 Actions à faire:${NC}"
echo ""
echo "   1. Vérifier le workflow GitHub Actions:"
echo "      → Ouvrir: $GITHUB_ACTIONS"
echo ""
echo "   2. Vérifier le déploiement Lovable:"
echo "      → Ouvrir: $LOVABLE_DASHBOARD"
echo "      → Sélectionner le projet 'NDJOBI'"
echo "      → Vérifier l'onglet 'Deployments'"
echo ""
echo "   3. Tester la connexion Président en production:"
echo "      → Ouvrir: $PROD_URL/connexion-president.html"
echo "      → Téléphone: 24177888001"
echo "      → PIN: 111111"
echo ""

echo -e "${BLUE}⏱️  Temps de déploiement estimé:${NC}"
echo ""
echo "   • GitHub Actions : ~2-3 minutes"
echo "   • Lovable Build  : ~2-3 minutes"
echo "   • Propagation CDN: ~1-2 minutes"
echo "   • Total          : ~5-8 minutes"
echo ""

# Calculer le temps depuis le dernier push
if [ -f ".git/refs/heads/main" ]; then
    LAST_PUSH_TIME=$(git log -1 --format=%ct)
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_PUSH_TIME))
    MINUTES_SINCE_PUSH=$((TIME_DIFF / 60))
    
    if [ $MINUTES_SINCE_PUSH -lt 8 ]; then
        echo -e "${YELLOW}⏳ Déploiement en cours... (${MINUTES_SINCE_PUSH} min depuis le push)${NC}"
        echo "   Veuillez patienter encore $((8 - MINUTES_SINCE_PUSH)) minutes"
    else
        echo -e "${GREEN}✅ Le déploiement devrait être terminé${NC}"
        echo "   Si le site n'est pas accessible, vérifiez les logs GitHub Actions"
    fi
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Vérification terminée${NC}"
echo ""

