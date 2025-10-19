# ✅ CHECKLIST D'IMPLÉMENTATION - Simulation NDJOBI

## 📋 Progression de l'Installation

### Phase 1 : Préparation ✅ (FAIT PAR L'IA)

- [x] Créer dossier `scripts/data/`
- [x] Copier `ndjobi-signalements-dataset.json` (300+ signalements)
- [x] Copier `ndjobi-users-dataset.json` (100+ users)
- [x] Copier `ndjobi-articles-presse.json` (50+ articles)
- [x] Copier `ndjobi-ia-config.json` (config IA)
- [x] Créer `scripts/import-simulation-data.js`
- [x] Créer `scripts/verify-simulation-data.js`
- [x] Créer `scripts/diagnostic-simulation.js`
- [x] Créer `scripts/sql/ndjobi-init-database.sql`
- [x] Créer toute la documentation (9 fichiers)
- [x] Ajouter commandes npm dans `package.json`

**✅ Phase 1 : 100% complète !**

---

### Phase 2 : Configuration Base de Données ⏳ (VOUS)

- [ ] Ouvrir https://app.supabase.com
- [ ] Sélectionner le projet NDJOBI
- [ ] Aller dans "SQL Editor"
- [ ] Créer une "New Query"
- [ ] Copier le contenu de `scripts/sql/ndjobi-init-database.sql`
- [ ] Cliquer sur "RUN" (ou F5)
- [ ] Vérifier le message : `✅ Base de données NDJOBI initialisée avec succès!`
- [ ] Dans "Table Editor", vérifier que les tables existent :
  - [ ] `profiles`
  - [ ] `user_roles`
  - [ ] `signalements`
  - [ ] `preuves`
  - [ ] `investigations`
  - [ ] `notifications`
  - [ ] `audit_logs`
  - [ ] `statistiques_cache`

**📊 Progression Phase 2 : ___ / 10**

---

### Phase 3 : Configuration Environnement ⏳ (VOUS)

- [ ] Aller dans Supabase → "Settings" → "API"
- [ ] Copier la clé "service_role" (⚠️ PAS "anon public")
- [ ] Créer le fichier `.env.local` à la racine du projet
- [ ] Coller ce contenu dans `.env.local` :

```bash
VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
SUPABASE_SERVICE_ROLE_KEY=COLLEZ_ICI_LA_CLE_SERVICE
```

- [ ] Remplacer `COLLEZ_ICI_LA_CLE_SERVICE` par la vraie clé
- [ ] Sauvegarder `.env.local`
- [ ] (Optionnel) Exécuter `npm run simulation:diagnostic` pour vérifier

**📊 Progression Phase 3 : ___ / 6**

---

### Phase 4 : Import des Données ⏳ (VOUS)

- [ ] Ouvrir un terminal à la racine du projet
- [ ] Exécuter `npm run simulation:import` (ou `node scripts/import-simulation-data.js`)
- [ ] Attendre la fin de l'import (~2-5 minutes)
- [ ] Vérifier les messages :
  - [ ] `✅ Connexion Supabase OK`
  - [ ] `✅ Création admins terminée: 6/6`
  - [ ] `✅ Import utilisateurs terminé: 45/45`
  - [ ] `✅ Import signalements terminé: 300/300`
  - [ ] `✅ Statistiques nationales générées`
  - [ ] `✅ IMPORT TERMINÉ`
- [ ] Noter les identifiants de connexion affichés
- [ ] (Optionnel) Exécuter `npm run simulation:verify` pour double vérification

**📊 Progression Phase 4 : ___ / 8**

---

### Phase 5 : Vérification Supabase ⏳ (VOUS)

- [ ] Aller sur Supabase Dashboard
- [ ] "Table Editor" → Sélectionner `profiles`
- [ ] Vérifier : ~50 profils (6 admins + 45 users)
- [ ] "Table Editor" → Sélectionner `signalements`
- [ ] Vérifier : ~300 signalements
- [ ] "Table Editor" → Sélectionner `user_roles`
- [ ] Vérifier : ~50 rôles assignés
- [ ] "SQL Editor" → Exécuter ces requêtes :

```sql
-- Vérifier distribution par urgence
SELECT urgence, COUNT(*) 
FROM signalements 
GROUP BY urgence;

-- Vérifier cas Gab Pêche
SELECT COUNT(*) 
FROM signalements 
WHERE categorie = 'malversation_gab_peche';

-- Vérifier comptes admin
SELECT email, role, full_name 
FROM profiles 
WHERE role IN ('super_admin', 'admin', 'agent');
```

- [ ] Résultats attendus :
  - [ ] Urgence critique : ~85 cas
  - [ ] Gab Pêche : ~80 cas
  - [ ] 6 comptes admin visibles

**📊 Progression Phase 5 : ___ / 10**

---

### Phase 6 : Tests Application ⏳ (VOUS)

#### 6.1 Lancer l'Application

- [ ] Ouvrir terminal
- [ ] Exécuter `npm run dev`
- [ ] Attendre message : `Local: http://localhost:5173/`
- [ ] Ouvrir navigateur : http://localhost:5173
- [ ] Vérifier que la page d'accueil s'affiche

**📊 Sous-checklist 6.1 : ___ / 5**

#### 6.2 Test Dashboard Super Admin

- [ ] Cliquer sur "Connexion"
- [ ] Email : `president@ndjobi.ga`
- [ ] Mot de passe : `Admin2025Secure!`
- [ ] Vérifier que le dashboard s'affiche
- [ ] Onglet "Dashboard Global" :
  - [ ] Total signalements : ~300 affiché
  - [ ] Cas critiques : ~85 affiché
  - [ ] Graphique distribution régionale visible
  - [ ] Graphique évolution temporelle visible
  - [ ] KPIs affichés (montant récupéré, taux résolution...)
- [ ] Onglet "Validation" :
  - [ ] Liste des cas critiques Gab Pêche visible
  - [ ] Boutons d'action fonctionnels (Approuver, Rejeter...)
- [ ] Onglet "Rapports" :
  - [ ] Génération PDF fonctionne

**📊 Sous-checklist 6.2 : ___ / 12**

#### 6.3 Test Dashboard Agent

- [ ] Se déconnecter du compte Président
- [ ] Se connecter : `agent.mer@ndjobi.ga` / `Admin2025Secure!`
- [ ] Vérifier que SEULS les cas Gab Pêche sont visibles
- [ ] Sélectionner un signalement
- [ ] Changer le statut : "En enquête"
- [ ] Ajouter une note : "Test enquête"
- [ ] Sauvegarder
- [ ] Vérifier que les modifications sont enregistrées
- [ ] Tester les filtres (par urgence, par statut...)

**📊 Sous-checklist 6.3 : ___ / 9**

#### 6.4 Test Chatbot IA

- [ ] Se déconnecter (ou utiliser mode navigation privée)
- [ ] Page d'accueil
- [ ] Vérifier que le bouton flottant (logo Ndjobi) est visible en bas à droite
- [ ] Cliquer sur le bouton
- [ ] Interface chat s'ouvre
- [ ] Cliquer sur "🎯 Taper le Ndjobi"
- [ ] Suivre le flux guidé :
  - [ ] Choisir type de corruption
  - [ ] Entrer localisation (ou GPS)
  - [ ] Écrire description
  - [ ] Passer témoins (optionnel)
  - [ ] Valider le récapitulatif
  - [ ] Envoyer
- [ ] Recevoir confirmation avec numéro de dossier
- [ ] Tester la reconnaissance vocale (bouton micro)
- [ ] Tester les questions suggérées

**📊 Sous-checklist 6.4 : ___ / 13**

**📊 Progression Phase 6 : ___ / 39**

---

### Phase 7 : Tests Avancés ⏳ (Optionnel)

- [ ] Tester Dashboard Admin (3 comptes différents)
- [ ] Tester RLS : Agent ne voit QUE ses cas
- [ ] Créer un nouveau signalement via formulaire classique
- [ ] Tester la recherche full-text
- [ ] Tester les filtres par région/ministère
- [ ] Générer un rapport PDF présidentiel
- [ ] Tester sur mobile (responsive)
- [ ] Tester mode sombre (si implémenté)

**📊 Progression Phase 7 : ___ / 8**

---

### Phase 8 : Configuration IA ⏳ (Optionnel)

- [ ] Obtenir clé API OpenAI ou Anthropic
- [ ] Ajouter dans `.env.local` :

```bash
VITE_OPENAI_API_KEY=sk-proj-VOTRE_CLE
# OU
VITE_ANTHROPIC_API_KEY=sk-ant-VOTRE_CLE
```

- [ ] Redémarrer l'application
- [ ] Tester le chatbot avec réponses IA réelles
- [ ] Vérifier la qualité des réponses

**📊 Progression Phase 8 : ___ / 5**

---

## 📊 PROGRESSION GLOBALE

```
Phase 1 : Préparation              [████████████████████] 100% ✅
Phase 2 : Configuration BDD        [____________________]   0% ⏳
Phase 3 : Configuration ENV        [____________________]   0% ⏳
Phase 4 : Import Données           [____________________]   0% ⏳
Phase 5 : Vérification Supabase    [____________________]   0% ⏳
Phase 6 : Tests Application        [____________________]   0% ⏳
Phase 7 : Tests Avancés            [____________________]   0% ⏳ (Opt)
Phase 8 : Configuration IA         [____________________]   0% ⏳ (Opt)

TOTAL PROGRESSION : _____% (cochez au fur et à mesure)
```

---

## 🎯 Indicateurs de Succès

Une fois TOUTES les phases complétées, vous devez avoir :

### Données

- [ ] ~300 signalements dans Supabase
- [ ] ~50 profils utilisateurs
- [ ] 6 comptes admin fonctionnels
- [ ] ~600 preuves associées
- [ ] 1 ligne de statistiques nationales

### Application

- [ ] Dashboard Président affiche ~300 signalements
- [ ] Graphiques affichent les données
- [ ] Agent voit UNIQUEMENT ses cas
- [ ] Chatbot guide l'utilisateur
- [ ] Soumission signalement fonctionne

### Sécurité

- [ ] RLS fonctionne correctement
- [ ] Mode anonyme protège l'identité
- [ ] Audit logs activés
- [ ] Clé service_role non exposée

---

## 🆘 En Cas de Problème

### Diagnostic Automatique

```bash
npm run simulation:diagnostic
```

### Par Phase

| Phase Bloquée | Fichier à Consulter |
|---------------|---------------------|
| Phase 2 (BDD) | `ETAPES-SUIVANTES.md` → Section "Initialiser BDD" |
| Phase 3 (ENV) | `CONFIGURATION-ENV.md` |
| Phase 4 (Import) | `INSTRUCTIONS-IMPORT.md` |
| Phase 6 (Tests) | `IDENTIFIANTS-CONNEXION.md` |

---

## 🎉 Félicitations !

Quand toutes les cases sont cochées, votre simulation NDJOBI est **100% opérationnelle** !

### Vous Pouvez Maintenant :

✅ Démontrer la plateforme avec des données réalistes  
✅ Tester tous les workflows (signalement, validation, enquête)  
✅ Former des utilisateurs sur NDJOBI  
✅ Présenter aux autorités gabonaises  
✅ Personnaliser pour votre contexte  

---

## 📞 Aide Supplémentaire

Si vous êtes bloqué :

1. 🔍 Exécutez `npm run simulation:diagnostic`
2. 📖 Consultez le fichier correspondant
3. 💬 Relancez l'assistant IA pour aide

---

**🎯 Cochez les cases au fur et à mesure de votre progression !**

**🇬🇦 Bon courage pour lutter contre la corruption !**
