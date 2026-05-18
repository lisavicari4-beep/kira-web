// lib/age-gate.ts — single source of truth for the 18+ rule.
import { cookies } from 'next/headers';

export const AGE_COOKIE = process.env.KIRA_AGE_COOKIE || 'kira_18';
export const AGE_MAX_AGE = Number(process.env.KIRA_AGE_MAX_AGE || 60 * 60 * 24 * 90);

export async function isAgeVerified(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(AGE_COOKIE)?.value === '1';
}

export function ageCookieAttrs() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: AGE_MAX_AGE,
  };
}

export const MATURE_PATHS = ['/m', '/mature'] as const;
export function isMaturePath(pathname: string): boolean {
  return MATURE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
