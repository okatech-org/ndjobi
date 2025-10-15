# 🧪 Guide de Test - Signalements NDJOBI

## ✅ Prérequis
- ✅ Migration SQL appliquée en local
- ✅ Types TypeScript régénérés
- ✅ Serveur dev en cours : http://localhost:5173
- ✅ Supabase local en cours : http://127.0.0.1:54323

---

## 🎯 Test 1 : Signalement Anonyme (Sans connexion)

### Étapes :
1. **Ouvrir** : http://localhost:5173/report
2. **Vérifier** : Vous n'êtes PAS connecté (pas de bouton profil en haut)
3. **Remplir le formulaire** :
   - Type : Sélectionner un type (ex: Extorsion)
   - Description : Écrire au moins 20 caractères
   - Lieu : Indiquer un lieu
4. **Vérifier** : Le switch "Mode anonyme" est **activé** par défaut
5. **Soumettre** le formulaire
6. **Résultat attendu** : 
   - ✅ Message de succès "Signalement enregistré !"
   - ✅ PAS d'erreur dans la console

### Vérification en base de données :
```bash
# Ouvrir Supabase Studio local
open http://127.0.0.1:54323

# Ou requête SQL directe :
cd /Users/okatech/ndjobi && supabase db psql -c "SELECT id, title, type, is_anonymous, user_id FROM signalements ORDER BY created_at DESC LIMIT 5;"
```

**Résultat attendu** :
- `is_anonymous` = `true` (ou `t`)
- `user_id` = `NULL`

---

## 🎯 Test 2 : Signalement Identifié (Avec connexion)

### Étapes :
1. **Se connecter** : http://localhost:5173/auth
   - Utiliser un compte démo (ex: +241 77 777 001, PIN: 123456)
2. **Aller sur** : http://localhost:5173/dashboard/user?view=report
3. **Vérifier** : Le switch "Mode anonyme" est activé
4. **Désactiver** le mode anonyme (cliquer sur le switch)
5. **Vérifier** : Les champs "Nom" et "Contact" apparaissent
6. **Remplir** :
   - Type : Détournement de fonds
   - Description : Au moins 20 caractères
   - Lieu : Un lieu
   - Nom : Jean Dupont (facultatif)
   - Contact : +241... (facultatif)
7. **Soumettre**
8. **Résultat attendu** :
   - ✅ Message de succès
   - ✅ Pas d'erreur

### Vérification en base :
```bash
supabase db psql -c "SELECT id, title, type, is_anonymous, user_id IS NOT NULL as has_user, metadata FROM signalements ORDER BY created_at DESC LIMIT 5;"
```

**Résultat attendu** :
- `is_anonymous` = `false` (ou `f`)
- `user_id` = UUID de l'utilisateur connecté
- `metadata` contient les infos de contact

---

## 🎯 Test 3 : Signalement via Chatbot

### Étapes :
1. **Cliquer** sur l'icône du chatbot (coin inférieur droit)
2. **Dire** : "Je veux signaler une corruption"
3. **Suivre** les instructions du chatbot
4. **Répondre** aux questions :
   - Type de corruption
   - Description
   - Lieu
5. **Confirmer** l'envoi
6. **Résultat attendu** :
   - ✅ Message "Ndjobi tapé avec succès !"
   - ✅ Numéro de dossier affiché

### Vérification :
```bash
supabase db psql -c "SELECT id, title, submission_method, is_anonymous FROM signalements WHERE submission_method = 'chat_ai' ORDER BY created_at DESC LIMIT 3;"
```

**Résultat attendu** :
- `submission_method` = `chat_ai`
- `title` contient "Signalement de..."

---

## 🔍 Requêtes SQL Utiles

### Voir tous les signalements
```sql
SELECT 
  id,
  title,
  type,
  is_anonymous,
  user_id IS NOT NULL as has_user,
  submission_method,
  created_at
FROM signalements
ORDER BY created_at DESC
LIMIT 10;
```

### Compter par type
```sql
SELECT 
  submission_method,
  COUNT(*) as total,
  COUNT(CASE WHEN is_anonymous = true THEN 1 END) as anonymes,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as identifies
FROM signalements
GROUP BY submission_method;
```

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

---

## ❌ En cas d'erreur

### Erreur "column does not exist"
→ Les types ne sont pas à jour
```bash
cd /Users/okatech/ndjobi
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Erreur "user_id cannot be null"
→ La migration n'est pas appliquée
```bash
supabase db reset
```

### Signalement ne s'enregistre pas
→ Vérifier la console du navigateur (F12)
→ Vérifier les logs Supabase Studio

---

## ✅ Critères de Réussite

- [ ] Signalement anonyme fonctionne sans connexion
- [ ] user_id est NULL pour les anonymes
- [ ] is_anonymous est true pour les anonymes
- [ ] Signalement identifié fonctionne avec connexion
- [ ] user_id est rempli pour les identifiés
- [ ] is_anonymous peut être false
- [ ] Chatbot enregistre correctement
- [ ] Aucune erreur dans la console
- [ ] title est automatiquement généré
- [ ] metadata contient les infos supplémentaires

---

## 🚀 Prochaine étape

Une fois les tests réussis en **local**, appliquer sur **production** :

1. Copier le script SQL : `/Users/okatech/ndjobi/scripts/fix-signalements-structure.sql`
2. Aller sur https://supabase.com/dashboard → SQL Editor
3. Coller et exécuter le script
4. Régénérer les types production :
   ```bash
   npx supabase gen types typescript --project-id <votre-project-id> > src/integrations/supabase/types.ts
   ```
5. Redéployer l'application

