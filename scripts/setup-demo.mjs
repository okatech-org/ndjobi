#!/usr/bin/env node

/**
 * Script pour créer automatiquement les comptes démo
 */

import { createClient } from '../node_modules/@supabase/supabase-js/dist/module/index.js';

// Configuration Supabase locale
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Comptes démo
const demoAccounts = [
  { email: '24177777003@ndjobi.ga', password: '123456', role: 'admin', name: 'Protocole État' }
];

async function createAccount(account) {
  console.log(`📱 ${account.name}...`);
  
  try {
    // Essayer de créer avec signUp
    const { data, error } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: { full_name: account.name }
      }
    });

    if (error && !error.message.includes('already registered')) {
      throw error;
    }

    if (data?.user) {
      // Assigner le rôle
      await supabase.from('user_roles').upsert({
        user_id: data.user.id,
        role: account.role
      });
      console.log(`   ✅ Créé avec rôle ${account.role}`);
    } else {
      console.log(`   ⚠️ Existe déjà`);
    }
  } catch (error) {
    console.error(`   ❌ Erreur:`, error.message);
  }
}

async function main() {
  console.log('================================================');
  console.log('   Création des Comptes Démo NDJOBI            ');
  console.log('================================================\n');

  for (const account of demoAccounts) {
    await createAccount(account);
  }

  console.log('\n✅ Terminé !');
  console.log('\n📋 Pour se connecter :');
  console.log('Admin       : 77777003 + PIN: 123456');
}

main().catch(console.error);
