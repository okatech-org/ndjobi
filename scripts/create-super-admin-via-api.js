#!/usr/bin/env node

/**
 * Script pour créer automatiquement le compte Super Admin
 * via l'API Supabase
 * 
 * Usage: node scripts/create-super-admin-via-api.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SUPER_ADMIN_EMAIL = 'superadmin@ndjobi.com';
const SUPER_ADMIN_PASSWORD = 'ChangeMeStrong!123';
const SUPER_ADMIN_PHONE = '+33661002616';
const SUPER_ADMIN_NAME = 'Super Administrateur';

async function createSuperAdmin() {
  console.log('\n🚀 Création du compte Super Admin NDJOBI...\n');

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ ERREUR: Variable SUPABASE_SERVICE_ROLE_KEY non définie');
    console.log('\n📝 Pour obtenir cette clé:');
    console.log('   1. Aller sur https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api');
    console.log('   2. Copier la clé "service_role key" (secret)');
    console.log('   3. Exporter: export SUPABASE_SERVICE_ROLE_KEY="votre_clé_ici"\n');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('📧 Email:', SUPER_ADMIN_EMAIL);
    console.log('📱 Phone:', SUPER_ADMIN_PHONE);
    console.log('');

    // 1. Vérifier si l'utilisateur existe déjà
    console.log('🔍 Vérification de l\'existence du compte...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw new Error(`Erreur lors de la liste des utilisateurs: ${listError.message}`);
    }

    const existingUser = existingUsers.users.find(u => u.email === SUPER_ADMIN_EMAIL);

    let userId;

    if (existingUser) {
      console.log('✅ Compte existant trouvé:', existingUser.id);
      userId = existingUser.id;
      
      // Mettre à jour le mot de passe si nécessaire
      console.log('🔄 Mise à jour du mot de passe...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: SUPER_ADMIN_PASSWORD }
      );
      
      if (updateError) {
        console.warn('⚠️ Impossible de mettre à jour le mot de passe:', updateError.message);
      } else {
        console.log('✅ Mot de passe mis à jour');
      }
    } else {
      // 2. Créer le nouveau compte
      console.log('➕ Création du nouveau compte...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: SUPER_ADMIN_NAME,
          phone: SUPER_ADMIN_PHONE
        }
      });

      if (createError) {
        throw new Error(`Erreur lors de la création du compte: ${createError.message}`);
      }

      userId = newUser.user.id;
      console.log('✅ Compte créé avec succès:', userId);
    }

    // 3. Créer/Mettre à jour le profil
    console.log('👤 Configuration du profil...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: SUPER_ADMIN_EMAIL,
        full_name: SUPER_ADMIN_NAME,
        phone: SUPER_ADMIN_PHONE,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.warn('⚠️ Erreur lors de la création du profil:', profileError.message);
    } else {
      console.log('✅ Profil configuré');
    }

    // 4. Attribuer le rôle super_admin
    console.log('🔑 Attribution du rôle super_admin...');
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'super_admin'
      });

    if (roleError) {
      throw new Error(`Erreur lors de l'attribution du rôle: ${roleError.message}`);
    }

    console.log('✅ Rôle super_admin attribué');

    // 5. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { data: verification, error: verifyError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        phone,
        user_roles (role)
      `)
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.warn('⚠️ Impossible de vérifier le compte:', verifyError.message);
    } else {
      console.log('\n✅ Compte Super Admin configuré avec succès!\n');
      console.log('================================================');
      console.log('📋 INFORMATIONS DE CONNEXION');
      console.log('================================================');
      console.log('Email:', SUPER_ADMIN_EMAIL);
      console.log('Password:', SUPER_ADMIN_PASSWORD);
      console.log('Code OTP:', '999999');
      console.log('Phone:', SUPER_ADMIN_PHONE);
      console.log('Role:', verification.user_roles?.[0]?.role || 'N/A');
      console.log('User ID:', userId);
      console.log('================================================\n');
      console.log('🎉 Vous pouvez maintenant vous connecter au dashboard Super Admin!');
      console.log('🌐 URL: http://localhost:5173/auth/super-admin\n');
    }

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('\n💡 Suggestions:');
    console.log('   1. Vérifier que SUPABASE_SERVICE_ROLE_KEY est correcte');
    console.log('   2. Vérifier que les tables profiles et user_roles existent');
    console.log('   3. Vérifier les permissions RLS sur ces tables');
    console.log('   4. Essayer la méthode manuelle via l\'interface Supabase\n');
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  createSuperAdmin().catch(err => {
    console.error('Erreur fatale:', err);
    process.exit(1);
  });
}

module.exports = { createSuperAdmin };

