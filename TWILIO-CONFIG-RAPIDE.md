# Configuration Twilio - Actions Immédiates

## 🔑 Récupérer votre Auth Token

1. Allez sur: https://console.twilio.com/
2. Dans le Dashboard, section **Account Info**
3. Copiez le **Auth Token** (cliquez sur l'œil pour le révéler)
   - Format: commence par des lettres/chiffres (32 caractères)

## ⚙️ Configuration Supabase Local

### Option A: Via config.toml (Recommandé pour dev local)

Ouvrez `supabase/config.toml` et ajoutez:

```toml
[functions.start-verification]
verify_jwt = false

[functions.start-verification.env]
TWILIO_ACCOUNT_SID = "YOUR_TWILIO_ACCOUNT_SID"
TWILIO_AUTH_TOKEN = "VOTRE_AUTH_TOKEN_ICI"
TWILIO_VERIFY_SERVICE_SID = "YOUR_VERIFY_SERVICE_SID"

[functions.check-verification]
verify_jwt = false

[functions.check-verification.env]
TWILIO_ACCOUNT_SID = "YOUR_TWILIO_ACCOUNT_SID"
TWILIO_AUTH_TOKEN = "VOTRE_AUTH_TOKEN_ICI"
TWILIO_VERIFY_SERVICE_SID = "YOUR_VERIFY_SERVICE_SID"
```

### Option B: Via fichier .env dans chaque function

Créez ces fichiers:

**supabase/functions/start-verification/.env:**
```
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=VOTRE_AUTH_TOKEN_ICI
TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

**supabase/functions/check-verification/.env:**
```
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=VOTRE_AUTH_TOKEN_ICI
TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

## 🚀 Redémarrer Supabase

```bash
cd /Users/okatech/ndjobi
supabase stop
supabase start
```

## 🧪 Test immédiat (cURL)

Remplacez `[AUTH_TOKEN]` par votre vrai token:

```bash
# Test direct Twilio (pour confirmer que vos credentials marchent)
curl 'https://verify.twilio.com/v2/Services/YOUR_VERIFY_SERVICE_SID/Verifications' \
  -X POST \
  --data-urlencode 'To=YOUR_PHONE_NUMBER' \
  --data-urlencode 'Channel=sms' \
  -u YOUR_TWILIO_ACCOUNT_SID:[AUTH_TOKEN]
```

**Si vous recevez un SMS avec un code → Twilio fonctionne! ✅**

Ensuite testez via votre Edge Function locale:

```bash
# Test Edge Function
curl -X POST http://127.0.0.1:54321/functions/v1/start-verification \
  -H "Content-Type: application/json" \
  --data '{"to":"YOUR_PHONE_NUMBER","channel":"sms"}'
```

## 📱 Activation des canaux

### SMS
- ✅ Déjà activé par défaut

### WhatsApp
1. Console Twilio → Messaging → Try it out → Send a WhatsApp message
2. OU Messaging → WhatsApp senders
3. Vérifier que votre numéro est dans la sandbox OU que vous avez un numéro approuvé

**En Trial:** Les messages WhatsApp ne fonctionnent qu'avec des numéros vérifiés dans votre compte.

### Email
1. Twilio Console → Verify → Services → YOUR_VERIFY_SERVICE_SID
2. Onglet **Email**
3. **Activer Email** et configurer:
   - SendGrid (recommandé)
   - OU SMTP custom

**⚠️ En mode Trial Email:** L'email doit être vérifié dans Twilio.

## ⚠️ Limitations Trial Account

Votre compte Twilio est en Trial, donc:
- Les SMS contiennent "(SAMPLE TEST)" ou "Sent from a Twilio trial account"
- WhatsApp: seulement les numéros vérifiés reçoivent les messages
- Email: seulement les adresses vérifiées
- Limite: quelques messages par jour

**Pour passer en production:** Upgradez votre compte Twilio (ajoutez des crédits).

## 🎯 Numéros/Emails à vérifier

Pour tester en Trial:
1. Twilio Console → Phone Numbers → Verified Caller IDs
2. Ajouter: `YOUR_PHONE_NUMBER`
3. Twilio Console → Verify → Email → Add verified email
4. Ajouter: `iasted@me.com`

---

**Action immédiate:** Récupérez votre Auth Token et testez le cURL ci-dessus. Dites-moi si vous recevez le SMS!

