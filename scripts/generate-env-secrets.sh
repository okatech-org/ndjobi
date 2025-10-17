#!/bin/bash

# ============================================
# Script de génération des secrets pour .env.local
# NDJOBI v2.0
# ============================================

set -e

echo "🔐 NDJOBI - Générateur de Secrets Sécurisés"
echo "============================================="
echo ""

# Fonction pour générer une chaîne aléatoire sécurisée
generate_secret() {
    openssl rand -base64 "$1" | tr -d "=+/" | cut -c1-"$1"
}

# Fonction pour générer un code numérique
generate_numeric_code() {
    openssl rand -hex 3 | tr -d 'a-f' | head -c "$1"
}

echo "📝 Génération des secrets..."
echo ""

# Super Admin Code (6 chiffres)
SUPER_ADMIN_CODE=$(generate_numeric_code 6)

# Session Encryption Key (32 caractères)
SESSION_KEY=$(generate_secret 32)

# JWT Secret (64 caractères)
JWT_SECRET=$(generate_secret 64)

# Backup Encryption Key (32 caractères)
BACKUP_KEY=$(generate_secret 32)

# Super Admin Password (16 caractères sécurisés)
SUPER_ADMIN_PASSWORD=$(openssl rand -base64 16)

echo "✅ Secrets générés avec succès !"
echo ""
echo "================================================"
echo "⚠️  COPIEZ CES VALEURS DANS VOTRE .env.local"
echo "⚠️  NE JAMAIS LES COMMITER DANS GIT"
echo "================================================"
echo ""
echo "# Super Admin Configuration"
echo "VITE_SUPER_ADMIN_CODE=$SUPER_ADMIN_CODE"
echo "VITE_SUPER_ADMIN_EMAIL=superadmin@ndjobi.com"
echo "VITE_SUPER_ADMIN_PASSWORD=$SUPER_ADMIN_PASSWORD"
echo ""
echo "# Security Configuration"
echo "VITE_SESSION_ENCRYPTION_KEY=$SESSION_KEY"
echo "VITE_JWT_SECRET=$JWT_SECRET"
echo ""
echo "# Backup Configuration"
echo "VITE_BACKUP_ENCRYPTION_KEY=$BACKUP_KEY"
echo ""
echo "================================================"
echo ""
echo "💾 Voulez-vous sauvegarder ces valeurs dans un fichier sécurisé ?"
echo "   (Le fichier sera créé dans ~/.ndjobi-secrets avec permissions 600)"
read -p "   (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SECRETS_FILE="$HOME/.ndjobi-secrets-$(date +%Y%m%d-%H%M%S).txt"
    cat > "$SECRETS_FILE" <<EOF
# NDJOBI v2.0 - Secrets Générés le $(date)
# ⚠️ GARDER CE FICHIER EN LIEU SÛR

VITE_SUPER_ADMIN_CODE=$SUPER_ADMIN_CODE
VITE_SUPER_ADMIN_EMAIL=superadmin@ndjobi.com
VITE_SUPER_ADMIN_PASSWORD=$SUPER_ADMIN_PASSWORD

VITE_SESSION_ENCRYPTION_KEY=$SESSION_KEY
VITE_JWT_SECRET=$JWT_SECRET
VITE_BACKUP_ENCRYPTION_KEY=$BACKUP_KEY
EOF
    chmod 600 "$SECRETS_FILE"
    echo "✅ Secrets sauvegardés dans: $SECRETS_FILE"
    echo "   Permissions définies à 600 (lecture seule pour vous)"
else
    echo "ℹ️  Secrets non sauvegardés. Copiez-les maintenant !"
fi

echo ""
echo "🔍 Prochaines étapes:"
echo "   1. Copier env.template.v2 vers .env.local"
echo "   2. Remplacer les valeurs 'generate-*' par celles ci-dessus"
echo "   3. Configurer vos clés Supabase (URL + ANON_KEY)"
echo "   4. (Optionnel) Ajouter vos clés API (OpenAI, etc.)"
echo ""
echo "✅ Terminé !"

