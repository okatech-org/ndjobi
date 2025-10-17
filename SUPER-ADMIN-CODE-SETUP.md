# Configuration du Système de Code Super Admin

## 🎯 Vue d'ensemble

Le système d'authentification Super Admin utilise des codes à 6 chiffres envoyés par :
- 📱 **SMS** (via Twilio)
- 💬 **WhatsApp** (via Twilio WhatsApp API)
- 📧 **Email** (via Resend)

## 📋 Informations Super Admin

```
Téléphone : +33 6 61 00 26 16
Email     : iasted@me.com
```

## 🚀 Configuration des Services

### 1. Twilio (SMS + WhatsApp)

#### Créer un compte Twilio
1. Aller sur [twilio.com](https://www.twilio.com)
2. Créer un compte (essai gratuit disponible)
3. Vérifier votre numéro de téléphone

#### Récupérer les credentials
```bash
Account SID  : ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token   : your_auth_token_here
Phone Number : +1234567890 (votre numéro Twilio)
```

#### Activer WhatsApp
1. Dans Twilio Console, aller dans **Messaging > Try it out > Send a WhatsApp message**
2. Suivre les instructions pour activer WhatsApp Sandbox
3. Envoyer un message au numéro Twilio depuis WhatsApp avec le code fourni

### 2. Resend (Email)

#### Créer un compte Resend
1. Aller sur [resend.com](https://resend.com)
2. Créer un compte
3. Vérifier votre domaine (ou utiliser le sandbox)

#### Récupérer l'API Key
```bash
API Key : re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Configurer le domaine
```bash
# Ajouter ces records DNS pour votre domaine
Type: TXT
Name: _resend
Value: [fourni par Resend]

Type: CNAME
Name: resend._domainkey
Value: [fourni par Resend]
```

## 🔧 Configuration Supabase

### Variables d'environnement

Aller dans **Supabase Dashboard > Settings > Edge Functions > Secrets**

```bash
# Twilio (SMS + WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Déployer les Edge Functions

```bash
# Se connecter à Supabase
npx supabase login

# Déployer les fonctions
npx supabase functions deploy send-sms
npx supabase functions deploy send-whatsapp
npx supabase functions deploy send-email

# Définir les secrets
npx supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
npx supabase secrets set TWILIO_AUTH_TOKEN=xxxxx
npx supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
npx supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
npx supabase secrets set RESEND_API_KEY=re_xxxxx
```

## 🧪 Tests

### Test en local

```bash
# Démarrer Supabase local
npx supabase start

# Tester la fonction SMS
npx supabase functions serve send-sms

# Envoyer une requête test
curl -X POST 'http://localhost:54321/functions/v1/send-sms' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "YOUR_PHONE_NUMBER",
    "message": "Test NDJOBI: Code 123456"
  }'
```

### Test en production

```bash
# Tester via l'interface Supabase
# Dashboard > Edge Functions > send-sms > Invoke

# Payload de test
{
  "to": "YOUR_PHONE_NUMBER",
  "message": "[NDJOBI] Test code: 123456"
}
```

## 📝 Utilisation

### Flux d'authentification

1. **Utilisateur** : Double-clic sur le bouton Shield
2. **Interface** : Modal Super Admin s'ouvre
3. **Utilisateur** : Clic sur "Recevoir un code"
4. **Interface** : Affiche 3 options (SMS, WhatsApp, Email)
5. **Utilisateur** : Choisit une méthode
6. **Système** : 
   - Génère un code à 6 chiffres
   - Envoie via la méthode choisie
   - Démarre un timer de 10 minutes
7. **Utilisateur** : Saisit le code reçu
8. **Système** : 
   - Valide le code
   - Authentifie le Super Admin
   - Redirige vers le dashboard

### Sécurité

- ✅ Code à 6 chiffres aléatoire
- ✅ Expiration après 10 minutes
- ✅ Maximum 3 tentatives
- ✅ Un seul code actif à la fois
- ✅ Révocation automatique après utilisation

## 🛠️ Mode Développement

En développement, les Edge Functions peuvent ne pas être disponibles. Le système affiche quand même le modal et log les codes dans la console :

```
📱 SMS envoyé à YOUR_PHONE_NUMBER: Code 123456
💬 WhatsApp envoyé à YOUR_PHONE_NUMBER: Code 123456
📧 Email envoyé à iasted@me.com: Code 123456
```

## 🔒 Sécurité en Production

### Bonnes pratiques

1. **Ne jamais** commiter les credentials
2. **Utiliser** des variables d'environnement
3. **Activer** les logs dans Twilio/Resend
4. **Monitorer** les tentatives échouées
5. **Limiter** le rate limiting (max 5 envois/heure)

### Rate Limiting (à implémenter)

```typescript
// Dans superAdminCodeService.ts
private rateLimiter = {
  maxAttempts: 5,
  windowMinutes: 60,
  attempts: [] as number[],
};

private checkRateLimit(): boolean {
  const now = Date.now();
  const windowStart = now - this.rateLimiter.windowMinutes * 60 * 1000;
  
  // Nettoyer les anciennes tentatives
  this.rateLimiter.attempts = this.rateLimiter.attempts.filter(
    time => time > windowStart
  );
  
  return this.rateLimiter.attempts.length < this.rateLimiter.maxAttempts;
}
```

## 📊 Monitoring

### Twilio Dashboard
- Messages envoyés
- Taux de délivrance
- Coûts

### Resend Dashboard
- Emails envoyés
- Taux d'ouverture
- Bounces

### Supabase Dashboard
- Edge Functions logs
- Nombre d'invocations
- Erreurs

## 💰 Coûts (estimation)

### Twilio
- SMS : ~0.05€ / message
- WhatsApp : ~0.01€ / message
- 100 codes/mois ≈ 5€

### Resend
- Gratuit : 3,000 emails/mois
- Pro : 50,000 emails/mois pour 20€

## 🆘 Dépannage

### "Twilio credentials not configured"
- Vérifier que les secrets sont définis dans Supabase
- Redéployer les Edge Functions

### "Code non reçu"
- Vérifier les logs Twilio/Resend
- Vérifier le numéro/email de destination
- Vérifier que les services sont actifs

### "Code expiré"
- Augmenter `CODE_EXPIRY_MINUTES` dans `superAdminCodeService.ts`
- Actuellement : 10 minutes

### "Trop de tentatives"
- Augmenter `MAX_ATTEMPTS` dans `superAdminCodeService.ts`
- Actuellement : 3 tentatives

## 📚 Ressources

- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio WhatsApp Documentation](https://www.twilio.com/docs/whatsapp)
- [Resend Documentation](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Version** : 1.0.0  
**Date** : 17/01/2025  
**Contact** : Super Admin NDJOBI

