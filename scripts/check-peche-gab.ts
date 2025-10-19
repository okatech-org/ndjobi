import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

const { data, error } = await supabase
  .from('signalements')
  .select('reference_id, titre, montant_estime, urgence')
  .or('categorie.eq.malversation_gab_peche,reference_id.in.(SIG-2025-011,SIG-2025-022)');

console.log('\n📊 Cas critiques trouvés:', data?.length || 0);
if (data) {
  data.forEach(d => {
    const montant = d.montant_estime ? `${(d.montant_estime / 1000000000).toFixed(2)} Mrd` : 'N/A';
    console.log(`✓ ${d.reference_id} - ${d.titre.substring(0, 50)}... (${montant} FCFA)`);
  });
}
if (error) console.error('Erreur:', error);

