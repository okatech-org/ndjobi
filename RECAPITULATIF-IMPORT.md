# 📊 RÉCAPITULATIF - Configuration Import NDJOBI

## ✅ Ce qui a été configuré

J'ai préparé tous les scripts et fichiers nécessaires pour importer vos données de simulation dans Supabase :

### 📁 Fichiers créés

1. **`COMMENT-IMPORTER.md`** - Guide rapide en français ⭐
2. **`GUIDE-IMPORT-DONNEES.md`** - Guide technique complet
3. **`scripts/run-import.sh`** - Script d'import automatisé
4. **`scripts/quick-import-check.ts`** - Vérification pré-import
5. **`DEBUT-ICI.txt`** - Instructions ultra-rapides

### 📦 Données disponibles

Les fichiers de données sont déjà présents dans `scripts/data/` :

- ✅ `ndjobi-users-dataset.json` - 112 utilisateurs (67 anonymes + 45 identifiés)
- ✅ `ndjobi-signalements-dataset.json` - 27 signalements complets
- ✅ `ndjobi-ia-config.json` - Configuration IA STED
- ✅ `ndjobi-articles-presse.json` - Articles de presse

### 🔧 Commandes NPM ajoutées

- `npm run simulation:check` - Vérifie la configuration avant import
- `npm run simulation:import` - Lance l'import des données
- `npm run simulation:verify` - Vérifie les données après import

---

## 🎯 Ce qu'il vous reste à faire

### Étape 1 : Récupérer la Service Role Key

Vous m'avez fourni :
- ✅ Project ID : `xfxqwlbqysiezqdpeqpv`
- ✅ URL : `https://xfxqwlbqysiezqdpeqpv.supabase.co`
- ✅ Anon Key (public)

Il vous manque :
- ⚠️ **Service Role Key** (clé d'administration)

**Pour la récupérer :**

1. Allez sur : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api
2. Scrollez jusqu'à "Project API keys"
3. Copiez la valeur de **"service_role"** (pas "anon" !)

> 💡 La Service Role Key est différente de l'Anon Key. Elle commence par `eyJ...` mais contient `"role":"service_role"` dans son payload.

### Étape 2 : Exécuter l'import

```bash
# Terminal
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
cd /Users/okatech/ndjobi
./scripts/run-import.sh
```

**OU** avec npm :

```bash
export VITE_SUPABASE_URL="https://xfxqwlbqysiezqdpeqpv.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
npm run simulation:import
```

### Étape 3 : Vérifier

Après l'import, vérifiez dans Supabase :

- **Profiles** : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/editor?table=profiles
  → Devrait avoir ~49 utilisateurs

- **Signalements** : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/editor?table=signalements
  → Devrait avoir 27+ signalements

---

## 📊 Détails de l'import

### Utilisateurs qui seront créés

#### Comptes Administrateurs (4)

| Rôle | Téléphone | Email | Fonction |
|------|-----------|-------|----------|
| Super Admin | +33661002616 | 33661002616@ndjobi.com | Super Administrateur Système |
| Admin | +24177888001 | 24177888001@ndjobi.com | Président de la République |
| Sous-Admin | +24177888002 | 24177888002@ndjobi.com | DGSS |
| Sous-Admin | +24177888003 | 24177888003@ndjobi.com | DGR |

> ⚠️ **Note importante** : Le script vérifie si ces comptes existent déjà. S'ils existent, il met à jour leurs profils et rôles (UPSERT).

#### Utilisateurs citoyens (45)

- Citoyens gabonais avec profils complets
- Répartis dans différentes régions (Estuaire, Haut-Ogooué, Ogooué-Maritime, etc.)
- Avec niveaux de vérification variés (email, téléphone)
- Mot de passe par défaut : `SimulationPass2025!`

### Signalements qui seront créés (27+)

| Type | Nombre | Exemples |
|------|--------|----------|
| **Corruption** | 12 | Détournements, enrichissement illicite, marchés publics |
| **Problématiques** | 8 | Santé, éducation, infrastructures |
| **Suggestions** | 7 | Améliorations de services publics |

**Caractéristiques** :
- Tous avec coordonnées GPS (PostGIS)
- Preuves associées (documents, photos, vidéos)
- Analyses IA (scores crédibilité/urgence)
- Répartition géographique réaliste

### Données complémentaires

- **Preuves** : Documents, photos, vidéos liés aux signalements
- **Statistiques** : KPIs nationaux agrégés
- **Métadonnées** : IP, device fingerprint, user agents (anonymisés)

---

## 🔐 Connexion après import

### Interface Web

1. Lancez l'app : `npm run dev`
2. Accédez à : http://localhost:5173
3. Cliquez sur "Se connecter"

### Méthodes de connexion

**Pour les admins** :
- Téléphone + Code PIN (6 chiffres)
- Les PINs sont dans la table `user_pins`

**Pour les utilisateurs** :
- Email + Mot de passe (`SimulationPass2025!`)

---

## ⚠️ Troubleshooting

### Le script demande la Service Role Key

```bash
# Vérifiez qu'elle est exportée
echo $SUPABASE_SERVICE_ROLE_KEY

# Si vide, exportez-la
export SUPABASE_SERVICE_ROLE_KEY="votre_cle"
```

### Erreur "Unauthorized"

- Vous utilisez probablement l'Anon Key au lieu de la Service Role Key
- Vérifiez sur le dashboard Supabase

### Erreur "User already exists"

- C'est **normal** si vous ré-exécutez le script
- Le script fait un UPSERT (création ou mise à jour)

### Erreur "Table does not exist"

```bash
# Appliquez d'abord les migrations
cd /Users/okatech/ndjobi/supabase
supabase db push
```

---

## 📈 Performance

**Temps d'exécution estimé** :
- Création utilisateurs : ~2 minutes (49 comptes)
- Import signalements : ~1 minute (27 signalements)
- Génération stats : ~30 secondes
- **TOTAL** : ~3-5 minutes

**Ressources utilisées** :
- ~49 lignes dans `profiles`
- ~49 lignes dans `user_roles`
- ~27 lignes dans `signalements`
- ~50+ lignes dans `preuves`
- ~1 ligne dans `statistiques_cache`

---

## 🎉 Après l'import

### Tests recommandés

1. **Se connecter en tant que Super Admin**
   ```
   Téléphone: +33661002616
   PIN: (vérifier dans user_pins)
   ```

2. **Explorer le dashboard**
   - KPIs nationaux
   - Carte des signalements
   - Liste des cas critiques

3. **Tester l'IA STED**
   - Analyser un signalement existant
   - Poser des questions sur les données

4. **Vérifier les rôles**
   ```sql
   SELECT p.email, p.full_name, p.role, ur.role as role_assigned
   FROM profiles p
   LEFT JOIN user_roles ur ON ur.user_id = p.id
   WHERE p.role IN ('super_admin', 'admin', 'sous_admin')
   ORDER BY p.role;
   ```

---

## 📞 Support

**Fichiers de référence** :
- `COMMENT-IMPORTER.md` - Guide rapide
- `GUIDE-IMPORT-DONNEES.md` - Guide technique complet
- `DEBUT-ICI.txt` - Instructions ultra-rapides

**En cas de problème** :
1. Lisez les logs du script (très détaillés)
2. Vérifiez la console Supabase
3. Consultez les guides ci-dessus

---

## 🎯 Résumé ultra-rapide

```bash
# 1. Récupérez votre Service Role Key sur Supabase
# 2. Exportez-la :
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# 3. Lancez l'import :
cd /Users/okatech/ndjobi
./scripts/run-import.sh

# C'est tout ! ✅
```

---

**Créé le** : 19 janvier 2025  
**Project** : NDJOBI - Plateforme Nationale Anticorruption  
**Supabase Project ID** : xfxqwlbqysiezqdpeqpv

