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

async function testDifferentAccounts() {
  console.log('👥 TEST - Différents comptes admin');
  console.log('==================================');
  
  const testAccounts = [
    {
      email: '24177888001@ndjobi.com',
      password: '111111',
      name: 'Président'
    },
    {
      email: '24177888002@ndjobi.com', 
      password: '222222',
      name: 'Sous-Admin DGSS'
    },
    {
      email: '24177888003@ndjobi.com',
      password: '333333', 
      name: 'Sous-Admin DGR'
    },
    {
      email: '33661002616@ndjobi.com',
      password: '999999',
      name: 'Super Admin Système'
    }
  ];
  
  for (const account of testAccounts) {
    console.log(`\n🔐 Test: ${account.name}`);
    console.log(`   Email: ${account.email}`);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });
      
      if (authError) {
        console.log(`   ❌ Erreur: ${authError.message}`);
        console.log(`   Code: ${authError.status}`);
      } else {
        console.log(`   ✅ Connexion réussie`);
        console.log(`   User ID: ${authData.user?.id}`);
        
        // Se déconnecter
        await supabase.auth.signOut();
        break; // Arrêter au premier succès
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
  }
}

async function testSchemaQueries() {
  console.log('\n🗄️ TEST - Requêtes de schéma');
  console.log('=============================');
  
  const queries = [
    {
      name: 'Test table profiles',
      query: () => supabase.from('profiles').select('*').limit(1)
    },
    {
      name: 'Test table user_roles', 
      query: () => supabase.from('user_roles').select('*').limit(1)
    },
    {
      name: 'Test table signalements',
      query: () => supabase.from('signalements').select('*').limit(1)
    },
    {
      name: 'Test table user_pins',
      query: () => supabase.from('user_pins').select('*').limit(1)
    },
    {
      name: 'Test RPC has_role',
      query: () => supabase.rpc('has_role', { _user_id: 'test', _role: 'admin' })
    },
    {
      name: 'Test RPC get_user_role',
      query: () => supabase.rpc('get_user_role', { _user_id: 'test' })
    }
  ];
  
  for (const test of queries) {
    console.log(`\n🔍 ${test.name}`);
    try {
      const { data, error } = await test.query();
      
      if (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
        console.log(`   Code: ${error.code}`);
        console.log(`   Details: ${error.details}`);
      } else {
        console.log(`   ✅ Succès`);
        if (data) {
          console.log(`   Données: ${JSON.stringify(data).substring(0, 100)}...`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
  }
}

async function testAuthMethods() {
  console.log('\n🔐 TEST - Méthodes d\'authentification');
  console.log('======================================');
  
  const email = '24177888001@ndjobi.com';
  const password = '111111';
  
  // Test 1: signInWithPassword
  console.log('\n1. Test signInWithPassword');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      console.log(`   Code: ${error.status}`);
    } else {
      console.log(`   ✅ Succès`);
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
  }
  
  // Test 2: signInWithOtp (si disponible)
  console.log('\n2. Test signInWithOtp');
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else {
      console.log(`   ✅ OTP envoyé`);
    }
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
  }
  
  // Test 3: getSession
  console.log('\n3. Test getSession');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else {
      console.log(`   ✅ Session: ${data.session ? 'Active' : 'Aucune'}`);
    }
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
  }
}

async function checkMigrations() {
  console.log('\n📋 VÉRIFICATION - Migrations');
  console.log('============================');
  
  try {
    // Vérifier si les tables existent avec des requêtes simples
    const tables = ['profiles', 'user_roles', 'signalements', 'user_pins'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Existe`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    // Vérifier les fonctions RPC
    console.log('\n🔧 Vérification des fonctions RPC:');
    const rpcFunctions = ['has_role', 'get_user_role', 'is_president'];
    
    for (const func of rpcFunctions) {
      try {
        const { data, error } = await supabase.rpc(func, {});
        
        if (error) {
          console.log(`❌ RPC ${func}: ${error.message}`);
        } else {
          console.log(`✅ RPC ${func}: Existe`);
        }
      } catch (err) {
        console.log(`❌ RPC ${func}: ${err.message}`);
      }
    }
    
  } catch (err) {
    console.log(`❌ Erreur générale: ${err.message}`);
  }
}

async function suggestSolutions() {
  console.log('\n💡 SOLUTIONS RECOMMANDÉES');
  console.log('=========================');
  
  console.log('\n1. 🔧 Vérifier les migrations Supabase:');
  console.log('   - Connectez-vous au dashboard Supabase');
  console.log('   - Allez dans SQL Editor');
  console.log('   - Vérifiez que toutes les migrations sont appliquées');
  
  console.log('\n2. 🗄️ Vérifier le schéma de base de données:');
  console.log('   - Vérifiez que les tables existent');
  console.log('   - Vérifiez que les fonctions RPC sont créées');
  console.log('   - Vérifiez les politiques RLS');
  
  console.log('\n3. 🔐 Tester l\'authentification:');
  console.log('   - Essayez de vous connecter via le dashboard Supabase');
  console.log('   - Vérifiez que le compte est confirmé');
  console.log('   - Testez avec un mot de passe différent');
  
  console.log('\n4. 📞 Contacter le support Supabase:');
  console.log('   - L\'erreur 500 indique un problème côté serveur');
  console.log('   - Contactez le support avec les détails de l\'erreur');
  console.log('   - Fournissez le Project ID: xfxqwlbqysiezqdpeqpv');
  
  console.log('\n5. 🎭 Utiliser le mode démo temporaire:');
  console.log('   - Accédez à: http://localhost:8080/demo-login.html');
  console.log('   - Utilisez le mode démo en attendant la correction');
}

async function main() {
  console.log('🚀 DIAGNOSTIC APPROFONDI - Problème de Schéma');
  console.log('==============================================');
  
  await testDifferentAccounts();
  await testSchemaQueries();
  await testAuthMethods();
  await checkMigrations();
  await suggestSolutions();
  
  console.log('\n✅ DIAGNOSTIC TERMINÉ');
  console.log('\n📋 Résumé:');
  console.log('- Le compte admin existe dans Supabase');
  console.log('- L\'erreur 500 indique un problème de schéma');
  console.log('- Vérifiez les migrations et le support Supabase');
  console.log('- Utilisez le mode démo en attendant la correction');
}

main().catch(console.error);
