/**
 * NDJOBI - IMPORT CAS PÊCHE GAB
 * 
 * Ce script importe les cas de corruption liés au programme Gab Pêche
 * pour le dashboard Admin (SIG-2025-014 et SIG-2025-027)
 * 
 * Usage: ts-node scripts/import-cas-peche-gab.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement manquantes: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const CAS_PECHE_GAB = [
  {
    reference_id: 'SIG-2025-014',
    type: 'denonciation_corruption',
    categorie: 'malversation_gab_peche',
    titre: 'Coopérative fantôme Gab Pêche - Détournement subventions',
    description: `La 'Coopérative Nationale des Pêcheurs Unis' inscrite dans Gab Pêche n'existe pas ! C'est une arnaque montée par un conseiller du ministre. Cette coopérative fantôme a reçu 340 millions FCFA de subventions (10 pirogues + équipements + prêts BCEG). MAIS il n'y a aucun pêcheur membre ! Les pirogues ont été livrées dans un entrepôt privé à Ntoum et revendues à des Nigérians. Les documents d'inscription à la coopérative utilisent des faux noms et des photos volées sur Facebook. Le président de cette coopérative bidon est en réalité le cousin du conseiller du ministre. Ils ont créé 15 coopératives fictives comme celle-ci pour capter les aides de Gab Pêche. Total détourné : environ 5 milliards FCFA.`,
    montant_estime: 5000000000,
    urgence: 'critique',
    priority: 'critique',
    status: 'pending',
    ministere_concerne: 'Mer et Pêche',
    location: 'Libreville, Estuaire',
    region: 'Estuaire',
    ville: 'Libreville',
    localisation_precise: 'Ministère de la Mer - Cabinet du Conseiller',
    date_faits: '2024-09-01',
    date_signalement: '2025-01-10T16:23:41Z',
    is_anonymous: false,
    ai_priority_score: 99,
    ai_analysis_summary: 'Réseau organisé de fraude massive. 15 coopératives fictives détectées. Montant total: 5 milliards FCFA. Implication haute fonction publique confirmée.',
    metadata: {
      score_credibilite: 97,
      score_urgence: 99,
      mots_cles: ['Gab Pêche', 'coopérative fantôme', '5 milliards', 'conseiller ministre', 'réseau organisé'],
      categorie_ia: 'corruption_gab_peche_reseau_organise',
      preuves: [
        'liste_15_cooperatives_fictives.pdf',
        'virements_subventions_cooperatives_fantomes.xlsx',
        'faux_documents_inscription_facebook_photos.pdf',
        'pirogues_entrepot_ntoum_revente.jpg'
      ],
      gravite: 'CRITIQUE',
      action_recommandee: 'Enquête immédiate - Saisie des biens - Gel des comptes bancaires'
    }
  },
  {
    reference_id: 'SIG-2025-027',
    type: 'denonciation_corruption',
    categorie: 'malversation_gab_peche',
    titre: 'Matériel de pêche Gab Pêche revendu en Guinée Équatoriale',
    description: `Du matériel de pêche Gab Pêche (moteurs hors-bord, filets, GPS) est revendu en Guinée Équatoriale ! J'ai vu de mes propres yeux des camions chargés partir vers la frontière la nuit. Les moteurs neufs sont revendus 3 fois le prix à Bata et Malabo. Un réseau de contrebande organisé par des proches du projet. Montant estimé : 450 millions FCFA de matériel détourné. Pendant ce temps, les vrais pêcheurs gabonais attendent leur équipement depuis 6 mois.`,
    montant_estime: 450000000,
    urgence: 'haute',
    priority: 'haute',
    status: 'pending',
    ministere_concerne: 'Mer et Pêche',
    location: 'Libreville, Estuaire',
    region: 'Estuaire',
    ville: 'Libreville',
    date_faits: '2025-01-01',
    date_signalement: '2025-01-06T09:23:51Z',
    is_anonymous: true,
    ai_priority_score: 83,
    ai_analysis_summary: 'Contrebande transfrontalière organisée. Matériel destiné aux pêcheurs gabonais détourné vers Guinée Équatoriale. 450M FCFA.',
    metadata: {
      score_credibilite: 87,
      score_urgence: 83,
      mots_cles: ['Gab Pêche', 'contrebande', 'Guinée Équatoriale', 'matériel détourné'],
      categorie_ia: 'trafic_transfrontalier_gab_peche',
      gravite: 'HAUTE',
      action_recommandee: 'Contrôles frontaliers renforcés - Investigation douanière'
    }
  },
  {
    reference_id: 'SIG-2025-011',
    type: 'denonciation_corruption',
    categorie: 'detournement_fonds',
    titre: 'Détournement budget santé - Achat ambulances fantômes',
    description: `Je suis comptable à la Direction Régionale de la Santé du Haut-Ogooué. Le budget 2024 prévoyait l'achat de 12 ambulances pour les centres de santé ruraux (1,2 milliard FCFA). Les factures d'achat existent, signées et tamponnées. MAIS les ambulances n'ont jamais été livrées ! Les centres de santé de Lékoni, Bakoumba et Akiéni n'ont rien reçu. J'ai vérifié personnellement. Le directeur régional m'a menacé de licenciement si j'en parle. L'argent a été versé à une société écran basée au Bénin, dont le gérant est le beau-frère du directeur. J'ai tous les justificatifs : virements bancaires, fausses factures, certificats de livraison falsifiés.`,
    montant_estime: 1200000000,
    urgence: 'critique',
    priority: 'critique',
    status: 'pending',
    ministere_concerne: 'Santé',
    location: 'Franceville, Haut-Ogooué',
    region: 'Haut-Ogooué',
    ville: 'Franceville',
    localisation_precise: 'Direction Régionale Santé',
    date_faits: '2024-03-15',
    date_signalement: '2025-01-11T18:32:14Z',
    is_anonymous: true,
    ai_priority_score: 98,
    ai_analysis_summary: 'Détournement avéré de fonds publics. Société écran internationale. Menaces sur lanceur d\'alerte. Preneur avérées disponibles.',
    metadata: {
      score_credibilite: 96,
      score_urgence: 98,
      mots_cles: ['détournement', 'ambulances fantômes', 'société écran', 'menaces', 'lanceur d\'alerte'],
      categorie_ia: 'detournement_fonds_critique',
      preuves: [
        'budget_sante_2024_ambulances.pdf',
        'factures_falsifiees_societe_benin.pdf',
        'virements_bancaires_suspect.xlsx',
        'centres_sante_sans_ambulances.jpg'
      ],
      gravite: 'CRITIQUE',
      action_recommandee: 'Protection du lanceur d\'alerte - Enquête judiciaire - Audit externe'
    }
  },
  {
    reference_id: 'SIG-2025-022',
    type: 'denonciation_corruption',
    categorie: 'enrichissement_illicite',
    titre: 'Directeur CNSS - Villa 12 chambres et fleet de luxe',
    description: `Le Directeur Général de la CNSS vit comme un prince. Villa de 12 chambres à Libreville (quartier Sablière), estimée à 1,8 milliard FCFA. Flotte personnelle : 3 Mercedes, 2 Range Rover, 1 Bentley. Voyages mensuels en jet privé. Son salaire officiel : 18 millions FCFA/mois. Impossible de justifier ce train de vie. Ses enfants étudient à Londres et Paris dans les écoles les plus chères (50 000€/an chacun). Sa femme possède 4 boutiques de luxe. Source probable : détournement des cotisations CNSS. Des millions de Gabonais cotisent, l'argent s'évapore.`,
    montant_estime: 6700000000,
    urgence: 'critique',
    priority: 'critique',
    status: 'pending',
    ministere_concerne: 'Affaires Sociales',
    location: 'Libreville, Estuaire',
    region: 'Estuaire',
    ville: 'Libreville',
    localisation_precise: 'Quartier Sablière',
    date_faits: '2024-01-01',
    date_signalement: '2025-01-07T21:45:19Z',
    is_anonymous: true,
    ai_priority_score: 92,
    ai_analysis_summary: 'Enrichissement illicite flagrant. Train de vie incompatible avec revenus déclarés. 6,7 milliards FCFA estimés.',
    metadata: {
      score_credibilite: 89,
      score_urgence: 92,
      mots_cles: ['enrichissement illicite', 'CNSS', 'train de vie', 'détournement cotisations'],
      categorie_ia: 'enrichissement_illicite_haute_fonction',
      gravite: 'CRITIQUE',
      action_recommandee: 'Audit patrimonial - Enquête DGLIC - Gel des avoirs'
    }
  }
];

async function importCasPecheGab() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     NDJOBI - IMPORT CAS PÊCHE GAB & CAS CRITIQUES          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let successCount = 0;
  let errorCount = 0;

  for (const cas of CAS_PECHE_GAB) {
    try {
      console.log(`\n📥 Import du cas ${cas.reference_id}...`);
      console.log(`   Titre: ${cas.titre}`);
      console.log(`   Montant: ${(cas.montant_estime / 1000000000).toFixed(2)} Mrd FCFA`);
      console.log(`   Urgence: ${cas.urgence.toUpperCase()}`);

      const { data, error } = await supabase
        .from('signalements')
        .upsert({
          reference_id: cas.reference_id,
          type: cas.type,
          categorie: cas.categorie,
          titre: cas.titre,
          description: cas.description,
          montant_estime: cas.montant_estime,
          urgence: cas.urgence,
          priority: cas.priority,
          status: cas.status,
          ministere_concerne: cas.ministere_concerne,
          location: cas.location,
          region: cas.region,
          ville: cas.ville,
          localisation_precise: cas.localisation_precise,
          date_faits: cas.date_faits,
          date_signalement: cas.date_signalement,
          is_anonymous: cas.is_anonymous,
          ai_priority_score: cas.ai_priority_score,
          ai_analysis_summary: cas.ai_analysis_summary,
          metadata: cas.metadata,
          created_at: cas.date_signalement,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'reference_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Importé avec succès (ID: ${data.id})`);
        successCount++;
      }

    } catch (err: any) {
      console.error(`   ❌ Erreur: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    RÉSUMÉ D\'IMPORT                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Succès: ${successCount}/${CAS_PECHE_GAB.length}`);
  console.log(`❌ Erreurs: ${errorCount}/${CAS_PECHE_GAB.length}\n`);

  if (successCount > 0) {
    console.log('📊 Les cas sont maintenant visibles dans:');
    console.log('   • http://localhost:8080/dashboard/admin (Vue Dashboard)');
    console.log('   • http://localhost:8080/dashboard/admin?view=validation (Validation Présidentielle)');
    console.log('   • http://localhost:8080/dashboard/admin?view=enquetes (Suivi Enquêtes)');
    console.log('   • http://localhost:8080/dashboard/admin?view=rapports (Rapports Stratégiques)');
  }

  console.log('\n✨ Import terminé!\n');
}

importCasPecheGab()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ ERREUR FATALE:', err);
    process.exit(1);
  });

