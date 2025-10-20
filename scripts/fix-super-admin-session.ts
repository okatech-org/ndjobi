// Script de diagnostic et correction de la session Super Admin

console.log('🔍 Diagnostic de la session Super Admin...\n');

// 1. Vérifier le localStorage
console.log('📦 Vérification du localStorage:');
const superAdminSession = localStorage.getItem('ndjobi_super_admin_session');
const demoSession = localStorage.getItem('ndjobi_demo_session');
const regularSession = sessionStorage.getItem('ndjobi_session');

console.log('- ndjobi_super_admin_session:', superAdminSession ? '✅ Existe' : '❌ Absente');
console.log('- ndjobi_demo_session:', demoSession ? '✅ Existe' : '❌ Absente');
console.log('- ndjobi_session (sessionStorage):', regularSession ? '✅ Existe' : '❌ Absente');

if (superAdminSession) {
  try {
    const parsed = JSON.parse(superAdminSession);
    console.log('\n📊 Contenu de la session super admin:');
    console.log('  - isSuperAdmin:', parsed.isSuperAdmin);
    console.log('  - role:', parsed.role);
    console.log('  - expiresAt:', new Date(parsed.expiresAt).toLocaleString());
    console.log('  - isExpired:', Date.now() > parsed.expiresAt ? '❌ OUI' : '✅ NON');
    console.log('  - user:', parsed.user);
  } catch (e) {
    console.log('  ❌ Erreur de parsing:', e);
  }
}

// 2. Nettoyer toutes les sessions
console.log('\n🧹 Nettoyage des sessions...');
localStorage.removeItem('ndjobi_super_admin_session');
localStorage.removeItem('ndjobi_demo_session');
localStorage.removeItem('ndjobi_session');
sessionStorage.clear();
console.log('✅ Sessions nettoyées');

// 3. Créer une nouvelle session super admin valide
console.log('\n🔧 Création d\'une nouvelle session super admin...');

const newSuperAdminSession = {
  isSuperAdmin: true,
  timestamp: Date.now(),
  expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
  user: {
    id: 'super-admin-local',
    email: '33661002616@ndjobi.com',
    phone: '+33661002616',
    user_metadata: {
      full_name: 'Super Administrateur',
      phone: '+33661002616',
    }
  },
  role: 'super_admin',
};

localStorage.setItem('ndjobi_super_admin_session', JSON.stringify(newSuperAdminSession));
console.log('✅ Session super admin créée');

// 4. Vérifier la nouvelle session
const verifySession = localStorage.getItem('ndjobi_super_admin_session');
if (verifySession) {
  try {
    const parsed = JSON.parse(verifySession);
    console.log('\n✅ Vérification de la nouvelle session:');
    console.log('  - Role:', parsed.role);
    console.log('  - Email:', parsed.user.email);
    console.log('  - Expire dans:', Math.round((parsed.expiresAt - Date.now()) / (1000 * 60 * 60)), 'heures');
    console.log('\n✨ Session super admin restaurée avec succès !');
    console.log('🔄 Rechargez la page pour vous connecter');
  } catch (e) {
    console.log('❌ Erreur de vérification:', e);
  }
} else {
  console.log('❌ Impossible de créer la session');
}

export {};

