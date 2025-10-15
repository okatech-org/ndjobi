# 🏗️ DIAGRAMME D'ARCHITECTURE NDJOBI

## 📊 **Vue d'ensemble du système**

```
┌─────────────────────────────────────────────────────────────────┐
│                        NDJOBI PLATFORM                         │
│                    Plateforme Anti-Corruption                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│   (React/TS)    │◄──►│   (Supabase)    │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎭 **Système de Rôles**

```
┌─────────────────────────────────────────────────────────────────┐
│                        HIÉRARCHIE DES RÔLES                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  SUPER ADMIN    │ ←─── Administration complète du système
│   (Niveau 4)    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     ADMIN       │ ←─── Gestion des agents et validation
│  (Niveau 3)     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     AGENT       │ ←─── Investigation et traitement des cas
│   (Niveau 2)    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     USER        │ ←─── Signalements et protection de projets
│   (Niveau 1)    │
└─────────────────┘
```

## 🛣️ **Architecture de Navigation**

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROUTES DE L'APPLICATION                 │
└─────────────────────────────────────────────────────────────────┘

ROUTES PUBLIQUES:
├── /                    → Page d'accueil (non connecté)
├── /auth               → Authentification
├── /report             → Signalement anonyme
└── /statistiques       → Statistiques publiques

ROUTES PROTÉGÉES:
├── /dashboard          → Redirection selon le rôle
│   ├── /dashboard/user          → Dashboard citoyen
│   ├── /dashboard/agent         → Dashboard agent DGSS
│   ├── /dashboard/admin         → Dashboard protocole d'état
│   └── /dashboard/super-admin   → Dashboard super admin
```

## 🗄️ **Architecture de Base de Données**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCHÉMA DE BASE DE DONNÉES                   │
└─────────────────────────────────────────────────────────────────┘

AUTHENTIFICATION:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   auth.users    │◄──►│    profiles     │◄──►│   user_roles    │
│   (Supabase)    │    │   (Extension)   │    │   (Rôles)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘

SIGNALEMENTS:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  signalements   │◄──►│ investigations  │◄──►│investigation_   │
│   (Cas)         │    │  (Enquêtes)     │    │   reports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PROTECTION:
┌─────────────────┐
│     projets     │
│  (Protection)   │
└─────────────────┘

IDENTITÉ D'APPAREIL:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│device_sessions  │◄──►│device_signalements│◄──►│ device_projets  │
│  (Tracking)     │    │   (Anonyme)     │    │   (Anonyme)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘

MODULE D'URGENCE (XR-7):
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│judicial_        │◄──►│emergency_       │◄──►│emergency_audio_ │
│authorizations   │    │activations      │    │recordings       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 **Flux de Données**

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUX DE SIGNALEMENT                     │
└─────────────────────────────────────────────────────────────────┘

CITOYEN → CHATBOT IA → VALIDATION → ASSIGNATION → AGENT → ENQUÊTE → RÉSOLUTION
    │         │           │            │          │        │         │
    ▼         ▼           ▼            ▼          ▼        ▼         ▼
┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
│Formulaire││Collecte ││Vérif.   ││Attrib.  ││Invest.  ││Rapport  ││Clôture  │
│/Chat    ││Données  ││Données  ││Agent    ││Terrain  ││Enquête  ││Cas      │
└─────────┘└─────────┘└─────────┘└─────────┘└─────────┘└─────────┘└─────────┘
```

## 🎨 **Architecture des Composants**

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRUCTURE DES COMPOSANTS                    │
└─────────────────────────────────────────────────────────────────┘

src/
├── components/
│   ├── ui/                    → Composants de base (shadcn/ui)
│   ├── ai-agent/             → Chatbot IA pour signalements
│   ├── dashboard/            → Composants spécifiques aux dashboards
│   │   ├── user/            → Composants dashboard utilisateur
│   │   ├── agent/           → Composants dashboard agent
│   │   ├── admin/           → Composants dashboard admin
│   │   └── super-admin/     → Composants dashboard super admin
│   ├── Header.tsx           → Navigation principale
│   ├── Footer.tsx           → Pied de page
│   └── ...
├── pages/
│   ├── Index.tsx            → Page d'accueil
│   ├── Auth.tsx             → Authentification
│   ├── Report.tsx           → Signalement anonyme
│   └── dashboards/          → Dashboards par rôle
├── hooks/
│   ├── useAuth.ts           → Gestion de l'authentification
│   └── use-toast.ts         → Notifications
├── services/
│   ├── deviceIdentity.ts    → Gestion des appareils
│   └── systemManagement.ts  → Gestion système
└── types/
    ├── auth.ts              → Types d'authentification
    └── ...
```

## 🔐 **Système de Sécurité**

```
┌─────────────────────────────────────────────────────────────────┐
│                        SÉCURITÉ ET RLS                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AUTHENTICATION│◄──►│   AUTHORIZATION │◄──►│   ROW LEVEL     │
│   (Supabase)    │    │   (Rôles)       │    │   SECURITY      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JWT Tokens    │    │   Permissions   │    │   Data Access   │
│   (Sessions)    │    │   (CRUD)        │    │   (Filtering)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📱 **Responsive Design**

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADAPTATION MOBILE                       │
└─────────────────────────────────────────────────────────────────┘

DESKTOP (≥ 768px):           MOBILE (< 768px):
┌─────────────────┐          ┌─────────────────┐
│  Menu Horizontal│          │  Menu Hamburger │
│  - Dashboard    │          │  - Sheet Panel  │
│  - Signalements │          │  - Navigation   │
│  - Enquêtes     │          │  - Actions      │
│  - Carte        │          │  - Déconnexion  │
│  - Profil       │          └─────────────────┘
└─────────────────┘
```

## 🚀 **Déploiement**

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENVIRONNEMENTS                          │
└─────────────────────────────────────────────────────────────────┘

DÉVELOPPEMENT:                PRODUCTION:
┌─────────────────┐          ┌─────────────────┐
│  Local Vite     │          │  Netlify        │
│  + Supabase     │          │  + Supabase     │
│  Local          │          │  Cloud          │
└─────────────────┘          └─────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐          ┌─────────────────┐
│  Hot Reload     │          │  CDN Global     │
│  TypeScript     │          │  SSL/TLS        │
│  Dev Tools      │          │  Monitoring     │
└─────────────────┘          └─────────────────┘
```

## 📊 **Monitoring et Analytics**

```
┌─────────────────────────────────────────────────────────────────┐
│                        MONITORING STACK                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │    Netlify      │    │     Sentry      │
│   Dashboard     │◄──►│   Analytics     │◄──►│   Error Track   │
│   (Database)    │    │   (Performance) │    │   (Monitoring)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Query Stats   │    │   Page Views    │    │   Error Logs    │
│   User Activity │    │   Load Times    │    │   Performance   │
│   RLS Policies  │    │   Build Status  │    │   Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

*Ce diagramme d'architecture fournit une vue d'ensemble visuelle de l'ensemble du système NDJOBI, de l'architecture technique aux flux de données en passant par la sécurité et le déploiement.*
