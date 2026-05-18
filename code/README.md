# KIRA

> Next-gen manga / anime / webcomic platform. Dark neon-shōnen aesthetic, AI-tuned discovery, an immersive reader, and a viral panel-to-video studio.

This is the **functional Next.js codebase** that implements the design system shown in the parent project's design canvas (`../index.html`) and tech brief (`../tech-brief.html`).

## Stack

- **Next.js 15** (App Router, RSC, ISR)
- **React 19 RC**
- **TypeScript** (strict)
- **Tailwind CSS** with KIRA's neon-shōnen tokens
- **Anthropic SDK** for Smart Search (`claude-haiku-4-5` by default)
- Public APIs: **Jikan** (MyAnimeList), **AniList** GraphQL

No image assets in repo — covers come from CDN.

## Folder structure

\`\`\`
code/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # root layout, fonts, SEO defaults
│   ├── page.tsx               # / — Discovery feed (SSR + ISR 30min)
│   ├── globals.css
│   ├── ask/page.tsx           # /ask — AI Smart Search chat
│   ├── title/[slug]/page.tsx  # /title/<src>-<id> — detail + JSON-LD
│   ├── read/[chapter]/page.tsx# /read/<chapter-id> — immersive reader
│   ├── age-gate/page.tsx      # 18+ confirmation
│   ├── sitemap.ts             # /sitemap.xml
│   ├── robots.ts              # /robots.txt
│   └── api/
│       ├── jikan/[...path]/route.ts  # proxy
│       ├── anilist/route.ts          # GraphQL proxy
│       ├── search/route.ts           # AI search (SSE stream)
│       └── age-gate/route.ts         # set kira_18 cookie
├── components/
│   ├── KiraLogo.tsx           # brand mark
│   ├── icons.tsx              # SVG icon set
│   ├── Cover.tsx              # image / placeholder cover
│   ├── TitleCard.tsx
│   ├── MobileTabBar.tsx
│   ├── DiscoveryFeed.tsx      # RSC hero + rails
│   ├── AISearchBar.tsx        # client; consumes /api/search SSE
│   ├── Reader.tsx             # vertical/LTR/RTL immersive reader
│   └── ReadAlongOverlay.tsx   # tap-kanji JP language tool
├── lib/
│   ├── types.ts               # unified Title / Chapter / JpToken
│   ├── jikan.ts               # Jikan v4 adapter
│   ├── anilist.ts             # AniList GraphQL adapter
│   ├── titles.ts              # unified facade + unstable_cache
│   ├── seo.ts                 # metadata helpers + JSON-LD
│   ├── age-gate.ts            # cookie + mature-path helpers
│   └── sample-chapter.ts      # demo chapter for reader
├── middleware.ts              # gates /m/* via kira_18 cookie
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── postcss.config.mjs
├── package.json
└── .env.example
\`\`\`

## Quickstart

\`\`\`bash
cd code
cp .env.example .env.local        # add ANTHROPIC_API_KEY (or leave empty for mock)
npm install
npm run dev                       # http://localhost:3000
\`\`\`

## What works out of the box

| Surface | URL | Notes |
|---|---|---|
| Discovery feed | `/` | Real data via AniList + Jikan, ISR 30min |
| AI Smart Search | `/ask` | Streams via Server-Sent Events; falls back to mock if no API key |
| Title detail | `/title/anilist-30002` | SSR with full `Metadata` + JSON-LD |
| Reader | `/read/anilist-30002-ch-1?mode=vertical` | Modes: `vertical` / `ltr` / `rtl` |
| Age-gate | `/age-gate` | Sets `kira_18` cookie via `/api/age-gate` |
| Mature routes | `/m/*` | 307-redirected to `/age-gate` until cookie set |

## SEO

- Every public page exports `generateMetadata` (title detail) or static `metadata` (others); both feed canonical, OG, Twitter card.
- Title pages embed **JSON-LD** (`TVSeries` / `ComicSeries`) via `titleJsonLd()`.
- `app/sitemap.ts` produces the index; partitioned sitemaps (`titles-{shard}.xml`) plug in once you have a DB.
- `app/robots.ts` blocks `/m/*`, `/mature/*`, `/api/`, `/age-gate` from crawlers.
- Discovery feed is RSC (zero JS for first paint) → tiny LCP budget.

## AI integration

`POST /api/search` is a server-sent-events stream emitting events in order:

\`\`\`
event: status       data: { phase: "planning" | "retrieving" | "ranking" }
event: plan         data: { keywords: [...], filters: {...}, tone: "..." }
event: results      data: SearchHit[]
event: done         data: { count: number }
event: error        data: { message: string }
\`\`\`

Pipeline: query → LLM planner (Anthropic Haiku) → keyword-driven retrieval (AniList + Jikan) → re-rank with overlap + rating score → stream back. Replace the planner with Claude Sonnet for higher quality, or swap to GPT/Gemini by changing one import.

## Automated SEO content engine

See `../tech-brief.html#05`. Plug-in points in this codebase:

- `Title.synopsisSource` field — flip to `'kira-rewrite'` once the rewriter writes to your DB.
- `titleMetadata()` / `titleJsonLd()` — already consume the chosen synopsis.
- Add an Inngest worker (`code/inngest/rewrite.ts`) that:
  1. Reads new titles from the DB
  2. Calls the LLM with the brand-voice system prompt
  3. Embeds output → cosine-checks against source corpus
  4. On `<25%` overlap → write back; on fail → enqueue human review
  5. Triggers `revalidateTag('discovery')` and per-title `revalidatePath`.

## Deployment

Vercel-native. Drop `code/` at the project root (or set it as the **Root Directory**), add `ANTHROPIC_API_KEY` + `NEXT_PUBLIC_SITE_URL` env vars, ship.
