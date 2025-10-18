#!/usr/bin/env node

/**
 * Script pour créer le compte Super Admin directement via l'API Supabase
 * Utilise les credentials fournis par l'utilisateur
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createSuperAdminAccount() {
  console.log('🔧 Création du compte Super Admin...');
  console.log('====================================');

  try {
    // 1. Vérifier si le compte existe déjà
    console.log('🔍 Vérification de l\'existence du compte...');
    
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone')
      .eq('email', '33661002616@ndjobi.com');

    if (profileError) {
      console.error('❌ Erreur lors de la vérification:', profileError);
      return;
    }

    if (existingProfile && existingProfile.length > 0) {
      console.log('⚠️  Le compte Super Admin existe déjà:');
      console.log('   Email:', existingProfile[0].email);
      console.log('   Nom:', existingProfile[0].full_name);
      console.log('   Téléphone:', existingProfile[0].phone);
      
      // Vérifier le rôle
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', existingProfile[0].id);

      if (roleData && roleData.length > 0) {
        console.log('   Rôle:', roleData[0].role);
      }
      
      console.log('✅ Le compte Super Admin est déjà configuré !');
      return;
    }

    console.log('📝 Le compte Super Admin n\'existe pas, création en cours...');

    // 2. Créer le compte via l'API Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: '33661002616@ndjobi.com',
      password: '999999',
      phone: '+33661002616',
      options: {
        data: {
          full_name: 'Super Administrateur',
          phone: '+33661002616',
          organization: 'Administration Système'
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur lors de la création du compte auth:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ Aucun utilisateur créé');
      return;
    }

    console.log('✅ Compte auth créé avec ID:', authData.user.id);

    // 3. Créer le profil
    const { data: profileData, error: profileCreateError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: '33661002616@ndjobi.com',
        full_name: 'Super Administrateur',
        phone: '+33661002616',
        organization: 'Administration Système'
      })
      .select();

    if (profileCreateError) {
      console.error('❌ Erreur lors de la création du profil:', profileCreateError);
      return;
    }

    console.log('✅ Profil créé:', profileData[0]);

    // 4. Attribuer le rôle super_admin
    const { data: roleData, error: roleCreateError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'super_admin'
      })
      .select();

    if (roleCreateError) {
      console.error('❌ Erreur lors de l\'attribution du rôle:', roleCreateError);
      return;
    }

    console.log('✅ Rôle super_admin attribué:', roleData[0]);

    // 5. Vérification finale
    console.log('');
    console.log('🎉 COMPTE SUPER ADMIN CRÉÉ AVEC SUCCÈS !');
    console.log('==========================================');
    console.log('📋 Informations du compte :');
    console.log('   • Email: 33661002616@ndjobi.com');
    console.log('   • Téléphone: +33661002616');
    console.log('   • PIN: 999999');
    console.log('   • Rôle: super_admin');
    console.log('   • ID: ' + authData.user.id);
    console.log('');
    console.log('🎯 Le compte Super Admin est maintenant disponible pour :');
    console.log('   • Authentification avec numéro + PIN');
    console.log('   • Accès au dashboard Super Admin');
    console.log('   • Gestion des utilisateurs et rôles');
    console.log('');
    console.log('💡 Testez maintenant la connexion Super Admin !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
createSuperAdminAccount();
