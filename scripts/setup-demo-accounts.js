#!/usr/bin/env node

/**
 * Script pour créer automatiquement les comptes démo
 * Utilise l'API Supabase Auth pour créer les utilisateurs
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase locale
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Utiliser service role pour créer les comptes
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Comptes démo à créer
const demoAccounts = [
  {
    email: '24177777001@ndjobi.ga',
    password: '123456',
    role: 'user',
    name: 'Citoyen',
    phone: '+24177777001'
  },
  {
    email: '24177777002@ndjobi.ga',
    password: '123456',
    role: 'agent',
    name: 'Agent DGSS',
    phone: '+24177777002'
  },
  {
    email: '24177777003@ndjobi.ga',
    password: '123456',
    role: 'admin',
    name: 'Protocole État',
    phone: '+24177777003'
  },
  {
    email: '24177777000@ndjobi.ga',
    password: '123456',
    role: 'super_admin',
    name: 'Super Admin',
    phone: '+24177777000'
  }
];

async function createDemoAccount(account) {
  console.log(`\n📱 Création du compte ${account.name}...`);
  
  try {
    // 1. Créer l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        full_name: account.name,
        phone: account.phone
      }
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`   ⚠️ Utilisateur existe déjà`);
        
        // Récupérer l'utilisateur existant
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === account.email);
        
        if (existingUser) {
          await assignRole(existingUser.id, account.role, account.name);
        }
      } else {
        throw authError;
      }
    } else if (authData.user) {
      console.log(`   ✅ Utilisateur créé: ${authData.user.id}`);
      await assignRole(authData.user.id, account.role, account.name);
    }
  } catch (error) {
    console.error(`   ❌ Erreur:`, error.message);
  }
}

async function assignRole(userId, role, name) {
  // 2. Assigner le rôle
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({ 
      user_id: userId, 
      role: role 
    }, {
      onConflict: 'user_id'
    });

  if (roleError) {
    console.log(`   ⚠️ Erreur rôle:`, roleError.message);
  } else {
    console.log(`   ✅ Rôle assigné: ${role}`);
  }

  // 3. Créer/Mettre à jour le profil
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      username: name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@ndjobi.ga`
    }, {
      onConflict: 'id'
    });

  if (profileError) {
    console.log(`   ⚠️ Erreur profil:`, profileError.message);
  } else {
    console.log(`   ✅ Profil créé/mis à jour`);
  }
}

async function setupDemoAccounts() {
  console.log('================================================');
  console.log('   Configuration des Comptes Démo NDJOBI       ');
  console.log('================================================');

  // Créer chaque compte démo
  for (const account of demoAccounts) {
    await createDemoAccount(account);
  }

  console.log('\n================================================');
  console.log('            Récapitulatif des Comptes           ');
  console.log('================================================');
  console.log('\n| Rôle        | Numéro         | PIN    |');
  console.log('|-------------|----------------|--------|');
  console.log('| Citoyen     | +24177777001   | 123456 |');
  console.log('| Agent DGSS  | +24177777002   | 123456 |');
  console.log('| Admin       | +24177777003   | 123456 |');
  console.log('| Super Admin | +24177777000   | 123456 |');
  console.log('\n✅ Configuration terminée !');
  console.log('\nPour vous connecter :');
  console.log('1. Allez sur http://localhost:5173/auth');
  console.log('2. Cliquez sur le bouton du compte souhaité');
  console.log('3. Ou utilisez le formulaire avec :');
  console.log('   - Indicatif : +241');
  console.log('   - Numéro : 77777000 (pour Super Admin)');
  console.log('   - PIN : 123456');
}

// Exécuter le script
setupDemoAccounts().catch(console.error);
