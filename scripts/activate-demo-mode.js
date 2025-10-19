#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function activateDemoMode() {
  console.log('🎭 ACTIVATION - Mode Démo Temporaire');
  console.log('====================================');
  
  try {
    // Créer un fichier de session démo
    const demoSessionPath = path.join(__dirname, '..', 'public', 'demo-session.json');
    const demoSession = {
      user: {
        id: 'demo-admin-001',
        email: '24177888001@ndjobi.com',
        phone: '+24177888001',
        full_name: 'Président de la République',
        role: 'super_admin',
        fonction: 'Président / Administrateur',
        organisation: 'Présidence de la République'
      },
      session: {
        access_token: 'demo-token-12345',
        refresh_token: 'demo-refresh-67890',
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24h
        created_at: new Date().toISOString()
      },
      demo: true,
      message: 'Mode démo activé - Accès temporaire au dashboard admin'
    };
    
    fs.writeFileSync(demoSessionPath, JSON.stringify(demoSession, null, 2));
    console.log('✅ Fichier de session démo créé');
    console.log(`   - Chemin: ${demoSessionPath}`);
    
    // Créer un script de redirection
    const redirectScriptPath = path.join(__dirname, '..', 'public', 'demo-login.html');
    const redirectScript = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mode Démo - NDJOBI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #2D5F1E 0%, #4A8B3A 100%);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 500px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #2D5F1E;
        }
        h1 {
            margin: 0 0 20px;
            font-size: 28px;
        }
        .info {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .credentials {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-family: monospace;
        }
        .btn {
            background: #4A8B3A;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #6BB757;
        }
        .warning {
            background: rgba(255, 193, 7, 0.2);
            border: 1px solid rgba(255, 193, 7, 0.5);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🇬🇦</div>
        <h1>Mode Démo NDJOBI</h1>
        
        <div class="warning">
            ⚠️ <strong>Mode Démo Activé</strong><br>
            Accès temporaire au dashboard admin
        </div>
        
        <div class="info">
            <h3>👑 Compte Admin Président</h3>
            <div class="credentials">
                <strong>Email:</strong> 24177888001@ndjobi.com<br>
                <strong>Téléphone:</strong> +24177888001<br>
                <strong>PIN:</strong> 111111<br>
                <strong>Rôle:</strong> Super Admin
            </div>
        </div>
        
        <p>Cliquez sur le bouton ci-dessous pour accéder au dashboard admin en mode démo :</p>
        
        <button class="btn" onclick="activateDemo()">
            🚀 Accéder au Dashboard Admin
        </button>
        
        <button class="btn" onclick="window.location.href='/'">
            🏠 Retour à l'accueil
        </button>
    </div>

    <script>
        function activateDemo() {
            // Créer une session démo dans localStorage
            const demoSession = {
                user: {
                    id: 'demo-admin-001',
                    email: '24177888001@ndjobi.com',
                    phone: '+24177888001',
                    full_name: 'Président de la République',
                    role: 'super_admin',
                    fonction: 'Président / Administrateur',
                    organisation: 'Présidence de la République'
                },
                session: {
                    access_token: 'demo-token-12345',
                    refresh_token: 'demo-refresh-67890',
                    expires_at: Date.now() + (24 * 60 * 60 * 1000),
                    created_at: new Date().toISOString()
                },
                demo: true
            };
            
            localStorage.setItem('demoSessionData', JSON.stringify(demoSession));
            
            // Rediriger vers le dashboard admin
            window.location.href = '/dashboard/admin';
        }
        
        // Auto-activation après 3 secondes
        setTimeout(() => {
            if (confirm('Voulez-vous activer automatiquement le mode démo ?')) {
                activateDemo();
            }
        }, 3000);
    </script>
</body>
</html>`;
    
    fs.writeFileSync(redirectScriptPath, redirectScript);
    console.log('✅ Page de connexion démo créée');
    console.log(`   - Chemin: ${redirectScriptPath}`);
    
    console.log('\n🎯 MODE DÉMO ACTIVÉ');
    console.log('===================');
    console.log('📋 Accès au dashboard admin:');
    console.log('   1. Ouvrez: http://localhost:8080/demo-login.html');
    console.log('   2. Cliquez sur "Accéder au Dashboard Admin"');
    console.log('   3. Ou accédez directement: http://localhost:8080/dashboard/admin');
    console.log('');
    console.log('👑 Compte démo:');
    console.log('   • Email: 24177888001@ndjobi.com');
    console.log('   • Téléphone: +24177888001');
    console.log('   • PIN: 111111');
    console.log('   • Rôle: Super Admin');
    console.log('');
    console.log('⚠️  Note: Ce mode démo est temporaire');
    console.log('   Il sera désactivé une fois le problème Supabase résolu');
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 SCRIPT D\'ACTIVATION MODE DÉMO');
  console.log('=================================');
  
  await activateDemoMode();
  
  console.log('\n✅ MODE DÉMO ACTIVÉ AVEC SUCCÈS');
  console.log('\n🔄 Prochaines étapes:');
  console.log('1. Redémarrez le serveur de développement');
  console.log('2. Accédez à: http://localhost:8080/demo-login.html');
  console.log('3. Testez le dashboard admin en mode démo');
  console.log('4. Une fois Supabase corrigé, désactivez le mode démo');
}

main().catch(console.error);
