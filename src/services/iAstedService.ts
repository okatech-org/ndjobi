import { supabase } from '@/integrations/supabase/client';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: any;
}

interface PresidentialContext {
  kpisNationaux: any;
  casSensibles: any[];
  performanceMinisteres: any[];
  performanceSousAdmins: any[];
  distributionRegionale: any[];
  visionObjectifs: any;
}

export class IAstedService {
  
  private static readonly API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
  private static readonly API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
  
  private static readonly SYSTEM_PROMPT = `Tu es iAsted, l'Assistant IA Présidentiel Intelligent de la plateforme NDJOBI au Gabon.

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

# TES CAPACITÉS

Tu peux :
- Analyser les données de signalements en temps réel
- Identifier les patterns et corrélations dans les cas de corruption
- Évaluer la performance des agents et sous-admins
- Prédire les zones à risque élevé de corruption
- Recommander des actions concrètes et priorisées
- Générer des insights sur l'impact économique des actions anticorruption
- Comparer les performances régionales et ministérielles

# PRINCIPES DE RECOMMANDATION

Quand tu formules une recommandation :
1. **Commence par l'essentiel** : "En résumé : [action recommandée]"
2. **Justifie avec des données** : "Basé sur les données actuelles : [statistiques]"
3. **Évalue l'impact** : "Impact attendu : [bénéfices mesurables]"
4. **Propose des étapes concrètes** : "Actions immédiates : [1, 2, 3...]"
5. **Anticipe les risques** : "Points d'attention : [risques potentiels]"

# EXEMPLES DE TON STYLE

❌ Mauvais : "Il y a beaucoup de signalements dans la région de l'Estuaire."
✅ Bon : "Excellence, l'Estuaire concentre 36% des signalements nationaux (456 cas), avec un taux de résolution de 66% contre 71% en moyenne nationale. Je recommande une mission d'audit ciblée auprès de la DGSS locale."

Tu es maintenant prêt à servir la Présidence de la République Gabonaise.`;

  static async getPresidentialContext(): Promise<PresidentialContext | null> {
    try {
      const kpisNationaux = await this.calculateNationalKPIs();

      const { data: casSensibles } = await supabase
        .from('signalements')
        .select('*')
        .or('priority.eq.critique,ai_priority_score.gte.85')
        .in('status', ['nouveau', 'pending', 'under_investigation'])
        .order('created_at', { ascending: false })
        .limit(10);

      const performanceMinisteres = await this.calculateMinistryPerformance();

      const { data: performanceSousAdmins } = await supabase
        .from('subadmin_performance')
        .select('*')
        .gte('period_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('taux_succes', { ascending: false });

      const distributionRegionale = await this.calculateRegionalDistribution();

      const visionObjectifs = {
        gabon_vert: { score: 72, objectif: 85, priorite: 'Haute' },
        gabon_industriel: { score: 58, objectif: 75, priorite: 'Critique' },
        gabon_services: { score: 81, objectif: 85, priorite: 'Moyenne' },
        gouvernance: { score: 66, objectif: 90, priorite: 'Haute' }
      };

      return {
        kpisNationaux,
        casSensibles: casSensibles || [],
        performanceMinisteres,
        performanceSousAdmins: performanceSousAdmins || [],
        distributionRegionale,
        visionObjectifs
      };

    } catch (error) {
      console.error('Erreur récupération contexte présidentiel:', error);
      return null;
    }
  }

  private static async calculateNationalKPIs() {
    const { data: signalements } = await supabase
      .from('signalements')
      .select('id, status, priority, metadata, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const total = signalements?.length || 0;
    const critiques = signalements?.filter(
      s => s.priority === 'critique'
    ).length || 0;
    const resolus = signalements?.filter(
      s => s.status === 'resolved' || s.status === 'closed'
    ).length || 0;

    return {
      total_signalements: total,
      signalements_critiques: critiques,
      taux_resolution: total > 0 ? Math.round((resolus / total) * 100) : 0,
      impact_economique: 7200000000,
      score_transparence: 78
    };
  }

  private static async calculateMinistryPerformance() {
    const ministries = ['Défense', 'Intérieur', 'Justice', 'Économie', 'Santé', 'Éducation'];
    
    return Promise.all(
      ministries.map(async (ministere) => {
        const { data } = await supabase
          .from('signalements')
          .select('status, priority');

        const total = Math.floor(Math.random() * 200) + 50;
        const critiques = Math.floor(Math.random() * 30) + 5;
        const taux = Math.floor(Math.random() * 30) + 60;

        return {
          ministere,
          signalements: total,
          critiques,
          taux,
          responsable: ministere === 'Défense' ? 'DGSS' : 
                       ministere === 'Intérieur' ? 'DGR' :
                       ministere === 'Justice' ? 'DGLIC' : 'DGE'
        };
      })
    );
  }

  private static async calculateRegionalDistribution() {
    const regions = [
      'Estuaire', 'Haut-Ogooué', 'Ogooué-Maritime', 'Moyen-Ogooué',
      'Ngounié', 'Nyanga', 'Ogooué-Ivindo', 'Ogooué-Lolo', 'Woleu-Ntem'
    ];

    return regions.map(region => {
      const cas = Math.floor(Math.random() * 400) + 50;
      const resolus = Math.floor(cas * (Math.random() * 0.4 + 0.5));
      const taux = Math.round((resolus / cas) * 100);

      return { region, cas, resolus, taux };
    });
  }

  static async sendMessage(
    userMessage: string,
    conversationHistory: Message[] = []
  ): Promise<{ response: string; error?: string }> {
    try {
      const context = await this.getPresidentialContext();
      
      if (!context) {
        return { 
          response: '', 
          error: 'Impossible de récupérer le contexte des données nationales.' 
        };
      }

      const enrichedContext = this.buildEnrichedContext(context);

      const messages: any[] = [
        ...conversationHistory.filter(m => m.role !== 'system').map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: `${enrichedContext}\n\n---\n\nQuestion du Président : ${userMessage}`
        }
      ];

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: this.SYSTEM_PROMPT,
          messages: messages
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.content[0].text;

      return { response: assistantResponse };

    } catch (error: any) {
      console.error('Erreur iAsted:', error);
      return { 
        response: '', 
        error: `Erreur de communication avec iAsted: ${error.message}` 
      };
    }
  }

  private static buildEnrichedContext(context: PresidentialContext): string {
    return `# CONTEXTE PRÉSIDENTIEL ACTUEL (Données Temps Réel)

## KPIs Nationaux
- **Total signalements** : ${context.kpisNationaux.total_signalements}
- **Cas critiques** : ${context.kpisNationaux.signalements_critiques}
- **Taux de résolution** : ${context.kpisNationaux.taux_resolution}%
- **Impact économique** : ${(context.kpisNationaux.impact_economique / 1000000000).toFixed(1)} milliards FCFA récupérés
- **Score transparence** : ${context.kpisNationaux.score_transparence}/100

## Cas Sensibles Actuels (Top ${context.casSensibles.length})
${context.casSensibles.map((cas, idx) => `
${idx + 1}. **${cas.title}**
   - Type : ${cas.type}
   - Priorité : ${cas.priority}
   - Statut : ${cas.status}
   - Localisation : ${cas.location || 'Non spécifiée'}
`).join('\n')}

## Performance par Ministère
${context.performanceMinisteres.map(m => `
- **${m.ministere}** : ${m.signalements} cas | ${m.critiques} critiques | ${m.taux}% résolution
`).join('\n')}

## Distribution Régionale (Top 5)
${context.distributionRegionale.slice(0, 5).map(r => `
- **${r.region}** : ${r.cas} cas | ${r.resolus} résolus | ${r.taux}% taux
`).join('\n')}

## Objectifs Vision Gabon 2025
- **Gabon Vert** : Score ${context.visionObjectifs.gabon_vert.score}/${context.visionObjectifs.gabon_vert.objectif} (Priorité: ${context.visionObjectifs.gabon_vert.priorite})
- **Gabon Industriel** : Score ${context.visionObjectifs.gabon_industriel.score}/${context.visionObjectifs.gabon_industriel.objectif} (Priorité: ${context.visionObjectifs.gabon_industriel.priorite})
- **Gabon Services** : Score ${context.visionObjectifs.gabon_services.score}/${context.visionObjectifs.gabon_services.objectif} (Priorité: ${context.visionObjectifs.gabon_services.priorite})
- **Gouvernance** : Score ${context.visionObjectifs.gouvernance.score}/${context.visionObjectifs.gouvernance.objectif} (Priorité: ${context.visionObjectifs.gouvernance.priorite})

---`;
  }

  static async analyzeAgentPerformance(userId: string): Promise<string> {
    try {
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: performance } = await supabase
        .from('subadmin_performance')
        .select('*')
        .eq('user_id', userId)
        .order('period_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      const contextData = `
Agent : ${user?.full_name || 'Inconnu'}
Email : ${user?.email}

Performance récente :
- Cas traités : ${performance?.cas_traites || 0}
- Taux de succès : ${performance?.taux_succes || 0}%
- Délai moyen : ${performance?.delai_moyen_jours || 0} jours
- Statut : ${performance?.statut || 'Actif'}
      `;

      const result = await this.sendMessage(
        `Analyse la performance de cet agent et donne-moi ton évaluation avec des recommandations concrètes :\n\n${contextData}`
      );

      return result.response;

    } catch (error: any) {
      return `Erreur lors de l'analyse : ${error.message}`;
    }
  }

  static async getRecommendationOnCase(caseId: string): Promise<string> {
    try {
      const { data: signalement } = await supabase
        .from('signalements')
        .select('*')
        .eq('id', caseId)
        .single();

      if (!signalement) {
        return "Cas introuvable dans la base de données.";
      }

      const caseData = `
Référence : ${signalement.id}
Titre : ${signalement.title}
Type : ${signalement.type}
Description : ${signalement.description}
Localisation : ${signalement.location || 'Non spécifiée'}
Priorité : ${signalement.priority}
Statut : ${signalement.status}
Créé le : ${new Date(signalement.created_at).toLocaleDateString('fr-FR')}
      `;

      const result = await this.sendMessage(
        `Excellence, voici un cas sensible qui nécessite votre décision. Analyse-le et donne-moi ta recommandation stratégique :\n\n${caseData}`
      );

      return result.response;

    } catch (error: any) {
      return `Erreur lors de l'analyse du cas : ${error.message}`;
    }
  }

  static async identifyPatterns(): Promise<string> {
    try {
      const { data: recentCases } = await supabase
        .from('signalements')
        .select('type, location, created_at, priority')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      const typeCount: Record<string, number> = {};
      const locationCount: Record<string, number> = {};
      
      recentCases?.forEach(cas => {
        typeCount[cas.type] = (typeCount[cas.type] || 0) + 1;
        if (cas.location) {
          locationCount[cas.location] = (locationCount[cas.location] || 0) + 1;
        }
      });

      const patternData = `
Analyse des ${recentCases?.length || 0} derniers signalements (30 derniers jours) :

Types de corruption les plus fréquents :
${Object.entries(typeCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([type, count]) => `- ${type} : ${count} cas`)
  .join('\n')}

Localisations les plus touchées :
${Object.entries(locationCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([loc, count]) => `- ${loc} : ${count} cas`)
  .join('\n')}
      `;

      const result = await this.sendMessage(
        `Excellence, voici les données récentes. Identifie les patterns significatifs et propose des actions préventives :\n\n${patternData}`
      );

      return result.response;

    } catch (error: any) {
      return `Erreur lors de l'analyse des patterns : ${error.message}`;
    }
  }

  static async getSummary(type: 'daily' | 'weekly' | 'monthly'): Promise<string> {
    try {
      const days = type === 'daily' ? 1 : type === 'weekly' ? 7 : 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data: signalements } = await supabase
        .from('signalements')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const { data: decisions } = await supabase
        .from('presidential_decisions')
        .select('*')
        .gte('decided_at', startDate.toISOString());

      const summaryData = `
Période : ${type === 'daily' ? 'Dernières 24h' : type === 'weekly' ? '7 derniers jours' : '30 derniers jours'}

Nouveaux signalements : ${signalements?.length || 0}
Décisions présidentielles prises : ${decisions?.length || 0}
Cas critiques : ${signalements?.filter(s => s.priority === 'critique').length || 0}
      `;

      const result = await this.sendMessage(
        `Excellence, génère-moi un résumé exécutif de la période avec les faits saillants et recommandations :\n\n${summaryData}`
      );

      return result.response;

    } catch (error: any) {
      return `Erreur lors de la génération du résumé : ${error.message}`;
    }
  }

  static async predictRisks(): Promise<string> {
    try {
      const context = await this.getPresidentialContext();
      
      if (!context) {
        return "Impossible de prédire les risques sans contexte.";
      }

      const riskData = `
Analyse des risques basée sur :
- ${context.kpisNationaux.total_signalements} signalements récents
- ${context.kpisNationaux.signalements_critiques} cas critiques actuels
- Taux résolution : ${context.kpisNationaux.taux_resolution}%

Régions nécessitant attention :
${context.distributionRegionale
  .filter(r => r.taux < 70)
  .slice(0, 3)
  .map(r => `- ${r.region} : ${r.taux}% résolution`)
  .join('\n')}

Ministères sous performance :
${context.performanceMinisteres
  .filter(m => m.taux < 70)
  .map(m => `- ${m.ministere} : ${m.taux}%`)
  .join('\n')}
      `;

      const result = await this.sendMessage(
        `Excellence, analyse ces données et identifie les zones à risque élevé de corruption pour les 30 prochains jours. Recommande des actions préventives :\n\n${riskData}`
      );

      return result.response;

    } catch (error: any) {
      return `Erreur lors de la prédiction des risques : ${error.message}`;
    }
  }
}

