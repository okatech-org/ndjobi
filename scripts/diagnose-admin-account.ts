#!/usr/bin/env tsx

/**
 * Script de diagnostic pour le compte admin
 * Vérifie l'existence du compte et son état dans la DB
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY non définie');
  console.log('Pour obtenir la clé:');
  console.log('1. Allez sur https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api');
  console.log('2. Copiez la "service_role key"');
  console.log('3. Exécutez: export SUPABASE_SERVICE_KEY="votre-clé"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_PHONE = '+24177888001';
const ADMIN_EMAIL = '24177888001@ndjobi.com';
const ADMIN_PIN = '111111';

async function diagnoseAdminAccount() {
  console.log('🔍 DIAGNOSTIC DU COMPTE ADMIN');
  console.log('================================\n');

  try {
    // 1. Vérifier si le compte existe dans auth.users
    console.log('1️⃣ Vérification dans auth.users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    const adminUser = users.users.find(u => u.email === ADMIN_EMAIL);
    
    if (!adminUser) {
      console.log(`❌ Compte non trouvé: ${ADMIN_EMAIL}`);
      console.log('\n💡 Solution: Créer le compte avec:');
      console.log(`   npm run create-account admin ${ADMIN_PHONE}`);
      return;
    }

    console.log(`✅ Compte trouvé: ${adminUser.email}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Créé: ${adminUser.created_at}`);
    console.log(`   Confirmé: ${adminUser.email_confirmed_at ? 'Oui' : 'Non'}`);

    // 2. Vérifier le profil
    console.log('\n2️⃣ Vérification du profil...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Erreur profil:', profileError);
    } else if (!profile) {
      console.log('❌ Profil non trouvé');
      console.log('\n💡 Solution: Exécuter le script fix-database-schema-error.sql');
    } else {
      console.log('✅ Profil trouvé:');
      console.log(`   Nom: ${profile.full_name}`);
      console.log(`   Organisation: ${profile.organization}`);
    }

    // 3. Vérifier le rôle
    console.log('\n3️⃣ Vérification du rôle...');
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', adminUser.id);

    if (roleError) {
      console.error('❌ Erreur rôle:', roleError);
      console.log('\n⚠️  ERREUR CRITIQUE: Impossible de lire la table user_roles');
      console.log('   Cela explique l\'erreur "Database error querying schema"');
      console.log('\n💡 Solution:');
      console.log('   1. Connectez-vous au SQL Editor de Supabase');
      console.log('   2. Exécutez le script: scripts/fix-database-schema-error.sql');
    } else if (!roles || roles.length === 0) {
      console.log('❌ Aucun rôle trouvé');
      console.log('\n💡 Solution: Exécuter le script fix-database-schema-error.sql');
    } else {
      console.log('✅ Rôles trouvés:');
      roles.forEach(role => {
        console.log(`   - ${role.role} (créé: ${role.created_at})`);
      });

      if (roles.length > 1) {
        console.log('\n⚠️  ATTENTION: Plusieurs rôles trouvés pour le même utilisateur!');
        console.log('   Cela peut causer des problèmes avec la contrainte UNIQUE');
      }
    }

    // 4. Tester l'authentification
    console.log('\n4️⃣ Test d\'authentification...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PIN,
    });

    if (signInError) {
      console.error('❌ Échec de l\'authentification:', signInError.message);
      
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('\n💡 Le mot de passe (PIN) est incorrect ou le compte n\'a pas été créé avec ce PIN');
        console.log('   Solution: Réinitialiser le mot de passe avec:');
        console.log(`   
          -- Dans Supabase SQL Editor:
          SELECT auth.admin_update_user_by_id(
            '${adminUser.id}',
            '{"password": "${ADMIN_PIN}"}'::jsonb
          );
        `);
      } else if (signInError.message.includes('Database error')) {
        console.log('\n💡 Erreur de base de données - probablement un problème RLS ou de schéma');
        console.log('   Solution: Exécuter le script fix-database-schema-error.sql');
      }
    } else {
      console.log('✅ Authentification réussie!');
      console.log(`   User ID: ${signInData.user?.id}`);
      console.log(`   Email: ${signInData.user?.email}`);
    }

    // 5. Vérifier les politiques RLS
    console.log('\n5️⃣ Vérification des politiques RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            schemaname, 
            tablename, 
            policyname, 
            permissive, 
            cmd
          FROM pg_policies 
          WHERE tablename = 'user_roles';
        `
      })
      .maybeSingle();

    if (policiesError) {
      console.log('⚠️  Impossible de vérifier les politiques RLS');
    }

    console.log('\n================================');
    console.log('🏁 Diagnostic terminé\n');

  } catch (error: any) {
    console.error('\n💥 Erreur inattendue:', error.message);
  }
}

diagnoseAdminAccount();

