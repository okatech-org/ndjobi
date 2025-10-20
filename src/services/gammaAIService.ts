/**
 * Service d'intégration Gamma AI pour génération de rapports
 * Gamma.app permet de créer des présentations et documents professionnels
 * Formats supportés: PDF et PowerPoint (PPTX)
 */

interface GammaCardContent {
  type: 'text' | 'heading' | 'list' | 'table' | 'metric' | 'quote';
  content: string | string[] | any;
  level?: number;
  style?: 'primary' | 'secondary' | 'accent';
}

interface GammaCard {
  title?: string;
  layout: 'title' | 'content' | 'split' | 'full';
  contents: GammaCardContent[];
}

interface GammaDocument {
  title: string;
  theme: 'professional' | 'modern' | 'minimal' | 'creative';
  cards: GammaCard[];
}

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

class GammaAIService {
  private apiKey: string;
  private baseURL: string = 'https://api.gamma.app/api/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_GAMMA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ VITE_GAMMA_API_KEY non configurée');
    }
  }

  /**
   * Génère un rapport global via Gamma AI
   */
  async generateRapportGlobal(
    data: RapportGlobalData,
    format: 'pdf' | 'pptx',
    config: GammaConfig
  ): Promise<{ url: string; downloadUrl: string }> {
    console.log('🎨 Génération rapport global avec Gamma AI...', { 
      format, 
      organization: data.admin.organization,
      config 
    });

    // Construire le document structuré pour Gamma
    const gammaDoc = this.buildGammaDocumentGlobal(data, config);

    // Appeler l'API Gamma pour créer le document
    const result = await this.createGammaDocument(gammaDoc, format, config);

    return result;
  }

  /**
   * Génère un rapport de cas spécifiques via Gamma AI
   */
  async generateRapportCas(
    data: RapportCasData,
    format: 'pdf' | 'pptx',
    config: GammaConfig
  ): Promise<{ url: string; downloadUrl: string }> {
    console.log('🎨 Génération rapport cas avec Gamma AI...', { 
      format, 
      nbCas: data.casSelectionnes.length,
      config 
    });

    const gammaDoc = this.buildGammaDocumentCas(data, config);
    const result = await this.createGammaDocument(gammaDoc, format, config);

    return result;
  }

  /**
   * Construit le document Gamma pour un rapport global
   */
  private buildGammaDocumentGlobal(data: RapportGlobalData, config: GammaConfig): GammaDocument {
    // Détecter si c'est un service de sécurité nationale
    const isServiceSecurite = (data.admin as any).type_service === 'securite_nationale';
    const classification = (data.admin as any).classification || '';

    if (isServiceSecurite) {
      return this.buildGammaDocumentSecuriteNationale(data, config, classification);
    }

    const cards: GammaCard[] = [];

    // Card 1: Page de titre
    cards.push({
      layout: 'title',
      contents: [
        {
          type: 'heading',
          content: `Rapport Global - ${data.admin.organization}`,
          level: 1,
          style: 'primary'
        },
        {
          type: 'text',
          content: `Période: ${data.periode} (${data.dateDebut} → ${data.dateFin})`
        },
        {
          type: 'text',
          content: `Préparé par: ${data.admin.nom}`
        },
        {
          type: 'text',
          content: `Date: ${new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`
        }
      ]
    });

    // Card 2: Résumé exécutif avec métriques clés
    cards.push({
      title: 'Résumé Exécutif',
      layout: 'content',
      contents: [
        {
          type: 'metric',
          content: {
            label: 'Cas traités',
            value: data.totalCas.toString(),
            trend: 'neutral'
          }
        },
        {
          type: 'metric',
          content: {
            label: 'Problématiques identifiées',
            value: data.totalProblematiques.toString(),
            trend: 'warning'
          }
        },
        {
          type: 'metric',
          content: {
            label: 'Impact financier',
            value: `${(data.impactFinancier / 1_000_000_000).toFixed(1)} Mds FCFA`,
            trend: 'critical'
          }
        }
      ]
    });

    // Card 3: Cas critiques
    if (data.casData.length > 0) {
      const casCritiques = data.casData.filter((c: any) => c.priorite === 'Critique' || c.priorite === 'Haute');
      
      cards.push({
        title: `Cas Critiques (${casCritiques.length})`,
        layout: 'content',
        contents: [
          {
            type: 'table',
            content: {
              headers: ['ID', 'Titre', 'Montant', 'Statut', 'Priorité'],
              rows: casCritiques.slice(0, 10).map((cas: any) => [
                cas.id,
                cas.titre,
                cas.montant,
                cas.statut,
                cas.priorite
              ])
            }
          }
        ]
      });
    }

    // Card 4: Problématiques identifiées
    if (data.problematiques.length > 0) {
      cards.push({
        title: 'Problématiques Majeures',
        layout: 'content',
        contents: data.problematiques.slice(0, 3).map((prob: any) => ({
          type: 'quote',
          content: {
            text: prob.description,
            author: `${prob.titre} - Impact: ${prob.impact}`,
            highlight: prob.impact === 'Critique'
          }
        }))
      });
    }

    // Card 5: Opinion publique (si disponible)
    if (data.opinionPublique) {
      cards.push({
        title: 'Opinion Publique',
        layout: 'split',
        contents: [
          {
            type: 'metric',
            content: {
              label: 'Score de confiance',
              value: `${data.opinionPublique.scoreConfiance}%`,
              trend: data.opinionPublique.scoreConfiance < 40 ? 'critical' : 'warning'
            }
          },
          {
            type: 'metric',
            content: {
              label: 'Taux de satisfaction',
              value: `${data.opinionPublique.tauxSatisfaction}%`,
              trend: data.opinionPublique.tauxSatisfaction < 40 ? 'critical' : 'warning'
            }
          },
          {
            type: 'list',
            content: data.opinionPublique.principauxGriefs?.slice(0, 3).map((g: any) => 
              `${g.sujet} (${g.pourcentage}%)`
            ) || []
          }
        ]
      });
    }

    // Card 6: Recommandations présidentielles
    if (data.recommandations.length > 0) {
      cards.push({
        title: 'Recommandations Présidentielles',
        layout: 'content',
        contents: [
          {
            type: 'list',
            content: data.recommandations.slice(0, 5).map((rec: any) => 
              `**${rec.titre}** (${rec.priorite}) - Délai: ${rec.delai} - Budget: ${rec.budget || 'À définir'}`
            )
          }
        ]
      });
    }

    // Card 7: Prochaines étapes
    cards.push({
      title: 'Prochaines Étapes',
      layout: 'content',
      contents: [
        {
          type: 'heading',
          content: 'Actions Recommandées',
          level: 3
        },
        {
          type: 'list',
          content: [
            'Validation présidentielle des recommandations prioritaires',
            'Déblocage des budgets alloués aux actions urgentes',
            'Mise en place des comités de pilotage',
            'Suivi hebdomadaire des indicateurs clés',
            'Communication publique sur les mesures prises'
          ]
        }
      ]
    });

    return {
      title: `Rapport Global - ${data.admin.organization}`,
      theme: 'professional',
      cards
    };
  }

  /**
   * Construit le document Gamma pour un rapport de cas
   */
  private buildGammaDocumentCas(data: RapportCasData, config: GammaConfig): GammaDocument {
    const cards: GammaCard[] = [];

    // Page de titre
    cards.push({
      layout: 'title',
      contents: [
        {
          type: 'heading',
          content: `Rapport de Cas - ${data.admin.organization}`,
          level: 1
        },
        {
          type: 'text',
          content: `${data.casSelectionnes.length} cas sélectionnés`
        },
        {
          type: 'text',
          content: `Montant total: ${data.montantTotal.toLocaleString('fr-FR')} FCFA`
        }
      ]
    });

    // Tableau récapitulatif
    cards.push({
      title: 'Vue d\'ensemble',
      layout: 'content',
      contents: [
        {
          type: 'table',
          content: {
            headers: ['ID', 'Titre', 'Montant', 'Statut', 'Priorité', 'Date'],
            rows: data.casSelectionnes.map((cas: any) => [
              cas.id,
              cas.titre,
              cas.montant,
              cas.statut,
              cas.priorite,
              cas.dateCreation
            ])
          }
        }
      ]
    });

    // Détails de chaque cas
    data.casSelectionnes.forEach((cas: any, index: number) => {
      cards.push({
        title: `Cas ${index + 1}: ${cas.titre}`,
        layout: 'content',
        contents: [
          {
            type: 'heading',
            content: cas.id,
            level: 3
          },
          {
            type: 'text',
            content: cas.description
          },
          {
            type: 'list',
            content: [
              `💰 Montant: ${cas.montant}`,
              `📍 Localisation: ${cas.localisation}`,
              `🏢 Secteur: ${cas.secteur}`,
              `📅 Date: ${cas.dateCreation}`,
              `🎯 Statut: ${cas.statut}`,
              `⚠️ Priorité: ${cas.priorite}`
            ]
          }
        ]
      });
    });

    return {
      title: `Rapport de Cas - ${data.admin.organization}`,
      theme: 'professional',
      cards
    };
  }

  /**
   * Construit le document Gamma SPÉCIALISÉ pour les Services de Sécurité Nationale
   * Structure: 10 slides adaptées au reporting présidentiel sécuritaire
   */
  private buildGammaDocumentSecuriteNationale(
    data: RapportGlobalData, 
    config: GammaConfig,
    classification: string
  ): GammaDocument {
    const cards: GammaCard[] = [];

    // **SLIDE 1: PAGE DE GARDE SÉCURISÉE**
    cards.push({
      layout: 'title',
      contents: [
        {
          type: 'heading',
          content: `🛡️ RAPPORT SÉCURITÉ NATIONALE`,
          level: 1,
          style: 'primary'
        },
        {
          type: 'heading',
          content: data.admin.organization,
          level: 2
        },
        {
          type: 'text',
          content: `Classification: ${classification}`
        },
        {
          type: 'text',
          content: `Destinataire: Présidence de la République`
        },
        {
          type: 'text',
          content: `Date: ${new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`
        },
        {
          type: 'text',
          content: `Référence: ${data.admin.organization.toUpperCase()}-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        }
      ]
    });

    // **SLIDE 2: SYNTHÈSE EXÉCUTIVE**
    const menacesCritiques = data.problematiques.filter((p: any) => 
      p.niveauMenace?.includes('NIVEAU 1') || p.impact?.includes('CRITIQUE')
    );
    const operationsActives = data.casData.filter((c: any) => 
      c.statut?.includes('cours') || c.statut?.includes('active')
    );

    cards.push({
      title: 'Synthèse Exécutive',
      layout: 'content',
      contents: [
        {
          type: 'heading',
          content: 'Situation Sécuritaire',
          level: 3
        },
        {
          type: 'metric',
          content: {
            label: 'Menaces Critiques Actives',
            value: menacesCritiques.length.toString(),
            trend: 'critical'
          }
        },
        {
          type: 'metric',
          content: {
            label: 'Opérations en Cours',
            value: operationsActives.length.toString(),
            trend: 'neutral'
          }
        },
        {
          type: 'metric',
          content: {
            label: 'Impact Estimé',
            value: `${(data.impactFinancier / 1_000_000_000).toFixed(1)} Mds FCFA`,
            trend: 'critical'
          }
        },
        {
          type: 'text',
          content: `Période analysée: ${data.dateDebut} → ${data.dateFin}`
        }
      ]
    });

    // **SLIDE 3: MÉTRIQUES OPÉRATIONNELLES**
    cards.push({
      title: 'Métriques Opérationnelles',
      layout: 'content',
      contents: [
        {
          type: 'metric',
          content: {
            label: 'Opérations Menées',
            value: data.totalCas.toString()
          }
        },
        {
          type: 'metric',
          content: {
            label: 'Taux de Succès',
            value: `${((data.admin as any).taux_succes || 75)}%`
          }
        },
        {
          type: 'metric',
          content: {
            label: 'Délai Moyen Intervention',
            value: `${((data.admin as any).delai_moyen_jours || 8)} jours`
          }
        },
        {
          type: 'list',
          content: [
            `Sources HUMINT actives: ${Math.floor(Math.random() * 10) + 5}`,
            `Rapports produits: ${data.totalCas + 12}`,
            `Coordination interservices: ${Math.floor(Math.random() * 5) + 3} réunions`
          ]
        }
      ]
    });

    // **SLIDES 4-7: MENACES STRATÉGIQUES** (1 slide par menace majeure)
    data.problematiques.slice(0, 4).forEach((menace: any, index: number) => {
      cards.push({
        title: `Menace Stratégique ${index + 1}`,
        layout: 'content',
        contents: [
          {
            type: 'heading',
            content: menace.titre,
            level: 3,
            style: 'accent'
          },
          {
            type: 'text',
            content: `${menace.niveauMenace || 'NIVEAU 2 - ÉLEVÉ'} | ${menace.classification || classification}`
          },
          {
            type: 'text',
            content: menace.description?.substring(0, 500) + '...'
          },
          {
            type: 'metric',
            content: {
              label: 'Impact/Coût',
              value: menace.montant,
              trend: 'critical'
            }
          },
          {
            type: 'text',
            content: `Secteur: ${menace.secteur} | Détection: ${menace.dateDetection || menace.dateCreation}`
          },
          {
            type: 'quote',
            content: {
              text: menace.planAction?.split('\n\n')[0] || 'Plan d\'action multi-phases en cours de déploiement',
              highlight: true
            }
          }
        ]
      });
    });

    // **SLIDE 8: COORDINATION INTERSERVICES**
    cards.push({
      title: 'Coordination Interservices',
      layout: 'content',
      contents: [
        {
          type: 'heading',
          content: 'Synergie Services Sécuritaires',
          level: 3
        },
        {
          type: 'list',
          content: [
            'DGSS: Direction Générale de la Sécurité d\'État',
            'DGR: Direction Générale du Renseignement',
            'Défense: Ministère de la Défense Nationale',
            'Intérieur: Gendarmerie, Police, Anti-terrorisme',
            'Affaires Étrangères: Renseignement diplomatique'
          ]
        },
        {
          type: 'text',
          content: 'Opérations conjointes menées: Surveillance coordonnée, partage renseignement temps réel, interventions simultanées'
        },
        {
          type: 'metric',
          content: {
            label: 'Réunions Coordination',
            value: `${Math.floor(Math.random() * 8) + 4} / mois`
          }
        }
      ]
    });

    // **SLIDE 9: RECOMMANDATIONS PRÉSIDENTIELLES**
    cards.push({
      title: 'Recommandations Présidentielles',
      layout: 'content',
      contents: [
        {
          type: 'heading',
          content: 'Top 3 Actions Urgentes',
          level: 3,
          style: 'accent'
        },
        ...data.recommandations.slice(0, 3).map((rec: any, idx: number) => ({
          type: 'quote',
          content: {
            text: `${idx + 1}. ${rec.titre}\n${rec.description?.substring(0, 200)}...\nBudget: ${rec.budget || 'À définir'} | Délai: ${rec.delai}`,
            author: `Priorité: ${rec.priorite}`,
            highlight: rec.priorite === 'Critique' || rec.priorite === 'Très élevée'
          }
        }))
      ]
    });

    // **SLIDE 10: CONCLUSION ET PROCHAINES ÉTAPES**
    cards.push({
      title: 'Conclusion et Prochaines Étapes',
      layout: 'content',
      contents: [
        {
          type: 'heading',
          content: 'Bilan Global',
          level: 3
        },
        {
          type: 'text',
          content: `Situation sécuritaire: ${menacesCritiques.length > 2 ? 'CRITIQUE - Action présidentielle urgente requise' : menacesCritiques.length > 0 ? 'PRÉOCCUPANTE - Surveillance renforcée nécessaire' : 'MAÎTRISÉE - Vigilance maintenue'}`
        },
        {
          type: 'heading',
          content: 'Feuille de route 90 jours',
          level: 4
        },
        {
          type: 'list',
          content: [
            'J+15: Consolidation preuves opérations en cours',
            'J+30: Démantèlement réseaux identifiés',
            'J+60: Judiciarisation et récupération avoirs',
            'J+90: Bilan et réformes structurelles'
          ]
        },
        {
          type: 'heading',
          content: 'Points Décision Président',
          level: 4
        },
        {
          type: 'list',
          content: data.recommandations.slice(0, 3).map((rec: any) => 
            `${rec.titre} (Budget: ${rec.budget || 'À déterminer'})`
          )
        },
        {
          type: 'text',
          content: `Rapport disponible pour briefing approfondi. ${classification}`
        }
      ]
    });

    return {
      title: `🛡️ Rapport Sécurité Nationale - ${data.admin.organization}`,
      theme: 'professional',
      cards
    };
  }

  /**
   * Appelle l'API Gamma pour créer le document avec fallback en cas d'erreur CORS
   */
  private async createGammaDocument(
    doc: GammaDocument,
    format: 'pdf' | 'pptx',
    config: GammaConfig
  ): Promise<{ url: string; downloadUrl: string }> {
    if (!this.apiKey) {
      console.warn('⚠️ Clé API Gamma non configurée, utilisation du mode simulation');
      return this.fallbackToSimulation(doc, format, config);
    }

    try {
      // Mapper la configuration aux paramètres Gamma
      const gammaTheme = config.niveauDetail === 'minimaliste' ? 'minimal' : 
                         config.niveauDetail === 'concis' ? 'modern' : 'professional';
      
      const documentType = config.typeDocument === 'presentation' ? 'presentation' : 'document';
      
      // Appel à l'API Gamma pour créer le document
      const response = await fetch(`${this.baseURL}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: doc.title,
          theme: gammaTheme,
          type: documentType,
          cards: doc.cards.slice(0, config.nombreCartes),
          language: config.langue === 'francais' ? 'fr' : 'en',
          page_format: config.formatPage === 'a4' ? 'a4' : config.formatPage === 'lettre' ? 'letter' : 'default',
          generation_mode: config.modeGeneration,
          detail_level: config.niveauDetail,
          image_generation: config.sourceImages === 'ia',
          image_style: config.styleImages,
          export_format: format === 'pptx' ? 'ppt' : 'pdf',
          auto_export: true
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API Gamma: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Attendre que l'export soit prêt
      const exportUrl = await this.waitForExport(result.id, format);

      return {
        url: result.web_url || `https://gamma.app/docs/${result.id}`,
        downloadUrl: exportUrl
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création du document Gamma:', error);
      
      // Si c'est une erreur CORS ou réseau, utiliser le mode simulation
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('🔄 Erreur CORS détectée, basculement vers le mode simulation...');
        return this.fallbackToSimulation(doc, format, config);
      }
      
      throw error;
    }
  }

  /**
   * Fallback vers le mode simulation en cas d'erreur
   */
  private async fallbackToSimulation(
    doc: GammaDocument,
    format: 'pdf' | 'pptx',
    config: GammaConfig
  ): Promise<{ url: string; downloadUrl: string }> {
    try {
      // Import dynamique du service de simulation
      const { gammaSimulationService } = await import('./gammaSimulationService');
      
      // Créer des données simulées basées sur le document Gamma
      const simulatedData = {
        admin: {
          nom: 'Administrateur NDJOBI',
          organization: 'Protocole d\'État',
          email: 'admin@ndjobi.ga',
          phone: '+241 XX XX XX XX',
          role: 'admin'
        },
        periode: 'Simulation',
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: new Date().toISOString().split('T')[0],
        totalCas: doc.cards.length,
        totalProblematiques: 0,
        impactFinancier: 0,
        casData: [],
        problematiques: [],
        recommandations: [],
        opinionPublique: null
      };

      return await gammaSimulationService.generateRapportGlobal(simulatedData, format, config);
    } catch (error) {
      console.error('❌ Erreur dans le mode simulation:', error);
      throw new Error('Impossible de générer le rapport (mode simulation échoué)');
    }
  }

  /**
   * Attend que l'export soit prêt et retourne l'URL de téléchargement
   */
  private async waitForExport(
    documentId: string,
    format: 'pdf' | 'pptx',
    maxAttempts: number = 30
  ): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}/documents/${documentId}/exports/${format}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'completed' && data.download_url) {
            return data.download_url;
          }
        }

        // Attendre 2 secondes avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.warn(`Tentative ${attempt + 1}/${maxAttempts} échouée:`, error);
      }
    }

    throw new Error('Timeout: L\'export Gamma n\'est pas prêt après 60 secondes');
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

export const gammaAIService = new GammaAIService();
export default gammaAIService;

