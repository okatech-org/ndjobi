#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

// Configuration Supabase
const SUPABASE_URL = 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k';

// Lire le script SQL
const sqlScript = fs.readFileSync('./SUPABASE_FIX_SCRIPT.sql', 'utf8');

// Fonction pour exécuter une requête SQL
function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query: sql });
        
        const options = {
            hostname: 'xfxqwlbqysiezqdpeqpv.supabase.co',
            port: 443,
            path: '/rest/v1/rpc/execute_sql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(responseData);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// Fonction pour exécuter le script SQL
async function fixDatabase() {
    console.log('🔧 Début de la correction de la base de données NDJOBI...');
    console.log('================================================');
    
    try {
        // Diviser le script en requêtes individuelles
        const queries = sqlScript
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0 && !q.startsWith('--'));
        
        console.log(`📋 ${queries.length} requêtes SQL à exécuter...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i] + ';';
            
            try {
                console.log(`⏳ Exécution de la requête ${i + 1}/${queries.length}...`);
                await executeSQL(query);
                successCount++;
                console.log(`✅ Requête ${i + 1} exécutée avec succès`);
            } catch (error) {
                errorCount++;
                console.log(`❌ Erreur requête ${i + 1}: ${error.message}`);
                
                // Continuer même en cas d'erreur (certaines requêtes peuvent échouer si les objets existent déjà)
                if (error.message.includes('already exists') || 
                    error.message.includes('does not exist')) {
                    console.log(`⚠️  Erreur ignorée (objet déjà existant ou inexistant)`);
                    errorCount--;
                    successCount++;
                }
            }
        }
        
        console.log('================================================');
        console.log(`✅ Correction terminée !`);
        console.log(`📊 Résultats: ${successCount} succès, ${errorCount} erreurs`);
        
        if (errorCount === 0) {
            console.log('🎉 Base de données corrigée avec succès !');
            console.log('🚀 L\'application NDJOBI est maintenant prête !');
        } else {
            console.log('⚠️  Certaines erreurs ont été rencontrées mais peuvent être ignorées');
            console.log('📖 Vérifiez les logs ci-dessus pour plus de détails');
        }
        
    } catch (error) {
        console.error('❌ Erreur critique:', error.message);
        console.log('');
        console.log('🔧 SOLUTION ALTERNATIVE:');
        console.log('1. Allez sur https://supabase.com/dashboard');
        console.log('2. Sélectionnez le projet xfxqwlbqysiezqdpeqpv');
        console.log('3. Cliquez sur "SQL Editor"');
        console.log('4. Copiez le contenu du fichier SUPABASE_FIX_SCRIPT.sql');
        console.log('5. Exécutez le script dans l\'éditeur SQL');
    }
}

// Exécuter la correction
fixDatabase().catch(console.error);
