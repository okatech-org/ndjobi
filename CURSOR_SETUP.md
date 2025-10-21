# Configuration Cursor pour NDJOBI - Protocole d'État

## 📋 Comptes de Test Disponibles

### 1. Compte Président (Dashboard Présidentiel)
- **Téléphone**: `77888001` (ou `+24177888001`)
- **Email**: `24177888001@ndjobi.com`
- **PIN**: `111111`
- **Rôle**: Admin (Président)
- **Dashboard**: `/admin` (Vue Présidentielle)

### 2. Compte Super Admin
- **Code**: `011282*`
- **Dashboard**: `/super-admin`
- **Rôle**: Super Admin
- **Note**: Accès complet au système

### 3. Sous-Admins
- **DGSS**: `77888002` / PIN: `111111`
- **DGR**: `77888003` / PIN: `111111`

---

## 🔐 Configuration Supabase pour Cursor

### Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase Configuration (Public - OK pour dev)
VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
VITE_SUPABASE_PROJECT_ID=xfxqwlbqysiezqdpeqpv

# Super Admin Code
VITE_SUPER_ADMIN_CODE=011282*
```

### Accès Admin Supabase (Service Role)

Pour les migrations et opérations admin, vous aurez besoin de la **Service Role Key**.

⚠️ **ATTENTION**: Ne JAMAIS commiter cette clé dans le code!

1. Récupérez la clé depuis le Backend Lovable Cloud
2. Ajoutez-la à votre `.env.local` :

```env
# ⚠️ ADMIN ONLY - Ne pas commiter!
SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key_ici>
```

---

## 🚀 Utilisation dans Cursor

### 1. Configuration du Client Supabase

Le client est déjà configuré dans `src/integrations/supabase/client.ts` :

```typescript
import { supabase } from "@/integrations/supabase/client";

// Exemple: Récupérer les signalements
const { data, error } = await supabase
  .from('signalements')
  .select('*')
  .order('created_at', { ascending: false });
```

### 2. Authentification

```typescript
import { supabase } from "@/integrations/supabase/client";

// Connexion avec téléphone et mot de passe
const { data, error } = await supabase.auth.signInWithPassword({
  phone: '+24177888001',
  password: '111111'
});

// Vérifier la session
const { data: { session } } = await supabase.auth.getSession();

// Récupérer l'utilisateur actuel
const { data: { user } } = await supabase.auth.getUser();
```

### 3. Requêtes avec RLS

Les politiques RLS (Row Level Security) sont automatiquement appliquées :

```typescript
// Récupérer les KPIs nationaux (Admin/President seulement)
const { data: kpis } = await supabase
  .from('national_kpis')
  .select('*')
  .order('period_start', { ascending: false })
  .limit(1)
  .single();

// Récupérer les directives présidentielles
const { data: directives } = await supabase
  .from('presidential_directives')
  .select('*')
  .order('issued_at', { ascending: false });
```

---

## 📊 Structure de la Base de Données

### Tables Principales

1. **profiles** - Profils utilisateurs
2. **user_roles** - Rôles des utilisateurs
3. **signalements** - Signalements de corruption
4. **projets** - Projets protégés
5. **national_kpis** - Indicateurs nationaux
6. **presidential_decisions** - Décisions présidentielles
7. **presidential_directives** - Directives présidentielles
8. **subadmin_performance** - Performance des sous-admins
9. **iasted_conversations** - Conversations avec l'IA

### Rôles Disponibles
- `super_admin` - Accès complet
- `admin` - Dashboard présidentiel + gestion
- `sub_admin` - Gestion sectorielle (DGSS/DGR)
- `agent` - Traitement des cas assignés
- `user` - Utilisateur standard

---

## 🔧 Migrations et Modifications

### Exécuter une Migration

```bash
# Via Supabase CLI (si installé)
supabase migration up

# Ou via l'outil Lovable
# Les migrations sont dans supabase/migrations/
```

### Créer une Nouvelle Migration

```sql
-- Exemple: Ajouter une colonne
ALTER TABLE signalements 
ADD COLUMN IF NOT EXISTS urgence_level INTEGER DEFAULT 1;

-- Créer une fonction RLS helper
CREATE OR REPLACE FUNCTION public.is_president(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = 'admin'::app_role
  );
$$;
```

---

## 🎨 Routes et Navigation

### Routes Principales

- `/` - Page d'accueil
- `/auth` - Authentification
- `/admin` - Dashboard Admin/Président
- `/super-admin` - Dashboard Super Admin
- `/agent` - Dashboard Agent
- `/user` - Dashboard Utilisateur

### Dashboard Président (`/admin`)

Composants clés :
- `src/pages/dashboards/President/index.tsx`
- `src/pages/dashboards/President/components/VueEnsemble.tsx`
- `src/pages/dashboards/President/components/OpinionPublique.tsx`
- `src/pages/dashboards/President/components/SituationsCritiques.tsx`
- `src/pages/dashboards/President/components/VisionNationale.tsx`

---

## 🧪 Testing avec Cursor

### 1. Démarrer le Dev Server

```bash
npm run dev
# ou
bun dev
```

### 2. Se Connecter

1. Aller sur `/auth`
2. Utiliser les credentials du Président :
   - Téléphone: `77888001`
   - PIN: `111111`
3. Vous serez redirigé vers `/admin`

### 3. Tester les Fonctionnalités

- Navigation entre les onglets
- Consultation des KPIs
- Gestion des signalements critiques
- Directives présidentielles
- Assistant IA (bouton flottant)

---

## 📝 Notes Importantes

1. **RLS Policies** : Toutes les tables ont des politiques de sécurité strictes
2. **Authentication** : Utilise Supabase Auth avec sessions JWT
3. **Realtime** : Notifications en temps réel via Supabase Realtime
4. **Edge Functions** : Fonctions serverless pour IA et logique métier
5. **Storage** : Supabase Storage pour les fichiers uploadés

---

## 🆘 Résolution de Problèmes

### Erreur "Database error querying schema"
✅ **Corrigé** : Les valeurs NULL dans auth.users ont été nettoyées

### Impossible de se connecter
1. Vérifier les credentials
2. Vérifier la connexion Supabase
3. Consulter les logs dans la console du navigateur

### RLS Policy Error
- Vérifier que l'utilisateur a le bon rôle dans `user_roles`
- Vérifier que le rôle correspond à la policy

---

## 📞 Support

Pour toute question, consulter :
- Documentation Supabase : https://supabase.com/docs
- Lovable Cloud : Backend intégré
- Logs : Console navigateur + Supabase Logs

---

**Version**: 1.0  
**Dernière mise à jour**: 21 octobre 2025
