# 📑 INDEX DES FICHIERS - Simulation NDJOBI

## 🎯 Démarrage Rapide

**👉 COMMENCEZ ICI :** `SIMULATION-README.md`

---

## 📁 Structure Complète

```
ndjobi/
├── 📖 Documentation
│   ├── SIMULATION-README.md                 ⭐ GUIDE PRINCIPAL
│   ├── GUIDE-COMPLET-SIMULATION.md          📚 Guide complet détaillé
│   ├── ETAPES-SUIVANTES.md                  🚀 Prochaines étapes
│   ├── INSTRUCTIONS-IMPORT.md               📥 Instructions import
│   ├── IDENTIFIANTS-CONNEXION.md            🔑 Tous les logins
│   ├── CONFIGURATION-ENV.md                 ⚙️  Config environnement
│   └── INDEX-SIMULATION.md                  📑 Ce fichier
│
├── 📊 Données de Simulation
│   └── scripts/data/
│       ├── ndjobi-signalements-dataset.json  (300+ signalements)
│       ├── ndjobi-users-dataset.json         (100+ utilisateurs)
│       ├── ndjobi-articles-presse.json       (Articles presse)
│       └── ndjobi-ia-config.json             (Config IA)
│
├── 🛠️ Scripts
│   ├── scripts/import-simulation-data.js     ⭐ Script d'import
│   ├── scripts/verify-simulation-data.js    ✅ Vérification
│   ├── scripts/diagnostic-simulation.js     🔍 Diagnostic
│   └── scripts/sql/
│       └── ndjobi-init-database.sql         🗄️  Init BDD
│
└── ⚙️  Configuration
    ├── package.json                          (Scripts npm ajoutés)
    └── .env.local                            (À créer par vous)
```

---

## 📚 Guide des Fichiers par Catégorie

### 🎯 Guides Utilisateur

| Fichier | Utilité | Quand l'utiliser |
|---------|---------|------------------|
| `SIMULATION-README.md` | Guide principal simplifié | Première lecture |
| `GUIDE-COMPLET-SIMULATION.md` | Documentation exhaustive | Référence complète |
| `ETAPES-SUIVANTES.md` | Pas-à-pas détaillé | Pendant l'installation |
| `INSTRUCTIONS-IMPORT.md` | Spécifique à l'import | Avant d'importer |
| `IDENTIFIANTS-CONNEXION.md` | Liste complète logins | Pour tester |

### 🛠️ Scripts Techniques

| Fichier | Commande | Fonction |
|---------|----------|----------|
| `import-simulation-data.js` | `npm run simulation:import` | Importe toutes les données |
| `verify-simulation-data.js` | `npm run simulation:verify` | Vérifie l'import |
| `diagnostic-simulation.js` | `npm run simulation:diagnostic` | Diagnostic complet |
| `ndjobi-init-database.sql` | Via Supabase Studio | Crée les tables |

### 📊 Données JSON

| Fichier | Contenu | Taille |
|---------|---------|--------|
| `ndjobi-signalements-dataset.json` | 300+ signalements diversifiés | ~500 KB |
| `ndjobi-users-dataset.json` | 100+ utilisateurs test | ~100 KB |
| `ndjobi-articles-presse.json` | 50+ articles contextuels | ~50 KB |
| `ndjobi-ia-config.json` | Configuration IA/Chatbot | ~20 KB |

---

## 🚦 Ordre d'Exécution Recommandé

### Phase 1 : Préparation (✅ FAIT)

1. ✅ Créer structure `scripts/data/`
2. ✅ Copier les fichiers JSON
3. ✅ Créer les scripts d'import

### Phase 2 : Configuration (👉 VOUS)

4. ⏳ Créer `.env.local` → Voir `CONFIGURATION-ENV.md`
5. ⏳ Récupérer clé service Supabase
6. ⏳ Exécuter script SQL → `scripts/sql/ndjobi-init-database.sql`

### Phase 3 : Import (👉 VOUS)

7. ⏳ Exécuter `npm run simulation:import`
8. ⏳ Vérifier avec `npm run simulation:verify`

### Phase 4 : Tests (👉 VOUS)

9. ⏳ Lancer `npm run dev`
10. ⏳ Tester dashboards → Voir `IDENTIFIANTS-CONNEXION.md`

---

## 🎓 Parcours d'Apprentissage

### Débutant
1. Lire `SIMULATION-README.md`
2. Suivre `ETAPES-SUIVANTES.md` pas-à-pas
3. Exécuter `npm run simulation:diagnostic` en cas de problème

### Intermédiaire
1. Consulter `GUIDE-COMPLET-SIMULATION.md`
2. Personnaliser les données JSON
3. Modifier le script d'import

### Avancé
1. Créer vos propres signalements
2. Configurer l'IA (OpenAI/Anthropic)
3. Déployer en production

---

## 🔧 Commandes NPM Ajoutées

```bash
# Diagnostic de la configuration
npm run simulation:diagnostic

# Import des données de simulation
npm run simulation:import

# Vérification après import
npm run simulation:verify
```

---

## 📊 Données de la Simulation

### Statistiques

- **300+** signalements diversifiés
- **100+** utilisateurs (67 anonymes, 45 identifiés)
- **6** comptes administrateurs (Super Admin, Admins, Agents)
- **~600** preuves associées (photos, documents, vidéos)
- **~50** articles de presse contextuels
- **9** régions du Gabon couvertes
- **15+** ministères concernés

### Types de Signalements

| Catégorie | Pourcentage | Exemples |
|-----------|-------------|----------|
| **Gab Pêche** | ~27% | Pirogues détournées, coopératives fantômes |
| **Enrichissement** | ~15% | Villas luxueuses, comptes offshore |
| **Marchés Publics** | ~20% | Surfacturation, appels d'offres truqués |
| **Forces de l'Ordre** | ~12% | Racket routier, extorsion |
| **Santé** | ~8% | Médicaments détournés, ambulances fantômes |
| **Éducation** | ~7% | Corruption examens, infrastructures |
| **Environnement** | ~5% | Déforestation, pollution |
| **Suggestions** | ~6% | Innovations citoyennes |

---

## 🎬 Scénarios de Démonstration

Consultez `IDENTIFIANTS-CONNEXION.md` pour :
- ✅ Scénario 1 : Dashboard Président
- ✅ Scénario 2 : Agent Gab Pêche
- ✅ Scénario 3 : Chatbot IA
- ✅ Scénario 4 : Protection Projet

---

## 🐛 Résolution de Problèmes

### Problème Rencontré ?

1. **Exécutez d'abord :** `npm run simulation:diagnostic`
2. **Consultez :** La section correspondante dans `ETAPES-SUIVANTES.md`
3. **Vérifiez :** Les logs de la console (`F12` dans le navigateur)

### Fichiers de Dépannage

- `ETAPES-SUIVANTES.md` → Section "Dépannage"
- `INSTRUCTIONS-IMPORT.md` → Section "Résolution de Problèmes"
- `GUIDE-COMPLET-SIMULATION.md` → Section "Dépannage"

---

## 🎯 Cas d'Usage des Fichiers

### Vous voulez... → Consultez...

| Besoin | Fichier |
|--------|---------|
| Démarrer rapidement | `SIMULATION-README.md` |
| Comprendre tout le processus | `GUIDE-COMPLET-SIMULATION.md` |
| Savoir quoi faire maintenant | `ETAPES-SUIVANTES.md` |
| Importer les données | `INSTRUCTIONS-IMPORT.md` |
| Tester les dashboards | `IDENTIFIANTS-CONNEXION.md` |
| Configurer l'environnement | `CONFIGURATION-ENV.md` |
| Diagnostiquer un problème | Exécuter `npm run simulation:diagnostic` |
| Vérifier l'import | Exécuter `npm run simulation:verify` |

---

## 🔐 Sécurité & Confidentialité

**⚠️ IMPORTANT :**

- Les fichiers `.env.local` ne doivent JAMAIS être committés
- Les mots de passe de simulation sont pour TEST uniquement
- En production, changez TOUS les identifiants
- La clé `service_role` est ultra-sensible

**Fichiers ignorés par Git :**
- `.env.local`
- `.env`
- `node_modules/`
- `dist/`

---

## 📞 Support

### Ordre de Consultation

1. 🔍 `npm run simulation:diagnostic` (automatique)
2. 📖 Fichier correspondant à votre problème (voir tableau ci-dessus)
3. 📚 `GUIDE-COMPLET-SIMULATION.md` (référence complète)
4. 💬 Relancer l'assistant IA pour aide supplémentaire

---

## 🎉 Félicitations !

Vous avez maintenant accès à une simulation complète et réaliste de NDJOBI.

**🚀 Prochaine étape :**  
Ouvrez `SIMULATION-README.md` et suivez les 3 étapes de démarrage rapide !

---

**Fait avec ❤️ pour lutter contre la corruption au Gabon 🇬🇦**
