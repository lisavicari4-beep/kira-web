// app/api/jikan/[...path]/route.ts
// Server-side proxy to Jikan v4. Adds Edge caching + sane defaults.
// Keeps the public API surface ours; lets us rate-limit if needed.
import { NextResponse, type NextRequest } from 'next/server';

const JIKAN = 'https://api.jikan.moe/v4';

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const target = `${JIKAN}/${path.join('/')}${req.nextUrl.search}`;
  const res = await fetch(target, {
    headers: { 'User-Agent': 'KIRA/0.1' },
    next: { revalidate: 60 * 60, tags: ['jikan'] },
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
