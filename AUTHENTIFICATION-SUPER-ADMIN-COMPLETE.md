# ✅ Authentification Super Admin - Configuration Complète

## 🔐 Flux d'authentification Super Admin

### Étape 1: OTP via Twilio Verify ✅
1. Utilisateur clique "Recevoir un code" (SMS/WhatsApp/Email)
2. `twilioVerifyService.start()` appelle Edge Function `start-verification`
3. Twilio envoie le code à 6 chiffres
4. Utilisateur saisit le code
5. `twilioVerifyService.check()` valide le code auprès de Twilio

### Étape 2: Authentification Supabase ✅
1. Une fois l'OTP validé, `SuperAdminAuth` appelle `signInSuperAdmin(envCode)`
2. `authService` vérifie que `VITE_SUPER_ADMIN_CODE` correspond
3. `authService` utilise `VITE_SUPER_ADMIN_EMAIL` + `VITE_SUPER_ADMIN_PASSWORD` pour s'authentifier via Supabase
4. Si succès → Accès Super Admin accordé

---

## 📝 Variables d'environnement requises

### Fichier `.env.local` (Frontend React)
```env
# === SUPABASE LOCAL ===
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# === SUPER ADMIN CREDENTIALS ===
VITE_SUPER_ADMIN_CODE=NDJOBI2025ADMIN
VITE_SUPER_ADMIN_EMAIL=superadmin@ndjobi.com
VITE_SUPER_ADMIN_PASSWORD=Ndjobi@SuperAdmin2025!

# === ENVIRONMENT ===
VITE_ENVIRONMENT=development
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Ndjobi
```

### Fichier `.env` (Edge Functions Supabase)
```env
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

---

## 🔧 Configuration requise

### 1. Créer le compte Super Admin dans Supabase

**Option A: Via Supabase Studio (Interface graphique)**
1. Ouvrez http://127.0.0.1:54323 (Supabase Studio)
2. Authentication → Users → Invite user
3. Email: `superadmin@ndjobi.com`
4. Password: `Ndjobi@SuperAdmin2025!`
5. Confirm

**Option B: Via script SQL**
```sql
-- Se connecter à Supabase local
-- URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres

-- Créer l'utilisateur Super Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'superadmin@ndjobi.com',
  crypt('Ndjobi@SuperAdmin2025!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"],"role":"super_admin"}',
  '{"role":"super_admin","full_name":"Super Administrateur"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Ajouter le rôle dans user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'superadmin@ndjobi.com';
```

**Option C: Via script automatique (Recommandé)**
```bash
cd /Users/okatech/ndjobi
./scripts/create-super-admin.sh
```

### 2. Redémarrer le serveur dev

**Important:** Vite doit être redémarré pour charger `.env.local`:

```bash
# Stopper le serveur dev (Ctrl+C dans le terminal où Vite tourne)
# OU
pkill -f "vite"

# Redémarrer
bun run dev
# OU
npm run dev
```

---

## 🧪 Test de l'authentification

### Scénario complet:

1. **Ouvrir l'application:** http://localhost:5173
2. **Cliquer "Accès Super Admin"**
3. **Recevoir un code OTP:**
   - Cliquer "SMS" → Code envoyé à YOUR_PHONE_NUMBER
   - OU "WhatsApp" (si configuré)
   - OU "Email" (si configuré)
4. **Saisir le code à 6 chiffres reçu**
5. **Cliquer "Valider le code"**
6. **Résultat attendu:**
   - ✅ OTP validé par Twilio
   - ✅ Connexion Supabase avec `superadmin@ndjobi.com`
   - ✅ Redirection vers Dashboard Super Admin
   - ✅ Role: `super_admin` dans le localStorage/session

---

## 🐛 Troubleshooting

### Erreur: "Code Super Admin non configuré"
**Cause:** `.env.local` absent ou non chargé  
**Solution:**
1. Vérifier que `.env.local` existe: `ls -la .env.local`
2. Vérifier le contenu: `cat .env.local | grep VITE_SUPER_ADMIN`
3. Redémarrer Vite: `pkill -f vite && bun run dev`

### Erreur: "Configuration manquante"
**Cause:** Variables `VITE_SUPER_ADMIN_*` non définies  
**Solution:** Ajouter dans `.env.local`:
```env
VITE_SUPER_ADMIN_CODE=NDJOBI2025ADMIN
VITE_SUPER_ADMIN_EMAIL=superadmin@ndjobi.com
VITE_SUPER_ADMIN_PASSWORD=Ndjobi@SuperAdmin2025!
```

### Erreur: "Invalid login credentials" (Supabase)
**Cause:** Compte `superadmin@ndjobi.com` n'existe pas dans Supabase  
**Solution:**
1. Ouvrir Supabase Studio: http://127.0.0.1:54323
2. Authentication → Users
3. Vérifier si `superadmin@ndjobi.com` existe
4. Si non: Créer via Studio ou script SQL (voir ci-dessus)

### OTP valide mais authentification échoue
**Cause:** Password incorrect ou compte inexistant  
**Solution:**
1. Vérifier que le mot de passe dans `.env.local` = mot de passe Supabase
2. Réinitialiser le mot de passe via Supabase Studio si nécessaire

### "Configuration manquante" après redémarrage
**Cause:** `.env.local` pas pris en compte  
**Solution:**
1. Vérifier que le fichier s'appelle bien `.env.local` (pas `.env`)
2. Vite charge automatiquement `.env.local` en priorité sur `.env`
3. Redémarrer complètement Vite

---

## 🔒 Sécurité

### En développement (local)
- ✅ `.env.local` avec credentials de test
- ✅ Compte Super Admin dans Supabase local
- ✅ OTP via Twilio Trial (contient "SAMPLE TEST")

### En production
- ⚠️ **NE JAMAIS** commiter `.env.local`
- ⚠️ Utiliser des variables d'environnement serveur (Vercel/Netlify)
- ⚠️ Password Super Admin fort (min 20 caractères)
- ⚠️ OTP obligatoire (double authentification)
- ⚠️ Rate limiting sur les tentatives OTP
- ⚠️ Logs d'accès Super Admin

### Variables d'environnement production

**Vercel/Netlify Dashboard:**
```
VITE_SUPER_ADMIN_CODE=[Code secret fort]
VITE_SUPER_ADMIN_EMAIL=admin@ndjobi.com
VITE_SUPER_ADMIN_PASSWORD=[Password très fort]
VITE_SUPABASE_URL=https://[votre-projet].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[Anon key production]
```

**Supabase Cloud → Project Settings → Edge Functions:**
```
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

---

## 📊 Architecture du flux

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEUR                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 1. Clic "SMS"
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SuperAdminAuth.tsx                              │
│  - handleSendCode('sms')                                     │
│  - twilioVerifyService.start(phone, 'sms')                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 2. POST /functions/v1/start-verification
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Edge Function: start-verification                     │
│  - Lit Deno.env.get("TWILIO_*")                              │
│  - Appelle Twilio Verify API                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 3. POST https://verify.twilio.com/.../Verifications
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   TWILIO VERIFY                              │
│  - Génère code à 6 chiffres                                  │
│  - Envoie SMS via YOUR_PHONE_NUMBER                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 4. SMS reçu
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEUR                               │
│  - Saisit le code: 123456                                    │
│  - Clic "Valider le code"                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 5. handleCodeSubmit()
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SuperAdminAuth.tsx                              │
│  - twilioVerifyService.check(phone, code)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 6. POST /functions/v1/check-verification
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Edge Function: check-verification                     │
│  - Appelle Twilio Verify Check API                           │
│  - Renvoie {valid: true}                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 7. OTP validé ✅
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SuperAdminAuth.tsx                              │
│  - signInSuperAdmin(VITE_SUPER_ADMIN_CODE)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 8. Vérification code statique
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 authService.ts                               │
│  - Vérifie code === VITE_SUPER_ADMIN_CODE                    │
│  - supabase.auth.signInWithPassword({                        │
│      email: VITE_SUPER_ADMIN_EMAIL,                          │
│      password: VITE_SUPER_ADMIN_PASSWORD                     │
│    })                                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 9. POST /auth/v1/token
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE AUTH                                    │
│  - Vérifie email + password                                  │
│  - Génère JWT access_token                                   │
│  - Renvoie session                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 10. Session créée ✅
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 authService.ts                               │
│  - Sauvegarde session dans localStorage                       │
│  - Renvoie {success: true, user, session}                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 11. Authentification réussie
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SuperAdminAuth.tsx                              │
│  - toast("Bienvenue Super Admin")                            │
│  - onClose()                                                 │
│  - Redirection → /super-admin-dashboard                      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de validation

- [ ] Fichier `.env.local` créé avec `VITE_SUPER_ADMIN_*`
- [ ] Fichier `.env` contient credentials Twilio
- [ ] Supabase local démarré: `supabase start`
- [ ] Edge Functions servies: `supabase functions serve --env-file .env --no-verify-jwt`
- [ ] Serveur dev Vite démarré: `bun run dev`
- [ ] Compte `superadmin@ndjobi.com` existe dans Supabase (Studio)
- [ ] Test OTP: Code SMS reçu sur YOUR_PHONE_NUMBER
- [ ] Test validation: Code accepté par Twilio
- [ ] Test auth: Connexion Supabase réussie
- [ ] Dashboard Super Admin accessible

---

## 🎯 Résumé

**Ce qui a été configuré:**
1. ✅ OTP Twilio Verify (SMS/WhatsApp/Email)
2. ✅ Edge Functions avec variables Twilio
3. ✅ Variables Super Admin pour frontend (.env.local)
4. ⏳ Compte Super Admin dans Supabase (à créer)
5. ⏳ Redémarrage serveur dev (à faire)

**Prochaines étapes:**
1. Créer le compte `superadmin@ndjobi.com` dans Supabase Studio
2. Redémarrer `bun run dev`
3. Tester le flux complet
4. Valider l'accès au Dashboard Super Admin

**En cas de problème:** Consultez la section Troubleshooting ci-dessus.

---

**Date:** 2025-10-17  
**Status:** Configuration complète, en attente création compte + restart dev

