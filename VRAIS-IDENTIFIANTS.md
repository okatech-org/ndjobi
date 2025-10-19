# 🔑 VRAIS IDENTIFIANTS - Comptes Existants NDJOBI

## ⚠️ IMPORTANT

Les comptes administrateurs **existent déjà** dans Supabase Auth.  
Le script d'import **met uniquement à jour** leurs profils et rôles dans les tables `profiles` et `user_roles`.

**Méthode de connexion :** Téléphone + Code PIN (6 chiffres)

---

## 👑 Super Administrateur Système

**Email :** `33661002616@ndjobi.com`  
**Téléphone :** `+33661002616`  
**Code PIN :** `999999`  

**Rôle :** Super Admin  
**Fonction :** Super Administrateur Système  
**Dashboard :** `/dashboard/super-admin`

**Privilèges :**
- ✅ Accès système complet
- ✅ Gestion totale des utilisateurs
- ✅ Configuration plateforme
- ✅ Vue sur tous les signalements
- ✅ Tous les dashboards accessibles
- ✅ Administration technique

---

## 🏛️ Président de la République

**Email :** `24177888001@ndjobi.com`  
**Téléphone :** `+24177888001`  
**Code PIN :** `111111`  

**Rôle :** Admin (Vue globale, Validation)  
**Fonction :** Président / Administrateur  
**Organisation :** Présidence de la République  
**Dashboard :** `/dashboard/admin`

**Privilèges :**
- ✅ Vue nationale complète
- ✅ Validation cas critiques (> 2 Mrd FCFA)
- ✅ Génération rapports présidentiels (PDF)
- ✅ Accès à tous les signalements (toutes catégories)
- ✅ Décisions stratégiques nationales
- ✅ Supervision générale anti-corruption
- 🔒 Pas d'accès configuration système (réservé au Super Admin)

---

## 🛡️ Sous-Admin DGSS

**Email :** `24177888002@ndjobi.com`  
**Téléphone :** `+24177888002`  
**Code PIN :** `222222`  

**Rôle :** Sub-Admin (Vue sectorielle)  
**Fonction :** Sous-Administrateur DGSS  
**Organisation :** DGSS (Direction Générale de la Sécurité d'État)  
**Dashboard :** `/dashboard/admin`

**Privilèges :**
- ✅ Vue sectorielle sécurité d'État
- ✅ Assignation d'agents terrain
- ✅ Statistiques sectorielles DGSS
- ✅ Rapports ministériels
- ✅ Coordination enquêtes sécuritaires
- 🔒 Accès limité aux signalements de son secteur
- 🔒 Pas de validation cas critiques
- 🔒 Pas d'accès Protocole XR-7

---

## 🕵️ Sous-Admin DGR

**Email :** `24177888003@ndjobi.com`  
**Téléphone :** `+24177888003`  
**Code PIN :** `333333`  

**Rôle :** Sub-Admin (Vue sectorielle)  
**Fonction :** Sous-Administrateur DGR  
**Organisation :** DGR (Direction Générale du Renseignement)  
**Dashboard :** `/dashboard/admin`

**Privilèges :**
- ✅ Vue sectorielle renseignement
- ✅ Assignation agents spécialisés
- ✅ Enquêtes sensibles et confidentielles
- ✅ Intelligence anticorruption
- ✅ Rapports de renseignement
- 🔒 Accès limité aux signalements de son secteur
- 🔒 Pas de validation cas critiques
- 🔒 Pas d'accès Protocole XR-7

---

## 🐟 Agent Pêche

**Email :** `24177888010@ndjobi.com`  
**Téléphone :** `+24177888010`  
**Code PIN :** `000000`  

**Rôle :** Agent  
**Fonction :** Agent Pêche  
**Organisation :** Ministère de la Mer de la Pêche et de l'Économie Bleue  
**Dashboard :** `/dashboard/agent`

**Privilèges :**
- ✅ Traitement des signalements liés à la pêche
- ✅ Enquêtes sur les infractions maritimes
- ✅ Surveillance des activités de pêche
- ✅ Rapports sectoriels pêche
- 🔒 Accès limité aux signalements de son secteur

---

## 📊 Résumé des Comptes

| Compte | Téléphone | PIN | Rôle | Organisation |
|--------|-----------|-----|------|--------------|
| **Super Admin Système** | +33661002616 | 999999 | super_admin | Système |
| **Président** | +24177888001 | 111111 | admin | Présidence |
| **Sous-Admin DGSS** | +24177888002 | 222222 | sub_admin | DGSS |
| **Sous-Admin DGR** | +24177888003 | 333333 | sub_admin | DGR |
| **Agent Pêche** | +24177888010 | 000000 | agent | Ministère Pêche |

---

## 🧪 Tests de Connexion

### Test 1 : Président

```
1. Ouvrir: http://localhost:5173
2. Cliquer: "Connexion"
3. Saisir Téléphone: +24177888001
4. Saisir PIN: 111111
5. Vérifier: Redirection vers /dashboard/super-admin
6. Vérifier: ~300 signalements affichés
```

### Test 2 : Sous-Admin DGSS

```
1. Se déconnecter du compte Président
2. Connexion avec Tél: +24177888002 / PIN: 222222
3. Vérifier: Dashboard admin avec vue sectorielle
4. Tester: Filtrage par secteur DGSS
```

### Test 3 : Sous-Admin DGR

```
1. Se déconnecter
2. Connexion avec Tél: +24177888003 / PIN: 333333
3. Vérifier: Dashboard admin avec vue renseignement
4. Tester: Assignation d'agents
```

### Test 4 : Agent Pêche

```
1. Se déconnecter
2. Connexion avec Tél: +24177888010 / PIN: 000000
3. Vérifier: Dashboard agent avec vue sectorielle pêche
4. Tester: Traitement signalements pêche
```

---

## 🔐 Sécurité des Comptes

### Codes PIN (6 chiffres)

Les codes PIN sont configurés dans Supabase Auth :
- Super Admin Système : `999999`
- Président : `111111`
- DGSS : `222222`
- DGR : `333333`
- Agent Pêche : `000000`

**⚠️ En production :**
- Changez TOUS les codes PIN
- Utilisez des codes plus complexes
- Activez l'authentification 2FA
- Configurez des politiques de rotation

---

## 🎯 Différence entre les Comptes

### Super Admin (2 comptes)

| Compte | Usage | Accès |
|--------|-------|-------|
| **+33661002616** | Administration technique | Configuration système |
| **+24177888001** | Protocole d'État | Décisions stratégiques |

**Les deux ont accès complet**, mais utilisations différentes :
- `+33661002616` → Maintenance, config, technique
- `+24177888001` → Politique, validation, rapports présidentiels

### Sous-Admins (2 comptes)

| Compte | Secteur | Spécialisation |
|--------|---------|----------------|
| **+24177888002** | DGSS | Sécurité d'État |
| **+24177888003** | DGR | Renseignement |

**Accès limité** à leur secteur respectif (RLS)

---

## 📱 Format de Connexion

### Dans l'application

```
┌──────────────────────────────────┐
│  CONNEXION NDJOBI                │
├──────────────────────────────────┤
│                                  │
│  📱 Téléphone: +24177888001      │
│  🔐 Code PIN:  111111            │
│                                  │
│  [  Se connecter  ]              │
│                                  │
└──────────────────────────────────┘
```

### Formatage Téléphone

- ✅ Avec indicatif : `+24177888001`
- ✅ Format international complet
- ⛔ Sans espaces
- ⛔ Sans tirets

---

## 🎬 Scénarios de Test

### Scénario 1 : Validation Présidentielle

```
1. Login: +24177888001 / PIN: 111111
2. Dashboard → Onglet "Validation"
3. Voir: Cas critiques Gab Pêche (> 2 Mrd FCFA)
4. Sélectionner: SIG-2025-014 (Coopératives fantômes - 5 Mrd)
5. Action: "Approuver l'enquête judiciaire"
6. Vérifier: Statut mis à jour, notification envoyée
```

### Scénario 2 : Vue Sectorielle DGSS

```
1. Login: +24177888002 / PIN: 222222
2. Dashboard → Vue sectorielle
3. Filtrer: Secteur "Sécurité"
4. Voir: Signalements liés à la sécurité d'État
5. Assigner: Agent à un cas spécifique
6. Vérifier: Notification envoyée à l'agent
```

### Scénario 3 : Renseignement DGR

```
1. Login: +24177888003 / PIN: 333333
2. Dashboard → Intelligence anticorruption
3. Voir: Cas nécessitant renseignement
4. Analyser: Réseaux de corruption organisée
5. Générer: Rapport de renseignement
```

---

## 🔄 Mise à Jour des Profils

Le script `import-simulation-data.js` effectue les opérations suivantes pour les comptes existants :

```javascript
// Pour chaque compte admin existant:
1. Recherche l'utilisateur dans Supabase Auth (par email)
2. Met à jour (upsert) le profil dans la table profiles
3. Met à jour (upsert) le rôle dans la table user_roles
4. Configure: email, phone, full_name, role, fonction
```

**Aucune création de compte** - uniquement mise à jour des profils.

---

## 📞 Support

Si connexion échoue :

1. **Vérifiez** que le compte existe dans Supabase → Authentication
2. **Vérifiez** le format du téléphone : `+24177888001` (avec +)
3. **Vérifiez** le code PIN : 6 chiffres exacts
4. **Consultez** les logs de l'application (console F12)

---

## ✅ Checklist Connexion

Avant de tester, vérifiez :

- [ ] Import réussi (`npm run simulation:import`)
- [ ] Profils créés dans table `profiles`
- [ ] Rôles assignés dans table `user_roles`
- [ ] Téléphone au format international (+XXX)
- [ ] PIN à 6 chiffres exact

---

**🔐 Ces identifiants sont pour la simulation de test uniquement.**

**🇬🇦 En production, utilisez des méthodes d'authentification renforcées.**
