#!/bin/bash

# Script pour configurer le compte anonyme par défaut
# Exécute le script SQL de configuration

echo "🔧 Configuration du compte anonyme par défaut..."
echo "=================================================="

# Vérifier si Supabase CLI est disponible
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI trouvé"
    
    # Exécuter le script SQL
    echo "📝 Exécution du script de configuration..."
    cat "CONFIGURER-COMPTE-ANONYME.sql" | supabase db execute
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Configuration terminée avec succès !"
        echo ""
        echo "📋 Résumé de la configuration :"
        echo "   • Compte anonyme par défaut : 24177888009@ndjobi.com"
        echo "   • Téléphone : +24177888009"
        echo "   • PIN : 999999"
        echo "   • Rôle : user"
        echo "   • Table métadonnées anonymes créée"
        echo "   • Fonctions de gestion créées"
        echo ""
        echo "🎯 Le compte anonyme est maintenant configuré pour :"
        echo "   • Recevoir les signalements sans compte"
        echo "   • Stocker les métadonnées de l'appareil"
        echo "   • Fournir des statistiques anonymes"
        echo ""
        echo "💡 Pour utiliser le compte anonyme :"
        echo "   1. Les utilisateurs peuvent signaler sans créer de compte"
        echo "   2. Le système utilise automatiquement ce compte"
        echo "   3. Les métadonnées de l'appareil sont enregistrées"
        echo "   4. Les statistiques sont disponibles dans le dashboard Super Admin"
    else
        echo "❌ Erreur lors de la configuration"
        exit 1
    fi
else
    echo "⚠️  Supabase CLI non trouvé"
    echo "📝 Veuillez exécuter manuellement le script SQL :"
    echo "   CONFIGURER-COMPTE-ANONYME.sql"
    echo ""
    echo "🔗 Dans le SQL Editor de Supabase :"
    echo "   1. Ouvrez le dashboard Supabase"
    echo "   2. Allez dans SQL Editor"
    echo "   3. Copiez-collez le contenu de CONFIGURER-COMPTE-ANONYME.sql"
    echo "   4. Exécutez le script"
fi

echo ""
echo "✨ Configuration terminée !"
