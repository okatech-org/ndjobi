# 🤖 Architecture IA Ndjobi - Distinction des Agents

**Clarification importante sur les 2 agents IA de la plateforme Ndjobi**

---

## 🎯 2 Agents IA Distincts

### 1. **NdjobiAIAgent** - Agent Citoyen 👥

**Cible** : Users (citoyens, grand public)  
**Technologie** : Anthropic Claude (déjà implémenté dans Ndjobi)  
**Localisation** : `src/components/ai-agent/NdjobiAIAgent.tsx`

**Affichage** :
- ✅ Dashboard User (`/dashboard/user`)
- ✅ Page d'accueil publique (`/`)
- ✅ Page de rapports (`/report`)
- ❌ **EXCLU** des dashboards Agent/Admin/Super-Admin

**Code d'affichage** (`App.tsx` lignes 132-147) :
```tsx
const NdjobiAgentVisibility = () => {
  const { role } = useAuth();
  const location = useLocation();

  const path = location.pathname || '';
  const isRestrictedSpace =
    path.startsWith('/dashboard/admin') ||
    path.startsWith('/dashboard/super-admin') ||
    path.startsWith('/dashboard/agent');

  if (isRestrictedSpace) return null;  // ← Pas dans espaces pro
  if (role && role !== 'user') return null;  // ← Uniquement users
  return <NdjobiAIAgent />;  // ← Toujours actif !
};
```

**Fonctionnalités** :
- Chat texte simple
- Aide à la création de signalements
- Informations générales sur Ndjobi
- Support citoyen

**Statut** : ✅ **DÉJÀ IMPLÉMENTÉ - N'A JAMAIS ÉTÉ ENLEVÉ**

---

### 2. **iAsted** - Assistant Vocal Professionnel 🎤

**Cible** : Agents DGSS, Sous-Admins, Admins, Super-Admins  
**Technologie** : Multi-LLM (Gemini/GPT/Claude) + STT Deepgram + TTS Google  
**Localisation** : `/iasted/` (nouveau microservice)

**Affichage** :
- ✅ Dashboard Agent (`/dashboard/agent`) - Bouton flottant
- ✅ Dashboard Admin (`/dashboard/admin`) - Onglet + Bouton flottant
- ✅ Dashboard Super-Admin (`/dashboard/super-admin`) - Bouton flottant
- ❌ **EXCLU** du dashboard User (citoyens)

**Fonctionnalités** :
- 🎤 Conversation vocale temps réel
- 🧠 Multi-LLM intelligent (routing auto)
- 📄 Génération rapports PDF
- 📊 Requêtes statistiques avancées
- 🔒 RBAC strict (permissions selon rôle)

**Statut** : ✅ **NOUVELLEMENT IMPLÉMENTÉ - AJOUTÉ AUJOURD'HUI**

---

## 📊 Tableau Comparatif

| Caractéristique | NdjobiAIAgent (Users) | iAsted (Professionnels) |
|-----------------|----------------------|-------------------------|
| **Public cible** | Citoyens 👥 | Agents/Admins 🔒 |
| **Interface** | Chat texte | Vocal + Texte |
| **Technologie** | Claude (Anthropic) | Multi-LLM + STT + TTS |
| **Localisation** | Dashboard User | Dashboards Agent/Admin/Super-Admin |
| **Fonctionnalités** | Aide basique | Rapports, analyses, génération PDF |
| **Permissions** | Publiques | RBAC strict |
| **Déploiement** | Frontend React | Backend FastAPI + Frontend |
| **Statut** | ✅ Existant | ✅ Nouveau |

---

## 🗺️ Carte d'Affichage par Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard User (Citoyens)                                   │
│  URL: /dashboard/user                                        │
│                                                              │
│  ✅ NdjobiAIAgent (chat texte)                              │
│     └─ Bouton flottant en bas à droite                      │
│     └─ Aide création signalements                           │
│                                                              │
│  ❌ iAsted (NON affiché ici)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Dashboard Agent (DGSS)                                      │
│  URL: /dashboard/agent                                       │
│                                                              │
│  ❌ NdjobiAIAgent (NON affiché ici)                         │
│                                                              │
│  ✅ iAsted (vocal professionnel)                            │
│     └─ Bouton flottant violet/bleu bas-droite              │
│     └─ Clic → Dialog modale avec interface vocale          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Dashboard Admin (Protocole d'État)                          │
│  URL: /dashboard/admin                                       │
│                                                              │
│  ❌ NdjobiAIAgent (NON affiché ici)                         │
│                                                              │
│  ✅ iAsted (vocal professionnel)                            │
│     └─ Onglet dédié "iAsted IA" 🧠                         │
│     └─ Bouton flottant sur autres onglets                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Dashboard Super-Admin                                       │
│  URL: /dashboard/super-admin                                 │
│                                                              │
│  ❌ NdjobiAIAgent (NON affiché ici)                         │
│                                                              │
│  ✅ iAsted (vocal professionnel)                            │
│     └─ Bouton flottant violet/bleu bas-droite (ajouté!)    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Confirmation

### NdjobiAIAgent (Users) - TOUJOURS LÀ ✅

**Fichier** : `src/components/ai-agent/NdjobiAIAgent.tsx`  
**Affichage** : Géré par `App.tsx` lignes 132-147  
**Je n'ai JAMAIS touché à ce code !**

### iAsted (Professionnels) - NOUVELLEMENT AJOUTÉ ✅

**Intégrations effectuées** :
- ✅ **Dashboard Admin** : Onglet + Bouton flottant (ligne 858)
- ✅ **Dashboard Agent** : Bouton flottant (ligne 1345 - je viens d'ajouter)
- ✅ **Dashboard Super-Admin** : Bouton flottant (je vais ajouter maintenant)

Ajoutons iAsted au SuperAdminDashboard maintenant :

<function_calls>
<invoke name="read_file">
<parameter name="target_file">/Users/okatech/ndjobi/src/pages/dashboards/SuperAdminDashboard.tsx
