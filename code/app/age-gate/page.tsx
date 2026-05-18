// app/age-gate/page.tsx — 18+ confirmation.
import { Suspense } from 'react';
import { AgeGateClient } from './client';

export const metadata = {
  title: '18+ · Mature content',
  description: 'KIRA mature library is age-restricted.',
  robots: { index: false, follow: false },
};

export default function AgeGatePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Suspense><AgeGateClient /></Suspense>
    </main>
  );
}
