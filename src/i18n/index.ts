const mockI18n = {
  language: 'fr',
  isInitialized: true,
  changeLanguage: async (lng: string) => {
    console.info(`[i18n Mock] Language changed to: ${lng}`);
    return Promise.resolve();
  },
  hasResourceBundle: () => true,
  t: (key: string, defaultValue?: string) => defaultValue || key,
};

export default mockI18n;
