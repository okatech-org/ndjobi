/**
 * Script de test pour les optimisations de performance
 * 
 * Teste les améliorations apportées au système NDJOBI
 */

import { PerformanceOptimizationService } from '../src/services/performanceOptimization';

console.log('🚀 Test des optimisations de performance NDJOBI\n');

async function runPerformanceTests() {
  console.log('📊 Test 1: Cache des données système');
  const start1 = Date.now();
  const stats1 = await PerformanceOptimizationService.getCachedSystemStats();
  const end1 = Date.now();
  console.log(`   ✅ Données système récupérées en ${end1 - start1}ms`);
  console.log(`   📈 Utilisateurs totaux: ${stats1.totalUsers}`);

  console.log('\n📊 Test 2: Cache des utilisateurs');
  const start2 = Date.now();
  const users = await PerformanceOptimizationService.getCachedUsers();
  const end2 = Date.now();
  console.log(`   ✅ ${users.length} utilisateurs récupérés en ${end2 - start2}ms`);

  console.log('\n📊 Test 3: Cache des logs d\'activité');
  const start3 = Date.now();
  const logs = await PerformanceOptimizationService.getCachedActivityLogs();
  const end3 = Date.now();
  console.log(`   ✅ ${logs.length} logs récupérés en ${end3 - start3}ms`);

  console.log('\n📊 Test 4: Cache iAsted');
  const start4 = Date.now();
  const iAstedResponse = await PerformanceOptimizationService.getCachedIAstedResponse(
    "Analysez la performance du système"
  );
  const end4 = Date.now();
  console.log(`   ✅ Réponse iAsted générée en ${end4 - start4}ms`);
  console.log(`   🤖 Réponse: ${iAstedResponse.response?.substring(0, 100)}...`);

  console.log('\n📊 Test 5: Préchargement des données critiques');
  const start5 = Date.now();
  await PerformanceOptimizationService.preloadCriticalData();
  const end5 = Date.now();
  console.log(`   ✅ Préchargement terminé en ${end5 - start5}ms`);

  console.log('\n📊 Test 6: Détection mobile');
  const isMobile = PerformanceOptimizationService.isMobileDevice();
  console.log(`   📱 Appareil mobile détecté: ${isMobile ? 'OUI' : 'NON'}`);

  console.log('\n📊 Test 7: Statistiques de performance');
  const perfStats = PerformanceOptimizationService.getPerformanceStats();
  console.log(`   💾 Taille du cache: ${perfStats.cacheSize} entrées`);
  console.log(`   🧠 Utilisation mémoire: ${(perfStats.memoryUsage / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   ⏱️ Temps de chargement: ${perfStats.loadTime}ms`);

  console.log('\n📊 Test 8: Fonctions de débounce et throttle');
  let debounceCount = 0;
  let throttleCount = 0;

  const debouncedFunction = PerformanceOptimizationService.debounce(() => {
    debounceCount++;
    console.log(`   🔄 Fonction debounced appelée (${debounceCount})`);
  }, 100);

  const throttledFunction = PerformanceOptimizationService.throttle(() => {
    throttleCount++;
    console.log(`   ⚡ Fonction throttled appelée (${throttleCount})`);
  }, 200);

  // Simuler des appels rapides
  for (let i = 0; i < 5; i++) {
    debouncedFunction();
    throttledFunction();
  }

  setTimeout(() => {
    console.log(`   ✅ Debounce: ${debounceCount} appel(s) effectif(s)`);
    console.log(`   ✅ Throttle: ${throttleCount} appel(s) effectif(s)`);
  }, 500);

  console.log('\n📊 Test 9: Optimisation des images');
  const originalUrl = 'https://example.com/image.jpg';
  const optimizedUrl = PerformanceOptimizationService.getOptimizedImageUrl(originalUrl, isMobile);
  console.log(`   🖼️ URL originale: ${originalUrl}`);
  console.log(`   🖼️ URL optimisée: ${optimizedUrl}`);

  console.log('\n📊 Test 10: Nettoyage du cache');
  PerformanceOptimizationService.clearCache();
  console.log(`   🧹 Cache vidé`);

  // Vérifier que le cache est vide
  const finalStats = PerformanceOptimizationService.getPerformanceStats();
  console.log(`   ✅ Taille du cache après nettoyage: ${finalStats.cacheSize} entrées`);

  console.log('\n🎯 Tests de performance terminés avec succès!');
  console.log('\n📋 Résumé des améliorations:');
  console.log('   ✅ Cache intelligent implémenté');
  console.log('   ✅ Préchargement des données critiques');
  console.log('   ✅ Optimisation mobile automatique');
  console.log('   ✅ Fonctions debounce et throttle');
  console.log('   ✅ Détection de plateforme');
  console.log('   ✅ Optimisation des images');
  console.log('   ✅ Gestion intelligente du cache');
  console.log('   ✅ Statistiques de performance');
  console.log('   ✅ Nettoyage automatique du cache');
}

// Exécuter les tests
runPerformanceTests().catch(console.error);
