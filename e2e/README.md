# Tests E2E - Playwright

## Installation

```bash
# Installer Playwright et navigateurs
bun run playwright:install
```

## Lancement des Tests

```bash
# Tous les tests
bun run test:e2e

# Mode UI interactif
bun run test:e2e:ui

# Mode headed (voir le navigateur)
bun run test:e2e:headed

# Mode debug (pas à pas)
bun run test:e2e:debug

# Test spécifique
bunx playwright test admin-dashboard.spec.ts

# Test dans un navigateur spécifique
bunx playwright test --project=chromium
```

## Suites de Tests

### 1. admin-dashboard.spec.ts
Tests du Dashboard Protocole d'État (Admin)
- Affichage KPIs nationaux
- Navigation entre onglets
- Graphiques et visualisations
- Génération rapports PDF
- Validation cas sensibles
- Responsive mobile

### 2. super-admin-users.spec.ts
Tests de la gestion utilisateurs (Super Admin)
- Affichage liste utilisateurs
- Recherche et filtres
- Voir détails utilisateur
- Changer rôle
- Suspendre/Réactiver
- Actualiser liste

### 3. module-xr7.spec.ts
Tests du Module XR-7 - Protocole d'Urgence
- Affichage module
- Conditions d'activation
- Cadre légal
- Dialog activation
- Validation formulaire
- Sécurité et alertes

### 4. realtime-notifications.spec.ts
Tests des notifications temps réel
- Abonnement Supabase Realtime
- Indicateur notifications actives
- Toast cas critiques
- Désabonnement propre

## Configuration

Voir `playwright.config.ts` pour :
- Navigateurs testés : Chromium, Firefox, WebKit
- Captures d'écran sur échec
- Traces pour debug
- Server de dev auto-démarré

## Résultats

Les rapports HTML sont générés dans `playwright-report/`

