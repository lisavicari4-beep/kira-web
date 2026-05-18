// app/api/jikan/[...path]/route.ts — Jikan v4 proxy.
import { NextResponse, type NextRequest } from 'next/server';
const JIKAN = 'https://api.jikan.moe/v4';

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const target = `${JIKAN}/${path.join('/')}${req.nextUrl.search}`;
  const res = await fetch(target, {
    headers: { 'User-Agent': 'KIRA/0.1' },
    next: { revalidate: 60 * 60, tags: ['jikan'] },
  });
  return new NextResponse(await res.text(), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
