import { supabase } from '@/integrations/supabase/client';

export interface PresidentialDecision {
  id?: string;
  signalement_id: string;
  decision_type: 'approuver' | 'rejeter' | 'enquete';
  motif?: string;
  decided_by?: string;
  decided_at?: string;
  metadata?: any;
}

export interface NationalKPIs {
  total_signalements: number;
  signalements_critiques: number;
  taux_resolution: number;
  impact_economique: number;
  score_transparence: number;
  tendance: string;
}

export interface PerformanceMinistere {
  ministere: string;
  signalements: number;
  critiques: number;
  taux: number;
  responsable: string;
}

export interface SousAdmin {
  nom: string;
  secteur: string;
  casTraites: number;
  taux: number;
  delai: string;
  statut: 'Actif' | 'Attention' | 'Inactif';
}

export interface DistributionRegionale {
  region: string;
  cas: number;
  resolus: number;
  taux: number;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
}

export class ProtocolEtatService {
  
  static async enregistrerDecisionPresidentielle(
    decision: PresidentialDecision
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('presidential_decisions')
        .insert({
          ...decision,
          decided_by: userData?.user?.id,
          decided_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (decision.decision_type === 'approuver') {
        await supabase
          .from('signalements')
          .update({ 
            status: 'validated_presidential',
            priority: 'critique',
            metadata: { 
              presidential_approval: true,
              approved_at: new Date().toISOString()
            }
          })
          .eq('id', decision.signalement_id);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erreur enregistrement décision:', error);
      return { success: false, error: error.message };
    }
  }

  static async getCasSensibles() {
    try {
      const { data, error } = await supabase
        .from('signalements')
        .select('*')
        .or('priority.eq.critique,ai_priority_score.gte.85')
        .in('status', ['nouveau', 'pending', 'under_investigation'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Erreur récupération cas sensibles:', error);
      return { data: [], error: error.message };
    }
  }

  static async getNationalKPIs(
    periodStart?: Date, 
    periodEnd?: Date
  ): Promise<NationalKPIs | null> {
    try {
      const startDate = periodStart?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = periodEnd?.toISOString() || new Date().toISOString();

      const { data: signalements, error: sigError } = await supabase
        .from('signalements')
        .select('id, status, priority, metadata, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (sigError) throw sigError;

      const totalSignalements = signalements?.length || 0;
      const signalementsCritiques = signalements?.filter(
        s => s.priority === 'critique'
      ).length || 0;

      const resolved = signalements?.filter(
        s => s.status === 'resolved' || s.status === 'closed'
      ).length || 0;

      const tauxResolution = totalSignalements > 0 
        ? Math.round((resolved / totalSignalements) * 100) 
        : 0;

      const { data: decisions } = await supabase
        .from('presidential_decisions')
        .select('metadata')
        .eq('decision_type', 'approuver');

      let impactEconomique = 0;
      decisions?.forEach(d => {
        if (d.metadata?.montant_recupere) {
          impactEconomique += parseFloat(d.metadata.montant_recupere);
        }
      });

      const scoreTransparence = Math.min(
        100,
        Math.round(50 + (tauxResolution * 0.3) + (totalSignalements / 100))
      );

      const { data: previousPeriod } = await supabase
        .from('signalements')
        .select('id')
        .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', startDate);

      const previousCount = previousPeriod?.length || 1;
      const tendance = totalSignalements > previousCount 
        ? `+${Math.round(((totalSignalements - previousCount) / previousCount) * 100)}%`
        : `${Math.round(((totalSignalements - previousCount) / previousCount) * 100)}%`;

      return {
        total_signalements: totalSignalements,
        signalements_critiques: signalementsCritiques,
        taux_resolution: tauxResolution,
        impact_economique: impactEconomique,
        score_transparence: scoreTransparence,
        tendance
      };

    } catch (error: any) {
      console.error('Erreur calcul KPIs nationaux:', error);
      return null;
    }
  }

  static async getDistributionRegionale(): Promise<DistributionRegionale[]> {
    try {
      const { data, error } = await supabase
        .from('signalements')
        .select('location, status, priority')
        .not('location', 'is', null);

      if (error) throw error;

      const regionMap = new Map<string, { cas: number; resolus: number }>();
      
      data?.forEach(sig => {
        const region = sig.location || 'Non spécifié';
        if (!regionMap.has(region)) {
          regionMap.set(region, { cas: 0, resolus: 0 });
        }
        const stats = regionMap.get(region)!;
        stats.cas++;
        if (sig.status === 'resolved' || sig.status === 'closed') {
          stats.resolus++;
        }
      });

      const distribution: DistributionRegionale[] = Array.from(regionMap.entries()).map(([region, stats]) => ({
        region,
        cas: stats.cas,
        resolus: stats.resolus,
        taux: stats.cas > 0 ? Math.round((stats.resolus / stats.cas) * 100) : 0,
        priorite: stats.taux < 60 ? 'Haute' : stats.taux < 75 ? 'Moyenne' : 'Basse'
      }));

      return distribution;
    } catch (error: any) {
      console.error('Erreur distribution régionale:', error);
      return [];
    }
  }

  static async getPerformanceMinisteres(): Promise<PerformanceMinistere[]> {
    try {
      const mockData: PerformanceMinistere[] = [
        { ministere: 'Défense', signalements: 78, critiques: 12, taux: 82, responsable: 'DGSS' },
        { ministere: 'Intérieur', signalements: 134, critiques: 23, taux: 67, responsable: 'DGR' },
        { ministere: 'Justice', signalements: 89, critiques: 18, taux: 71, responsable: 'DGLIC' },
        { ministere: 'Économie', signalements: 156, critiques: 34, taux: 58, responsable: 'DGE' },
        { ministere: 'Santé', signalements: 67, critiques: 8, taux: 76, responsable: 'CNAMGS' },
        { ministere: 'Éducation', signalements: 92, critiques: 14, taux: 69, responsable: 'DGES' }
      ];

      return mockData;
    } catch (error: any) {
      console.error('Erreur performance ministères:', error);
      return [];
    }
  }

  static async getSousAdmins(): Promise<SousAdmin[]> {
    try {
      const mockData: SousAdmin[] = [
        { nom: 'Directeur DGSS', secteur: 'Sécurité', casTraites: 234, taux: 78, delai: '12j', statut: 'Actif' },
        { nom: 'Directeur DGR', secteur: 'Renseignement', casTraites: 189, taux: 82, delai: '8j', statut: 'Actif' },
        { nom: 'Directeur DGLIC', secteur: 'Enrichissement illicite', casTraites: 156, taux: 74, delai: '15j', statut: 'Actif' },
        { nom: 'Directeur DGE', secteur: 'Économie', casTraites: 278, taux: 65, delai: '18j', statut: 'Attention' }
      ];

      return mockData;
    } catch (error: any) {
      console.error('Erreur sous-admins:', error);
      return [];
    }
  }

  static async getEvolutionMensuelle() {
    try {
      return [
        { mois: 'Juil', signalements: 87, resolutions: 52, corruption: 65, budget: 450 },
        { mois: 'Août', signalements: 103, resolutions: 68, corruption: 58, budget: 620 },
        { mois: 'Sept', signalements: 118, resolutions: 75, corruption: 52, budget: 890 },
        { mois: 'Oct', signalements: 142, resolutions: 89, corruption: 48, budget: 1200 },
        { mois: 'Nov', signalements: 156, resolutions: 103, corruption: 42, budget: 1450 },
        { mois: 'Déc', signalements: 134, resolutions: 97, corruption: 38, budget: 1320 }
      ];
    } catch (error: any) {
      console.error('Erreur évolution mensuelle:', error);
      return [];
    }
  }

  static async getVisionData() {
    try {
      return [
        { pilier: 'Gabon Vert', score: 72, objectif: 85, budget: '450M FCFA', priorite: 'Haute' },
        { pilier: 'Gabon Industriel', score: 58, objectif: 75, budget: '890M FCFA', priorite: 'Critique' },
        { pilier: 'Gabon Services', score: 81, objectif: 85, budget: '320M FCFA', priorite: 'Moyenne' },
        { pilier: 'Gouvernance', score: 66, objectif: 90, budget: '180M FCFA', priorite: 'Haute' }
      ];
    } catch (error: any) {
      console.error('Erreur vision data:', error);
      return [];
    }
  }

  static async genererRapportStrategique(
    type: 'executif' | 'hebdomadaire' | 'mensuel' | 'annuel',
    data?: {
      kpis: any;
      distributionRegionale: any[];
      performanceMinisteres: any[];
      casSensibles: any[];
      visionData: any[];
    }
  ): Promise<{ success: boolean; reportUrl?: string; error?: string }> {
    try {
      console.log(`Génération rapport ${type} en cours...`);
      
      if (!data) {
        return { 
          success: true, 
          reportUrl: `/reports/rapport-${type}-${new Date().getFullYear()}.pdf` 
        };
      }

      const { PDFReportService } = await import('./pdfReportService');
      
      let blob: Blob;
      const timestamp = new Date().toISOString().split('T')[0];
      let filename = `rapport-${type}-${timestamp}.pdf`;

      switch (type) {
        case 'executif':
          blob = await PDFReportService.genererRapportExecutif(data);
          break;
        case 'hebdomadaire':
          blob = await PDFReportService.genererRapportHebdomadaire(data);
          break;
        case 'mensuel':
          blob = await PDFReportService.genererRapportMensuel(data);
          break;
        case 'annuel':
          blob = await PDFReportService.genererRapportAnnuel(data);
          break;
        default:
          throw new Error(`Type de rapport inconnu: ${type}`);
      }

      PDFReportService.downloadPDF(blob, filename);
      
      return { 
        success: true, 
        reportUrl: URL.createObjectURL(blob)
      };
    } catch (error: any) {
      console.error('Erreur génération rapport:', error);
      return { success: false, error: error.message };
    }
  }

  static async diffuserDirective(
    title: string,
    content: string,
    targetMinistries: string[],
    priority: 'Haute' | 'Moyenne' | 'Basse'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('presidential_directives')
        .insert({
          title,
          content,
          issued_by: userData?.user?.id,
          target_ministries: targetMinistries,
          priority,
          status: 'active'
        });

      if (error) throw error;

      console.log(`Directive diffusée à ${targetMinistries.length} ministères`);

      return { success: true };
    } catch (error: any) {
      console.error('Erreur diffusion directive:', error);
      return { success: false, error: error.message };
    }
  }
}

