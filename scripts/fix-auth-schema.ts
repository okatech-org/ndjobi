#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnoseAuthSchema() {
  console.log('🔍 DIAGNOSTIC - Schéma d\'authentification Supabase');
  console.log('================================================');
  
  try {
    // 1. Vérifier la connexion
    console.log('\n1. Test de connexion...');
    const { data: health, error: healthError } = await supabase
      .from('_health')
      .select('*')
      .limit(1);
    
    if (healthError) {
      console.log('⚠️  Table _health non accessible (normal)');
    } else {
      console.log('✅ Connexion Supabase OK');
    }

    // 2. Vérifier les tables principales
    console.log('\n2. Vérification des tables...');
    
    const tables = ['profiles', 'user_roles', 'signalements'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: Erreur de connexion`);
      }
    }

    // 3. Vérifier les utilisateurs auth
    console.log('\n3. Vérification des utilisateurs auth...');
    
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log(`❌ Erreur auth: ${usersError.message}`);
      } else {
        console.log(`✅ Utilisateurs trouvés: ${users.users.length}`);
        
        // Vérifier le compte admin spécifique
        const adminUser = users.users.find(u => u.email === '24177888001@ndjobi.com');
        if (adminUser) {
          console.log('✅ Compte admin Président trouvé');
          console.log(`   - ID: ${adminUser.id}`);
          console.log(`   - Email: ${adminUser.email}`);
          console.log(`   - Créé: ${adminUser.created_at}`);
          console.log(`   - Confirmé: ${adminUser.email_confirmed_at ? 'Oui' : 'Non'}`);
        } else {
          console.log('❌ Compte admin Président non trouvé');
        }
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la vérification des utilisateurs: ${err}`);
    }

    // 4. Tester la connexion avec le compte admin
    console.log('\n4. Test de connexion admin...');
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: '24177888001@ndjobi.com',
        password: '111111'
      });
      
      if (authError) {
        console.log(`❌ Erreur de connexion: ${authError.message}`);
        console.log(`   Code: ${authError.status}`);
      } else {
        console.log('✅ Connexion admin réussie');
        console.log(`   - User ID: ${authData.user?.id}`);
        
        // Se déconnecter
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log(`❌ Erreur lors du test de connexion: ${err}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

async function fixAuthIssues() {
  console.log('\n🔧 CORRECTION - Problèmes d\'authentification');
  console.log('=============================================');
  
  try {
    // 1. Vérifier et corriger le profil admin
    console.log('\n1. Vérification du profil admin...');
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log(`❌ Impossible de lister les utilisateurs: ${usersError.message}`);
      return;
    }
    
    const adminUser = users.users.find(u => u.email === '24177888001@ndjobi.com');
    
    if (!adminUser) {
      console.log('❌ Compte admin non trouvé - création nécessaire');
      
      // Créer le compte admin
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: '24177888001@ndjobi.com',
        password: '111111',
        email_confirm: true,
        user_metadata: {
          phone: '+24177888001',
          full_name: 'Président de la République',
          role: 'super_admin',
          fonction: 'Président / Administrateur',
          organisation: 'Présidence de la République'
        }
      });
      
      if (createError) {
        console.log(`❌ Erreur création compte: ${createError.message}`);
      } else {
        console.log('✅ Compte admin créé avec succès');
        console.log(`   - ID: ${newUser.user?.id}`);
      }
    } else {
      console.log('✅ Compte admin existe déjà');
      
      // Mettre à jour le profil si nécessaire
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log('⚠️  Profil manquant - création...');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: adminUser.id,
            email: '24177888001@ndjobi.com',
            phone: '+24177888001',
            full_name: 'Président de la République',
            role: 'super_admin',
            fonction: 'Président / Administrateur',
            organisation: 'Présidence de la République',
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.log(`❌ Erreur création profil: ${insertError.message}`);
        } else {
          console.log('✅ Profil créé avec succès');
        }
      } else if (profileError) {
        console.log(`❌ Erreur profil: ${profileError.message}`);
      } else {
        console.log('✅ Profil existe déjà');
      }
      
      // Vérifier le rôle
      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', adminUser.id)
        .single();
      
      if (roleError && roleError.code === 'PGRST116') {
        console.log('⚠️  Rôle manquant - création...');
        
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: adminUser.id,
            role: 'super_admin',
            created_at: new Date().toISOString()
          });
        
        if (insertRoleError) {
          console.log(`❌ Erreur création rôle: ${insertRoleError.message}`);
        } else {
          console.log('✅ Rôle créé avec succès');
        }
      } else if (roleError) {
        console.log(`❌ Erreur rôle: ${roleError.message}`);
      } else {
        console.log('✅ Rôle existe déjà');
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

async function main() {
  console.log('🚀 SCRIPT DE DIAGNOSTIC ET CORRECTION AUTH');
  console.log('==========================================');
  
  await diagnoseAuthSchema();
  await fixAuthIssues();
  
  console.log('\n✅ DIAGNOSTIC TERMINÉ');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Vérifiez les logs ci-dessus');
  console.log('2. Testez la connexion avec:');
  console.log('   - Email: 24177888001@ndjobi.com');
  console.log('   - PIN: 111111');
  console.log('3. Si problème persiste, vérifiez la configuration Supabase');
}

main().catch(console.error);
