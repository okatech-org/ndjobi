#!/bin/bash

# Script de vérification et création du compte Super Admin
# Utilise le même format que les autres comptes : Numéro + PIN

echo "🔍 NDJOBI - Vérification du compte Super Admin"
echo "============================================================"

# Définir le fichier SQL
SQL_FILE="scripts/verify-super-admin-account.sql"

# Vérifier que le fichier existe
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur: Fichier $SQL_FILE non trouvé"
    exit 1
fi

echo "📋 Exécution du script de vérification..."
echo ""

# Exécuter le script SQL
if [ -n "$DATABASE_URL" ]; then
    echo "💡 Utilisation de la variable DATABASE_URL..."
    psql "$DATABASE_URL" -f "$SQL_FILE"
    RESULT=$?
else
    echo "💡 Utilisation de Supabase CLI..."
    cat "$SQL_FILE" | supabase db execute
    RESULT=$?
fi

echo ""
if [ $RESULT -eq 0 ]; then
    echo "✅ Vérification terminée avec succès!"
    echo ""
    echo "📱 Compte Super Admin:"
    echo "   Téléphone: +33661002616"
    echo "   Email: 33661002616@ndjobi.com"
    echo "   PIN: 999999"
    echo "   Rôle: super_admin"
    echo ""
    echo "🔐 Vous pouvez maintenant vous connecter avec:"
    echo "   - Numéro: +33661002616"
    echo "   - PIN: 999999"
else
    echo "❌ Erreur lors de la vérification"
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
