// lib/jikan.ts — thin wrapper around Jikan v4 (https://docs.api.jikan.moe/)
// Jikan is public + keyless. We cache aggressively at the edge.

import type { Title } from './types';

const JIKAN = 'https://api.jikan.moe/v4';

interface JikanAnime {
  mal_id: number;
  url: string;
  title: string;
  title_japanese?: string;
  title_english?: string;
  images?: { webp?: { large_image_url?: string }; jpg?: { large_image_url?: string } };
  synopsis?: string;
  rating?: string;
  score?: number;
  year?: number;
  episodes?: number;
  status?: string;
  genres?: { name: string }[];
  demographics?: { name: string }[];
  external?: { name: string; url: string }[];
  streaming?: { name: string; url: string }[];
}

const headers = { 'User-Agent': 'KIRA/0.1 (https://kira.app)' };

async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${JIKAN}${path}`, {
    headers,
    next: { revalidate: 60 * 60 * 6, tags: ['jikan'] }, // 6h ISR
    ...init,
  });
  if (!res.ok) throw new Error(`Jikan ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

function normalizeStatus(s?: string): Title['status'] {
  if (!s) return 'finished';
  const x = s.toLowerCase();
  if (x.includes('airing') || x.includes('publishing')) return 'airing';
  if (x.includes('upcoming') || x.includes('not yet')) return 'upcoming';
  if (x.includes('hiatus')) return 'hiatus';
  if (x.includes('cancel')) return 'cancelled';
  return 'finished';
}

function normalizeDemo(d?: string): Title['demographic'] {
  switch ((d || '').toLowerCase()) {
    case 'shounen': case 'shōnen': return 'shonen';
    case 'seinen': return 'seinen';
    case 'shoujo': case 'shōjo': return 'shojo';
    case 'josei': return 'josei';
    case 'kids': return 'kids';
    default: return 'unknown';
  }
}

export function jikanToTitle(a: JikanAnime, kind: 'manga' | 'anime' = 'anime'): Title {
  const cover = a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url;
  return {
    id: `mal-${a.mal_id}`,
    type: kind,
    title: a.title,
    titleJa: a.title_japanese,
    titleEn: a.title_english,
    cover,
    synopsis: a.synopsis || '',
    synopsisSource: 'jikan',
    demographic: normalizeDemo(a.demographics?.[0]?.name),
    status: normalizeStatus(a.status),
    rating: a.score ?? 0,
    year: a.year,
    episodes: a.episodes,
    genres: a.genres?.map((g) => g.name) || [],
    tags: [],
    mature: (a.rating || '').includes('R+') || (a.rating || '').includes('Rx'),
    externalLinks: [
      ...(a.streaming || []).map((s) => ({ name: s.name, url: s.url, kind: 'watch' as const })),
      ...(a.external || []).map((s) => ({ name: s.name, url: s.url, kind: 'info' as const })),
    ],
    ids: { jikan: a.mal_id },
  };
}

export async function getTopAnime(limit = 20): Promise<Title[]> {
  const data = await getJSON<{ data: JikanAnime[] }>(`/top/anime?limit=${limit}`);
  return data.data.map((a) => jikanToTitle(a, 'anime'));
}

export async function getSeasonNow(): Promise<Title[]> {
  const data = await getJSON<{ data: JikanAnime[] }>('/seasons/now?limit=18');
  return data.data.map((a) => jikanToTitle(a, 'anime'));
}

export async function getAnimeById(id: number): Promise<Title> {
  const data = await getJSON<{ data: JikanAnime }>(`/anime/${id}`);
  return jikanToTitle(data.data, 'anime');
}

export async function getMangaById(id: number): Promise<Title> {
  const data = await getJSON<{ data: JikanAnime }>(`/manga/${id}`);
  return jikanToTitle(data.data, 'manga');
}

export async function searchJikan(q: string, kind: 'anime' | 'manga' = 'manga'): Promise<Title[]> {
  const data = await getJSON<{ data: JikanAnime[] }>(`/${kind}?q=${encodeURIComponent(q)}&limit=12`);
  return data.data.map((a) => jikanToTitle(a, kind));
}
