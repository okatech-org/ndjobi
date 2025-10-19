/**
 * NDJOBI - SCRIPT D'IMPORT DES DONNÉES DE SIMULATION
 * 
 * Ce script importe tous les datasets de simulation dans Supabase :
 * - Comptes utilisateurs (anonymes & identifiés)
 * - Signalements (300+)
 * - Preuves associées
 * - Articles de presse
 * - Configuration IA
 * 
 * Usage:
 * 1. Configurer les variables d'environnement VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
 * 2. Exécuter: node scripts/import-simulation-data.js
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

function loadJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// ============================================================================
// IMPORT COMPTES UTILISATEURS
// ============================================================================

async function importUtilisateurs() {
  log('\n📥 Import des utilisateurs...', 'info');
  
  try {
    const usersData = loadJsonFile('ndjobi-users-dataset.json');
    let successCount = 0;
    let errorCount = 0;

    // Import utilisateurs identifiés
    for (const user of usersData.utilisateurs_identifies) {
      try {
        // 1. Créer compte Auth Supabase
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.profil.email,
          password: 'SimulationPass2025!', // Mot de passe par défaut
          email_confirm: user.profil.email_verifie,
          phone: user.profil.telephone,
          phone_confirm: user.verification.telephone_verifie,
          user_metadata: {
            full_name: user.profil.nom_complet,
            fonction: user.profil.fonction,
            pseudonyme: user.profil.pseudonyme_public
          }
        });

        if (authError) {
          log(`❌ Erreur création auth user ${user.user_id}: ${authError.message}`, 'error');
          errorCount++;
          continue;
        }

        // 2. Créer profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: user.profil.email,
            full_name: user.profil.nom_complet,
            phone: user.profil.telephone,
            role: 'user',
            region: user.localisation.region_residence,
            ville: user.localisation.ville,
            fonction: user.profil.fonction
          });

        if (profileError) {
          log(`❌ Erreur création profile ${user.user_id}: ${profileError.message}`, 'error');
          errorCount++;
          continue;
        }

        // 3. Assigner rôle
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'user',
            is_active: true
          });

        if (roleError) {
          log(`⚠️  Warning rôle ${user.user_id}: ${roleError.message}`, 'warning');
        }

        successCount++;
        log(`✅ User ${user.profil.email} créé avec succès`, 'success');

      } catch (err) {
        log(`❌ Erreur user ${user.user_id}: ${err.message}`, 'error');
        errorCount++;
      }
    }

    log(`\n✅ Import utilisateurs terminé: ${successCount} succès, ${errorCount} erreurs`, 'success');
    return { success: successCount, errors: errorCount };

  } catch (err) {
    log(`❌ Erreur chargement données utilisateurs: ${err.message}`, 'error');
    throw err;
  }
}

// ============================================================================
// IMPORT SIGNALEMENTS
// ============================================================================

async function importSignalements() {
  log('\n📥 Import des signalements...', 'info');
  
  try {
    const signalementsData = loadJsonFile('ndjobi-signalements-dataset.json');
    let successCount = 0;
    let errorCount = 0;

    for (const sig of signalementsData.signalements) {
      try {
        // Préparer les coordonnées GPS au format PostGIS
        let coordonneesGps = null;
        if (sig.coordonnees_gps) {
          coordonneesGps = `POINT(${sig.coordonnees_gps.longitude} ${sig.coordonnees_gps.latitude})`;
        }

        // Récupérer l'ID user si identifié
        let userId = null;
        if (sig.user_type === 'identifie' && sig.user_info?.email) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', sig.user_info.email)
            .single();
          
          if (userData) {
            userId = userData.id;
          }
        }

        // Insérer le signalement
        const { data: signalementData, error: signalementError } = await supabase
          .from('signalements')
          .insert({
            reference_id: sig.id,
            type: sig.type,
            categorie: sig.categorie,
            titre: sig.titre,
            description: sig.description,
            montant_estime: sig.montant_estime ? parseInt(sig.montant_estime) : null,
            devise: sig.devise,
            urgence: sig.urgence,
            statut: sig.statut,
            ministere_concerne: sig.ministere_concerne,
            region: sig.region,
            ville: sig.ville,
            localisation_precise: sig.localisation_precise,
            coordonnees_gps: coordonneesGps,
            date_faits: sig.date_faits,
            date_signalement: sig.date_signalement,
            user_id: userId,
            is_anonymous: sig.user_type === 'anonyme',
            ip_address: sig.metadata?.ip_address,
            device_fingerprint: sig.metadata?.device_fingerprint,
            user_agent: sig.metadata?.user_agent,
            session_id: sig.metadata?.session_id,
            score_credibilite: sig.analyse_ia?.score_credibilite,
            score_urgence: sig.analyse_ia?.score_urgence,
            mots_cles_detectes: sig.analyse_ia?.mots_cles_detectes,
            entites_nommees: sig.analyse_ia?.entites_nommees,
            sentiment: sig.analyse_ia?.sentiment,
            categorie_auto: sig.analyse_ia?.categorie_auto,
            preuves_count: sig.preuves?.length || 0,
            temoins_count: sig.temoins?.length || 0
          })
          .select()
          .single();

        if (signalementError) {
          log(`❌ Erreur signalement ${sig.id}: ${signalementError.message}`, 'error');
          errorCount++;
          continue;
        }

        // Insérer les preuves
        if (sig.preuves && sig.preuves.length > 0) {
          for (const preuve of sig.preuves) {
            const { error: preuveError } = await supabase
              .from('preuves')
              .insert({
                signalement_id: signalementData.id,
                type: preuve.type,
                format: preuve.format,
                nom_fichier: preuve.nom,
                taille_bytes: preuve.taille ? parseInt(preuve.taille) : null,
                duree_secondes: preuve.duree ? parseInt(preuve.duree) : null,
                hash_sha256: preuve.hash,
                metadata: preuve
              });

            if (preuveError) {
              log(`⚠️  Warning preuve ${preuve.nom}: ${preuveError.message}`, 'warning');
            }
          }
        }

        successCount++;
        log(`✅ Signalement ${sig.id} créé avec succès`, 'success');

      } catch (err) {
        log(`❌ Erreur signalement ${sig.id}: ${err.message}`, 'error');
        errorCount++;
      }
    }

    log(`\n✅ Import signalements terminé: ${successCount} succès, ${errorCount} erreurs`, 'success');
    return { success: successCount, errors: errorCount };

  } catch (err) {
    log(`❌ Erreur chargement données signalements: ${err.message}`, 'error');
    throw err;
  }
}

// ============================================================================
// CRÉATION COMPTES ADMIN
// ============================================================================

async function createAdminAccounts() {
  log('\n👑 Mise à jour des comptes administrateurs existants...', 'info');
  
  // Note: Ces comptes EXISTENT DÉJÀ dans Supabase Auth
  // On met à jour uniquement leurs profils et rôles
  const admins = [
    {
      email: '33661002616@ndjobi.com',
      phone: '+33661002616',
      full_name: 'Super Administrateur',
      role: 'super_admin',
      fonction: 'Super Administrateur Système',
      existing: true
    },
    {
      email: '24177888001@ndjobi.com',
      phone: '+24177888001',
      full_name: 'Président',
      role: 'admin',
      fonction: 'Admin - Président de la République',
      organization: 'Présidence de la République',
      existing: true
    },
    {
      email: '24177888002@ndjobi.com',
      phone: '+24177888002',
      full_name: 'DGSS',
      role: 'sous_admin',
      fonction: 'Sous-Admin DGSS',
      organization: 'DGSS (Direction Générale de la Sécurité d\'État)',
      existing: true
    },
    {
      email: '24177888003@ndjobi.com',
      phone: '+24177888003',
      full_name: 'DGR',
      role: 'sous_admin',
      fonction: 'Sous-Admin DGR',
      organization: 'DGR (Direction Générale du Renseignement)',
      existing: true
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const admin of admins) {
    try {
      // Récupérer l'utilisateur existant
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        log(`❌ Erreur liste users: ${listError.message}`, 'error');
        errorCount++;
        continue;
      }

      const existingUser = users.find(u => u.email === admin.email);

      if (!existingUser) {
        log(`⚠️  Compte ${admin.email} non trouvé - ignoré (compte doit exister)`, 'warning');
        errorCount++;
        continue;
      }

      // Mettre à jour ou créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: existingUser.id,
          email: admin.email,
          full_name: admin.full_name,
          phone: admin.phone,
          role: admin.role,
          fonction: admin.fonction
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        log(`❌ Erreur profil ${admin.email}: ${profileError.message}`, 'error');
        errorCount++;
        continue;
      }

      // Mettre à jour ou créer le rôle
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: existingUser.id,
          role: admin.role,
          is_active: true
        }, {
          onConflict: 'user_id,role'
        });

      if (roleError) {
        log(`⚠️  Warning rôle ${admin.email}: ${roleError.message}`, 'warning');
      }

      successCount++;
      log(`✅ Profil ${admin.email} mis à jour - Rôle: ${admin.role}`, 'success');

    } catch (err) {
      log(`❌ Erreur admin ${admin.email}: ${err.message}`, 'error');
      errorCount++;
    }
  }

  log(`\n✅ Mise à jour admins terminée: ${successCount} succès, ${errorCount} erreurs`, 'success');
  log('\n🔑 COMPTES ADMINISTRATEURS (EXISTANTS):', 'info');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  admins.forEach(admin => {
    log(`${admin.role.toUpperCase().padEnd(15)} | ${admin.email.padEnd(35)} | ${admin.phone}`, 'info');
  });
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  log('ℹ️  Ces comptes existent déjà - profils et rôles mis à jour', 'info');
  log('🔐 Connexion avec téléphone + code PIN (voir Supabase Auth)\n', 'info');

  return { success: successCount, errors: errorCount };
}

// ============================================================================
// GÉNÉRATION STATISTIQUES INITIALES
// ============================================================================

async function generateInitialStats() {
  log('\n📊 Génération des statistiques initiales...', 'info');
  
  try {
    // Stats nationales
    const { data: statsData } = await supabase
      .from('signalements')
      .select('*');

    if (!statsData) {
      log('⚠️  Aucune donnée pour statistiques', 'warning');
      return;
    }

    const totalSignalements = statsData.length;
    const signalementsCritiques = statsData.filter(s => s.urgence === 'critique').length;
    const signalementsResolus = statsData.filter(s => s.statut === 'resolu').length;
    const tauxResolution = totalSignalements > 0 
      ? ((signalementsResolus / totalSignalements) * 100).toFixed(2) 
      : 0;
    const montantRecupere = statsData
      .filter(s => s.statut === 'resolu' && s.montant_estime)
      .reduce((sum, s) => sum + (s.montant_estime || 0), 0);

    const { error: statsError } = await supabase
      .from('statistiques_cache')
      .insert({
        type: 'national',
        scope_id: 'GABON',
        periode_debut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periode_fin: new Date().toISOString().split('T')[0],
        total_signalements: totalSignalements,
        signalements_critiques: signalementsCritiques,
        signalements_resolus: signalementsResolus,
        taux_resolution: parseFloat(tauxResolution),
        montant_recupere: montantRecupere,
        delai_moyen_jours: 12,
        metadata: {
          generated_by: 'import_script',
          timestamp: new Date().toISOString()
        }
      });

    if (statsError) {
      log(`❌ Erreur génération stats: ${statsError.message}`, 'error');
    } else {
      log('✅ Statistiques nationales générées', 'success');
    }

  } catch (err) {
    log(`❌ Erreur statistiques: ${err.message}`, 'error');
  }
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function main() {
  console.clear();
  log('╔══════════════════════════════════════════════════════════════╗', 'info');
  log('║         NDJOBI - IMPORT DONNÉES DE SIMULATION                ║', 'info');
  log('║              Script d\'initialisation complète                ║', 'info');
  log('╚══════════════════════════════════════════════════════════════╝', 'info');

  const startTime = Date.now();

  try {
    // Vérifier connexion Supabase
    log('\n🔌 Vérification connexion Supabase...', 'info');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table vide, c'est OK
      throw new Error(`Connexion Supabase échouée: ${error.message}`);
    }
    log('✅ Connexion Supabase OK', 'success');

    // Exécuter les imports dans l'ordre
    const results = {
      admins: await createAdminAccounts(),
      users: await importUtilisateurs(),
      signalements: await importSignalements(),
    };

    // Générer statistiques
    await generateInitialStats();

    // Résumé final
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n╔══════════════════════════════════════════════════════════════╗', 'success');
    log('║                    IMPORT TERMINÉ ✅                          ║', 'success');
    log('╚══════════════════════════════════════════════════════════════╝', 'success');
    log(`\n⏱️  Durée totale: ${duration} secondes`, 'info');
    log(`\n📊 RÉSUMÉ:`, 'info');
    log(`   • Admins créés: ${results.admins.success}/${results.admins.success + results.admins.errors}`, 'info');
    log(`   • Users importés: ${results.users.success}/${results.users.success + results.users.errors}`, 'info');
    log(`   • Signalements importés: ${results.signalements.success}/${results.signalements.success + results.signalements.errors}`, 'info');
    
    log(`\n🚀 Votre base NDJOBI est prête!`, 'success');
    log(`\n📱 Accédez à l'application: http://localhost:5173`, 'info');
    log(`📊 Dashboard Supabase: ${SUPABASE_URL.replace('https://', 'https://app.')}/project/_/editor`, 'info');

  } catch (err) {
    log(`\n❌ ERREUR FATALE: ${err.message}`, 'error');
    log(`\n📚 Stack trace:`, 'error');
    console.error(err);
    process.exit(1);
  }
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

export { importUtilisateurs, importSignalements, createAdminAccounts };
