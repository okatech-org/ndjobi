#!/bin/bash

# Script de vérification rapide du compte Président
# Usage: ./scripts/quick-check-president.sh

echo "🔍 NDJOBI - Vérification Compte Président"
echo "=========================================="
echo ""

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Exécutez ce script depuis la racine du projet NDJOBI"
    exit 1
fi

echo "✅ Répertoire du projet détecté"
echo ""

# Informations du compte
echo "📋 INFORMATIONS DU COMPTE PRÉSIDENT"
echo "-----------------------------------"
echo "📞 Téléphone   : 24177888001"
echo "🔐 PIN         : 111111"
echo "📧 Email       : 24177888001@ndjobi.com"
echo "👤 Rôle        : admin"
echo "🏢 Organisation: Présidence de la République"
echo ""

# Instructions de connexion
echo "🚀 COMMENT SE CONNECTER"
echo "----------------------"
echo "1. Ouvrez votre navigateur"
echo "2. Allez sur : http://localhost:8080/auth"
echo "   OU utilisez : http://localhost:8080/connexion-president.html"
echo ""
echo "3. Dans le formulaire de connexion :"
echo "   - Numéro : 24177888001"
echo "   - PIN    : 111111"
echo ""
echo "4. Cliquez sur 'Se connecter'"
echo "5. Vous serez redirigé vers /admin avec l'interface hybride"
echo ""

# Vérifier si le serveur dev tourne
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Serveur de développement actif sur le port 8080"
    echo ""
    echo "🌐 Liens rapides :"
    echo "   - Connexion standard : http://localhost:8080/auth"
    echo "   - Connexion Président: http://localhost:8080/connexion-president.html"
    echo "   - Guide complet      : http://localhost:8080/GUIDE-CONNEXION-PRESIDENT.md"
    echo ""
else
    echo "⚠️  Serveur de développement non détecté"
    echo ""
    echo "💡 Pour démarrer le serveur :"
    echo "   npm run dev"
    echo ""
fi

# Options supplémentaires
echo "🛠️  ACTIONS DISPONIBLES"
echo "----------------------"
echo "1. Vérifier si le compte existe dans Supabase :"
echo "   export SUPABASE_SERVICE_ROLE_KEY='votre_clé'"
echo "   npx ts-node scripts/verify-president-account.ts"
echo ""
echo "2. Créer tous les comptes de production :"
echo "   export SUPABASE_SERVICE_ROLE_KEY='votre_clé'"
echo "   npx ts-node scripts/create-production-accounts.ts"
echo ""
echo "3. Voir le guide complet :"
echo "   cat GUIDE-CONNEXION-PRESIDENT.md"
echo ""

# Check si le fichier de guide existe
if [ -f "GUIDE-CONNEXION-PRESIDENT.md" ]; then
    echo "✅ Guide de connexion disponible"
else
    echo "⚠️  Guide de connexion non trouvé"
fi

# Check si la page HTML existe
if [ -f "public/connexion-president.html" ]; then
    echo "✅ Page de connexion rapide disponible"
else
    echo "⚠️  Page de connexion rapide non trouvée"
fi

echo ""
echo "=========================================="
echo "✅ Vérification terminée"
echo ""
echo "💡 Conseil : Si vous n'arrivez pas à vous connecter,"
echo "   consultez le guide complet : GUIDE-CONNEXION-PRESIDENT.md"
echo ""

