import { useState, useRef, useEffect } from 'react';
import { IAstedButton } from '@/components/ui/iAstedButton';
import { IAstedChat } from './IAstedChat';

export function IAstedFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768; // md breakpoint
      setIsMobile(mobile);
      
      const savedPosition = localStorage.getItem('iasted_button_position');
      if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        setPosition({ x, y });
      } else {
        setPosition({ 
          x: mobile ? window.innerWidth - 120 : window.innerWidth - 200,
          y: mobile ? window.innerHeight - 140 : window.innerHeight - 200 
        });
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const maxX = window.innerWidth - 100; // marge pour mobile
    const maxY = window.innerHeight - 100;

    const boundedX = Math.max(20, Math.min(newX, maxX));
    const boundedY = Math.max(20, Math.min(newY, maxY));

    setPosition({ x: boundedX, y: boundedY });
  };

  // Support tactile pour mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    const boundedX = Math.max(12, Math.min(newX, maxX));
    const boundedY = Math.max(12, Math.min(newY, maxY));
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('iasted_button_position', JSON.stringify(position));
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('iasted_button_position', JSON.stringify(position));
    }
  };

  const handleClick = () => {
    if (!isDragging) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

  return (
    <>
      <div
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 2147483646,
          transition: isDragging ? 'none' : 'all 0.3s',
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scale(0)' : 'scale(1)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div onClick={handleClick}>
          <IAstedButton size={isMobile ? 'md' : 'lg'} />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <IAstedChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

