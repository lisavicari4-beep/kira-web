// lib/titles.ts — unifies adapters. MangaDex powers actual reading;
// AniList/Jikan provide rich anime metadata. Slugs encode the source:
//   md-{uuid}       → MangaDex (readable)
//   anilist-{id}    → AniList (anime/manga metadata)
//   mal-{id}        → Jikan (MyAnimeList)

import { unstable_cache } from 'next/cache';
import { getTrending } from './anilist';
import { getSeasonNow } from './jikan';
import { listMangaDex, getMangaDex } from './mangadex';
import { getTitleByAnilistId } from './anilist';
import { getAnimeById, getMangaById } from './jikan';
import type { Title } from './types';

/** Discovery payload — one cached fetch shared by SSR + ISR. */
export const getDiscoveryData = unstable_cache(
  async () => {
    const [trendingAnime, seasonAnime, popularManga, newManga] = await Promise.all([
      getTrending(10).catch(() => [] as Title[]),
      getSeasonNow().catch(() => [] as Title[]),
      listMangaDex({ order: 'followedCount', limit: 18 }).catch(() => [] as Title[]),
      listMangaDex({ order: 'latestUploadedChapter', limit: 12 }).catch(() => [] as Title[]),
    ]);
    // Hero comes from the most-followed manga (it's what we can actually read).
    const hero = popularManga[0] || trendingAnime[0] || seasonAnime[0];
    const dedup = new Map<string, Title>();
    [...popularManga, ...trendingAnime, ...newManga].forEach((t) => {
      if (!dedup.has(t.id)) dedup.set(t.id, t);
    });
    return {
      hero,
      trending: trendingAnime.slice(0, 8),
      airingNow: seasonAnime.slice(0, 12),
      manga: popularManga.slice(1, 13),
      newReleases: newManga.slice(0, 10),
      forYou: Array.from(dedup.values()).slice(0, 12),
    };
  },
  ['discovery-v2'],
  { revalidate: 60 * 30, tags: ['discovery'] }
);

/** Mature library — content-rating filtered. Cached separately. */
export const getMatureLibrary = unstable_cache(
  async () => {
    const [erotica, suggestive] = await Promise.all([
      listMangaDex({ order: 'followedCount', limit: 24, contentRating: ['erotica'] }).catch(() => [] as Title[]),
      listMangaDex({ order: 'followedCount', limit: 18, contentRating: ['suggestive'] }).catch(() => [] as Title[]),
    ]);
    return { erotica, suggestive };
  },
  ['mature-v1'],
  { revalidate: 60 * 60, tags: ['mature'] }
);

export async function getTitle(slug: string): Promise<Title | null> {
  if (!slug) return null;

  // MangaDex (UUID)
  if (slug.startsWith('md-')) {
    return getMangaDex(slug.slice(3));
  }

  // AniList / Jikan numeric ids
  const m = /^(anilist|mal)-(\d+)$/.exec(slug);
  if (m) {
    const [, source, idStr] = m;
    const id = Number(idStr);
    try {
      if (source === 'anilist') return await getTitleByAnilistId(id);
      if (source === 'mal') return await getAnimeById(id).catch(() => getMangaById(id));
    } catch {
      return null;
    }
  }

  return null;
}

export async function searchAll(q: string): Promise<Title[]> {
  // MangaDex first (readable), then AniList for metadata enrichment.
  const [md, al] = await Promise.all([
    listMangaDex({ q, limit: 12 }).catch(() => []),
    // Lazy import to avoid bundle bloat
    import('./anilist').then((m) => m.searchAnilist(q, 'MANGA')).catch(() => []),
  ]);
  // De-dupe by lowercased title — MangaDex wins because the user can read it.
  const seen = new Set<string>(md.map((t) => t.title.toLowerCase()));
  return [...md, ...al.filter((t) => !seen.has(t.title.toLowerCase()))];
}
