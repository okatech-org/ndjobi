# 🚀 Démarrage Rapide - Chatbot IA Ndjobi

## ✅ Tout est prêt !

Le chatbot IA Ndjobi est **100% implémenté** et prêt à l'emploi.

---

## 🎯 3 Étapes pour l'activer

### Étape 1 : Ouvrir `src/App.tsx`

### Étape 2 : Ajouter 2 lignes

```tsx
// En haut du fichier, avec les autres imports
import NdjobiAIAgent from "./components/ai-agent/NdjobiAIAgent";

// Dans le return, juste avant </BrowserRouter>
<NdjobiAIAgent />
```

### Étape 3 : Tester

```bash
bun run dev
```

Ouvrir http://localhost:8081 → Cliquer sur 🎭

---

## 📄 Code complet (copier/coller)

Voir le fichier `INTEGRATION-EXAMPLE.md` pour l'exemple complet.

---

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| `CHATBOT-STATUS.md` | État complet de l'implémentation |
| `INTEGRATION-EXAMPLE.md` | Exemples d'intégration détaillés |
| `AI-AGENT-README.md` | Configuration backend |
| `src/components/ai-agent/README.md` | Guide du composant |

---

## 🎨 Personnalisation rapide

```tsx
// Thème sombre
<NdjobiAIAgent theme="darkMode" />

// Position gauche
<NdjobiAIAgent position="bottom-left" />

// Ouvert par défaut
<NdjobiAIAgent initialOpen={true} />
```

---

## 🆘 Besoin d'aide ?

1. Lire `CHATBOT-STATUS.md` - tout y est expliqué
2. Voir `INTEGRATION-EXAMPLE.md` - exemples concrets
3. GitHub Issues : https://github.com/okatech-org/ndjobi/issues

---

## 🎉 C'est tout !

**Votre chatbot IA est fonctionnel en 2 minutes !** ⚡

Pour le backend production, voir `AI-AGENT-README.md`.
