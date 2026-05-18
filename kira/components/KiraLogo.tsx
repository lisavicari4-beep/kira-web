// components/KiraLogo.tsx
export function KiraLogo({ size = 18, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-jp font-black leading-none text-hot"
        style={{ fontSize: size * 1.15, textShadow: glow ? '0 0 12px rgba(255,31,109,0.7)' : undefined }}>
        煌
      </span>
      <span className="font-display font-black tracking-[0.12em] leading-none" style={{ fontSize: size }}>
        KIRA
      </span>
    </span>
  );
}
