#!/bin/bash
# Démarrage Supabase avec variables Twilio

echo "🚀 Démarrage de Supabase avec configuration Twilio..."
echo ""

# Stopper tout processus existant
pkill -f "supabase functions serve" 2>/dev/null
supabase stop 2>/dev/null

# Démarrer Supabase
echo "📦 Démarrage des services Supabase..."
supabase start

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Supabase démarré avec succès!"
  echo ""
  
  # Démarrer les Edge Functions avec les variables Twilio
  echo "🔧 Démarrage des Edge Functions avec credentials Twilio..."
  cd /Users/okatech/ndjobi
  supabase functions serve --env-file .env --no-verify-jwt &
  
  sleep 3
  echo ""
  echo "✅ Edge Functions prêtes:"
  echo "   - start-verification (OTP SMS/WhatsApp/Email)"
  echo "   - check-verification (Vérification code OTP)"
  echo "   - send-sms (Envoi SMS direct)"
  echo "   - send-whatsapp (Envoi WhatsApp)"
  echo "   - send-email (Envoi Email)"
  echo ""
  echo "🌐 URLs:"
  echo "   - API: http://127.0.0.1:54321"
  echo "   - Studio: http://127.0.0.1:54323"
  echo "   - Functions: http://127.0.0.1:54321/functions/v1/"
  echo ""
  echo "🧪 Test rapide:"
  echo '   curl -X POST http://127.0.0.1:54321/functions/v1/start-verification \'
  echo '     -H "Content-Type: application/json" \'
  echo '     -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \'
  echo '     --data '"'"'{"to":"YOUR_PHONE_NUMBER","channel":"sms"}'"'"
  echo ""
  echo "🎯 Vous pouvez maintenant tester l'UI React sur http://localhost:5173"
else
  echo "❌ Erreur lors du démarrage de Supabase"
  exit 1
fi

