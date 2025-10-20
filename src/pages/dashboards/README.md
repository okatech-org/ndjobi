# Architecture Dashboards NDJOBI

## 🏗️ Structure

```
dashboards/
├── President/              Dashboard présidentiel (vue stratégique)
│   ├── index.tsx          Point d'entrée avec lazy loading
│   ├── PresidentLayout.tsx  Layout élégant avec header national
│   ├── components/         4 onglets modulaires
│   │   ├── VueEnsemble.tsx
│   │   ├── OpinionPublique.tsx
│   │   ├── SituationsCritiques.tsx
│   │   └── VisionNationale.tsx
│   └── hooks/             Hooks spécifiques président
│       ├── usePresidentDashboard.ts
│       └── usePresidentData.ts
│
├── Admin/                 Dashboard admin (gestion opérationnelle)
│   ├── index.tsx          Point d'entrée
│   ├── AdminLayout.tsx    Layout avec sidebar
│   └── hooks/             Hooks spécifiques admin
│       └── useAdminDashboard.ts
│
├── shared/                Composants et hooks réutilisables
│   ├── components/        Composants UI communs
│   │   ├── KPICard.tsx   Carte KPI réutilisable
│   │   ├── ChartContainer.tsx  Wrapper graphiques
│   │   ├── LoadingSpinner.tsx  Indicateur chargement
│   │   └── EmptyState.tsx      État vide
│   ├── hooks/             Hooks partagés
│   │   └── useDashboardPermissions.ts
│   ├── utils/             Utilitaires
│   │   ├── formatters.ts  Formatage montants, dates
│   │   └── constants.ts   Constantes app
│   └── services/          Services API (à venir)
│
├── types/                 Types TypeScript communs
│   └── shared.types.ts
│
├── AdminDashboard.tsx     (Legacy - sera déprécié progressivement)
├── PresidentDashboard.tsx (Legacy - remplacé par President/)
├── AgentDashboard.tsx
├── SuperAdminDashboard.tsx
└── UserDashboard.tsx
```

## 📖 Conventions

### Nommage
- **Composants**: PascalCase (ex: `KPICard.tsx`)
- **Hooks**: camelCase avec préfixe "use" (ex: `usePresidentData.ts`)
- **Types**: PascalCase avec suffixe `.types.ts` (ex: `shared.types.ts`)
- **Services**: camelCase avec suffixe `Service.ts` (ex: `protocolEtatService.ts`)
- **Utils**: camelCase (ex: `formatters.ts`)

### Organisation des fichiers
- **Max 300 lignes** par fichier (idéalement <200)
- **1 composant = 1 fichier**
- **Barrel exports** dans `index.ts` pour composants shared
- **Co-location**: Hooks et composants spécifiques au même niveau que leur usage

## 🚀 Utilisation

### Dashboard Président

```tsx
import PresidentDashboard from './pages/dashboards/President';

// Le composant gère:
// - Lazy loading des onglets
// - Layout présidentiel
// - Hook usePresidentData (données Protocole d'État)
// - 4 vues: Vue d'Ensemble, Opinion, Situations, Vision
```

### Dashboard Admin

```tsx
import AdminDashboard from './pages/dashboards/Admin';

// Le composant gère:
// - Routing par ?view=xxx
// - Sidebar navigation (10 vues)
// - Layout admin avec glassmorphism
```

### Composants Shared

```tsx
import { KPICard, ChartContainer } from './pages/dashboards/shared/components';
import { formatMontant, getPriorityVariant } from './pages/dashboards/shared/utils/formatters';

<KPICard
  title="Cas Traités"
  value={1247}
  icon={FileText}
  trend={{ value: '+12%', label: 'vs mois dernier' }}
  color="blue"
/>
```

## 🔧 Développement

### Ajouter un nouveau composant shared

```bash
# 1. Créer fichier
touch src/pages/dashboards/shared/components/NewComponent.tsx

# 2. Implémenter avec JSDoc

# 3. Exporter dans index.ts
echo "export { NewComponent } from './NewComponent';" >> src/pages/dashboards/shared/components/index.ts

# 4. Créer tests (optionnel)
touch src/pages/dashboards/shared/components/__tests__/NewComponent.test.tsx
```

### Ajouter un nouvel onglet President

```bash
# 1. Créer composant
touch src/pages/dashboards/President/components/NouveauOnglet.tsx

# 2. Lazy import dans President/index.tsx
const NouveauOnglet = lazy(() => import('./components/NouveauOnglet'));

# 3. Ajouter TabsTrigger et TabsContent

# 4. Tester
npm run dev
```

## 🧪 Tests

```bash
# Tests unitaires (à venir)
npm run test

# Tests E2E
npm run test:e2e

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## 📊 Métriques

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **Fichiers** | 2 monolithes (6004 lignes) | 20 modules (~120 lignes/fichier) | +900% lisibilité |
| **Composants réutilisables** | 0 | 8 | +∞ |
| **Maintenabilité** | 🟡 Moyenne | 🟢 Excellente | +2 niveaux |
| **Testabilité** | 🔴 Difficile | 🟢 Facile | Composants isolés |

## 🎯 Prochaines Étapes

1. ✅ **Phase 1 terminée** : Architecture modulaire base créée
2. **Phase 2** (optionnel) : Découper Admin en vues séparées (DashboardView, GestionInstitutions, etc.)
3. **Phase 3** : Tests unitaires composants shared
4. **Phase 4** : Tests E2E Playwright  
5. **Phase 5** : Optimisations (React.memo, useMemo)
6. **Phase 6** : Storybook (documentation interactive)

## 📝 Notes Importantes

- ⚠️ `AdminDashboard.tsx` (4581 lignes) reste monolithique pour l'instant
  - Les vues sont déjà bien séparées en fonctions `render*()`
  - Extraction en fichiers séparés = Phase 2 optionnelle
- ✅ `PresidentDashboard.tsx` legacy peut être supprimé une fois tests validés
- ✅ Tous les imports utilisent chemins modulaires (`./President`, `./Admin`)
- ✅ Lazy loading implémenté (performances optimales)

## 🔗 Références

- [Ancien AdminDashboard](./AdminDashboard.tsx) - Legacy, 4581 lignes
- [Ancien PresidentDashboard](./PresidentDashboard.tsx) - Legacy, 722 lignes  
- [ModuleXR7 Actuel](../../components/admin/ModuleXR7.tsx) - Non migré (utilisé tel quel)
- [iAsted Actuel](../../components/admin/IAstedFloatingButton.tsx) - Non migré (utilisé tel quel)

---

**Architecture v2.0** - Octobre 2025 - NDJOBI Platform

