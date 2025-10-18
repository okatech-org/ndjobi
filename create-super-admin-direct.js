/**
 * Script pour créer le compte Super Admin directement via Supabase
 * Utilise la Service Role Key pour contourner les restrictions RLS
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non trouvée dans les variables d\'environnement');
  console.log('💡 Ajoutez-la dans votre fichier .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const SUPER_ADMIN_EMAIL = '33661002616@ndjobi.com';
const SUPER_ADMIN_PHONE = '+33661002616';
const SUPER_ADMIN_PIN = '999999';
const SUPER_ADMIN_FULL_NAME = 'Super Administrateur';
const SUPER_ADMIN_ROLE = 'super_admin';

async function createSuperAdminAccount() {
  console.log('🔧 Création du compte Super Admin...');
  console.log('====================================');

  try {
    // 1. Vérifier si l'utilisateur existe déjà
    console.log('🔍 Vérification de l\'existence du compte...');
    
    const { data: existingAuth, error: authCheckError } = await supabase.auth.admin.listUsers();
    
    if (authCheckError) {
      console.error('❌ Erreur lors de la vérification:', authCheckError);
      throw authCheckError;
    }

    const existingUser = existingAuth.users.find(
      u => u.email === SUPER_ADMIN_EMAIL || u.phone === SUPER_ADMIN_PHONE
    );

    let userId;

    if (existingUser) {
      userId = existingUser.id;
      console.log('⚠️ Le compte Super Admin existe déjà dans auth.users avec ID:', userId);
    } else {
      console.log('📝 Le compte Super Admin n\'existe pas, création en cours...');
      
      // 2. Créer l'utilisateur dans auth.users
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: SUPER_ADMIN_EMAIL,
        phone: SUPER_ADMIN_PHONE,
        password: SUPER_ADMIN_PIN,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          full_name: SUPER_ADMIN_FULL_NAME,
          phone: SUPER_ADMIN_PHONE,
          organization: 'Administration Système'
        },
      });

      if (createError) {
        console.error('❌ Erreur lors de la création de l\'utilisateur:', createError);
        throw createError;
      }
      
      userId = newUser.user.id;
      console.log('✅ Compte auth créé avec ID:', userId);
    }

    // 3. Créer/Mettre à jour le profil dans public.profiles
    console.log('📝 Création/mise à jour du profil...');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: SUPER_ADMIN_EMAIL,
        full_name: SUPER_ADMIN_FULL_NAME,
        phone: SUPER_ADMIN_PHONE,
        organization: 'Administration Système',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('❌ Erreur lors de la création du profil:', profileError);
      throw profileError;
    }
    console.log('✅ Profil créé/mis à jour dans public.profiles');

    // 4. Attribuer le rôle dans public.user_roles
    console.log('📝 Attribution du rôle super_admin...');
    
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: SUPER_ADMIN_ROLE,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (roleError) {
      console.error('❌ Erreur lors de l\'attribution du rôle:', roleError);
      throw roleError;
    }
    console.log('✅ Rôle attribué dans public.user_roles');

    // 5. Vérification finale
    console.log('\n🔍 Vérification finale...');
    
    const { data: verification, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, organization')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
    } else {
      console.log('✅ Profil vérifié:', verification);
    }

    const { data: roleVerif, error: roleVerifyError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleVerifyError) {
      console.error('❌ Erreur lors de la vérification du rôle:', roleVerifyError);
    } else {
      console.log('✅ Rôle vérifié:', roleVerif.role);
    }

    console.log('\n✅ Compte Super Admin configuré avec succès !');
    console.log('📋 Informations :');
    console.log('   Email:', SUPER_ADMIN_EMAIL);
    console.log('   Téléphone:', SUPER_ADMIN_PHONE);
    console.log('   PIN:', SUPER_ADMIN_PIN);
    console.log('   Rôle:', SUPER_ADMIN_ROLE);
    console.log('\n🎯 Testez maintenant sur /auth/super-admin');

  } catch (error) {
    console.error('\n❌ Une erreur est survenue:', error);
    process.exit(1);
  }
}

createSuperAdminAccount();

