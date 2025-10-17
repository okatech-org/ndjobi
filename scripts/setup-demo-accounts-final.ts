#!/usr/bin/env ts-node
/**
 * Script de création des comptes démo NDJOBI
 * Utilise l'API Admin Supabase pour créer les utilisateurs
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (local ou prod)
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface DemoAccount {
  email: string;
  password: string;
  role: 'user' | 'agent' | 'admin';
  fullName: string;
  phone: string;
  description: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: '24177777001@ndjobi.com',
    password: '123456',
    role: 'user',
    fullName: 'Citoyen Démo',
    phone: '+24177777001',
    description: 'Compte démo pour un citoyen standard'
  },
  {
    email: '24177777002@ndjobi.com',
    password: '123456',
    role: 'agent',
    fullName: 'Agent DGSS Démo',
    phone: '+24177777002',
    description: 'Compte démo pour un agent de la DGSS'
  },
  {
    email: '24177777003@ndjobi.com',
    password: '123456',
    role: 'admin',
    fullName: 'Protocole d\'État - Président',
    phone: '+24177777003',
    description: 'Compte démo pour le Protocole d\'État (Président)'
  }
];

async function createDemoAccount(account: DemoAccount): Promise<void> {
  console.log(`\n📝 Création du compte: ${account.fullName} (${account.role})`);
  console.log(`   Email: ${account.email}`);
  
  try {
    // 1. Créer l'utilisateur avec Supabase Admin
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName,
        phone: account.phone,
        role: account.role
      }
    });

    if (authError) {
      // Si l'utilisateur existe déjà, on récupère son ID
      if (authError.message.includes('already registered')) {
        console.log(`   ⚠️  Utilisateur existe déjà, récupération...`);
        
        // Récupérer l'utilisateur existant
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === account.email);
        
        if (!existingUser) {
          throw new Error('Impossible de récupérer l\'utilisateur existant');
        }

        // Mettre à jour le profil
        await updateUserProfile(existingUser.id, account);
        console.log(`   ✅ Compte mis à jour avec succès`);
        return;
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Utilisateur non créé');
    }

    console.log(`   ✅ Utilisateur créé: ${authData.user.id}`);

    // 2. Créer ou mettre à jour le profil
    await updateUserProfile(authData.user.id, account);

  } catch (error) {
    console.error(`   ❌ Erreur:`, error);
    throw error;
  }
}

async function updateUserProfile(userId: string, account: DemoAccount): Promise<void> {
  // 2. Créer/mettre à jour le profil
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: account.email,
      full_name: account.fullName,
      phone: account.phone,
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('   ⚠️  Erreur profil:', profileError.message);
  } else {
    console.log(`   ✅ Profil créé/mis à jour`);
  }

  // 3. Assigner le rôle
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: account.role
    });

  if (roleError) {
    console.error('   ⚠️  Erreur rôle:', roleError.message);
  } else {
    console.log(`   ✅ Rôle assigné: ${account.role}`);
  }
}

async function createTestData(): Promise<void> {
  console.log('\n📊 Création des données de test...');
  
  try {
    // Récupérer les IDs des utilisateurs
    const { data: citoyenData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', '24177777001@ndjobi.com')
      .single();

    if (citoyenData) {
      // Créer un signalement de test
      const { error: signalementError } = await supabase
        .from('signalements')
        .insert({
          title: 'Signalement de test - Corruption administrative',
          description: 'Ceci est un signalement de démonstration pour tester le système NDJOBI. Les données sont fictives.',
          category: 'corruption',
          urgency: 'high',
          location: 'Libreville, Gabon',
          author_id: citoyenData.id,
          status: 'pending',
          is_anonymous: false
        });

      if (!signalementError) {
        console.log('   ✅ Signalement de test créé');
      }
    }

    // Créer un projet de test
    if (citoyenData) {
      const { error: projetError } = await supabase
        .from('projets')
        .insert({
          title: 'Projet de test - Innovation technologique',
          description: 'Projet de démonstration pour tester la protection blockchain.',
          category: 'technologie',
          author_id: citoyenData.id,
          status: 'pending',
          is_anonymous: false
        });

      if (!projetError) {
        console.log('   ✅ Projet de test créé');
      }
    }

  } catch (error) {
    console.error('   ⚠️  Erreur création données de test:', error);
  }
}

async function verifyAccounts(): Promise<void> {
  console.log('\n🔍 Vérification des comptes créés...\n');
  
  for (const account of DEMO_ACCOUNTS) {
    try {
      // Récupérer l'utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .eq('email', account.email)
        .single();

      if (profile) {
        // Récupérer le rôle
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id)
          .single();

        console.log(`✅ ${account.fullName}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Phone: ${profile.phone}`);
        console.log(`   Rôle: ${roleData?.role || 'NON ASSIGNÉ'}`);
        console.log(`   ID: ${profile.id}`);
        console.log('');
      } else {
        console.log(`❌ ${account.fullName} - NON TROUVÉ`);
      }
    } catch (error) {
      console.error(`❌ Erreur vérification ${account.email}:`, error);
    }
  }
}

async function main() {
  console.log('🚀 NDJOBI - Setup des comptes démo');
  console.log('=====================================');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // Créer les comptes
    for (const account of DEMO_ACCOUNTS) {
      await createDemoAccount(account);
    }

    // Créer les données de test
    await createTestData();

    // Vérifier les comptes
    await verifyAccounts();

    console.log('✅ Setup terminé avec succès!\n');
    console.log('📋 Identifiants des comptes démo:');
    console.log('=====================================');
    DEMO_ACCOUNTS.forEach(account => {
      console.log(`\n${account.fullName} (${account.role}):`);
      console.log(`  Email: ${account.email}`);
      console.log(`  Mot de passe: ${account.password}`);
    });
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du setup:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main().then(() => process.exit(0));
}

export { createDemoAccount, verifyAccounts };

