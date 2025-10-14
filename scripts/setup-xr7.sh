#!/bin/bash

# ============================================
# Script d'installation Module XR-7
# Classification: CONFIDENTIEL
# ============================================

set -e

echo "================================================"
echo "   Installation Module Système XR-7            "
echo "================================================"
echo ""

# Vérification des prérequis
echo "🔍 Vérification des prérequis..."
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI n'est pas installé"
    echo "Installez-le avec: bun install -g supabase"
    exit 1
fi

# Demander confirmation
echo "⚠️  AVERTISSEMENT"
echo "Ce module est strictement réservé aux super administrateurs."
echo "Son usage est encadré par la loi et nécessite une autorisation."
echo ""
read -p "Voulez-vous continuer ? (tapez 'R@XY' pour confirmer): " confirm

if [ "$confirm" != "R@XY" ]; then
    echo "❌ Installation annulée"
    exit 1
fi

# Créer le fichier .env.local s'il n'existe pas
if [ ! -f .env.local ]; then
    echo "📝 Création du fichier .env.local..."
    cp .env.example .env.local 2>/dev/null || touch .env.local
fi

# Générer les clés de chiffrement
echo "🔐 Génération des clés de sécurité..."
KEY1=$(openssl rand -hex 32)
KEY2=$(openssl rand -hex 32)
KEY3=$(openssl rand -hex 32)

# Ajouter les variables d'environnement
echo "" >> .env.local
echo "# ===== MODULE XR-7 CONFIDENTIEL =====" >> .env.local
echo "VITE_XR7_K1=$KEY1" >> .env.local
echo "VITE_XR7_K2=$KEY2" >> .env.local
echo "VITE_XR7_K3=$KEY3" >> .env.local
echo "VITE_XR7_AUTH=R@XY" >> .env.local
echo "VITE_XR7_ENABLED=false" >> .env.local
echo "# ====================================" >> .env.local

echo "✅ Clés générées et sauvegardées"

# Appliquer les migrations
echo ""
echo "🗄️  Application des migrations Supabase..."
echo "Connexion à Supabase requise..."

# Migration device identity
echo "📦 Migration 1/2: Système d'identité d'appareil..."
if [ -f "supabase/migrations/20251014_device_identity_system.sql" ]; then
    supabase db push --db-url "$DATABASE_URL" < supabase/migrations/20251014_device_identity_system.sql 2>/dev/null || {
        echo "⚠️  Migration device_identity déjà appliquée ou erreur"
    }
else
    echo "⚠️  Fichier migration device_identity non trouvé"
fi

# Migration module urgence
echo "📦 Migration 2/2: Module d'urgence sécurisé..."
if [ -f "supabase/migrations/20251014_emergency_module.sql" ]; then
    supabase db push --db-url "$DATABASE_URL" < supabase/migrations/20251014_emergency_module.sql 2>/dev/null || {
        echo "⚠️  Migration emergency_module déjà appliquée ou erreur"
    }
else
    echo "⚠️  Fichier migration emergency_module non trouvé"
fi

# Installation des dépendances supplémentaires
echo ""
echo "📦 Installation des dépendances..."
bun add crypto-js @types/crypto-js --silent

# Créer les fichiers de protection
echo ""
echo "🛡️  Configuration de la protection..."

# Créer un fichier de vérification d'intégrité
cat > .xr7_checksum << EOF
# Checksum des fichiers critiques
# NE PAS MODIFIER
$(find src/services/emergencyDecoder.ts src/services/security/coreProtection.ts -type f -exec sha256sum {} \; 2>/dev/null || echo "Files not found")
EOF

# Protéger les fichiers
chmod 600 .env.local
chmod 600 .xr7_checksum

echo ""
echo "================================================"
echo "✅ Installation terminée avec succès !"
echo "================================================"
echo ""
echo "📋 INFORMATIONS IMPORTANTES:"
echo ""
echo "1. Les clés de sécurité ont été générées dans .env.local"
echo "2. Le module est désactivé par défaut"
echo "3. Pour l'activer: VITE_XR7_ENABLED=true dans .env.local"
echo "4. Code d'accès: R@XY"
echo "5. Format code urgence: EMRG-XXXX-XXXXXX"
echo ""
echo "⚠️  SÉCURITÉ:"
echo "- Ne partagez JAMAIS les clés générées"
echo "- Le fichier .env.local est protégé (chmod 600)"
echo "- Toute modification nécessite le code R@XY"
echo ""
echo "🔒 Pour activer le module dans l'interface:"
echo "1. Connectez-vous en Super Admin"
echo "2. Allez dans 'Maintenance Système'"
echo "3. Cliquez sur 'Configuration'"
echo "4. Entrez le code urgence et R@XY"
echo ""
echo "================================================"
