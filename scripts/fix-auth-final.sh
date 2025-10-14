#!/bin/bash

echo "================================================"
echo "   RÉPARATION COMPLÈTE DE L'AUTHENTIFICATION   "
echo "================================================"

# 1. Arrêter tous les serveurs
echo "🔧 Arrêt des serveurs..."
pkill -f "node.*vite|bun.*dev" 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# 2. Nettoyer tous les caches
echo "🧹 Nettoyage des caches..."
rm -rf node_modules/.vite .vite dist
rm -rf ~/.config/Cursor/Cache ~/.config/Cursor/Code\ Cache 2>/dev/null || true

# 3. Créer les comptes démo
echo "👤 Création des comptes démo..."
curl -s -X POST "http://127.0.0.1:54321/auth/v1/signup" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  -d '{"email":"24177777000@ndjobi.ga","password":"123456"}' > /dev/null 2>&1

curl -s -X POST "http://127.0.0.1:54321/auth/v1/signup" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  -d '{"email":"24177777003@ndjobi.ga","password":"123456"}' > /dev/null 2>&1

curl -s -X POST "http://127.0.0.1:54321/auth/v1/signup" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  -d '{"email":"24177777002@ndjobi.ga","password":"123456"}' > /dev/null 2>&1

curl -s -X POST "http://127.0.0.1:54321/auth/v1/signup" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  -d '{"email":"24177777001@ndjobi.ga","password":"123456"}' > /dev/null 2>&1

echo "✅ Comptes créés"

# 4. Message important
echo ""
echo "================================================"
echo "            ⚠️  ACTION REQUISE                  "
echo "================================================"
echo ""
echo "1. Ouvrez Supabase Studio :"
echo "   http://127.0.0.1:54323/project/default/editor"
echo ""
echo "2. Exécutez le script SQL :"
echo "   /scripts/reset-complete.sql"
echo ""
echo "3. Démarrez le serveur :"
echo "   bun run dev"
echo ""
echo "4. IMPORTANT : Ouvrez une fenêtre INCOGNITO"
echo "   Pour éviter le cache du navigateur"
echo ""
echo "5. Allez sur : http://localhost:5173/auth"
echo "   (PAS 8080 !)"
echo ""
echo "================================================"
echo ""
echo "Comptes disponibles :"
echo "• Super Admin : 77777000 + 123456"
echo "• Admin       : 77777003 + 123456"
echo "• Agent       : 77777002 + 123456"
echo "• Citoyen     : 77777001 + 123456"
echo ""
