#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://xfxqwlbqysiezqdpeqpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3bGJxeXNpZXpxZHBlcXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNjgsImV4cCI6MjA3NTc4MjI2OH0.0DobXhl43BgOeUMKEmyWyYkM7Iuwc_cBhD7mYCZMO8k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabaseFix() {
    console.log('🔍 Vérification de la correction de la base de données NDJOBI...');
    console.log('==============================================================');
    
    const checks = [
        {
            name: 'Colonne role dans profiles',
            check: async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .limit(1);
                
                if (error) {
                    if (error.message.includes('Could not find the \'role\' column')) {
                        return { success: false, message: 'Colonne role manquante' };
                    }
                    throw error;
                }
                return { success: true, message: 'Colonne role présente' };
            }
        },
        {
            name: 'Table device_sessions',
            check: async () => {
                const { data, error } = await supabase
                    .from('device_sessions')
                    .select('id')
                    .limit(1);
                
                if (error) {
                    if (error.message.includes('Could not find the table')) {
                        return { success: false, message: 'Table device_sessions manquante' };
                    }
                    throw error;
                }
                return { success: true, message: 'Table device_sessions présente' };
            }
        },
        {
            name: 'Table device_signalements',
            check: async () => {
                const { data, error } = await supabase
                    .from('device_signalements')
                    .select('id')
                    .limit(1);
                
                if (error) {
                    if (error.message.includes('Could not find the table')) {
                        return { success: false, message: 'Table device_signalements manquante' };
                    }
                    throw error;
                }
                return { success: true, message: 'Table device_signalements présente' };
            }
        },
        {
            name: 'Colonnes GPS dans signalements',
            check: async () => {
                const { data, error } = await supabase
                    .from('signalements')
                    .select('gps_latitude, gps_longitude, device_id, submission_method')
                    .limit(1);
                
                if (error) {
                    if (error.message.includes('Could not find the column')) {
                        return { success: false, message: 'Colonnes GPS manquantes' };
                    }
                    throw error;
                }
                return { success: true, message: 'Colonnes GPS présentes' };
            }
        },
        {
            name: 'Fonction migrate_device_to_user',
            check: async () => {
                const { data, error } = await supabase
                    .rpc('migrate_device_to_user', { 
                        device_id_param: 'test', 
                        user_id_param: '00000000-0000-0000-0000-000000000000' 
                    });
                
                if (error) {
                    if (error.message.includes('Could not find the function')) {
                        return { success: false, message: 'Fonction migrate_device_to_user manquante' };
                    }
                    // Erreur attendue car les paramètres sont fictifs
                    return { success: true, message: 'Fonction migrate_device_to_user présente' };
                }
                return { success: true, message: 'Fonction migrate_device_to_user présente' };
            }
        }
    ];
    
    let successCount = 0;
    let totalChecks = checks.length;
    
    for (const check of checks) {
        try {
            console.log(`⏳ Vérification: ${check.name}...`);
            const result = await check.check();
            
            if (result.success) {
                console.log(`✅ ${result.message}`);
                successCount++;
            } else {
                console.log(`❌ ${result.message}`);
            }
        } catch (error) {
            console.log(`❌ Erreur lors de la vérification: ${error.message}`);
        }
    }
    
    console.log('==============================================================');
    
    if (successCount === totalChecks) {
        console.log('🎉 TOUTES LES CORRECTIONS SONT APPLIQUÉES !');
        console.log('✅ Base de données NDJOBI entièrement fonctionnelle');
        console.log('🚀 L\'application peut maintenant être utilisée sans erreurs');
    } else {
        console.log(`⚠️  ${successCount}/${totalChecks} corrections appliquées`);
        console.log('📋 Veuillez exécuter le script SQL dans l\'interface Supabase');
        console.log('📖 Voir GUIDE-CORRECTION-ERREURS.md pour les instructions');
    }
    
    console.log('');
    console.log('🔗 Interface Supabase: https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv');
    console.log('📊 SQL Editor: https://supabase.com/dashboard/project/xfxqwlbqysiezqdpeqpv/sql');
}

// Exécuter la vérification
verifyDatabaseFix().catch(console.error);
