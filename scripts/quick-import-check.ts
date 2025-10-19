/**
 * NDJOBI - Vérification rapide de la configuration avant import
 * Ce script vérifie que tout est prêt pour l'import des données
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function checkConfiguration() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║    🔍 VÉRIFICATION CONFIGURATION SUPABASE                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let hasErrors = false;

  // 1. Vérifier URL
  console.log('1️⃣  Vérification URL Supabase...');
  if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.log('   ❌ URL Supabase non configurée');
    hasErrors = true;
  } else {
    console.log(`   ✅ URL : ${SUPABASE_URL}`);
  }

  // 2. Vérifier Service Role Key
  console.log('\n2️⃣  Vérification Service Role Key...');
  if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'YOUR_SERVICE_KEY') {
    console.log('   ❌ Service Role Key non configurée');
    console.log('   💡 Récupérez-la sur : https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/settings/api');
    hasErrors = true;
  } else {
    const keyPreview = SUPABASE_SERVICE_KEY.substring(0, 30) + '...';
    console.log(`   ✅ Service Role Key : ${keyPreview}`);
  }

  if (hasErrors) {
    console.log('\n❌ Configuration incomplète. Impossible de continuer.\n');
    process.exit(1);
  }

  // 3. Tester connexion
  console.log('\n3️⃣  Test de connexion Supabase...');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.log(`   ❌ Erreur connexion : ${error.message}`);
      hasErrors = true;
    } else {
      console.log('   ✅ Connexion Supabase réussie');
    }
  } catch (err: any) {
    console.log(`   ❌ Erreur : ${err.message}`);
    hasErrors = true;
  }

  // 4. Vérifier tables existantes
  console.log('\n4️⃣  Vérification des tables...');
  const requiredTables = ['profiles', 'user_roles', 'signalements', 'preuves'];
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.log(`   ❌ Table '${table}' : erreur ou inexistante`);
        hasErrors = true;
      } else {
        console.log(`   ✅ Table '${table}' : OK`);
      }
    } catch (err) {
      console.log(`   ❌ Table '${table}' : erreur`);
      hasErrors = true;
    }
  }

  // 5. Vérifier données existantes
  console.log('\n5️⃣  État actuel des données...');
  try {
    const { data: profiles } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    const { data: signalements } = await supabase.from('signalements').select('count', { count: 'exact', head: true });
    
    console.log(`   📊 Profils existants : ${profiles?.count || 0}`);
    console.log(`   📊 Signalements existants : ${signalements?.count || 0}`);
  } catch (err) {
    console.log('   ⚠️  Impossible de compter les données existantes');
  }

  // Résumé final
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  if (hasErrors) {
    console.log('║                    ❌ VÉRIFICATION ÉCHOUÉE                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log('⚠️  Corrigez les erreurs ci-dessus avant de lancer l\'import\n');
    process.exit(1);
  } else {
    console.log('║                    ✅ TOUT EST PRÊT !                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log('🚀 Vous pouvez maintenant lancer l\'import :');
    console.log('   npm run simulation:import');
    console.log('   OU');
    console.log('   ./scripts/run-import.sh\n');
  }
}

checkConfiguration().catch(err => {
  console.error('\n❌ Erreur fatale :', err.message);
  process.exit(1);
});

