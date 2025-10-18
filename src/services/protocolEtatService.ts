// Stub temporaire - nécessite des tables BD non présentes

export interface NationalKPIs {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  total_signalements?: number;
  tendance?: string;
  signalements_critiques?: number;
  taux_resolution?: number;
  impact_economique?: number;
  score_transparence?: number;
}

export const ProtocolEtatService = {
  submitDecision: async () => ({ success: true, decisionId: 'stub' }),
  getDecisions: async () => [],
  getDecisionById: async () => null,
  updateDecision: async () => ({ success: true }),
  deleteDecision: async () => ({ success: true }),
  getStatistics: async (): Promise<NationalKPIs> => ({ 
    total: 0, approved: 0, rejected: 0, pending: 0,
    total_signalements: 0, tendance: '+0%', signalements_critiques: 0,
    taux_resolution: 0, impact_economique: 0, score_transparence: 0
  }),
  getNationalKPIs: async (): Promise<NationalKPIs> => ({ 
    total: 0, approved: 0, rejected: 0, pending: 0,
    total_signalements: 0, tendance: '+0%', signalements_critiques: 0,
    taux_resolution: 0, impact_economique: 0, score_transparence: 0
  }),
  getCasSensibles: async () => ({ data: [] }),
  getDistributionRegionale: async () => [],
  getPerformanceMinisteres: async () => [],
  getSousAdmins: async () => [],
  getEvolutionMensuelle: async () => [],
  getVisionData: async () => [],
  enregistrerDecisionPresidentielle: async (_data: any) => ({ success: true, error: undefined as string | undefined }),
  genererRapportStrategique: async (_type: string, _filters: any) => ({ success: true, reportId: 'stub', error: undefined as string | undefined }),
  notifyStakeholders: async () => ({ success: true }),
};

export default ProtocolEtatService;
