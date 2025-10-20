/**
 * Service proxy pour Gamma AI via votre backend
 * Contourne les restrictions CORS en passant par votre serveur
 */

interface GammaConfig {
  modeCreation: 'ia' | 'texte';
  typeDocument: 'texte' | 'presentation';
  formatPage: 'defaut' | 'lettre' | 'a4';
  modeGeneration: 'generer' | 'synthese' | 'conserver';
  niveauDetail: 'minimaliste' | 'concis' | 'detaille';
  langue: 'francais' | 'anglais';
  sourceImages: 'ia' | 'aucune';
  styleImages: 'realiste' | 'illustration';
  nombreCartes: number;
}

interface RapportGlobalData {
  admin: {
    nom: string;
    organization: string;
    email: string;
    phone: string;
    role: string;
  };
  periode: string;
  dateDebut: string;
  dateFin: string;
  totalCas: number;
  totalProblematiques: number;
  impactFinancier: number;
  casData: any[];
  problematiques: any[];
  recommandations: any[];
  opinionPublique?: any;
}

interface RapportCasData {
  admin: {
    nom: string;
    organization: string;
  };
  casSelectionnes: any[];
  montantTotal: number;
}

class GammaProxyService {
  private baseURL: string;

  constructor() {
    // Utilisez votre backend comme proxy
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  /**
   * Génère un rapport global via votre backend qui appelle Gamma
   */
  async generateRapportGlobal(
    data: RapportGlobalData,
    format: 'pdf' | 'pptx',
    config: GammaConfig
  ): Promise<{ url: string; downloadUrl: string }> {
    console.log('🎨 Génération rapport global via proxy backend...', { 
      format, 
      organization: data.admin.organization,
      config 
    });

    try {
      const response = await fetch(`${this.baseURL}/gamma/generate-global`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          format,
          config
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur backend: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la génération via proxy:', error);
      throw error;
    }
  }

  /**
   * Génère un rapport de cas via votre backend qui appelle Gamma
   */
  async generateRapportCas(
    data: RapportCasData,
    format: 'pdf' | 'pptx',
    config: GammaConfig
  ): Promise<{ url: string; downloadUrl: string }> {
    console.log('🎨 Génération rapport cas via proxy backend...', { 
      format, 
      nbCas: data.casSelectionnes.length,
      config 
    });

    try {
      const response = await fetch(`${this.baseURL}/gamma/generate-cas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          format,
          config
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur backend: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la génération via proxy:', error);
      throw error;
    }
  }

  /**
   * Télécharge le fichier généré
   */
  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      console.log('✅ Fichier téléchargé:', filename);
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      throw error;
    }
  }
}

export const gammaProxyService = new GammaProxyService();
export default gammaProxyService;
