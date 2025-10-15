# 📋 PLAN DÉTAILLÉ DE L'APPLICATION NDJOBI

## 🎯 **VISION GÉNÉRALE**

**NDJOBI** est une plateforme web anti-corruption développée pour le Gabon, permettant aux citoyens de dénoncer anonymement la corruption et de protéger leurs innovations avec un horodatage blockchain infalsifiable.

---

## 🏗️ **ARCHITECTURE SYSTÈME**

### **Stack Technologique**
- **Frontend** : React 18 + TypeScript + Vite
- **UI/UX** : Tailwind CSS + shadcn/ui
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Authentification** : Supabase Auth avec RLS (Row Level Security)
- **Déploiement** : Netlify (Frontend) + Supabase Cloud (Backend)

### **Structure des Dossiers**
```
src/
├── components/          # Composants réutilisables
│   ├── ai-agent/       # Chatbot IA pour signalements
│   ├── dashboard/      # Composants spécifiques aux dashboards
│   └── ui/             # Composants UI de base (shadcn/ui)
├── hooks/              # Hooks personnalisés React
├── integrations/       # Configuration Supabase
├── pages/              # Pages de l'application
│   └── dashboards/     # Dashboards par rôle
├── services/           # Services métier
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

---

## 👥 **SYSTÈME DE RÔLES ET PERMISSIONS**

### **1. CITOYEN (user)**
**Rôle de base** - Accès public et authentifié

**Fonctionnalités :**
- ✅ Signalements anonymes via chatbot IA
- ✅ Signalements identifiés avec compte
- ✅ Protection de projets (copyright, marque, etc.)
- ✅ Gestion de profil personnel
- ✅ Consultation des statistiques publiques
- ✅ Upload et gestion de fichiers

**Pages accessibles :**
- `/` - Page d'accueil
- `/report` - Signalement anonyme
- `/auth` - Authentification
- `/dashboard/user` - Dashboard personnel

### **2. AGENT DGSS (agent)**
**Rôle d'investigation** - Traitement des signalements

**Fonctionnalités :**
- ✅ Consultation des signalements assignés
- ✅ Gestion des enquêtes et investigations
- ✅ Mise à jour du statut des cas
- ✅ Soumission de rapports d'enquête
- ✅ Upload de preuves et documents
- ✅ Visualisation géographique des cas
- ✅ Statistiques personnelles de performance

**Pages accessibles :**
- `/dashboard/agent` - Dashboard agent avec 5 vues :
  - **Dashboard** : Vue d'ensemble et statistiques
  - **Signalements** : Liste des cas assignés
  - **Enquêtes** : Gestion des investigations
  - **Carte** : Visualisation géographique
  - **Profil** : Informations personnelles

### **3. PROTOCOLE D'ÉTAT (admin)**
**Rôle de supervision** - Gestion des agents et validation

**Fonctionnalités :**
- ✅ Gestion des agents DGSS
- ✅ Validation des cas et enquêtes
- ✅ Supervision des performances
- ✅ Rapports et statistiques avancées
- ✅ Gestion des autorisations
- ✅ Monitoring du système

**Pages accessibles :**
- `/dashboard/admin` - Dashboard administrateur

### **4. SUPER ADMIN (super_admin)**
**Rôle système** - Administration complète

**Fonctionnalités :**
- ✅ Gestion complète du système
- ✅ Administration des utilisateurs
- ✅ Configuration des rôles
- ✅ Monitoring technique
- ✅ Gestion des modules (XR-7, etc.)
- ✅ Accès à toutes les données

**Pages accessibles :**
- `/dashboard/super-admin` - Dashboard super administrateur

---

## 🗄️ **ARCHITECTURE DE BASE DE DONNÉES**

### **Tables Principales**

#### **1. Authentification & Utilisateurs**
```sql
-- Profils utilisateurs (extension de auth.users)
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  organization TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Rôles utilisateurs
user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role app_role, -- 'user', 'agent', 'admin', 'super_admin'
  created_at TIMESTAMP
)

-- Codes PIN pour sécurité
user_pins (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  pin_hash TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### **2. Signalements & Enquêtes**
```sql
-- Signalements de corruption
signalements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- NULL pour anonymes
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'incident', 'projet', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'investigation', 'resolved', 'closed'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'critique'
  location TEXT,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}', -- Données anonymes, témoins, etc.
  is_anonymous BOOLEAN DEFAULT false,
  device_id TEXT, -- Pour tracking anonyme
  gps_latitude DECIMAL,
  gps_longitude DECIMAL,
  submission_method TEXT, -- 'web', 'mobile', 'api'
  assigned_agent_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES auth.users(id)
)

-- Enquêtes (à créer)
investigations (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES signalements(id),
  agent_id UUID REFERENCES auth.users(id),
  title TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed'
  progress INTEGER DEFAULT 0,
  witnesses_count INTEGER DEFAULT 0,
  evidence_count INTEGER DEFAULT 0,
  next_step TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
)

-- Rapports d'enquête (à créer)
investigation_reports (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES signalements(id),
  agent_id UUID REFERENCES auth.users(id),
  type TEXT, -- 'progress', 'witness', 'evidence', 'final'
  description TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP
)
```

#### **3. Protection de Projets**
```sql
-- Projets protégés
projets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- NULL pour anonymes
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'artistique', 'litteraire', 'logiciel', 'marque'
  status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'protected', 'rejected'
  protection_type TEXT, -- 'copyright', 'trademark', 'patent'
  files JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  device_id TEXT, -- Pour tracking anonyme
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  protected_at TIMESTAMP,
  protection_number TEXT UNIQUE
)
```

#### **4. Système d'Identité d'Appareil**
```sql
-- Sessions d'appareils
device_sessions (
  id UUID PRIMARY KEY,
  device_id TEXT UNIQUE,
  fingerprint_data JSONB,
  user_id UUID REFERENCES auth.users(id), -- NULL si anonyme
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_activity TIMESTAMP
)

-- Signalements par appareil
device_signalements (
  id UUID PRIMARY KEY,
  device_id TEXT,
  signalement_id UUID REFERENCES signalements(id),
  created_at TIMESTAMP
)

-- Projets par appareil
device_projets (
  id UUID PRIMARY KEY,
  device_id TEXT,
  projet_id UUID REFERENCES projets(id),
  created_at TIMESTAMP
)
```

#### **5. Module d'Urgence (XR-7)**
```sql
-- Autorisations judiciaires
judicial_authorizations (
  authorization_number TEXT PRIMARY KEY,
  issued_by TEXT,
  issued_date DATE,
  expiry_date DATE,
  scope TEXT,
  conditions JSONB
)

-- Activations d'urgence
emergency_activations (
  id UUID PRIMARY KEY,
  activated_by UUID REFERENCES auth.users(id),
  judicial_authorization TEXT REFERENCES judicial_authorizations(authorization_number),
  reason TEXT,
  legal_reference TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  duration_hours INTEGER,
  status TEXT,
  biometric_validated BOOLEAN,
  two_factor_validated BOOLEAN,
  activation_metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deactivated_at TIMESTAMP,
  deactivation_reason TEXT
)

-- Enregistrements audio d'urgence
emergency_audio_recordings (
  id UUID PRIMARY KEY,
  activation_id UUID REFERENCES emergency_activations(id),
  file_path TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP
)
```

---

## 🛣️ **ARCHITECTURE DE NAVIGATION**

### **Routes Publiques**
```
/                    # Page d'accueil (non connecté)
/auth               # Authentification
/report             # Signalement anonyme
/statistiques       # Statistiques publiques
```

### **Routes Protégées**
```
/dashboard                    # Redirection selon le rôle
├── /dashboard/user          # Dashboard citoyen
├── /dashboard/agent         # Dashboard agent DGSS
├── /dashboard/admin         # Dashboard protocole d'état
└── /dashboard/super-admin   # Dashboard super admin
```

### **Système de Redirection**
1. **Utilisateur non connecté** → `/auth`
2. **Utilisateur connecté sans rôle** → `/dashboard/user`
3. **Redirection automatique** selon le rôle via `/dashboard`

---

## 🎨 **INTERFACES UTILISATEUR**

### **1. Page d'Accueil (`/`)**
**Composants :**
- `Header` - Navigation principale
- `HeroSection` - Présentation de la plateforme
- `CTACards` - Actions principales (Taper le Ndjobi, Protéger)
- `TrustSection` - Éléments de confiance
- `StatsSection` - Statistiques publiques
- `Footer` - Informations légales

**Fonctionnalités :**
- Navigation vers signalement anonyme
- Redirection vers protection de projet
- Affichage des statistiques publiques
- Redirection automatique si connecté

### **2. Page de Signalement (`/report`)**
**Composants :**
- `NdjobiAIAgent` - Chatbot IA pour signalements
- `ReportFormStepper` - Formulaire manuel multi-étapes

**Fonctionnalités :**
- Signalement via chatbot conversationnel
- Formulaire manuel avec géolocalisation
- Upload de fichiers et preuves
- Choix anonyme/identifié
- Validation et soumission

### **3. Dashboard Citoyen (`/dashboard/user`)**
**Vues disponibles :**
- **Profil** - Informations personnelles
- **Signalement** - Nouveau signalement
- **Protection** - Protection de projet
- **Dossiers** - Fichiers et documents
- **Paramètres** - Configuration

**Fonctionnalités :**
- Gestion de profil avec avatar
- Création de signalements identifiés
- Protection de projets (copyright, marque)
- Upload et gestion de fichiers
- Configuration des préférences

### **4. Dashboard Agent (`/dashboard/agent`)**
**Vues disponibles :**
- **Dashboard** - Vue d'ensemble et statistiques
- **Signalements** - Cas assignés avec filtres
- **Enquêtes** - Gestion des investigations
- **Carte** - Visualisation géographique
- **Profil** - Informations et performance

**Fonctionnalités :**
- Statistiques personnelles en temps réel
- Filtrage et recherche de cas
- Actions sur les signalements (voir, enquêter, résoudre)
- Gestion des enquêtes (actives, en attente, terminées)
- Soumission de rapports d'enquête
- Upload de preuves et documents
- Visualisation géographique des interventions

### **5. Dashboard Admin (`/dashboard/admin`)**
**Fonctionnalités :**
- Gestion des agents DGSS
- Validation des cas et enquêtes
- Supervision des performances
- Rapports et statistiques avancées
- Gestion des autorisations

### **6. Dashboard Super Admin (`/dashboard/super-admin`)**
**Fonctionnalités :**
- Gestion complète du système
- Administration des utilisateurs
- Configuration des rôles
- Monitoring technique
- Gestion des modules (XR-7, etc.)

---

## 🔐 **SÉCURITÉ ET AUTHENTIFICATION**

### **Système d'Authentification**
- **Supabase Auth** avec JWT
- **Row Level Security (RLS)** sur toutes les tables
- **Politiques de sécurité** par rôle
- **Codes PIN** pour sécurité supplémentaire

### **Gestion des Rôles**
```typescript
type UserRole = 'user' | 'agent' | 'admin' | 'super_admin';

// Hiérarchie des permissions
super_admin > admin > agent > user
```

### **Politiques de Sécurité**
- **Utilisateurs** : Accès à leurs propres données
- **Agents** : Accès aux signalements assignés
- **Admins** : Accès à tous les signalements et agents
- **Super Admins** : Accès complet au système

### **Signalements Anonymes**
- **Device ID** pour tracking sans identification
- **Fingerprinting** pour éviter les doublons
- **Migration automatique** vers compte utilisateur
- **Géolocalisation** optionnelle

---

## 🤖 **INTELLIGENCE ARTIFICIELLE**

### **Chatbot Ndjobi (`NdjobiAIAgent`)**
**Fonctionnalités :**
- Conversation naturelle pour signalements
- Collecte d'informations structurées
- Validation des données
- Géolocalisation automatique
- Upload de fichiers via chat
- Choix anonyme/identifié

**Flux de conversation :**
1. **Accueil** - Présentation et consentement
2. **Type de signalement** - Classification
3. **Détails** - Description détaillée
4. **Localisation** - Lieu et géolocalisation
5. **Preuves** - Upload de fichiers
6. **Anonymat** - Choix d'identification
7. **Validation** - Récapitulatif et soumission

---

## 📊 **SYSTÈME DE STATISTIQUES**

### **Statistiques Publiques**
- Nombre total de signalements
- Taux de résolution
- Répartition géographique
- Types de corruption les plus fréquents

### **Statistiques Agents**
- Cas assignés et résolus
- Taux de réussite personnel
- Temps moyen de traitement
- Objectifs mensuels

### **Statistiques Administrateurs**
- Performance des agents
- Tendance des signalements
- Analyse géographique
- Rapports de performance

---

## 🗺️ **SYSTÈME DE GÉOLOCALISATION**

### **Fonctionnalités**
- **Géolocalisation automatique** via API navigator
- **Sélection manuelle** sur carte interactive
- **Validation des coordonnées** GPS
- **Visualisation géographique** des cas
- **Statistiques par région**

### **Intégration**
- **Signalements** : Localisation obligatoire
- **Dashboard Agent** : Carte des interventions
- **Statistiques** : Répartition géographique

---

## 📁 **GESTION DE FICHIERS**

### **Types de Fichiers Supportés**
- **Images** : JPG, PNG, GIF, WebP
- **Documents** : PDF, DOC, DOCX, TXT
- **Audio** : MP3, WAV, M4A
- **Vidéo** : MP4, AVI, MOV

### **Stockage**
- **Supabase Storage** avec buckets séparés
- **Compression automatique** des images
- **Scan antivirus** (à implémenter)
- **Chiffrement** des fichiers sensibles

### **Organisation**
```
storage/
├── signalements/     # Fichiers de signalements
├── projets/         # Fichiers de projets protégés
├── investigations/  # Preuves d'enquêtes
└── profiles/        # Avatars utilisateurs
```

---

## 🔄 **FLUX DE TRAVAIL**

### **Signalement de Corruption**
1. **Création** - Via chatbot ou formulaire
2. **Validation** - Vérification des données
3. **Assignation** - Attribution à un agent
4. **Investigation** - Enquête par l'agent
5. **Rapport** - Soumission du rapport
6. **Résolution** - Clôture du cas

### **Protection de Projet**
1. **Déclaration** - Création du projet
2. **Upload** - Ajout des fichiers
3. **Validation** - Vérification technique
4. **Horodatage** - Blockchain timestamp
5. **Protection** - Génération du certificat

### **Gestion des Enquêtes**
1. **Assignation** - Attribution à un agent
2. **Planification** - Définition des étapes
3. **Investigation** - Collecte de preuves
4. **Rapports** - Documentation des progrès
5. **Clôture** - Finalisation de l'enquête

---

## 🚀 **DÉPLOIEMENT ET MAINTENANCE**

### **Environnements**
- **Développement** : Local avec Supabase local
- **Staging** : Netlify Preview + Supabase Cloud
- **Production** : Netlify + Supabase Cloud

### **CI/CD**
- **GitHub Actions** pour tests automatiques
- **Déploiement automatique** sur push main
- **Tests de régression** avant déploiement
- **Monitoring** des performances

### **Monitoring**
- **Supabase Dashboard** pour la base de données
- **Netlify Analytics** pour les performances
- **Sentry** pour le monitoring d'erreurs
- **Logs** centralisés

---

## 📈 **ROADMAP FUTURE**

### **Phase 1 - Actuelle** ✅
- ✅ Système de signalements anonymes
- ✅ Protection de projets
- ✅ Dashboard agent fonctionnel
- ✅ Authentification et rôles

### **Phase 2 - Court terme**
- 🔄 Module d'urgence XR-7 complet
- 🔄 Notifications push
- 🔄 API mobile
- 🔄 Système de récompenses

### **Phase 3 - Moyen terme**
- 📋 Intégration blockchain complète
- 📋 IA avancée pour analyse
- 📋 Tableau de bord analytics
- 📋 Intégration avec services gouvernementaux

### **Phase 4 - Long terme**
- 📋 Application mobile native
- 📋 Système de réputation
- 📋 Intégration internationale
- 📋 Plateforme multi-pays

---

## 🛠️ **OUTILS DE DÉVELOPPEMENT**

### **Scripts Disponibles**
```bash
# Développement
bun run dev          # Serveur de développement
bun run build        # Build de production
bun run preview      # Preview du build

# Base de données
supabase start       # Démarrer Supabase local
supabase db reset    # Reset de la base
supabase gen types   # Générer les types TypeScript

# Tests
bun run test         # Tests unitaires
bun run lint         # Linting
bun run type-check   # Vérification TypeScript
```

### **Structure de Développement**
- **Hot Reload** avec Vite
- **TypeScript strict** pour la sécurité
- **ESLint + Prettier** pour la qualité
- **Husky** pour les hooks Git
- **Conventional Commits** pour l'historique

---

## 📞 **SUPPORT ET MAINTENANCE**

### **Documentation**
- **README.md** - Guide d'installation
- **PLAN-DETAILLE-NDJOBI.md** - Ce document
- **API.md** - Documentation API
- **DEPLOYMENT.md** - Guide de déploiement

### **Contact**
- **Développement** : okatech-org/ndjobi
- **Support** : Via issues GitHub
- **Documentation** : Wiki du projet

---

*Ce plan détaillé couvre l'ensemble de l'architecture, des fonctionnalités et du fonctionnement de la plateforme NDJOBI. Il sert de référence pour le développement, la maintenance et l'évolution du système.*
