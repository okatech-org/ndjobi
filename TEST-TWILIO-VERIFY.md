# Test Twilio Verify - Guide Rapide

## 🔑 Vos identifiants Twilio

```bash
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=[Remplacez par votre Auth Token]
TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

**⚠️ Trouvez votre Auth Token:**
1. Allez sur: https://console.twilio.com/
2. Cliquez sur votre profil → Account → API credentials
3. Copiez le **Auth Token** (commence par un nombre/lettre)

---

## 🧪 Test 1: Envoi OTP via cURL (direct Twilio)

### SMS
```bash
curl 'https://verify.twilio.com/v2/Services/YOUR_VERIFY_SERVICE_SID/Verifications' \
  -X POST \
  --data-urlencode 'To=YOUR_PHONE_NUMBER' \
  --data-urlencode 'Channel=sms' \
  -u YOUR_TWILIO_ACCOUNT_SID:[VOTRE_AUTH_TOKEN]
```

### WhatsApp
```bash
curl 'https://verify.twilio.com/v2/Services/YOUR_VERIFY_SERVICE_SID/Verifications' \
  -X POST \
  --data-urlencode 'To=YOUR_PHONE_NUMBER' \
  --data-urlencode 'Channel=whatsapp' \
  -u YOUR_TWILIO_ACCOUNT_SID:[VOTRE_AUTH_TOKEN]
```

### Email
```bash
curl 'https://verify.twilio.com/v2/Services/YOUR_VERIFY_SERVICE_SID/Verifications' \
  -X POST \
  --data-urlencode 'To=iasted@me.com' \
  --data-urlencode 'Channel=email' \
  -u YOUR_TWILIO_ACCOUNT_SID:[VOTRE_AUTH_TOKEN]
```

**Réponse attendue (succès):**
```json
{
  "sid": "VE...",
  "service_sid": "YOUR_VERIFY_SERVICE_SID",
  "account_sid": "YOUR_TWILIO_ACCOUNT_SID",
  "to": "YOUR_PHONE_NUMBER",
  "channel": "sms",
  "status": "pending",
  "valid": false,
  "date_created": "2025-10-17T...",
  "date_updated": "2025-10-17T..."
}
```

**Erreurs possibles:**
- `404` → Service SID invalide
- `401` → Auth Token incorrect
- `400` → Numéro invalide ou canal non supporté
- `429` → Rate limit dépassé

---

## 🧪 Test 2: Vérification OTP

Une fois que vous avez reçu le code (ex: 123456):

```bash
curl 'https://verify.twilio.com/v2/Services/YOUR_VERIFY_SERVICE_SID/VerificationCheck' \
  -X POST \
  --data-urlencode 'To=YOUR_PHONE_NUMBER' \
  --data-urlencode 'Code=123456' \
  -u YOUR_TWILIO_ACCOUNT_SID:[VOTRE_AUTH_TOKEN]
```

**Réponse attendue (code valide):**
```json
{
  "sid": "VE...",
  "service_sid": "YOUR_VERIFY_SERVICE_SID",
  "account_sid": "YOUR_TWILIO_ACCOUNT_SID",
  "to": "YOUR_PHONE_NUMBER",
  "channel": "sms",
  "status": "approved",
  "valid": true,
  "date_created": "2025-10-17T...",
  "date_updated": "2025-10-17T..."
}
```

---

## ⚙️ Configuration Supabase Local

### 1. Créer le fichier .env.local
```bash
cd /Users/okatech/ndjobi
cp env.template .env.local
```

### 2. Éditer .env.local
Remplacez les placeholders par vos vraies valeurs:
```bash
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=[VOTRE_AUTH_TOKEN_ICI]
TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

### 3. Configurer les secrets Supabase
```bash
# Pour les Edge Functions locales
supabase secrets set TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
supabase secrets set TWILIO_AUTH_TOKEN=[VOTRE_AUTH_TOKEN]
supabase secrets set TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

**OU** dans `supabase/config.toml`:
```toml
[functions.start-verification.env]
TWILIO_ACCOUNT_SID = "YOUR_TWILIO_ACCOUNT_SID"
TWILIO_AUTH_TOKEN = "[VOTRE_AUTH_TOKEN]"
TWILIO_VERIFY_SERVICE_SID = "YOUR_VERIFY_SERVICE_SID"

[functions.check-verification.env]
TWILIO_ACCOUNT_SID = "YOUR_TWILIO_ACCOUNT_SID"
TWILIO_AUTH_TOKEN = "[VOTRE_AUTH_TOKEN]"
TWILIO_VERIFY_SERVICE_SID = "YOUR_VERIFY_SERVICE_SID"
```

### 4. Redémarrer Supabase
```bash
supabase stop
supabase start
```

---

## 🧪 Test 3: Via Edge Function locale

### Test start-verification
```bash
curl -i -X POST http://127.0.0.1:54321/functions/v1/start-verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [VOTRE_SUPABASE_ANON_KEY]" \
  --data '{"to":"YOUR_PHONE_NUMBER","channel":"sms"}'
```

### Test check-verification
```bash
curl -i -X POST http://127.0.0.1:54321/functions/v1/check-verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [VOTRE_SUPABASE_ANON_KEY]" \
  --data '{"to":"YOUR_PHONE_NUMBER","code":"123456"}'
```

---

## 🔍 Diagnostic des erreurs

### Erreur: "No 'Access-Control-Allow-Origin' header"
**Cause:** Edge Functions pas rechargées  
**Solution:** 
```bash
supabase stop
supabase start
```

### Erreur: "Twilio env vars not configured"
**Cause:** Variables d'environnement manquantes  
**Solution:** Vérifier `supabase/config.toml` ou `supabase secrets list`

### Erreur: "401 Unauthorized" (Twilio)
**Cause:** Auth Token invalide  
**Solution:** Regénérer l'Auth Token depuis Twilio Console

### Erreur: "404 Not Found" (Verify Service)
**Cause:** Service SID incorrect  
**Solution:** Vérifier que `YOUR_VERIFY_SERVICE_SID` existe dans Twilio Console → Verify → Services

### WhatsApp ne reçoit rien
**Cause:** Canal WhatsApp pas activé  
**Solution:** 
1. Twilio Console → Messaging → WhatsApp senders
2. Vérifier que le numéro est approuvé pour WhatsApp
3. Ajouter YOUR_PHONE_NUMBER à la liste blanche si en sandbox

### Email ne reçoit rien
**Cause:** Canal Email pas configuré dans Verify Service  
**Solution:**
1. Twilio Console → Verify → Services → VAc20...
2. Onglet "Email" → Activer et configurer SendGrid/autre

---

## 📝 Checklist avant test UI

- [ ] Auth Token Twilio récupéré et ajouté dans `.env.local`
- [ ] Variables d'environnement configurées dans Supabase
- [ ] Supabase redémarré (`supabase stop && supabase start`)
- [ ] Test cURL direct réussi (status: pending)
- [ ] Code OTP reçu sur SMS/WhatsApp/Email
- [ ] Test vérification cURL réussi (status: approved)
- [ ] Edge Functions CORS testées via OPTIONS
- [ ] UI testée depuis PhoneLogin ou modale Super Admin

---

## 🚀 Une fois que tout fonctionne

Pour déployer en production (Supabase Cloud):
```bash
# Login Supabase
supabase login

# Link au projet
supabase link --project-ref [VOTRE_PROJECT_REF]

# Deploy les functions
supabase functions deploy start-verification
supabase functions deploy check-verification
supabase functions deploy send-sms
supabase functions deploy send-whatsapp
supabase functions deploy send-email

# Configurer les secrets en production
supabase secrets set TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
supabase secrets set TWILIO_AUTH_TOKEN=[VOTRE_AUTH_TOKEN]
supabase secrets set TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

---

**Première étape:** Testez le cURL direct ci-dessus avec votre Auth Token pour confirmer que Twilio fonctionne, puis on configurera Supabase.

