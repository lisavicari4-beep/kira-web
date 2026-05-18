// app/page.tsx — Discovery (homepage).
// Server component. Pulls real titles from MangaDex + AniList + Jikan.
// Mobile: stacked feed; desktop: hero banner + multi-column grids.
import { Suspense } from 'react';
import { DiscoveryFeed } from '@/components/DiscoveryFeed';
import { getDiscoveryData } from '@/lib/titles';

export const revalidate = 1800; // 30min ISR

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedAsync />
      </Suspense>
    </main>
  );
}

async function FeedAsync() {
  const data = await getDiscoveryData();
  if (!data.hero) {
    return (
      <div className="p-8 text-center text-text-muted max-w-3xl mx-auto">
        <p>Catalog sources are unreachable right now. Try again in a moment.</p>
      </div>
    );
  }
  return <DiscoveryFeed {...data} />;
}

function FeedSkeleton() {
  return (
    <div className="px-4 md:px-8 lg:px-12 py-4 md:py-8 space-y-6">
      <div className="aspect-[4/5] md:aspect-[21/9] rounded-2xl bg-bg-1 animate-pulse" />
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-md bg-bg-1 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
