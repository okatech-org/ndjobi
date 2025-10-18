#!/bin/bash

###############################################################################
# Script d'Arrêt iAsted
# Arrête proprement le backend et le frontend
###############################################################################

echo "🛑 Arrêt de iAsted..."
echo ""

# Arrêter backend Docker
if [ -d "iasted/backend" ]; then
    echo "🐳 Arrêt du backend Docker..."
    cd iasted/backend
    docker-compose down
    cd ../..
    echo "✅ Backend arrêté"
fi

# Arrêter frontend (trouver le process npm run dev)
echo ""
echo "⚛️  Arrêt du frontend Ndjobi..."
FRONTEND_PIDS=$(pgrep -f "vite")
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "$FRONTEND_PIDS" | xargs kill 2>/dev/null
    echo "✅ Frontend arrêté"
else
    echo "ℹ️  Aucun processus frontend trouvé"
fi

# Nettoyer logs
rm -f /tmp/ndjobi-dev.log

echo ""
echo "✅ iAsted complètement arrêté !"
echo ""
echo "Pour redémarrer :"
echo "  ./START-IASTED.sh"
echo ""

