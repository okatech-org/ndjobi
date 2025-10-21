#!/usr/bin/env ts-node
/**
 * Script de vérification et création du compte Président
 * Ce compte donne accès à l'interface hybride avec 11 onglets
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant.');
  console.log('\n💡 Pour l\'obtenir :');
  console.log('   1. Allez sur https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api');
  console.log('   2. Copiez "service_role" key');
  console.log('   3. Exécutez : export SUPABASE_SERVICE_ROLE_KEY="votre_clé"\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const PRESIDENT_ACCOUNT = {
  phone: '+24177888001',
  email: '24177888001@ndjobi.com',
  password: '111111',
  role: 'admin',
  fullName: 'Président de la République'
};

async function verifyPresidentAccount() {
  console.log('🔍 Vérification du compte Président...\n');

  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(
      u => u.email === PRESIDENT_ACCOUNT.email || u.phone === PRESIDENT_ACCOUNT.phone
    );

    if (existingUser) {
      console.log('✅ Le compte Président existe déjà !');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Téléphone: ${existingUser.phone}`);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existingUser.id)
        .single();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', existingUser.id)
        .single();

      console.log(`   Nom: ${profile?.full_name || 'NON DÉFINI'}`);
      console.log(`   Rôle: ${roleData?.role || 'NON ASSIGNÉ'}`);
      
      console.log('\n📱 Pour vous connecter :');
      console.log('   1. Allez sur http://localhost:8080/auth');
      console.log(`   2. Entrez le numéro : 24177888001`);
      console.log(`   3. Entrez le PIN : 111111`);
      console.log('   4. Vous serez redirigé vers /admin avec l\'interface hybride\n');
      
      return true;
    }

    console.log('⚠️  Le compte Président n\'existe pas. Création...\n');
    await createPresidentAccount();
    return false;

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

async function createPresidentAccount() {
  console.log('📱 Création du compte Président...');

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: PRESIDENT_ACCOUNT.email,
      password: PRESIDENT_ACCOUNT.password,
      email_confirm: true,
      phone: PRESIDENT_ACCOUNT.phone,
      phone_confirm: true,
      user_metadata: {
        full_name: PRESIDENT_ACCOUNT.fullName,
        phone: PRESIDENT_ACCOUNT.phone,
        role: PRESIDENT_ACCOUNT.role,
        organization: 'Présidence de la République'
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Utilisateur non créé');
    }

    console.log(`   ✅ Utilisateur créé: ${authData.user.id}`);

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: PRESIDENT_ACCOUNT.email,
        full_name: PRESIDENT_ACCOUNT.fullName,
        phone: PRESIDENT_ACCOUNT.phone,
        organization: 'Présidence de la République',
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('   ⚠️  Erreur profil:', profileError.message);
    } else {
      console.log('   ✅ Profil créé');
    }

    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: authData.user.id,
        role: PRESIDENT_ACCOUNT.role
      });

    if (roleError) {
      console.error('   ⚠️  Erreur rôle:', roleError.message);
    } else {
      console.log('   ✅ Rôle assigné: admin');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ COMPTE PRÉSIDENT CRÉÉ AVEC SUCCÈS !');
    console.log('='.repeat(60));
    console.log('\n📋 Identifiants de connexion :');
    console.log(`   Téléphone : 24177888001`);
    console.log(`   PIN       : 111111`);
    console.log('\n📱 Pour vous connecter :');
    console.log('   1. Allez sur http://localhost:8080/auth');
    console.log('   2. Déconnectez-vous si connecté');
    console.log('   3. Entrez le numéro : 24177888001');
    console.log('   4. Entrez le PIN : 111111');
    console.log('   5. Vous serez redirigé vers /admin avec l\'interface hybride\n');

  } catch (error: any) {
    console.error('❌ Erreur lors de la création:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 NDJOBI - Vérification compte Président');
  console.log('='.repeat(60) + '\n');

  try {
    await verifyPresidentAccount();
    console.log('='.repeat(60));
    console.log('✅ VÉRIFICATION TERMINÉE\n');
  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}

export { verifyPresidentAccount, createPresidentAccount };

