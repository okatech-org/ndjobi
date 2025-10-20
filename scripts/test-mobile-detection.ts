/**
 * Script de test pour la détection mobile iAsted
 * 
 * Ce script teste la détection des problèmes de configuration
 * sur différentes plateformes mobiles.
 */

import { IAstedMobileDetection } from '../src/services/iAstedMobileDetection';

console.log('🧪 Test de détection mobile iAsted\n');

// Test de détection de plateforme
console.log('📱 Détection de plateforme:');
const platform = IAstedMobileDetection.detectPlatform();
console.log(`   Plateforme détectée: ${platform}`);

// Test de détection des problèmes
console.log('\n🔍 Détection des problèmes:');
const issues = IAstedMobileDetection.detectAllIssues();
console.log(`   Nombre de problèmes détectés: ${issues.length}`);

// Affichage détaillé des problèmes
issues.forEach((issue, index) => {
  console.log(`\n   ${index + 1}. [${issue.type.toUpperCase()}] ${issue.title}`);
  console.log(`      Plateforme: ${issue.platform}`);
  console.log(`      Description: ${issue.description}`);
  console.log(`      Solutions:`);
  issue.solution.forEach((solution, solIndex) => {
    console.log(`         ${solIndex + 1}. ${solution}`);
  });
});

// Test de compatibilité
console.log('\n✅ Test de compatibilité:');
const isCompatible = IAstedMobileDetection.isPlatformCompatible();
console.log(`   Plateforme compatible: ${isCompatible ? 'OUI' : 'NON'}`);

// Message de résumé
console.log('\n📋 Résumé:');
const summary = IAstedMobileDetection.getSummaryMessage(issues);
console.log(`   ${summary}`);

// Recommandations spécifiques
console.log('\n💡 Recommandations:');
if (platform === 'ios') {
  console.log('   - Vérifiez les paramètres Safari > Avancé');
  console.log('   - Désactivez "Protection de la confidentialité lors des mesures publicitaires"');
  console.log('   - Autorisez l\'accès au microphone');
} else if (platform === 'android') {
  console.log('   - Vérifiez les autorisations Chrome');
  console.log('   - Autorisez l\'accès au microphone');
  console.log('   - Évitez le mode navigation privée');
} else {
  console.log('   - Vérifiez les autorisations du navigateur');
  console.log('   - Utilisez HTTPS');
  console.log('   - Autorisez l\'accès au microphone');
}

console.log('\n🎯 Test terminé');
