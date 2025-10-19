# 🚀 Comment importer les données NDJOBI ?

## ⚡ Version ultra-rapide (3 étapes)

### Étape 1 : Récupérez votre Service Role Key

1. Allez sur : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api
2. Copiez la clé **"service_role"** (dans la section "Project API keys")

### Étape 2 : Exportez la clé dans votre terminal

```bash
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M..."
```

> ⚠️ Remplacez par VOTRE clé complète !

### Étape 3 : Lancez l'import

```bash
cd /Users/okatech/ndjobi
./scripts/run-import.sh
```

**C'est tout !** 🎉

---

## 📋 Version détaillée

### Option A : Script automatique (Recommandé)

```bash
cd /Users/okatech/ndjobi

# 1. Définir la Service Role Key
export SUPABASE_SERVICE_ROLE_KEY="votre_cle_service_role"

# 2. Vérifier que tout est OK
npm run simulation:check

# 3. Lancer l'import
./scripts/run-import.sh
```

### Option B : Commande NPM directe

```bash
cd /Users/okatech/ndjobi

export VITE_SUPABASE_URL="https://xfxqwlbqysiezqdpeqpv.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="votre_cle_service_role"

npm run simulation:import
```

---

## 📊 Ce qui sera importé

| Type | Nombre | Description |
|------|--------|-------------|
| 👑 **Comptes Admin** | 4 | Super Admin, Admin Président, 2 Sous-Admins |
| 👤 **Utilisateurs** | 45 | Citoyens gabonais identifiés |
| 📝 **Signalements** | 27+ | Cas de corruption + problématiques diverses |
| 📊 **Stats** | 1 | Statistiques nationales agrégées |

---

## ✅ Vérification après import

### Dans Supabase Dashboard

- **Profiles** : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/editor?table=profiles
  - Devrait contenir ~49 entrées (4 admins + 45 users)

- **Signalements** : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/editor?table=signalements
  - Devrait contenir 27+ signalements

### Via commande

```bash
npm run simulation:verify
```

---

## 🔑 Se connecter après l'import

### Comptes administrateurs créés :

| Rôle | Téléphone | Email |
|------|-----------|-------|
| **Super Admin** | +33661002616 | 33661002616@ndjobi.com |
| **Admin** | +24177888001 | 24177888001@ndjobi.com |
| **Sous-Admin DGSS** | +24177888002 | 24177888002@ndjobi.com |
| **Sous-Admin DGR** | +24177888003 | 24177888003@ndjobi.com |

**Connexion** : Utilisez le numéro de téléphone + code PIN (6 chiffres)

> 💡 Les PINs sont stockés dans la table `user_pins`

---

## ⚠️ Problèmes fréquents

### "SUPABASE_SERVICE_ROLE_KEY not found"

```bash
# Vérifiez que la variable est exportée
echo $SUPABASE_SERVICE_ROLE_KEY

# Si vide, exportez-la à nouveau
export SUPABASE_SERVICE_ROLE_KEY="votre_cle"
```

### "Unauthorized" ou "Invalid API key"

- Vérifiez que vous utilisez la **Service Role Key** (pas l'Anon Key)
- La Service Role Key contient `"role":"service_role"` dans son payload JWT

### "User already exists"

- C'est **normal** ! Le script fait un UPSERT
- Les profils existants seront mis à jour, pas dupliqués

### "Table does not exist"

```bash
# Vérifiez que les migrations sont appliquées
cd supabase
supabase db push
```

---

## 🛡️ Sécurité

⚠️ **TRÈS IMPORTANT** :

- ❌ **NE JAMAIS** commiter la Service Role Key dans Git
- ❌ **NE JAMAIS** l'utiliser dans le frontend
- ✅ Utilisez-la **uniquement** pour les scripts backend
- ✅ Elle contourne **toutes** les règles RLS

La Service Role Key donne un accès **total** à votre base de données !

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez les logs détaillés du script d'import
2. Vérifiez la console Supabase : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv
3. Relisez le guide complet : `GUIDE-IMPORT-DONNEES.md`

---

## 🎉 Après l'import

1. Lancez l'app : `npm run dev`
2. Accédez à : http://localhost:5173
3. Connectez-vous avec un compte admin
4. Explorez les signalements importés
5. Testez l'IA STED avec les données

**Temps total** : ~3-5 minutes ⏱️

