// DesktopNav — left sidebar for md+ screens.
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Icon } from './icons';
import { KiraLogo } from './KiraLogo';

const NAV = [
  { id: 'home',    label: 'Discover',  icon: 'home',     href: '/' },
  { id: 'ask',     label: 'AI Search', icon: 'sparkles', href: '/ask' },
  { id: 'library', label: 'Library',   icon: 'library',  href: '/library' },
  { id: 'shorts',  label: 'Shorts',    icon: 'play',     href: '/shorts' },
  { id: 'me',      label: 'Profile',   icon: 'user',     href: '/me' },
] as const;

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 w-60 lg:w-64 border-r border-line bg-bg-0/70 backdrop-blur-md z-30">
      <div className="px-6 pt-6 pb-8">
        <Link href="/"><KiraLogo size={22} glow /></Link>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1">
        {NAV.map((n) => {
          const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
          return (
            <Link key={n.id} href={n.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-hot/15 text-hot border border-hot/30'
                  : 'text-text-dim hover:text-text hover:bg-bg-1'
              )}>
              <Icon name={n.icon} size={18} />
              {n.label}
            </Link>
          );
        })}

        <div className="my-3 h-px bg-line" />

        <Link href="/m"
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname.startsWith('/m')
              ? 'bg-violet/15 text-violet border border-violet/30'
              : 'text-text-dim hover:text-violet hover:bg-violet/5'
          )}>
          <Icon name="shield" size={18} />
          <span>Mature</span>
          <span className="ml-auto text-[9px] font-bold tracking-widest text-violet bg-violet/15 px-1.5 py-0.5 rounded">18+</span>
        </Link>
      </nav>

      <div className="px-6 py-5 border-t border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full" style={{ background: 'linear-gradient(135deg,#ff1f6d,#b855ff)' }} />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate">@rinkasai</div>
            <div className="text-[10px] text-text-muted">LV 38 · 27d streak</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
