// components/Cover.tsx
import Image from 'next/image';

const PALETTES = [
  ['#3a0a1f', '#7a0030', '#ff1f6d'],
  ['#0a1230', '#001a3a', '#5ec8ff'],
  ['#1a0a30', '#3a0050', '#b855ff'],
  ['#2a0a0a', '#5a0a00', '#ff6b1a'],
  ['#0a1f1a', '#003a2a', '#1ff39d'],
  ['#1a1a0a', '#3a3a00', '#ffd400'],
  ['#0a0a0a', '#1a0a1a', '#ff2d55'],
  ['#1a0a1f', '#3a0030', '#ff1f6d'],
] as const;

export interface CoverProps {
  src?: string;
  alt: string;
  paletteSeed?: number;
  ratio?: 'portrait' | 'square' | 'wide';
  className?: string;
  priority?: boolean;
  showTexture?: boolean;
}

export function Cover({ src, alt, paletteSeed = 0, ratio = 'portrait', className = '', priority, showTexture = false }: CoverProps) {
  const aspect =
    ratio === 'wide' ? 'aspect-[16/9]' :
    ratio === 'square' ? 'aspect-square' : 'aspect-[2/3]';
  const [bg1, bg2, acc] = PALETTES[Math.abs(paletteSeed) % PALETTES.length];

  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-md ${aspect} ${className}`}>
        <Image src={src} alt={alt} fill priority={priority}
          sizes="(max-width: 768px) 50vw, 200px" className="object-cover" />
        {showTexture && <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 0.8px, transparent 1.2px)', backgroundSize: '4px 4px' }} />}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-md ${aspect} ${className}`}
      style={{ background: `radial-gradient(circle at 30% 25%, ${acc}66, transparent 55%), linear-gradient(160deg, ${bg1}, ${bg2})` }}
      aria-label={alt} role="img">
      <div className="absolute inset-0 opacity-60" style={{
        background: 'repeating-linear-gradient(108deg, transparent 0 5px, rgba(255,255,255,0.07) 5px 6px, transparent 6px 14px)',
      }} />
      <div className="absolute right-[-6px] bottom-[-6px] w-1/2 h-1/2 opacity-50" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1.4px)',
        backgroundSize: '4px 4px',
        WebkitMaskImage: 'radial-gradient(ellipse at bottom right, #000, transparent 70%)',
        maskImage: 'radial-gradient(ellipse at bottom right, #000, transparent 70%)',
      }} />
    </div>
  );
}
