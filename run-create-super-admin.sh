#!/bin/bash

echo ""
echo "🚀 CRÉATION AUTOMATIQUE DU COMPTE SUPER ADMIN"
echo "================================================"
echo ""

# Demander la clé
echo "Veuillez coller votre clé SERVICE_ROLE Supabase :"
echo "(Elle commence par eyJ...)"
echo ""
read -sp "SERVICE_ROLE KEY: " SERVICE_KEY
echo ""
echo ""

# Vérifier que la clé n'est pas vide
if [ -z "$SERVICE_KEY" ]; then
    echo "❌ Erreur : Aucune clé fournie"
    exit 1
fi

# Vérifier que la clé commence par eyJ (format JWT)
if [[ ! "$SERVICE_KEY" =~ ^eyJ.* ]]; then
    echo "⚠️  Attention : La clé ne semble pas être au bon format"
    echo "Elle devrait commencer par 'eyJ...'"
    read -p "Voulez-vous continuer quand même ? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Clé reçue (${#SERVICE_KEY} caractères)"
echo ""
echo "🔄 Création du compte en cours..."
echo ""

# Exporter la clé et exécuter le script
export SUPABASE_SERVICE_ROLE_KEY="$SERVICE_KEY"
node scripts/create-super-admin-via-api.js

# Nettoyer la variable
unset SUPABASE_SERVICE_ROLE_KEY

echo ""
echo "================================================"
echo "✅ Script terminé !"
echo "================================================"
echo ""

