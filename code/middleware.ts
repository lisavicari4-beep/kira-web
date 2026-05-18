// middleware.ts — runs on every request.
// Enforces the 18+ age-gate for /m/* (mature) routes.
import { NextResponse, type NextRequest } from 'next/server';

const AGE_COOKIE = process.env.KIRA_AGE_COOKIE || 'kira_18';
const MATURE_PREFIXES = ['/m', '/mature'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isMature = MATURE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!isMature) return NextResponse.next();

  const verified = req.cookies.get(AGE_COOKIE)?.value === '1';
  if (verified) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/age-gate';
  url.searchParams.set('return', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/age-gate|age-gate).*)'],
};
