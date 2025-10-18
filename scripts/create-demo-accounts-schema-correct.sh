#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    CRÉATION DES COMPTES DÉMO SELON LE SCHÉMA FOURNI       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/create-demo-accounts-schema-correct.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur : fichier SQL non trouvé : $SQL_FILE"
    exit 1
fi

echo "📋 Fichier SQL : $SQL_FILE"
echo ""
echo "🔄 Exécution du script de création des comptes selon le schéma..."
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
    echo "║  Comptes créés selon le schéma fourni !                    ║"
    echo "║                                                            ║"
    echo "║  1️⃣  ADMIN (Président / Admin)                           ║"
    echo "║     📱 +241 77 888 001                                     ║"
    echo "║     🔐 PIN: 111111                                         ║"
    echo "║                                                            ║"
    echo "║  2️⃣  SOUS-ADMIN DGSS (Vue sectorielle)                   ║"
    echo "║     📱 +241 77 888 002                                     ║"
    echo "║     🔐 PIN: 222222                                         ║"
    echo "║                                                            ║"
    echo "║  3️⃣  SOUS-ADMIN DGR (Vue sectorielle)                    ║"
    echo "║     📱 +241 77 888 003                                     ║"
    echo "║     🔐 PIN: 333333                                         ║"
    echo "║                                                            ║"
    echo "║  4️⃣  AGENT (Ministères - Enquête)                       ║"
    echo "║     📱 +241 77 888 004                                     ║"
    echo "║     🔐 PIN: 444444                                         ║"
    echo "║                                                            ║"
    echo "║  5️⃣  USER (Citoyen - Signalement)                        ║"
    echo "║     📱 +241 77 888 005                                     ║"
    echo "║     🔐 PIN: 555555                                         ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "💡 Hiérarchie conforme au schéma fourni :"
    echo "   Super Admin → Admin → Sous-Admins (DGSS/DGR) → Agent → User"
    echo ""
else
    echo ""
    echo "❌ Erreur lors de la création des comptes"
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
