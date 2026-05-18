// app/read/[chapter]/page.tsx — Real chapter reader.
//
// `chapter` route param is a MangaDex chapter UUID (36 chars w/ dashes).
// We:
//   1) resolve the chapter → its manga (so we can show title + back-link)
//   2) fetch the manga (cover/title/etc.)
//   3) fetch the actual page image URLs from MD@Home
//
// Falls back to the demo placeholder chapter only if the input isn't a UUID
// (so old `md-xxx-ch-1` style links don't 404 hard in dev).

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getChapterById, getChapterPages, getMangaDex } from '@/lib/mangadex';
import { sampleChapter } from '@/lib/sample-chapter';
import { Reader } from '@/components/Reader';
import type { Chapter } from '@/lib/types';

interface PageProps {
  params: Promise<{ chapter: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export const metadata: Metadata = {
  title: 'Reader',
  robots: { index: false, follow: true },
};

const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export default async function ReadPage({ params, searchParams }: PageProps) {
  const { chapter: chapterParam } = await params;
  const { mode } = await searchParams;
  const initialMode = mode === 'ltr' || mode === 'rtl' || mode === 'vertical' ? mode : 'vertical';

  // ─── MangaDex path ───────────────────────────────
  if (UUID_RE.test(chapterParam)) {
    const resolved = await getChapterById(chapterParam);
    if (!resolved) notFound();

    const [pages, manga] = await Promise.all([
      getChapterPages(chapterParam).catch(() => []),
      getMangaDex(resolved.mangaId).catch(() => null),
    ]);

    if (!pages.length) notFound();

    const chapter: Chapter = {
      id: chapterParam,
      titleId: `md-${resolved.mangaId}`,
      number: Number(resolved.chapter.attributes.chapter) || 0,
      name: resolved.chapter.attributes.title || `Chapter ${resolved.chapter.attributes.chapter ?? ''}`,
      releasedAt: resolved.chapter.attributes.publishAt,
      pageCount: pages.length,
      pages,
      isNew: true,
    };

    return (
      <Reader
        titleId={`md-${resolved.mangaId}`}
        titleName={manga?.title || 'Untitled'}
        chapter={chapter}
        initialMode={initialMode}
      />
    );
  }

  // ─── Fallback: demo placeholder ─────────────────
  // Keeps `/read/anything-else` showing something in dev while you wire up
  // additional sources. Remove this block in production if you only support
  // MangaDex chapters.
  const fallback = sampleChapter('demo');
  return (
    <Reader
      titleId="demo"
      titleName="Demo chapter · wire a real source"
      chapter={fallback}
      initialMode={initialMode}
    />
  );
}
