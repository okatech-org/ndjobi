import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const ChatMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  context: z.object({
    role: z.string().optional(),
    userId: z.string().optional(),
    mode: z.enum(['assistant', 'troubleshooting', 'voice']).optional(),
  }).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Validate and sanitize input
    const rawBody = await req.json();
    const validatedInput = ChatMessageSchema.parse(rawBody);
    
    // Sanitize message
    const message = validatedInput.message.trim();
    if (message.includes('<script') || message.includes('javascript:')) {
      throw new Error('Invalid input detected');
    }
    
    const context = validatedInput.context || {};

    console.log('✅ Utilisateur authentifié:', user.id);

    // Créer un client avec service_role pour les requêtes privilégiées
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify role server-side
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const verifiedRole = userRole?.role || 'user';
    console.log('✅ Rôle vérifié server-side:', verifiedRole);

    // Récupérer le profil pour le nom complet
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, metadata')
      .eq('id', user.id)
      .single();

    console.log('👤 Profil récupéré:', profile?.full_name);

    // Récupérer le contexte adapté au rôle avec validation stricte
    let presidentialContext = '';
    if (verifiedRole === 'admin' || verifiedRole === 'super_admin') {
      presidentialContext = await getPresidentialContext(supabaseAdmin, verifiedRole, user.id);
    } else if (verifiedRole === 'sub_admin') {
      presidentialContext = await getPresidentialContext(supabaseAdmin, verifiedRole, user.id);
    }

    // Construire le salut personnalisé selon le rôle vérifié
    let greeting = "";
    let roleDescription = "";
    
    console.log('🎭 Construction du prompt pour le rôle:', verifiedRole);
    
    switch(verifiedRole) {
      case 'admin':
        greeting = "Excellence Monsieur le Président";
        roleDescription = "Tu es le conseiller virtuel personnel du Président de la République Gabonaise dans le cadre de la lutte anticorruption et de la mise en œuvre de la Vision Gabon 2025.";
        console.log('👑 Mode Président activé');
        break;
      case 'sub_admin':
        const department = profile?.metadata?.department || profile?.metadata?.role_type || 'DGSS';
        greeting = department.toUpperCase();
        roleDescription = `Tu es l'assistant IA du ${department.toUpperCase()} (${getDepartmentFullName(department)}), responsable de l'analyse et du suivi des cas dans ton secteur.`;
        console.log('📊 Mode Sous-Admin activé:', department);
        break;
      case 'super_admin':
        greeting = "Asted";
        roleDescription = "Tu es l'assistant IA du Super Administrateur système, responsable de la supervision technique et de la gestion globale de la plateforme NDJOBI.";
        console.log('🔧 Mode Super Admin activé');
        break;
      default:
        greeting = "Salut";
        roleDescription = "Tu es l'assistant virtuel de la plateforme NDJOBI, responsable d'aider les citoyens dans leurs démarches.";
        console.log('👤 Mode Utilisateur standard activé');
        break;
    }

    // Construire le système prompt adapté
    const systemPrompt = buildSystemPrompt(greeting, roleDescription, verifiedRole, presidentialContext);

    console.log('✅ Système prompt construit:', systemPrompt.substring(0, 200) + '...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Appeler l'API Lovable avec le contexte adapté
    console.log('🚀 Appel API Lovable...');
    
    const response = await fetch('https://api.lovable.app/v1/llm/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API Lovable:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Réponse API Lovable reçue');
    
    const assistantMessage = data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

    // Sauvegarder la conversation
    try {
      await supabaseAdmin.from('iasted_conversations').insert({
        user_id: user.id,
        session_id: crypto.randomUUID(),
        user_message: message,
        assistant_message: assistantMessage,
        mode: context.mode || 'assistant',
        context_data: {
          role: verifiedRole,
          mode: context.mode
        }
      });
      console.log('✅ Conversation sauvegardée');
    } catch (saveError) {
      console.error('⚠️  Erreur sauvegarde conversation:', saveError);
    }

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        context: {
          role: verifiedRole,
          greeting: greeting
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: unknown) {
    console.error('❌ Erreur globale:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Construire le système prompt adapté au rôle
 */
function buildSystemPrompt(greeting: string, roleDescription: string, role: string, presidentialContext: string): string {
  return `${greeting},

${roleDescription}

**Contexte de la plateforme NDJOBI:**
NDJOBI est la plateforme nationale gabonaise de lutte contre la corruption et de protection de l'innovation. Elle permet aux citoyens de signaler des cas de corruption et de protéger leurs projets innovants.

**Ton rôle aujourd'hui:**
${getMissionByRole(role)}

**Tes permissions d'accès:**
${getPermissionsByRole(role)}

**Style de communication:**
${getCommunicationStyleByRole(role)}

**Informations contextuelles en temps réel:**
${presidentialContext || "Aucun contexte spécifique disponible pour ce rôle."}

**Règles importantes:**
1. **Sécurité:** Ne divulgue JAMAIS d'informations sensibles (identités, adresses, détails compromettants)
2. **Confidentialité:** Les données présidentielles et stratégiques sont strictement confidentielles
3. **Précision:** Appuie-toi toujours sur les données réelles fournies dans le contexte
4. **Langue:** Réponds en français, avec un vocabulaire adapté au contexte gabonais
5. **Format:** Structure tes réponses avec des listes à puces et sections claires
6. **Concision:** Sois direct et factuel - évite le verbiage inutile

Réponds maintenant à la question de l'utilisateur.`;
}

/**
 * Obtenir la mission selon le rôle
 */
function getMissionByRole(role: string): string {
  switch(role) {
    case 'admin':
      return `Fournir des analyses stratégiques au Président sur :
- L'état de la lutte anticorruption nationale
- Les tendances et patterns de corruption détectés
- Les recommandations d'actions politiques et législatives
- L'impact des décisions présidentielles sur les indicateurs clés
- Les situations critiques nécessitant une intervention présidentielle`;
    case 'sub_admin':
      return `Accompagner le sous-administrateur dans :
- Le suivi des cas de son secteur
- L'analyse de performance de son département
- Les recommandations opérationnelles
- La coordination avec les autres services`;
    case 'super_admin':
      return `Accompagner le super administrateur dans :
- La supervision technique de la plateforme
- L'analyse globale des performances système
- La gestion des utilisateurs et des accès
- La maintenance et l'optimisation du système
- Le monitoring de la sécurité et de l'intégrité des données`;
    default:
      return "Assister l'utilisateur dans ses tâches sur la plateforme NDJOBI.";
  }
}

/**
 * Obtenir les permissions selon le rôle
 */
function getPermissionsByRole(role: string): string {
  switch(role) {
    case 'admin':
      return "Tous les signalements, toutes les statistiques nationales, toutes les performances des sous-admins, tous les cas sensibles";
    case 'sub_admin':
      return "Les signalements de ton secteur uniquement, les statistiques de ton département, la performance de ton équipe";
    case 'super_admin':
      return "Tous les signalements, toutes les données système, tous les utilisateurs, toutes les configurations";
    default:
      return "Les données de base accessibles";
  }
}

/**
 * Obtenir le style de communication selon le rôle
 */
function getCommunicationStyleByRole(role: string): string {
  switch(role) {
    case 'admin':
      return `Tu t'adresses au Président avec respect mais de manière directe et pragmatique. Tu es :
- **Concis et précis** : Va droit au but avec des réponses structurées
- **Factuel et data-driven** : Appuie toujours tes recommandations sur des données réelles
- **Stratégique** : Pense toujours aux implications politiques et à l'impact sur la Vision 2025
- **Proactif** : Anticipe les questions de suivi et propose des actions concrètes`;
    case 'sub_admin':
      return `Tu t'adresses au sous-administrateur de manière professionnelle et collaborative. Tu es :
- **Précis et opérationnel** : Fournis des informations actionnables
- **Basé sur les données de ton secteur** : Concentre-toi uniquement sur les métriques de son département
- **Tactique** : Propose des actions concrètes pour améliorer la performance
- **Collaboratif** : Aide à coordonner avec les autres services`;
    case 'super_admin':
      return `Tu t'adresses au super administrateur de manière technique et professionnelle. Tu es :
- **Technique et précis** : Fournis des informations système détaillées
- **Orienté sécurité** : Alerte sur les problèmes de sécurité ou d'intégrité
- **Analytique** : Présente des statistiques d'usage et de performance
- **Proactif** : Propose des optimisations et améliorations système`;
    default:
      return "Tu es professionnel, clair et concis.";
  }
}

/**
 * Récupérer le contexte adapté au rôle depuis Supabase avec validation stricte
 */
async function getPresidentialContext(supabase: any, role: string, userId: string): Promise<string> {
  console.log('[Presidential Context] Fetching context for role:', role);
  
  try {
    // Récupérer les signalements en fonction du rôle avec validation stricte
    let signalements = [];
    
    if (role === 'admin' || role === 'super_admin') {
      // Accès complet pour le Président seulement
      const { data, error } = await supabase
        .from('signalements')
        .select('id, title, type, status, priority, created_at, metadata')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      signalements = data || [];
    } else if (role === 'sub_admin') {
      // Accès strictement limité au secteur du sub_admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', userId)
        .single();
      
      const userSector = profile?.metadata?.department;
      if (!userSector) {
        return "# Aucun secteur assigné\n";
      }
      
      const { data, error } = await supabase
        .from('signalements')
        .select('id, status, priority, created_at')
        .eq('metadata->>sector', userSector)
        .limit(50);
        
      if (error) throw error;
      signalements = data || [];
    } else {
      // Aucun accès pour les autres rôles
      return "";
    }

    // Calculer les KPIs - seulement pour admin/super_admin
    if (role !== 'admin' && role !== 'super_admin') {
      const sectorStats = signalements.length;
      return `# Statistiques de votre secteur\n- Signalements actifs: ${sectorStats}\n`;
    }
    
    const totalSignalements = signalements.length;
    const signalementsCritiques = signalements.filter((s: any) => s.priority === 'high' || s.priority === 'urgent').length;
    const signalementsResolus = signalements.filter((s: any) => s.status === 'resolved').length;
    const tauxResolution = totalSignalements > 0 
      ? Math.round((signalementsResolus / totalSignalements) * 100) 
      : 0;

    // Suite du contexte - seulement pour admin/super_admin
    let contextData = `# INDICATEURS NATIONAUX (${new Date().toLocaleDateString('fr-FR')})\n\n`;
    contextData += `**Signalements:**\n`;
    contextData += `- Total: ${totalSignalements}\n`;
    contextData += `- Critiques: ${signalementsCritiques}\n`;
    contextData += `- Taux de résolution: ${tauxResolution}%\n\n`;

    // 2. Récupérer les cas sensibles - seulement pour admin
    if (role === 'admin') {
      const { data: casSensibles } = await supabase
        .from('signalements')
        .select('title, type, status, location, priority')
        .eq('priority', 'critique')
        .in('status', ['pending', 'under_investigation'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (casSensibles && casSensibles.length > 0) {
        contextData += `**Top 5 Cas Critiques:**\n`;
        casSensibles.forEach((cas: any, idx: number) => {
          contextData += `${idx + 1}. ${cas.title} (${cas.type}) - ${cas.location}\n`;
        });
        contextData += '\n';
      }
    }

    return contextData;

  } catch (error) {
    console.error('[Presidential Context] Error:', error);
    return `# Erreur de récupération du contexte\nImpossible de charger les données pour ce rôle.`;
  }
}

/**
 * Obtenir le nom complet du département
 */
function getDepartmentFullName(dept: string): string {
  const deptMap: Record<string, string> = {
    'dgss': 'Direction Générale de la Sécurité et de la Surveillance',
    'dgr': 'Direction Générale du Renseignement',
    'dgpn': 'Direction Générale de la Police Nationale',
    'dgi': 'Direction Générale des Impôts',
    'douanes': 'Direction Générale des Douanes',
  };
  return deptMap[dept.toLowerCase()] || dept;
}
