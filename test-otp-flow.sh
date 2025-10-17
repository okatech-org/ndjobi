#!/bin/bash
# Script de test du flux OTP complet

PHONE="+33661002616"
EMAIL="iasted@me.com"

echo "🧪 Test du flux OTP Twilio Verify - NDJOBI"
echo "=========================================="
echo ""

# Test 1: SMS
echo "📱 Test 1: Envoi OTP par SMS au $PHONE"
RESPONSE=$(curl -s 'https://verify.twilio.com/v2/Services/YOUR_VERIFY_SERVICE_SID/Verifications' \
  -X POST \
  --data-urlencode "To=$PHONE" \
  --data-urlencode 'Channel=sms' \
  -u YOUR_TWILIO_ACCOUNT_SID:YOUR_TWILIO_AUTH_TOKEN)

STATUS=$(echo $RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$STATUS" = "pending" ]; then
  echo "✅ SMS envoyé avec succès!"
  echo "📩 Vérifiez votre téléphone et entrez le code reçu:"
  read -p "Code à 6 chiffres: " CODE
  
  echo ""
  echo "🔍 Vérification du code $CODE..."
  VERIFY_RESPONSE=$(curl -s 'https://verify.twilio.com/v2/Services/YOUR_VERIFY_SERVICE_SID/VerificationCheck' \
    -X POST \
    --data-urlencode "To=$PHONE" \
    --data-urlencode "Code=$CODE" \
    -u YOUR_TWILIO_ACCOUNT_SID:YOUR_TWILIO_AUTH_TOKEN)
  
  VALID=$(echo $VERIFY_RESPONSE | grep -o '"valid":[^,]*' | cut -d':' -f2)
  
  if [ "$VALID" = "true" ]; then
    echo "✅ Code validé! OTP SMS fonctionne parfaitement."
  else
    echo "❌ Code invalide ou expiré."
    echo "Réponse: $VERIFY_RESPONSE"
  fi
else
  echo "❌ Échec d'envoi SMS"
  echo "Réponse: $RESPONSE"
fi

echo ""
echo "=========================================="
echo "📧 Pour tester EMAIL et WhatsApp:"
echo "  - Email nécessite configuration SendGrid dans Twilio Console"
echo "  - WhatsApp nécessite un numéro approuvé (Business Account)"
echo ""
echo "🎯 Prochaine étape: Tester depuis l'UI React (PhoneLogin et SuperAdminAuth)"

