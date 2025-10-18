#!/usr/bin/env ts-node
/**
 * Script de création des comptes de production NDJOBI
 * Hiérarchie complète : Super Admin → Admin → Sous-Admins → Agents → Users
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant. Veuillez le fournir.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface ProductionAccount {
  phone: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'agent' | 'user';
  fullName: string;
  metadata?: {
    department?: string;
    sector?: string;
    permissions?: string[];
  };
}

const PRODUCTION_ACCOUNTS: ProductionAccount[] = [
  {
    phone: '+33661002616',
    email: '33661002616@ndjobi.com',
    password: '999999',
    role: 'super_admin',
    fullName: 'Super Admin',
    metadata: {
      permissions: ['all', 'impersonation', 'system_monitoring', 'technical_control']
    }
  },
  {
    phone: '+24177888001',
    email: '24177888001@ndjobi.com',
    password: '111111',
    role: 'admin',
    fullName: 'Président - Administrateur Principal',
    metadata: {
      permissions: ['global_supervision', 'validation', 'strategic_oversight']
    }
  },
  {
    phone: '+24177888002',
    email: '24177888002@ndjobi.com',
    password: '222222',
    role: 'admin',
    fullName: 'Sous-Admin DGSS',
    metadata: {
      sector: 'DGSS',
      permissions: ['sector_view', 'agent_supervision', 'strategic_relay']
    }
  },
  {
    phone: '+24177888003',
    email: '24177888003@ndjobi.com',
    password: '333333',
    role: 'admin',
    fullName: 'Sous-Admin DGR',
    metadata: {
      sector: 'DGR',
      permissions: ['sector_view', 'agent_supervision', 'strategic_relay']
    }
  },
  {
    phone: '+24177888004',
    email: '24177888004@ndjobi.com',
    password: '444444',
    role: 'agent',
    fullName: 'Agent Défense',
    metadata: {
      department: 'defense',
      permissions: ['investigation', 'assigned_cases', 'field_operations']
    }
  },
  {
    phone: '+24177888005',
    email: '24177888005@ndjobi.com',
    password: '555555',
    role: 'agent',
    fullName: 'Agent Justice',
    metadata: {
      department: 'justice',
      permissions: ['investigation', 'assigned_cases', 'legal_operations']
    }
  },
  {
    phone: '+24177888006',
    email: '24177888006@ndjobi.com',
    password: '666666',
    role: 'agent',
    fullName: 'Agent Lutte Anti-Corruption',
    metadata: {
      department: 'anti_corruption',
      permissions: ['investigation', 'assigned_cases', 'corruption_tracking']
    }
  },
  {
    phone: '+24177888007',
    email: '24177888007@ndjobi.com',
    password: '777777',
    role: 'agent',
    fullName: 'Agent Intérieur',
    metadata: {
      department: 'interior',
      permissions: ['investigation', 'assigned_cases', 'internal_security']
    }
  },
  {
    phone: '+24177888008',
    email: '24177888008@ndjobi.com',
    password: '888888',
    role: 'user',
    fullName: 'Citoyen Utilisateur',
    metadata: {
      permissions: ['submit_reports', 'track_reports', 'view_statistics']
    }
  },
  {
    phone: '+24177888009',
    email: '24177888009@ndjobi.com',
    password: '999999',
    role: 'user',
    fullName: 'Utilisateur Anonyme',
    metadata: {
      permissions: ['submit_anonymous_reports']
    }
  }
];

async function createProductionAccount(account: ProductionAccount): Promise<void> {
  console.log(`\n📱 Création : ${account.fullName} (${account.role})`);
  console.log(`   Tel: ${account.phone}`);
  
  try {
    // 1. Créer l'utilisateur avec Supabase Admin
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      phone: account.phone,
      phone_confirm: true,
      user_metadata: {
        full_name: account.fullName,
        phone: account.phone,
        role: account.role,
        ...account.metadata
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`   ⚠️  Utilisateur existe déjà, mise à jour...`);
        
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === account.email || u.phone === account.phone);
        
        if (!existingUser) {
          throw new Error('Impossible de récupérer l\'utilisateur existant');
        }

        await updateUserProfile(existingUser.id, account);
        console.log(`   ✅ Compte mis à jour`);
        return;
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Utilisateur non créé');
    }

    console.log(`   ✅ Utilisateur créé: ${authData.user.id}`);
    await updateUserProfile(authData.user.id, account);

  } catch (error: any) {
    console.error(`   ❌ Erreur:`, error.message);
    throw error;
  }
}

async function updateUserProfile(userId: string, account: ProductionAccount): Promise<void> {
  // Créer/mettre à jour le profil
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: account.email,
      full_name: account.fullName,
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('   ⚠️  Erreur profil:', profileError.message);
  } else {
    console.log(`   ✅ Profil créé`);
  }

  // Assigner le rôle
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

async function verifyAccounts(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 RÉCAPITULATIF DES COMPTES CRÉÉS');
  console.log('='.repeat(60) + '\n');
  
  for (const account of PRODUCTION_ACCOUNTS) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', account.email)
        .single();

      if (profile) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id)
          .single();

        console.log(`✅ ${account.fullName}`);
        console.log(`   Téléphone: ${account.phone}`);
        console.log(`   PIN: ${account.password}`);
        console.log(`   Rôle: ${roleData?.role || 'NON ASSIGNÉ'}`);
        if (account.metadata?.department) {
          console.log(`   Ministère: ${account.metadata.department}`);
        }
        if (account.metadata?.sector) {
          console.log(`   Secteur: ${account.metadata.sector}`);
        }
        console.log('');
      }
    } catch (error: any) {
      console.error(`❌ ${account.fullName}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 NDJOBI - Création des comptes de production');
  console.log('='.repeat(60));
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log('='.repeat(60) + '\n');

  try {
    // Créer tous les comptes
    for (const account of PRODUCTION_ACCOUNTS) {
      await createProductionAccount(account);
    }

    // Vérifier les comptes
    await verifyAccounts();

    console.log('='.repeat(60));
    console.log('✅ SETUP TERMINÉ AVEC SUCCÈS!');
    console.log('='.repeat(60));
    console.log('\n📋 Hiérarchie des comptes:');
    console.log('   1. Super Admin     : +33 6 61 00 26 16 / PIN: 999999');
    console.log('   2. Admin Principal : +241 77 888 001   / PIN: 111111');
    console.log('   3. Sous-Admin DGSS : +241 77 888 002   / PIN: 222222');
    console.log('   4. Sous-Admin DGR  : +241 77 888 003   / PIN: 333333');
    console.log('   5. Agent Défense   : +241 77 888 004   / PIN: 444444');
    console.log('   6. Agent Justice   : +241 77 888 005   / PIN: 555555');
    console.log('   7. Agent LAC       : +241 77 888 006   / PIN: 666666');
    console.log('   8. Agent Intérieur : +241 77 888 007   / PIN: 777777');
    console.log('   9. Citoyen         : +241 77 888 008   / PIN: 888888');
    console.log('  10. Anonyme         : +241 77 888 009   / PIN: 999999');
    console.log('\n🔐 Connexion: https://ndjobi.lovable.app/auth\n');

  } catch (error: any) {
    console.error('\n❌ Erreur lors du setup:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}

export { createProductionAccount, verifyAccounts };
