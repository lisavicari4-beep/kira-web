// app/title/[slug]/page.tsx — Title detail.
//
// Responsive: mobile = hero banner stack; desktop = 2-column with sticky
// cover + meta on the left, synopsis + chapter list on the right.
//
// Real chapter list comes from MangaDex for `md-*` slugs. AniList/MAL
// slugs still render metadata but link out for actual reading.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/icons';
import { getTitle, getDiscoveryData } from '@/lib/titles';
import { getChapterFeed, summarizeChapters } from '@/lib/mangadex';
import { titleMetadata, titleJsonLd } from '@/lib/seo';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const { manga, trending } = await getDiscoveryData();
    return [...manga.slice(0, 6), ...trending.slice(0, 4)].map((t) => ({ slug: t.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTitle(slug);
  if (!t) return { title: 'Not found' };
  return titleMetadata(t);
}

export const revalidate = 3600;

export default async function TitlePage({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTitle(slug);
  if (!t) notFound();

  // Real chapter list when this is a MangaDex title
  const chapters = slug.startsWith('md-')
    ? await getChapterFeed(slug.slice(3), 100).then(summarizeChapters).catch(() => [])
    : [];

  return (
    <main className="pb-10 md:pb-16">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(titleJsonLd(t)) }} />

      {/* ─────── Hero (banner) ─────── */}
      <header className="relative">
        <div className="relative h-[340px] md:h-[420px] lg:h-[480px] overflow-hidden">
          <Cover src={t.bannerImage || t.cover} alt={t.title} paletteSeed={0} priority
            className="absolute inset-0 !rounded-none !aspect-auto h-full w-full" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #050507 0%, transparent 35%, transparent 55%, rgba(5,5,7,0.55) 100%), linear-gradient(to right, rgba(5,5,7,0.55), transparent 60%)' }} />
        </div>

        {/* Mobile back button */}
        <Link href="/" aria-label="Back"
          className="md:hidden absolute top-3 left-4 w-9 h-9 rounded-full grid place-items-center bg-bg-0/55 backdrop-blur border border-white/10 z-10">
          <Icon name="chevron-left" size={18} className="text-white" />
        </Link>

        {/* Hero text — overlays bottom of banner on mobile only */}
        <div className="md:hidden absolute left-4 right-4 bottom-5 z-10">
          {t.titleJa && <div className="kira-jp text-base text-hot font-bold mb-1">{t.titleJa}</div>}
          <h1 className="kira-display text-3xl text-white leading-none">{t.title}</h1>
          <div className="flex items-center gap-2 mt-2.5 text-text-dim text-xs">
            {t.rating > 0 && <><span className="text-gold font-bold">★ {t.rating.toFixed(1)}</span><span>·</span></>}
            {t.year && <><span>{t.year}</span><span>·</span></>}
            <span className={`kira-tag ${t.status === 'airing' ? 'kira-tag-jade' : ''} text-[8.5px] py-0.5 px-1.5`}>{t.status.toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* ─────── Body — 2 column on desktop ─────── */}
      <div className="px-4 md:px-8 lg:px-12 -mt-2 md:-mt-32 lg:-mt-40 relative z-10 grid md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr] gap-6 md:gap-10 max-w-7xl mx-auto">
        {/* Left column: poster + CTAs + meta */}
        <aside className="hidden md:block">
          <div className="rounded-xl overflow-hidden shadow-card">
            <Cover src={t.cover} alt={t.title} paletteSeed={1} />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {chapters.length > 0 ? (
              <Link href={`/read/${chapters[0].id}`} className="kira-btn kira-btn-hot py-3 text-sm">
                <Icon name="play" size={14} /> Read Ch. {chapters[0].number}
              </Link>
            ) : (
              <a href={t.externalLinks[0]?.url || '#'} target="_blank" rel="noopener noreferrer"
                className="kira-btn kira-btn-hot py-3 text-sm">
                <Icon name="play" size={14} /> Open externally
              </a>
            )}
            <button aria-label="Save" className="kira-btn py-2.5 text-sm"><Icon name="bookmark" size={14} /> Save</button>
            <button aria-label="Notify" className="kira-btn py-2.5 text-sm"><Icon name="bell" size={14} /> Notify</button>
          </div>
          <dl className="mt-5 text-sm space-y-2.5 text-text-dim">
            <div className="flex justify-between gap-3 border-b border-line pb-2.5">
              <dt className="text-text-muted">Type</dt><dd className="text-text font-medium">{t.type}</dd>
            </div>
            {t.year && <div className="flex justify-between gap-3 border-b border-line pb-2.5">
              <dt className="text-text-muted">Year</dt><dd className="text-text font-medium">{t.year}</dd>
            </div>}
            {t.chapters && <div className="flex justify-between gap-3 border-b border-line pb-2.5">
              <dt className="text-text-muted">Chapters</dt><dd className="text-text font-medium">{t.chapters}</dd>
            </div>}
            {t.episodes && <div className="flex justify-between gap-3 border-b border-line pb-2.5">
              <dt className="text-text-muted">Episodes</dt><dd className="text-text font-medium">{t.episodes}</dd>
            </div>}
            <div className="flex justify-between gap-3 border-b border-line pb-2.5">
              <dt className="text-text-muted">Status</dt>
              <dd><span className={`kira-tag ${t.status === 'airing' ? 'kira-tag-jade' : ''}`}>{t.status.toUpperCase()}</span></dd>
            </div>
            {t.demographic !== 'unknown' && <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Demo</dt><dd className="text-text font-medium uppercase">{t.demographic}</dd>
            </div>}
          </dl>
        </aside>

        {/* Right column: title (desktop), synopsis, links, chapters */}
        <div className="min-w-0">
          {/* Desktop title block */}
          <div className="hidden md:block mb-6">
            {t.titleJa && <div className="kira-jp text-xl text-hot font-bold mb-1">{t.titleJa}</div>}
            <h1 className="kira-display text-4xl lg:text-5xl text-white leading-none">{t.title}</h1>
            <div className="flex items-center gap-3 mt-3 text-sm text-text-dim">
              {t.rating > 0 && <><span className="text-gold font-bold">★ {t.rating.toFixed(1)}</span><span>·</span></>}
              {t.year && <span>{t.year}</span>}
              {t.mature && <span className="kira-tag kira-tag-violet ml-1">MATURE 17+</span>}
            </div>
          </div>

          {/* Mobile CTAs */}
          <div className="md:hidden flex gap-2 pt-2">
            {chapters.length > 0 ? (
              <Link href={`/read/${chapters[0].id}`} className="kira-btn kira-btn-hot flex-1 py-3 text-sm">
                <Icon name="play" size={13} /> Read Ch. {chapters[0].number}
              </Link>
            ) : (
              <a href={t.externalLinks[0]?.url || '#'} target="_blank" rel="noopener noreferrer" className="kira-btn kira-btn-hot flex-1 py-3 text-sm">
                <Icon name="play" size={13} /> Open externally
              </a>
            )}
            <button aria-label="Save" className="kira-btn py-3 px-4"><Icon name="bookmark" size={16} /></button>
            <button aria-label="Notify" className="kira-btn py-3 px-4"><Icon name="bell" size={16} /></button>
          </div>

          {t.genres.length > 0 && (
            <section className="pt-5">
              <div className="flex flex-wrap gap-1.5">
                {t.genres.slice(0, 12).map((g) => <span key={g} className="kira-tag">{g}</span>)}
                {t.mature && <span className="kira-tag kira-tag-violet md:hidden">MATURE 17+</span>}
              </div>
            </section>
          )}

          <section className="pt-5">
            <h3 className="text-sm md:text-base font-bold mb-2">Synopsis</h3>
            <p className="text-[13px] md:text-[15px] leading-relaxed text-text-dim max-w-3xl">
              {t.synopsis || '— no synopsis available.'}
            </p>
            {t.synopsisSource === 'kira-rewrite' && (
              <div className="mt-3 px-2.5 py-2 border-l-2 border-hot bg-hot/5 rounded flex items-center gap-1.5 max-w-3xl">
                <Icon name="sparkles" size={12} className="text-hot" />
                <span className="text-[11px] text-text-dim">AI-rewritten · spoiler-safe</span>
              </div>
            )}
          </section>

          {t.externalLinks.length > 0 && (
            <section className="pt-6">
              <h3 className="text-sm md:text-base font-bold mb-2.5">
                Where to {t.type === 'manga' ? 'read' : 'watch'} · officially
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {t.externalLinks.slice(0, 6).map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 bg-bg-1 border border-line rounded-xl hover:border-line-strong hover:bg-bg-2 transition-colors">
                      <div className="w-7 h-7 rounded grid place-items-center text-white font-display text-xs flex-shrink-0"
                        style={{ background: hashColor(l.name) }}>{l.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate">{l.name}</div>
                        <div className="text-[10.5px] text-text-muted">
                          {l.kind === 'watch' ? 'Streaming' : l.kind === 'read' ? 'Reading' : 'Info'}
                        </div>
                      </div>
                      <Icon name="chevron-right" size={14} className="text-text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ─────── Chapter list ─────── */}
          <section className="pt-6 md:pt-8">
            <div className="flex items-baseline justify-between mb-2.5">
              <h3 className="text-sm md:text-base font-bold">
                Chapters {chapters.length > 0 && <span className="text-text-muted font-normal">· {chapters.length}</span>}
              </h3>
              {chapters.length > 0 && <span className="text-[11px] text-text-muted">Newest ↓</span>}
            </div>

            {chapters.length === 0 ? (
              <div className="p-5 bg-bg-1 border border-dashed border-line rounded-xl text-center text-text-muted text-sm">
                No readable chapters for this title yet. Try the external sources above.
              </div>
            ) : (
              <ul className="flex flex-col">
                {chapters.slice().reverse().map((c, i) => (
                  <li key={c.id}>
                    <Link href={`/read/${c.id}`}
                      className="flex items-center gap-3 py-2.5 md:py-3 border-t border-line hover:bg-bg-1 px-1 md:px-2 -mx-1 md:-mx-2 rounded transition-colors">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded grid place-items-center bg-bg-2 border border-line kira-hit text-text-dim text-sm flex-shrink-0">
                        {c.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] kira-mono text-text-muted">
                          CH. {c.number}{c.volume ? ` · VOL. ${c.volume}` : ''}
                          {i === 0 && <span className="ml-1.5 kira-tag kira-tag-hot text-[8px] py-0 px-1">NEW</span>}
                        </div>
                        <div className="text-[13px] md:text-sm font-semibold truncate">{c.title}</div>
                        <div className="text-[10.5px] text-text-muted">
                          {new Date(c.publishedAt).toLocaleDateString()} · {c.pages} pages
                        </div>
                      </div>
                      {c.externalUrl && (
                        <span className="text-[10px] text-text-muted hidden md:inline">external</span>
                      )}
                      <Icon name="chevron-right" size={14} className="text-text-muted flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function hashColor(s: string) {
  const colors = ['#f47521', '#e50914', '#ef3239', '#1ab7ea', '#7a5af8', '#06c167'];
  let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return colors[Math.abs(h) % colors.length];
}
