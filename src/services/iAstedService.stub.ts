// Stub temporaire pour iAstedService - nécessite des tables BD non présentes
export const iAstedService = {
  analyzeData: async () => ({ analysis: 'stub analysis', confidence: 0.5 }),
  getSuggestions: async () => [],
  getPerformanceMetrics: async () => ({ cas_traites: 0, taux_succes: 0, delai_moyen_jours: 0, statut: 'active' }),
  getStatistics: async () => ({ total: 0, resolved: 0, pending: 0 }),
  generateReport: async () => ({ reportId: 'stub', data: {} }),
};

export default iAstedService;
