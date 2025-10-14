#!/bin/bash

# ============================================
# Script de création Super Admin NDJOBI
# ============================================

set -e

echo "================================================"
echo "   Création d'un compte Super Admin            "
echo "================================================"
echo ""

# Vérifier Supabase
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "Installez-le avec: bun install -g supabase"
    exit 1
fi

# Menu de sélection
echo "Choisissez une option :"
echo "1) Utiliser le compte démo Super Admin"
echo "2) Créer un nouveau Super Admin"
echo "3) Promouvoir un utilisateur existant"
echo ""
read -p "Votre choix (1-3) : " choice

case $choice in
    1)
        echo ""
        echo "📋 Compte démo Super Admin :"
        echo "================================"
        echo "Email    : superadmin+v2@demo.ndjobi.ga"
        echo "Password : demo123456"
        echo "================================"
        echo ""
        echo "✅ Allez sur http://localhost:5173/auth"
        echo "✅ Cliquez sur la carte 'Super Admin' (éclair rouge)"
        echo ""
        ;;
    
    2)
        echo ""
        read -p "Email du nouveau super admin : " email
        read -s -p "Mot de passe (min 6 caractères) : " password
        echo ""
        
        # Créer le fichier SQL temporaire
        cat > /tmp/create_super_admin.sql << EOF
-- Créer l'utilisateur si n'existe pas
DO \$\$
DECLARE
  v_user_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = '${email}';
  
  IF v_user_id IS NULL THEN
    -- Créer l'utilisateur (nécessite une fonction custom ou API)
    RAISE NOTICE 'Utilisateur non trouvé. Création via API requise.';
  ELSE
    -- Supprimer ancien rôle
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    -- Assigner super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin');
    
    -- Mettre à jour le profil
    UPDATE public.profiles 
    SET username = 'Super Admin'
    WHERE id = v_user_id;
    
    RAISE NOTICE '✅ Rôle Super Admin assigné à %', '${email}';
  END IF;
END \$\$;
EOF

        echo ""
        echo "🔄 Création en cours..."
        
        # Exécuter le SQL
        if [ -n "$DATABASE_URL" ]; then
            supabase db execute --db-url "$DATABASE_URL" < /tmp/create_super_admin.sql
        else
            echo "⚠️  DATABASE_URL non défini. Exécutez ce SQL dans Supabase Dashboard :"
            echo ""
            cat /tmp/create_super_admin.sql
        fi
        
        rm /tmp/create_super_admin.sql
        
        echo ""
        echo "✅ Si l'utilisateur existait, il est maintenant Super Admin"
        echo "⚠️  Si l'utilisateur n'existe pas, créez d'abord un compte sur /auth"
        ;;
    
    3)
        echo ""
        read -p "Email de l'utilisateur à promouvoir : " email
        
        # Créer le SQL
        cat > /tmp/promote_super_admin.sql << EOF
-- Promouvoir utilisateur existant
DO \$\$
DECLARE
  v_user_id UUID;
  v_username TEXT;
BEGIN
  -- Récupérer l'utilisateur
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = '${email}';
  
  IF v_user_id IS NOT NULL THEN
    -- Récupérer le username
    SELECT username INTO v_username 
    FROM public.profiles 
    WHERE id = v_user_id;
    
    -- Supprimer ancien rôle
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    -- Assigner super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin');
    
    RAISE NOTICE '✅ Utilisateur % promu Super Admin', COALESCE(v_username, '${email}');
  ELSE
    RAISE NOTICE '❌ Utilisateur ${email} non trouvé';
  END IF;
END \$\$;

-- Afficher le résultat
SELECT 
  u.email,
  p.username,
  ur.role,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = '${email}';
EOF

        echo ""
        echo "🔄 Promotion en cours..."
        
        if [ -n "$DATABASE_URL" ]; then
            supabase db execute --db-url "$DATABASE_URL" < /tmp/promote_super_admin.sql
        else
            echo "⚠️  DATABASE_URL non défini. Exécutez ce SQL dans Supabase Dashboard :"
            echo ""
            cat /tmp/promote_super_admin.sql
        fi
        
        rm /tmp/promote_super_admin.sql
        
        echo ""
        echo "✅ Vérifiez le résultat ci-dessus"
        ;;
    
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "           Accès Module XR-7                    "
echo "================================================"
echo ""
echo "Une fois connecté en Super Admin :"
echo "1. Allez dans 'Maintenance Système'"
echo "2. Cliquez 'Configuration'"
echo "3. Entrez :"
echo "   - Code urgence : EMRG-2025-123456"
echo "   - Mot de passe : R@XY"
echo ""
echo "================================================"
