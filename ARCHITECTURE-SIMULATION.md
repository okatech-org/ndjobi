# 🏗️ Architecture de la Simulation NDJOBI

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIMULATION NDJOBI                            │
│              300+ Signalements • 100+ Utilisateurs              │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐              ┌──────▼───────┐
        │   DONNÉES      │              │   SCRIPTS    │
        │   JSON (4)     │              │   JS (3)     │
        └───────┬────────┘              └──────┬───────┘
                │                               │
    ┌───────────┼───────────┐          ┌───────┼────────┐
    │           │           │          │       │        │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐ ┌─▼─┐  ┌──▼──┐
│ Sig   │  │Users  │  │Press  │  │Import │ │Ver│  │Diag │
│300+   │  │100+   │  │50+    │  │       │ │   │  │     │
└───────┘  └───────┘  └───────┘  └───┬───┘ └─┬─┘  └──┬──┘
                                      │       │       │
                      ┌───────────────┴───────┴───────┘
                      │
              ┌───────▼────────┐
              │   SUPABASE     │
              │   Database     │
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    ┌───▼───┐    ┌───▼───┐    ┌───▼────┐
    │Super  │    │Admin  │    │ Agent  │
    │Admin  │    │(3)    │    │ (2)    │
    └───┬───┘    └───┬───┘    └───┬────┘
        │            │            │
        └────────────┼────────────┘
                     │
            ┌────────▼─────────┐
            │   APPLICATION    │
            │   NDJOBI         │
            │   (Dashboards)   │
            └──────────────────┘
```

---

## 🗄️ Structure Base de Données

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────┐
│  auth.users     │ ← Supabase Auth (géré automatiquement)
└────────┬────────┘
         │
         │ id
         ▼
┌─────────────────┐         ┌─────────────────┐
│   profiles      │◄───────►│   user_roles    │
│   (~118 rows)   │         │   (~118 rows)   │
└────────┬────────┘         └─────────────────┘
         │
         │ id (user_id)
         ▼
┌─────────────────────────────────────────────────────────┐
│              signalements (table principale)            │
│                      (~300 rows)                        │
│                                                         │
│  • reference_id (SIG-2025-XXX)                         │
│  • type, categorie, urgence, statut                    │
│  • titre, description                                   │
│  • montant_estime, devise                              │
│  • region, ville, ministere_concerne                   │
│  • coordonnees_gps (PostGIS)                           │
│  • user_id (nullable for anonymous)                    │
│  • assigned_agent_id                                    │
│  • scores IA (credibilite, urgence)                    │
└─────────────┬───────────────────┬───────────────────────┘
              │                   │
       ┌──────▼──────┐     ┌─────▼──────┐
       │   preuves   │     │investigations│
       │  (~600 rows)│     │   (vide)     │
       └─────────────┘     └──────┬───────┘
                                  │
                          ┌───────▼────────┐
                          │investigation_  │
                          │reports (vide)  │
                          └────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  notifications  │     │  audit_logs     │
│    (vide)       │     │    (vide)       │
└─────────────────┘     └─────────────────┘

┌─────────────────────────┐
│  statistiques_cache     │
│     (1 row - national)  │
└─────────────────────────┘
```

---

## 🔐 Architecture RLS (Row Level Security)

```
┌─────────────────────────────────────────────────────────┐
│                    RLS POLICIES                         │
└─────────────────────────────────────────────────────────┘

USER ROLE           │  PEUT VOIR
────────────────────┼──────────────────────────────────────
super_admin         │  ✅ TOUS les signalements
                    │  ✅ TOUS les profils
                    │  ✅ TOUTES les tables
────────────────────┼──────────────────────────────────────
admin               │  ✅ TOUS les signalements
                    │  ✅ Profils de leur secteur
                    │  ✅ Assignation agents
────────────────────┼──────────────────────────────────────
agent               │  ✅ Signalements ASSIGNÉS uniquement
                    │  ✅ Signalements de leur ministère
                    │  ⛔ Pas accès autres cas
────────────────────┼──────────────────────────────────────
user                │  ✅ Leurs PROPRES signalements
                    │  ⛔ Pas accès autres signalements
                    │  ⛔ Pas accès profils
────────────────────┼──────────────────────────────────────
anonymous           │  ✅ Peut CRÉER un signalement
                    │  ⛔ Pas accès lecture après création
                    │  🔒 Anonymat total garanti
```

---

## 🎭 Architecture Chatbot IA

```
┌─────────────────────────────────────────────────────────┐
│              CHATBOT IA NDJOBI (NdjobiAIAgent)          │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐     ┌─────▼──────┐    ┌────▼─────┐
   │  Flow   │     │   Voice    │    │   GPS    │
   │Taper le │     │Recognition │    │Geoloc    │
   │ Ndjobi  │     │   (Web)    │    │(Browser) │
   └────┬────┘     └────────────┘    └──────────┘
        │
        │ Collecte données:
        │ • Type corruption
        │ • Localisation
        │ • Description
        │ • Témoins
        │
        ▼
   ┌────────────┐
   │  Supabase  │
   │ signalements│
   └────────────┘
```

---

## 📊 Flow d'Import des Données

```
┌──────────────────────────────────────────────────────┐
│     SCRIPT: import-simulation-data.js                │
└──────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    ┌───▼──┐     ┌───▼───┐    ┌───▼────┐
    │Users │     │Admins │    │Signal  │
    │JSON  │     │(code) │    │JSON    │
    └───┬──┘     └───┬───┘    └───┬────┘
        │            │            │
        ▼            ▼            ▼
    ┌─────────────────────────────────┐
    │         Supabase Auth           │
    │    (createUser via service_role)│
    └──────────────┬──────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────┐
    │        Table: profiles          │
    │    (email, full_name, role...)  │
    └──────────────┬──────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────┐
    │       Table: user_roles         │
    │     (user_id, role, active)     │
    └─────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────┐
    │      Table: signalements        │
    │   (300+ rows avec preuves)      │
    └─────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────┐
    │   Table: statistiques_cache     │
    │    (stats nationales agrégées)  │
    └─────────────────────────────────┘
```

---

## 🎯 Architecture Dashboards

```
┌──────────────────────────────────────────────────────┐
│              DASHBOARDS NDJOBI                       │
└──────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼─────┐  ┌───▼────┐   ┌───▼──────┐
   │  Super   │  │ Admin  │   │  Agent   │
   │  Admin   │  │ DGSS   │   │   Mer    │
   │President │  │ DGR    │   │Intérieur │
   └────┬─────┘  │ DGLIC  │   └───┬──────┘
        │        └───┬────┘       │
        │            │            │
        ▼            ▼            ▼
  ┌──────────────────────────────────┐
  │        VUE DES DONNÉES           │
  ├──────────────────────────────────┤
  │  Super: TOUS les signalements    │
  │  Admin: Filtré par secteur       │
  │  Agent: Cas assignés uniquement  │
  └──────────────────────────────────┘
                │
                ▼
  ┌──────────────────────────────────┐
  │         RLS POLICIES             │
  │  (Filtrage au niveau PostgreSQL) │
  └──────────────────────────────────┘
```

---

## 📦 Architecture Fichiers

```
ndjobi/
│
├── 📖 GUIDES (9 fichiers)
│   ├── DEMARRAGE-RAPIDE.md              ⚡ 3 étapes - 10 min
│   ├── SIMULATION-README.md             ⭐ Guide principal
│   ├── GUIDE-COMPLET-SIMULATION.md      📚 Référence complète
│   ├── ETAPES-SUIVANTES.md              🚀 Pas-à-pas détaillé
│   ├── INSTRUCTIONS-IMPORT.md           📥 Import spécifique
│   ├── IDENTIFIANTS-CONNEXION.md        🔑 Logins test
│   ├── CONFIGURATION-ENV.md             ⚙️  Config env
│   ├── INDEX-SIMULATION.md              📑 Index fichiers
│   └── RECAPITULATIF-FINAL.md           ✅ Récap complet
│
├── 📊 DONNÉES (4 fichiers)
│   └── scripts/data/
│       ├── ndjobi-signalements-dataset.json  (300+ signalements)
│       ├── ndjobi-users-dataset.json         (100+ users)
│       ├── ndjobi-articles-presse.json       (50+ articles)
│       └── ndjobi-ia-config.json             (config IA)
│
├── 🛠️ SCRIPTS (4 fichiers)
│   ├── scripts/import-simulation-data.js     ⭐ Import
│   ├── scripts/verify-simulation-data.js    ✅ Vérif
│   ├── scripts/diagnostic-simulation.js     🔍 Diag
│   └── scripts/sql/
│       └── ndjobi-init-database.sql         🗄️  Init
│
└── ⚙️ CONFIG
    ├── package.json                          (3 scripts npm)
    └── .env.local                            (À créer)
```

---

## 🔄 Workflow Complet

```
┌─────────────┐
│   ÉTAPE 1   │  Initialiser Supabase
│ Init BDD    │  scripts/sql/ndjobi-init-database.sql
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ÉTAPE 2   │  Configurer environnement
│ Config ENV  │  Créer .env.local + clé service
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ÉTAPE 3   │  Importer données
│   Import    │  npm run simulation:import
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ÉTAPE 4   │  Vérifier
│   Verify    │  npm run simulation:verify
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ÉTAPE 5   │  Tester
│    Test     │  npm run dev → Dashboards
└─────────────┘
```

---

## 🎯 Types de Signalements

```
┌────────────────────────────────────────────────┐
│          CATÉGORIES DE SIGNALEMENTS            │
└────────────────────────────────────────────────┘

🔴 CORRUPTION (60%)
├── Gab Pêche (27%)
│   ├── Pirogues détournées
│   ├── Coopératives fantômes
│   ├── Surfacturation
│   └── Exclusion pêcheurs
├── Enrichissement Illicite (15%)
│   ├── Villas luxueuses
│   ├── Véhicules de luxe
│   └── Comptes offshore
├── Marchés Publics (20%)
│   ├── Surfacturation
│   ├── Appels d'offres truqués
│   └── Commissions occultes
└── Forces de l'Ordre (12%)
    ├── Racket routier
    ├── Extorsion
    └── Barrages illégaux

🟡 PROBLÉMATIQUES DIVERSES (30%)
├── Santé (8%)
│   ├── Médicaments détournés
│   ├── Ambulances fantômes
│   └── Générateurs en panne
├── Éducation (7%)
│   ├── Salles surchargées
│   ├── Corruption examens
│   └── Absentéisme enseignants
├── Infrastructures (8%)
│   ├── Ponts effondrés
│   ├── Routes non entretenues
│   └── Eau potable coupée
└── Environnement (5%)
    ├── Déforestation illégale
    ├── Pollution marine
    └── Trafic espèces

🟢 SUGGESTIONS (10%)
└── Innovations citoyennes
    ├── Tech (blockchain, apps)
    ├── Social (bus scolaires)
    └── Juridique (lois protection)
```

---

## 👥 Hiérarchie Utilisateurs

```
┌─────────────────────────────────────────────┐
│            HIÉRARCHIE NDJOBI                │
└─────────────────────────────────────────────┘

              ┌──────────────┐
              │ SUPER ADMIN  │
              │  Président   │
              │   (1 user)   │
              └──────┬───────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌───▼────┐  ┌───▼────┐
   │  ADMIN  │  │ ADMIN  │  │ ADMIN  │
   │  DGSS   │  │  DGR   │  │ DGLIC  │
   └────┬────┘  └───┬────┘  └───┬────┘
        │           │           │
        └───────────┼───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼────┐           ┌─────▼──────┐
   │  AGENT  │           │   AGENT    │
   │   Mer   │           │  Intérieur │
   └────┬────┘           └─────┬──────┘
        │                      │
        └──────────┬───────────┘
                   │
           ┌───────▼────────┐
           │  USERS (100+)  │
           │  Citoyens      │
           └────────────────┘
```

---

## 🔄 Flow de Traitement Signalement

```
┌──────────────┐
│   CITOYEN    │  Soumet via chatbot/formulaire
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  IA ANALYSE  │  Score crédibilité + urgence
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   DISPATCH   │  Assignation agent selon règles
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    AGENT     │  Enquête sur le terrain
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  VALIDATION  │  Sous-Admin ou Super Admin
└──────┬───────┘
       │
       ├─────► Si montant > 2 Mrd → PRÉSIDENT
       │
       ▼
┌──────────────┐
│  RÉSOLUTION  │  Transmission justice si avéré
└──────────────┘
```

---

## 🚀 Flux de Déploiement

```
┌─────────────┐
│   LOCAL     │  Développement et test
│ localhost   │  npm run dev
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   BUILD     │  Compilation production
│npm run build│  Optimisation + minification
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   DEPLOY    │  Netlify ou Vercel
│ Production  │  Auto-deploy via GitHub
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   LIVE      │  https://ndjobi.ga
│ Production  │  Accessible publiquement
└─────────────┘
```

---

## 📊 Métriques Clés

### Données

```
Signalements    : 300+
Utilisateurs    : 118 (6 admins + 45 identifiés + 67 anonymes)
Preuves         : 600+
Articles        : 50+
Régions         : 9/9 (100% Gabon)
Ministères      : 15+
```

### Performance

```
Temps chargement dashboard : < 2s
Temps import données       : 2-5 min
Taille base de données     : ~50 MB
Requêtes SQL optimisées    : Oui (index)
RLS actif                  : Oui (toutes tables)
```

---

## 🎯 Points d'Entrée

### Pour l'Utilisateur

| Action | Point d'Entrée |
|--------|----------------|
| **Démarrer** | `DEMARRAGE-RAPIDE.md` ⚡ |
| **Guide complet** | `SIMULATION-README.md` ⭐ |
| **Comprendre l'archi** | Ce fichier 🏗️ |
| **Diagnostiquer** | `npm run simulation:diagnostic` |
| **Importer** | `npm run simulation:import` |
| **Tester** | `npm run dev` |

### Pour le Développeur

| Besoin | Fichier/Commande |
|--------|------------------|
| **Comprendre le code** | `src/components/ai-agent/NdjobiAIAgent.tsx` |
| **Modifier données** | `scripts/data/*.json` |
| **Personnaliser import** | `scripts/import-simulation-data.js` |
| **Ajouter tables** | `scripts/sql/ndjobi-init-database.sql` |

---

## 🔐 Sécurité Architecture

```
┌─────────────────────────────────────────────┐
│           COUCHES DE SÉCURITÉ               │
└─────────────────────────────────────────────┘

Niveau 1: FRONTEND
├── Cryptage AES-256 (mode anonyme)
├── Sanitization inputs
└── Device fingerprinting

Niveau 2: SUPABASE AUTH
├── JWT tokens
├── Row Level Security (RLS)
└── Service role key (backend only)

Niveau 3: DATABASE
├── RLS policies strictes
├── Audit logs complets
└── Triggers automatiques

Niveau 4: BLOCKCHAIN (projets)
├── Smart contracts Ethereum
├── Certificats infalsifiables
└── Horodatage permanent
```

---

## 📚 Ressources

### Documentation Technique

- **Architecture globale** : Ce fichier
- **Guide utilisateur** : `SIMULATION-README.md`
- **API Reference** : `src/services/ai/aiService.ts`
- **Database Schema** : `scripts/sql/ndjobi-init-database.sql`

### Outils

- **Supabase Dashboard** : https://app.supabase.com
- **Application locale** : http://localhost:5173
- **Diagnostic** : `npm run simulation:diagnostic`

---

## 🎉 Simulation Complète !

Vous avez maintenant une **architecture complète et fonctionnelle** pour démontrer NDJOBI.

**👉 Prochaine action :** Ouvrez `DEMARRAGE-RAPIDE.md` et suivez les 3 étapes !

---

**🇬🇦 Fait avec ❤️ pour lutter contre la corruption au Gabon**
