// Stub temporaire pour emergencyDecoder - nécessite des tables BD non présentes
export const emergencyDecoderService = {
  activateEmergencyProtocol: async () => ({ success: true, activationId: 'stub' }),
  deactivateProtocol: async () => ({ success: true }),
  decodeEmergencyData: async () => ({ success: true, data: {} }),
  recordEmergencyAccess: async () => ({ success: true }),
  notifyAuthorities: async () => ({ success: true }),
  getActiveProtocols: async () => [],
  getProtocolHistory: async () => [],
  validateJudicialAuth: async () => true,
};

export default emergencyDecoderService;
