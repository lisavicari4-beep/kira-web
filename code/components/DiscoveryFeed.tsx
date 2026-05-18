// DiscoveryFeed — responsive hero + rails.
// Mobile  (<md): horizontal-scroll rails (1.x cards visible).
// Desktop (md+): grids of 5–7 cards across.
import Link from 'next/link';
import { Cover } from './Cover';
import { TitleCard } from './TitleCard';
import { Icon } from './icons';
import type { Title } from '@/lib/types';

interface Props {
  hero: Title;
  trending: Title[];
  airingNow: Title[];
  manga: Title[];
  newReleases?: Title[];
  forYou: Title[];
}

export function DiscoveryFeed({ hero, trending, airingNow, manga, newReleases = [], forYou }: Props) {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-3 md:pt-8 pb-10 md:pb-16">
      <DiscoveryHero hero={hero} />
      <Rail title="Most followed manga" items={manga} priority />
      <Rail title="New chapters" items={newReleases} />
      <Rail title="Trending anime" items={trending} />
      <ForYouSection items={forYou} />
      <Rail title="Airing this season" items={airingNow} />
    </div>
  );
}

function DiscoveryHero({ hero }: { hero: Title }) {
  if (!hero) return null;
  return (
    <section>
      <Link href={`/title/${hero.id}`}
        className="block relative aspect-[4/5] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-card">
        <Cover src={hero.cover} alt={hero.title} paletteSeed={0} priority
          className="absolute inset-0 !rounded-none !aspect-auto h-full w-full" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent 50%)' }} />
        <div className="absolute left-4 right-4 md:left-10 md:right-10 bottom-4 md:bottom-10 max-w-2xl">
          <div className="flex gap-1.5 mb-2.5">
            <span className="kira-tag kira-tag-hot">#1 TRENDING</span>
            {hero.genres.slice(0, 3).map((g) => <span key={g} className="kira-tag">{g}</span>)}
          </div>
          <h2 className="kira-display text-2xl md:text-5xl lg:text-6xl text-white">{hero.title}</h2>
          <p className="mt-2 md:mt-3 text-[12.5px] md:text-base text-white/75 leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-3 max-w-xl">
            {hero.synopsis}
          </p>
          <div className="mt-3 md:mt-5 flex gap-2">
            <span className="kira-btn kira-btn-hot text-[13px] md:text-sm py-2.5 md:py-3 md:px-6">
              <Icon name="play" size={12} /> Read now
            </span>
            <span className="kira-btn bg-white/10 border-white/20 text-[13px] md:text-sm py-2.5 md:py-3 md:px-6">
              <Icon name="bookmark" size={14} /> Save
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}

function Rail({ title, items, priority = false }: { title: string; items: Title[]; priority?: boolean }) {
  if (!items?.length) return null;
  return (
    <section className="mt-8 md:mt-12">
      <div className="flex items-baseline justify-between mb-3 md:mb-5">
        <h3 className="text-base md:text-2xl font-bold">{title}</h3>
        <Link href="/library" className="text-[11px] md:text-sm text-text-muted hover:text-text">View all →</Link>
      </div>
      {/* Mobile: horizontal scroll. Desktop: responsive grid. */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar md:hidden -mx-4 px-4">
        {items.map((t, i) => <TitleCard key={t.id} title={t} rank={priority ? i + 1 : undefined} />)}
      </div>
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 md:gap-5">
        {items.slice(0, 14).map((t, i) => <TitleCard key={t.id} title={t} rank={priority ? i + 1 : undefined} size="lg" />)}
      </div>
    </section>
  );
}

function ForYouSection({ items }: { items: Title[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-8 md:mt-12">
      <div className="mb-3 md:mb-5">
        <div className="flex items-center gap-1.5">
          <Icon name="sparkles" size={14} className="text-hot" />
          <span className="kira-hit text-[11px] md:text-xs text-hot tracking-[0.18em]">AI · FOR YOU</span>
        </div>
        <h3 className="text-[17px] md:text-2xl font-bold mt-0.5">Tuned to your reading mood</h3>
      </div>

      {/* Mobile list, desktop 2-col rich cards */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4">
        {items.slice(0, 6).map((t, i) => (
          <li key={t.id}>
            <Link href={`/title/${t.id}`}
              className="flex gap-3 md:gap-4 items-center p-2.5 md:p-4 bg-bg-1 border border-line rounded-xl hover:bg-bg-2 hover:border-line-strong transition-colors">
              <Cover src={t.cover} alt={t.title} paletteSeed={i + 5}
                className="w-14 md:w-20 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="kira-tag text-[8.5px] py-0.5 px-1.5">{t.type.toUpperCase()}</span>
                  <span className="kira-mono text-[10px] text-hot font-semibold">{Math.max(82, 99 - i * 4)}% match</span>
                </div>
                <div className="text-sm md:text-base font-bold mt-0.5">{t.title}</div>
                <div className="text-[11px] md:text-[13px] text-text-muted line-clamp-1 md:line-clamp-2 mt-0.5">
                  {t.synopsis || t.genres.slice(0, 3).join(' · ')}
                </div>
              </div>
              <Icon name="bookmark" size={18} className="text-text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
