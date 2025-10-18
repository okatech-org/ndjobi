#!/bin/bash

clear

cat << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🚀 CRÉATION COMPTE SUPER ADMIN - MÉTHODE RAPIDE      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

⏱️  Temps estimé : 2 minutes

Cette procédure va créer le compte superadmin@ndjobi.com
dans Supabase pour éliminer l'erreur 400.


┌───────────────────────────────────────────────────────────┐
│  ÉTAPE 1/3 : Créer l'utilisateur dans Supabase Auth     │
└───────────────────────────────────────────────────────────┘

1. Cliquez sur ce lien (ou copiez-collez dans votre navigateur):
   
   https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/auth/users

2. Cliquez sur le bouton vert "Add user" en haut à droite

3. Sélectionnez "Create new user"

4. Remplissez le formulaire EXACTEMENT comme ceci :
   
   ┌─────────────────────────────────────────────────┐
   │  Email    : superadmin@ndjobi.com               │
   │  Password : ChangeMeStrong!123                  │
   │                                                 │
   │  ☑️  Auto Confirm User  (COCHER CETTE CASE !)   │
   └─────────────────────────────────────────────────┘

5. Cliquez sur "Create user"

6. IMPORTANT : Attendez de voir le compte dans la liste !

EOF

echo ""
read -p "✅ Avez-vous créé l'utilisateur ? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "❌ Veuillez d'abord créer l'utilisateur, puis relancez ce script."
    exit 1
fi

cat << 'EOF'

┌───────────────────────────────────────────────────────────┐
│  ÉTAPE 2/3 : Attribuer le rôle Super Admin              │
└───────────────────────────────────────────────────────────┘

1. Ouvrez le SQL Editor de Supabase :
   
   https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/sql

2. Cliquez sur "New query" (nouvelle requête)

3. Copiez et collez ce script SQL :

EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat scripts/create-super-admin-final.sql
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat << 'EOF'

4. Cliquez sur "RUN" ou appuyez sur Ctrl+Enter

5. Vérifiez le message : "Compte Super Admin configuré avec succès!"

EOF

echo ""
read -p "✅ Avez-vous exécuté le script SQL avec succès ? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "❌ Veuillez exécuter le script SQL, puis relancez ce script."
    exit 1
fi

cat << 'EOF'

┌───────────────────────────────────────────────────────────┐
│  ÉTAPE 3/3 : Tester l'authentification                   │
└───────────────────────────────────────────────────────────┘

Maintenant, testons que tout fonctionne :

1. Rafraîchissez votre page : http://localhost:5173/auth/super-admin

2. Entrez le numéro : +33661002616

3. Cliquez sur "Envoyer le code"

4. Entrez le code reçu par SMS

5. Vérifiez dans la console du navigateur (F12) :

   AVANT (avec erreur 400) :
   ❌ xfxqwlbqysiezqdpeqpv.supabase.co/.../token 400
   ⚠️  Echec authentification réelle, bascule en mode démo

   APRÈS (sans erreur 400) :
   ✅ Aucune erreur 400
   ✅ Connexion réussie sans bascule en mode démo !


╔═══════════════════════════════════════════════════════════╗
║                    ✅ TERMINÉ !                            ║
╚═══════════════════════════════════════════════════════════╝

Le compte Super Admin est maintenant créé.
L'erreur 400 a disparu.
L'authentification est RÉELLE (plus de mode démo).

Credentials de connexion :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Email    : superadmin@ndjobi.com
  Password : ChangeMeStrong!123
  Code OTP : 999999
  Phone    : +33661002616
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 SÉCURITÉ : Changez le mot de passe après la première connexion !

EOF

echo ""
echo "🎉 Merci d'avoir utilisé ce script !"
echo ""

