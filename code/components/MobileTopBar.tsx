// MobileTopBar — sticky brand mark + search affordance, mobile only.
import Link from 'next/link';
import { KiraLogo } from './KiraLogo';
import { Icon } from './icons';

export function MobileTopBar() {
  return (
    <header className="md:hidden flex items-center justify-between px-4 pt-3 pb-3 sticky top-0 z-20 backdrop-blur-md bg-bg-0/80 border-b border-line">
      <Link href="/"><KiraLogo size={17} glow /></Link>
      <div className="flex items-center gap-3">
        <Link href="/m" aria-label="Mature library"
          className="kira-mono text-[10px] font-bold tracking-widest text-violet bg-violet/15 border border-violet/30 px-2 py-1 rounded">
          18+
        </Link>
        <Link href="/ask" aria-label="AI search"><Icon name="search" size={22} className="text-text-dim" /></Link>
        <Link href="/me" aria-label="Profile" className="w-7 h-7 rounded-full"
          style={{ background: 'linear-gradient(135deg,#ff1f6d,#b855ff)', boxShadow: '0 0 0 1px #ff1f6d' }} />
      </div>
    </header>
  );
}
