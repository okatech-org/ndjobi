#!/bin/bash

echo "🧹 Nettoyage du cache Vite et node_modules..."

# Arrêter le serveur si actif
pkill -f "vite" 2>/dev/null || true

# Supprimer le cache Vite
rm -rf node_modules/.vite
rm -rf .vite

# Supprimer le cache du navigateur (dossiers temporaires)
rm -rf dist

# Nettoyer les lockfiles potentiellement corrompus
rm -f bun.lockb.bak

echo "✅ Cache nettoyé !"
echo ""
echo "📦 Réinstallation des dépendances..."
bun install

echo ""
echo "✅ Prêt ! Vous pouvez relancer avec : bun run dev"

