#!/bin/bash

# NDJOBI - Script d'import simplifié
# Ce script guide l'utilisateur à travers l'import des données

clear

cat << "EOF"
╔════════════════════════════════════════════════════════════════════╗
║              🚀 NDJOBI - IMPORT DES DONNÉES SIMULATION            ║
║                     Script d'initialisation                        ║
╚════════════════════════════════════════════════════════════════════╝
EOF

echo ""
echo "📋 Configuration Supabase :"
echo "   Project ID : xfxqwlbqysiezqdpeqpv"
echo "   URL        : https://xfxqwlbqysiezqdpeqpv.supabase.co"
echo ""

# Vérifier si la Service Role Key est définie
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  La variable SUPABASE_SERVICE_ROLE_KEY n'est pas définie"
    echo ""
    echo "🔑 Pour obtenir cette clé :"
    echo "   1. Ouvrez : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api"
    echo "   2. Dans 'Project API keys', copiez la clé 'service_role'"
    echo "   3. Exportez-la : export SUPABASE_SERVICE_ROLE_KEY=\"votre_cle_ici\""
    echo ""
    echo "❌ Arrêt du script. Configurez la clé et relancez."
    exit 1
fi

echo "✅ Service Role Key détectée"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Node.js installé : $(node --version)"
echo ""

# Vérifier que les fichiers de données existent
if [ ! -f "scripts/data/ndjobi-users-dataset.json" ]; then
    echo "❌ Fichier ndjobi-users-dataset.json manquant"
    exit 1
fi

if [ ! -f "scripts/data/ndjobi-signalements-dataset.json" ]; then
    echo "❌ Fichier ndjobi-signalements-dataset.json manquant"
    exit 1
fi

echo "✅ Fichiers de données trouvés"
echo ""

# Confirmer avant de lancer
echo "⚠️  ATTENTION : Cet import va créer/mettre à jour :"
echo "   • ~45 comptes utilisateurs"
echo "   • ~27 signalements avec preuves"
echo "   • 4 comptes administrateurs"
echo "   • Statistiques nationales"
echo ""
read -p "Continuer ? (o/N) : " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "❌ Import annulé"
    exit 0
fi

echo ""
echo "🚀 Lancement de l'import..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Définir la variable URL aussi
export VITE_SUPABASE_URL="https://xfxqwlbqysiezqdpeqpv.supabase.co"

# Exécuter le script d'import
if command -v ts-node &> /dev/null; then
    # Si ts-node est installé
    ts-node scripts/import-simulation-data.ts
elif command -v npx &> /dev/null; then
    # Utiliser npx
    npx ts-node scripts/import-simulation-data.ts
else
    # Fallback sur npm run
    npm run simulation:import
fi

EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -eq 0 ]; then
    cat << "EOF"

╔════════════════════════════════════════════════════════════════════╗
║                    ✅ IMPORT TERMINÉ AVEC SUCCÈS !                ║
╚════════════════════════════════════════════════════════════════════╝

🎉 Votre base de données NDJOBI est maintenant remplie !

📊 Vérification recommandée :
   1. Dashboard Supabase : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/editor
   2. Vérifier la table 'profiles' (devrait avoir ~45+ entrées)
   3. Vérifier la table 'signalements' (devrait avoir 27+ entrées)

🚀 Prochaines étapes :
   1. Lancez l'application : npm run dev
   2. Accédez à : http://localhost:5173
   3. Connectez-vous avec un compte admin :
      • Super Admin : +33661002616 (avec PIN)
      • Admin : +24177888001 (avec PIN)

📱 Pour voir les PINs des comptes admin :
   Consultez la table 'user_pins' dans Supabase

🔍 Pour vérifier les données :
   npm run simulation:verify

EOF
else
    cat << "EOF"

╔════════════════════════════════════════════════════════════════════╗
║                    ❌ ERREUR DURANT L'IMPORT                      ║
╚════════════════════════════════════════════════════════════════════╝

⚠️  L'import a rencontré des erreurs. Vérifiez :

1. Service Role Key valide ?
   • Testez sur : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api

2. Tables créées ?
   • Vérifiez que les migrations sont appliquées
   • Consultez : supabase/migrations/

3. Permissions ?
   • La Service Role Key contourne RLS mais vérifie les politiques

📚 Consultez les logs ci-dessus pour plus de détails

EOF
fi

echo ""

