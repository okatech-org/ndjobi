# 🔐 Accès Supabase pour Cursor

## Informations de Connexion

### Project Details
```
Project ID: xfxqwlbqysiezqdpeqpv
Supabase URL: https://xfxqwlbqysiezqdpeqpv.supabase.co
```

### Clés d'API

#### Anon Key (Public - Safe for client-side)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
```

#### Service Role Key
⚠️ Disponible dans les secrets du backend Lovable Cloud (nécessaire pour les opérations d'administration)

## 📦 Variables d'Environnement

Pour votre `.env` local ou configuration Cursor:

```env
VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
VITE_SUPABASE_PROJECT_ID=xfxqwlbqysiezqdpeqpv
```

## 🔑 Secrets Configurés

Les secrets suivants sont déjà configurés dans Supabase:

- `ANTHROPIC_API_KEY` - Pour Claude AI
- `OPENAI_API_KEY` - Pour GPT
- `DEEPGRAM_API_KEY` - Pour Speech-to-Text
- `ELEVENLABS_API_KEY` - Pour Text-to-Speech
- `TWILIO_ACCOUNT_SID` - Pour SMS/WhatsApp
- `TWILIO_AUTH_TOKEN` - Pour Twilio Auth
- `TWILIO_VERIFY_SERVICE_SID` - Pour vérification
- `SUPABASE_SERVICE_ROLE_KEY` - Clé admin
- `SUPABASE_ANON_KEY` - Clé publique
- `GAMMA_API_KEY` - Pour Gamma
- `MCP_API_KEY` - Pour MCP
- `LOVABLE_API_KEY` - Pour Lovable AI

## 💻 Utilisation dans Cursor

### 1. Client Supabase TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xfxqwlbqysiezqdpeqpv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k'

const supabase = createClient(supabaseUrl, supabaseKey)
```

### 2. Client Admin (Service Role)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xfxqwlbqysiezqdpeqpv.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

## 📊 Structure de la Base de Données

### Tables Principales

- `profiles` - Profils utilisateurs
- `user_roles` - Rôles (super_admin, admin, sub_admin, agent, user)
- `signalements` - Signalements/rapports
- `projets` - Projets protégés
- `presidential_decisions` - Décisions présidentielles
- `presidential_directives` - Directives présidentielles
- `iasted_conversations` - Conversations avec l'IA
- `iasted_knowledge_base` - Base de connaissances IA
- `national_kpis` - KPIs nationaux
- `subadmin_performance` - Performance des sous-admins
- `user_pins` - PINs utilisateurs
- `pin_attempts` - Tentatives de connexion

### Enum Types

```sql
-- Rôles disponibles
app_role: 'super_admin' | 'admin' | 'sub_admin' | 'agent' | 'user'
```

## 🛠️ Fonctions Utiles

### Vérifier un rôle
```typescript
const { data, error } = await supabase.rpc('has_role', {
  _user_id: userId,
  _role: 'admin'
})
```

### Obtenir le rôle d'un utilisateur
```typescript
const { data, error } = await supabase.rpc('get_user_role', {
  _user_id: userId
})
```

### Vérifier si c'est le président
```typescript
const { data, error } = await supabase.rpc('is_president', {
  _user_id: userId
})
```

## 🔐 Sécurité RLS

Toutes les tables ont des Row Level Security (RLS) policies activées:

- **Super Admin**: Accès complet à tout
- **Admin (Président)**: Accès complet aux signalements, projets, décisions
- **Sub-Admin**: Accès limité à leur secteur
- **Agent**: Accès aux cas assignés
- **User**: Accès à leurs propres données uniquement

## 📝 Scripts SQL Disponibles

Consultez le dossier `scripts/` pour:
- Création de comptes démo
- Vérification des rôles
- Nettoyage de données
- Migrations

## 🚀 Edge Functions

Les fonctions suivantes sont déployées:
- `iasted-chat` - Chat avec l'IA
- `iasted-stt` - Speech-to-Text
- `iasted-tts` - Text-to-Speech
- `send-email` - Envoi d'emails
- `send-sms` - Envoi de SMS
- `send-whatsapp` - Envoi WhatsApp
- `start-verification` - Démarrer vérification
- `check-verification` - Vérifier code
- `verify-pin` - Vérifier PIN
- `reset-super-admin-pin` - Réinitialiser PIN super admin

## 📞 Support

Pour accéder au backend et gérer les secrets:
- Utilisez l'interface Lovable Cloud
- Les modifications de schéma se font via migrations SQL
- Les secrets se gèrent via l'interface des secrets

---

⚠️ **IMPORTANT**: 
- Ne jamais exposer la Service Role Key côté client
- Toujours utiliser RLS pour la sécurité
- Les secrets sont stockés de manière sécurisée dans Supabase
- Tester les policies RLS avant déploiement en production
