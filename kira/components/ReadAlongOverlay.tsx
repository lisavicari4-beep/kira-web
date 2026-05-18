'use client';
// components/ReadAlongOverlay.tsx
import { useState } from 'react';
import type { JpToken } from '@/lib/types';

export function ReadAlongOverlay({ tokens }: { tokens: JpToken[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {tokens.map((t, i) => {
        const [x, y, w, h] = t.box;
        return (
          <button key={i}
            onClick={(e) => { e.stopPropagation(); setActive(active === i ? null : i); }}
            className="absolute pointer-events-auto bg-hot/0 hover:bg-hot/20 rounded transition-colors"
            style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
            aria-label={`Translate ${t.text}`}>
            <span className="absolute inset-0 ring-1 ring-hot/0 hover:ring-hot/60 rounded" />
          </button>
        );
      })}
      {active !== null && tokens[active] && (
        <Tooltip tok={tokens[active]} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

function Tooltip({ tok, onClose }: { tok: JpToken; onClose: () => void }) {
  const [x, y, w] = tok.box;
  return (
    <div className="absolute pointer-events-auto bg-hot text-white p-2 rounded-lg shadow-hot text-left"
      style={{ left: `${(x + w) * 100}%`, top: `${y * 100}%`, minWidth: 140, transform: 'translateX(-50%)' }}
      onClick={(e) => e.stopPropagation()}>
      <div className="flex items-baseline gap-1.5">
        <span className="kira-jp font-bold text-base">{tok.text}</span>
        <span className="kira-mono text-[10px] opacity-80">{tok.reading}</span>
      </div>
      <div className="text-[11px] mt-0.5 leading-snug">{tok.meaning}</div>
      <div className="text-[9px] opacity-70 mt-1">{tok.pos}{tok.jlpt ? ` · ${tok.jlpt}` : ''}</div>
      <button onClick={onClose} className="absolute top-1 right-1.5 text-white/80 text-[10px]">✕</button>
    </div>
  );
}
