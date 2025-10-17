// Stub temporaire pour protocolEtatService - nécessite des tables BD non présentes
export const protocolEtatService = {
  submitDecision: async () => ({ success: true, decisionId: 'stub' }),
  getDecisions: async () => [],
  getDecisionById: async () => null,
  updateDecision: async () => ({ success: true }),
  deleteDecision: async () => ({ success: true }),
  getStatistics: async () => ({ total: 0, approved: 0, rejected: 0, pending: 0 }),
  notifyStakeholders: async () => ({ success: true }),
};

export default protocolEtatService;
