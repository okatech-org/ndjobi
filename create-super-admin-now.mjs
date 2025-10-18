/**
 * Script pour créer le compte Super Admin immédiatement
 * Utilise l'API Supabase directement
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (depuis vos credentials)
const SUPABASE_URL = 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SUPER_ADMIN_EMAIL = '33661002616@ndjobi.com';
const SUPER_ADMIN_PHONE = '+33661002616';
const SUPER_ADMIN_PASSWORD = '999999';

async function createSuperAdmin() {
  console.log('🔧 Tentative de création du compte Super Admin...');
  console.log('================================================\n');

  try {
    // Étape 1 : Créer le compte avec signUp
    console.log('📝 Création du compte auth...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      phone: SUPER_ADMIN_PHONE,
      options: {
        data: {
          full_name: 'Super Administrateur',
          phone: SUPER_ADMIN_PHONE,
          organization: 'Administration Système'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('⚠️  Le compte existe déjà dans auth.users');
        console.log('    Tentative de connexion pour récupérer l\'ID...\n');
        
        // Essayer de se connecter pour récupérer l'ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD
        });

        if (signInError) {
          console.error('❌ Erreur de connexion:', signInError.message);
          throw new Error('Le compte existe mais impossible de se connecter. Utilisez le SQL Editor de Supabase.');
        }

        const userId = signInData.user.id;
        console.log('✅ Connexion réussie, ID récupéré:', userId);
        
        await createProfileAndRole(userId);
        
      } else {
        console.error('❌ Erreur lors de la création:', signUpError.message);
        throw signUpError;
      }
    } else {
      console.log('✅ Compte créé avec succès');
      const userId = signUpData.user.id;
      console.log('   ID:', userId);
      
      await createProfileAndRole(userId);
    }

    console.log('\n✅ SUCCÈS ! Compte Super Admin configuré');
    console.log('═══════════════════════════════════════════');
    console.log('📋 Informations de connexion :');
    console.log('   URL : /auth/super-admin');
    console.log('   PIN : 999999');
    console.log('\n🎯 Testez maintenant sur votre application !');
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.log('\n💡 SOLUTION ALTERNATIVE :');
    console.log('   Utilisez le fichier EXECUTER-MAINTENANT.md');
    console.log('   et exécutez le script SQL dans Supabase SQL Editor');
    process.exit(1);
  }
}

async function createProfileAndRole(userId) {
  console.log('\n📝 Création du profil...');
  
  // Créer le profil
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: SUPER_ADMIN_EMAIL,
      full_name: 'Super Administrateur',
      phone: SUPER_ADMIN_PHONE,
      organization: 'Administration Système'
    });

  if (profileError) {
    console.error('❌ Erreur profil:', profileError.message);
    throw profileError;
  }
  console.log('✅ Profil créé');

  console.log('\n📝 Attribution du rôle super_admin...');
  
  // Attribuer le rôle
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: 'super_admin'
    });

  if (roleError) {
    console.error('❌ Erreur rôle:', roleError.message);
    throw roleError;
  }
  console.log('✅ Rôle attribué');

  // Vérification
  console.log('\n🔍 Vérification...');
  const { data: verif, error: verifError } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, organization')
    .eq('id', userId)
    .single();

  if (verifError) {
    console.error('⚠️  Erreur vérification:', verifError.message);
  } else {
    console.log('✅ Profil vérifié:', verif);
  }

  const { data: roleVerif, error: roleVerifError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (roleVerifError) {
    console.error('⚠️  Erreur vérification rôle:', roleVerifError.message);
  } else {
    console.log('✅ Rôle vérifié:', roleVerif.role);
  }
}

createSuperAdmin();

