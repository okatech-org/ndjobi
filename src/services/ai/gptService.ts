interface GPTAnalysisResult {
  summary: string;
  keyPoints: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  estimatedImpact?: string;
  relatedCategories?: string[];
}

interface AnalysisOptions {
  language?: 'fr' | 'en';
  maxTokens?: number;
  temperature?: number;
}

class GPTService {
  private apiKey: string | null = null;
  private apiEndpoint = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async analyzeReport(
    reportType: string,
    description: string,
    location: string,
    options: AnalysisOptions = {}
  ): Promise<GPTAnalysisResult> {
    if (!this.isConfigured()) {
      console.warn('GPT API not configured. Using mock analysis.');
      return this.mockReportAnalysis(reportType, description);
    }

    const prompt = `Tu es un expert en analyse de cas de corruption. Analyse le signalement suivant et fournis une réponse structurée en JSON.

Type de corruption: ${reportType}
Lieu: ${location}
Description: ${description}

Fournis une analyse comprenant:
1. Un résumé concis (2-3 phrases)
2. Les points clés (3-5 points)
3. Le niveau de gravité (low, medium, high, critical)
4. Des recommandations d'actions (3-5 recommandations)
5. L'impact estimé
6. Les catégories liées

Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire.`;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant expert en analyse de corruption au Gabon. Tu fournis des analyses objectives et constructives en français.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`GPT API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid JSON response from GPT');
    } catch (error) {
      console.error('GPT analysis error:', error);
      return this.mockReportAnalysis(reportType, description);
    }
  }

  private mockReportAnalysis(reportType: string, description: string): GPTAnalysisResult {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'extorsion': 'high',
      'detournement': 'critical',
      'pot-de-vin': 'high',
      'abus-pouvoir': 'medium',
      'nepotisme': 'medium',
      'fraude': 'high',
      'autre': 'medium',
    };

    return {
      summary: `Signalement de type ${reportType} nécessitant une attention immédiate. Les faits décrits révèlent des pratiques contraires à l'éthique publique et aux règlements en vigueur.`,
      keyPoints: [
        'Pratiques non conformes identifiées',
        'Impact potentiel sur les services publics',
        'Nécessité d\'une enquête approfondie',
        'Documentation des preuves recommandée',
        'Suivi régulier du dossier requis',
      ],
      severity: severityMap[reportType] || 'medium',
      recommendations: [
        'Transmission immédiate aux autorités compétentes',
        'Collecte de preuves supplémentaires si possible',
        'Protection de l\'anonymat du lanceur d\'alerte',
        'Ouverture d\'une enquête administrative',
        'Mise en place d\'un suivi régulier du dossier',
      ],
      estimatedImpact: 'Impact significatif sur la confiance citoyenne et la qualité des services publics',
      relatedCategories: ['Gouvernance', 'Transparence', 'Éthique publique'],
    };
  }

  async analyzeProject(
    title: string,
    category: string,
    description: string,
    innovationLevel: string,
    options: AnalysisOptions = {}
  ): Promise<GPTAnalysisResult> {
    if (!this.isConfigured()) {
      console.warn('GPT API not configured. Using mock analysis.');
      return this.mockProjectAnalysis(title, category, innovationLevel);
    }

    const prompt = `Tu es un expert en évaluation de projets innovants. Analyse le projet suivant et fournis une réponse structurée en JSON.

Titre: ${title}
Catégorie: ${category}
Niveau d'innovation: ${innovationLevel}
Description: ${description}

Fournis une analyse comprenant:
1. Un résumé du potentiel (2-3 phrases)
2. Les points forts (3-5 points)
3. Des recommandations pour améliorer le projet (3-5 recommandations)
4. L'impact potentiel estimé
5. Les domaines connexes qui pourraient bénéficier du projet

Réponds UNIQUEMENT avec un objet JSON valide.`;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Tu es un consultant expert en innovation et développement de projets au Gabon. Tu fournis des analyses constructives et encourageantes.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`GPT API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid JSON response from GPT');
    } catch (error) {
      console.error('GPT analysis error:', error);
      return this.mockProjectAnalysis(title, category, innovationLevel);
    }
  }

  private mockProjectAnalysis(title: string, category: string, innovationLevel: string): GPTAnalysisResult {
    return {
      summary: `Projet ${innovationLevel} dans le domaine ${category} présentant un fort potentiel de développement. L'innovation proposée pourrait apporter des bénéfices significatifs au secteur concerné.`,
      keyPoints: [
        'Approche innovante et pertinente pour le contexte gabonais',
        'Potentiel de création de valeur économique et sociale',
        'Alignement avec les priorités nationales de développement',
        'Faisabilité technique démontrée ou démontrable',
        'Opportunités de partenariats et de financement identifiables',
      ],
      recommendations: [
        'Développer un business plan détaillé avec projections financières',
        'Identifier et contacter les partenaires stratégiques potentiels',
        'Constituer une équipe complémentaire et expérimentée',
        'Protéger la propriété intellectuelle (brevets, marques)',
        'Préparer une stratégie de communication et de lancement',
      ],
      estimatedImpact: 'Impact positif attendu sur le développement économique local et l\'amélioration des services',
      relatedCategories: ['Innovation', 'Développement économique', 'Technologie', 'Entrepreneuriat'],
    };
  }

  async improveDescription(text: string, type: 'report' | 'project'): Promise<string> {
    if (!this.isConfigured()) {
      return text;
    }

    const prompt = type === 'report'
      ? `Améliore cette description de signalement de corruption pour la rendre plus claire et structurée, sans perdre d'informations: "${text}"`
      : `Améliore cette description de projet innovant pour la rendre plus professionnelle et convaincante: "${text}"`;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'Tu es un assistant d\'écriture professionnel en français.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        return text;
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('GPT improvement error:', error);
      return text;
    }
  }

  async detectPlagiarism(text1: string, text2: string): Promise<{ similarity: number; isPlagiarism: boolean; details: string }> {
    if (!this.isConfigured()) {
      return this.mockPlagiarismCheck(text1, text2);
    }

    const prompt = `Compare ces deux textes et détermine s'il y a du plagiat. Réponds en JSON avec: similarity (0-100), isPlagiarism (boolean), details (string).

Texte 1: "${text1}"
Texte 2: "${text2}"`;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'Tu es un expert en détection de plagiat.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        return this.mockPlagiarismCheck(text1, text2);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.mockPlagiarismCheck(text1, text2);
    } catch (error) {
      console.error('Plagiarism detection error:', error);
      return this.mockPlagiarismCheck(text1, text2);
    }
  }

  private mockPlagiarismCheck(text1: string, text2: string): { similarity: number; isPlagiarism: boolean; details: string } {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));
    const similarity = Math.round((commonWords.length / Math.max(words1.length, words2.length)) * 100);

    return {
      similarity,
      isPlagiarism: similarity > 70,
      details: similarity > 70 
        ? `Taux de similarité élevé (${similarity}%) détecté. Vérification approfondie recommandée.`
        : `Taux de similarité acceptable (${similarity}%). Pas de plagiat évident détecté.`,
    };
  }
}

export const gptService = new GPTService();

