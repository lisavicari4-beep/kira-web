// lib/sample-chapter.ts — placeholder chapter for dev/demo until the
// real DB + manga distribution pipeline lands. The image URLs point to
// AniList CDN backdrops with manga-page proportions; replace with your
// own page bucket (S3/R2) in production.
import type { Chapter } from './types';

export function sampleChapter(titleId: string): Chapter {
  const pages = Array.from({ length: 8 }).map((_, i) => ({
    idx: i,
    // Public placeholder service. Swap for your CDN.
    imageUrl: `https://placehold.co/800x1200/0c0c10/ff1f6d?font=raleway&text=KIRA+%C2%B7+Page+${i + 1}`,
    width: 800,
    height: 1200,
    jpTokens: i === 0 ? [
     { text: '門', reading: 'mon', meaning: 'gate', pos: 'noun', jlpt: 'N4' as const, box: [0.55, 0.78, 0.05, 0.04] as [number, number, number, number] },
{ text: '息', reading: 'iki', meaning: 'breath', pos: 'noun', jlpt: 'N3' as const, box: [0.62, 0.78, 0.05, 0.04] as [number, number, number, number] },
    ] : [],
  }));
  return {
    id: `${titleId}-ch-1`,
    titleId,
    number: 1,
    name: 'The gate that breathed',
    releasedAt: new Date().toISOString(),
    pageCount: pages.length,
    pages,
    isNew: true,
  };
}
