# 🚀 Prochaines Étapes - Simulation NDJOBI

## ✅ Étapes Complétées

- ✅ Structure de dossiers créée
- ✅ Fichiers de données copiés dans `scripts/data/`
- ✅ Script d'import créé (`scripts/import-simulation-data.js`)
- ✅ Configuration environnement préparée

---

## 📋 Étapes Restantes

### 1️⃣ **INITIALISER LA BASE DE DONNÉES SUPABASE** (⚠️ PRIORITAIRE)

Vous devez d'abord créer les tables dans Supabase avant d'importer les données.

#### Option A : Via Supabase Studio (Recommandé)

1. **Allez sur [Supabase Dashboard](https://app.supabase.com)**
2. **Sélectionnez votre projet NDJOBI**
3. **Allez dans SQL Editor** (menu de gauche)
4. **Créez une nouvelle requête**
5. **Copiez le contenu du fichier** que je vais créer : `scripts/sql/ndjobi-init-database.sql`
6. **Exécutez le script** (bouton RUN)
7. **Attendez la confirmation** : `✅ Base de données NDJOBI initialisée avec succès!`

#### Option B : Via Supabase CLI

```bash
# Si vous avez installé Supabase CLI
supabase db push --file scripts/sql/ndjobi-init-database.sql
```

---

### 2️⃣ **CONFIGURER LA CLÉ DE SERVICE SUPABASE**

Une fois la base de données initialisée, vous devez récupérer la clé de service :

1. **Supabase Dashboard** → **Settings** → **API**
2. **Copiez la `service_role` key** (⚠️ PAS la clé `anon`)
3. **Créez le fichier `.env.local`** à la racine du projet :

```bash
# .env.local
VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k

# ⚠️ IMPORTANT: Remplacez par votre vraie clé
SUPABASE_SERVICE_ROLE_KEY=VOTRE_CLE_SERVICE_ICI
```

---

### 3️⃣ **EXÉCUTER L'IMPORT DES DONNÉES**

Une fois les étapes 1 et 2 complétées :

```bash
# Dans le terminal, à la racine du projet
node scripts/import-simulation-data.js
```

**Résultat attendu :**
```
╔══════════════════════════════════════════════════════════════╗
║         NDJOBI - IMPORT DONNÉES DE SIMULATION                ║
║              Script d'initialisation complète                ║
╚══════════════════════════════════════════════════════════════╝

🔌 Vérification connexion Supabase...
✅ Connexion Supabase OK

👑 Création des comptes administrateurs...
✅ Admin president@ndjobi.ga créé - Rôle: super_admin
✅ Admin admin.dgss@ndjobi.ga créé - Rôle: admin
...

📥 Import des utilisateurs...
✅ User temoin_peche@secure.ndjobi.ga créé avec succès
...

📥 Import des signalements...
✅ Signalement SIG-2025-001 créé avec succès
...

📊 Génération des statistiques initiales...
✅ Statistiques nationales générées

╔══════════════════════════════════════════════════════════════╗
║                    IMPORT TERMINÉ ✅                          ║
╚══════════════════════════════════════════════════════════════╝

⏱️  Durée totale: XX secondes

📊 RÉSUMÉ:
   • Admins créés: 6/6
   • Users importés: 45/45
   • Signalements importés: 300/300

🔑 IDENTIFIANTS DE CONNEXION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPER_ADMIN    | president@ndjobi.ga           | Admin2025Secure!
ADMIN          | admin.dgss@ndjobi.ga          | Admin2025Secure!
ADMIN          | admin.dgr@ndjobi.ga           | Admin2025Secure!
ADMIN          | admin.dglic@ndjobi.ga         | Admin2025Secure!
AGENT          | agent.mer@ndjobi.ga           | Admin2025Secure!
AGENT          | agent.interieur@ndjobi.ga     | Admin2025Secure!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 4️⃣ **VÉRIFIER LES DONNÉES DANS SUPABASE**

1. **Allez sur Supabase Dashboard** → **Table Editor**
2. **Vérifiez les tables suivantes** :
   - `profiles` : Doit contenir ~50 profils (6 admins + 45 users)
   - `signalements` : Doit contenir ~300 signalements
   - `preuves` : Doit contenir les preuves associées
   - `statistiques_cache` : Doit contenir 1 ligne (stats nationales)

3. **Exécutez ces requêtes SQL pour vérifier** :

```sql
-- Nombre de signalements par urgence
SELECT urgence, COUNT(*) 
FROM signalements 
GROUP BY urgence;

-- Signalements Gab Pêche
SELECT COUNT(*) 
FROM signalements 
WHERE categorie = 'malversation_gab_peche';

-- Cas critiques en attente
SELECT COUNT(*) 
FROM signalements 
WHERE urgence = 'critique' AND statut = 'nouveau';

-- Vérifier les comptes admin
SELECT email, role, full_name 
FROM profiles 
WHERE role IN ('super_admin', 'admin', 'agent');
```

---

### 5️⃣ **TESTER LES DASHBOARDS**

```bash
# Lancer l'application en mode développement
npm run dev
```

1. **Ouvrir** `http://localhost:5173`

2. **Tester le Dashboard Super Admin** :
   - Se connecter avec : `president@ndjobi.ga` / `Admin2025Secure!`
   - Vérifier :
     - ✅ Total signalements : ~300
     - ✅ Cas critiques : ~85
     - ✅ Distribution régionale affichée
     - ✅ Graphique évolution temporelle
     - ✅ Onglet Validation : voir les cas critiques Gab Pêche

3. **Tester le Dashboard Agent** :
   - Se connecter avec : `agent.mer@ndjobi.ga` / `Admin2025Secure!`
   - Vérifier :
     - ✅ Signalements assignés (catégorie Gab Pêche)
     - ✅ Mise à jour de statut fonctionne
     - ✅ Ajout de notes d'enquête

4. **Tester le Dashboard Admin** :
   - Se connecter avec : `admin.dgss@ndjobi.ga` / `Admin2025Secure!`
   - Vérifier :
     - ✅ Filtrage par ministère
     - ✅ Vue sectorielle
     - ✅ Assignation d'agents

---

### 6️⃣ **CONFIGURER L'IA ET LE CHATBOT** (Optionnel)

Si vous souhaitez activer l'IA :

1. **Ajouter les clés API dans `.env.local`** :

```bash
# IA Configuration (Optionnel)
VITE_OPENAI_API_KEY=sk-proj-VOTRE_CLE_OPENAI
VITE_ANTHROPIC_API_KEY=sk-ant-VOTRE_CLE_ANTHROPIC
```

2. **Tester le chatbot** :
   - Ouvrir l'application
   - Cliquer sur le bouton flottant en bas à droite (logo Ndjobi animé)
   - Tester les conversations :
     - "Je veux taper le Ndjobi"
     - "Comment protéger mon projet ?"
     - "Mon anonymat est-il garanti ?"

---

## 🎯 Checklist Finale

Avant de considérer la simulation terminée :

- [ ] Base de données initialisée (tables créées)
- [ ] Clé de service Supabase configurée
- [ ] Import des données réussi (300+ signalements)
- [ ] Les 6 comptes admin fonctionnent
- [ ] Dashboard Président affiche tous les KPIs
- [ ] Dashboard Agent affiche les cas assignés
- [ ] Dashboard Admin affiche la vue sectorielle
- [ ] Chatbot IA fonctionne (si configuré)
- [ ] RLS policies testées pour chaque rôle

---

## 🐛 Dépannage

### Problème : "Invalid API key"
**Solution** : Vérifiez que vous avez copié la `service_role` key (pas l'anon key) dans `.env.local`

### Problème : "Table doesn't exist"
**Solution** : Vous devez d'abord exécuter le script SQL d'initialisation dans Supabase Studio

### Problème : "Connection failed"
**Solution** : Vérifiez que l'URL Supabase est correcte et que votre projet est actif

### Problème : Dashboard vide après import
**Solution** : 
1. Vérifiez que les données sont bien dans Supabase (Table Editor)
2. Vérifiez les policies RLS
3. Vérifiez que le rôle user a bien `super_admin` dans `user_roles`

```sql
-- Vérifier rôle Président
SELECT p.email, ur.role, ur.is_active
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.email = 'president@ndjobi.ga';
```

---

## 📞 Besoin d'aide ?

Si vous rencontrez des difficultés :

1. **Vérifiez les logs** dans la console du navigateur (F12)
2. **Vérifiez les erreurs** dans le terminal où tourne `npm run dev`
3. **Consultez** le fichier `INSTRUCTIONS-IMPORT.md` pour plus de détails

---

## 🎉 Félicitations !

Une fois toutes ces étapes complétées, votre simulation NDJOBI sera opérationnelle avec :

- ✅ 300+ signalements réalistes
- ✅ 100+ comptes utilisateurs
- ✅ 6 comptes administrateurs
- ✅ Dashboards fonctionnels
- ✅ Base de données complète avec RLS
- ✅ Chatbot IA (optionnel)

**Vous êtes prêt à démontrer la puissance de NDJOBI !** 🚀🎯
