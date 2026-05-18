// lib/mangadex.ts — MangaDex API client.
//
// Docs: https://api.mangadex.org/docs/ (no key, generous rate limits).
// We use:
//   GET /manga?...                  search/list
//   GET /manga/{id}                  single
//   GET /manga/{id}/feed?...         chapter list
//   GET /chapter/{id}                single chapter (for resolving from URL)
//   GET /at-home/server/{chapterId}  page server + filenames
//
// Chapter pages are served from MD@Home nodes; the response gives
// { baseUrl, chapter: { hash, data, dataSaver } } and image URLs are
//   `${baseUrl}/data/${hash}/${filename}`        (high quality)
//   `${baseUrl}/data-saver/${hash}/${filename}`  (compressed)

import type { Title, Chapter, ChapterPage } from './types';

const MD_API = 'https://api.mangadex.org';
const MD_UPLOADS = 'https://uploads.mangadex.org';

const fetchOpts = (revalidate = 60 * 60 * 6, tags: string[] = ['mangadex']) => ({
  headers: { 'User-Agent': 'KIRA/0.1 (+https://kira.app)' } as Record<string, string>,
  next: { revalidate, tags },
});

export type MDContentRating = 'safe' | 'suggestive' | 'erotica' | 'pornographic';

interface MDManga {
  id: string;
  type: 'manga';
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string>[];
    description: Record<string, string>;
    status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
    year: number | null;
    contentRating: MDContentRating;
    originalLanguage: string;
    tags: { id: string; attributes: { name: Record<string, string>; group: string } }[];
  };
  relationships: { id: string; type: string; attributes?: { fileName?: string } }[];
}

interface MDChapter {
  id: string;
  type: 'chapter';
  attributes: {
    title: string | null;
    volume: string | null;
    chapter: string | null;
    pages: number;
    translatedLanguage: string;
    publishAt: string;
    readableAt: string;
    externalUrl: string | null;
  };
  relationships: { id: string; type: string }[];
}

// ─── helpers ─────────────────────────────────────────────

function pickLocalized(map: Record<string, string> | undefined, prefer = ['en']): string {
  if (!map) return '';
  for (const k of prefer) if (map[k]) return map[k];
  const first = Object.values(map)[0];
  return first || '';
}

function coverUrlFor(manga: MDManga, size: 256 | 512 | 'original' = 512): string | undefined {
  const cover = manga.relationships.find((r) => r.type === 'cover_art');
  const fileName = cover?.attributes?.fileName;
  if (!fileName) return undefined;
  if (size === 'original') return `${MD_UPLOADS}/covers/${manga.id}/${fileName}`;
  return `${MD_UPLOADS}/covers/${manga.id}/${fileName}.${size}.jpg`;
}

function statusMap(s: MDManga['attributes']['status']): Title['status'] {
  switch (s) {
    case 'ongoing': return 'airing';
    case 'completed': return 'finished';
    case 'hiatus': return 'hiatus';
    case 'cancelled': return 'cancelled';
    default: return 'finished';
  }
}

function demoFromTags(tags: MDManga['attributes']['tags']): Title['demographic'] {
  // MangaDex tags don't carry demographic directly — caller can override.
  // We approximate by genre tags.
  const names = tags.map((t) => pickLocalized(t.attributes.name).toLowerCase());
  if (names.includes('shounen') || names.includes('shōnen')) return 'shonen';
  if (names.includes('seinen')) return 'seinen';
  if (names.includes('shoujo') || names.includes('shōjo')) return 'shojo';
  if (names.includes('josei')) return 'josei';
  return 'unknown';
}

function mdToTitle(m: MDManga): Title {
  const tagNames = m.attributes.tags.map((t) => pickLocalized(t.attributes.name));
  const isMature = m.attributes.contentRating === 'erotica' || m.attributes.contentRating === 'pornographic';
  return {
    id: `md-${m.id}`,
    type: 'manga',
    title: pickLocalized(m.attributes.title) || 'Untitled',
    titleJa: pickLocalized(m.attributes.title, ['ja']) || undefined,
    titleEn: pickLocalized(m.attributes.title, ['en']) || undefined,
    cover: coverUrlFor(m, 512),
    synopsis: pickLocalized(m.attributes.description),
    synopsisSource: 'partner',
    demographic: demoFromTags(m.attributes.tags),
    status: statusMap(m.attributes.status),
    rating: 0, // MangaDex doesn't expose a score; recommender layer can score later
    year: m.attributes.year ?? undefined,
    genres: tagNames.filter((n) => n),
    tags: [],
    mature: isMature,
    externalLinks: [
      { name: 'MangaDex', url: `https://mangadex.org/title/${m.id}`, kind: 'read' },
    ],
    ids: {},
  };
}

// ─── public api ──────────────────────────────────────────

interface ListResp<T> { result: 'ok' | 'error'; response: 'collection'; data: T[]; limit: number; offset: number; total: number }
interface EntityResp<T> { result: 'ok' | 'error'; response: 'entity'; data: T }

async function mdGet<T>(path: string, params: Record<string, string | number | string[]> = {}, revalidate = 60 * 60 * 6): Promise<T> {
  const url = new URL(`${MD_API}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach((vv) => url.searchParams.append(k, String(vv)));
    else url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, fetchOpts(revalidate));
  if (!res.ok) throw new Error(`MangaDex ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

/** List/search manga. SFW by default. */
export async function listMangaDex(opts: {
  q?: string;
  limit?: number;
  order?: 'followedCount' | 'latestUploadedChapter' | 'rating' | 'updatedAt' | 'createdAt';
  contentRating?: MDContentRating[];
  includedTags?: string[];
} = {}): Promise<Title[]> {
  const params: Record<string, string | number | string[]> = {
    limit: opts.limit ?? 20,
    'includes[]': ['cover_art', 'author'],
    'contentRating[]': opts.contentRating ?? ['safe', 'suggestive'],
    'availableTranslatedLanguage[]': ['en'],
    'hasAvailableChapters': 'true',
  };
  if (opts.q) params['title'] = opts.q;
  if (opts.order) params[`order[${opts.order}]`] = 'desc';
  if (opts.includedTags?.length) params['includedTags[]'] = opts.includedTags;
  const r = await mdGet<ListResp<MDManga>>('/manga', params);
  return r.data.map(mdToTitle);
}

/** Single manga by UUID. */
export async function getMangaDex(id: string): Promise<Title | null> {
  try {
    const r = await mdGet<EntityResp<MDManga>>(`/manga/${id}`, { 'includes[]': ['cover_art', 'author'] });
    return mdToTitle(r.data);
  } catch {
    return null;
  }
}

/** Chapter feed for a manga. English first; paginated externally if you ask for >100. */
export async function getChapterFeed(mangaId: string, limit = 100): Promise<MDChapter[]> {
  const r = await mdGet<ListResp<MDChapter>>(`/manga/${mangaId}/feed`, {
    limit,
    'translatedLanguage[]': ['en'],
    'order[volume]': 'asc',
    'order[chapter]': 'asc',
    'contentRating[]': ['safe', 'suggestive', 'erotica', 'pornographic'],
    'includes[]': ['scanlation_group'],
  });
  // De-dupe by chapter number (same chapter from multiple scanlation groups)
  const seen = new Set<string>();
  return r.data.filter((c) => {
    const k = `${c.attributes.volume ?? ''}::${c.attributes.chapter ?? c.id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export interface ChapterListItem {
  id: string;
  number: string;
  volume: string | null;
  title: string;
  pages: number;
  publishedAt: string;
  externalUrl: string | null;
}

export function summarizeChapters(list: MDChapter[]): ChapterListItem[] {
  return list.map((c) => ({
    id: c.id,
    number: c.attributes.chapter ?? '—',
    volume: c.attributes.volume,
    title: c.attributes.title || `Chapter ${c.attributes.chapter ?? '—'}`,
    pages: c.attributes.pages,
    publishedAt: c.attributes.publishAt,
    externalUrl: c.attributes.externalUrl,
  }));
}

/** Resolve the manga id for a chapter UUID. Used by /read/[chapter]. */
export async function getChapterById(chapterId: string): Promise<{ chapter: MDChapter; mangaId: string } | null> {
  try {
    const r = await mdGet<EntityResp<MDChapter>>(`/chapter/${chapterId}`, {}, 60 * 60);
    const mangaRel = r.data.relationships.find((rel) => rel.type === 'manga');
    if (!mangaRel) return null;
    return { chapter: r.data, mangaId: mangaRel.id };
  } catch {
    return null;
  }
}

interface AtHomeResp {
  result: 'ok' | 'error';
  baseUrl: string;
  chapter: { hash: string; data: string[]; dataSaver: string[] };
}

/** Fetch image-server URLs for a chapter. Short cache — tokens rotate. */
export async function getChapterPages(chapterId: string, opts: { dataSaver?: boolean } = {}): Promise<ChapterPage[]> {
  const res = await fetch(`${MD_API}/at-home/server/${chapterId}`, {
    ...fetchOpts(60 * 5, ['mangadex-pages']),
  });
  if (!res.ok) throw new Error(`MangaDex at-home ${res.status}`);
  const data: AtHomeResp = await res.json();
  const folder = opts.dataSaver ? 'data-saver' : 'data';
  const files = opts.dataSaver ? data.chapter.dataSaver : data.chapter.data;
  return files.map((f, idx) => ({
    idx,
    imageUrl: `${data.baseUrl}/${folder}/${data.chapter.hash}/${f}`,
  }));
}
