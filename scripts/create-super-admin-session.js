/**
 * Script Helper - Créer une session Super Admin
 * 
 * Usage: Ouvrir la console du navigateur sur http://localhost:8080
 * et coller ce code pour créer une session Super Admin instantanément
 */

// Créer la session Super Admin
const createSuperAdminSession = () => {
  const sessionData = {
    isSuperAdmin: true,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
  };

  localStorage.setItem('ndjobi_super_admin_session', JSON.stringify(sessionData));
  
  console.log('✅ Session Super Admin créée !');
  console.log('📅 Expire dans: 24 heures');
  console.log('🔄 Rechargez la page pour accéder au dashboard');
  console.log('');
  console.log('🎯 Dashboard: /dashboard/super-admin');
  console.log('👁️ Volet Visibilité: /dashboard/super-admin?view=visibilite');
  
  return sessionData;
};

// Créer la session
const session = createSuperAdminSession();

// Proposer de recharger la page
if (confirm('Session Super Admin créée ! Recharger la page maintenant ?')) {
  window.location.href = '/dashboard/super-admin';
}

