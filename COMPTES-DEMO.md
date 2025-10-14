# 📱 COMPTES DÉMO NDJOBI - GUIDE COMPLET

## ✅ **Solution Optimale**

**Comptes Démo** = Email (connexion rapide par bouton)  
**Vrais Comptes** = Téléphone (pour les vrais utilisateurs)

---

## 🔐 Comptes Démo (Accès Direct)

### **Super Admin ⚡** (Accès Complet + Module XR-7)
- **Connexion** : Cliquez sur la carte "Super Admin"
- **Rôle** : `super_admin`
- **Accès** :
  - ✅ Console technique système
  - ✅ Gestion base de données
  - ✅ **Module XR-7** (état d'urgence)
  - ✅ Tous les autres accès

### **Protocole d'État** (Admin)
- **Connexion** : Cliquez sur la carte "Protocole d'État"
- **Rôle** : `admin`
- **Accès** :
  - ✅ Dashboard administrateur
  - ✅ Gestion des agents
  - ✅ Validation des cas

### **Agent DGSS**
- **Connexion** : Cliquez sur la carte "Agent DGSS"
- **Rôle** : `agent`
- **Accès** :
  - ✅ Traiter les signalements
  - ✅ Gérer les enquêtes
  - ✅ Carte interactive

### **Citoyen**
- **Connexion** : Cliquez sur la carte "Citoyen"
- **Rôle** : `user`
- **Accès** :
  - ✅ Taper le Ndjobi
  - ✅ Protéger un projet
  - ✅ Voir son historique

---

## 🚀 **Méthodes de Connexion**

### **Méthode 1 : Boutons Démo** ⭐ (RECOMMANDÉE)

```
1. Allez sur http://localhost:5173/auth
2. Faites défiler jusqu'à "Comptes de Démonstration"
3. Cliquez sur la carte souhaitée
4. Connexion automatique en 1 clic !
```

**Aucun identifiant à saisir** - Tout est automatique ! 🎉

---

### **Méthode 2 : Téléphone (Pour Vrais Utilisateurs)**

#### **Créer un Nouveau Compte**
```
1. Onglet "Inscription"
2. Indicatif : 🇬🇦 +241 (déjà sélectionné)
3. Numéro : Votre numéro (ex: 74123456 - 8 chiffres)
4. Créer PIN : 6 chiffres (ex: 123456)
5. Confirmer PIN : Même code
6. Cliquez "Créer mon compte"
```

**Pour Super Admin** : Entrez `77777000` comme numéro

#### **Se Connecter**
```
1. Onglet "Connexion"
2. Indicatif : 🇬🇦 +241 (déjà sélectionné)
3. Numéro : Votre numéro (ex: 74123456)
4. Code PIN : Votre code (ex: 123456)
5. Cliquez "Se connecter"
```

---

## 📋 **Informations Techniques**

### **Comptes Démo (Email)**
```
superadmin@demo.ndjobi.ga  →  Super Admin  →  Bouton direct
admin@demo.ndjobi.ga       →  Admin         →  Bouton direct
agent@demo.ndjobi.ga       →  Agent         →  Bouton direct
citoyen@demo.ndjobi.ga     →  Citoyen       →  Bouton direct
```

### **Vrais Comptes (Téléphone)**
```
+24177777000  →  Super Admin  →  Formulaire avec PIN
+24174123456  →  User         →  Formulaire avec PIN
+33612345678  →  User         →  Formulaire avec PIN
```

---

## 🎯 Accès Module XR-7

**Exclusivement pour Super Admin** :

```
1. Connectez-vous en Super Admin (bouton ou +24177777000)
2. Dans le dashboard, cherchez "Maintenance Système"
3. Cliquez "Configuration"
4. Entrez :
   Code système : EMRG-2025-123456
   Clé d'auth   : R@XY
5. Module actif 5 minutes
```

---

## 📝 **Exemples de Numéros Valides**

### **Format Gabon** 🇬🇦
```
+241 indicatif déjà sélectionné
Entrez juste : 77777000  (8 chiffres)
           ou : 74123456
           ou : 66987654
```

### **Autres Pays**
```
🇫🇷 France   : +33 → 612345678 (9 chiffres)
🇨🇮 Côte d'Ivoire : +225 → 0712345678 (10 chiffres)
🇨🇲 Cameroun : +237 → 677123456 (9 chiffres)
```

---

## 🛠️ **Troubleshooting**

### **"Phone logins are disabled"**
✅ **RÉSOLU** - Utilisez les boutons démo ou créez un compte par téléphone

### **"Numéro ou code PIN incorrect"**
- Le compte n'existe pas encore
- Utilisez l'onglet **"Inscription"** d'abord
- Ou cliquez sur un **bouton démo**

### **Bouton démo ne fonctionne pas**
```bash
# Redémarrer Supabase
supabase stop && supabase start

# Vider le cache navigateur
Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
```

---

## ⚡ **Quick Start Super Admin**

**Le plus rapide** :

1. ➡️ http://localhost:5173/auth
2. ➡️ Cliquez carte "Super Admin" ⚡
3. ➡️ Attendez 2 secondes
4. ➡️ Dashboard Super Admin ouvert !

**Fini en 10 secondes** ⏱️

---

## 🔒 **Sécurité**

**Comptes Démo** 🔨
- Email public
- Mot de passe simple
- Données partagées
- **Usage : Développement uniquement**

**Comptes Réels** 🚀
- Téléphone personnel
- PIN sécurisé (6 chiffres)
- Données privées
- **Usage : Production**

---

**Tout est prêt ! Testez maintenant avec les boutons démo.** 🎉