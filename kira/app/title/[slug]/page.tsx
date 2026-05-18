// app/title/[slug]/page.tsx — Title detail (SSR + ISR 1h).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Cover } from '@/components/Cover';
import { Icon } from '@/components/icons';
// FIX: removed unused TitleCard import (caused build failure in strict ESLint mode)
import { getTitle, getDiscoveryData } from '@/lib/titles';
import { titleMetadata, titleJsonLd } from '@/lib/seo';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const { trending } = await getDiscoveryData();
    return trending.slice(0, 6).map((t) => ({ slug: t.id }));
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

  return (
    <main className="max-w-md mx-auto pb-24">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(titleJsonLd(t)) }} />

      {/* Hero */}
      <header className="relative h-[380px]">
        <div className="absolute inset-0">
          <Cover src={t.cover} alt={t.title} paletteSeed={0} className="!rounded-none !aspect-auto h-full" priority />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, #050507 0%, transparent 35%, transparent 55%, rgba(5,5,7,0.55) 100%)',
          }} />
        </div>
        <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between">
          <Link href="/" aria-label="Back"
            className="w-9 h-9 rounded-full grid place-items-center bg-bg-0/55 backdrop-blur border border-white/10">
            <Icon name="chevron-left" size={18} className="text-white" />
          </Link>
          <div className="flex gap-2">
            <Link href="/ask" aria-label="Search"
              className="w-9 h-9 rounded-full grid place-items-center bg-bg-0/55 backdrop-blur border border-white/10">
              <Icon name="search" size={18} className="text-white" />
            </Link>
            <button aria-label="Share"
              className="w-9 h-9 rounded-full grid place-items-center bg-bg-0/55 backdrop-blur border border-white/10">
              <Icon name="share" size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="absolute left-4 right-4 bottom-5">
          {t.titleJa && <div className="kira-jp text-base text-hot font-bold mb-1">{t.titleJa}</div>}
          <h1 className="kira-display text-3xl text-white leading-none">{t.title}</h1>
          <div className="flex items-center gap-2 mt-2.5 text-text-dim text-xs">
            <span className="text-gold font-bold">★ {t.rating.toFixed(1)}</span>
            <span>·</span>
            {t.year && <><span>{t.year}</span><span>·</span></>}
            <span className={`kira-tag ${t.status === 'airing' ? 'kira-tag-jade' : ''} text-[8.5px] py-0.5 px-1.5`}>
              {t.status.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* CTAs */}
      <section className="px-4 -mt-1.5 flex gap-2">
        <Link href={`/read/${t.id}-ch-1?mode=vertical`} className="kira-btn kira-btn-hot flex-1 py-3 text-sm">
          <Icon name="play" size={13} /> Start reading
        </Link>
        <button aria-label="Save" className="kira-btn py-3 px-4"><Icon name="bookmark" size={16} /></button>
        <button aria-label="Notify" className="kira-btn py-3 px-4"><Icon name="bell" size={16} /></button>
      </section>

      {/* Tags */}
      {t.genres.length > 0 && (
        <section className="px-4 pt-5">
          <div className="flex flex-wrap gap-1.5">
            {t.genres.map((g) => <span key={g} className="kira-tag">{g}</span>)}
            {t.mature && <span className="kira-tag kira-tag-violet">MATURE 17+</span>}
          </div>
        </section>
      )}

      {/* Synopsis */}
      <section className="px-4 pt-5">
        <h3 className="text-sm font-bold mb-2">Synopsis</h3>
        <p className="text-[13px] leading-relaxed text-text-dim">{t.synopsis || '— no synopsis available.'}</p>
        {t.synopsisSource === 'kira-rewrite' && (
          <div className="mt-3 px-2.5 py-2 border-l-2 border-hot bg-hot/5 rounded flex items-center gap-1.5">
            <Icon name="sparkles" size={12} className="text-hot" />
            <span className="text-[11px] text-text-dim">AI-rewritten · spoiler-safe</span>
          </div>
        )}
      </section>

      {/* Where to watch / read */}
      {t.externalLinks.length > 0 && (
        <section className="px-4 pt-5">
          <h3 className="text-sm font-bold mb-2.5">Where to {t.type === 'manga' ? 'read' : 'watch'} · officially</h3>
          <ul className="flex flex-col gap-1.5">
            {t.externalLinks.slice(0, 5).map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 bg-bg-1 border border-line rounded-xl hover:border-line-strong">
                  <div className="w-7 h-7 rounded grid place-items-center text-white font-display text-xs"
                    style={{ background: hashColor(l.name) }}>{l.name[0]}</div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold">{l.name}</div>
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

      {/* Chapter list */}
      <section className="px-4 pt-5">
        <h3 className="text-sm font-bold mb-2.5">Chapters · {t.chapters || t.episodes || '—'}</h3>
        <ul className="flex flex-col">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-center gap-3 py-2.5 border-t border-line">
              <div className="w-10 h-10 rounded grid place-items-center bg-bg-2 border border-line kira-hit text-text-muted text-sm">{n}</div>
              <div className="flex-1">
                <div className="text-[10px] kira-mono text-text-muted">CH. {n}</div>
                <div className="text-[13px] font-semibold">— placeholder, wire to /lib/chapters</div>
              </div>
              <Link href={`/read/${t.id}-ch-${n}?mode=vertical`} aria-label={`Read ch ${n}`}>
                <Icon name="chevron-right" size={14} className="text-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function hashColor(s: string) {
  const colors = ['#f47521', '#e50914', '#ef3239', '#1ab7ea', '#7a5af8', '#06c167'];
  let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return colors[Math.abs(h) % colors.length];
}
