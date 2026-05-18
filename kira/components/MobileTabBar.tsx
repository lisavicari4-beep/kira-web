'use client';
// components/MobileTabBar.tsx — sticky footer nav.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './icons';
import clsx from 'clsx';

const TABS = [
  { id: 'home',    label: 'Home',    icon: 'home',    href: '/' },
  { id: 'shorts',  label: 'Shorts',  icon: 'play',    href: '/shorts' },
  { id: 'create',  label: '',        icon: 'plus',    href: '/create' },
  { id: 'library', label: 'Library', icon: 'library', href: '/library' },
  { id: 'me',      label: 'Me',      icon: 'user',    href: '/me' },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-7 pt-2.5"
      style={{ background: 'linear-gradient(to top, rgba(5,5,7,1), rgba(5,5,7,0.92) 60%, rgba(5,5,7,0))' }}>
      <ul className="flex justify-around items-end">
        {TABS.map((t) => {
          const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href));
          if (t.icon === 'plus') return (
            <li key={t.id}>
              <Link href={t.href}
                className="bg-hot rounded-2xl w-12 h-12 -translate-y-3 grid place-items-center shadow-hot-soft"
                aria-label="Create">
                <Icon name="plus" size={22} className="text-white" />
              </Link>
            </li>
          );
          return (
            <li key={t.id}>
              <Link href={t.href}
                className={clsx('flex flex-col items-center gap-0.5 px-2', active ? 'text-text' : 'text-text-muted')}>
                <Icon name={t.icon} size={22} className={active ? 'text-hot' : 'text-current'} />
                <span className="text-[10px] font-semibold tracking-[0.02em]">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
