import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export const ThemeToggle = ({ size = 'sm', variant = 'outline', className = '' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`gap-2 ${className}`}
      aria-label="Changer de thème"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden md:inline">Mode Clair</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden md:inline">Mode Sombre</span>
        </>
      )}
    </Button>
  );
};

