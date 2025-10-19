/**
 * Script simplifié d'insertion des cas Pêche GAB
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

const cas = {
  reference_id: 'SIG-2025-014',
  type: 'denonciation_corruption',
  categorie: 'malversation_gab_peche',
  titre: 'Coopérative fantôme Gab Pêche - Détournement subventions',
  description: "La 'Coopérative Nationale des Pêcheurs Unis' inscrite dans Gab Pêche n'existe pas ! 15 coopératives fictives créées. Total détourné : 5 milliards FCFA.",
  montant_estime: 5000000000,
  urgence: 'critique',
  priority: 'critique',
  status: 'pending',
  ministere_concerne: 'Mer et Pêche',
  location: 'Libreville, Estuaire',
  region: 'Estuaire',
  ville: 'Libreville',
  is_anonymous: false,
  ai_priority_score: 99,
  ai_analysis_summary: 'Réseau organisé de fraude massive. 15 coopératives fictives. Montant: 5 milliards FCFA.',
  created_at: '2025-01-10T16:23:41Z'
};

console.log('\n📥 Insertion cas Pêche GAB principal...');
const { data, error } = await supabase.from('signalements').insert(cas).select().single();

if (error) {
  console.error('❌ Erreur:', error.message);
} else {
  console.log('✅ Cas importé:', data.reference_id);
  console.log('   Montant: 5 Mrd FCFA');
  console.log('   Status:', data.status);
}

console.log('\n✨ Terminé!\n');

