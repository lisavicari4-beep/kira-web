// app/ask/page.tsx — AI Smart Search.
import Link from 'next/link';
import { Icon } from '@/components/icons';
import { AISearchBar } from '@/components/AISearchBar';

export const metadata = {
  title: 'Ask KIRA · AI manga search',
  description: 'Describe the manga you wish existed. KIRA will find it.',
};

export default function AskPage() {
  return (
    <main className="max-w-md mx-auto pb-24">
      <header className="flex items-center justify-between px-4 pt-3 pb-3 sticky top-0 z-10 bg-bg-0/85 backdrop-blur-md">
        <Link href="/" aria-label="Back"><Icon name="chevron-left" size={22} /></Link>
        <div className="flex items-center gap-1.5">
          <Icon name="sparkles" size={16} className="text-hot" />
          <span className="font-bold text-sm">KIRA · ASK</span>
          <span className="kira-tag kira-tag-hot text-[8.5px] py-0.5 px-1.5">BETA</span>
        </div>
        <Icon name="menu" size={22} className="text-text-dim" />
      </header>

      <section className="px-4 mt-3">
        <div className="rounded-2xl p-3.5 border border-hot/25"
          style={{ background: 'linear-gradient(135deg, rgba(255,31,109,0.16), rgba(184,85,255,0.10) 60%, transparent)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Icon name="sparkles" size={14} className="text-hot" />
            <span className="kira-hit text-[10px] text-hot tracking-[0.18em]">ASK ANYTHING</span>
          </div>
          <div className="font-bold text-base leading-tight">
            Describe the manga you wish<br/>existed. KIRA will find it.
          </div>
        </div>
      </section>

      <section className="px-4 mt-4">
        <AISearchBar />
      </section>
    </main>
  );
}
