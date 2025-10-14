# Corrections du Système de Signalement NDJOBI

## Problèmes identifiés et corrigés

### 1. **Structure de la table `signalements` non conforme**

#### Problèmes
- Champ `user_id` obligatoire (non nullable) empêchait les signalements anonymes
- Colonnes manquantes : `is_anonymous`, `gps_latitude`, `gps_longitude`, `submission_method`, `device_id`
- Champ `title` obligatoire mais non fourni par le code

#### Solutions appliquées
✅ **Migration SQL** : `/scripts/fix-signalements-structure.sql`
- Rend `user_id` nullable
- Ajoute toutes les colonnes manquantes
- Crée les index pour les performances
- Met à jour les politiques RLS

---

### 2. **Code des formulaires corrigé**

#### `ReportFormStepper.tsx` (Formulaire principal avec étapes)
**Problèmes :**
- Utilisait la table `reports` inexistante
- Noms de colonnes incorrects (`latitude` au lieu de `gps_latitude`)
- Champs `witness_name` et `witness_contact` envoyés directement (colonnes inexistantes)
- Champ `title` manquant

**Corrections :**
```typescript
// Avant
.from('reports')
.insert([{
  user_id: formData.is_anonymous ? null : user?.id,
  latitude: formData.latitude,           // ❌ Nom incorrect
  longitude: formData.longitude,         // ❌ Nom incorrect
  witness_name: formData.witness_name,   // ❌ Colonne inexistante
  evidence_files: [...files],            // ❌ Nom incorrect
}])

// Après
.from('signalements')
.insert([{
  title: `Signalement de ${formData.type}`,    // ✅ Ajouté
  user_id: formData.is_anonymous ? null : user?.id,
  gps_latitude: formData.latitude,              // ✅ Nom correct
  gps_longitude: formData.longitude,            // ✅ Nom correct
  is_anonymous: formData.is_anonymous,          // ✅ Ajouté
  attachments: [...files],                      // ✅ Nom correct
  submission_method: 'form',                    // ✅ Ajouté
  metadata: {                                   // ✅ Utilise metadata
    witness_name: formData.witness_name,
    witness_contact: formData.witness_contact,
  },
}])
```

#### `ReportForm.tsx` (Formulaire simple)
**Problèmes similaires + champ `anonymous` au lieu de `is_anonymous`**

**Corrections :**
```typescript
// Avant
const reportData = {
  ...data,
  anonymous: isAnonymous,  // ❌ Nom incorrect
  // ❌ Pas de title
  // ❌ Pas de user_id
}

// Après
const reportData = {
  title: `Signalement de ${data.type}`,
  user_id: isAnonymous ? null : user?.id,
  type: data.type,
  location: data.location,
  description: data.description,
  is_anonymous: isAnonymous,
  submission_method: 'form',
  metadata: {
    witness_name: data.witness_name,
    witness_contact: data.witness_contact,
  },
}
```

---

### 3. **Chatbot IA (NdjobiAIAgent.tsx)**

#### Problème
- Champ `title` manquant dans `signalementData`

#### Correction
```typescript
// Avant
const signalementData: any = {
  type: collectedData.type,
  // ❌ Pas de title
  location: collectedData.location,
  ...
}

// Après
const signalementData: any = {
  title: `Signalement de ${collectedData.type || 'corruption'}`,  // ✅ Ajouté
  type: collectedData.type,
  location: collectedData.location,
  ...
}
```

---

## 📋 Instructions d'application

### Étape 1 : Appliquer la migration SQL

1. Ouvrir Supabase Dashboard → SQL Editor
2. Copier le contenu de `/scripts/fix-signalements-structure.sql`
3. Exécuter le script
4. Vérifier les messages de confirmation

### Étape 2 : Mettre à jour les types TypeScript

```bash
# Si vous utilisez Supabase CLI localement
supabase db pull

# Ou régénérer les types
npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts
```

### Étape 3 : Tester le système

#### Test 1 : Signalement anonyme via formulaire
1. Aller sur `/report` (sans connexion)
2. Remplir le formulaire
3. Vérifier l'envoi sans erreur
4. Vérifier dans Supabase que `user_id` est `NULL` et `is_anonymous` est `true`

#### Test 2 : Signalement identifié via formulaire
1. Se connecter avec un compte
2. Aller sur `/dashboard/user?view=report`
3. Désactiver le mode anonyme
4. Soumettre le formulaire
5. Vérifier que `user_id` est renseigné et `is_anonymous` est `false`

#### Test 3 : Signalement via chatbot
1. Cliquer sur l'icône du chatbot
2. Suivre le flow "Taper le Ndjobi"
3. Vérifier l'envoi sans erreur
4. Vérifier que `submission_method` = `'chat_ai'`

---

## 🎯 Résultat attendu

### ✅ Signalement anonyme (sans connexion)
```json
{
  "id": "uuid",
  "title": "Signalement de extorsion",
  "type": "extorsion",
  "description": "...",
  "location": "...",
  "user_id": null,
  "is_anonymous": true,
  "device_id": "device-fingerprint-xyz",
  "submission_method": "form",
  "status": "pending",
  "gps_latitude": 0.123456,
  "gps_longitude": 9.654321,
  "metadata": {},
  "attachments": []
}
```

### ✅ Signalement identifié (connecté)
```json
{
  "id": "uuid",
  "title": "Signalement de corruption",
  "type": "corruption",
  "description": "...",
  "location": "...",
  "user_id": "user-uuid",
  "is_anonymous": false,
  "submission_method": "form",
  "status": "pending",
  "metadata": {
    "witness_name": "Jean Dupont",
    "witness_contact": "+241..."
  }
}
```

---

## 🔍 Vérification des corrections

### Vérifier la structure de la table
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'signalements' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Compter les signalements par type
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_anonymous = true THEN 1 END) as anonymes,
  COUNT(CASE WHEN is_anonymous = false THEN 1 END) as identifies
FROM public.signalements;
```

---

## 🚀 Déploiement

Une fois les tests réussis en local :

1. Appliquer la migration sur l'environnement de production
2. Redéployer l'application frontend
3. Surveiller les logs d'erreur
4. Tester en production avec des signalements de test

---

## 📝 Notes importantes

- **Les signalements anonymes** utilisent `device_id` pour permettre le tracking si l'utilisateur crée un compte plus tard
- **Le champ `metadata`** (JSON) stocke les informations supplémentaires non standardisées
- **Le champ `submission_method`** permet de différencier les sources : `form`, `chat_ai`, `api`
- **Les politiques RLS** permettent aux utilisateurs de voir uniquement leurs signalements et aux agents/admins de tout voir

---

## ❓ En cas de problème

Si vous rencontrez l'erreur `column "xxx" does not exist` :
1. Vérifiez que la migration SQL a été appliquée
2. Vérifiez les types TypeScript générés
3. Vérifiez que le code utilise les bons noms de colonnes

Si les signalements anonymes ne fonctionnent pas :
1. Vérifiez que `user_id` est nullable dans la base
2. Vérifiez les politiques RLS
3. Vérifiez que `is_anonymous` est à `true` dans le code

