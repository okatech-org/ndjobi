#!/bin/bash

# Script pour créer le compte Super Admin
# Exécute les scripts SQL de vérification et création

echo "🔧 Création du compte Super Admin..."
echo "===================================="

# Vérifier si Supabase CLI est disponible
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI trouvé"
    
    # Vérifier d'abord l'existence du compte
    echo "🔍 Vérification de l'existence du compte Super Admin..."
    echo ""
    
    cat "VERIFIER-SUPER-ADMIN-COMPTE.sql" | supabase db execute
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "📝 Création du compte Super Admin..."
        echo ""
        
        cat "CREER-SUPER-ADMIN-COMPTE.sql" | supabase db execute
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Compte Super Admin créé avec succès !"
            echo ""
            echo "📋 Informations du compte :"
            echo "   • Email: 33661002616@ndjobi.com"
            echo "   • Téléphone: +33661002616"
            echo "   • PIN: 999999"
            echo "   • Rôle: super_admin"
            echo ""
            echo "🎯 Le compte Super Admin est maintenant disponible pour :"
            echo "   • Authentification avec numéro + PIN"
            echo "   • Accès au dashboard Super Admin"
            echo "   • Gestion des utilisateurs et rôles"
            echo ""
            echo "💡 Testez maintenant la connexion Super Admin !"
        else
            echo "❌ Erreur lors de la création du compte Super Admin"
            exit 1
        fi
    else
        echo "❌ Erreur lors de la vérification"
        exit 1
    fi
else
    echo "⚠️  Supabase CLI non trouvé"
    echo "📝 Veuillez exécuter manuellement les scripts SQL :"
    echo "   1. VERIFIER-SUPER-ADMIN-COMPTE.sql"
    echo "   2. CREER-SUPER-ADMIN-COMPTE.sql"
    echo ""
    echo "🔗 Dans le SQL Editor de Supabase :"
    echo "   1. Ouvrez le dashboard Supabase"
    echo "   2. Allez dans SQL Editor"
    echo "   3. Copiez-collez le contenu des scripts"
    echo "   4. Exécutez les scripts"
fi

echo ""
echo "✨ Création terminée !"
