# Configuration Gamma AI pour NDJOBI

## 🎨 Qu'est-ce que Gamma AI ?

Gamma.app est une plateforme d'IA qui génère automatiquement des présentations et documents professionnels avec un design moderne et une mise en page optimale.

## 🔑 Configuration de la clé API

### 1. Obtenir votre clé API Gamma

1. Allez sur [https://gamma.app/](https://gamma.app/)
2. Connectez-vous ou créez un compte
3. Accédez aux paramètres de votre compte
4. Allez dans la section "API Keys" ou "Developer Settings"
5. Générez une nouvelle clé API
6. Copiez la clé (format: `gma_xxxxxxxxxxxxx`)

### 2. Configurer la clé dans NDJOBI

Créez ou modifiez le fichier `.env.local` à la racine du projet :

```bash
# Gamma AI Configuration
VITE_GAMMA_API_KEY=gma_votre_cle_api_ici
```

**Important** : 
- Le fichier `.env.local` ne doit JAMAIS être commité sur GitHub
- Utilisez `.env.example` pour documenter les variables nécessaires sans exposer les vraies valeurs

### 3. Redémarrer le serveur de développement

```bash
npm run dev
```

## 📋 Formats disponibles

### 🎨 Gamma AI (Recommandé)

#### PDF Pro (Gamma AI)
- Design professionnel automatique
- Mise en page optimisée
- Graphiques et visuels intégrés
- Export PDF haute qualité
- **Format recommandé pour rapports présidentiels**

#### PowerPoint (Gamma AI)
- Présentation moderne et éditable
- Slides automatiquement organisées
- Design cohérent et professionnel
- Export PPTX compatible Microsoft PowerPoint
- **Format recommandé pour présentations en Conseil des Ministres**

### 📄 Formats Standard

#### PDF Standard
- Génération locale avec jsPDF
- Format basique sans design avancé
- Rapide et fiable
- Pas de dépendance externe

#### Excel
- Tableau de données structurées
- Compatible Microsoft Excel
- Idéal pour analyses chiffrées

#### Word
- Document texte éditable
- Compatible Microsoft Word
- Format classique pour archives

## 🚀 Utilisation

1. Dans le dashboard Admin, accédez à **Gestion Institutions**
2. Cliquez sur **"Voir Détails"** d'un agent/institution
3. Cliquez sur **"Générer Rapport Global"**
4. Sélectionnez le format souhaité :
   - **PDF Pro (Gamma AI)** - Recommandé pour qualité professionnelle
   - **PowerPoint (Gamma AI)** - Recommandé pour présentations
   - Formats standard pour exports simples
5. Configurez la période et les options
6. Cliquez sur **"Générer le Rapport"**

## 🎯 Avantages Gamma AI

### ✅ Design Professionnel
- Mise en page automatique de qualité
- Cohérence visuelle parfaite
- Typographie optimisée

### ✅ Gain de Temps
- Pas de mise en forme manuelle
- Design généré en quelques secondes
- Focus sur le contenu, pas la forme

### ✅ Édition en Ligne
- Lien vers Gamma.app fourni
- Modifications possibles après génération
- Collaboration en temps réel

### ✅ Formats Multiples
- PDF haute qualité
- PowerPoint éditable
- Export et partage faciles

## ⚠️ Limitations et Quotas

- Les comptes gratuits Gamma ont des limites de génération mensuelle
- Pour usage intensif, un compte Pro Gamma est recommandé
- Temps de génération : 10-30 secondes selon la complexité

## 🆘 Dépannage

### Erreur "Clé API non configurée"
- Vérifiez que `VITE_GAMMA_API_KEY` est bien dans `.env.local`
- Redémarrez le serveur de développement

### Erreur "Erreur API Gamma"
- Vérifiez que votre clé API est valide
- Vérifiez votre quota mensuel sur gamma.app
- Consultez les logs navigateur pour plus de détails

### Le fichier ne se télécharge pas
- Vérifiez votre connexion internet
- Le processus peut prendre jusqu'à 60 secondes
- Consultez la console du navigateur pour erreurs

## 📞 Support

Pour tout problème avec Gamma AI :
- Documentation officielle : [https://gamma.app/docs](https://gamma.app/docs)
- Support Gamma : [https://gamma.app/support](https://gamma.app/support)

## 🔐 Sécurité

- Ne partagez JAMAIS votre clé API Gamma
- Ne commitez JAMAIS le fichier `.env.local`
- Régénérez votre clé si elle est compromise
- Utilisez des clés différentes pour dev/prod

