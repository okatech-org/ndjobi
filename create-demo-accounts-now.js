/**
 * Script pour créer tous les comptes démo via l'API Supabase
 * Utilise les credentials fournis
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Comptes démo à créer
const DEMO_ACCOUNTS = [
  {
    email: '24177888001@ndjobi.com',
    phone: '+24177888001',
    pin: '111111',
    full_name: 'Président / Administrateur',
    organization: 'Présidence de la République',
    role: 'admin'
  },
  {
    email: '24177888002@ndjobi.com',
    phone: '+24177888002',
    pin: '222222',
    full_name: 'Sous-Admin DGSS',
    organization: 'Direction Générale de la Sécurité des Systèmes d\'Information',
    role: 'sub_admin'
  },
  {
    email: '24177888003@ndjobi.com',
    phone: '+24177888003',
    pin: '333333',
    full_name: 'Sous-Admin DGR',
    organization: 'Direction Générale des Renseignements',
    role: 'sub_admin'
  },
  {
    email: '24177888004@ndjobi.com',
    phone: '+24177888004',
    pin: '444444',
    full_name: 'Agent Défense',
    organization: 'Ministère de la Défense',
    role: 'agent'
  },
  {
    email: '24177888005@ndjobi.com',
    phone: '+24177888005',
    pin: '555555',
    full_name: 'Agent Justice',
    organization: 'Ministère de la Justice',
    role: 'agent'
  },
  {
    email: '24177888006@ndjobi.com',
    phone: '+24177888006',
    pin: '666666',
    full_name: 'Agent Anti-Corruption',
    organization: 'Commission de Lutte Anti-Corruption',
    role: 'agent'
  },
  {
    email: '24177888007@ndjobi.com',
    phone: '+24177888007',
    pin: '777777',
    full_name: 'Agent Intérieur',
    organization: 'Ministère de l\'Intérieur',
    role: 'agent'
  },
  {
    email: '24177888008@ndjobi.com',
    phone: '+24177888008',
    pin: '888888',
    full_name: 'Citoyen Démo',
    organization: 'Citoyen',
    role: 'user'
  },
  {
    email: '24177888009@ndjobi.com',
    phone: '+24177888009',
    pin: '999999',
    full_name: 'Citoyen Anonyme',
    organization: 'Anonyme',
    role: 'user'
  }
];

async function createDemoAccounts() {
  console.log('🚀 Création des comptes démo...');
  console.log('=====================================');

  let successCount = 0;
  let errorCount = 0;

  for (const account of DEMO_ACCOUNTS) {
    try {
      console.log(`\n📝 Création du compte: ${account.email}`);

      // 1. Créer l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        phone: account.phone,
        password: account.pin,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          full_name: account.full_name,
          phone: account.phone,
          organization: account.organization
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  Compte ${account.email} existe déjà`);
          // Continuer avec la création du profil et du rôle
          const { data: existingUser } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', account.email)
            .single();
          
          if (existingUser) {
            await createProfileAndRole(existingUser.id, account);
            successCount++;
          }
        } else {
          throw authError;
        }
      } else {
        // 2. Créer le profil et le rôle
        await createProfileAndRole(authData.user.id, account);
        successCount++;
        console.log(`✅ Compte ${account.email} créé avec succès`);
      }

    } catch (error) {
      console.error(`❌ Erreur pour ${account.email}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Résumé:');
  console.log(`✅ Comptes créés: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📋 Total: ${DEMO_ACCOUNTS.length}`);

  if (successCount > 0) {
    console.log('\n🎉 Comptes démo créés avec succès !');
    console.log('Vous pouvez maintenant tester la page démo du Super Admin.');
  }
}

async function createProfileAndRole(userId, account) {
  // Créer le profil dans public.profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: account.email,
      full_name: account.full_name,
      phone: account.phone,
      organization: account.organization,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (profileError) {
    console.error(`❌ Erreur profil pour ${account.email}:`, profileError.message);
    throw profileError;
  }

  // Créer le rôle dans public.user_roles
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: account.role,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (roleError) {
    console.error(`❌ Erreur rôle pour ${account.email}:`, roleError.message);
    throw roleError;
  }

  console.log(`✅ Profil et rôle créés pour ${account.email}`);
}

// Exécuter le script
createDemoAccounts().catch(console.error);
