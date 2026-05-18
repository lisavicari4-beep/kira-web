// app/api/anilist/route.ts — GraphQL proxy.
import { NextResponse } from 'next/server';
const ANILIST = 'https://graphql.anilist.co';

export async function POST(req: Request) {
  const body = await req.text();
  const res = await fetch(ANILIST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body,
    next: { revalidate: 60 * 30, tags: ['anilist'] },
  });
  return new NextResponse(await res.text(), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
    },
  });
}
