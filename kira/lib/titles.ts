// lib/titles.ts — unifies adapters; cache-friendly interface for the app.
import { unstable_cache } from 'next/cache';
import { getTrending, searchAnilist, getTitleByAnilistId } from './anilist';
import { getTopAnime, getSeasonNow, searchJikan, getAnimeById } from './jikan';
import type { Title } from './types';

export const getDiscoveryData = unstable_cache(
  async () => {
    const [trending, season, topManga] = await Promise.all([
      getTrending(10).catch(() => [] as Title[]),
      getSeasonNow().catch(() => [] as Title[]),
      searchJikan('chainsaw', 'manga').catch(() => [] as Title[]),
    ]);
    const dedup = new Map<string, Title>();
    [...trending, ...season, ...topManga].forEach((t) => {
      if (!dedup.has(t.id)) dedup.set(t.id, t);
    });
    const all = Array.from(dedup.values());
    return {
      hero: trending[0] || season[0] || all[0],
      trending: trending.slice(1, 7),
      airingNow: season.slice(0, 8),
      manga: topManga.slice(0, 6),
      forYou: all.slice(0, 8).sort(() => Math.random() - 0.5),
    };
  },
  ['discovery-v1'],
  { revalidate: 60 * 30, tags: ['discovery'] }
);

export async function getTitle(slug: string): Promise<Title | null> {
  const [source, idStr] = slug.split('-');
  const id = Number(idStr);
  if (!id) return null;
  try {
    if (source === 'anilist') return await getTitleByAnilistId(id);
    if (source === 'mal') return await getAnimeById(id);
  } catch {
    return null;
  }
  return null;
}

export async function searchAll(q: string): Promise<Title[]> {
  const [a, b] = await Promise.all([
    searchAnilist(q, 'MANGA').catch(() => []),
    searchAnilist(q, 'ANIME').catch(() => []),
  ]);
  return [...a, ...b];
}
