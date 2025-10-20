/**
 * Service de simulation Gamma AI pour le développement
 * Simule la génération de rapports sans appeler l'API réelle
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

class GammaSimulationService {
  /**
   * Simule la génération d'un rapport global
   */
  async generateRapportGlobal(
    data: RapportGlobalData,
    format: 'pdf' | 'pptx',
    config: GammaConfig
  ): Promise<{ url: string; downloadUrl: string }> {
    console.log('🎨 [SIMULATION] Génération rapport global avec vraies données...', { 
      format, 
      organization: data.admin.organization,
      totalCas: data.totalCas,
      totalProblematiques: data.totalProblematiques,
      config 
    });

    // Simulation du délai de génération
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Génération d'un PDF de simulation avec les vraies données
    const simulatedPdf = await this.generateSimulatedPDF(data, format, config);

    return {
      url: `https://gamma.app/simulated/${Date.now()}`,
      downloadUrl: simulatedPdf
    };
  }

  /**
   * Simule la génération d'un rapport de cas
   */
  async generateRapportCas(
    data: RapportCasData,
    format: 'pdf' | 'pptx',
    config: GammaConfig
  ): Promise<{ url: string; downloadUrl: string }> {
    console.log('🎨 [SIMULATION] Génération rapport cas...', { 
      format, 
      nbCas: data.casSelectionnes.length,
      config 
    });

    // Simulation du délai de génération
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Génération d'un PDF de simulation
    const simulatedPdf = await this.generateSimulatedPDF(data, format, config);

    return {
      url: `https://gamma.app/simulated/${Date.now()}`,
      downloadUrl: simulatedPdf
    };
  }

  /**
   * Génère un PDF de simulation avec jsPDF et les vraies données
   */
  private async generateSimulatedPDF(data: any, format: string, config: GammaConfig): Promise<string> {
    try {
      // Import dynamique de jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Configuration du document
      doc.setFontSize(20);
      doc.text('Rapport NDJOBI - Simulation Gamma AI', 20, 30);

      doc.setFontSize(12);
      doc.text(`Organisation: ${data.admin?.organization || 'Non spécifiée'}`, 20, 50);
      doc.text(`Période: ${data.periode || 'Non spécifiée'}`, 20, 60);
      doc.text(`Format: ${format.toUpperCase()}`, 20, 70);
      doc.text(`Configuration: ${config.niveauDetail} - ${config.nombreCartes} cartes`, 20, 80);

      // Données spécifiques selon le type de rapport
      if (data.casSelectionnes) {
        // Rapport de cas
        doc.text(`Cas sélectionnés: ${data.casSelectionnes.length}`, 20, 100);
        doc.text(`Montant total: ${data.montantTotal?.toLocaleString() || '0'} FCFA`, 20, 110);
        
        // Détails des cas
        let yPos = 130;
        data.casSelectionnes.forEach((cas: any, index: number) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFontSize(10);
          doc.text(`Cas ${index + 1}: ${cas.titre || 'Sans titre'}`, 20, yPos);
          doc.text(`  - ID: ${cas.id}`, 20, yPos + 10);
          doc.text(`  - Montant: ${cas.montant}`, 20, yPos + 20);
          doc.text(`  - Statut: ${cas.statut}`, 20, yPos + 30);
          doc.text(`  - Priorité: ${cas.priorite}`, 20, yPos + 40);
          yPos += 60;
        });
      }

      if (data.totalCas) {
        // Rapport global
        doc.text(`Total cas: ${data.totalCas}`, 20, 100);
        doc.text(`Problématiques: ${data.totalProblematiques}`, 20, 110);
        doc.text(`Impact financier: ${data.impactFinancier?.toLocaleString() || '0'} FCFA`, 20, 120);
        
        // Détails des problématiques
        if (data.problematiques && data.problematiques.length > 0) {
          let yPos = 140;
          doc.text('Problématiques identifiées:', 20, yPos);
          yPos += 15;
          
          data.problematiques.slice(0, 3).forEach((prob: any, index: number) => {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
            doc.setFontSize(10);
            doc.text(`${index + 1}. ${prob.titre || 'Sans titre'}`, 20, yPos);
            doc.text(`   Impact: ${prob.impact} - Montant: ${prob.montant}`, 20, yPos + 10);
            doc.text(`   Statut: ${prob.statut}`, 20, yPos + 20);
            yPos += 35;
          });
        }
        
        // Recommandations
        if (data.recommandations && data.recommandations.length > 0) {
          let yPos = 200;
          doc.text('Recommandations présidentielles:', 20, yPos);
          yPos += 15;
          
          data.recommandations.slice(0, 2).forEach((rec: any, index: number) => {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
            doc.setFontSize(10);
            doc.text(`${index + 1}. ${rec.titre || 'Sans titre'}`, 20, yPos);
            doc.text(`   Priorité: ${rec.priorite} - Délai: ${rec.delai}`, 20, yPos + 10);
            doc.text(`   Budget: ${rec.budget || 'Non défini'}`, 20, yPos + 20);
            yPos += 35;
          });
        }
      }

      // Note de simulation
      doc.setFontSize(10);
      doc.text('Ceci est un rapport de simulation généré localement.', 20, 280);
      doc.text('En production, ce rapport serait généré par Gamma AI.', 20, 290);
      doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, 20, 300);

      // Générer le blob URL
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);

      console.log('✅ [SIMULATION] PDF généré avec succès avec vraies données');
      return url;
    } catch (error) {
      console.error('❌ [SIMULATION] Erreur génération PDF:', error);
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

      console.log('✅ [SIMULATION] Fichier téléchargé:', filename);
    } catch (error) {
      console.error('❌ [SIMULATION] Erreur téléchargement:', error);
      throw error;
    }
  }
}

export const gammaSimulationService = new GammaSimulationService();
export default gammaSimulationService;
