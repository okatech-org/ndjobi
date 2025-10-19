/**
 * NDJOBI - SCRIPT DE DIAGNOSTIC DE LA SIMULATION
 * 
 * Ce script effectue un diagnostic complet de la configuration :
 * - Vérification connexion Supabase
 * - Vérification fichiers de données
 * - Vérification variables d'environnement
 * - Vérification structure base de données
 * - Recommandations pour résoudre les problèmes
 * 
 * Usage: node scripts/diagnostic-simulation.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    title: '\x1b[1m\x1b[35m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

// ============================================================================
// TESTS DE DIAGNOSTIC
// ============================================================================

async function checkEnvironmentVariables() {
  log('\n📋 1. VÉRIFICATION VARIABLES D\'ENVIRONNEMENT', 'title');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'title');

  const checks = [
    { name: 'VITE_SUPABASE_URL', value: SUPABASE_URL, required: true },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: SUPABASE_SERVICE_KEY, required: true },
  ];

  let allGood = true;

  checks.forEach(check => {
    if (check.required && !check.value) {
      log(`❌ ${check.name}: MANQUANTE`, 'error');
      allGood = false;
    } else if (check.value && check.value !== 'YOUR_SERVICE_KEY' && check.value !== 'YOUR_SUPABASE_URL') {
      log(`✅ ${check.name}: Configurée`, 'success');
    } else {
      log(`⚠️  ${check.name}: Valeur par défaut (à configurer)`, 'warning');
      allGood = false;
    }
  });

  if (!allGood) {
    log('\n💡 Solution:', 'warning');
    log('   1. Créez le fichier .env.local à la racine', 'info');
    log('   2. Ajoutez les variables manquantes', 'info');
    log('   3. Voir: CONFIGURATION-ENV.md', 'info');
  }

  return allGood;
}

async function checkDataFiles() {
  log('\n📁 2. VÉRIFICATION FICHIERS DE DONNÉES', 'title');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'title');

  const dataPath = path.join(__dirname, 'data');
  const requiredFiles = [
    'ndjobi-signalements-dataset.json',
    'ndjobi-users-dataset.json',
    'ndjobi-articles-presse.json',
    'ndjobi-ia-config.json'
  ];

  let allGood = true;

  // Vérifier que le dossier data existe
  if (!fs.existsSync(dataPath)) {
    log('❌ Dossier scripts/data/ introuvable', 'error');
    log('\n💡 Solution:', 'warning');
    log('   mkdir -p scripts/data', 'info');
    return false;
  }

  // Vérifier chaque fichier
  requiredFiles.forEach(file => {
    const filePath = path.join(dataPath, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      log(`✅ ${file.padEnd(40)} (${sizeKB} KB)`, 'success');
    } else {
      log(`❌ ${file.padEnd(40)} MANQUANT`, 'error');
      allGood = false;
    }
  });

  if (!allGood) {
    log('\n💡 Solution:', 'warning');
    log('   1. Copiez les fichiers JSON dans scripts/data/', 'info');
    log('   2. Voir: ETAPES-SUIVANTES.md', 'info');
  }

  return allGood;
}

async function checkSupabaseConnection() {
  log('\n🔌 3. VÉRIFICATION CONNEXION SUPABASE', 'title');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'title');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || 
      SUPABASE_SERVICE_KEY === 'YOUR_SERVICE_KEY') {
    log('❌ Variables d\'environnement non configurées', 'error');
    log('\n💡 Solution:', 'warning');
    log('   Configurez .env.local avec les bonnes clés', 'info');
    return false;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      log(`❌ Connexion échouée: ${error.message}`, 'error');
      
      if (error.message.includes('Invalid API key')) {
        log('\n💡 Solution:', 'warning');
        log('   1. Vérifiez que vous avez copié la "service_role" key', 'info');
        log('   2. PAS la clé "anon"', 'info');
        log('   3. Supabase → Settings → API', 'info');
      } else if (error.message.includes('relation') || error.message.includes('table')) {
        log('\n💡 Solution:', 'warning');
        log('   1. Exécutez d\'abord le script SQL d\'initialisation', 'info');
        log('   2. Fichier: scripts/sql/ndjobi-init-database.sql', 'info');
        log('   3. Via: Supabase SQL Editor', 'info');
      }
      
      return false;
    }

    log('✅ Connexion Supabase: OK', 'success');
    return true;

  } catch (err) {
    log(`❌ Erreur: ${err.message}`, 'error');
    return false;
  }
}

async function checkDatabaseTables() {
  log('\n🗄️  4. VÉRIFICATION TABLES BASE DE DONNÉES', 'title');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'title');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    log('⏭️  Étape ignorée (variables env non configurées)', 'warning');
    return false;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const tables = [
    'profiles',
    'user_roles',
    'signalements',
    'preuves',
    'investigations',
    'notifications',
    'audit_logs',
    'statistiques_cache'
  ];

  let allGood = true;

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      log(`❌ Table "${table}": ${error.message}`, 'error');
      allGood = false;
    } else {
      log(`✅ Table "${table}": OK`, 'success');
    }
  }

  if (!allGood) {
    log('\n💡 Solution:', 'warning');
    log('   1. Exécutez le script SQL d\'initialisation', 'info');
    log('   2. Fichier: scripts/sql/ndjobi-init-database.sql', 'info');
    log('   3. Via: Supabase Dashboard → SQL Editor', 'info');
  }

  return allGood;
}

async function checkImportStatus() {
  log('\n📊 5. VÉRIFICATION DONNÉES IMPORTÉES', 'title');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'title');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    log('⏭️  Étape ignorée (variables env non configurées)', 'warning');
    return false;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Compter les profils
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Compter les signalements
    const { count: signalementCount } = await supabase
      .from('signalements')
      .select('*', { count: 'exact', head: true });

    // Compter les admins
    const { count: adminCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['super_admin', 'admin', 'agent']);

    log(`   Profils utilisateurs: ${profileCount || 0}`, 'info');
    log(`   Comptes admin/agent: ${adminCount || 0}`, 'info');
    log(`   Signalements: ${signalementCount || 0}`, 'info');

    if (profileCount === 0 && signalementCount === 0) {
      log('\n⚠️  Aucune donnée importée', 'warning');
      log('\n💡 Solution:', 'warning');
      log('   1. Exécutez: npm run simulation:import', 'info');
      log('   2. OU: node scripts/import-simulation-data.js', 'info');
      return false;
    } else if (signalementCount < 250) {
      log('\n⚠️  Import partiel (attendu: ~300 signalements)', 'warning');
      return false;
    } else {
      log('\n✅ Données importées avec succès !', 'success');
      return true;
    }

  } catch (err) {
    log(`❌ Erreur: ${err.message}`, 'error');
    return false;
  }
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function main() {
  console.clear();
  log('╔══════════════════════════════════════════════════════════════╗', 'title');
  log('║          NDJOBI - DIAGNOSTIC DE LA SIMULATION                ║', 'title');
  log('║           Vérification complète de la configuration          ║', 'title');
  log('╚══════════════════════════════════════════════════════════════╝', 'title');

  const results = {
    env: await checkEnvironmentVariables(),
    files: await checkDataFiles(),
    connection: await checkSupabaseConnection(),
    tables: await checkDatabaseTables(),
    import: await checkImportStatus(),
  };

  // Résumé final
  log('\n╔══════════════════════════════════════════════════════════════╗', 'title');
  log('║                      RÉSUMÉ DU DIAGNOSTIC                    ║', 'title');
  log('╚══════════════════════════════════════════════════════════════╝', 'title');

  const checks = [
    { name: 'Variables d\'environnement', status: results.env, priority: 'high' },
    { name: 'Fichiers de données', status: results.files, priority: 'high' },
    { name: 'Connexion Supabase', status: results.connection, priority: 'high' },
    { name: 'Tables base de données', status: results.tables, priority: 'high' },
    { name: 'Import des données', status: results.import, priority: 'medium' },
  ];

  let criticalIssues = 0;
  let warnings = 0;

  checks.forEach(check => {
    const icon = check.status ? '✅' : (check.priority === 'high' ? '❌' : '⚠️');
    const color = check.status ? 'success' : (check.priority === 'high' ? 'error' : 'warning');
    log(`${icon} ${check.name.padEnd(35)} : ${check.status ? 'OK' : 'PROBLÈME'}`, color);
    
    if (!check.status) {
      if (check.priority === 'high') criticalIssues++;
      else warnings++;
    }
  });

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'title');

  if (criticalIssues === 0 && warnings === 0) {
    log('🎉 TOUT EST PARFAIT !', 'success');
    log('\n✅ Votre simulation NDJOBI est prête.', 'success');
    log('\n🚀 PROCHAINES ÉTAPES:', 'info');
    log('   1. npm run dev                    → Lancer l\'application', 'info');
    log('   2. http://localhost:5173          → Ouvrir dans le navigateur', 'info');
    log('   3. Login: president@ndjobi.ga     → Tester le dashboard', 'info');
    log('   4. Password: Admin2025Secure!     → Mot de passe', 'info');
    
  } else if (criticalIssues > 0) {
    log('❌ PROBLÈMES CRITIQUES DÉTECTÉS', 'error');
    log(`\n🔴 ${criticalIssues} problème(s) critique(s) doivent être résolus`, 'error');
    if (warnings > 0) {
      log(`🟡 ${warnings} avertissement(s)`, 'warning');
    }
    log('\n📚 CONSULTEZ LES SOLUTIONS CI-DESSUS', 'info');
    log('📖 Guide complet: ETAPES-SUIVANTES.md', 'info');
    
  } else {
    log('⚠️  AVERTISSEMENTS', 'warning');
    log(`\n🟡 ${warnings} avertissement(s) - La simulation peut fonctionner partiellement`, 'warning');
    log('\n📚 Consultez les recommandations ci-dessus', 'info');
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'title');

  // Instructions selon le statut
  if (criticalIssues > 0) {
    log('🔧 ACTIONS À EFFECTUER:', 'warning');
    if (!results.env) {
      log('   1. Créer .env.local avec les clés Supabase', 'info');
    }
    if (!results.tables) {
      log('   2. Exécuter le script SQL d\'initialisation', 'info');
    }
    if (!results.import) {
      log('   3. Exécuter npm run simulation:import', 'info');
    }
  }

  log('');
}

// Exécuter le diagnostic
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { checkEnvironmentVariables, checkDataFiles, checkSupabaseConnection };
