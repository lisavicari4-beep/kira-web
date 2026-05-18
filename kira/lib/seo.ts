// lib/seo.ts — metadata + JSON-LD helpers.
import type { Metadata } from 'next';
import type { Title } from './types';

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://kira.app';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'KIRA · read the universe', template: '%s · KIRA' },
  description: 'KIRA — next-gen platform for manga, anime, comics & webcomics. AI-tuned discovery, immersive reader, motion comics, built-in viral video studio.',
  applicationName: 'KIRA',
  keywords: ['manga', 'anime', 'webcomic', 'motion comic', 'manga reader', 'anime database'],
  openGraph: {
    type: 'website', url: SITE, siteName: 'KIRA',
    title: 'KIRA · read the universe',
    description: 'Next-gen manga/anime platform — read, watch, share.',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@kira' },
  alternates: { canonical: '/' },
};

export function titleMetadata(t: Title): Metadata {
  const desc = t.synopsis.slice(0, 200);
  return {
    title: t.title,
    description: desc,
    alternates: { canonical: `/title/${t.id}` },
    openGraph: {
      title: t.title, description: desc, type: 'video.tv_show',
      url: `${SITE}/title/${t.id}`,
      images: t.cover ? [{ url: t.cover, width: 800, height: 1200 }] : [],
    },
    twitter: {
      card: 'summary_large_image', title: t.title, description: desc,
      images: t.cover ? [t.cover] : [],
    },
  };
}

export function titleJsonLd(t: Title) {
  const isAnime = t.type === 'anime';
  return {
    '@context': 'https://schema.org',
    '@type': isAnime ? 'TVSeries' : 'ComicSeries',
    name: t.title,
    alternateName: [t.titleJa, t.titleEn].filter(Boolean),
    description: t.synopsis,
    image: t.cover,
    datePublished: t.year ? `${t.year}-01-01` : undefined,
    genre: t.genres,
    numberOfEpisodes: t.episodes,
    aggregateRating: t.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: t.rating,
      bestRating: 10,
      ratingCount: 1000,
    } : undefined,
    sameAs: t.externalLinks.map((l) => l.url),
  };
}
