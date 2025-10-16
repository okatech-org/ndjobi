#!/bin/bash

# Script d'installation automatique Ndjobi
echo "🚀 Installation de Ndjobi - Application Anti-Corruption"
echo "========================================="

# Vérifier Bun
if ! command -v bun &> /dev/null; then
    echo "📦 Installation de Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

echo "✅ Bun version: $(bun --version)"

# Installer les dépendances
echo "📦 Installation des dépendances..."
bun install

# Créer le fichier d'environnement
if [ ! -f ".env.local" ]; then
    echo "⚙️ Création du fichier d'environnement..."
    cp env.template .env.local
    echo "⚠️ IMPORTANT: Configurez vos variables dans .env.local"
fi

# Vérifier TypeScript
echo "📝 Vérification TypeScript..."
bun run type-check

# Lancer les tests
echo "🧪 Exécution des tests..."
bun run test

echo ""
echo "🎉 Installation terminée avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Configurer .env.local avec vos clés API"
echo "2. Lancer l'app: bun run dev"
echo "3. Déployer: bun run deploy"
echo ""
echo "📚 Documentation: README.md"
echo "🔗 Aide: https://ndjobi.com/help"
