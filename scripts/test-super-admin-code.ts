#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Script de test pour le système de code Super Admin
 * Usage: deno run --allow-net --allow-env scripts/test-super-admin-code.ts
 */

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL') || 'http://localhost:54321';
const SUPABASE_ANON_KEY = Deno.env.get('VITE_SUPABASE_ANON_KEY') || '';

interface TestResult {
  method: string;
  success: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testSendSMS() {
  console.log('\n📱 Test envoi SMS...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+33661002616',
        message: '[NDJOBI TEST] Votre code: 123456. Ne pas utiliser, ceci est un test.',
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      results.push({
        method: 'SMS',
        success: true,
        message: 'SMS envoyé avec succès',
        details: data,
      });
      console.log('✅ SMS envoyé avec succès');
    } else {
      results.push({
        method: 'SMS',
        success: false,
        message: data.error || 'Échec de l\'envoi',
        details: data,
      });
      console.log('❌ Échec:', data.error);
    }
  } catch (error) {
    results.push({
      method: 'SMS',
      success: false,
      message: error.message,
    });
    console.log('❌ Erreur:', error.message);
  }
}

async function testSendWhatsApp() {
  console.log('\n💬 Test envoi WhatsApp...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+33661002616',
        message: '🔐 *NDJOBI TEST*\n\nCode: *123456*\n\nNe pas utiliser, ceci est un test.',
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      results.push({
        method: 'WhatsApp',
        success: true,
        message: 'WhatsApp envoyé avec succès',
        details: data,
      });
      console.log('✅ WhatsApp envoyé avec succès');
    } else {
      results.push({
        method: 'WhatsApp',
        success: false,
        message: data.error || 'Échec de l\'envoi',
        details: data,
      });
      console.log('❌ Échec:', data.error);
    }
  } catch (error) {
    results.push({
      method: 'WhatsApp',
      success: false,
      message: error.message,
    });
    console.log('❌ Erreur:', error.message);
  }
}

async function testSendEmail() {
  console.log('\n📧 Test envoi Email...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'iasted@me.com',
        subject: '[NDJOBI TEST] Code d\'accès',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #667eea;">🔐 NDJOBI TEST</h1>
            <p>Votre code d'accès test:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">123456</span>
            </div>
            <p style="color: #ff0000;"><strong>⚠️ Ceci est un email de test</strong></p>
            <p>Ne pas utiliser ce code, il n'est pas valide.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">NDJOBI - Test système d'envoi de codes</p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      results.push({
        method: 'Email',
        success: true,
        message: 'Email envoyé avec succès',
        details: data,
      });
      console.log('✅ Email envoyé avec succès');
    } else {
      results.push({
        method: 'Email',
        success: false,
        message: data.error || 'Échec de l\'envoi',
        details: data,
      });
      console.log('❌ Échec:', data.error);
    }
  } catch (error) {
    results.push({
      method: 'Email',
      success: false,
      message: error.message,
    });
    console.log('❌ Erreur:', error.message);
  }
}

async function runTests() {
  console.log('🧪 NDJOBI - Test du système de code Super Admin');
  console.log('=================================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Destinataire: +33661002616 / iasted@me.com`);

  if (!SUPABASE_ANON_KEY) {
    console.log('\n❌ ERREUR: VITE_SUPABASE_ANON_KEY non défini');
    console.log('Définir avec: export VITE_SUPABASE_ANON_KEY=your_key');
    Deno.exit(1);
  }

  // Exécuter tous les tests
  await testSendSMS();
  await testSendWhatsApp();
  await testSendEmail();

  // Afficher le résumé
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('===================');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.method}: ${result.message}`);
  });
  
  console.log(`\nRésultat: ${successCount}/${totalCount} réussi(s)`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    Deno.exit(0);
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifier la configuration.');
    Deno.exit(1);
  }
}

// Exécuter les tests
runTests();

