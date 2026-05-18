// app/m/page.tsx — Mature library landing.
// Middleware enforces the age-gate cookie before this ever renders.
import type { Metadata } from 'next';
import Link from 'next/link';
import { TitleCard } from '@/components/TitleCard';
import { Icon } from '@/components/icons';
import { getMatureLibrary } from '@/lib/titles';
import type { Title } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Mature · 18+',
  description: 'KIRA mature library — adult comics & galleries, age-restricted.',
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default async function MaturePage() {
  const { erotica, suggestive } = await getMatureLibrary();

  return (
    <main className="px-4 md:px-8 lg:px-12 pt-3 md:pt-8 pb-10 md:pb-16">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-10 mb-8 border border-violet/30"
        style={{ background: 'radial-gradient(circle at 0% 0%, rgba(184,85,255,0.25), transparent 60%), linear-gradient(135deg, #1a0a30, #050507)' }}>
        <div className="flex items-center gap-2">
          <Icon name="shield" size={16} className="text-violet" />
          <span className="kira-hit text-[11px] tracking-[0.22em] text-violet">MATURE LIBRARY · 18+</span>
        </div>
        <h1 className="kira-display text-3xl md:text-5xl mt-2">Adult comics & galleries</h1>
        <p className="mt-3 text-sm md:text-base text-text-dim max-w-2xl">
          A separated, age-verified section. Content is rated 17+ to 21+ and never bleeds into your main feed.
          Manage access in <Link href="/me/settings" className="text-violet hover:underline">Settings</Link>.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="kira-tag kira-tag-violet">SUGGESTIVE</span>
          <span className="kira-tag kira-tag-violet">EROTICA</span>
          <span className="kira-tag">FILTERED · EN</span>
        </div>
      </div>

      <Section title="Erotica · most followed" items={erotica} />
      <Section title="Suggestive · popular" items={suggestive} />
    </main>
  );
}

function Section({ title, items }: { title: string; items: Title[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-8 md:mt-12">
      <h3 className="text-base md:text-xl font-bold mb-3 md:mb-5">{title}</h3>
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-5">
        {items.map((t) => <TitleCard key={t.id} title={t} size="lg" />)}
      </div>
    </section>
  );
}
