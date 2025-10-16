// Script pour créer le compte Super Admin avec le domaine ndjobi.com
// À exécuter dans la console du navigateur sur la page d'authentification

async function createSuperAdminAccount() {
  console.log('🔧 Création du compte Super Admin...');
  
  try {
    // Importer Supabase (doit être disponible sur la page)
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase non disponible. Assurez-vous d\'être sur la page d\'authentification.');
      return;
    }

    const email = '24177777000@ndjobi.com';
    const password = '123456';
    const phoneNumber = '+24177777000';
    
    console.log('📧 Création du compte:', email);
    
    // 1. Créer le compte utilisateur
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: 'Super Administrateur',
          phone: phoneNumber,
          is_super_admin: true
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ Le compte existe déjà, tentative de connexion...');
        
        // Tenter de se connecter
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (signInError) {
          console.error('❌ Erreur de connexion:', signInError.message);
          return;
        }
        
        console.log('✅ Connexion réussie:', signInData.user.email);
        
        // Vérifier le rôle
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', signInData.user.id)
          .single();
          
        if (roleError || !roleData) {
          console.log('🔧 Ajout du rôle super_admin...');
          
          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: signInData.user.id,
              role: 'super_admin'
            });
            
          if (insertRoleError) {
            console.error('❌ Erreur lors de l\'ajout du rôle:', insertRoleError.message);
          } else {
            console.log('✅ Rôle super_admin ajouté avec succès');
          }
        } else {
          console.log('✅ Rôle existant:', roleData.role);
        }
        
        return;
      } else {
        console.error('❌ Erreur lors de la création:', signUpError.message);
        return;
      }
    }

    if (!signUpData.user) {
      console.error('❌ Aucun utilisateur créé');
      return;
    }

    console.log('✅ Compte créé:', signUpData.user.email);
    
    // 2. Ajouter le rôle super_admin
    console.log('🔧 Ajout du rôle super_admin...');
    
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: signUpData.user.id,
        role: 'super_admin'
      });

    if (roleError) {
      console.error('❌ Erreur lors de l\'ajout du rôle:', roleError.message);
    } else {
      console.log('✅ Rôle super_admin ajouté avec succès');
    }

    console.log('🎉 Compte Super Admin prêt !');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('🔐 Code d\'authentification: 011282*');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la fonction
createSuperAdminAccount();
