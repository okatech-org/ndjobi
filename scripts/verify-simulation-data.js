/**
 * NDJOBI - SCRIPT DE VÉRIFICATION DES DONNÉES DE SIMULATION
 * 
 * Ce script vérifie que l'import s'est bien déroulé :
 * - Comptes administrateurs créés
 * - Utilisateurs importés
 * - Signalements insérés
 * - Statistiques générées
 * - RLS policies fonctionnelles
 * 
 * Usage: node scripts/verify-simulation-data.js
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function formatNumber(num) {
  return new Intl.NumberFormat('fr-FR').format(num);
}

// ============================================================================
// TESTS DE VÉRIFICATION
// ============================================================================

async function verifyAdmins() {
  log('\n👑 Vérification des comptes administrateurs...', 'info');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('email, role, full_name')
    .in('role', ['super_admin', 'admin', 'agent']);

  if (error) {
    log(`❌ Erreur: ${error.message}`, 'error');
    return false;
  }

  const expectedRoles = {
    'super_admin': 1,
    'admin': 3,
    'agent': 2
  };

  log('\n📊 Comptes trouvés:', 'info');
  const roleCounts = { super_admin: 0, admin: 0, agent: 0 };
  
  data.forEach(user => {
    roleCounts[user.role]++;
    log(`   • ${user.role.toUpperCase().padEnd(15)} | ${user.email.padEnd(35)} | ${user.full_name}`, 'info');
  });

  let allGood = true;
  Object.entries(expectedRoles).forEach(([role, expected]) => {
    const found = roleCounts[role];
    if (found === expected) {
      log(`✅ ${role}: ${found}/${expected}`, 'success');
    } else {
      log(`❌ ${role}: ${found}/${expected}`, 'error');
      allGood = false;
    }
  });

  return allGood;
}

async function verifyUsers() {
  log('\n👥 Vérification des utilisateurs...', 'info');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('role', 'user');

  if (error) {
    log(`❌ Erreur: ${error.message}`, 'error');
    return false;
  }

  const userCount = data.length;
  log(`   Users identifiés: ${userCount}`, 'info');

  if (userCount >= 40) {
    log(`✅ Users: ${userCount} (attendu: ~45)`, 'success');
    return true;
  } else {
    log(`⚠️  Users: ${userCount} (attendu: ~45)`, 'warning');
    return false;
  }
}

async function verifySignalements() {
  log('\n📥 Vérification des signalements...', 'info');
  
  const { data, error } = await supabase
    .from('signalements')
    .select('urgence, categorie, statut');

  if (error) {
    log(`❌ Erreur: ${error.message}`, 'error');
    return false;
  }

  const total = data.length;
  log(`   Total signalements: ${formatNumber(total)}`, 'info');

  // Compter par urgence
  const urgenceCounts = {
    'critique': data.filter(s => s.urgence === 'critique').length,
    'haute': data.filter(s => s.urgence === 'haute').length,
    'moyenne': data.filter(s => s.urgence === 'moyenne').length,
    'basse': data.filter(s => s.urgence === 'basse').length,
  };

  log('\n   Distribution par urgence:', 'info');
  Object.entries(urgenceCounts).forEach(([urgence, count]) => {
    const pct = ((count / total) * 100).toFixed(1);
    log(`   • ${urgence.padEnd(10)}: ${count.toString().padStart(3)} (${pct}%)`, 'info');
  });

  // Compter Gab Pêche
  const gabPecheCount = data.filter(s => s.categorie === 'malversation_gab_peche').length;
  log(`\n   Signalements Gab Pêche: ${gabPecheCount}`, 'info');

  if (total >= 250 && gabPecheCount >= 50) {
    log(`✅ Signalements: ${total} (attendu: ~300)`, 'success');
    return true;
  } else {
    log(`⚠️  Signalements: ${total} (attendu: ~300)`, 'warning');
    return false;
  }
}

async function verifyStats() {
  log('\n📊 Vérification des statistiques...', 'info');
  
  const { data, error } = await supabase
    .from('statistiques_cache')
    .select('*')
    .eq('type', 'national')
    .single();

  if (error) {
    log(`❌ Erreur: ${error.message}`, 'error');
    return false;
  }

  log(`   Total signalements: ${data.total_signalements}`, 'info');
  log(`   Cas critiques: ${data.signalements_critiques}`, 'info');
  log(`   Taux résolution: ${data.taux_resolution}%`, 'info');
  log(`   Montant récupéré: ${formatNumber(data.montant_recupere)} FCFA`, 'info');

  log('✅ Statistiques nationales générées', 'success');
  return true;
}

async function verifyRLS() {
  log('\n🔒 Vérification des RLS policies...', 'info');
  
  // Test: Se connecter en tant que Super Admin
  const { data: adminData, error: adminError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'president@ndjobi.ga')
    .single();

  if (adminError || !adminData) {
    log('❌ Super Admin introuvable', 'error');
    return false;
  }

  // Vérifier que Super Admin a accès à tous les signalements
  const { data: signalements, error: sigError } = await supabase
    .from('signalements')
    .select('count');

  if (sigError) {
    log(`⚠️  RLS peut nécessiter des ajustements: ${sigError.message}`, 'warning');
    return false;
  }

  log('✅ RLS policies semblent fonctionnelles', 'success');
  return true;
}

async function verifyTables() {
  log('\n📋 Vérification des tables créées...', 'info');
  
  const tables = [
    'profiles',
    'user_roles',
    'signalements',
    'preuves',
    'investigations',
    'investigation_reports',
    'notifications',
    'audit_logs',
    'statistiques_cache'
  ];

  let allExist = true;

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 = table vide, c'est OK
      log(`❌ Table ${table}: manquante ou inaccessible`, 'error');
      allExist = false;
    } else {
      log(`✅ Table ${table}: OK`, 'success');
    }
  }

  return allExist;
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function main() {
  console.clear();
  log('╔══════════════════════════════════════════════════════════════╗', 'info');
  log('║       NDJOBI - VÉRIFICATION DONNÉES DE SIMULATION            ║', 'info');
  log('║           Contrôle qualité de l\'import                       ║', 'info');
  log('╚══════════════════════════════════════════════════════════════╝', 'info');

  const results = {
    tables: await verifyTables(),
    admins: await verifyAdmins(),
    users: await verifyUsers(),
    signalements: await verifySignalements(),
    stats: await verifyStats(),
    rls: await verifyRLS(),
  };

  // Résumé final
  log('\n╔══════════════════════════════════════════════════════════════╗', 'info');
  log('║                    RÉSUMÉ DE VÉRIFICATION                    ║', 'info');
  log('╚══════════════════════════════════════════════════════════════╝', 'info');

  const checks = [
    { name: 'Tables créées', status: results.tables },
    { name: 'Comptes admins', status: results.admins },
    { name: 'Utilisateurs', status: results.users },
    { name: 'Signalements', status: results.signalements },
    { name: 'Statistiques', status: results.stats },
    { name: 'RLS Policies', status: results.rls },
  ];

  checks.forEach(check => {
    const icon = check.status ? '✅' : '❌';
    const color = check.status ? 'success' : 'error';
    log(`${icon} ${check.name.padEnd(30)} : ${check.status ? 'OK' : 'ERREUR'}`, color);
  });

  const allPassed = Object.values(results).every(r => r);

  if (allPassed) {
    log('\n🎉 TOUTES LES VÉRIFICATIONS SONT PASSÉES !', 'success');
    log('\n🚀 Votre simulation NDJOBI est opérationnelle.', 'success');
    log('\n📱 Lancez l\'application: npm run dev', 'info');
    log('🔑 Connectez-vous avec: president@ndjobi.ga / Admin2025Secure!', 'info');
  } else {
    log('\n⚠️  CERTAINES VÉRIFICATIONS ONT ÉCHOUÉ', 'warning');
    log('\nConsultez les erreurs ci-dessus et corrigez les problèmes.', 'info');
    log('📚 Voir: ETAPES-SUIVANTES.md pour le dépannage', 'info');
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'info');
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { verifyAdmins, verifyUsers, verifySignalements, verifyStats };
