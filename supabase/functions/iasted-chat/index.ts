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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer le contexte présidentiel
    const presidentialContext = await getPresidentialContext(supabase);

    // Construire le prompt système pour iAsted
    const systemPrompt = `Tu es iAsted, l'Assistant IA Présidentiel Intelligent de la plateforme NDJOBI au Gabon.

# TON RÔLE ET TON IDENTITÉ

Tu es le conseiller virtuel personnel du Président de la République Gabonaise dans le cadre de la lutte anticorruption et de la mise en œuvre de la Vision Gabon 2025. Tu opères dans le contexte de la Deuxième République, instaurée après la transition de 2023-2025.

# TA MISSION

Accompagner le Président dans :
- La prise de décisions stratégiques sur les cas de corruption sensibles
- L'analyse des tendances et patterns dans les signalements nationaux
- La supervision de la performance des Sous-Administrateurs (DGSS, DGR, DGLIC, etc.)
- L'évaluation de l'impact des actions anticorruption sur les piliers de la Vision 2025
- La formulation de recommandations politiques basées sur les données

# TON STYLE DE COMMUNICATION

Tu t'adresses au Président avec respect mais de manière directe et pragmatique. Tu es :
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
 * Récupérer le contexte présidentiel depuis Supabase
 */
async function getPresidentialContext(supabase: any): Promise<string> {
  try {
    // 1. Récupérer les KPIs nationaux
    const { data: signalements } = await supabase
      .from('signalements')
      .select('id, status, priority, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const total = signalements?.length || 0;
    const critiques = signalements?.filter((s: any) => s.priority === 'critique').length || 0;
    const resolus = signalements?.filter((s: any) => 
      s.status === 'resolved' || s.status === 'closed'
    ).length || 0;
    const tauxResolution = total > 0 ? Math.round((resolus / total) * 100) : 0;

    // 2. Récupérer les cas sensibles
    const { data: casSensibles } = await supabase
      .from('signalements')
      .select('title, type, status, location, priority')
      .eq('priority', 'critique')
      .in('status', ['pending', 'under_investigation'])
      .order('created_at', { ascending: false })
      .limit(5);

    // 3. Récupérer la performance des sous-admins
    const { data: subAdminPerf } = await supabase
      .from('subadmin_performance')
      .select('cas_traites, taux_succes, statut')
      .order('taux_succes', { ascending: false })
      .limit(5);

    const avgCasTraites = subAdminPerf?.reduce((sum: number, sa: any) => sum + sa.cas_traites, 0) / (subAdminPerf?.length || 1);
    const avgTauxSucces = subAdminPerf?.reduce((sum: number, sa: any) => sum + sa.taux_succes, 0) / (subAdminPerf?.length || 1);

    return `
# CONTEXTE PRÉSIDENTIEL ACTUEL (Données Temps Réel)

## KPIs Nationaux (30 derniers jours)
- **Total signalements** : ${total}
- **Cas critiques** : ${critiques}
- **Taux de résolution** : ${tauxResolution}%
- **Cas en cours** : ${total - resolus}

## Cas Sensibles Actuels (Top 5)
${casSensibles?.map((cas: any, idx: number) => `
${idx + 1}. **${cas.title}**
   - Type : ${cas.type}
   - Statut : ${cas.status}
   - Localisation : ${cas.location || 'Non spécifiée'}
`).join('\n') || 'Aucun cas sensible actuel'}

## Performance des Sous-Admins
- **Moyenne cas traités** : ${Math.round(avgCasTraites)} cas/mois
- **Moyenne taux succès** : ${Math.round(avgTauxSucces)}%
- **Nombre sous-admins actifs** : ${subAdminPerf?.length || 0}

---`;
  } catch (error) {
    console.error("Erreur récupération contexte:", error);
    return "# CONTEXTE PRÉSIDENTIEL : Données temporairement indisponibles\n";
  }
}
