# Configuration du Compte Anonyme par Défaut

## 🎯 **Objectif**

Configurer le compte "Citoyen Anonyme" comme utilisateur par défaut pour les signalements sans compte, permettant aux utilisateurs de signaler la corruption sans créer de compte personnel.

## 📋 **Compte Anonyme Configuré**

### **Identifiants du compte :**
- **Email** : `24177888009@ndjobi.com`
- **Téléphone** : `+24177888009`
- **PIN** : `999999`
- **Nom** : `Citoyen Anonyme`
- **Organisation** : `Anonyme`
- **Rôle** : `user`

## 🔧 **Configuration Technique**

### **1. Page d'Authentification Modifiée**

La page d'authentification utilise maintenant :
- **Compte Démo** : `+24177888008` / PIN `888888` (Citoyen Démo)
- **Compte Anonyme** : `+24177888009` / PIN `999999` (Citoyen Anonyme)

### **2. Services Créés**

#### **Service d'Authentification Anonyme** (`defaultAnonymousAccount.ts`)
- Gère les sessions anonymes par défaut
- Génère des empreintes d'appareil uniques
- Enregistre les métadonnées de l'appareil
- Fournit des statistiques anonymes

#### **Méthodes Ajoutées au Service d'Authentification**
- `createDefaultAnonymousSession()` : Crée une session anonyme
- `isDefaultAnonymousSession()` : Vérifie si la session est anonyme
- `getDefaultAnonymousAccountInfo()` : Récupère les infos du compte anonyme

### **3. Base de Données**

#### **Table Créée : `anonymous_reports_metadata`**
```sql
CREATE TABLE public.anonymous_reports_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.signalements(id),
    device_fingerprint TEXT,
    ip_info JSONB DEFAULT '{}',
    user_agent TEXT,
    screen_resolution TEXT,
    timezone TEXT,
    language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Fonctions Créées :**
- `create_anonymous_report()` : Crée un signalement anonyme
- `get_anonymous_reports_stats()` : Récupère les statistiques anonymes

## 🚀 **Utilisation**

### **Pour les Utilisateurs :**
1. **Signalement avec compte** : Utiliser l'authentification normale
2. **Signalement anonyme** : Le système utilise automatiquement le compte anonyme par défaut
3. **Aucune création de compte requise** pour les signalements anonymes

### **Pour les Administrateurs :**
1. **Dashboard Super Admin** : Accès aux statistiques anonymes
2. **Métadonnées** : Informations sur l'appareil, IP, etc.
3. **Suivi** : Nombre de signalements anonymes par période

## 📊 **Métadonnées Enregistrées**

Pour chaque signalement anonyme :
- **Empreinte de l'appareil** : Identifiant unique basé sur l'appareil
- **Informations IP** : Pays, région, timezone
- **User Agent** : Navigateur et système d'exploitation
- **Résolution d'écran** : Dimensions de l'écran
- **Langue** : Langue du navigateur
- **Timezone** : Fuseau horaire de l'utilisateur

## 🔒 **Sécurité et Confidentialité**

### **Protection des Données :**
- **Aucune donnée personnelle** requise
- **Empreinte d'appareil** pour l'anonymat
- **Chiffrement** des métadonnées sensibles
- **RLS (Row Level Security)** activé

### **Accès Restreint :**
- Seuls les agents, admins et super-admins peuvent voir les métadonnées
- Les utilisateurs normaux ne voient que leurs propres signalements

## 📝 **Scripts de Configuration**

### **Exécution Automatique :**
```bash
./CONFIGURER-COMPTE-ANONYME.sh
```

### **Exécution Manuelle :**
1. Ouvrir le SQL Editor de Supabase
2. Copier-coller le contenu de `CONFIGURER-COMPTE-ANONYME.sql`
3. Exécuter le script

## ✅ **Vérification**

### **Vérifier la Configuration :**
```sql
-- Vérifier que le compte anonyme existe
SELECT u.email, p.full_name, ur.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '24177888009@ndjobi.com';
```

### **Tester la Fonction :**
```sql
-- Créer un signalement anonyme de test
SELECT public.create_anonymous_report(
    'Test signalement anonyme',
    'Ceci est un test',
    'incident',
    'Libreville',
    '{"device_fingerprint": "test123"}'::jsonb
);
```

## 🎉 **Résultat Final**

Le système est maintenant configuré pour :
- ✅ Utiliser le compte anonyme par défaut pour les signalements sans compte
- ✅ Enregistrer les métadonnées de l'appareil pour l'anonymat
- ✅ Fournir des statistiques aux administrateurs
- ✅ Maintenir la confidentialité des utilisateurs
- ✅ Permettre le signalement sans création de compte

## 📞 **Support**

Pour toute question ou problème :
1. Vérifier les logs de la console
2. Contrôler la configuration de la base de données
3. Tester les fonctions SQL
4. Vérifier les permissions RLS
