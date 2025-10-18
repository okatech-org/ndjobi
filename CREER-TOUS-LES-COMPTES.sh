#!/bin/bash

# Script pour créer tous les comptes de démonstration NDJOBI
# Project ID: xfxqwlbqysiezqdpeqpv

echo "🚀 NDJOBI - Création de tous les comptes de démonstration"
echo "============================================================"
echo "Project ID: xfxqwlbqysiezqdpeqpv"
echo "Supabase URL: https://xfxqwlbqysiezqdpeqpv.supabase.co"
echo ""

# Définir le fichier SQL
SQL_FILE="CREER-TOUS-LES-COMPTES.sql"

# Vérifier que le fichier existe
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur: Fichier $SQL_FILE non trouvé"
    exit 1
fi

echo "📋 Comptes à créer:"
echo "1. Admin (Président) - +24177888001 / PIN: 111111"
echo "2. Sous-Admin DGSS - +24177888002 / PIN: 222222"
echo "3. Sous-Admin DGR - +24177888003 / PIN: 333333"
echo "4. Agent Défense - +24177888004 / PIN: 444444"
echo "5. Agent Justice - +24177888005 / PIN: 555555"
echo "6. Agent Anti-Corruption - +24177888006 / PIN: 666666"
echo "7. Agent Intérieur - +24177888007 / PIN: 777777"
echo "8. Citoyen Démo - +24177888008 / PIN: 888888"
echo "9. Citoyen Anonyme - +24177888009 / PIN: 999999"
echo ""

echo "⚠️  IMPORTANT: Ce script doit être exécuté dans le SQL Editor de Supabase"
echo "   car il nécessite des permissions Service Role pour modifier auth.users"
echo ""

echo "📋 Instructions:"
echo "1. Ouvrez le dashboard Supabase sur Lovable"
echo "2. Allez dans l'onglet 'SQL Editor'"
echo "3. Copiez le contenu du fichier: $SQL_FILE"
echo "4. Collez-le dans l'éditeur SQL"
echo "5. Cliquez sur 'Run' ou 'Execute'"
echo ""

echo "✅ Après exécution, tous les comptes seront créés et prêts à utiliser!"
echo ""
echo "🔐 Test de connexion:"
echo "   - Ouvrez l'application NDJOBI"
echo "   - Utilisez n'importe quel numéro de téléphone de la liste ci-dessus"
echo "   - Entrez le PIN correspondant"
echo "   - Vous serez connecté avec le rôle approprié"
