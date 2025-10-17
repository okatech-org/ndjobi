# 🔐 Authentification Super Admin avec OTP

## Vue d'ensemble

L'authentification Super Admin utilise maintenant un système OTP (One-Time Password) sécurisé via **Twilio Verify**, avec possibilité de recevoir le code par **SMS**, **WhatsApp** ou **Email**.

---

## 🎯 Flux d'authentification

### 1. **Ouverture de la modale Super Admin**
   - Cliquez sur "Super Admin" dans le menu d'authentification
   - La modale s'ouvre directement sur le **sélecteur de canal**

### 2. **Choix du canal de réception**
   Trois options disponibles:
   
   | Canal | Destinataire | Description |
   |-------|--------------|-------------|
   | 📱 **SMS** | `YOUR_PHONE_NUMBER` | Code envoyé par SMS classique |
   | 💬 **WhatsApp** | `YOUR_PHONE_NUMBER` | Code envoyé via WhatsApp |
   | 📧 **Email** | `iasted@me.com` | Code envoyé par e-mail |

### 3. **Envoi du code OTP**
   - Le système appelle l'Edge Function Supabase `start-verification`
   - Twilio Verify génère un code à 6 chiffres
   - Le code est envoyé sur le canal choisi
   - **Durée de validité**: 10 minutes

### 4. **Fallback automatique vers Email**
   - Si l'envoi échoue (CORS, réseau, canal bloqué)
   - Le système tente automatiquement d'envoyer par e-mail
   - Un message informe l'utilisateur du basculement

### 5. **Saisie et validation du code**
   - L'interface bascule sur le formulaire de saisie
   - Entrez le code à 6 chiffres reçu
   - Le système appelle l'Edge Function `check-verification`
   - Twilio Verify valide le code OTP

### 6. **Connexion Supabase**
   - Une fois le code OTP validé
   - Le système récupère les credentials depuis `.env.local`:
     ```bash
     VITE_SUPER_ADMIN_EMAIL=iasted@me.com
     VITE_SUPER_ADMIN_PASSWORD=011282
     VITE_SUPER_ADMIN_CODE=NDJOBI2025ADMIN
     ```
   - Authentification via `supabase.auth.signInWithPassword()`
   - Vérification du rôle `super_admin` en base
   - Session sauvegardée dans `sessionStorage`

### 7. **Accès au Dashboard Super Admin**
   - Redirection automatique vers `/dashboard/super-admin`
   - Session persistante (même après rafraîchissement)

---

## 🔧 Configuration technique

### Variables d'environnement (`.env.local`)

```bash
# Supabase Local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Super Admin Credentials
VITE_SUPER_ADMIN_CODE=NDJOBI2025ADMIN
VITE_SUPER_ADMIN_EMAIL=iasted@me.com
VITE_SUPER_ADMIN_PASSWORD=011282
```

### Variables Twilio (`.env` pour Edge Functions)

```bash
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID=YOUR_VERIFY_SERVICE_SID
```

### Contacts Super Admin configurés

Définis dans `src/services/auth/superAdminCodeService.ts`:

```typescript
const SUPER_ADMIN_PHONE = 'YOUR_PHONE_NUMBER';
const SUPER_ADMIN_EMAIL = 'iasted@me.com';
```

---

## 📁 Fichiers modifiés

### 1. **`src/components/auth/SuperAdminAuth.tsx`**
   - ✅ Affiche directement le sélecteur de canal au démarrage (`showSendCode: true`)
   - ✅ Utilise `twilioVerifyService` pour envoyer et vérifier les codes OTP
   - ✅ Interface améliorée avec informations de contact
   - ✅ Gestion du fallback automatique vers email
   - ✅ Timer de 10 minutes pour l'expiration du code

### 2. **`src/hooks/useAuth.ts`**
   - ✅ Export de `clearError()` pour réinitialiser les erreurs
   - ✅ Logs de debug pour tracer l'initialisation
   - ✅ Restauration de session depuis `sessionStorage`

### 3. **`src/services/auth/authService.ts`**
   - ✅ `isAuthenticated()` vérifie aussi `sessionStorage`
   - ✅ `getCurrentUser()` restaure depuis storage si nécessaire
   - ✅ `getCurrentRole()` restaure depuis storage si nécessaire
   - ✅ Session persistante même après rafraîchissement

### 4. **`src/services/twilioVerifyService.ts`**
   - Service frontend pour interagir avec Twilio Verify
   - Méthodes: `start(to, channel)` et `check(to, code)`

### 5. **Edge Functions Supabase**
   - `supabase/functions/start-verification/index.ts`: Démarre une vérification OTP
   - `supabase/functions/check-verification/index.ts`: Vérifie un code OTP

---

## 🧪 Tests

### Test 1: Envoi SMS
```bash
curl -i -X POST http://127.0.0.1:54321/functions/v1/start-verification \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"YOUR_PHONE_NUMBER","channel":"sms"}'
```

### Test 2: Envoi WhatsApp
```bash
curl -i -X POST http://127.0.0.1:54321/functions/v1/start-verification \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"YOUR_PHONE_NUMBER","channel":"whatsapp"}'
```

### Test 3: Envoi Email
```bash
curl -i -X POST http://127.0.0.1:54321/functions/v1/start-verification \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"iasted@me.com","channel":"email"}'
```

### Test 4: Vérification code
```bash
curl -i -X POST http://127.0.0.1:54321/functions/v1/check-verification \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"YOUR_PHONE_NUMBER","code":"123456"}'
```

---

## 🚀 Démarrage

### 1. Lancer Supabase avec Twilio
```bash
./start-supabase-with-twilio.sh
```

### 2. Lancer le dev server
```bash
bun run dev
```

### 3. Accéder à l'authentification
- Ouvrir `http://localhost:5173`
- Cliquer sur "Se connecter"
- Choisir "Super Admin"
- Sélectionner le canal (SMS/WhatsApp/Email)
- Entrer le code OTP reçu
- Accès au dashboard Super Admin

---

## ✅ Avantages de ce système

1. **🔒 Sécurité renforcée**: OTP à usage unique + authentification à deux facteurs
2. **📱 Multi-canal**: Flexibilité de recevoir le code par SMS, WhatsApp ou Email
3. **🔄 Fallback automatique**: Basculement vers email en cas d'échec
4. **⏱️ Expiration**: Code valide 10 minutes uniquement
5. **🌐 Production-ready**: Utilise Twilio Verify (service professionnel)
6. **💾 Session persistante**: Pas besoin de se reconnecter après rafraîchissement
7. **🎯 UX optimisée**: Interface claire et intuitive

---

## 📞 Support

En cas de problème:
1. Vérifier les variables d'environnement (`.env.local` et `.env`)
2. Vérifier que Supabase local tourne avec les Edge Functions
3. Consulter les logs de la console navigateur
4. Vérifier les logs des Edge Functions dans le terminal

---

**Dernière mise à jour**: 17 octobre 2025  
**Version**: 2.0 - Authentification OTP complète

