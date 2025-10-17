# 🧠 Configuration iAsted - Assistant IA Présidentiel

## 📋 Prérequis

### 1. Obtenir une Clé API Anthropic Claude

1. Aller sur https://console.anthropic.com/
2. Créer un compte ou se connecter
3. Aller dans "API Keys"
4. Cliquer "Create Key"
5. Copier la clé (format: `sk-ant-api03-...`)

### 2. Configuration Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# .env.local
VITE_ANTHROPIC_API_KEY=sk-ant-api03-VOTRE-CLE-ICI
VITE_AI_MAX_TOKENS=2000
VITE_AI_TEMPERATURE=0.7
VITE_AI_MODEL=claude-3-5-sonnet-20241022
```

**Alternative OpenAI GPT** :
```bash
VITE_OPENAI_API_KEY=sk-VOTRE-CLE-OPENAI
```

### 3. Redémarrer le Serveur de Développement

```bash
# Arrêter le serveur (Ctrl+C)
# Relancer
bun run dev
```

## 🧪 Test de Configuration

### Test 1 : Vérifier la Clé API

```bash
# Dans la console navigateur (F12)
console.log(import.meta.env.VITE_ANTHROPIC_API_KEY);
// Doit afficher : sk-ant-api03-...
```

### Test 2 : Tester iAsted

1. Aller sur `/dashboard/admin`
2. Cliquer onglet **"iAsted IA"**
3. Interface chatbot s'affiche
4. Cliquer "Résumé Quotidien"
5. → Doit afficher une réponse d'iAsted

### Test 3 : Vérifier API Response

```typescript
// Test dans console
import { IAstedService } from '@/services/iAstedService';

const result = await IAstedService.sendMessage('Bonjour iAsted');
console.log(result);
// Doit retourner: { response: "Excellence, ..." }
```

## 🔧 Utilisation

### Accès iAsted

```
URL : /dashboard/admin?view=iasted
Rôle : admin (Protocole d'État)
```

### Fonctionnalités Disponibles

#### 1. Chat Conversationnel
- Posez n'importe quelle question stratégique
- iAsted analyse les données en temps réel
- Réponses contextuelles basées sur Vision 2025

#### 2. Actions Rapides (Boutons)
- **Résumé Quotidien** : Synthèse 24h
- **Patterns & Tendances** : Analyse patterns corruption
- **Prédiction Risques** : Zones à risque 30j
- **Performance Sous-Admins** : Évaluation directeurs

#### 3. Analyses Spécialisées

##### Analyser un Agent
```typescript
const analysis = await IAstedService.analyzeAgentPerformance(userId);
```

##### Recommandation sur un Cas
```typescript
const reco = await IAstedService.getRecommendationOnCase(caseId);
```

##### Identifier Patterns
```typescript
const patterns = await IAstedService.identifyPatterns();
```

##### Prédire Risques
```typescript
const risks = await IAstedService.predictRisks();
```

## 📊 Contexte Présidentiel

iAsted a accès en temps réel à :

### KPIs Nationaux
- Total signalements (30j)
- Cas critiques
- Taux résolution
- Impact économique (FCFA récupérés)
- Score transparence

### Cas Sensibles
- Top 10 cas critiques
- Priority ≥ 85 ou critique
- Statut : nouveau, investigation, pending

### Performance Ministères
- Défense (DGSS)
- Intérieur (DGR)
- Justice (DGLIC)
- Économie (DGE)
- Santé (CNAMGS)
- Éducation (DGES)

### Distribution Régionale
- 9 provinces gabonaises
- Cas par région
- Taux résolution

### Vision Gabon 2025
- 4 piliers : Vert, Industriel, Services, Gouvernance
- Scores actuels vs objectifs
- Priorités

## 🎯 Exemples Questions

### Questions Stratégiques
```
"Quelles sont mes priorités pour cette semaine ?"
"Analyse la performance de la région Estuaire"
"Quels ministères nécessitent mon attention ?"
"Comment améliorer le taux de résolution ?"
"Quel est l'impact de nos actions sur la Vision 2025 ?"
```

### Questions Opérationnelles
```
"Dois-je approuver le cas CS-2025-001 ?"
"Quels agents DGSS sont les plus performants ?"
"Identifie les patterns de corruption dans le secteur pétrolier"
"Prédis les zones à risque pour le mois prochain"
"Compare la performance DGR vs DGLIC"
```

### Questions Décisionnelles
```
"Recommande-moi une stratégie pour atteindre 85% de résolution"
"Dois-je réaffecter des ressources de l'Estuaire vers le Haut-Ogooué ?"
"Quel est le ROI de nos actions anticorruption ?"
"Comment optimiser la coordination des Sous-Admins ?"
```

## ⚙️ Configuration Avancée

### Changer le Modèle IA

```bash
# Dans .env.local

# Claude Sonnet (recommandé - meilleur rapport qualité/prix)
VITE_AI_MODEL=claude-3-5-sonnet-20241022

# Claude Opus (plus puissant mais coûteux)
VITE_AI_MODEL=claude-3-opus-20240229

# Claude Haiku (plus rapide mais moins précis)
VITE_AI_MODEL=claude-3-haiku-20240307
```

### Ajuster la Température

```bash
# Réponses plus créatives (0.8-1.0)
VITE_AI_TEMPERATURE=0.9

# Réponses plus factuelles (0.3-0.5)
VITE_AI_TEMPERATURE=0.4

# Équilibré (recommandé)
VITE_AI_TEMPERATURE=0.7
```

### Augmenter Tokens

```bash
# Réponses plus longues
VITE_AI_MAX_TOKENS=4000

# Réponses concises (économique)
VITE_AI_MAX_TOKENS=1000
```

## 🔐 Sécurité

### Bonnes Pratiques

1. **Ne JAMAIS committer .env.local**
   ```bash
   # Vérifier .gitignore
   cat .gitignore | grep .env.local
   ```

2. **Rotation clés API**
   - Changer clés tous les 3 mois
   - Supprimer anciennes clés Anthropic Console

3. **Limiter usage**
   - Monitorer dashboard Anthropic
   - Définir quotas mensuels
   - Alertes dépassement

4. **Logs audit**
   - Toutes conversations enregistrées
   - Traçabilité décisions iAsted

## 💰 Coûts Estimation

### Pricing Anthropic Claude

| Modèle | Input | Output |
|--------|-------|--------|
| Claude 3.5 Sonnet | $3/M tokens | $15/M tokens |
| Claude 3 Opus | $15/M tokens | $75/M tokens |
| Claude 3 Haiku | $0.25/M tokens | $1.25/M tokens |

### Estimation Usage Mensuel

**Scénario Président (30-50 questions/jour)** :
- Messages/mois : ~1,200
- Tokens input moyen : ~1,500/msg
- Tokens output moyen : ~800/msg
- **Coût total** : ~$10-15/mois (Sonnet)

**Optimisation** :
- Utiliser Haiku pour résumés simples : $1-2/mois
- Réserver Sonnet pour analyses complexes

## 🚀 Déploiement Production

### Variables Environnement Production

```bash
# Via Netlify/Vercel Dashboard
VITE_ANTHROPIC_API_KEY=sk-ant-api03-PRODUCTION-KEY
VITE_AI_MAX_TOKENS=2000
VITE_AI_TEMPERATURE=0.7
VITE_AI_MODEL=claude-3-5-sonnet-20241022
```

### Monitoring

1. **Anthropic Dashboard**
   - https://console.anthropic.com/account/usage
   - Tracker tokens utilisés
   - Analyser coûts

2. **Logs Application**
   ```typescript
   // Logs automatiques dans service
   console.log('iAsted query:', userMessage);
   console.log('iAsted response:', response);
   ```

3. **Alertes**
   - Configurer alertes dépassement quota
   - Notifications échecs API

## 📞 Troubleshooting

### Erreur : "API Error: 401"
```
→ Clé API invalide ou expirée
→ Vérifier VITE_ANTHROPIC_API_KEY dans .env.local
→ Générer nouvelle clé sur console.anthropic.com
```

### Erreur : "Impossible de récupérer le contexte"
```
→ Problème connexion Supabase
→ Vérifier VITE_SUPABASE_URL et KEY
→ Vérifier tables existent (signalements, presidential_decisions, etc.)
```

### iAsted ne répond pas
```
→ Vérifier console navigateur (F12)
→ Vérifier Network tab pour requêtes API
→ Tester clé API via curl :

curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model": "claude-3-5-sonnet-20241022", "max_tokens": 100, "messages": [{"role": "user", "content": "Test"}]}'
```

### Réponses lentes
```
→ Normal : API prend 2-5s
→ Réduire MAX_TOKENS si besoin
→ Utiliser Haiku pour rapidité
```

## ✅ Checklist Configuration

- [ ] Clé Anthropic API obtenue
- [ ] Fichier .env.local créé
- [ ] VITE_ANTHROPIC_API_KEY renseigné
- [ ] Serveur redémarré (bun run dev)
- [ ] Test chat iAsted fonctionnel
- [ ] Actions rapides fonctionnent
- [ ] Réponses contextuelles correctes
- [ ] Pas d'erreurs console
- [ ] .env.local dans .gitignore

---

**iAsted prêt à servir la Présidence !** 🎉

