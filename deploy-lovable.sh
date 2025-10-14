#!/bin/bash

echo "🚀 Déploiement NDJOBI sur Lovable"
echo "=================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet."
    exit 1
fi

# Nettoyer et installer les dépendances
echo "📦 Installation des dépendances..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Vérification TypeScript
echo "🔍 Vérification TypeScript..."
npm run type-check

# Build de production
echo "🏗️  Construction du projet..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le build a échoué. Le dossier dist n'existe pas."
    exit 1
fi

echo "✅ Build terminé avec succès !"
echo ""
echo "📋 Instructions de déploiement sur Lovable :"
echo "=========================================="
echo ""
echo "1. 🌐 Ouvrez https://ndjobi.lovable.app"
echo "2. 📁 Connectez votre repository GitHub:"
echo "   - Repository: https://github.com/okatech-org/ndjobi.git"
echo "   - Branche: main"
echo "   - Dossier racine: /"
echo ""
echo "3. ⚙️  Configuration requise :"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Install Command: npm install --legacy-peer-deps"
echo "   - Node Version: 18"
echo ""
echo "4. 🔐 Variables d'environnement à configurer :"
echo "   - VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co"
echo "   - VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo "   - VITE_APP_ENV=production"
echo "   - VITE_APP_URL=https://ndjobi.lovable.app"
echo ""
echo "5. 🎯 Domaines à configurer :"
echo "   - https://ndjobi.lovable.app"
echo "   - https://ndjobi.com"
echo ""
echo "6. 🚀 Déployer !"
echo ""
echo "📁 Fichiers de configuration créés :"
echo "   - vercel.json (pour Vercel/Lovable)"
echo "   - netlify.toml (pour Netlify)"
echo "   - lovable.config.js (pour Lovable)"
echo ""
echo "✨ Le projet est prêt pour le déploiement !"
