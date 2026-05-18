// components/TitleCard.tsx
import Link from 'next/link';
import { Cover } from './Cover';
import type { Title } from '@/lib/types';

interface Props { title: Title; rank?: number; size?: 'sm' | 'md' | 'lg' }

export function TitleCard({ title, rank, size = 'md' }: Props) {
  const widths = { sm: 'w-24', md: 'w-32', lg: 'w-40' };
  return (
    <Link href={`/title/${title.id}`} className="group block flex-shrink-0">
      <div className={`relative ${widths[size]}`}>
        <Cover src={title.cover} alt={title.title} paletteSeed={hash(title.id)} />
        {rank !== undefined && (
          <span className="absolute top-1.5 left-1.5 bg-bg-0/80 backdrop-blur text-hot font-display text-sm px-1.5 rounded">#{rank}</span>
        )}
        {title.mature && (
          <span className="absolute top-1.5 right-1.5 bg-violet text-white text-[9px] font-display px-1 rounded">18+</span>
        )}
      </div>
      <div className="mt-1.5 text-[12px] font-semibold leading-tight line-clamp-2 group-hover:text-hot transition-colors">
        {title.title}
      </div>
      <div className="text-[10px] text-text-muted mt-0.5">
        {title.year ?? '—'} · ★ {(title.rating || 0).toFixed(1)}
      </div>
    </Link>
  );
}

function hash(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
