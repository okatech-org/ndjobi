#!/bin/bash

# Script pour créer le profil manquant du Super Admin
# Exécute le script SQL de création du profil

echo "🔧 Création du profil manquant du Super Admin..."
echo "==============================================="

echo "📋 Instructions pour créer le profil manquant :"
echo ""
echo "1. Ouvrez le SQL Editor de Supabase :"
echo "   - Allez sur https://supabase.com/dashboard"
echo "   - Sélectionnez votre projet NDJOBI"
echo "   - Cliquez sur 'SQL Editor'"
echo ""
echo "2. Exécutez le script de création du profil :"
echo "   - Copiez le contenu de CREER-PROFIL-SUPER-ADMIN.sql"
echo "   - Collez-le dans l'éditeur SQL"
echo "   - Cliquez sur 'Run'"
echo ""
echo "3. Vérifiez la création :"
echo "   - Le script affichera les résultats de vérification"
echo "   - Vous devriez voir le profil créé avec le rôle super_admin"
echo ""
echo "4. Testez la connexion :"
echo "   - Rechargez votre application"
echo "   - Testez la connexion Super Admin avec le PIN 999999"
echo ""

echo "🔍 Problème identifié :"
echo "   • Le compte Super Admin existe dans auth.users"
echo "   • Mais le profil manque dans public.profiles"
echo "   • Le rôle manque dans public.user_roles"
echo "   • Ce script va corriger ces problèmes"
echo ""

echo "📁 Fichier à utiliser :"
echo "   • CREER-PROFIL-SUPER-ADMIN.sql"
echo ""

echo "🎯 Après exécution du script :"
echo "   • Le profil sera créé automatiquement"
echo "   • Le rôle super_admin sera attribué"
echo "   • La connexion Super Admin fonctionnera"
echo ""

echo "✨ Script de création prêt !"
