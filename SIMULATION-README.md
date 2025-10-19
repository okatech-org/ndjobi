# 🎭 SIMULATION COMPLÈTE NDJOBI

> Système Anti-Corruption pour le Gabon - Version Simulation avec 300+ cas réels

---

## 🎯 Vue d'Ensemble

Cette simulation complète de NDJOBI comprend :

- **300+ signalements** réalistes (corruption, problématiques, suggestions)
- **100+ utilisateurs** (anonymes et identifiés)  
- **6 comptes administrateurs** (Super Admin, Admins, Agents)
- **Base de données** complète avec Row Level Security (RLS)
- **Chatbot IA** interactif et guidé
- **Dashboards** fonctionnels pour tous les rôles

---

## 🚀 Démarrage Rapide (3 Étapes)

### ÉTAPE 1 : Initialiser la Base de Données

```
1. Ouvrez https://app.supabase.com
2. SQL Editor → New Query
3. Copiez scripts/sql/ndjobi-init-database.sql
4. Exécutez (RUN)
5. Attendez ✅ confirmation
```

### ÉTAPE 2 : Configurer l'Environnement

```
1. Créez le fichier .env.local à la racine
2. Ajoutez:
```

```bash
VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
SUPABASE_SERVICE_ROLE_KEY=VOTRE_CLE_SERVICE_ICI
```

```
3. Supabase → Settings → API → Copiez "service_role key"
4. Remplacez VOTRE_CLE_SERVICE_ICI
```

### ÉTAPE 3 : Importer les Données

```bash
# Dans le terminal
npm run simulation:import

# OU
node scripts/import-simulation-data.js
```

**Durée :** 2-5 minutes

---

## 🔑 Identifiants de Test (Comptes Existants)

⚠️ **Connexion :** Téléphone + Code PIN (6 chiffres)

| Rôle | Téléphone | PIN | Dashboard |
|------|-----------|-----|-----------|
| **Super Admin Système** | +33661002616 | 999999 | `/dashboard/super-admin` |
| **Président** | +24177888001 | 111111 | `/dashboard/super-admin` |
| **Sous-Admin DGSS** | +24177888002 | 222222 | `/dashboard/admin` |
| **Sous-Admin DGR** | +24177888003 | 333333 | `/dashboard/admin` |

---

## 🧪 Tester la Simulation

### 1. Lancer l'Application

```bash
npm run dev
```

Ouvrez `http://localhost:5173`

### 2. Test Complet

#### A. Dashboard Président

```
1. Login: +24177888001 / PIN: 111111
2. Vérifier KPIs:
   ✅ ~300 signalements
   ✅ ~85 cas critiques
   ✅ Distribution régionale
3. Onglet "Validation":
   ✅ Cas Gab Pêche > 2 Mrd
   ✅ Actions: Approuver/Rejeter
```

#### B. Dashboard Sous-Admin DGSS

```
1. Login: +24177888002 / PIN: 222222
2. Vérifier:
   ✅ Vue sectorielle sécurité
   ✅ Assignation agents
   ✅ Statistiques sectorielles
```

#### C. Chatbot IA

```
1. Page d'accueil (déconnecté)
2. Cliquer bouton flottant (logo animé)
3. Tester flux:
   ✅ "Taper le Ndjobi"
   ✅ GPS ou adresse manuelle
   ✅ Soumission anonyme
```

---

## 📊 Contenu de la Simulation

### Signalements par Catégorie

```
💰 Gab Pêche (malversations)     : ~80 cas
💸 Enrichissement Illicite        : ~45 cas
📄 Marchés Publics                : ~60 cas
🚔 Corruption Forces Ordre        : ~35 cas
⚕️  Santé                          : ~25 cas
🎓 Éducation                      : ~20 cas
🌳 Environnement                  : ~15 cas
💡 Suggestions                    : ~20 cas
```

### Signalements par Urgence

```
🔴 Critique  : ~85 cas (28%)
🟠 Haute     : ~95 cas (32%)
🟡 Moyenne   : ~90 cas (30%)
🟢 Basse     : ~30 cas (10%)
```

### Montants Détournés

```
Total estimé  : ~50 Milliards FCFA
Plus gros cas : 6,7 Mrd (DG CNSS)
Gab Pêche     : ~15 Mrd cumulés
```

---

## 🎬 Cas Réels de la Simulation

### Top 5 Cas Critiques

1. **SIG-2025-022** - Enrichissement DG CNSS (6,7 Mrd FCFA)
2. **SIG-2025-014** - Coopératives fantômes Gab Pêche (5 Mrd FCFA)
3. **SIG-2025-001** - Pirogues détournées Gab Pêche (890M FCFA)
4. **SIG-2025-013** - Surfacturation lycée Koulamoutou (2,3 Mrd FCFA)
5. **SIG-2025-017** - Racket douanes aéroport (4,8 Mrd FCFA/an)

### Exemples Problématiques Diverses

- **SIG-2025-012** - Pont effondré Bitam (isolement région)
- **SIG-2025-020** - Générateur hôpital Lambaréné (6 mois panne)
- **SIG-2025-018** - Salles surchargées Moanda (120 élèves/classe)
- **SIG-2025-025** - Pollution Port-Gentil (déversements pétroliers)

### Exemples Suggestions

- **SIG-2025-021** - Bus scolaires gratuits zones rurales
- **SIG-2025-016** - App traçabilité Gab Pêche blockchain
- **SIG-2025-026** - Loi protection lanceurs d'alerte

---

## 📚 Documentation Complète

| Fichier | Description |
|---------|-------------|
| `GUIDE-COMPLET-SIMULATION.md` | Guide master complet |
| `ETAPES-SUIVANTES.md` | Prochaines étapes détaillées |
| `INSTRUCTIONS-IMPORT.md` | Instructions import pas-à-pas |
| `IDENTIFIANTS-CONNEXION.md` | Tous les logins de test |
| `CONFIGURATION-ENV.md` | Configuration environnement |

---

## 🛠️ Commandes Utiles

```bash
# Import des données
npm run simulation:import

# Vérification après import
npm run simulation:verify

# Lancer l'application
npm run dev

# Build production
npm run build

# Tests
npm test
npm run test:e2e
```

---

## 🔍 Vérifications SQL

```sql
-- Vérifier import complet
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE role IN ('super_admin', 'admin', 'agent')) as admin_count,
  (SELECT COUNT(*) FROM signalements) as total_signalements,
  (SELECT COUNT(*) FROM signalements WHERE urgence = 'critique') as cas_critiques,
  (SELECT COUNT(*) FROM preuves) as total_preuves;

-- Distribution régionale
SELECT region, COUNT(*) as cas
FROM signalements 
WHERE region IS NOT NULL
GROUP BY region
ORDER BY cas DESC;

-- Top ministères concernés
SELECT ministere_concerne, COUNT(*) as signalements
FROM signalements
WHERE ministere_concerne IS NOT NULL
GROUP BY ministere_concerne
ORDER BY signalements DESC
LIMIT 10;
```

---

## ⚠️ Sécurité

**IMPORTANT pour la PRODUCTION :**

- 🔐 Changez TOUS les mots de passe
- 🚫 La clé `service_role` ne doit JAMAIS être exposée côté client
- ✅ Activez l'authentification 2FA pour les admins
- 🔒 Vérifiez les RLS policies avant déploiement
- 📊 Activez le monitoring et les logs d'audit

---

## 🐛 Dépannage Rapide

| Problème | Solution |
|----------|----------|
| "Invalid API key" | Vérifiez la clé service_role dans `.env.local` |
| "Table doesn't exist" | Exécutez d'abord le script SQL d'initialisation |
| Dashboard vide | Vérifiez que l'import s'est bien déroulé |
| Signalement pas visible | Vérifiez les RLS policies pour le rôle |
| Chatbot ne répond pas | Configuration IA optionnelle (voir docs) |

---

## 📞 Besoin d'Aide ?

1. **Lisez** `ETAPES-SUIVANTES.md` pour guide détaillé
2. **Exécutez** `npm run simulation:verify` pour diagnostiquer
3. **Vérifiez** les logs dans la console (F12)
4. **Consultez** Supabase Dashboard → Table Editor

---

## 🎉 Félicitations !

Vous avez maintenant une plateforme anti-corruption complète et fonctionnelle !

**🚀 Prochaines étapes :**
- ✅ Testez tous les dashboards
- ✅ Explorez les signalements
- ✅ Testez le chatbot IA
- ✅ Personnalisez selon vos besoins
- ✅ Déployez en production

---

**Fait avec ❤️ pour lutter contre la corruption au Gabon 🇬🇦**


