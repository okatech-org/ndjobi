#!/bin/bash

###############################################################################
# 🚀 SCRIPT DE DÉPLOIEMENT RAPIDE POUR TESTS iOS
# 
# Ce script automatise le build et le déploiement pour tester iAsted sur iOS
###############################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════"
echo "  🚀 DÉPLOIEMENT iASTED POUR TESTS iOS"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json introuvable${NC}"
    echo "Exécutez ce script depuis le répertoire racine du projet"
    exit 1
fi

# Afficher les options de déploiement
echo -e "${YELLOW}Choisissez une plateforme de déploiement:${NC}"
echo "1) Vercel (Recommandé - rapide)"
echo "2) Netlify"
echo "3) Build seulement (déploiement manuel)"
echo ""
read -p "Votre choix (1-3): " choice

# Étape 1: Build
echo ""
echo -e "${BLUE}📦 ÉTAPE 1/3: Build de l'application...${NC}"
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build réussi !${NC}"
else
    echo -e "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi

# Étape 2: Déploiement selon le choix
echo ""
echo -e "${BLUE}🚀 ÉTAPE 2/3: Déploiement...${NC}"
echo ""

case $choice in
    1)
        echo "Déploiement sur Vercel..."
        
        # Vérifier si Vercel CLI est installé
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}⚠️  Vercel CLI non installé. Installation...${NC}"
            npm i -g vercel
        fi
        
        # Déployer
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Déployé sur Vercel !${NC}"
        echo -e "${YELLOW}📱 Ouvrez l'URL sur votre iPhone Safari${NC}"
        ;;
        
    2)
        echo "Déploiement sur Netlify..."
        
        # Vérifier si Netlify CLI est installé
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}⚠️  Netlify CLI non installé. Installation...${NC}"
            npm i -g netlify-cli
        fi
        
        # Déployer
        netlify deploy --prod --dir=dist
        
        echo ""
        echo -e "${GREEN}✅ Déployé sur Netlify !${NC}"
        echo -e "${YELLOW}📱 Ouvrez l'URL sur votre iPhone Safari${NC}"
        ;;
        
    3)
        echo -e "${GREEN}✅ Build complété !${NC}"
        echo ""
        echo "Fichiers prêts dans: ./dist/"
        echo ""
        echo -e "${YELLOW}Déploiement manuel:${NC}"
        echo "1. Uploadez le contenu de ./dist/ sur votre serveur HTTPS"
        echo "2. Assurez-vous que le certificat SSL est valide"
        echo "3. Testez sur iPhone"
        ;;
        
    *)
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac

# Étape 3: Instructions de test
echo ""
echo -e "${BLUE}✅ ÉTAPE 3/3: Instructions de test iOS${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📱 CONFIGURATION iPhone:${NC}"
echo "1. Réglages > Safari > Avancé > Activer 'Inspecteur web'"
echo "2. Ouvrir Safari et aller sur l'URL de déploiement"
echo "3. Connecter iPhone au Mac via USB (pour debug)"
echo ""
echo -e "${YELLOW}🧪 TESTS CRITIQUES:${NC}"
echo "TEST 1: Double-cliquer sur le bouton iAsted"
echo "        → Vérifier que l'audio est AUDIBLE"
echo ""
echo "TEST 2: Parler dans le microphone"
echo "        → Vérifier la transcription"
echo ""
echo "TEST 3: Écouter la réponse d'iAsted"
echo "        → Vérifier que la voix est AUDIBLE"
echo ""
echo -e "${YELLOW}📊 LOGS À SURVEILLER (Console Safari Debug):${NC}"
echo "✅ '🔓 Initialisation audio optimisée iOS/mobile...'"
echo "✅ '✅ Audio Manager initialisé et débloqué'"
echo "✅ '📱 Format MediaRecorder détecté: audio/mp4'"
echo "✅ '✅ Audio joué avec succès'"
echo ""
echo -e "${YELLOW}📚 DOCUMENTATION COMPLÈTE:${NC}"
echo "→ DEPLOIEMENT-TEST-IOS.md"
echo "→ TESTS-IASTED-IOS-MOBILE.txt"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🎉 Prêt pour les tests iOS ! Bonne chance ! 🚀${NC}"
echo ""

# Afficher le checklist
echo -e "${BLUE}📋 CHECKLIST DE TEST:${NC}"
echo ""
echo "[ ] URL en HTTPS accessible"
echo "[ ] Certificat SSL valide"
echo "[ ] iPhone en mode normal (pas silencieux)"
echo "[ ] Volume iPhone au maximum"
echo "[ ] Permission microphone accordée"
echo "[ ] Double-clic → Audio audible"
echo "[ ] Enregistrement vocal → OK"
echo "[ ] Réponse vocale → OK"
echo ""
echo -e "${YELLOW}💡 Conseil: Commencez par TEST 1 (double-clic audio)${NC}"
echo "   C'est le test le plus critique pour iOS !"
echo ""

