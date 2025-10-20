# 🔑 Configuration Gamma AI - Instructions

## Étape 1 : Créer le fichier .env.local

Créez un fichier `.env.local` à la racine de votre projet avec le contenu suivant :

```env
# Configuration Gamma AI
VITE_GAMMA_API_KEY=votre_cle_api_gamma_ici

# Backend API URL (pour le proxy si nécessaire)
VITE_API_URL=http://localhost:3001/api
```

## Étape 2 : Obtenir votre clé API Gamma

1. Allez sur https://gamma.app
2. Créez un compte ou connectez-vous
3. Accédez à votre dashboard
4. Trouvez la section "API Keys" ou "Développeur"
5. Générez une nouvelle clé API
6. Copiez la clé et remplacez `votre_cle_api_gamma_ici` dans le fichier `.env.local`

## Étape 3 : Redémarrer le serveur

Après avoir configuré la clé API, redémarrez votre serveur de développement :

```bash
npm run dev
```

## Étape 4 : Tester la génération

1. Accédez à http://localhost:8082
2. Dashboard Admin → Gestion Institutions
3. Cliquez sur "Voir Détails" pour Agent Pêche
4. Cliquez sur "Générer Rapport Global"
5. Configurez vos options Gamma AI
6. Cliquez sur "Générer le Rapport"

## Résultat attendu

Avec la clé API configurée :
- ✅ Le système tentera d'appeler l'API Gamma réelle
- ✅ Si CORS bloque, basculement automatique vers simulation
- ✅ Si l'API fonctionne, génération d'un vrai rapport Gamma
- ✅ Téléchargement automatique + lien vers Gamma.app

## Dépannage

### Erreur CORS persistante
Si vous obtenez encore des erreurs CORS, c'est normal. L'API Gamma ne permet pas les appels directs depuis le navigateur. Dans ce cas :

1. **Option 1** : Utiliser le mode simulation (actuel)
2. **Option 2** : Implémenter le backend proxy (voir CONFIGURATION-GAMMA-AI.md)

### Clé API invalide
Si vous obtenez une erreur d'authentification :
1. Vérifiez que la clé API est correcte
2. Vérifiez que la clé a les bonnes permissions
3. Vérifiez que le compte Gamma est actif

## Mode actuel : SIMULATION

Sans clé API ou en cas d'erreur CORS, le système utilise automatiquement le mode simulation qui génère des PDFs locaux avec toutes vos données.
