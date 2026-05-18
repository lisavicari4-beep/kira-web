// lib/types.ts — unified domain types.
export type Demographic = 'shonen' | 'seinen' | 'shojo' | 'josei' | 'kids' | 'unknown';
export type TitleType = 'manga' | 'anime' | 'webcomic' | 'comic' | 'novel';
export type Status = 'airing' | 'finished' | 'hiatus' | 'upcoming' | 'cancelled';

export interface Title {
  id: string;
  type: TitleType;
  title: string;
  titleJa?: string;
  titleEn?: string;
  cover?: string;
  bannerImage?: string;
  synopsis: string;
  synopsisSource: 'kira-rewrite' | 'jikan' | 'anilist' | 'partner';
  demographic: Demographic;
  status: Status;
  rating: number;
  year?: number;
  episodes?: number;
  volumes?: number;
  chapters?: number;
  genres: string[];
  tags: string[];
  mature: boolean;
  externalLinks: { name: string; url: string; kind: 'watch' | 'read' | 'info' }[];
  ids: { jikan?: number; anilist?: number };
}

export interface Chapter {
  id: string;
  titleId: string;
  number: number;
  name: string;
  releasedAt: string;
  pageCount: number;
  pages: ChapterPage[];
  isNew?: boolean;
}

export interface ChapterPage {
  idx: number;
  imageUrl: string;
  width?: number;
  height?: number;
  jpTokens?: JpToken[];
}

export interface JpToken {
  text: string;
  reading: string;
  meaning: string;
  pos: string;
  jlpt?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  box: [number, number, number, number];
}

export interface SearchHit {
  rank: number;
  title: Title;
  match: number;
  reason: string;
}
