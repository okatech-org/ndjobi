#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    CRÉATION DES COMPTES SELON LA LOGIQUE COMPLÈTE        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/create-demo-accounts-logique-complete.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur : fichier SQL non trouvé : $SQL_FILE"
    exit 1
fi

echo "📋 Fichier SQL : $SQL_FILE"
echo ""
echo "🔄 Exécution du script de création des comptes selon la logique complète..."
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
    echo "║  Comptes créés selon la logique complète !                 ║"
    echo "║                                                            ║"
    echo "║  🎯 HIÉRARCHIE DES RÔLES ET PERMISSIONS                   ║"
    echo "║                                                            ║"
    echo "║  1️⃣  SUPER ADMIN (Contrôle total)                         ║"
    echo "║     📱 +33 6 61 00 26 16 / PIN: 999999                    ║"
    echo "║                                                            ║"
    echo "║  2️⃣  ADMIN (Président / Administrateur)                   ║"
    echo "║     📱 +241 77 888 001 / PIN: 111111                      ║"
    echo "║                                                            ║"
    echo "║  3️⃣  SOUS-ADMIN DGSS (Vue sectorielle)                   ║"
    echo "║     📱 +241 77 888 002 / PIN: 222222                      ║"
    echo "║                                                            ║"
    echo "║  4️⃣  SOUS-ADMIN DGR (Vue sectorielle)                    ║"
    echo "║     📱 +241 77 888 003 / PIN: 333333                      ║"
    echo "║                                                            ║"
    echo "║  5️⃣  AGENT DÉFENSE (Enquêtes opérationnelles)            ║"
    echo "║     📱 +241 77 888 004 / PIN: 444444                      ║"
    echo "║                                                            ║"
    echo "║  6️⃣  AGENT JUSTICE (Enquêtes opérationnelles)            ║"
    echo "║     📱 +241 77 888 005 / PIN: 555555                      ║"
    echo "║                                                            ║"
    echo "║  7️⃣  AGENT LUTTE ANTI-CORRUPTION                         ║"
    echo "║     📱 +241 77 888 006 / PIN: 666666                      ║"
    echo "║                                                            ║"
    echo "║  8️⃣  AGENT INTÉRIEUR (Enquêtes opérationnelles)          ║"
    echo "║     📱 +241 77 888 007 / PIN: 777777                      ║"
    echo "║                                                            ║"
    echo "║  9️⃣  USER CITOYEN (Envoi signalements, suivi)            ║"
    echo "║     📱 +241 77 888 008 / PIN: 888888                      ║"
    echo "║                                                            ║"
    echo "║  🔟 USER ANONYME (Envoi signalements anonymes)            ║"
    echo "║     📱 +241 77 888 009 / PIN: 999999                      ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "💡 Structure conforme à la logique complète :"
    echo "   Super Admin → Admin → Sous-Admins → Agents Ministériels → Users"
    echo ""
    echo "🎯 Permissions et vues respectées selon la documentation"
    echo ""
else
    echo ""
    echo "❌ Erreur lors de la création des comptes"
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
