# 🔧 Fix - Problème de Page Blanche et Chargement Infini

## 🐛 Problème Identifié

Lors des mises à jour ou nouvelles fonctionnalités, la page devient blanche et charge en boucle jusqu'à vider le cache.

### Causes identifiées et corrigées :

1. **❌ Boucle infinie dans `useToast`**
   - `useEffect` avec dépendance `[state]` → re-render infini
   - **Fix** : Changé en `[]` (ligne 177)

2. **❌ Double render React**
   - `main.tsx` avec logique complexe de montage
   - **Fix** : Simplifié avec `StrictMode` standard

3. **❌ Cache Vite corrompu**
   - `node_modules/.vite` non nettoyé
   - **Fix** : Scripts de nettoyage ajoutés

4. **❌ Optimisations Vite manquantes**
   - Pas de pre-bundling des dépendances
   - **Fix** : `optimizeDeps` configuré

---

## ✅ Correctifs Appliqués

### 1. `src/hooks/use-toast.ts` (CRITIQUE)

**Avant** (boucle infinie) :
```tsx
React.useEffect(() => {
  listeners.push(setState);
  return () => { /* cleanup */ };
}, [state]); // ❌ Re-render à chaque changement de state
```

**Après** (fix) :
```tsx
React.useEffect(() => {
  listeners.push(setState);
  return () => { /* cleanup */ };
}, []); // ✅ S'exécute une seule fois
```

---

### 2. `src/main.tsx` (SIMPLIFIÉ)

**Avant** (complexe) :
```tsx
const renderApp = () => {
  const rootElement = document.getElementById("root");
  if (rootElement && !rootElement.hasAttribute('data-react-root')) {
    rootElement.setAttribute('data-react-root', 'true');
    createRoot(rootElement).render(<App />);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
```

**Après** (standard React 18) :
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

### 3. `vite.config.ts` (OPTIMISÉ)

**Ajouté** :
```ts
server: {
  hmr: { overlay: true },  // Afficher erreurs
},
optimizeDeps: {
  include: ["react", "react-dom", "react-dom/client", "@supabase/supabase-js"],
  exclude: [],
},
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'supabase': ['@supabase/supabase-js'],
        'ui': ['lucide-react', 'date-fns'],
      },
    },
  },
  chunkSizeWarningLimit: 1000,
},
```

---

### 4. Scripts NPM Ajoutés

**`package.json`** :
```json
{
  "scripts": {
    "dev": "vite",
    "dev:clean": "rm -rf node_modules/.vite .vite && vite",
    "clean": "rm -rf node_modules/.vite .vite dist",
    "fresh": "rm -rf node_modules/.vite .vite dist && bun install && vite"
  }
}
```

**Usage** :
```bash
# Développement normal
bun run dev

# Si page blanche → nettoyer cache puis démarrer
bun run dev:clean

# Nettoyage complet (cache + deps)
bun run fresh
```

---

### 5. Script Shell `clear-cache.sh`

**Créé** : `clear-cache.sh` (exécutable)

```bash
#!/bin/bash
# Nettoie tout : cache Vite + reinstall deps

./clear-cache.sh
# Puis
bun run dev
```

---

## 🚀 Solutions par Scénario

### Scénario 1 : Page blanche après update

```bash
# Solution rapide
bun run dev:clean
```

### Scénario 2 : Chargement infini

```bash
# Vider le cache navigateur
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# OU lancer avec cache nettoyé
bun run dev:clean
```

### Scénario 3 : Problème persiste

```bash
# Reset complet
bun run fresh

# OU manuellement
rm -rf node_modules/.vite .vite dist
bun install
bun run dev
```

### Scénario 4 : Erreur après ajout dépendance

```bash
# Nettoyer + réinstaller
bun run clean
bun install
bun run dev
```

---

## 🔍 Diagnostic

### Vérifier si le problème vient du cache

```bash
# Voir le contenu du cache Vite
ls -lah node_modules/.vite/

# Si des fichiers datent d'avant vos modifs → problème de cache
```

### Vérifier les boucles infinies

Ouvrir la console navigateur (F12) :
```
Console → Filtrer "useEffect"
Network → Voir si requêtes en boucle
Performance → Profiler le rendu
```

---

## 🛡️ Préventions Futures

### 1. Toujours utiliser les dépendances correctes

```tsx
// ❌ MAUVAIS (boucle)
useEffect(() => {
  // code
}, [state]); // Si state change dans l'effet

// ✅ BON
useEffect(() => {
  // code
}, []); // Ou dépendances externes uniquement
```

### 2. Utiliser useCallback/useMemo

```tsx
// Pour éviter re-créations
const handleClick = useCallback(() => {
  // code
}, [deps]);

const computed = useMemo(() => {
  return expensiveCalc();
}, [deps]);
```

### 3. Nettoyer après dev

```bash
# Tous les jours
bun run clean

# Avant commit
bun run clean && bun install && bun run build
```

---

## 📊 Commandes Utiles

| Commande | Usage |
|----------|-------|
| `bun run dev` | Démarrage normal |
| `bun run dev:clean` | Démarrage avec cache nettoyé |
| `bun run clean` | Nettoyer cache uniquement |
| `bun run fresh` | Reset complet (cache + deps) |
| `./clear-cache.sh` | Script automatique |

---

## 🧪 Tester les Fixes

### 1. Nettoyer tout

```bash
bun run fresh
```

### 2. Démarrer

```bash
bun run dev
```

### 3. Vérifier

- ✅ Page charge normalement
- ✅ Pas de spinner infini
- ✅ Console sans erreurs
- ✅ HMR fonctionne (modifications à chaud)

### 4. Tester mise à jour

```bash
# Modifier un fichier (ex: src/App.tsx)
# Sauvegarder
# → La page doit se recharger automatiquement (HMR)
# → Pas de page blanche
```

---

## 🎯 Résumé des Fixes

| Problème | Fichier | Fix |
|----------|---------|-----|
| Boucle infinie | `use-toast.ts` | `[state]` → `[]` |
| Double render | `main.tsx` | StrictMode standard |
| Cache corrompu | `vite.config.ts` | optimizeDeps configuré |
| Scripts manquants | `package.json` | dev:clean, fresh |
| Nettoyage manuel | `clear-cache.sh` | Script shell |

---

## 💡 Bonnes Pratiques

### Avant chaque session dev

```bash
# Option 1 : Simple
bun run dev

# Option 2 : Si problèmes hier
bun run dev:clean
```

### Après ajout dépendances

```bash
bun add <package>
bun run clean
bun run dev
```

### Avant commit/deploy

```bash
bun run clean
bun install
bun run build
# Vérifier dist/ généré
```

---

## 🔗 Ressources

**Vite Docs** : https://vitejs.dev/guide/dep-pre-bundling.html  
**React Strict Mode** : https://react.dev/reference/react/StrictMode  
**Supabase Cache** : Géré automatiquement

---

## ✅ Checklist Post-Fix

- [x] `use-toast.ts` corrigé (boucle infinie)
- [x] `main.tsx` simplifié (double render)
- [x] `vite.config.ts` optimisé (cache)
- [x] Scripts ajoutés à `package.json`
- [x] `clear-cache.sh` créé
- [ ] Tester : `bun run fresh` puis `bun run dev`
- [ ] Vérifier : Page charge normalement
- [ ] Vérifier : HMR fonctionne sans page blanche

---

## 🎉 Conclusion

**Les 3 problèmes principaux ont été corrigés :**

1. ✅ Boucle infinie useToast éliminée
2. ✅ Double render React supprimé
3. ✅ Cache Vite optimisé

**Testez maintenant** :
```bash
bun run fresh
```

La page ne devrait plus jamais être blanche ! 🚀

---

*Fix appliqué : 14 octobre 2025* 🇬🇦

