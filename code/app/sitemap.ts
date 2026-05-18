// app/sitemap.ts — top-level sitemap (static surfaces).
// Title/chapter/character sitemaps are split into partitioned files
// generated at build time from the DB; this is the index entry.
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE,           lastModified: now, changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${SITE}/ask`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${SITE}/me`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.4 },
  ];
}
