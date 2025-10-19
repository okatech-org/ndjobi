# 🚀 GUIDE D'IMPORT DES DONNÉES NDJOBI

## 📋 Prérequis

### 1. Récupérer la Service Role Key

La clé Service Role est disponible dans votre Dashboard Supabase :

1. Allez sur : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api
2. Dans la section "Project API keys", copiez la clé **`service_role`** (⚠️ NE PAS confondre avec anon/public)

### 2. Variables d'environnement requises

```bash
VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key>
```

## 🎯 Méthode 1 : Import via commande NPM (Recommandé)

### Étape 1 : Configurer les variables

```bash
# Dans le terminal, exportez les variables :
export VITE_SUPABASE_URL="https://xfxqwlbqysiezqdpeqpv.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<VOTRE_SERVICE_ROLE_KEY_ICI>"
```

### Étape 2 : Exécuter l'import

```bash
cd /Users/okatech/ndjobi
npm run simulation:import
```

## 🎯 Méthode 2 : Import direct avec ts-node

```bash
cd /Users/okatech/ndjobi

# Installer ts-node si nécessaire
npm install -g ts-node

# Exécuter le script
VITE_SUPABASE_URL="https://xfxqwlbqysiezqdpeqpv.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<VOTRE_SERVICE_ROLE_KEY>" \
ts-node scripts/import-simulation-data.ts
```

## 📊 Ce qui sera importé

### 1. Comptes administrateurs (4 comptes)
- ✅ Super Admin : 33661002616@ndjobi.com
- ✅ Admin Président : 24177888001@ndjobi.com  
- ✅ Sous-Admin DGSS : 24177888002@ndjobi.com
- ✅ Sous-Admin DGR : 24177888003@ndjobi.com

### 2. Utilisateurs identifiés (45 comptes)
- Citoyens gabonais avec profils complets
- Différentes régions du Gabon
- Niveaux de vérification variés

### 3. Signalements (27+ cas)
- ✅ 12 dénonciations de corruption
- ✅ 8 problématiques diverses
- ✅ 7 suggestions d'amélioration
- Tous avec preuves et analyses IA

### 4. Statistiques nationales
- KPIs agrégés
- Performance régionale
- Montants récupérés

## 🔍 Vérification post-import

### Vérifier dans Supabase Dashboard

1. **Table `profiles`** : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/editor/28441?schema=public&table=profiles
   - Devrait contenir ~45+ utilisateurs

2. **Table `signalements`** : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/editor/28441?schema=public&table=signalements
   - Devrait contenir 27+ signalements

3. **Table `user_roles`** : Vérifier que les rôles sont bien assignés

### Vérifier via script

```bash
cd /Users/okatech/ndjobi
npm run simulation:verify
```

## ⚠️ Problèmes courants

### Erreur : "Unauthorized"
- Vérifiez que vous utilisez la **Service Role Key** et non l'Anon Key
- La Service Role Key commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` mais contient `"role":"service_role"`

### Erreur : "User already exists"
- Normal si les comptes admin existent déjà
- Le script fait un UPSERT pour mettre à jour les profils

### Erreur : "Table does not exist"
- Vérifiez que toutes les migrations Supabase sont appliquées
- Exécutez : `supabase db push` si vous utilisez le CLI Supabase

### Erreur : "SUPABASE_SERVICE_ROLE_KEY not found"
- Assurez-vous d'avoir exporté la variable d'environnement
- Utilisez `echo $SUPABASE_SERVICE_ROLE_KEY` pour vérifier

## 🔐 Sécurité

⚠️ **IMPORTANT** : La Service Role Key est ULTRA SENSIBLE

- ❌ NE JAMAIS commiter cette clé dans Git
- ❌ NE JAMAIS l'utiliser côté client (frontend)
- ✅ Utilisez-la uniquement pour les scripts d'import backend
- ✅ Elle contourne toutes les règles RLS (Row Level Security)

## 📞 Support

En cas de problème, vérifiez :

1. Les logs du script d'import (très détaillés)
2. Les erreurs dans la console Supabase
3. Les limites de votre plan Supabase (nombre d'utilisateurs)

## 🎉 Après l'import

Une fois l'import terminé :

1. ✅ Connectez-vous à l'app : http://localhost:5173
2. ✅ Testez les comptes admin avec leurs téléphones + PIN
3. ✅ Vérifiez que les signalements s'affichent
4. ✅ Testez le système IA STED avec les données importées

---

**Temps estimé d'import** : 2-5 minutes pour ~70 utilisateurs et 27 signalements

