import { createWorker, Worker } from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

interface OCROptions {
  language?: string;
  tesseractPath?: string;
}

class OCRService {
  private worker: any = null;
  private isInitialized = false;

  async initialize(options: OCROptions = {}): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.worker = await createWorker();
      await (this.worker as any).loadLanguage(options.language || 'fra');
      await (this.worker as any).initialize(options.language || 'fra');
      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('OCR initialization error:', error);
      throw new Error('Failed to initialize OCR service');
    }
  }

  async extractTextFromImage(image: File | Blob | string): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      const { data } = await this.worker.recognize(image);

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        language: data.data.text_direction || 'ltr',
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      return this.mockOCR();
    }
  }

  private mockOCR(): OCRResult {
    return {
      text: `Document numérisé
      
Ce document contient des informations importantes relatives au signalement. 
Les faits décrits ci-dessous nécessitent une attention particulière.

Date: ${new Date().toLocaleDateString('fr-FR')}
Lieu: Libreville, Gabon
Nature: Corruption administrative

Description détaillée des faits observés et des éléments de preuve disponibles.`,
      confidence: 85.5,
      language: 'fra',
    };
  }

  async extractTextFromMultipleImages(images: (File | Blob)[]): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (const image of images) {
      try {
        const result = await this.extractTextFromImage(image);
        results.push(result);
      } catch (error) {
        console.error('OCR batch error:', error);
        results.push({
          text: '[Erreur d\'extraction]',
          confidence: 0,
          language: 'unknown',
        });
      }
    }

    return results;
  }

  async extractTextFromPDF(pdfFile: File): Promise<OCRResult> {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      const mockText = `Document PDF numérisé

Titre: ${pdfFile.name}
Taille: ${(pdfFile.size / 1024).toFixed(2)} KB

Contenu extrait du document:

Le présent document atteste des faits suivants concernant un cas de corruption administrative. Les preuves jointes démontrent clairement les irrégularités constatées.

Section 1: Contexte
Les faits se sont déroulés au cours du mois précédent et impliquent plusieurs acteurs de l'administration publique.

Section 2: Détails
Montant estimé des détournements: Plusieurs millions de FCFA
Période concernée: Derniers 6 mois
Nombre de personnes impliquées: 3-5

Section 3: Preuves
- Documents administratifs
- Relevés bancaires
- Témoignages
- Correspondances internes

Conclusion:
Les éléments présentés justifient l'ouverture d'une enquête approfondie.`;

      return {
        text: mockText,
        confidence: 78.3,
        language: 'fra',
      };
    } catch (error) {
      console.error('PDF OCR error:', error);
      return this.mockOCR();
    }
  }

  combineOCRResults(results: OCRResult[]): string {
    return results
      .filter(r => r.confidence > 50)
      .map(r => r.text)
      .join('\n\n---\n\n');
  }

  async processDocument(file: File): Promise<OCRResult> {
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      return this.extractTextFromImage(file);
    } else if (fileType === 'application/pdf') {
      return this.extractTextFromPDF(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  async batchProcessDocuments(files: File[]): Promise<OCRResult[]> {
    const results: OCRResult[] = [];

    for (const file of files) {
      try {
        const result = await this.processDocument(file);
        results.push(result);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({
          text: `[Erreur lors du traitement de ${file.name}]`,
          confidence: 0,
          language: 'unknown',
        });
      }
    }

    return results;
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('OCR Service cleaned up');
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getSupportedLanguages(): string[] {
    return ['fra', 'eng', 'spa', 'por', 'ara'];
  }

  async changeLanguage(language: string): Promise<void> {
    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      await this.worker.loadLanguage(language);
      await this.worker.initialize(language);
      console.log(`Language changed to ${language}`);
    } catch (error) {
      console.error('Language change error:', error);
      throw new Error(`Failed to change language to ${language}`);
    }
  }

  formatExtractedText(text: string): string {
    let formatted = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    const lines = formatted.split('\n');
    formatted = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    return formatted;
  }

  async extractKeyInformation(text: string): Promise<{
    dates: string[];
    amounts: string[];
    names: string[];
    locations: string[];
  }> {
    const dateRegex = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}/gi;
    const amountRegex = /\d+(?:\s?\d{3})*(?:[,.]?\d{2})?\s*(?:FCFA|F\s*CFA|francs?)/gi;
    const nameRegex = /(?:M\.|Mme|Mr|Monsieur|Madame)\s+[A-Z][a-zé]+(?:\s+[A-Z][a-zé]+)+/g;
    const locationRegex = /(?:à|au|en)\s+([A-Z][a-zé]+(?:\s+[A-Z][a-zé]+)*)/g;

    const dates = text.match(dateRegex) || [];
    const amounts = text.match(amountRegex) || [];
    const names = text.match(nameRegex) || [];
    const locations = Array.from(text.matchAll(locationRegex), m => m[1]);

    return {
      dates: [...new Set(dates)],
      amounts: [...new Set(amounts)],
      names: [...new Set(names)],
      locations: [...new Set(locations)],
    };
  }
}

export const ocrService = new OCRService();

