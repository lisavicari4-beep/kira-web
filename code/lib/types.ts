// lib/types.ts — unified domain types.
// All ingestion adapters (Jikan, AniList, …) normalize into these.

export type Demographic = 'shonen' | 'seinen' | 'shojo' | 'josei' | 'kids' | 'unknown';
export type TitleType = 'manga' | 'anime' | 'webcomic' | 'comic' | 'novel';
export type Status = 'airing' | 'finished' | 'hiatus' | 'upcoming' | 'cancelled';

export interface Title {
  id: string;              // canonical KIRA id (slug)
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
  rating: number;          // 0–10
  year?: number;
  episodes?: number;
  volumes?: number;
  chapters?: number;
  genres: string[];
  tags: string[];
  mature: boolean;          // hard gate
  externalLinks: { name: string; url: string; kind: 'watch' | 'read' | 'info' }[];
  ids: { jikan?: number; anilist?: number };
}

export interface Chapter {
  id: string;
  titleId: string;
  number: number;
  name: string;
  releasedAt: string;       // ISO
  pageCount: number;
  pages: ChapterPage[];
  isNew?: boolean;
}

export interface ChapterPage {
  idx: number;
  imageUrl: string;
  width?: number;
  height?: number;
  /** OCR'd Japanese text + bounding boxes — fuels the Read-Along overlay */
  jpTokens?: JpToken[];
}

export interface JpToken {
  text: string;
  reading: string;          // hiragana / katakana
  meaning: string;
  pos: string;              // part of speech, "noun" etc.
  jlpt?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  box: [number, number, number, number]; // x, y, w, h — normalized 0..1
}

export interface SearchHit {
  rank: number;
  title: Title;
  match: number;            // 0..100
  reason: string;
}
