// Configuration des formats de numéros de téléphone par pays
export interface PhoneFormat {
  countryCode: string;
  countryName: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
  pattern: RegExp;
  example: string;
}

export const phoneFormats: Record<string, PhoneFormat> = {
  '+241': {
    countryCode: '+241',
    countryName: 'Gabon',
    flag: '🇬🇦',
    minDigits: 8,
    maxDigits: 8,
    pattern: /^\d{8}$/,
    example: '77 777 001'
  },
  '+242': {
    countryCode: '+242',
    countryName: 'Congo',
    flag: '🇨🇬',
    minDigits: 8,
    maxDigits: 9,
    pattern: /^\d{8,9}$/,
    example: '06 123 456'
  },
  '+237': {
    countryCode: '+237',
    countryName: 'Cameroun',
    flag: '🇨🇲',
    minDigits: 8,
    maxDigits: 9,
    pattern: /^\d{8,9}$/,
    example: '6 12 34 56 78'
  },
  '+225': {
    countryCode: '+225',
    countryName: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    minDigits: 8,
    maxDigits: 10,
    pattern: /^\d{8,10}$/,
    example: '07 12 34 56 78'
  },
  '+33': {
    countryCode: '+33',
    countryName: 'France',
    flag: '🇫🇷',
    minDigits: 9,
    maxDigits: 9,
    pattern: /^\d{9}$/,
    example: '6 12 34 56 78'
  },
  '+32': {
    countryCode: '+32',
    countryName: 'Belgique',
    flag: '🇧🇪',
    minDigits: 8,
    maxDigits: 9,
    pattern: /^\d{8,9}$/,
    example: '4 12 34 56 78'
  },
  '+49': {
    countryCode: '+49',
    countryName: 'Allemagne',
    flag: '🇩🇪',
    minDigits: 10,
    maxDigits: 12,
    pattern: /^\d{10,12}$/,
    example: '151 12345678'
  },
  '+44': {
    countryCode: '+44',
    countryName: 'Royaume-Uni',
    flag: '🇬🇧',
    minDigits: 10,
    maxDigits: 11,
    pattern: /^\d{10,11}$/,
    example: '7700 900123'
  },
  '+34': {
    countryCode: '+34',
    countryName: 'Espagne',
    flag: '🇪🇸',
    minDigits: 9,
    maxDigits: 9,
    pattern: /^\d{9}$/,
    example: '612 345 678'
  },
  '+221': {
    countryCode: '+221',
    countryName: 'Sénégal',
    flag: '🇸🇳',
    minDigits: 8,
    maxDigits: 9,
    pattern: /^\d{8,9}$/,
    example: '77 123 45 67'
  },
  '+212': {
    countryCode: '+212',
    countryName: 'Maroc',
    flag: '🇲🇦',
    minDigits: 8,
    maxDigits: 9,
    pattern: /^\d{8,9}$/,
    example: '6 12 34 56 78'
  },
  '+27': {
    countryCode: '+27',
    countryName: 'Afrique du Sud',
    flag: '🇿🇦',
    minDigits: 9,
    maxDigits: 9,
    pattern: /^\d{9}$/,
    example: '82 123 4567'
  },
  '+233': {
    countryCode: '+233',
    countryName: 'Ghana',
    flag: '🇬🇭',
    minDigits: 8,
    maxDigits: 9,
    pattern: /^\d{8,9}$/,
    example: '24 123 4567'
  },
  '+240': {
    countryCode: '+240',
    countryName: 'Guinée équatoriale',
    flag: '🇬🇶',
    minDigits: 8,
    maxDigits: 9,
    pattern: /^\d{8,9}$/,
    example: '22 123 456'
  },
  '+1': {
    countryCode: '+1',
    countryName: 'États-Unis/Canada',
    flag: '🇺🇸🇨🇦',
    minDigits: 10,
    maxDigits: 10,
    pattern: /^\d{10}$/,
    example: '555 123 4567'
  },
  '+86': {
    countryCode: '+86',
    countryName: 'Chine',
    flag: '🇨🇳',
    minDigits: 11,
    maxDigits: 11,
    pattern: /^\d{11}$/,
    example: '138 0013 8000'
  }
};

// Fonction pour obtenir le format d'un pays
export const getPhoneFormat = (countryCode: string): PhoneFormat | null => {
  return phoneFormats[countryCode] || null;
};

// Fonction pour valider un numéro selon le pays
export const validatePhoneNumber = (phoneNumber: string, countryCode: string): { isValid: boolean; message?: string } => {
  const format = getPhoneFormat(countryCode);
  
  if (!format) {
    return { isValid: false, message: 'Pays non supporté' };
  }

  const cleanNumber = phoneNumber.trim();
  
  if (cleanNumber.length < format.minDigits) {
    return { 
      isValid: false, 
      message: `Numéro trop court (${format.minDigits} chiffres minimum)` 
    };
  }
  
  if (cleanNumber.length > format.maxDigits) {
    return { 
      isValid: false, 
      message: `Numéro trop long (${format.maxDigits} chiffres maximum)` 
    };
  }
  
  if (!format.pattern.test(cleanNumber)) {
    return { 
      isValid: false, 
      message: `Format invalide pour ${format.countryName}` 
    };
  }
  
  return { isValid: true };
};

// Fonction pour obtenir le message d'erreur personnalisé
export const getPhoneErrorMessage = (countryCode: string): string => {
  const format = getPhoneFormat(countryCode);
  if (!format) return 'Pays non supporté';
  
  if (format.minDigits === format.maxDigits) {
    return `Numéro de téléphone invalide (${format.minDigits} chiffres requis)`;
  } else {
    return `Numéro de téléphone invalide (${format.minDigits}-${format.maxDigits} chiffres)`;
  }
};
