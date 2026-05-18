// lib/anilist.ts — AniList GraphQL adapter.
import type { Title } from './types';

const ANILIST = 'https://graphql.anilist.co';

interface ALMedia {
  id: number;
  type: 'ANIME' | 'MANGA';
  title: { romaji?: string; english?: string; native?: string };
  description?: string;
  coverImage?: { extraLarge?: string; large?: string; color?: string };
  bannerImage?: string;
  averageScore?: number;
  seasonYear?: number;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  status?: string;
  genres?: string[];
  tags?: { name: string }[];
  isAdult?: boolean;
  externalLinks?: { site: string; url: string; type?: string }[];
}

const MEDIA_FIELDS = `
  id type
  title { romaji english native }
  description(asHtml: false)
  coverImage { extraLarge large color }
  bannerImage
  averageScore seasonYear episodes chapters volumes status genres
  tags { name }
  isAdult
  externalLinks { site url type }
`;

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 * 60 * 6, tags: ['anilist'] },
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const j = await res.json();
  if (j.errors) throw new Error(j.errors.map((e: { message: string }) => e.message).join('; '));
  return j.data as T;
}

function anilistToTitle(m: ALMedia): Title {
  return {
    id: `anilist-${m.id}`,
    type: m.type === 'ANIME' ? 'anime' : 'manga',
    title: m.title.english || m.title.romaji || m.title.native || 'Untitled',
    titleJa: m.title.native,
    titleEn: m.title.english,
    cover: m.coverImage?.extraLarge || m.coverImage?.large,
    bannerImage: m.bannerImage,
    synopsis: (m.description || '').replace(/<[^>]+>/g, ''),
    synopsisSource: 'anilist',
    demographic: (m.tags || []).some((t) => /shounen|shōnen/i.test(t.name)) ? 'shonen' :
                 (m.tags || []).some((t) => /seinen/i.test(t.name)) ? 'seinen' : 'unknown',
    status: m.status === 'RELEASING' ? 'airing' :
            m.status === 'NOT_YET_RELEASED' ? 'upcoming' :
            m.status === 'HIATUS' ? 'hiatus' :
            m.status === 'CANCELLED' ? 'cancelled' : 'finished',
    rating: (m.averageScore ?? 0) / 10,
    year: m.seasonYear,
    episodes: m.episodes,
    chapters: m.chapters,
    volumes: m.volumes,
    genres: m.genres || [],
    tags: (m.tags || []).map((t) => t.name),
    mature: !!m.isAdult,
    externalLinks: (m.externalLinks || []).map((e) => ({
      name: e.site, url: e.url,
      kind: (e.type === 'STREAMING' ? 'watch' : 'info') as 'watch' | 'info',
    })),
    ids: { anilist: m.id },
  };
}

export async function getTrending(limit = 20): Promise<Title[]> {
  const data = await gql<{ Page: { media: ALMedia[] } }>(`
    query ($limit: Int) {
      Page(perPage: $limit) {
        media(sort: TRENDING_DESC, type: ANIME) { ${MEDIA_FIELDS} }
      }
    }`, { limit });
  return data.Page.media.map(anilistToTitle);
}

export async function getTitleByAnilistId(id: number): Promise<Title> {
  const data = await gql<{ Media: ALMedia }>(`
    query ($id: Int) { Media(id: $id) { ${MEDIA_FIELDS} } }`, { id });
  return anilistToTitle(data.Media);
}

export async function searchAnilist(q: string, type: 'ANIME' | 'MANGA' = 'MANGA'): Promise<Title[]> {
  const data = await gql<{ Page: { media: ALMedia[] } }>(`
    query ($q: String, $type: MediaType) {
      Page(perPage: 12) { media(search: $q, type: $type) { ${MEDIA_FIELDS} } }
    }`, { q, type });
  return data.Page.media.map(anilistToTitle);
}
