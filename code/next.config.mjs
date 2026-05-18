// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Every CDN we ingest from must be listed explicitly — Next.js refuses
    // remote images otherwise. Add new hosts here when you onboard a source.
    remotePatterns: [
      // MangaDex (the actual chapter pages we read)
      { protocol: 'https', hostname: 'uploads.mangadex.org' },
      { protocol: 'https', hostname: 'mangadex.org' },
      // MangaDex MD@Home nodes — wildcard for the dynamic CDN pool
      { protocol: 'https', hostname: '*.mangadex.network' },

      // MyAnimeList / Jikan
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'api-cdn.myanimelist.net' },

      // AniList
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'img.anili.st' },

      // Kitsu (fallback metadata source)
      { protocol: 'https', hostname: 'media.kitsu.app' },
      { protocol: 'https', hostname: 'media.kitsu.io' },

      // Your own CDN
      { protocol: 'https', hostname: 'cdn.kira.app' },

      // Dev/demo placeholders
      { protocol: 'https', hostname: 'placehold.co' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
