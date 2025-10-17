#!/bin/bash

# Script de création rapide des comptes démo NDJOBI
# Utilise l'API Supabase directement

echo "🚀 NDJOBI - Création des comptes démo"
echo "======================================"
echo ""

# Configuration
SUPABASE_URL="${SUPABASE_URL:-http://127.0.0.1:54321}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU}"

echo "📍 Supabase URL: $SUPABASE_URL"
echo ""

# Fonction pour créer un compte
create_account() {
  local email=$1
  local password=$2
  local full_name=$3
  local phone=$4
  local role=$5
  
  echo "📝 Création de: $full_name ($role)"
  echo "   Email: $email"
  
  # Créer l'utilisateur via signup
  local response=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/signup" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${email}\",
      \"password\": \"${password}\",
      \"data\": {
        \"full_name\": \"${full_name}\",
        \"phone\": \"${phone}\",
        \"role\": \"${role}\"
      }
    }")
  
  # Extraire l'ID utilisateur
  local user_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$user_id" ]; then
    echo "   ✅ Utilisateur créé: $user_id"
    
    # Assigner le rôle dans user_roles
    curl -s -X POST "${SUPABASE_URL}/rest/v1/user_roles" \
      -H "apikey: ${SUPABASE_SERVICE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"user_id\": \"${user_id}\",
        \"role\": \"${role}\"
      }" > /dev/null
    
    echo "   ✅ Rôle assigné: $role"
  else
    echo "   ⚠️  Utilisateur peut déjà exister ou erreur de création"
  fi
  
  echo ""
}

# Créer les comptes démo
echo "🔧 Création des comptes..."
echo ""

create_account \
  "24177777001@ndjobi.com" \
  "123456" \
  "Citoyen Démo" \
  "+24177777001" \
  "user"

create_account \
  "24177777002@ndjobi.com" \
  "123456" \
  "Agent DGSS Démo" \
  "+24177777002" \
  "agent"

create_account \
  "24177777003@ndjobi.com" \
  "123456" \
  "Protocole d'État - Président" \
  "+24177777003" \
  "admin"

echo "✅ Création terminée!"
echo ""
echo "📋 Identifiants des comptes démo:"
echo "======================================"
echo ""
echo "👤 Citoyen Démo (user):"
echo "   Email: 24177777001@ndjobi.com"
echo "   Mot de passe: 123456"
echo ""
echo "👮 Agent DGSS (agent):"
echo "   Email: 24177777002@ndjobi.com"
echo "   Mot de passe: 123456"
echo ""
echo "👑 Protocole d'État (admin):"
echo "   Email: 24177777003@ndjobi.com"
echo "   Mot de passe: 123456"
echo ""
echo "🌐 Testez sur: http://localhost:5173"
echo ""

