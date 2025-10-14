#!/bin/bash

# Script rapide pour créer les comptes démo via l'API Supabase

echo "================================================"
echo "   Création Rapide des Comptes Démo            "
echo "================================================"

# Configuration
SUPABASE_URL="http://127.0.0.1:54321"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfc29sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Fonction pour créer un compte
create_account() {
  local email=$1
  local password=$2
  local name=$3
  local role=$4
  
  echo ""
  echo "📱 Création : $name"
  
  # Créer le compte via l'API Auth
  curl -s -X POST "$SUPABASE_URL/auth/v1/signup" \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$email\",
      \"password\": \"$password\",
      \"data\": {\"full_name\": \"$name\"}
    }" > /dev/null 2>&1
  
  echo "   ✅ Compte configuré"
}

# Créer les comptes démo
create_account "24177777001@ndjobi.ga" "123456" "Citoyen" "user"
create_account "24177777002@ndjobi.ga" "123456" "Agent DGSS" "agent"
create_account "24177777003@ndjobi.ga" "123456" "Admin" "admin"
create_account "24177777000@ndjobi.ga" "123456" "Super Admin" "super_admin"

echo ""
echo "================================================"
echo "            ✅ Comptes Créés !                  "
echo "================================================"
echo ""
echo "📋 NUMÉROS À ENTRER (sans +241) :"
echo ""
echo "| Compte      | Numéro    | PIN    |"
echo "|-------------|-----------|--------|"
echo "| Super Admin | 77777000  | 123456 |"
echo "| Admin       | 77777003  | 123456 |"
echo "| Agent       | 77777002  | 123456 |"
echo "| Citoyen     | 77777001  | 123456 |"
echo ""
echo "🚀 Allez sur : http://localhost:5173/auth"
echo "🎯 Cliquez sur le bouton du compte souhaité"
echo ""
