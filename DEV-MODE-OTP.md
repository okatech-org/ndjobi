# 🧪 Mode Développement OTP - Guide

## Problème résolu

L'API Twilio Verify ne fonctionne pas depuis l'environnement local Supabase en raison d'erreurs de connexion TLS/réseau:
```
connection error: peer closed connection without sending TLS close_notify
```

## Solution: Mode Développement

Un **mode développement** a été implémenté pour tester l'authentification Super Admin sans avoir besoin de l'API Twilio.

---

## 🎯 Comment ça fonctionne

### 1. Détection automatique
```typescript
const DEV_MODE = import.meta.env.MODE === 'development';
```
- En mode `development`, le système utilise un code OTP fixe
- En mode `production`, le système utilise l'API Twilio réelle

### 2. Code OTP fixe
```typescript
const DEV_OTP_CODE = '123456';
```
- Code de test: **`123456`**
- Visible dans les logs console
- Affiché dans l'interface

### 3. Simulation sans API
- `twilioVerifyService.start()`: Simule l'envoi (délai 500ms)
- `twilioVerifyService.check()`: Vérifie contre le code fixe (délai 300ms)
- Logs dans la console pour le debug

---

## 🎨 Interface en mode DEV

### Badge DEV
```
🛡️ Authentification Super Admin [DEV]
```
- Badge jaune visible dans le titre
- Indique clairement le mode de développement

### Alert avec le code
```
┌─────────────────────────────────────────┐
│ 🧪 Mode développement                   │
│ Code de test: 123456                    │
└─────────────────────────────────────────┘
```
- Alert jaune affichée après la sélection du canal
- Code affiché en gras et en police monospace

### Toast avec le code
```
🧪 Mode DEV - Code de test
Code à saisir: 123456
```
- Toast affiché pendant 30 secondes
- Contient le code de test à utiliser

---

## 📝 Utilisation

### 1. Lancer l'application en mode dev
```bash
bun run dev
```

### 2. Ouvrir la modale Super Admin
- Cliquer sur "Se connecter"
- Sélectionner "Super Admin"

### 3. Choisir un canal
- Cliquer sur SMS, WhatsApp ou Email
- Le badge **DEV** est visible en haut
- Un toast s'affiche avec le code **`123456`**
- Un alert jaune s'affiche avec le code

### 4. Saisir le code
- Entrer: `1` `2` `3` `4` `5` `6`
- Les cases se remplissent automatiquement

### 5. Valider
- Cliquer sur "Valider le code"
- L'authentification réussit
- Redirection vers le Dashboard Super Admin

---

## 🔍 Logs console

Le service affiche des logs détaillés:

```javascript
🧪 [DEV MODE] Code OTP simulé: 123456
📱 Canal: sms
📧 Destinataire: YOUR_PHONE_NUMBER

🧪 [DEV MODE] Vérification du code: 123456
✅ Code attendu: 123456
✅ Validation: SUCCESS
```

---

## 🔄 Basculement vers la production

Quand l'API Twilio fonctionnera:

### 1. Build de production
```bash
bun run build
```

### 2. Variables d'environnement
Assurer que `.env` contient:
```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...
```

### 3. Le mode DEV se désactivera automatiquement
- Plus de badge DEV
- Plus d'alert jaune
- Codes OTP réels envoyés par Twilio
- Toast normaux sans le code

---

## 📁 Fichiers modifiés

### 1. `src/services/twilioVerifyService.ts`
```typescript
const DEV_MODE = import.meta.env.MODE === 'development';
const DEV_OTP_CODE = '123456';

export const twilioVerifyService = {
  async start(to, channel) {
    if (DEV_MODE) {
      // Simulation
      return { success: true };
    }
    // Appel réel API
  },
  
  async check(to, code) {
    if (DEV_MODE) {
      // Vérification contre code fixe
      return { success: true, valid: code === DEV_OTP_CODE };
    }
    // Appel réel API
  },
  
  getDevCode(): string | null {
    return DEV_MODE ? DEV_OTP_CODE : null;
  },
  
  isDevMode(): boolean {
    return DEV_MODE;
  }
};
```

### 2. `src/components/auth/SuperAdminAuth.tsx`
- Badge DEV dans le titre
- Alert jaune avec le code
- Toast avec durée 30s

---

## ⚙️ Configuration

### Changer le code de test
Dans `twilioVerifyService.ts`:
```typescript
const DEV_OTP_CODE = '999999'; // Votre code préféré
```

### Forcer le mode production en dev
Dans `twilioVerifyService.ts`:
```typescript
const DEV_MODE = false; // Force le mode production
```

---

## 🐛 Dépannage

### Le badge DEV n'apparaît pas
- Vérifier `import.meta.env.MODE === 'development'`
- Relancer avec `bun run dev`

### Le code ne fonctionne pas
- Vérifier que vous utilisez **`123456`**
- Vérifier les logs console
- Vérifier que `DEV_MODE = true`

### L'API Twilio ne fonctionne toujours pas
- C'est normal en local (problème TLS)
- Utiliser le mode DEV pour tester
- Déployer en production pour tester l'API réelle

---

## ✅ Avantages du mode DEV

1. **🚀 Pas besoin de Twilio** pour le développement
2. **⚡ Tests rapides** sans délai réseau
3. **🔒 Pas de coût** d'API Twilio en dev
4. **🧪 Tests reproductibles** avec code fixe
5. **📝 Logs détaillés** pour le debug
6. **🎨 Interface claire** avec badge et alerts
7. **🔄 Basculement automatique** en production

---

## 🚀 Prochaines étapes

1. **En développement**: Utiliser le mode DEV avec le code `123456`
2. **En production**: 
   - Résoudre les problèmes de connexion Twilio
   - Ou déployer sur un environnement cloud
   - Le mode production s'activera automatiquement

---

**Code de test**: `123456`  
**Mode**: Automatique (dev/prod)  
**Dernière mise à jour**: 17 octobre 2025

