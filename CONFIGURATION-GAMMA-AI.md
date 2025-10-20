# 🎨 Configuration Gamma AI - NDJOBI

## 🚨 Problème CORS identifié

L'API Gamma ne permet pas les appels directs depuis le navigateur à cause de la politique CORS.

**Erreur actuelle :**
```
Access to fetch at 'https://api.gamma.app/api/v1/documents' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

## ✅ Solutions implémentées

### **Solution 1 : Mode Simulation (Actuel - ACTIF)**

Le système bascule automatiquement en mode simulation lorsque :
- La clé API Gamma n'est pas configurée
- Une erreur CORS est détectée
- L'API Gamma est indisponible

**Avantages :**
- ✅ Fonctionne immédiatement sans configuration
- ✅ Génère des PDFs de test avec toutes les données
- ✅ Permet de tester l'interface complète
- ✅ Pas de frais API pendant le développement

**Comment ça marche :**
1. L'utilisateur configure son rapport (format, options, etc.)
2. Le système tente d'appeler l'API Gamma
3. En cas d'erreur CORS, bascule vers `gammaSimulationService`
4. Génère un PDF local avec jsPDF contenant les données
5. Télécharge automatiquement le fichier

### **Solution 2 : Backend Proxy (Pour la production)**

Un service proxy a été créé pour appeler Gamma via votre backend.

**Fichier créé :** `src/services/gammaProxyService.ts`

**Endpoints backend requis :**
- `POST /api/gamma/generate-global` - Génère un rapport global
- `POST /api/gamma/generate-cas` - Génère un rapport de cas

**Configuration backend nécessaire :**

```typescript
// Backend: routes/gamma.ts
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const GAMMA_API_KEY = process.env.GAMMA_API_KEY;
const GAMMA_API_URL = 'https://api.gamma.app/api/v1';

router.post('/generate-global', async (req, res) => {
  try {
    const { data, format, config } = req.body;
    
    // Construire le document Gamma
    const gammaDoc = buildGammaDocument(data, config);
    
    // Appeler l'API Gamma depuis le backend (pas de CORS)
    const response = await fetch(`${GAMMA_API_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GAMMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gammaDoc),
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-cas', async (req, res) => {
  // Similaire à generate-global
});

export default router;
```

## 📊 Configuration des données pour Gamma AI

### **Rapport Global - Structure optimisée**

```typescript
{
  admin: {
    nom: 'Agent Pêche',
    organization: 'Ministère Pêche',
    email: 'agent@peche.ga',
    phone: '+241 XX XX XX XX',
    role: 'agent'
  },
  periode: 'mensuel',
  dateDebut: '2025-01-01',
  dateFin: '2025-01-31',
  totalCas: 3,
  totalProblematiques: 3,
  impactFinancier: 8700000000,
  casData: [/* cas détaillés */],
  problematiques: [/* problématiques avec descriptions complètes */],
  recommandations: [/* recommandations présidentielles */],
  opinionPublique: {/* sentiment, griefs, risques */}
}
```

### **Rapport Cas - Structure optimisée**

```typescript
{
  admin: {
    nom: 'Agent Pêche',
    organization: 'Ministère Pêche'
  },
  casSelectionnes: [
    {
      id: 'SIG-2025-014',
      titre: 'Coopératives fantômes - Pêche-Gab',
      description: 'Détection de 12 coopératives...',
      montant: '5 000 000 000 FCFA',
      statut: 'En cours',
      priorite: 'Critique',
      dateCreation: '2025-01-15',
      localisation: 'Port-Gentil',
      secteur: 'Pêche maritime'
    }
  ],
  montantTotal: 5000000000,
  nombreCas: 1
}
```

## 🎯 Options Gamma AI disponibles

| Option | Valeurs | Par défaut | Description |
|--------|---------|------------|-------------|
| **Mode création** | `ia`, `texte` | `ia` | Création avec IA ou coller du texte |
| **Type document** | `presentation`, `texte` | `presentation` | Présentation ou document texte |
| **Format page** | `defaut`, `lettre`, `a4` | `defaut` | Format de la page |
| **Mode génération** | `generer`, `synthese`, `conserver` | `generer` | Mode de traitement |
| **Niveau détail** | `minimaliste`, `concis`, `detaille` | `detaille` | Niveau de détail |
| **Langue** | `francais`, `anglais` | `francais` | Langue du rapport |
| **Source images** | `ia`, `aucune` | `ia` | Générer des images avec IA |
| **Style images** | `realiste`, `illustration` | `realiste` | Style des images |
| **Nombre cartes** | 1-20 | 7 | Nombre de slides |

## 🔑 Configuration environnement

### **Fichier `.env.local` requis :**

```env
# Gamma AI API (pour production avec backend proxy)
VITE_GAMMA_API_KEY=votre_cle_gamma_ici

# Backend API URL (pour le proxy)
VITE_API_URL=http://localhost:3001/api
```

### **Mode actuel : SIMULATION**

Sans clé API, le système utilise automatiquement le mode simulation qui :
1. Génère des PDFs locaux avec jsPDF
2. Inclut toutes les données des Détails
3. Télécharge automatiquement le fichier
4. Affiche un lien simulé vers Gamma

## 🚀 Utilisation

### **Étape 1 : Ouvrir les détails d'un admin**
Cliquez sur "Voir Détails" pour un admin (ex: Agent Pêche)

### **Étape 2 : Cliquer sur "Générer Rapport Global"**
Dans le modal des détails, cliquez sur le bouton "Générer Rapport Global"

### **Étape 3 : Configurer le rapport**
- **Type** : Rapport Global ou Rapport Cas
- **Période** : Hebdomadaire, Mensuel, Trimestriel, Annuel
- **Dates** : Date de début et fin
- **Configuration Gamma AI** : Tous les paramètres disponibles
- **Format d'extraction** : PDF IA ou PowerPoint IA

### **Étape 4 : Générer**
Cliquez sur "Générer le Rapport"
- Mode simulation : Téléchargement immédiat d'un PDF
- Mode production : Génération via Gamma + lien vers Gamma.app

## 📋 Données extraites des "Détails"

Le rapport inclut automatiquement :

### **Pour Rapport Global :**
- ✅ Informations de l'admin
- ✅ Tous les cas traités
- ✅ Toutes les problématiques détaillées
- ✅ Toutes les recommandations présidentielles
- ✅ Opinion publique et griefs
- ✅ Impact financier total
- ✅ Métriques et statistiques

### **Pour Rapport Cas :**
- ✅ Informations de l'admin
- ✅ Cas sélectionnés uniquement
- ✅ Détails complets de chaque cas
- ✅ Montant total concerné
- ✅ Métriques spécifiques

## 🎯 Prochaines étapes

### **Pour activer Gamma AI en production :**

1. **Créer un compte Gamma** : https://gamma.app
2. **Obtenir une clé API** : Depuis votre dashboard Gamma
3. **Configurer `.env.local`** : Ajouter `VITE_GAMMA_API_KEY`
4. **Créer le backend proxy** : Implémenter les endpoints `/api/gamma/*`
5. **Tester** : Le système basculera automatiquement vers l'API réelle

### **Actuellement (Mode Simulation) :**

✅ **Tout fonctionne !** Le système génère des rapports PDF de simulation avec toutes les données des Détails.

Pour tester :
1. Accédez à : http://localhost:8082
2. Dashboard Admin → Gestion Institutions
3. Cliquez sur "Voir Détails" pour Agent Pêche
4. Cliquez sur "Générer Rapport Global"
5. Configurez vos options
6. Cliquez sur "Générer le Rapport"
7. Le PDF sera téléchargé automatiquement

## 📝 Notes importantes

- Le mode simulation utilise jsPDF déjà installé
- Toutes les données des "Détails" sont incluses
- Le système bascule automatiquement entre API réelle et simulation
- Aucune configuration requise pour le mode simulation
- Les formats PDF IA et PowerPoint IA sont tous deux supportés

