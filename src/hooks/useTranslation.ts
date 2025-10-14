import { analyticsService } from '@/services/monitoring/analyticsService';

const mockI18n = {
  language: 'fr',
  isInitialized: true,
  changeLanguage: async (lng: string) => {
    localStorage.setItem('ndjobi_language', lng);
    return Promise.resolve();
  },
  hasResourceBundle: () => true,
};

export const useTranslation = (namespace?: string) => {
  const changeLanguage = async (lng: string) => {
    try {
      await mockI18n.changeLanguage(lng);
      
      analyticsService.trackEvent('language_changed', {
        from_language: mockI18n.language,
        to_language: lng,
      });

      localStorage.setItem('ndjobi_language', lng);
      
      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  };

  const getCurrentLanguage = () => {
    return localStorage.getItem('ndjobi_language') || 'fr';
  };

  const getAvailableLanguages = () => {
    return [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
    ];
  };

  const isLanguageSupported = (lng: string) => {
    return ['fr', 'en'].includes(lng);
  };

  const detectBrowserLanguage = () => {
    const browserLang = navigator.language.split('-')[0];
    return isLanguageSupported(browserLang) ? browserLang : 'fr';
  };

  const translate = (key: string, defaultValue?: string, options?: any) => {
    return defaultValue || key;
  };

  const translateSafe = (key: string, values: Record<string, string | number> = {}, defaultValue?: string) => {
    const cleanValues: Record<string, string | number> = {};
    Object.entries(values).forEach(([k, v]) => {
      cleanValues[k] = typeof v === 'string' ? v.replace(/[<>&"']/g, '') : v;
    });

    return defaultValue || key;
  };

  const translatePlural = (key: string, count: number, options?: any) => {
    return key;
  };

  const translateDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = new Date(date);
    const locale = getCurrentLanguage() === 'fr' ? 'fr-FR' : 'en-US';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };

    return dateObj.toLocaleDateString(locale, defaultOptions);
  };

  const translateNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    const locale = getCurrentLanguage() === 'fr' ? 'fr-FR' : 'en-US';
    return number.toLocaleString(locale, options);
  };

  const translateCurrency = (amount: number, currency: string = 'XAF') => {
    const locale = getCurrentLanguage() === 'fr' ? 'fr-FR' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      currencyDisplay: currency === 'XAF' ? 'code' : 'symbol',
    }).format(amount);
  };

  const translateRelativeTime = (date: Date | string | number) => {
    const dateObj = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return getCurrentLanguage() === 'fr' ? 'À l\'instant' : 'Just now';
    }

    const rtf = new Intl.RelativeTimeFormat(
      getCurrentLanguage() === 'fr' ? 'fr' : 'en',
      { numeric: 'auto' }
    );

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return rtf.format(-minutes, 'minute');
    }

    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return rtf.format(-hours, 'hour');
    }

    const days = Math.floor(diffInSeconds / 86400);
    return rtf.format(-days, 'day');
  };

  const isReady = mockI18n.isInitialized && mockI18n.hasResourceBundle();

  return {
    t: translate,
    tSafe: translateSafe,
    tPlural: translatePlural,
    tDate: translateDate,
    tNumber: translateNumber,
    tCurrency: translateCurrency,
    tRelative: translateRelativeTime,
    i18n: mockI18n,
    currentLanguage: getCurrentLanguage(),
    availableLanguages: getAvailableLanguages(),
    changeLanguage,
    isLanguageSupported,
    detectBrowserLanguage,
    isReady,
  };
};

export const useFormTranslation = () => {
  const { t } = useTranslation();

  const getFieldError = (field: string, error?: any) => {
    if (!error) return '';
    return error.message || 'Erreur de validation';
  };

  const getRequiredMessage = (field: string) => {
    return 'Ce champ est requis';
  };

  return {
    t,
    getFieldError,
    getRequiredMessage,
  };
};

export const useErrorTranslation = () => {
  const { t } = useTranslation();

  const translateError = (error: any): string => {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.message) {
      return error.message;
    }

    return 'Une erreur est survenue';
  };

  return {
    translateError,
  };
};

export default useTranslation;
