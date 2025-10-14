import { useState, useEffect } from 'react';

type SupportedLanguage = 'fr' | 'en' | 'ar';

const STORAGE_KEY = 'ndjobi-preferred-language';

export const useLanguageDetector = () => {
  const [language, setLanguage] = useState<SupportedLanguage>('fr');
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  useEffect(() => {
    detectLanguage();
  }, []);

  const detectLanguage = () => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    
    if (stored && ['fr', 'en', 'ar'].includes(stored)) {
      setLanguage(stored);
      setIsAutoDetected(false);
      return;
    }

    const browserLang = navigator.language.toLowerCase();
    let detected: SupportedLanguage = 'fr';

    if (browserLang.startsWith('en')) {
      detected = 'en';
    } else if (browserLang.startsWith('ar')) {
      detected = 'ar';
    } else if (browserLang.startsWith('fr')) {
      detected = 'fr';
    }

    const countryCode = getCountryFromBrowser();
    if (countryCode === 'GA' || countryCode === 'GQ' || countryCode === 'CM') {
      detected = 'fr';
    }

    setLanguage(detected);
    setIsAutoDetected(true);
    saveLanguage(detected);
  };

  const getCountryFromBrowser = (): string | null => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const africaTimezones: Record<string, string> = {
      'Africa/Libreville': 'GA',
      'Africa/Douala': 'CM',
      'Africa/Malabo': 'GQ',
    };

    return africaTimezones[timezone] || null;
  };

  const changeLanguage = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    saveLanguage(newLang);
    setIsAutoDetected(false);

    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const saveLanguage = (lang: SupportedLanguage) => {
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const getAvailableLanguages = (): { code: SupportedLanguage; label: string; flag: string }[] => {
    return [
      { code: 'fr', label: 'Français', flag: '🇫🇷' },
      { code: 'en', label: 'English', flag: '🇬🇧' },
      { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    ];
  };

  const isRTL = (): boolean => {
    return language === 'ar';
  };

  return {
    language,
    isAutoDetected,
    changeLanguage,
    getAvailableLanguages,
    isRTL,
  };
};

