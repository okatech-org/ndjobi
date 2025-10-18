#!/bin/bash

echo "🔍 Vérification des comptes démo dans la base de données..."
echo "============================================================="

# Fichier SQL de test
SQL_FILE="./VERIFIER-TOUS-LES-COMPTES.sql"

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI n'est pas installé."
    exit 1
fi

echo "✅ Supabase CLI trouvé"
echo "📝 Exécution de la vérification..."

cat "$SQL_FILE" | supabase db execute

if [ $? -eq 0 ]; then
    echo "✅ Vérification terminée avec succès !"
else
    echo "❌ Erreur lors de la vérification."
    exit 1
fi
