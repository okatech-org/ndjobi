// Stub temporaire pour deviceIdentity - nécessite des tables BD non présentes
export const deviceIdentityService = {
  initializeDevice: async () => ({ success: true, deviceId: 'stub-device-id' }),
  getCurrentDevice: () => ({ deviceId: 'stub-device-id', fingerprint: 'stub' }),
  linkDeviceToUser: async () => ({ success: true }),
  migrateDeviceData: async () => ({ success: true }),
  getDeviceHistory: async () => [],
  getLinkedDevices: async () => [],
  unlinkDevice: async () => ({ success: true }),
  verifyDeviceOwnership: async () => true,
  getDeviceStats: async () => ({ total: 0, linked: 0, anonymous: 0 }),
};

export default deviceIdentityService;
