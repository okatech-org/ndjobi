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

async function createAdminAccount() {
  console.log('👑 CRÉATION - Compte Admin Président');
  console.log('====================================');
  
  try {
    // Créer le compte admin avec signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: '24177888001@ndjobi.com',
      password: '111111',
      options: {
        data: {
          phone: '+24177888001',
          full_name: 'Président de la République',
          role: 'super_admin',
          fonction: 'Président / Administrateur',
          organisation: 'Présidence de la République'
        }
      }
    });
    
    if (authError) {
      console.log(`❌ Erreur création compte: ${authError.message}`);
      console.log(`   Code: ${authError.status}`);
      
      if (authError.message.includes('User already registered')) {
        console.log('✅ Le compte existe déjà');
        console.log('🔧 Tentative de connexion...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: '24177888001@ndjobi.com',
          password: '111111'
        });
        
        if (loginError) {
          console.log(`❌ Erreur de connexion: ${loginError.message}`);
        } else {
          console.log('✅ Connexion réussie');
          console.log(`   - User ID: ${loginData.user?.id}`);
          
          // Créer le profil
          await createProfile(loginData.user.id);
          
          // Se déconnecter
          await supabase.auth.signOut();
        }
      }
    } else {
      console.log('✅ Compte admin créé avec succès');
      console.log(`   - User ID: ${authData.user?.id}`);
      console.log(`   - Email: ${authData.user?.email}`);
      
      if (authData.user) {
        // Créer le profil
        await createProfile(authData.user.id);
      }
    }
    
  } catch (err) {
    console.log(`❌ Erreur: ${err}`);
  }
}

async function createProfile(userId) {
  console.log('\n📝 CRÉATION - Profil utilisateur');
  console.log('=================================');
  
  try {
    const { data: profile, error: profileError } = await supabase
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
    
    // Créer le rôle
    await createRole(userId);
    
  } catch (err) {
    console.log(`❌ Erreur profil: ${err}`);
  }
}

async function createRole(userId) {
  console.log('\n🔐 CRÉATION - Rôle utilisateur');
  console.log('==============================');
  
  try {
    const { data: role, error: roleError } = await supabase
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
      console.log('✅ Rôle existe déjà');
    }
    
  } catch (err) {
    console.log(`❌ Erreur rôle: ${err}`);
  }
}

async function createPin(userId) {
  console.log('\n🔑 CRÉATION - Code PIN');
  console.log('======================');
  
  try {
    const { data: pin, error: pinError } = await supabase
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
      console.log('✅ PIN existe déjà');
    }
    
  } catch (err) {
    console.log(`❌ Erreur PIN: ${err}`);
  }
}

async function testFinalLogin() {
  console.log('\n🔐 TEST - Connexion finale');
  console.log('==========================');
  
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
      console.log(`   - Email: ${authData.user?.email}`);
      
      // Se déconnecter
      await supabase.auth.signOut();
    }
    
  } catch (err) {
    console.log(`❌ Erreur lors du test: ${err}`);
  }
}

async function main() {
  console.log('🚀 SCRIPT DE CRÉATION COMPTE ADMIN');
  console.log('===================================');
  
  await createAdminAccount();
  await testFinalLogin();
  
  console.log('\n✅ CRÉATION TERMINÉE');
  console.log('\n📋 Testez maintenant:');
  console.log('1. Redémarrez le serveur de développement');
  console.log('2. Connectez-vous avec:');
  console.log('   - Email: 24177888001@ndjobi.com');
  console.log('   - PIN: 111111');
  console.log('3. Vérifiez l\'accès au dashboard admin');
}

main().catch(console.error);
