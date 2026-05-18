// app/robots.ts — robots.txt
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: ['/'], disallow: ['/m/', '/mature/', '/api/', '/age-gate'] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
