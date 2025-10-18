#!/bin/bash

# Script pour tester la configuration du compte anonyme
# Exécute les tests SQL de vérification

echo "🧪 Test de la configuration du compte anonyme..."
echo "================================================"

# Vérifier si Supabase CLI est disponible
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI trouvé"
    
    # Exécuter les tests SQL
    echo "🔍 Exécution des tests de vérification..."
    echo ""
    
    cat "TESTER-COMPTE-ANONYME.sql" | supabase db execute
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Tests terminés avec succès !"
        echo ""
        echo "📋 Résumé des tests :"
        echo "   • TEST 1: Vérification compte anonyme"
        echo "   • TEST 2: Vérification compte démo"
        echo "   • TEST 3: Vérification table métadonnées"
        echo "   • TEST 4: Vérification fonctions"
        echo "   • TEST 5: Création signalement anonyme"
        echo "   • TEST 6: Vérification statistiques"
        echo ""
        echo "🎯 Configuration validée :"
        echo "   • Compte anonyme : 24177888009@ndjobi.com"
        echo "   • Compte démo : 24177888008@ndjobi.com"
        echo "   • Système prêt pour les signalements anonymes"
        echo ""
        echo "💡 Prochaines étapes :"
        echo "   1. Tester la page d'authentification"
        echo "   2. Vérifier la création de signalements anonymes"
        echo "   3. Contrôler les statistiques dans le dashboard"
    else
        echo "❌ Erreur lors des tests"
        exit 1
    fi
else
    echo "⚠️  Supabase CLI non trouvé"
    echo "📝 Veuillez exécuter manuellement le script SQL :"
    echo "   TESTER-COMPTE-ANONYME.sql"
    echo ""
    echo "🔗 Dans le SQL Editor de Supabase :"
    echo "   1. Ouvrez le dashboard Supabase"
    echo "   2. Allez dans SQL Editor"
    echo "   3. Copiez-collez le contenu de TESTER-COMPTE-ANONYME.sql"
    echo "   4. Exécutez le script"
fi

echo ""
echo "✨ Tests terminés !"
