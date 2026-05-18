// app/read/[chapter]/page.tsx — Immersive reader.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTitle } from '@/lib/titles';
import { sampleChapter } from '@/lib/sample-chapter';
import { Reader } from '@/components/Reader';

interface PageProps {
  params: Promise<{ chapter: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export const metadata: Metadata = {
  title: 'Reader',
  robots: { index: false, follow: true },
};

export default async function ReadPage({ params, searchParams }: PageProps) {
  const { chapter: chapterId } = await params;
  const { mode } = await searchParams;

  const m = /^(.+)-ch-(\d+)$/.exec(chapterId);
  if (!m) notFound();
  const titleId = m[1];

  const title = await getTitle(titleId);
  if (!title) notFound();

  const chapter = sampleChapter(titleId);
  const initialMode = mode === 'ltr' || mode === 'rtl' || mode === 'vertical' ? mode : 'vertical';

  return (
    <Reader titleId={titleId} titleName={title.title} chapter={chapter} initialMode={initialMode} />
  );
}
