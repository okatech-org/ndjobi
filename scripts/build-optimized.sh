#!/bin/bash

set -e

echo "🚀 Ndjobi - Build Optimisé"
echo "=========================="
echo ""

echo "📦 Nettoyage des fichiers temporaires..."
rm -rf dist .vite node_modules/.vite

echo "🔍 Vérification TypeScript..."
bun run type-check

echo "✨ Linting du code..."
bun run lint

echo "🧪 Exécution des tests..."
bun run test --run

echo "📊 Analyse du bundle..."
ANALYZE=true bun run build

echo "✅ Build terminé avec succès!"
echo ""
echo "📈 Statistiques du build:"
du -sh dist
echo ""
echo "Nombre de fichiers:"
find dist -type f | wc -l
echo ""
echo "Taille totale du bundle JS:"
du -sh dist/assets/*.js | awk '{sum+=$1} END {print sum " KB"}'
echo ""
echo "✅ Le build est prêt dans le dossier 'dist/'"

