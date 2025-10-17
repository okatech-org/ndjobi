import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NationalKPIs } from './protocolEtatService';

interface ReportData {
  kpis: NationalKPIs;
  distributionRegionale: any[];
  performanceMinisteres: any[];
  casSensibles: any[];
  visionData: any[];
}

export class PDFReportService {
  
  private static addHeader(doc: jsPDF, title: string, subtitle: string) {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉPUBLIQUE GABONAISE', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Protocole d\'État - Dashboard Anticorruption', 105, 28, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(45, 95, 30);
    doc.text(title, 105, 40, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 105, 47, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    doc.line(20, 52, 190, 52);
  }

  private static addFooter(doc: jsPDF, pageNumber: number) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Document confidentiel - Usage interne Protocole d'État uniquement`,
      105,
      pageHeight - 15,
      { align: 'center' }
    );
    doc.text(
      `Page ${pageNumber} - Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
      105,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  static async genererRapportExecutif(data: ReportData): Promise<Blob> {
    const doc = new jsPDF();
    
    this.addHeader(
      doc,
      'RAPPORT EXÉCUTIF',
      'Synthèse Stratégique Anticorruption - Vision Gabon 2025'
    );

    let yPos = 60;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Indicateurs Clés de Performance (KPIs)', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const kpiData = [
      ['Indicateur', 'Valeur', 'Tendance'],
      ['Signalements Nationaux', data.kpis.total_signalements.toLocaleString(), data.kpis.tendance],
      ['Cas Critiques', data.kpis.signalements_critiques.toLocaleString(), 'En surveillance'],
      ['Taux de Résolution', `${data.kpis.taux_resolution}%`, 'Objectif: 85%'],
      ['Impact Économique', `${(data.kpis.impact_economique / 1000000000).toFixed(2)} Mrd FCFA`, 'Récupéré'],
      ['Score Transparence', `${data.kpis.score_transparence}/100`, 'Deuxième République']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [45, 95, 30] },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🎯 Vision Gabon Émergent 2025', 20, yPos);
    yPos += 10;

    const visionTableData = data.visionData.map(v => [
      v.pilier,
      `${v.score}/${v.objectif}`,
      v.budget,
      v.priorite
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Pilier Stratégique', 'Score/Objectif', 'Budget', 'Priorité']],
      body: visionTableData,
      theme: 'grid',
      headStyles: { fillColor: [45, 95, 30] },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🗺️ Distribution Régionale', 20, yPos);
    yPos += 10;

    const regionData = data.distributionRegionale.slice(0, 7).map(r => [
      r.region,
      r.cas.toString(),
      r.resolus.toString(),
      `${r.taux}%`,
      r.priorite
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Région', 'Cas', 'Résolus', 'Taux', 'Priorité']],
      body: regionData,
      theme: 'striped',
      headStyles: { fillColor: [45, 95, 30] },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠️ Cas Sensibles en Attente', 20, yPos);
    yPos += 10;

    if (data.casSensibles.length > 0) {
      const casData = data.casSensibles.slice(0, 5).map(c => [
        c.id,
        c.title?.substring(0, 40) || c.titre?.substring(0, 40) || 'N/A',
        c.type,
        c.priority || c.urgence || 'Moyenne',
        format(new Date(c.created_at), 'dd/MM/yyyy', { locale: fr })
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Référence', 'Titre', 'Type', 'Urgence', 'Date']],
        body: casData,
        theme: 'grid',
        headStyles: { fillColor: [255, 140, 0] },
        margin: { left: 20, right: 20 }
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('✓ Aucun cas sensible en attente de validation', 20, yPos);
    }

    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🏛️ Performance Ministérielle', 20, yPos);
    yPos += 10;

    const ministereData = data.performanceMinisteres.map(m => [
      m.ministere,
      m.signalements.toString(),
      m.critiques.toString(),
      `${m.taux}%`,
      m.responsable
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Ministère', 'Signalements', 'Critiques', 'Taux Résolution', 'Responsable']],
      body: ministereData,
      theme: 'striped',
      headStyles: { fillColor: [45, 95, 30] },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('📝 Recommandations Stratégiques', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const recommandations = [
      `• Maintenir la pression sur les ${data.kpis.signalements_critiques} cas critiques en attente`,
      `• Renforcer les capacités des régions à faible taux de résolution`,
      `• Poursuivre l'objectif de 85% de résolution (Vision 2025)`,
      `• Intensifier la coordination inter-ministérielle`,
      `• Valoriser les succès anticorruption auprès du public`
    ];

    recommandations.forEach(rec => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(rec, 20, yPos, { maxWidth: 170 });
      yPos += 7;
    });

    this.addFooter(doc, 1);

    return doc.output('blob');
  }

  static async genererRapportHebdomadaire(data: ReportData): Promise<Blob> {
    const doc = new jsPDF();
    
    this.addHeader(
      doc,
      'RAPPORT HEBDOMADAIRE',
      `Période du ${format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy', { locale: fr })} au ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`
    );

    let yPos = 60;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Synthèse de la Semaine', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total signalements : ${data.kpis.total_signalements}`, 20, yPos);
    yPos += 6;
    doc.text(`Nouveaux cas critiques : ${data.kpis.signalements_critiques}`, 20, yPos);
    yPos += 6;
    doc.text(`Taux de résolution : ${data.kpis.taux_resolution}%`, 20, yPos);
    yPos += 15;

    const kpiData = [
      ['KPI', 'Valeur Actuelle', 'Tendance'],
      ['Signalements', data.kpis.total_signalements.toLocaleString(), data.kpis.tendance],
      ['Taux Résolution', `${data.kpis.taux_resolution}%`, 'Stable'],
      ['Score Transparence', `${data.kpis.score_transparence}/100`, '+2 pts']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [45, 95, 30] },
      margin: { left: 20, right: 20 }
    });

    this.addFooter(doc, 1);

    return doc.output('blob');
  }

  static async genererRapportMensuel(data: ReportData): Promise<Blob> {
    const doc = new jsPDF();
    
    this.addHeader(
      doc,
      'RAPPORT MENSUEL',
      `Mois de ${format(new Date(), 'MMMM yyyy', { locale: fr })}`
    );

    let yPos = 60;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Mensuelle', 20, yPos);
    yPos += 10;

    const kpiData = [
      ['Indicateur', 'Valeur', 'Évolution'],
      ['Total Signalements', data.kpis.total_signalements.toLocaleString(), data.kpis.tendance],
      ['Cas Critiques', data.kpis.signalements_critiques.toLocaleString(), 'Surveillance renforcée'],
      ['Taux Résolution', `${data.kpis.taux_resolution}%`, 'Vers objectif 85%'],
      ['Fonds Récupérés', `${(data.kpis.impact_economique / 1000000000).toFixed(2)} Mrd`, 'Impact positif'],
      ['Score Transparence', `${data.kpis.score_transparence}/100`, 'Progression']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [45, 95, 30] },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribution Régionale Détaillée', 20, yPos);
    yPos += 10;

    const regionData = data.distributionRegionale.map(r => [
      r.region,
      r.cas.toString(),
      r.resolus.toString(),
      `${r.taux}%`,
      r.priorite
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Région', 'Cas Total', 'Résolus', 'Taux', 'Priorité']],
      body: regionData,
      theme: 'grid',
      headStyles: { fillColor: [45, 95, 30] },
      margin: { left: 20, right: 20 }
    });

    this.addFooter(doc, 1);

    return doc.output('blob');
  }

  static async genererRapportAnnuel(data: ReportData): Promise<Blob> {
    const doc = new jsPDF();
    
    this.addHeader(
      doc,
      'RAPPORT ANNUEL',
      `Année ${new Date().getFullYear()} - Vision Gabon Émergent 2025`
    );

    let yPos = 60;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Bilan Annuel de la Lutte Anticorruption', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ce rapport présente les réalisations de l'année ${new Date().getFullYear()} dans`, 20, yPos);
    yPos += 5;
    doc.text('le cadre de la stratégie nationale anticorruption et de la Vision Gabon 2025.', 20, yPos);
    yPos += 15;

    const kpiAnnuelData = [
      ['Indicateur Stratégique', 'Performance Annuelle', 'Objectif 2025'],
      ['Total Signalements Traités', data.kpis.total_signalements.toLocaleString(), '5000+'],
      ['Taux Résolution Global', `${data.kpis.taux_resolution}%`, '85%'],
      ['Fonds Récupérés (Mrd FCFA)', (data.kpis.impact_economique / 1000000000).toFixed(2), '10 Mrd'],
      ['Score Transparence Internationale', `${data.kpis.score_transparence}/100`, '90/100'],
      ['Ministères Mobilisés', '6', '12']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [kpiAnnuelData[0]],
      body: kpiAnnuelData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [45, 95, 30], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Piliers Stratégiques Vision 2025', 20, yPos);
    yPos += 10;

    const visionTableData = data.visionData.map(v => [
      v.pilier,
      `${v.score}/${v.objectif}`,
      `${Math.round((v.score / v.objectif) * 100)}%`,
      v.budget,
      v.priorite
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Pilier', 'Score', 'Progression', 'Budget', 'Priorité']],
      body: visionTableData,
      theme: 'striped',
      headStyles: { fillColor: [45, 95, 30] },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🎯 Objectifs Stratégiques 2025', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const objectifs = [
      '1. Atteindre 85% de taux de résolution des signalements',
      '2. Récupérer 10 milliards FCFA de fonds détournés',
      '3. Porter le score de transparence à 90/100',
      '4. Mobiliser les 12 ministères dans la lutte',
      '5. Former 200 agents DGSS supplémentaires',
      '6. Digitaliser 100% des procédures de signalement'
    ];

    objectifs.forEach(obj => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(obj, 20, yPos, { maxWidth: 170 });
      yPos += 7;
    });

    this.addFooter(doc, 1);

    return doc.output('blob');
  }

  static downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

