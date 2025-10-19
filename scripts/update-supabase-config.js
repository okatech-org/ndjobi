#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Supabase Production
const SUPABASE_URL = 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateEnvFile() {
  console.log('🔧 MISE À JOUR - Fichier .env.local');
  console.log('===================================');
  
  const envPath = path.join(__dirname, '..', '.env.local');
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
      
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('💡 Solution: La table profiles n\'existe pas encore');
        console.log('   - Exécutez les migrations Supabase');
        console.log('   - Ou importez les données de simulation');
      }
    } else {
      console.log('✅ Connexion Supabase réussie');
      console.log(`   - Profils trouvés: ${data.length}`);
    }
  } catch (err) {
    console.log(`❌ Erreur de connexion: ${err}`);
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
        console.log('   - Ou le compte n\'existe pas encore');
      } else if (authError.message.includes('Database error querying schema')) {
        console.log('💡 Solution: Problème de schéma de base de données');
        console.log('   - Vérifiez que les migrations sont appliquées');
        console.log('   - Vérifiez que les tables existent');
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

async function checkTables() {
  console.log('\n📊 VÉRIFICATION - Tables Supabase');
  console.log('==================================');
  
  const tables = ['profiles', 'user_roles', 'signalements', 'user_pins'];
  
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
}

async function main() {
  console.log('🚀 SCRIPT DE CONFIGURATION SUPABASE');
  console.log('====================================');
  
  await updateEnvFile();
  await testConnection();
  await checkTables();
  await testLogin();
  
  console.log('\n✅ CONFIGURATION TERMINÉE');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Redémarrez le serveur de développement');
  console.log('2. Testez la connexion avec:');
  console.log('   - Email: 24177888001@ndjobi.com');
  console.log('   - PIN: 111111');
  console.log('3. Si problème persiste:');
  console.log('   - Vérifiez que les migrations sont appliquées');
  console.log('   - Importez les données de simulation');
  console.log('   - Vérifiez que le compte admin existe');
}

main().catch(console.error);
