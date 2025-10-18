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

export interface PresidentialDirective {
  id?: string;
  title: string;
  content: string;
  issued_by?: string;
  issued_at?: string;
  target_ministries: string[];
  priority: 'Haute' | 'Moyenne' | 'Basse';
  status?: 'active' | 'archived';
}

export interface SubAdminPerformance {
  id: string;
  user_id: string;
  nom: string;
  secteur: string;
  cas_traites: number;
  taux_succes: number;
  delai_moyen_jours: number;
  statut: 'Actif' | 'Attention' | 'Inactif';
}

export interface RegionalDistribution {
  region: string;
  cas: number;
  resolus: number;
  taux: number;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
}

/**
 * Service pour gérer le Protocole d'État - Dashboard Présidentiel
 */
export class ProtocolEtatService {
  
  /**
   * Enregistrer une décision présidentielle sur un cas sensible
   */
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

      // Mettre à jour le statut du signalement
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
      } else if (decision.decision_type === 'enquete') {
        await supabase
          .from('signalements')
          .update({ 
            status: 'under_investigation',
            priority: 'critique',
            metadata: { 
              presidential_investigation_requested: true,
              investigation_started_at: new Date().toISOString()
            }
          })
          .eq('id', decision.signalement_id);
      } else if (decision.decision_type === 'rejeter') {
        await supabase
          .from('signalements')
          .update({ 
            status: 'rejected',
            metadata: { 
              presidential_rejection: true,
              rejected_at: new Date().toISOString(),
              rejection_reason: decision.motif
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

  /**
   * Récupérer les cas sensibles nécessitant validation présidentielle
   */
  static async getCasSensibles() {
    try {
      const { data, error } = await supabase
        .from('signalements')
        .select('*')
        .eq('priority', 'critique')
        .in('status', ['pending', 'under_investigation', 'pending_validation'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Erreur récupération cas sensibles:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Calculer et récupérer les KPIs nationaux
   */
  static async getNationalKPIs(
    periodStart?: Date, 
    periodEnd?: Date
  ): Promise<NationalKPIs | null> {
    try {
      const startDate = periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = periodEnd || new Date();

      // Calculer les KPIs en temps réel
      const { data: signalements, error: sigError } = await supabase
        .from('signalements')
        .select('id, status, priority, created_at, metadata')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

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

      // Récupérer l'impact économique depuis les décisions présidentielles
      const { data: decisions } = await supabase
        .from('presidential_decisions')
        .select('metadata')
        .eq('decision_type', 'approuver')
        .gte('decided_at', startDate.toISOString());

      let impactEconomique = 0;
      decisions?.forEach(d => {
        const metadata = d.metadata as any;
        if (metadata && typeof metadata === 'object' && metadata.montant_recupere) {
          impactEconomique += parseFloat(metadata.montant_recupere);
        }
      });

      // Score de transparence (calcul simplifié)
      const scoreTransparence = Math.min(
        100,
        Math.round(50 + (tauxResolution * 0.3) + Math.min(totalSignalements / 10, 20))
      );

      // Calculer la tendance
      const lastMonth = signalements?.filter(s => {
        const created = new Date(s.created_at);
        const lastMonthStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const lastMonthEnd = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return created >= lastMonthStart && created <= lastMonthEnd;
      }).length || 1;

      const tendanceValue = lastMonth > 0 
        ? Math.round(((totalSignalements - lastMonth) / lastMonth) * 100)
        : 0;

      const tendance = tendanceValue > 0 ? `+${tendanceValue}%` : `${tendanceValue}%`;

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

  /**
   * Récupérer la performance des Sous-Admins
   */
  static async getSubAdminPerformance(): Promise<SubAdminPerformance[]> {
    try {
      // Récupérer les sous-admins
      const { data: subAdmins, error: subError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles!inner(
            id,
            full_name,
            organization
          )
        `)
        .eq('role', 'sub_admin');

      if (subError) throw subError;

      if (!subAdmins || subAdmins.length === 0) {
        return [];
      }

      // Calculer les performances pour chaque sous-admin
      const performances: SubAdminPerformance[] = [];

      for (const subAdmin of subAdmins) {
        const userId = subAdmin.user_id;
        const profile = Array.isArray(subAdmin.profiles) 
          ? subAdmin.profiles[0] 
          : subAdmin.profiles;

        // Compter les cas assignés
        const { data: casAssignes, error: casError } = await supabase
          .from('signalements')
          .select('id, status, created_at, updated_at')
          .eq('resolved_by', userId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (casError) {
          console.error('Erreur cas assignés:', casError);
          continue;
        }

        const casTraites = casAssignes?.length || 0;
        const casResolus = casAssignes?.filter(
          c => c.status === 'resolved' || c.status === 'closed'
        ).length || 0;

        const tauxSucces = casTraites > 0 
          ? Math.round((casResolus / casTraites) * 100) 
          : 0;

        // Calculer le délai moyen
        let delaiMoyen = 0;
        if (casResolus > 0) {
          const delais = casAssignes!
            .filter(c => c.status === 'resolved' || c.status === 'closed')
            .map(c => {
              const created = new Date(c.created_at);
              const updated = new Date(c.updated_at);
              return (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            });
          
          delaiMoyen = delais.reduce((a, b) => a + b, 0) / delais.length;
        }

        // Déterminer le statut
        let statut: 'Actif' | 'Attention' | 'Inactif' = 'Actif';
        if (tauxSucces < 50) {
          statut = 'Attention';
        }
        if (casTraites === 0) {
          statut = 'Inactif';
        }

        performances.push({
          id: userId,
          user_id: userId,
          nom: profile?.full_name || 'N/A',
          secteur: profile?.organization || 'N/A',
          cas_traites: casTraites,
          taux_succes: tauxSucces,
          delai_moyen_jours: Math.round(delaiMoyen * 10) / 10,
          statut
        });
      }

      return performances.sort((a, b) => b.taux_succes - a.taux_succes);

    } catch (error: any) {
      console.error('Erreur récupération performance Sous-Admins:', error);
      return [];
    }
  }

  /**
   * Générer un rapport stratégique
   */
  static async genererRapportStrategique(
    type: 'executif' | 'hebdomadaire' | 'mensuel' | 'annuel'
  ): Promise<{ success: boolean; reportUrl?: string; error?: string }> {
    try {
      console.log(`Génération rapport ${type} en cours...`);
      
      // TODO: Implémentation complète avec génération PDF
      // Pour l'instant, retourner une simulation
      return { 
        success: true, 
        reportUrl: `/reports/rapport-${type}-${new Date().toISOString().split('T')[0]}.pdf` 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Diffuser une directive présidentielle
   */
  static async diffuserDirective(
    directive: Omit<PresidentialDirective, 'id' | 'issued_by' | 'issued_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('presidential_directives')
        .insert({
          ...directive,
          issued_by: userData?.user?.id,
          issued_at: new Date().toISOString(),
          status: 'active'
        });

      if (error) throw error;

      console.log(`Directive diffusée à ${directive.target_ministries.length} ministères`);

      return { success: true };
    } catch (error: any) {
      console.error('Erreur diffusion directive:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer la distribution régionale des cas
   */
  static async getDistributionRegionale(): Promise<RegionalDistribution[]> {
    try {
      const { data, error } = await supabase
        .from('signalements')
        .select('location, status, priority')
        .not('location', 'is', null);

      if (error) throw error;

      // Grouper par région (simplification)
      const regionMap = new Map<string, RegionalDistribution>();
      
      data?.forEach(sig => {
        const region = sig.location || 'Non spécifié';
        if (!regionMap.has(region)) {
          regionMap.set(region, { 
            region, 
            cas: 0, 
            resolus: 0, 
            taux: 0,
            priorite: 'Moyenne' 
          });
        }
        const stats = regionMap.get(region)!;
        stats.cas++;
        if (sig.status === 'resolved' || sig.status === 'closed') {
          stats.resolus++;
        }
        
        // Ajuster la priorité selon le nombre de cas
        if (stats.cas > 10) {
          stats.priorite = 'Haute';
        } else if (stats.cas > 5) {
          stats.priorite = 'Moyenne';
        } else {
          stats.priorite = 'Basse';
        }
      });

      const distribution = Array.from(regionMap.values()).map(r => ({
        ...r,
        taux: r.cas > 0 ? Math.round((r.resolus / r.cas) * 100) : 0
      }));

      return distribution.sort((a, b) => b.cas - a.cas);
    } catch (error: any) {
      console.error('Erreur distribution régionale:', error);
      return [];
    }
  }

  /**
   * Récupérer les directives présidentielles actives
   */
  static async getDirectivesActives() {
    try {
      const { data, error } = await supabase
        .from('presidential_directives')
        .select('*')
        .eq('status', 'active')
        .order('issued_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Erreur récupération directives:', error);
      return { data: [], error: error.message };
    }
  }
}
