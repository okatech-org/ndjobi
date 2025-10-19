#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration Supabase Production
const SUPABASE_URL = 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k';

// Service Role Key (à récupérer depuis les secrets Supabase)
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant');
  console.log('📋 Veuillez définir la variable d\'environnement:');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateEnvFile() {
  console.log('🔧 MISE À JOUR - Fichier .env.local');
  console.log('===================================');
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = `# === SUPABASE PRODUCTION ===
VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k
VITE_SUPABASE_PROJECT_ID=xfxqwlbqysiezqdpeqpv
VITE_SUPER_ADMIN_CODE=NDJOBI2025ADMIN
VITE_SUPER_ADMIN_EMAIL=iasted@me.com`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env.local mis à jour avec la configuration production');
  } catch (error) {
    console.log('⚠️  Impossible de mettre à jour .env.local automatiquement');
    console.log('📋 Veuillez mettre à jour manuellement:');
    console.log('');
    console.log('VITE_SUPABASE_URL=https://xfxqwlbqysiezqdpeqpv.supabase.co');
    console.log('VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k');
    console.log('VITE_SUPABASE_PROJECT_ID=xfxqwlbqysiezqdpeqpv');
  }
}

async function testConnection() {
  console.log('\n🔍 TEST - Connexion Supabase');
  console.log('============================');
  
  try {
    // Test de connexion basique
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`❌ Erreur de connexion: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${error.details}`);
    } else {
      console.log('✅ Connexion Supabase réussie');
    }
  } catch (err) {
    console.log(`❌ Erreur de connexion: ${err}`);
  }
}

async function checkAdminAccount() {
  console.log('\n👑 VÉRIFICATION - Compte Admin Président');
  console.log('=========================================');
  
  try {
    // Lister les utilisateurs avec admin
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.log(`❌ Erreur liste utilisateurs: ${usersError.message}`);
      return;
    }
    
    console.log(`📊 Total utilisateurs: ${users.users.length}`);
    
    // Chercher le compte admin
    const adminUser = users.users.find(u => u.email === '24177888001@ndjobi.com');
    
    if (adminUser) {
      console.log('✅ Compte admin Président trouvé');
      console.log(`   - ID: ${adminUser.id}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Créé: ${adminUser.created_at}`);
      console.log(`   - Confirmé: ${adminUser.email_confirmed_at ? 'Oui' : 'Non'}`);
      
      // Vérifier le profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single();
      
      if (profileError) {
        console.log(`⚠️  Profil manquant: ${profileError.message}`);
      } else {
        console.log('✅ Profil trouvé');
        console.log(`   - Nom: ${profile.full_name}`);
        console.log(`   - Rôle: ${profile.role}`);
        console.log(`   - Fonction: ${profile.fonction}`);
      }
      
      // Vérifier le rôle
      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', adminUser.id)
        .single();
      
      if (roleError) {
        console.log(`⚠️  Rôle manquant: ${roleError.message}`);
      } else {
        console.log('✅ Rôle trouvé');
        console.log(`   - Rôle: ${role.role}`);
      }
      
    } else {
      console.log('❌ Compte admin Président non trouvé');
      console.log('🔧 Création du compte...');
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
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
        console.log(`❌ Erreur création: ${createError.message}`);
      } else {
        console.log('✅ Compte admin créé');
        console.log(`   - ID: ${newUser.user?.id}`);
      }
    }
    
  } catch (err) {
    console.log(`❌ Erreur: ${err}`);
  }
}

async function testLogin() {
  console.log('\n🔐 TEST - Connexion Admin');
  console.log('=========================');
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '24177888001@ndjobi.com',
      password: '111111'
    });
    
    if (authError) {
      console.log(`❌ Erreur de connexion: ${authError.message}`);
      console.log(`   Code: ${authError.status}`);
      
      if (authError.message.includes('Invalid login credentials')) {
        console.log('💡 Solution: Le compte existe mais le mot de passe est incorrect');
        console.log('   - Vérifiez le mot de passe: 111111');
        console.log('   - Ou réinitialisez le mot de passe');
      }
    } else {
      console.log('✅ Connexion admin réussie');
      console.log(`   - User ID: ${authData.user?.id}`);
      console.log(`   - Email: ${authData.user?.email}`);
      
      // Se déconnecter
      await supabase.auth.signOut();
    }
    
  } catch (err) {
    console.log(`❌ Erreur lors du test: ${err}`);
  }
}

async function main() {
  console.log('🚀 SCRIPT DE CONFIGURATION SUPABASE');
  console.log('====================================');
  
  await updateEnvFile();
  await testConnection();
  await checkAdminAccount();
  await testLogin();
  
  console.log('\n✅ CONFIGURATION TERMINÉE');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Redémarrez le serveur de développement');
  console.log('2. Testez la connexion avec:');
  console.log('   - Email: 24177888001@ndjobi.com');
  console.log('   - PIN: 111111');
  console.log('3. Vérifiez que le dashboard admin se charge');
}

main().catch(console.error);
