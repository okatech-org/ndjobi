import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PINInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const PINInput = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
  autoFocus = true
}: PINInputProps) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Diviser la valeur en tableau de caractères
  const values = value.split('').slice(0, length);
  
  // Remplir avec des chaînes vides si nécessaire
  while (values.length < length) {
    values.push('');
  }

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // Appeler onComplete quand le PIN est complet
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Ne garder que les chiffres
    const numericValue = inputValue.replace(/\D/g, '');
    
    if (numericValue.length > 1) {
      // Si plusieurs chiffres sont collés, les répartir
      const digits = numericValue.split('');
      let newValue = [...values];
      
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newValue[index + i] = digit;
        }
      });
      
      const finalValue = newValue.join('');
      onChange(finalValue);
      
      // Focus sur le prochain champ vide ou le dernier
      const nextIndex = Math.min(index + digits.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      // Un seul chiffre
      const newValues = [...values];
      newValues[index] = numericValue;
      const newValue = newValues.join('');
      onChange(newValue);
      
      // Passer au champ suivant si un chiffre est entré
      if (numericValue && index < length - 1) {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (values[index]) {
        // Effacer le chiffre actuel
        const newValues = [...values];
        newValues[index] = '';
        onChange(newValues.join(''));
      } else if (index > 0) {
        // Aller au champ précédent et l'effacer
        const newValues = [...values];
        newValues[index - 1] = '';
        onChange(newValues.join(''));
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length > 0) {
      const newValues = [...values];
      const digits = pastedData.split('');
      
      digits.forEach((digit, i) => {
        if (i < length) {
          newValues[i] = digit;
        }
      });
      
      onChange(newValues.join(''));
      
      // Focus sur le dernier champ rempli ou le premier vide
      const lastFilledIndex = Math.min(digits.length - 1, length - 1);
      if (inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex].focus();
      }
    }
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={6} // Permettre le collage de plusieurs chiffres
          value={values[index]}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold border-2 transition-all duration-200",
            "focus:ring-2 focus:ring-primary focus:border-primary",
            error && "border-destructive focus:border-destructive focus:ring-destructive",
            focusedIndex === index && "scale-105",
            "rounded-lg"
          )}
          autoComplete="off"
        />
      ))}
    </div>
  );
};
