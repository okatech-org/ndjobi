import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface CasData {
  id: string;
  titre: string;
  description: string;
  montant: string;
  statut: string;
  priorite: string;
  dateCreation: string;
  secteur: string;
  localisation: string;
}

interface AdminData {
  nom: string;
  organization: string;
  email: string;
  phone: string;
  role: string;
}

interface RapportGlobalData {
  admin: AdminData;
  periode: string;
  dateDebut: string;
  dateFin: string;
  totalCas: number;
  totalProblematiques: number;
  impactFinancier: number;
  casData: CasData[];
  problematiques: any[];
  recommandations: any[];
}

interface RapportCasData {
  admin: AdminData;
  casSelectionnes: CasData[];
  montantTotal: number;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

class RapportGenerationService {
  /**
   * Génère un rapport PDF pour un ou plusieurs cas
   */
  generatePDFCas(data: RapportCasData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('RAPPORT CAS SPÉCIFIQUES', pageWidth / 2, 20, { align: 'center' });
    
    // Informations administration
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Administration: ${data.admin.organization}`, 14, 35);
    doc.text(`Responsable: ${data.admin.nom}`, 14, 42);
    doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 14, 49);
    
    // Résumé
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('RÉSUMÉ', 14, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text(`Nombre de cas: ${data.casSelectionnes.length}`, 14, 68);
    doc.text(`Montant total: ${data.montantTotal.toLocaleString()} FCFA`, 14, 75);
    
    // Tableau des cas
    const tableData = data.casSelectionnes.map(cas => [
      cas.id,
      cas.titre,
      cas.priorite,
      cas.statut,
      cas.montant,
      cas.localisation
    ]);
    
    doc.autoTable({
      startY: 85,
      head: [['ID', 'Titre', 'Priorité', 'Statut', 'Montant', 'Localisation']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });
    
    // Détails par cas
    let yPosition = doc.lastAutoTable.finalY + 15;
    
    data.casSelectionnes.forEach((cas, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.text(`CAS ${index + 1}: ${cas.titre}`, 14, yPosition);
      
      yPosition += 7;
      doc.setFontSize(9);
      doc.setTextColor(52, 73, 94);
      
      const details = [
        `ID: ${cas.id}`,
        `Priorité: ${cas.priorite}`,
        `Statut: ${cas.statut}`,
        `Date: ${cas.dateCreation}`,
        `Secteur: ${cas.secteur}`,
        `Montant: ${cas.montant}`,
        `Description: ${cas.description}`
      ];
      
      details.forEach(detail => {
        doc.text(detail, 14, yPosition);
        yPosition += 5;
      });
      
      yPosition += 5;
    });
    
    // Pied de page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(149, 165, 166);
      doc.text(
        `Page ${i} sur ${pageCount} - Rapport généré le ${new Date().toLocaleString('fr-FR')}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Téléchargement
    const fileName = `Rapport_Cas_${data.admin.organization}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Génère un rapport PDF global
   */
  generatePDFGlobal(data: RapportGlobalData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('RAPPORT GLOBAL MINISTÈRE', pageWidth / 2, 20, { align: 'center' });
    
    // Informations
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Administration: ${data.admin.organization}`, 14, 35);
    doc.text(`Responsable: ${data.admin.nom}`, 14, 42);
    doc.text(`Période: ${data.periode}`, 14, 49);
    doc.text(`Du ${data.dateDebut} au ${data.dateFin}`, 14, 56);
    
    // Résumé exécutif
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('RÉSUMÉ EXÉCUTIF', 14, 70);
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text(`Total des cas traités: ${data.totalCas}`, 14, 78);
    doc.text(`Problématiques identifiées: ${data.totalProblematiques}`, 14, 85);
    doc.text(`Impact financier total: ${data.impactFinancier.toLocaleString()} FCFA`, 14, 92);
    
    // Problématiques
    if (data.problematiques.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('PROBLÉMATIQUES IDENTIFIÉES', 14, 105);
      
      const probData = data.problematiques.map(prob => [
        prob.id,
        prob.titre,
        prob.impact,
        prob.montant,
        prob.statut
      ]);
      
      doc.autoTable({
        startY: 112,
        head: [['ID', 'Titre', 'Impact', 'Montant', 'Statut']],
        body: probData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [231, 76, 60], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });
    }
    
    // Recommandations
    if (data.recommandations.length > 0) {
      const yPos = data.problematiques.length > 0 ? doc.lastAutoTable.finalY + 15 : 115;
      
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('RECOMMANDATIONS PRÉSIDENTIELLES', 14, yPos);
      
      const recData = data.recommandations.map(rec => [
        rec.id,
        rec.titre,
        rec.priorite,
        rec.delai,
        rec.responsable
      ]);
      
      doc.autoTable({
        startY: yPos + 7,
        head: [['ID', 'Recommandation', 'Priorité', 'Délai', 'Responsable']],
        body: recData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [46, 204, 113], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });
    }
    
    // Pied de page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(149, 165, 166);
      doc.text(
        `Page ${i} sur ${pageCount} - Rapport ${data.periode} généré le ${new Date().toLocaleString('fr-FR')}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Téléchargement
    const fileName = `Rapport_Global_${data.admin.organization}_${data.periode}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Génère un rapport Excel pour les cas
   */
  generateExcelCas(data: RapportCasData): void {
    const workbook = XLSX.utils.book_new();
    
    // Feuille résumé
    const summaryData = [
      ['RAPPORT CAS SPÉCIFIQUES'],
      [''],
      ['Administration', data.admin.organization],
      ['Responsable', data.admin.nom],
      ['Email', data.admin.email],
      ['Téléphone', data.admin.phone],
      ['Date de génération', new Date().toLocaleDateString('fr-FR')],
      [''],
      ['RÉSUMÉ'],
      ['Nombre de cas', data.casSelectionnes.length],
      ['Montant total', `${data.montantTotal.toLocaleString()} FCFA`]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');
    
    // Feuille détails cas
    const casData = data.casSelectionnes.map(cas => ({
      'ID': cas.id,
      'Titre': cas.titre,
      'Description': cas.description,
      'Priorité': cas.priorite,
      'Statut': cas.statut,
      'Montant': cas.montant,
      'Date de création': cas.dateCreation,
      'Secteur': cas.secteur,
      'Localisation': cas.localisation
    }));
    
    const casSheet = XLSX.utils.json_to_sheet(casData);
    XLSX.utils.book_append_sheet(workbook, casSheet, 'Cas');
    
    // Téléchargement
    const fileName = `Rapport_Cas_${data.admin.organization}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Génère un rapport Excel global
   */
  generateExcelGlobal(data: RapportGlobalData): void {
    const workbook = XLSX.utils.book_new();
    
    // Feuille résumé
    const summaryData = [
      ['RAPPORT GLOBAL MINISTÈRE'],
      [''],
      ['Administration', data.admin.organization],
      ['Responsable', data.admin.nom],
      ['Période', data.periode],
      ['Du', data.dateDebut],
      ['Au', data.dateFin],
      [''],
      ['RÉSUMÉ EXÉCUTIF'],
      ['Total des cas traités', data.totalCas],
      ['Problématiques identifiées', data.totalProblematiques],
      ['Impact financier total', `${data.impactFinancier.toLocaleString()} FCFA`]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');
    
    // Feuille problématiques
    if (data.problematiques.length > 0) {
      const probData = data.problematiques.map(prob => ({
        'ID': prob.id,
        'Titre': prob.titre,
        'Description': prob.description,
        'Impact': prob.impact,
        'Montant': prob.montant,
        'Statut': prob.statut,
        'Classification': prob.classification,
        'Date de détection': prob.dateDetection,
        'Secteur': prob.secteur
      }));
      
      const probSheet = XLSX.utils.json_to_sheet(probData);
      XLSX.utils.book_append_sheet(workbook, probSheet, 'Problématiques');
    }
    
    // Feuille recommandations
    if (data.recommandations.length > 0) {
      const recData = data.recommandations.map(rec => ({
        'ID': rec.id,
        'Titre': rec.titre,
        'Description': rec.description,
        'Priorité': rec.priorite,
        'Statut': rec.statut,
        'Classification': rec.classification,
        'Impact': rec.impact,
        'Délai': rec.delai,
        'Responsable': rec.responsable
      }));
      
      const recSheet = XLSX.utils.json_to_sheet(recData);
      XLSX.utils.book_append_sheet(workbook, recSheet, 'Recommandations');
    }
    
    // Téléchargement
    const fileName = `Rapport_Global_${data.admin.organization}_${data.periode}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Génère un rapport Word (format HTML)
   */
  generateWordCas(data: RapportCasData): void {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2c3e50; text-align: center; }
    h2 { color: #2980b9; margin-top: 30px; }
    .info { margin: 20px 0; }
    .info p { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #2980b9; color: white; }
    tr:nth-child(even) { background-color: #f5f7fa; }
    .case-detail { margin: 20px 0; padding: 15px; border-left: 4px solid #2980b9; background-color: #f8f9fa; }
  </style>
</head>
<body>
  <h1>RAPPORT CAS SPÉCIFIQUES</h1>
  
  <div class="info">
    <p><strong>Administration:</strong> ${data.admin.organization}</p>
    <p><strong>Responsable:</strong> ${data.admin.nom}</p>
    <p><strong>Email:</strong> ${data.admin.email}</p>
    <p><strong>Téléphone:</strong> ${data.admin.phone}</p>
    <p><strong>Date de génération:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>
  
  <h2>RÉSUMÉ</h2>
  <p><strong>Nombre de cas:</strong> ${data.casSelectionnes.length}</p>
  <p><strong>Montant total:</strong> ${data.montantTotal.toLocaleString()} FCFA</p>
  
  <h2>LISTE DES CAS</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Titre</th>
        <th>Priorité</th>
        <th>Statut</th>
        <th>Montant</th>
        <th>Localisation</th>
      </tr>
    </thead>
    <tbody>
      ${data.casSelectionnes.map(cas => `
        <tr>
          <td>${cas.id}</td>
          <td>${cas.titre}</td>
          <td>${cas.priorite}</td>
          <td>${cas.statut}</td>
          <td>${cas.montant}</td>
          <td>${cas.localisation}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>DÉTAILS PAR CAS</h2>
  ${data.casSelectionnes.map((cas, index) => `
    <div class="case-detail">
      <h3>CAS ${index + 1}: ${cas.titre}</h3>
      <p><strong>ID:</strong> ${cas.id}</p>
      <p><strong>Priorité:</strong> ${cas.priorite}</p>
      <p><strong>Statut:</strong> ${cas.statut}</p>
      <p><strong>Date de création:</strong> ${cas.dateCreation}</p>
      <p><strong>Secteur:</strong> ${cas.secteur}</p>
      <p><strong>Montant:</strong> ${cas.montant}</p>
      <p><strong>Localisation:</strong> ${cas.localisation}</p>
      <p><strong>Description:</strong> ${cas.description}</p>
    </div>
  `).join('')}
  
  <p style="text-align: center; margin-top: 40px; color: #95a5a6; font-size: 12px;">
    Rapport généré le ${new Date().toLocaleString('fr-FR')}
  </p>
</body>
</html>
    `;
    
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_Cas_${data.admin.organization}_${new Date().getTime()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Génère un rapport Word global (format HTML)
   */
  generateWordGlobal(data: RapportGlobalData): void {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2c3e50; text-align: center; }
    h2 { color: #2980b9; margin-top: 30px; }
    .info { margin: 20px 0; }
    .info p { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #2980b9; color: white; }
    tr:nth-child(even) { background-color: #f5f7fa; }
    .summary { background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>RAPPORT GLOBAL MINISTÈRE</h1>
  
  <div class="info">
    <p><strong>Administration:</strong> ${data.admin.organization}</p>
    <p><strong>Responsable:</strong> ${data.admin.nom}</p>
    <p><strong>Période:</strong> ${data.periode}</p>
    <p><strong>Du:</strong> ${data.dateDebut}</p>
    <p><strong>Au:</strong> ${data.dateFin}</p>
  </div>
  
  <div class="summary">
    <h2>RÉSUMÉ EXÉCUTIF</h2>
    <p><strong>Total des cas traités:</strong> ${data.totalCas}</p>
    <p><strong>Problématiques identifiées:</strong> ${data.totalProblematiques}</p>
    <p><strong>Impact financier total:</strong> ${data.impactFinancier.toLocaleString()} FCFA</p>
  </div>
  
  ${data.problematiques.length > 0 ? `
    <h2>PROBLÉMATIQUES IDENTIFIÉES</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Titre</th>
          <th>Impact</th>
          <th>Montant</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        ${data.problematiques.map(prob => `
          <tr>
            <td>${prob.id}</td>
            <td>${prob.titre}</td>
            <td>${prob.impact}</td>
            <td>${prob.montant}</td>
            <td>${prob.statut}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}
  
  ${data.recommandations.length > 0 ? `
    <h2>RECOMMANDATIONS PRÉSIDENTIELLES</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Recommandation</th>
          <th>Priorité</th>
          <th>Délai</th>
          <th>Responsable</th>
        </tr>
      </thead>
      <tbody>
        ${data.recommandations.map(rec => `
          <tr>
            <td>${rec.id}</td>
            <td>${rec.titre}</td>
            <td>${rec.priorite}</td>
            <td>${rec.delai}</td>
            <td>${rec.responsable}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}
  
  <p style="text-align: center; margin-top: 40px; color: #95a5a6; font-size: 12px;">
    Rapport ${data.periode} généré le ${new Date().toLocaleString('fr-FR')}
  </p>
</body>
</html>
    `;
    
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_Global_${data.admin.organization}_${data.periode}_${new Date().getTime()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const rapportGenerationService = new RapportGenerationService();

