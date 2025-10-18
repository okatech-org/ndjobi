// Stub temporaire - nécessite des tables BD non présentes

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const IAstedService = {
  analyzeData: async () => ({ analysis: 'stub analysis', confidence: 0.5 }),
  getSuggestions: async () => [],
  getPerformanceMetrics: async () => ({ cas_traites: 0, taux_succes: 0, delai_moyen_jours: 0, statut: 'active' }),
  getStatistics: async () => ({ total: 0, resolved: 0, pending: 0 }),
  generateReport: async () => ({ reportId: 'stub', data: {} }),
  sendMessage: async (message: string, context?: any) => ({
    success: true,
    response: `Réponse stub pour: ${message}`,
    content: `Réponse stub pour: ${message}`,
    suggestions: [],
    error: undefined as string | undefined
  }),
};

export default IAstedService;
