// Minimal icon set — line-based, neon-shōnen consistent.
import type { SVGProps } from 'react';

type Props = { name: string; size?: number } & SVGProps<SVGSVGElement>;
export function Icon({ name, size = 20, ...rest }: Props) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...rest,
  };
  switch (name) {
    case 'home': return <svg {...common}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z"/></svg>;
    case 'play': return <svg {...common}><path d="M7 4v16l13-8z" fill="currentColor"/></svg>;
    case 'plus': return <svg {...common} strokeWidth={2.4}><path d="M12 5v14M5 12h14"/></svg>;
    case 'search': return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case 'sparkles': return <svg {...common}><path d="M12 3l1.5 5L19 9.5 14 11l-2 6-2-6L5 9.5 10.5 8z"/></svg>;
    case 'arrow-up': return <svg {...common}><path d="M12 5v14M6 11l6-6 6 6"/></svg>;
    case 'bookmark': return <svg {...common}><path d="M6 3h12v18l-6-4-6 4z"/></svg>;
    case 'bell': return <svg {...common}><path d="M6 16V11a6 6 0 0112 0v5l2 3H4z"/><path d="M10 21a2 2 0 004 0"/></svg>;
    case 'menu': return <svg {...common}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case 'chevron-right': return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-left': return <svg {...common}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chevron-down': return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case 'heart': return <svg {...common}><path d="M12 21s-7-4.5-9.5-9A5 5 0 0112 6a5 5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>;
    case 'comment': return <svg {...common}><path d="M21 12a8 8 0 11-3.5-6.5L21 4l-1.5 3.5A8 8 0 0121 12z"/></svg>;
    case 'share': return <svg {...common}><path d="M12 4v12M7 9l5-5 5 5M5 20h14"/></svg>;
    case 'shield': return <svg {...common}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>;
    case 'check': return <svg {...common} strokeWidth={2.4}><path d="M5 12l5 5 9-11"/></svg>;
    case 'translate': return <svg {...common}><path d="M3 5h10M8 3v2M5 14L9 5l4 9M5 12h8"/><path d="M13 13h8M17 11v2c0 4-4 7-4 7M17 11v2c0 4 4 7 4 7"/></svg>;
    case 'film': return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 12h18"/></svg>;
    case 'fire': return <svg {...common}><path d="M12 3c1 3 4 5 4 9a4 4 0 11-8 0c0-2 2-2 2-5 0 2 2 2 2-4z"/></svg>;
    case 'streak': return <svg {...common}><path d="M12 2c1 4-2 5-2 9a4 4 0 008 0c0-3-2-4-3-6 0 3-2 4-3-3z" fill="currentColor"/></svg>;
    case 'user': return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-7 8-7s7 3 8 7"/></svg>;
    case 'library': return <svg {...common}><rect x="4" y="3" width="4" height="18" rx="1"/><rect x="10" y="3" width="4" height="18" rx="1"/><path d="M17 4l4 16"/></svg>;
    default: return <svg {...common}/>;
  }
}
