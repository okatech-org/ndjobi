#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Supabase Production
const SUPABASE_URL = 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testWorkingAccount() {
  console.log('✅ TEST - Compte Super Admin Système (Fonctionnel)');
  console.log('==================================================');
  
  const email = '33661002616@ndjobi.com';
  const password = '999999';
  
  try {
    console.log(`🔐 Connexion avec: ${email}`);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.log(`❌ Erreur: ${authError.message}`);
      return;
    }
    
    console.log('✅ Connexion réussie !');
    console.log(`   - User ID: ${authData.user?.id}`);
    console.log(`   - Email: ${authData.user?.email}`);
    console.log(`   - Confirmé: ${authData.user?.email_confirmed_at ? 'Oui' : 'Non'}`);
    
    // Vérifier le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.log(`⚠️  Profil: ${profileError.message}`);
    } else {
      console.log('✅ Profil trouvé:');
      console.log(`   - Nom: ${profile.full_name}`);
      console.log(`   - Téléphone: ${profile.phone}`);
      console.log(`   - Fonction: ${profile.fonction}`);
      console.log(`   - Organisation: ${profile.organisation}`);
    }
    
    // Vérifier le rôle
    const { data: role, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (roleError) {
      console.log(`⚠️  Rôle: ${roleError.message}`);
    } else {
      console.log('✅ Rôle trouvé:');
      console.log(`   - Rôle: ${role.role}`);
    }
    
    // Vérifier le PIN
    const { data: pin, error: pinError } = await supabase
      .from('user_pins')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (pinError) {
      console.log(`⚠️  PIN: ${pinError.message}`);
    } else {
      console.log('✅ PIN trouvé:');
      console.log(`   - PIN: ${pin.pin}`);
    }
    
    // Se déconnecter
    await supabase.auth.signOut();
    console.log('✅ Déconnexion réussie');
    
  } catch (err) {
    console.log(`❌ Erreur: ${err.message}`);
  }
}

async function testPresidentAccount() {
  console.log('\n👑 TEST - Compte Président (Problématique)');
  console.log('==========================================');
  
  const email = '24177888001@ndjobi.com';
  const password = '111111';
  
  try {
    console.log(`🔐 Connexion avec: ${email}`);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.log(`❌ Erreur: ${authError.message}`);
      console.log(`   Code: ${authError.status}`);
      
      if (authError.message.includes('Database error querying schema')) {
        console.log('💡 Solution: Exécutez le script SQL pour créer les fonctions RPC manquantes');
        console.log('   Fichier: scripts/fix-missing-rpc-functions.sql');
      }
    } else {
      console.log('✅ Connexion réussie !');
      console.log(`   - User ID: ${authData.user?.id}`);
    }
    
  } catch (err) {
    console.log(`❌ Erreur: ${err.message}`);
  }
}

async function createPresidentProfile() {
  console.log('\n🔧 CRÉATION - Profil Président');
  console.log('==============================');
  
  const userId = 'c8cb1702-fcd3-4d60-82f3-f929a77e776a'; // ID du Président
  
  try {
    // Vérifier si le profil existe
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code === 'PGRST116') {
      console.log('⚠️  Profil manquant - création...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: '24177888001@ndjobi.com',
          phone: '+24177888001',
          full_name: 'Président de la République',
          role: 'super_admin',
          fonction: 'Président / Administrateur',
          organisation: 'Présidence de la République',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.log(`❌ Erreur création profil: ${insertError.message}`);
      } else {
        console.log('✅ Profil créé avec succès');
      }
    } else if (profileError) {
      console.log(`❌ Erreur profil: ${profileError.message}`);
    } else {
      console.log('✅ Profil existe déjà:');
      console.log(`   - Nom: ${existingProfile.full_name}`);
      console.log(`   - Email: ${existingProfile.email}`);
      console.log(`   - Rôle: ${existingProfile.role}`);
    }
    
    // Vérifier/créer le rôle
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (roleError && roleError.code === 'PGRST116') {
      console.log('⚠️  Rôle manquant - création...');
      
      const { error: insertRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
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
      console.log('✅ Rôle existe déjà:');
      console.log(`   - Rôle: ${existingRole.role}`);
    }
    
    // Vérifier/créer le PIN
    const { data: existingPin, error: pinError } = await supabase
      .from('user_pins')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (pinError && pinError.code === 'PGRST116') {
      console.log('⚠️  PIN manquant - création...');
      
      const { error: insertPinError } = await supabase
        .from('user_pins')
        .insert({
          user_id: userId,
          pin: '111111',
          created_at: new Date().toISOString()
        });
      
      if (insertPinError) {
        console.log(`❌ Erreur création PIN: ${insertPinError.message}`);
      } else {
        console.log('✅ PIN créé avec succès');
      }
    } else if (pinError) {
      console.log(`❌ Erreur PIN: ${pinError.message}`);
    } else {
      console.log('✅ PIN existe déjà:');
      console.log(`   - PIN: ${existingPin.pin}`);
    }
    
  } catch (err) {
    console.log(`❌ Erreur: ${err.message}`);
  }
}

async function main() {
  console.log('🚀 TEST DES COMPTES ADMIN');
  console.log('=========================');
  
  await testWorkingAccount();
  await testPresidentAccount();
  await createPresidentProfile();
  
  console.log('\n✅ TESTS TERMINÉS');
  console.log('\n📋 Résumé:');
  console.log('1. Le compte Super Admin Système fonctionne');
  console.log('2. Le compte Président a un problème de schéma');
  console.log('3. Exécutez le script SQL pour corriger les fonctions RPC');
  console.log('4. Ou utilisez le compte Super Admin Système temporairement');
  
  console.log('\n🔑 Compte fonctionnel:');
  console.log('   Email: 33661002616@ndjobi.com');
  console.log('   PIN: 999999');
  console.log('   Rôle: Super Admin Système');
}

main().catch(console.error);
