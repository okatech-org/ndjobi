#!/bin/bash

# Script de diagnostic pour le compte Super Admin
# Exécute les scripts SQL de diagnostic

echo "🔍 Diagnostic du compte Super Admin..."
echo "====================================="

echo "📋 Instructions de diagnostic :"
echo ""
echo "1. Ouvrez le SQL Editor de Supabase :"
echo "   - Allez sur https://supabase.com/dashboard"
echo "   - Sélectionnez votre projet NDJOBI"
echo "   - Cliquez sur 'SQL Editor'"
echo ""
echo "2. Exécutez d'abord le diagnostic :"
echo "   - Copiez le contenu de DIAGNOSTIC-SUPER-ADMIN.sql"
echo "   - Collez-le dans l'éditeur SQL"
echo "   - Cliquez sur 'Run'"
echo ""
echo "3. Analysez les résultats :"
echo "   - Vérifiez si le compte existe dans auth.users"
echo "   - Vérifiez si le profil existe dans public.profiles"
echo "   - Vérifiez si le rôle existe dans public.user_roles"
echo ""
echo "4. Si le compte n'existe pas, exécutez la création :"
echo "   - Copiez le contenu de CREER-SUPER-ADMIN-ULTRA-SIMPLE.sql"
echo "   - Collez-le dans l'éditeur SQL"
echo "   - Cliquez sur 'Run'"
echo ""
echo "5. Vérifiez la création :"
echo "   - Relancez le diagnostic pour confirmer"
echo ""

echo "📁 Fichiers disponibles :"
echo "   • DIAGNOSTIC-SUPER-ADMIN.sql - Diagnostic complet"
echo "   • CREER-SUPER-ADMIN-ULTRA-SIMPLE.sql - Création simple"
echo ""

echo "🔧 Si le problème persiste :"
echo "   1. Vérifiez les permissions de votre compte Supabase"
echo "   2. Vérifiez que les tables existent"
echo "   3. Vérifiez les politiques RLS"
echo "   4. Contactez le support si nécessaire"
echo ""

echo "✨ Diagnostic prêt !"
