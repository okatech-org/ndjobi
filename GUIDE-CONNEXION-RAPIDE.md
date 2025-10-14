# 🚀 GUIDE DE CONNEXION RAPIDE - NDJOBI

## ✅ SOLUTION COMPLÈTE

Le système utilise maintenant des **emails techniques** basés sur les numéros de téléphone pour contourner les limitations d'authentification par téléphone de Supabase.

---

## 📱 NUMÉROS À ENTRER (sans +241)

Comme **+241 est déjà présélectionné**, entrez seulement :

### **Pour Super Admin** ⚡
```
Numéro : 77777000
PIN    : 123456
```

### **Pour Admin** 👑
```
Numéro : 77777003
PIN    : 123456
```

### **Pour Agent DGSS** 👥
```
Numéro : 77777002
PIN    : 123456
```

### **Pour Citoyen** 👤
```
Numéro : 77777001
PIN    : 123456
```

---

## 🎯 MÉTHODES DE CONNEXION

### **MÉTHODE 1 : Boutons d'Accès Direct** (Recommandé) ⭐

1. Allez sur : http://localhost:5173/auth
2. **Faites défiler** jusqu'aux **"Comptes de Démonstration"**
3. **Cliquez** sur le compte souhaité :
   - 🔴 **Super Admin** (éclair rouge)
   - 🟣 **Admin** (couronne)
   - 🔵 **Agent DGSS** 
   - 🟢 **Citoyen**
4. **Connexion automatique !**

### **MÉTHODE 2 : Formulaire Manuel**

1. Allez sur : http://localhost:5173/auth
2. Onglet **"Connexion"**
3. **Indicatif** : 🇬🇦 +241 (déjà sélectionné)
4. **Numéro** : `77777000` (pas de zéro devant)
5. **Code PIN** : `123456`
6. Cliquez **"Se connecter"**

---

## 🛠️ CONFIGURATION AUTOMATIQUE

Pour créer automatiquement tous les comptes démo :

```bash
# Installation rapide
cd /Users/okatech/ndjobi
node scripts/setup-demo-accounts.js
```

---

## 📋 TABLEAU RÉCAPITULATIF

| Compte | Numéro (sans +241) | PIN | Accès Module XR-7 |
|--------|-------------------|-----|-------------------|
| **Super Admin** ⚡ | **77777000** | **123456** | ✅ |
| Admin 👑 | 77777003 | 123456 | ❌ |
| Agent DGSS 👥 | 77777002 | 123456 | ❌ |
| Citoyen 👤 | 77777001 | 123456 | ❌ |

---

## 💡 SYSTÈME TECHNIQUE

### **Comment ça marche ?**

1. **Interface** : Affiche des numéros de téléphone
2. **Backend** : Convertit en emails techniques
   ```
   +24177777000 → 24177777000@ndjobi.ga
   ```
3. **Authentification** : Utilise email + PIN (password)

### **Pourquoi cette approche ?**

- ✅ Contourne "Phone logins are disabled"
- ✅ Garde l'interface téléphone intuitive
- ✅ Fonctionne sans configuration SMS/Twilio
- ✅ Compatible développement local

---

## 🚨 TROUBLESHOOTING

### **Erreur : "Numéro ou code PIN incorrect"**

**Solutions :**
1. **N'ajoutez PAS de zéro** : `77777000` ✅ (pas `077777000` ❌)
2. **Vérifiez le PIN** : `123456` (6 chiffres)
3. **Créez d'abord le compte** avec le script :
   ```bash
   node scripts/setup-demo-accounts.js
   ```

### **Erreur : "Ce numéro est déjà utilisé"**

**Solution :** Allez dans l'onglet **"Connexion"** au lieu de "Inscription"

### **Les boutons de démo ne fonctionnent pas**

**Solutions :**
1. Créez les comptes avec le script
2. Ou cliquez une 2ème fois (création automatique)

---

## 🎯 ACCÈS MODULE XR-7 (Super Admin)

Une fois connecté avec **77777000** :

1. Dashboard → **"Maintenance Système"**
2. Cliquez **"Configuration"**
3. Entrez :
   ```
   Code système : EMRG-2025-123456
   Clé d'auth   : R@XY
   ```

---

## 📝 NOTES IMPORTANTES

- Les comptes sont **créés automatiquement** au premier clic
- PIN par défaut : **123456** pour tous
- Module XR-7 : **Super Admin uniquement**
- Les données sont **partagées** entre utilisateurs démo

---

**✅ Prêt !** Utilisez **77777000** + **123456** pour Super Admin ! 🚀
