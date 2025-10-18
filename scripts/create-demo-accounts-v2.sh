#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    CRÉATION DES COMPTES DÉMO NDJOBI v2.0                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/create-demo-accounts-v2.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur : fichier SQL non trouvé : $SQL_FILE"
    exit 1
fi

echo "📋 Fichier SQL : $SQL_FILE"
echo ""
echo "🔄 Exécution du script de création des comptes..."
echo ""

if [ -n "$DATABASE_URL" ]; then
    psql "$DATABASE_URL" -f "$SQL_FILE"
    RESULT=$?
else
    echo "💡 Utilisation de Supabase CLI..."
    cat "$SQL_FILE" | supabase db execute
    RESULT=$?
fi

if [ $RESULT -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                   ✅ SUCCÈS !                              ║"
    echo "╠════════════════════════════════════════════════════════════╣"
    echo "║                                                            ║"
    echo "║  Comptes créés avec succès !                               ║"
    echo "║                                                            ║"
    echo "║  1️⃣  ADMIN (Protocole d'État)                             ║"
    echo "║     📱 +241 77 888 001                                     ║"
    echo "║     🔐 PIN: 111111                                         ║"
    echo "║                                                            ║"
    echo "║  2️⃣  AGENT (DGSS)                                         ║"
    echo "║     📱 +241 77 888 002                                     ║"
    echo "║     🔐 PIN: 222222                                         ║"
    echo "║                                                            ║"
    echo "║  3️⃣  USER (Citoyen)                                       ║"
    echo "║     📱 +241 77 888 003                                     ║"
    echo "║     🔐 PIN: 333333                                         ║"
    echo "║                                                            ║"
    echo "║  4️⃣  SOUS-ADMIN (Sous-Administrateur)                     ║"
    echo "║     📱 +241 77 888 004                                     ║"
    echo "║     🔐 PIN: 444444                                         ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "💡 Pour vous connecter, utilisez le numéro de téléphone et le PIN"
    echo ""
else
    echo ""
    echo "❌ Erreur lors de la création des comptes"
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi

