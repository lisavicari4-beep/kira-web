// app/page.tsx — Discovery homepage (SSR + ISR 30min).
import { Suspense } from 'react';
import Link from 'next/link';
import { KiraLogo } from '@/components/KiraLogo';
import { Icon } from '@/components/icons';
import { DiscoveryFeed } from '@/components/DiscoveryFeed';
import { getDiscoveryData } from '@/lib/titles';

export const revalidate = 1800; // 30 min ISR

export default async function HomePage() {
  return (
    <main className="max-w-md mx-auto">
      <TopBar />
      <Suspense fallback={<FeedSkeleton />}>
        <FeedAsync />
      </Suspense>
    </main>
  );
}

async function FeedAsync() {
  const data = await getDiscoveryData();
  if (!data.hero) return <EmptyState />;
  return <DiscoveryFeed {...data} />;
}

function TopBar() {
  return (
    <header className="flex items-center justify-between px-4 pt-3 pb-3 sticky top-0 z-20 backdrop-blur-md bg-bg-0/80">
      <KiraLogo size={17} glow />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-gold kira-mono text-xs font-semibold">
          <Icon name="streak" size={13} /> 27
        </div>
        <Link href="/ask" aria-label="AI search"><Icon name="search" size={22} className="text-text-dim" /></Link>
        <Link href="/me" aria-label="Profile"
          className="w-7 h-7 rounded-full"
          style={{ background: 'linear-gradient(135deg,#ff1f6d,#b855ff)', boxShadow: '0 0 0 1px #ff1f6d' }} />
      </div>
    </header>
  );
}

function FeedSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="aspect-[4/5] rounded-2xl bg-bg-1 animate-pulse" />
      <div className="flex gap-2.5">
        {[0,1,2,3].map((i) => <div key={i} className="w-32 aspect-[2/3] rounded-md bg-bg-1 animate-pulse" />)}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center text-text-muted">
      <p>Couldn't reach the catalog right now.</p>
      <Link href="/" className="kira-btn kira-btn-hot mt-4">Retry</Link>
    </div>
  );
}
