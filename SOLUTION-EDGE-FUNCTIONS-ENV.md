# ✅ Solution: Variables d'environnement Edge Functions Supabase

## 🐛 Problème rencontré

**Erreur:** `Edge Function returned a non-2xx status code` (500)  
**Cause:** Les variables d'environnement Twilio n'étaient pas chargées par les Edge Functions

### Ce qui ne fonctionnait PAS:
❌ Fichiers `.env` individuels dans `supabase/functions/*/` → Non chargés automatiquement  
❌ Section `[functions.*.env]` dans `config.toml` → Format non supporté  
❌ `supabase/.env.local` → Non reconnu par le runtime  

---

## ✅ Solution finale

### 1. Fichier .env à la racine du projet
Créer `/Users/okatech/ndjobi/.env` avec:
```env
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

### 2. Démarrage des Edge Functions avec --env-file
```bash
cd /Users/okatech/ndjobi
supabase functions serve --env-file .env --no-verify-jwt
```

### 3. Script automatisé
Utiliser le script `start-supabase-with-twilio.sh`:
```bash
./start-supabase-with-twilio.sh
```

Ce script:
- Stoppe les processus existants
- Démarre Supabase
- Lance les Edge Functions avec `--env-file .env`
- Affiche les URLs et un test rapide

---

## 🧪 Test de validation

### Test cURL direct
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/start-verification \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  --data '{"to":"YOUR_PHONE_NUMBER","channel":"sms"}'
```

**Réponse attendue (succès):**
```json
{
  "sid": "VE...",
  "status": "pending",
  "to": "YOUR_PHONE_NUMBER",
  "channel": "sms"
}
```

**Ancien retour (erreur):**
```json
{"error": "Twilio env vars not configured"}
```

---

## 📝 Procédure de démarrage quotidien

### Option A: Script automatique (recommandé)
```bash
cd /Users/okatech/ndjobi
./start-supabase-with-twilio.sh
```

### Option B: Manuel
```bash
cd /Users/okatech/ndjobi

# 1. Démarrer Supabase
supabase start

# 2. Dans un nouveau terminal, démarrer les Edge Functions
supabase functions serve --env-file .env --no-verify-jwt
```

### Option C: Via npm script
Ajoutez dans `package.json`:
```json
{
  "scripts": {
    "supabase:start": "./start-supabase-with-twilio.sh",
    "supabase:functions": "supabase functions serve --env-file .env --no-verify-jwt"
  }
}
```

Puis:
```bash
bun run supabase:start
```

---

## 🚀 Déploiement en production (Supabase Cloud)

En production, utilisez `supabase secrets` (pas de fichier .env):

### 1. Login Supabase
```bash
supabase login
```

### 2. Link au projet
```bash
supabase link --project-ref xfxqwlbqysiezqdpeqpv
```

### 3. Définir les secrets
```bash
supabase secrets set \
  TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID \
  TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN \
  TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

### 4. Déployer les functions
```bash
supabase functions deploy start-verification
supabase functions deploy check-verification
supabase functions deploy send-sms
supabase functions deploy send-whatsapp
supabase functions deploy send-email
```

### 5. Vérifier les secrets
```bash
supabase secrets list
```

---

## 🔒 Sécurité

### .gitignore
Vérifiez que `.env` est bien ignoré:
```bash
# Vérifier
git status .env

# Si pas ignoré, ajouter à .gitignore
echo ".env" >> .gitignore
echo "supabase/functions/*/.env" >> .gitignore
```

### Ne JAMAIS commiter
- ❌ `.env` (racine)
- ❌ `supabase/.env.local`
- ❌ `supabase/functions/*/.env`
- ❌ Credentials Twilio en clair dans le code

---

## 🐛 Troubleshooting

### Erreur: "Twilio env vars not configured"
**Cause:** Fichier `.env` non chargé ou mal placé  
**Solution:**
1. Vérifier que `.env` est à la racine: `/Users/okatech/ndjobi/.env`
2. Vérifier le contenu: `cat .env`
3. Redémarrer avec `--env-file`: `supabase functions serve --env-file .env --no-verify-jwt`

### Erreur: "Edge Function returned non-2xx"
**Cause:** Function crash ou erreur Twilio  
**Solution:**
1. Consulter les logs: `docker logs supabase_edge_runtime_xfxqwlbqysiezqdpeqpv`
2. Vérifier les credentials Twilio (Console Twilio)
3. Tester en direct: `curl https://verify.twilio.com/...` (voir test dans doc)

### Functions ne démarrent pas
**Cause:** Port 54321 déjà utilisé ou Supabase non démarré  
**Solution:**
1. `supabase stop`
2. `pkill -f "supabase functions"`
3. `./start-supabase-with-twilio.sh`

### Code OTP ne s'envoie pas depuis l'UI
**Cause:** CORS ou apikey manquant  
**Solution:**
1. F12 → Network → Regarder la requête `/functions/v1/start-verification`
2. Vérifier header `apikey` présent
3. Si 401: Vérifier que `--no-verify-jwt` est actif
4. Si CORS: Redémarrer Supabase

---

## 📊 Architecture finale

```
/Users/okatech/ndjobi/
├── .env                                    ← Variables Twilio (local)
├── start-supabase-with-twilio.sh          ← Script de démarrage
├── supabase/
│   ├── config.toml                        ← Config Supabase (PAS de [functions.*.env])
│   └── functions/
│       ├── start-verification/
│       │   ├── index.ts                   ← Lit Deno.env.get("TWILIO_*")
│       │   └── .env                       ← ❌ Non utilisé (mais gardé pour ref)
│       └── check-verification/
│           ├── index.ts
│           └── .env                       ← ❌ Non utilisé
└── src/
    ├── services/
    │   └── twilioVerifyService.ts         ← Appelle supabase.functions.invoke()
    └── components/
        ├── auth/PhoneLogin.tsx            ← UI OTP utilisateur
        └── auth/SuperAdminAuth.tsx        ← UI OTP Super Admin
```

**Flux:**
1. UI appelle `twilioVerifyService.start(to, channel)`
2. Service appelle `supabase.functions.invoke('start-verification', { body })`
3. Edge Function lit `Deno.env.get("TWILIO_ACCOUNT_SID")` depuis `.env` (chargé par `--env-file`)
4. Edge Function appelle API Twilio Verify
5. Twilio envoie SMS/WhatsApp/Email
6. Utilisateur reçoit le code et le saisit
7. UI appelle `twilioVerifyService.check(to, code)`
8. Edge Function `check-verification` valide auprès de Twilio
9. Si valide → authentification réussie

---

## ✅ Checklist de validation

- [x] Fichier `.env` créé à la racine avec credentials Twilio
- [x] Script `start-supabase-with-twilio.sh` créé et exécutable
- [x] Edge Functions démarrées avec `--env-file .env --no-verify-jwt`
- [x] Test cURL réussi: `{"status":"pending"}` reçu
- [x] SMS OTP reçu sur `YOUR_PHONE_NUMBER`
- [ ] Test UI React: Modale Super Admin envoie code
- [ ] Test UI React: PhoneLogin envoie code
- [ ] Test vérification: Code saisi → validé
- [ ] Fallback e-mail testé (si configuré)

---

## 🎯 Prochaines étapes

1. ✅ **TERMINÉ:** Edge Functions configurées et fonctionnelles
2. **EN COURS:** Tester UI React (PhoneLogin + SuperAdminAuth)
3. **À FAIRE:** Configurer WhatsApp (numéro Business + sandbox)
4. **À FAIRE:** Configurer Email (Resend API Key ou SendGrid)
5. **À FAIRE:** Déployer en production Supabase Cloud
6. **À FAIRE:** Tester end-to-end en production

---

**Date de résolution:** 2025-10-17  
**Temps de résolution:** ~2h (investigation + tests + documentation)  
**Impact:** OTP SMS fonctionnel en local, prêt pour tests UI

