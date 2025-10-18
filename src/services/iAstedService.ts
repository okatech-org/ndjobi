import { supabase } from '@/integrations/supabase/client';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PresidentialContext {
  kpisNationaux: any;
  casSensibles: any[];
  performanceSousAdmins: any[];
  distributionRegionale: any[];
}

/**
 * Service iAsted - Assistant IA Présidentiel Intelligent
 * 
 * Utilise Lovable AI (Google Gemini) pour fournir une assistance intelligente
 * au Président dans la lutte anticorruption et la prise de décision stratégique.
 */
export class IAstedService {

  /**
   * Envoyer un message à iAsted et obtenir une réponse
   */
  static async sendMessage(
    message: string,
    context?: any
  ): Promise<{ success: boolean; response?: string; content?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('iasted-chat', {
        body: { message, context }
      });

      if (error) throw error;

      return {
        success: data.success,
        response: data.response,
        content: data.response
      };
    } catch (error: any) {
      console.error('Erreur iAsted:', error);
      return {
        success: false,
        error: error.message || 'Erreur de communication avec iAsted'
      };
    }
  }

  /**
   * Analyser la performance d'un agent spécifique
   */
  static async analyzeAgentPerformance(userId: string): Promise<string> {
    try {
      // Récupérer les données de l'agent
      const { data: profile } = await supabase
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

      const { data: cases } = await supabase
        .from('signalements')
        .select('*')
        .eq('resolved_by', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const contextData = `
Agent : ${profile?.full_name || 'Inconnu'}
Email : ${profile?.email}

Performance récente :
- Cas traités : ${performance?.cas_traites || 0}
- Taux de succès : ${performance?.taux_succes || 0}%
- Délai moyen : ${performance?.delai_moyen_jours || 0} jours
- Statut : ${performance?.statut || 'Inconnu'}

Cas assignés actuellement : ${cases?.length || 0}
      `;

      const result = await this.sendMessage(
        `Excellence, analyse la performance de cet agent et donne-moi ton évaluation avec des recommandations concrètes :\n\n${contextData}`
      );

      return result.response || result.error || 'Erreur d\'analyse';
    } catch (error: any) {
      return `Erreur lors de l'analyse : ${error.message}`;
    }
  }

  /**
   * Obtenir des recommandations stratégiques sur un cas sensible
   */
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

      return result.response || result.error || 'Erreur d\'analyse';
    } catch (error: any) {
      return `Erreur lors de l'analyse du cas : ${error.message}`;
    }
  }

  /**
   * Identifier les patterns et tendances dans les signalements
   */
  static async identifyPatterns(): Promise<string> {
    try {
      const { data: recentCases } = await supabase
        .from('signalements')
        .select('type, location, created_at, priority')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      // Analyser les patterns
      const typeCount: Record<string, number> = {};
      const locationCount: Record<string, number> = {};
      
      recentCases?.forEach(cas => {
        typeCount[cas.type] = (typeCount[cas.type] || 0) + 1;
        if (cas.location) {
          locationCount[cas.location] = (locationCount[cas.location] || 0) + 1;
        }
      });

      const patternData = `
Analyse des 100 derniers signalements (30 derniers jours) :

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

      return result.response || result.error || 'Erreur d\'analyse';
    } catch (error: any) {
      return `Erreur lors de l'analyse des patterns : ${error.message}`;
    }
  }

  /**
   * Analyser les données et fournir des insights
   */
  static async analyzeData(): Promise<{ analysis: string; confidence: number }> {
    try {
      const result = await this.identifyPatterns();
      return {
        analysis: result,
        confidence: 0.85
      };
    } catch (error) {
      return {
        analysis: 'Erreur d\'analyse des données',
        confidence: 0
      };
    }
  }

  /**
   * Obtenir des suggestions basées sur le contexte
   */
  static async getSuggestions(): Promise<string[]> {
    const result = await this.sendMessage(
      "Excellence, quelles sont les 3 actions prioritaires que tu recommandes pour améliorer la lutte anticorruption cette semaine ?"
    );

    if (result.response) {
      // Extraire les suggestions (basique)
      return result.response.split('\n')
        .filter(line => line.trim().match(/^[\d\-\*\.]/))
        .map(line => line.replace(/^[\d\-\*\.]\s*/, '').trim())
        .filter(s => s.length > 0);
    }

    return [];
  }

  /**
   * Obtenir les métriques de performance
   */
  static async getPerformanceMetrics(): Promise<{
    cas_traites: number;
    taux_succes: number;
    delai_moyen_jours: number;
    statut: string;
  }> {
    try {
      const { data } = await supabase
        .from('subadmin_performance')
        .select('cas_traites, taux_succes, delai_moyen_jours, statut')
        .order('period_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      return data || {
        cas_traites: 0,
        taux_succes: 0,
        delai_moyen_jours: 0,
        statut: 'active'
      };
    } catch (error) {
      return {
        cas_traites: 0,
        taux_succes: 0,
        delai_moyen_jours: 0,
        statut: 'active'
      };
    }
  }

  /**
   * Obtenir les statistiques globales
   */
  static async getStatistics(): Promise<{ total: number; resolved: number; pending: number }> {
    try {
      const { data } = await supabase
        .from('signalements')
        .select('status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const total = data?.length || 0;
      const resolved = data?.filter(s => s.status === 'resolved' || s.status === 'closed').length || 0;
      const pending = data?.filter(s => s.status === 'pending' || s.status === 'under_investigation').length || 0;

      return { total, resolved, pending };
    } catch (error) {
      return { total: 0, resolved: 0, pending: 0 };
    }
  }

  /**
   * Générer un rapport
   */
  static async generateReport(): Promise<{ reportId: string; data: any }> {
    const stats = await this.getStatistics();
    const patterns = await this.identifyPatterns();

    return {
      reportId: `report-${Date.now()}`,
      data: {
        stats,
        analysis: patterns
      }
    };
  }
}

export default IAstedService;
