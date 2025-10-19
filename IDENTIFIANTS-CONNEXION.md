# 🔑 IDENTIFIANTS DE CONNEXION - Simulation NDJOBI

## ⚠️ IMPORTANT : Comptes Existants

Les comptes administrateurs **existent déjà** dans Supabase. L'import met à jour uniquement leurs profils et rôles.

**Connexion :** Téléphone + Code PIN (6 chiffres)

---

## 👑 Super Administrateur Système

**Email :** `33661002616@ndjobi.com`  
**Téléphone :** `+33661002616`  
**Code PIN :** `999999`  
**Rôle :** Super Admin  
**Fonction :** Super Administrateur Système  
**Dashboard :** `/dashboard/super-admin`

**Accès :**
- ✅ Accès système complet
- ✅ Gestion totale des utilisateurs
- ✅ Configuration plateforme
- ✅ Tous les signalements
- ✅ Tous les dashboards

---

## 🏛️ Président de la République

**Email :** `24177888001@ndjobi.com`  
**Téléphone :** `+24177888001`  
**Code PIN :** `111111`  
**Rôle :** Super Admin  
**Fonction :** Président / Administrateur  
**Organisation :** Présidence de la République  
**Dashboard :** `/dashboard/super-admin`

**Accès :**
- ✅ Vue nationale complète
- ✅ Validation cas critiques (> 2 Mrd FCFA)
- ✅ Génération rapports présidentiels
- ✅ Accès à tous les signalements
- ✅ Décisions stratégiques

---

## 🛡️ Sous-Administrateurs

### DGSS (Direction Générale de la Sécurité d'État)

**Email :** `24177888002@ndjobi.com`  
**Téléphone :** `+24177888002`  
**Code PIN :** `222222`  
**Rôle :** Sous-Admin  
**Fonction :** Sous-Administrateur DGSS  
**Organisation :** DGSS (Direction Générale de la Sécurité d'État)  
**Dashboard :** `/dashboard/admin`

**Accès :**
- ✅ Vue sectorielle sécurité
- ✅ Assignation agents
- ✅ Statistiques sectorielles
- ✅ Rapports ministériels

---

### DGR (Direction Générale du Renseignement)

**Email :** `24177888003@ndjobi.com`  
**Téléphone :** `+24177888003`  
**Code PIN :** `333333`  
**Rôle :** Sous-Admin  
**Fonction :** Sous-Administrateur DGR  
**Organisation :** DGR (Direction Générale du Renseignement)  
**Dashboard :** `/dashboard/admin`

**Accès :**
- ✅ Vue sectorielle renseignement
- ✅ Assignation agents spécialisés
- ✅ Enquêtes sensibles
- ✅ Intelligence anticorruption

---

## 👤 Utilisateurs de Test (Citoyens)

Après l'import, plusieurs comptes utilisateurs seront disponibles. Exemples :

### Témoin Mer (Agent administratif)

**Email :** `temoin_peche@secure.ndjobi.ga`  
**Mot de passe :** `SimulationPass2025!`  
**Profil :** Agent administratif - Ministère de la Mer  
**Signalements :** 1 (Gab Pêche)

---

### Ingénieur TP

**Email :** `ingenieur.tp@ndjobi.ga`  
**Mot de passe :** `SimulationPass2025!`  
**Profil :** Ingénieur BTP - Bureau d'études privé  
**Signalements :** 1 (Surfacturation routes)

---

### Marie OBIANG

**Email :** `m.obiang@gmail.com`  
**Mot de passe :** `SimulationPass2025!`  
**Profil :** Citoyenne - Franceville  
**Signalements :** 1 (Santé)

---

### Jean-Paul NGUEMA

**Email :** `jp.nguema@tech.ga`  
**Mot de passe :** `SimulationPass2025!`  
**Profil :** Développeur - Entrepreneur Tech  
**Signalements :** 1 (Suggestion innovation)

---

## 🧪 Scénarios de Test

### Test 1 : Dashboard Président (Super Admin)

```bash
1. Lancer: npm run dev
2. Aller sur: http://localhost:5173
3. Se connecter: president@ndjobi.ga / Admin2025Secure!
4. Vérifier:
   - Total signalements: ~300
   - Cas critiques: ~85
   - Distribution régionale
   - Graphique évolution
5. Onglet "Validation":
   - Voir les cas Gab Pêche > 2 Mrd FCFA
   - Tester: Approuver / Rejeter / Enquête
```

### Test 2 : Dashboard Agent (Ministère Mer)

```bash
1. Se déconnecter du compte Président
2. Se connecter: agent.mer@ndjobi.ga / Admin2025Secure!
3. Vérifier:
   - UNIQUEMENT signalements Gab Pêche visibles
   - RLS fonctionne (ne voit pas les autres)
4. Sélectionner un cas:
   - Changer statut: "En enquête"
   - Ajouter note: "Visite terrain planifiée"
   - Sauvegarder
```

### Test 3 : Chatbot IA

```bash
1. Sur la page d'accueil (déconnecté)
2. Cliquer sur le bouton flottant (logo Ndjobi)
3. Dire: "Je veux taper le Ndjobi"
4. Suivre le flux:
   - Type: Corruption/Pots-de-vin
   - Localisation: Utiliser GPS ou écrire
   - Description: "Test racket barrage PK12"
   - Témoins: Non
   - Valider et envoyer
5. Recevoir numéro de dossier
```

### Test 4 : Protection Projet

```bash
1. Dans le chatbot
2. Dire: "Je veux protéger mon projet"
3. Suivre le flux:
   - Titre: "Application mobile e-commerce"
   - Catégorie: Technologie
   - Description: Description détaillée
   - Innovation: Très innovant
   - Stade: Prototype
   - Valider et envoyer
4. Recevoir certificat de protection
```

---

## 📊 Données Attendues Après Import

| Élément | Quantité Attendue | Vérification |
|---------|-------------------|--------------|
| Comptes Super Admin | 1 | `SELECT COUNT(*) FROM profiles WHERE role = 'super_admin'` |
| Comptes Admin | 3 | `SELECT COUNT(*) FROM profiles WHERE role = 'admin'` |
| Comptes Agent | 2 | `SELECT COUNT(*) FROM profiles WHERE role = 'agent'` |
| Utilisateurs | ~45 | `SELECT COUNT(*) FROM profiles WHERE role = 'user'` |
| Signalements | ~300 | `SELECT COUNT(*) FROM signalements` |
| Cas Gab Pêche | ~80 | `SELECT COUNT(*) FROM signalements WHERE categorie = 'malversation_gab_peche'` |
| Cas Critiques | ~85 | `SELECT COUNT(*) FROM signalements WHERE urgence = 'critique'` |
| Preuves | ~600+ | `SELECT COUNT(*) FROM preuves` |

---

## 🔐 Sécurité

**⚠️ IMPORTANT :**

- Ces mots de passe sont pour la simulation uniquement
- En production, utilisez des mots de passe forts et uniques
- La clé `service_role` ne doit JAMAIS être exposée côté client
- Activez l'authentification 2FA pour les comptes admin en production

---

## 📞 Support

Si des comptes ne fonctionnent pas :

1. Vérifiez que l'import s'est bien déroulé (voir logs)
2. Vérifiez dans Supabase Dashboard → Authentication
3. Vérifiez dans Supabase Dashboard → Table Editor → profiles
4. Exécutez le script de vérification :
   ```bash
   node scripts/verify-simulation-data.js
   ```

---

**🎯 Bon test de la simulation NDJOBI !**
