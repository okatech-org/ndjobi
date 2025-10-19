import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDIwNjI2OCwiZXhwIjoyMDc1NzgyMjY4fQ.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k';

if (!supabaseUrl) {
  console.error('❌ URL Supabase manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Comptes à corriger selon la logique du diagramme
const accountsToFix = [
  {
    email: '24177888001@ndjobi.com',
    phone: '+24177888001',
    pin: '111111',
    fullName: 'Président de la République',
    role: 'admin', // Selon le diagramme: Président/Admin = Vue globale, Validation
    organization: 'Présidence de la République',
    fonction: 'Président / Administrateur',
    description: 'Vue globale, Validation (selon diagramme)'
  },
  {
    email: '24177888002@ndjobi.com',
    phone: '+24177888002',
    pin: '222222',
    fullName: 'Sous-Admin DGSS',
    role: 'sub_admin', // Sous-Admin = Vue sectorielle
    organization: 'DGSS (Direction Générale de la Sécurité d\'État)',
    fonction: 'Sous-Administrateur DGSS',
    description: 'Vue sectorielle DGSS'
  },
  {
    email: '24177888003@ndjobi.com',
    phone: '+24177888003',
    pin: '333333',
    fullName: 'Sous-Admin DGR',
    role: 'sub_admin', // Sous-Admin = Vue sectorielle
    organization: 'DGR (Direction Générale du Renseignement)',
    fonction: 'Sous-Administrateur DGR',
    description: 'Vue sectorielle DGR'
  }
];

async function fixAdminAccounts() {
  console.log('🔧 CORRECTION DES COMPTES ADMIN SELON LA LOGIQUE DU DIAGRAMME');
  console.log('=============================================================');
  console.log('');
  console.log('📋 LOGIQUE IMPLÉMENTÉE:');
  console.log('   • Super Admin: Contrôle total (rôle système)');
  console.log('   • Président/Admin: Vue globale, Validation');
  console.log('   • Sous-Admin: Vue sectorielle');
  console.log('');

  for (const account of accountsToFix) {
    console.log(`🔧 Correction du compte: ${account.fullName}`);
    console.log(`   📧 Email: ${account.email}`);
    console.log(`   📱 Téléphone: ${account.phone}`);
    console.log(`   🔐 PIN: ${account.pin}`);
    console.log(`   🔑 Rôle: ${account.role}`);
    console.log(`   📝 Description: ${account.description}`);
    console.log('');

    try {
      // 1. Vérifier si l'utilisateur existe dans auth.users
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error(`❌ Erreur récupération utilisateurs:`, usersError.message);
        continue;
      }

      const existingUser = users.users.find(u => u.email === account.email);
      
      if (!existingUser) {
        console.log(`⚠️  Utilisateur ${account.email} non trouvé dans auth.users`);
        console.log(`   Création du compte...`);
        
        // Créer l'utilisateur
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: account.email,
          phone: account.phone,
          password: account.pin,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            full_name: account.fullName,
            phone: account.phone,
            role: account.role,
            organization: account.organization,
            fonction: account.fonction
          }
        });

        if (createError) {
          console.error(`❌ Erreur création utilisateur:`, createError.message);
          continue;
        }

        console.log(`✅ Utilisateur créé: ${newUser.user.id}`);
      } else {
        console.log(`✅ Utilisateur existant trouvé: ${existingUser.id}`);
      }

      const userId = existingUser?.id || newUser?.user.id;

      // 2. Mettre à jour le profil
      console.log(`📝 Mise à jour du profil...`);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: account.email,
          full_name: account.fullName,
          phone: account.phone,
          organization: account.organization,
          fonction: account.fonction,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Erreur profil:`, profileError.message);
        continue;
      }

      console.log(`✅ Profil mis à jour: ${profileData.id}`);

      // 3. Mettre à jour le rôle selon la logique
      console.log(`🔑 Mise à jour du rôle: ${account.role}`);
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: account.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (roleError) {
        console.error(`❌ Erreur rôle:`, roleError.message);
        continue;
      }

      console.log(`✅ Rôle mis à jour: ${roleData.role}`);

      // 4. Mettre à jour le PIN
      console.log(`🔐 Mise à jour du PIN...`);
      const { data: pinData, error: pinError } = await supabase
        .from('user_pins')
        .upsert({
          user_id: userId,
          pin: account.pin,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (pinError) {
        console.error(`❌ Erreur PIN:`, pinError.message);
        continue;
      }

      console.log(`✅ PIN mis à jour`);

      console.log(`🎉 Compte ${account.fullName} corrigé avec succès !`);
      console.log('');

    } catch (error) {
      console.error(`❌ Erreur générale pour ${account.fullName}:`, error.message);
      console.log('');
    }
  }

  console.log('🧪 TESTS DE CONNEXION RECOMMANDÉS:');
  console.log('===================================');
  console.log('');
  console.log('1. Président (Vue globale, Validation):');
  console.log('   • Téléphone: +24177888001');
  console.log('   • PIN: 111111');
  console.log('   • Dashboard: /dashboard/admin');
  console.log('   • Privilèges: Vue nationale, validation cas critiques');
  console.log('');
  console.log('2. Sous-Admin DGSS (Vue sectorielle):');
  console.log('   • Téléphone: +24177888002');
  console.log('   • PIN: 222222');
  console.log('   • Dashboard: /dashboard/admin');
  console.log('   • Privilèges: Vue sectorielle sécurité d\'État');
  console.log('');
  console.log('3. Sous-Admin DGR (Vue sectorielle):');
  console.log('   • Téléphone: +24177888003');
  console.log('   • PIN: 333333');
  console.log('   • Dashboard: /dashboard/admin');
  console.log('   • Privilèges: Vue sectorielle renseignement');
  console.log('');
  console.log('📊 HIÉRARCHIE CORRIGÉE SELON LE DIAGRAMME:');
  console.log('==========================================');
  console.log('🔴 Super Admin: Contrôle total (rôle système)');
  console.log('🟠 Président/Admin: Vue globale, Validation');
  console.log('🟡 Sous-Admin: Vue sectorielle');
  console.log('🟢 Agent: Traitement terrain');
  console.log('🔵 User: Signalement');
}

// Exécuter le script
fixAdminAccounts();
