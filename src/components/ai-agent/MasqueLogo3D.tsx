import logoNdjobi from '@/assets/logo_ndjobi.png';

interface MasqueLogo3DProps {
  size?: number;
  animate?: boolean;
}

export default function MasqueLogo3D({ size = 64, animate = false }: MasqueLogo3DProps) {
  return (
    <div
      className={`flex items-center justify-center ${animate ? 'animate-pulse-slow' : ''}`}
      style={{ width: size, height: size }}
    >
      <img 
        src={logoNdjobi}
        alt="Logo Ndjobi"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
}
