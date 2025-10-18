#!/bin/bash

###############################################################################
# Script de Fix Rapide - Compte Super Admin avec Téléphone
# Crée le compte 33661002616@ndjobi.com avec rôle super_admin
###############################################################################

cat << 'EOF'

════════════════════════════════════════════════════════════════════════════
                    🔧 FIX SUPER ADMIN - TÉLÉPHONE
════════════════════════════════════════════════════════════════════════════

Ce script va créer le compte super admin pour le téléphone :
  📱 +33661002616
  🔑 PIN : 123456

════════════════════════════════════════════════════════════════════════════

⚠️  IMPORTANT : Ce script nécessite l'accès à Supabase

2 MÉTHODES :

1️⃣  Via Supabase Dashboard (Recommandé)
   ─────────────────────────────────────────────────────────────────────
   1. Ouvrir : https://supabase.com/dashboard
   2. Sélectionner ton projet
   3. SQL Editor → New Query
   4. Copier/coller le contenu de :
      /Users/okatech/ndjobi/scripts/create-super-admin-phone.sql
   5. Exécuter (Run)
   6. Vérifier le résultat

2️⃣  En Ligne de Commande (Si Supabase CLI installé)
   ─────────────────────────────────────────────────────────────────────
   $ cd /Users/okatech/ndjobi
   $ supabase db reset  # Reset local
   $ supabase db push   # Push migrations
   $ psql $DATABASE_URL -f scripts/create-super-admin-phone.sql

════════════════════════════════════════════════════════════════════════════

📋 APRÈS EXÉCUTION DU SCRIPT SQL

Tu pourras te connecter avec :
  📱 Téléphone : +33661002616
  🔑 PIN : 123456
  ✅ Code OTP : 123456 (mode dev)

Et accéder au dashboard super-admin ! 🚀

════════════════════════════════════════════════════════════════════════════

EOF

read -p "Veux-tu ouvrir Supabase Dashboard maintenant ? (oui/non) : " confirm
if [ "$confirm" = "oui" ]; then
    open "https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/editor"
    echo ""
    echo "✅ Dashboard ouvert !"
    echo "📝 Copie le contenu de : scripts/create-super-admin-phone.sql"
    echo "📌 SQL Editor → New Query → Colle → Run"
fi

