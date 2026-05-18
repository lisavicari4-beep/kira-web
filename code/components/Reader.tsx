// Reader — three orientations, server-rendered shell + client interaction.
// 'use client' because we need pinch-zoom, swipe, keyboard nav.
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Icon } from './icons';
import { ReadAlongOverlay } from './ReadAlongOverlay';
import type { Chapter } from '@/lib/types';
import clsx from 'clsx';

type Mode = 'vertical' | 'ltr' | 'rtl';

interface Props {
  chapter: Chapter;
  titleId: string;
  titleName: string;
  initialMode?: Mode;
}

export function Reader({ chapter, titleId, titleName, initialMode = 'vertical' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [readAlong, setReadAlong] = useState(false);
  const [page, setPage] = useState(0);
  const [chromeHidden, setChromeHidden] = useState(false);

  // Persist preferences
  useEffect(() => {
    const saved = localStorage.getItem('kira-reader-prefs');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.mode) setMode(p.mode);
        if (typeof p.readAlong === 'boolean') setReadAlong(p.readAlong);
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('kira-reader-prefs', JSON.stringify({ mode, readAlong }));
  }, [mode, readAlong]);

  // Persist chapter progress
  useEffect(() => {
    const key = `kira-progress-${chapter.id}`;
    const saved = Number(localStorage.getItem(key));
    if (saved && saved < chapter.pageCount) setPage(saved);
  }, [chapter.id, chapter.pageCount]);
  useEffect(() => {
    localStorage.setItem(`kira-progress-${chapter.id}`, String(page));
  }, [chapter.id, page]);

  // Keyboard nav for desktop
  useEffect(() => {
    function k(e: KeyboardEvent) {
      if (mode === 'vertical') return;
      const fwd = mode === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const back = mode === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd) setPage((p) => Math.min(chapter.pageCount - 1, p + 1));
      else if (e.key === back) setPage((p) => Math.max(0, p - 1));
    }
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [mode, chapter.pageCount]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col">
      <TopChrome titleId={titleId} titleName={titleName} chapter={chapter} hidden={chromeHidden} />

      <div className="flex-1 relative overflow-hidden" onClick={() => setChromeHidden((v) => !v)}>
        {mode === 'vertical' && <Vertical chapter={chapter} readAlong={readAlong} onPage={setPage} />}
        {mode !== 'vertical' && (
          <Horizontal chapter={chapter} page={page} setPage={setPage} mode={mode} readAlong={readAlong} />
        )}
      </div>

      <BottomChrome
        chapter={chapter} page={page} mode={mode} setMode={setMode}
        readAlong={readAlong} setReadAlong={setReadAlong}
        hidden={chromeHidden}
      />
    </div>
  );
}

function TopChrome({ titleId, titleName, chapter, hidden }: { titleId: string; titleName: string; chapter: Chapter; hidden: boolean }) {
  return (
    <div className={clsx(
      'absolute top-0 left-0 right-0 z-20 px-4 py-3 transition-transform',
      hidden && '-translate-y-full'
    )} style={{ background: 'linear-gradient(to bottom, rgba(5,5,7,0.85) 60%, transparent)' }}>
      <div className="flex items-center justify-between">
        <Link href={`/title/${titleId}`} className="flex items-center gap-2.5">
          <Icon name="chevron-left" size={22} className="text-white" />
          <div>
            <div className="text-xs font-bold text-white truncate max-w-[200px]">{titleName}</div>
            <div className="kira-mono text-[10px] text-text-muted">Ch. {chapter.number} · {chapter.name}</div>
          </div>
        </Link>
        <Icon name="menu" size={20} className="text-white" />
      </div>
    </div>
  );
}

function Vertical({ chapter, readAlong, onPage }: { chapter: Chapter; readAlong: boolean; onPage: (n: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = containerRef.current; if (!c) return;
    const onScroll = () => {
      const n = c.scrollTop, h = c.scrollHeight - c.clientHeight;
      const idx = Math.round((n / (h || 1)) * (chapter.pageCount - 1));
      onPage(idx);
    };
    c.addEventListener('scroll', onScroll, { passive: true });
    return () => c.removeEventListener('scroll', onScroll);
  }, [chapter.pageCount, onPage]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-y-auto pt-20 pb-32" onClick={(e) => e.stopPropagation()}>
      <div className="max-w-md mx-auto flex flex-col gap-2 px-4">
        {chapter.pages.map((p) => (
          <PageView key={p.idx} page={p} readAlong={readAlong} />
        ))}
        <EndOfChapter />
      </div>
    </div>
  );
}

function Horizontal({ chapter, page, setPage, mode, readAlong }: {
  chapter: Chapter; page: number; setPage: (n: number) => void; mode: 'ltr' | 'rtl'; readAlong: boolean;
}) {
  const fwd = () => setPage(Math.min(chapter.pageCount - 1, page + 1));
  const back = () => setPage(Math.max(0, page - 1));
  const current = chapter.pages[page];

  // Tap zones swap based on direction
  const leftAction = mode === 'rtl' ? fwd : back;
  const rightAction = mode === 'rtl' ? back : fwd;

  return (
    <div className="absolute inset-0 pt-20 pb-32 flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
      <div className="w-full max-w-md aspect-[2/3] relative">
        {current ? <PageView page={current} readAlong={readAlong} /> : null}
        <button onClick={leftAction} className="absolute left-0 top-0 w-1/3 h-full" aria-label="prev/next" />
        <button onClick={rightAction} className="absolute right-0 top-0 w-1/3 h-full" aria-label="prev/next" />
      </div>
      <div className="absolute top-24 left-4 z-10 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2 py-1 rounded-md border border-white/10">
        <span className="kira-mono text-[9px] text-text-muted">{mode.toUpperCase()}</span>
        <span className="text-[10px] text-text-dim">{mode === 'rtl' ? '← swipe' : 'swipe →'}</span>
      </div>
    </div>
  );
}

function PageView({ page, readAlong }: { page: ChapterPage; readAlong: boolean }) {
  return (
    <div className="relative bg-paper rounded shadow-lg overflow-hidden">
      {/* Use a plain img — fill works oddly inside grids of unknown height.
          loading=lazy + decoding=async keep vertical reader smooth. */}
      <img
        src={page.imageUrl}
        alt={`Page ${page.idx + 1}`}
        loading="lazy" decoding="async"
        className="block w-full h-auto select-none"
      />
      {readAlong && page.jpTokens && page.jpTokens.length > 0 && (
        <ReadAlongOverlay tokens={page.jpTokens} />
      )}
    </div>
  );
}

function EndOfChapter() {
  return (
    <div className="my-6 p-5 text-center border border-dashed border-hot/30 rounded-xl"
         style={{ background: 'linear-gradient(135deg, rgba(255,31,109,0.1), transparent)' }}>
      <div className="kira-hit text-[11px] text-hot tracking-[0.15em]">END OF CHAPTER</div>
      <div className="mt-1.5 text-[13px] font-semibold">Next chapter in 5d 14h</div>
    </div>
  );
}

function BottomChrome({ chapter, page, mode, setMode, readAlong, setReadAlong, hidden }: {
  chapter: Chapter; page: number; mode: Mode; setMode: (m: Mode) => void;
  readAlong: boolean; setReadAlong: (b: boolean) => void; hidden: boolean;
}) {
  const pct = ((page + 1) / chapter.pageCount) * 100;
  return (
    <div className={clsx(
      'absolute bottom-0 left-0 right-0 z-20 pb-7 transition-transform',
      hidden && 'translate-y-full'
    )} style={{ background: 'linear-gradient(to top, rgba(5,5,7,0.95) 60%, transparent)' }}>
      <div className="px-4 pt-3 flex items-center gap-3">
        <span className="kira-mono text-[10px] text-text-muted w-8">p. {page + 1}</span>
        <div className="flex-1 h-1 bg-white/10 rounded-full relative">
          <div className="absolute inset-y-0 left-0 bg-hot rounded-full shadow-hot-soft" style={{ width: `${pct}%` }} />
        </div>
        <span className="kira-mono text-[10px] text-text-muted w-7 text-right">{chapter.pageCount}</span>
      </div>

      <div className="px-4 pt-3 flex items-center justify-around">
        <ToolButton icon="heart" label="2.4K" />
        <ToolButton icon="comment" label="318" />
        <ToolButton icon="bookmark" />
        <button onClick={() => setReadAlong(!readAlong)}
          className={clsx('flex flex-col items-center gap-0.5', readAlong ? 'text-hot' : 'text-text-dim')}>
          <Icon name="translate" size={20} />
          <span className="text-[10px] font-semibold">{readAlong ? 'On' : 'JP'}</span>
        </button>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-line rounded-full">
          {(['vertical', 'ltr', 'rtl'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={clsx('kira-mono text-[9px] font-bold px-1.5 py-1 rounded-full',
                mode === m ? 'bg-hot text-white' : 'text-text-muted')}>
              {m === 'vertical' ? 'VERT' : m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon, label }: { icon: string; label?: string }) {
  return (
    <button className="flex flex-col items-center gap-0.5 text-white">
      <Icon name={icon} size={20} />
      {label && <span className="text-[10px] font-semibold">{label}</span>}
    </button>
  );
}

// Local re-export of type to keep this file self-contained
type ChapterPage = Chapter['pages'][number];
