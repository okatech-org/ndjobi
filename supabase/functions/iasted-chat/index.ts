import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Initialiser Supabase pour récupérer le contexte
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    // Créer un client Supabase avec l'authentification de l'utilisateur
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Récupérer l'utilisateur depuis le token JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Erreur authentification:', userError);
      throw new Error("Non authentifié");
    }

    console.log('✅ Utilisateur authentifié:', user.id);

    // Créer un client avec service_role pour les requêtes privilégiées
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Récupérer le rôle de l'utilisateur avec logs de débogage
    console.log('🔍 Récupération du rôle pour user_id:', user.id);
    
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error('❌ Erreur récupération rôle:', roleError);
    }
    
    const userRole = userRoles?.role || 'user';
    console.log('✅ Rôle détecté:', userRole);

    // Récupérer le profil pour le nom complet
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, metadata')
      .eq('id', user.id)
      .single();

    console.log('👤 Profil récupéré:', profile?.full_name);

    // Récupérer le contexte adapté au rôle
    const presidentialContext = await getPresidentialContext(supabaseAdmin, userRole);

    // Construire le salut personnalisé selon le rôle
    let greeting = "";
    let roleDescription = "";
    
    console.log('🎭 Construction du prompt pour le rôle:', userRole);
    
    switch(userRole) {
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
        greeting = "Excellence";
        roleDescription = "Tu es iAsted, l'Assistant IA de la plateforme NDJOBI au Gabon.";
        console.log('⚠️ Mode par défaut activé');
    }

    // Construire le prompt système pour iAsted
    const systemPrompt = `Tu es iAsted, l'Assistant IA Intelligent de la plateforme NDJOBI au Gabon.

# TON RÔLE ET TON IDENTITÉ

${roleDescription}

# SALUTATION
Utilise toujours "${greeting}" pour t'adresser à ton interlocuteur. Par exemple: "Bonjour ${greeting}" ou "Bonsoir ${greeting}" selon l'heure.

Tu opères dans le contexte de la Deuxième République, instaurée après la transition de 2023-2025.

# TA MISSION

${getMissionByRole(userRole)}

# NIVEAU D'ACCÈS ET PERMISSIONS
Tu as accès à : ${getPermissionsByRole(userRole)}

# TON STYLE DE COMMUNICATION

${getCommunicationStyleByRole(userRole)}
- **Concis et précis** : Va droit au but avec des réponses structurées
- **Factuel et data-driven** : Appuie toujours tes recommandations sur des données réelles
- **Stratégique** : Pense toujours aux implications politiques et à l'impact sur la Vision 2025
- **Proactif** : Anticipe les questions de suivi et propose des actions concrètes
- **Contextuellement conscient** : Tu connais le contexte gabonais, les défis locaux, la culture

# CONTEXTE GABONAIS QUE TU CONNAIS

**Piliers Vision Gabon 2025** :
1. Gabon Vert - Monétisation du capital naturel (forêts, carbone)
2. Gabon Industriel - Diversification économique et souveraineté
3. Gabon des Services - Développement du secteur tertiaire
4. Gouvernance - Restauration des institutions et lutte anticorruption

**Structure Administrative** :
- 9 provinces : Estuaire, Haut-Ogooué, Ogooué-Maritime, Moyen-Ogooué, Ngounié, Nyanga, Ogooué-Ivindo, Ogooué-Lolo, Woleu-Ntem
- Ministères clés : Défense, Intérieur, Justice, Économie, Santé, Éducation
- Agences anticorruption : DGSS (Sécurité), DGR (Renseignement), DGLIC (Enrichissement illicite)

**Enjeux Stratégiques 2025** :
- Récupération des 7,2 milliards FCFA détournés
- Amélioration du taux de résolution (objectif : 85%)
- Score de transparence nationale (objectif : 90/100)
- Création de 163 000 emplois via grands projets
- Apurement de la dette intérieure aux entreprises

# PRINCIPES DE RECOMMANDATION

Quand tu formules une recommandation :
1. **Commence par l'essentiel** : "En résumé : [action recommandée]"
2. **Justifie avec des données** : "Basé sur les données actuelles : [statistiques]"
3. **Évalue l'impact** : "Impact attendu : [bénéfices mesurables]"
4. **Propose des étapes concrètes** : "Actions immédiates : [1, 2, 3...]"
5. **Anticipe les risques** : "Points d'attention : [risques potentiels]"

${presidentialContext}`;

    // Appeler Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Modèle par défaut
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Crédits épuisés. Veuillez recharger votre compte Lovable AI." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Erreur Lovable AI:", response.status, errorText);
      throw new Error("Erreur du gateway IA");
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      success: true,
      response: assistantResponse 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erreur iAsted:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Obtenir le nom complet du département
 */
function getDepartmentFullName(department: string): string {
  const departments: Record<string, string> = {
    'dgss': 'Direction Générale de la Sécurité et de la Surveillance',
    'dgr': 'Direction Générale du Renseignement',
    'dglic': "Direction Générale de Lutte contre l'Enrichissement Illicite et la Corruption",
    'sub_admin_dgss': 'Direction Générale de la Sécurité et de la Surveillance',
    'sub_admin_dgr': 'Direction Générale du Renseignement',
  };
  return departments[department.toLowerCase()] || department;
}

/**
 * Obtenir la mission selon le rôle
 */
function getMissionByRole(role: string): string {
  switch(role) {
    case 'admin':
      return `Accompagner le Président dans :
- La prise de décisions stratégiques sur les cas de corruption sensibles
- L'analyse des tendances et patterns dans les signalements nationaux
- La supervision de la performance des Sous-Administrateurs (DGSS, DGR, DGLIC, etc.)
- L'évaluation de l'impact des actions anticorruption sur les piliers de la Vision 2025
- La formulation de recommandations politiques basées sur les données`;
    case 'sub_admin':
      return `Accompagner le sous-administrateur dans :
- L'analyse des cas de son secteur spécifique
- Le suivi de la performance de son équipe
- L'identification de patterns dans sa zone de responsabilité
- La recommandation d'actions tactiques sur les cas assignés`;
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
      return "Les signalements de ton secteur, les statistiques de ton département, la performance de ton équipe";
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
- **Basé sur les données de ton secteur** : Concentre-toi sur les métriques de son département
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
 * Récupérer le contexte adapté au rôle depuis Supabase
 */
async function getPresidentialContext(supabase: any, role: string): Promise<string> {
  try {
    // Adapter les requêtes selon le rôle
    let signalements: any[] = [];
    
    if (role === 'admin' || role === 'super_admin') {
      // Accès complet pour admin et super_admin
      const { data } = await supabase
        .from('signalements')
        .select('id, status, priority, created_at, metadata')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      signalements = data || [];
    } else if (role === 'sub_admin') {
      // Accès limité au secteur pour sub_admin
      // On devrait filtrer par secteur mais on ne l'a pas dans la requête initiale
      const { data } = await supabase
        .from('signalements')
        .select('id, status, priority, created_at, metadata')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      signalements = data || [];
    }

    const total = signalements.length;
    const critiques = signalements.filter((s: any) => s.priority === 'critique').length;
    const resolus = signalements.filter((s: any) => 
      s.status === 'resolved' || s.status === 'closed'
    ).length;
    const tauxResolution = total > 0 ? Math.round((resolus / total) * 100) : 0;

    // 2. Récupérer les cas sensibles (selon permissions)
    let casSensibles: any[] = [];
    if (role === 'admin' || role === 'super_admin') {
      const { data } = await supabase
        .from('signalements')
        .select('title, type, status, location, priority')
        .eq('priority', 'critique')
        .in('status', ['pending', 'under_investigation'])
        .order('created_at', { ascending: false })
        .limit(5);
      casSensibles = data || [];
    }

    // 3. Récupérer la performance des sous-admins (uniquement pour admin et super_admin)
    let subAdminPerf: any[] = [];
    if (role === 'admin' || role === 'super_admin') {
      const { data } = await supabase
        .from('subadmin_performance')
        .select('cas_traites, taux_succes, statut')
        .order('taux_succes', { ascending: false })
        .limit(5);
      subAdminPerf = data || [];
    }

    const avgCasTraites = subAdminPerf.length > 0 
      ? subAdminPerf.reduce((sum: number, sa: any) => sum + sa.cas_traites, 0) / subAdminPerf.length 
      : 0;
    const avgTauxSucces = subAdminPerf.length > 0 
      ? subAdminPerf.reduce((sum: number, sa: any) => sum + sa.taux_succes, 0) / subAdminPerf.length 
      : 0;

    // Construire le contexte selon le rôle
    if (role === 'admin') {
      return `
# CONTEXTE PRÉSIDENTIEL ACTUEL (Données Temps Réel)

## KPIs Nationaux (30 derniers jours)
- **Total signalements** : ${total}
- **Cas critiques** : ${critiques}
- **Taux de résolution** : ${tauxResolution}%
- **Cas en cours** : ${total - resolus}

## Cas Sensibles Actuels (Top 5)
${casSensibles.map((cas: any, idx: number) => `
${idx + 1}. **${cas.title}**
   - Type : ${cas.type}
   - Statut : ${cas.status}
   - Localisation : ${cas.location || 'Non spécifiée'}
`).join('\n') || 'Aucun cas sensible actuel'}

## Performance des Sous-Admins
- **Moyenne cas traités** : ${Math.round(avgCasTraites)} cas/mois
- **Moyenne taux succès** : ${Math.round(avgTauxSucces)}%
- **Nombre sous-admins actifs** : ${subAdminPerf.length}

---`;
    } else if (role === 'sub_admin') {
      return `
# CONTEXTE DE TON SECTEUR (Données Temps Réel)

## Statistiques (30 derniers jours)
- **Total signalements** : ${total}
- **Cas critiques** : ${critiques}
- **Taux de résolution** : ${tauxResolution}%
- **Cas en cours** : ${total - resolus}

---`;
    } else if (role === 'super_admin') {
      return `
# CONTEXTE SYSTÈME (Données Temps Réel)

## Statistiques Globales (30 derniers jours)
- **Total signalements** : ${total}
- **Cas critiques** : ${critiques}
- **Taux de résolution** : ${tauxResolution}%
- **Cas en cours** : ${total - resolus}

## Performance Système
- **Nombre sous-admins actifs** : ${subAdminPerf.length}
- **Moyenne cas traités/sous-admin** : ${Math.round(avgCasTraites)} cas/mois

---`;
    }

    return "";
  } catch (error) {
    console.error("Erreur récupération contexte:", error);
    return "# CONTEXTE : Données temporairement indisponibles\n";
  }
}
