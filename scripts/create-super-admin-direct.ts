/**
 * Script pour créer le compte super admin avec téléphone +33661002616
 * Exécutable directement dans la console navigateur
 */

import { supabase } from '../src/integrations/supabase/client';

async function createSuperAdminPhone() {
  console.log('🔧 Création compte super admin avec téléphone...');
  
  try {
    // 1. Créer le compte avec auth.admin
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: '33661002616@ndjobi.com',
      password: '123456',
      email_confirm: true,
      phone: '+33661002616',
      phone_confirm: true,
      user_metadata: {
        phone: '+33661002616',
        full_name: 'Super Admin NDJOBI'
      }
    });

    if (userError) {
      console.error('❌ Erreur création user:', userError);
      return;
    }

    console.log('✅ User créé:', userData.user.id);

    // 2. Assigner le rôle super_admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: 'super_admin'
      });

    if (roleError) {
      console.error('❌ Erreur assignation rôle:', roleError);
      return;
    }

    console.log('✅ Rôle super_admin assigné');

    // 3. Créer le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: '33661002616@ndjobi.com',
        full_name: 'Super Admin NDJOBI'
      });

    if (profileError) {
      console.error('❌ Erreur création profil:', profileError);
      return;
    }

    console.log('✅ Profil créé');

    // 4. Vérification
    const { data: verif } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .single();

    console.log('');
    console.log('════════════════════════════════════════');
    console.log('✅ COMPTE SUPER ADMIN CRÉÉ AVEC SUCCÈS');
    console.log('════════════════════════════════════════');
    console.log('');
    console.log('📱 Téléphone : +33661002616');
    console.log('🔑 PIN      : 123456');
    console.log('✅ Code OTP : 123456 (dev mode)');
    console.log('👤 Rôle     :', verif?.role);
    console.log('');
    console.log('Vous pouvez maintenant vous connecter !');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exporter pour utilisation
export { createSuperAdminPhone };

// Si exécuté directement
if (typeof window !== 'undefined') {
  (window as any).createSuperAdminPhone = createSuperAdminPhone;
  console.log('');
  console.log('💡 Pour créer le compte, exécutez dans la console :');
  console.log('   createSuperAdminPhone()');
  console.log('');
}

