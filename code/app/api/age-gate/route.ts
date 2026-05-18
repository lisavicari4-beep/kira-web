// app/api/age-gate/route.ts — sets the kira_18 cookie after the user
// confirms they're 18+. The page hits this on submit, then redirects back.
import { NextResponse } from 'next/server';
import { AGE_COOKIE, AGE_MAX_AGE } from '@/lib/age-gate';

export async function POST(req: Request) {
  const { ok, returnTo } = await req.json().catch(() => ({ ok: false, returnTo: '/' }));
  if (!ok) return NextResponse.json({ error: 'consent required' }, { status: 400 });

  const res = NextResponse.json({ ok: true, returnTo });
  res.cookies.set({
    name: AGE_COOKIE,
    value: '1',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AGE_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(AGE_COOKIE);
  return res;
}
