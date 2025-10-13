import { useEffect, useRef, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  mode: string;
  icon: LucideIcon;
  label: string;
}

interface MobileBottomNavProps {
  items: NavItem[];
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export const MobileBottomNav = ({ items, activeMode, onModeChange }: MobileBottomNavProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;
      const itemWidth = 100; // Largeur approximative d'un item
      const centerPosition = scrollLeft + containerWidth / 2;
      const newCenterIndex = Math.round(centerPosition / itemWidth);
      setCenterIndex(Math.max(0, Math.min(newCenterIndex, items.length - 1)));
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => container.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  useEffect(() => {
    // Scroll to active item
    const activeIndex = items.findIndex(item => item.mode === activeMode);
    if (activeIndex !== -1 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = 100;
      const scrollPosition = activeIndex * itemWidth - container.offsetWidth / 2 + itemWidth / 2;
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [activeMode, items]);

  const getItemScale = (index: number) => {
    const distance = Math.abs(centerIndex - index);
    if (distance === 0) return 1.15; // Item au centre
    if (distance === 1) return 0.95; // Items adjacents
    return 0.8; // Items lointains
  };

  const getItemOpacity = (index: number) => {
    const distance = Math.abs(centerIndex - index);
    if (distance === 0) return 1;
    if (distance === 1) return 0.7;
    return 0.4;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-40 shadow-lg">
      <div className="relative overflow-hidden py-3">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 px-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeMode === item.mode;
            const isCentered = index === centerIndex;
            const scale = getItemScale(index);
            const opacity = getItemOpacity(index);

            return (
              <button
                key={item.mode}
                onClick={() => onModeChange(item.mode)}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-1 snap-center transition-all duration-300 ease-out"
                style={{
                  transform: `scale(${scale})`,
                  opacity: opacity,
                  minWidth: '80px',
                }}
              >
                <div
                  className={`
                    rounded-full p-3 transition-all duration-300
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                      : 'bg-muted/50 text-muted-foreground'
                    }
                    ${isCentered && !isActive ? 'ring-2 ring-primary/20' : ''}
                  `}
                  style={{
                    transform: isCentered ? 'translateY(-4px)' : 'translateY(0)',
                  }}
                >
                  <Icon className={`
                    transition-all duration-300
                    ${isActive ? 'h-6 w-6' : 'h-5 w-5'}
                  `} />
                </div>
                <span className={`
                  text-xs font-medium transition-all duration-300 whitespace-nowrap
                  ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
          {/* Padding pour permettre le centrage du dernier élément */}
          <div className="flex-shrink-0" style={{ width: 'calc(50vw - 40px)' }} />
        </div>
      </div>
    </div>
  );
};
