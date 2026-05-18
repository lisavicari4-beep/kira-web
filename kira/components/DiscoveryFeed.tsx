// components/DiscoveryFeed.tsx — server-rendered hero + rails (RSC).
import Link from 'next/link';
import { Cover } from './Cover';
import { TitleCard } from './TitleCard';
import { Icon } from './icons';
import type { Title } from '@/lib/types';

interface Props {
  hero: Title; trending: Title[]; airingNow: Title[]; manga: Title[]; forYou: Title[];
}

export function DiscoveryFeed({ hero, trending, airingNow, manga, forYou }: Props) {
  return (
    <>
      <DiscoveryHero hero={hero} />
      <Rail title="Trending now" tag="hot" items={trending} />
      <Rail title="Airing this season" items={airingNow} />
      <ForYouRail items={forYou} />
      <Rail title="Manga · top reads" items={manga} />
    </>
  );
}

function DiscoveryHero({ hero }: { hero: Title }) {
  if (!hero) return null;
  return (
    <section className="px-4 pt-4 pb-2">
      {/* FIX: was a single <Link> wrapping everything — "Save" did nothing.
          Now the card is a div with a full-area Link underneath; CTA buttons
          sit above it via z-10 so they receive their own click events. */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card">
        <Cover src={hero.cover} alt={hero.title} paletteSeed={0} priority
          className="absolute inset-0 !rounded-none !aspect-auto h-full w-full" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent 50%)' }} />
        {/* Full-card tap target */}
        <Link href={`/title/${hero.id}`} className="absolute inset-0" aria-label={`View ${hero.title}`} />
        <div className="absolute left-0 right-0 bottom-0 p-4">
          <div className="flex gap-1.5 mb-2.5">
            <span className="kira-tag kira-tag-hot">#1 TRENDING</span>
            {hero.genres.slice(0, 2).map((g) => <span key={g} className="kira-tag">{g}</span>)}
          </div>
          <h2 className="kira-display text-2xl text-white">{hero.title}</h2>
          <p className="mt-1.5 text-[12.5px] text-white/75 leading-[1.4] line-clamp-2">{hero.synopsis}</p>
          <div className="mt-3 flex gap-2 relative z-10">
            <Link href={`/read/${hero.id}-ch-1?mode=vertical`}
              className="kira-btn kira-btn-hot text-[13px] py-2.5">
              <Icon name="play" size={12} /> Read now
            </Link>
            <button aria-label="Save" className="kira-btn bg-white/10 border-white/20 text-[13px] py-2.5">
              <Icon name="bookmark" size={14} /> Save
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rail({ title, tag, items }: { title: string; tag?: 'hot'; items: Title[] }) {
  if (!items?.length) return null;
  return (
    <section className="pt-5">
      <div className="px-4 pb-2.5 flex items-baseline justify-between">
        <h3 className="text-base font-bold text-text">{title}</h3>
        <Link href="/library" className="text-[11px] text-text-muted">all →</Link>
      </div>
      <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar">
        {items.map((t, i) => <TitleCard key={t.id} title={t} rank={tag === 'hot' ? i + 1 : undefined} />)}
      </div>
    </section>
  );
}

function ForYouRail({ items }: { items: Title[] }) {
  if (!items?.length) return null;
  return (
    <section className="pt-5">
      <div className="px-4 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Icon name="sparkles" size={14} className="text-hot" />
          <span className="kira-hit text-[11px] text-hot tracking-[0.18em]">AI · FOR YOU</span>
        </div>
        <h3 className="text-[17px] font-bold mt-0.5">Tuned to your reading mood</h3>
      </div>
      <ul className="px-4 flex flex-col gap-2.5">
        {items.slice(0, 4).map((t, i) => (
          <li key={t.id}>
            <Link href={`/title/${t.id}`}
              className="flex gap-3 items-center p-2.5 bg-bg-1 border border-line rounded-xl hover:bg-bg-2">
              <Cover src={t.cover} alt={t.title} paletteSeed={i + 5} className="w-14 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="kira-tag text-[8.5px] py-0.5 px-1.5">{t.type.toUpperCase()}</span>
                  <span className="kira-mono text-[10px] text-hot font-semibold">{Math.max(82, 99 - i * 4)}% match</span>
                </div>
                <div className="text-sm font-bold mt-0.5">{t.title}</div>
                <div className="text-[11px] text-text-muted truncate">
                  — {t.genres.slice(0, 2).join(', ') || 'similar to your reads'}
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
