#!/bin/bash
# Script pour redémarrer les Edge Functions Supabase en local

echo "🔄 Redémarrage des Edge Functions Supabase..."

# Vérifier si Supabase est démarré
if ! pgrep -f "supabase" > /dev/null; then
    echo "⚠️  Supabase n'est pas en cours d'exécution."
    echo "Démarrage de Supabase..."
    supabase start
else
    echo "✅ Supabase est en cours d'exécution"
fi

echo ""
echo "📦 Déploiement des Edge Functions avec --no-verify-jwt..."
echo ""

# Deploy start-verification
echo "1/5 - start-verification..."
supabase functions deploy start-verification --no-verify-jwt --project-ref local 2>/dev/null || \
supabase functions serve start-verification --no-verify-jwt &

# Deploy check-verification
echo "2/5 - check-verification..."
supabase functions deploy check-verification --no-verify-jwt --project-ref local 2>/dev/null || \
supabase functions serve check-verification --no-verify-jwt &

# Deploy send-sms
echo "3/5 - send-sms..."
supabase functions deploy send-sms --no-verify-jwt --project-ref local 2>/dev/null || \
supabase functions serve send-sms --no-verify-jwt &

# Deploy send-whatsapp
echo "4/5 - send-whatsapp..."
supabase functions deploy send-whatsapp --no-verify-jwt --project-ref local 2>/dev/null || \
supabase functions serve send-whatsapp --no-verify-jwt &

# Deploy send-email
echo "5/5 - send-email..."
supabase functions deploy send-email --no-verify-jwt --project-ref local 2>/dev/null || \
supabase functions serve send-email --no-verify-jwt &

echo ""
echo "✅ Edge Functions redémarrées"
echo "🌐 URL locale: http://127.0.0.1:54321/functions/v1/"
echo ""
echo "Test CORS (OPTIONS):"
echo "curl -i -X OPTIONS http://127.0.0.1:54321/functions/v1/start-verification \\"
echo "  -H 'Origin: http://localhost:5173' \\"
echo "  -H 'Access-Control-Request-Method: POST'"

