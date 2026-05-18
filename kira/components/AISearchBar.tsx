'use client';
// components/AISearchBar.tsx — chat-style smart search.
import { useState, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { Icon } from './icons';
import { Cover } from './Cover';
import type { SearchHit } from '@/lib/types';

interface Plan { keywords: string[]; filters: { maxVolumes?: number; demographic?: string }; tone: string }

export function AISearchBar() {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<string>('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!q.trim() || busy) return;
    setBusy(true); setHits([]); setPlan(null); setErr(null); setPhase('starting');
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split('\n\n');
        buf = events.pop() || '';
        for (const evt of events) {
          const lines = evt.split('\n');
          const event = lines.find((l) => l.startsWith('event:'))?.slice(6).trim();
          const data = lines.find((l) => l.startsWith('data:'))?.slice(5).trim();
          if (!data) continue;
          const parsed = JSON.parse(data);
          if (event === 'status') setPhase(parsed.phase);
          else if (event === 'plan') setPlan(parsed);
          else if (event === 'results') setHits(parsed);
          else if (event === 'error') setErr(parsed.message);
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setErr((e as Error).message);
    } finally {
      setBusy(false); setPhase('');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-bg-2 border border-line-strong rounded-3xl px-3.5 py-2.5">
          <Icon name="sparkles" size={14} className="text-hot" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Describe what you're craving — &quot;suspenseful manga like Death Note, ≤30 vols&quot;"
            className="flex-1 bg-transparent outline-none text-[13px] text-text placeholder:text-text-muted" />
        </div>
        <button type="submit" disabled={busy || !q.trim()}
          className="w-11 h-11 grid place-items-center rounded-full bg-hot text-white shadow-hot-soft disabled:opacity-50">
          <Icon name="arrow-up" size={18} />
        </button>
      </form>

      {phase && (
        <div className="kira-mono text-[11px] text-hot animate-pulse2">
          {phase === 'planning' && '· planning query …'}
          {phase === 'retrieving' && '· retrieving matches …'}
          {phase === 'ranking' && '· ranking with LLM …'}
        </div>
      )}

      {plan && (
        <div className="rounded-md border border-dashed border-ice/30 bg-ice/5 p-2.5 kira-mono text-[10.5px] text-ice">
          tags: {plan.keywords.join(', ')}
          {plan.filters.maxVolumes ? ` · vols ≤ ${plan.filters.maxVolumes}` : ''}
          {plan.filters.demographic ? ` · ${plan.filters.demographic}` : ''}
        </div>
      )}

      {err && <div className="kira-mono text-[11px] text-hot">error: {err}</div>}

      {!!hits.length && (
        <ul className="flex flex-col gap-2.5">
          {hits.map((h) => <HitCard key={h.title.id} h={h} />)}
        </ul>
      )}
    </div>
  );
}

function HitCard({ h }: { h: SearchHit }) {
  return (
    <li>
      <Link href={`/title/${h.title.id}`}
        className="flex gap-3 p-2.5 bg-bg-1 rounded-xl border border-line hover:border-line-strong">
        <Cover src={h.title.cover} alt={h.title.title} paletteSeed={h.rank} className="w-[72px] flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="kira-hit text-[10px] text-hot">#{h.rank}</span>
            <span className="kira-mono text-[9.5px] text-hot font-bold">{h.match}% match</span>
          </div>
          <div className="text-sm font-bold mt-0.5">{h.title.title}</div>
          <div className="text-[10.5px] text-text-muted">
            {h.title.year ?? '—'} · {h.title.episodes ? `${h.title.episodes} ep` : h.title.volumes ? `${h.title.volumes} vols` : h.title.type}
          </div>
          <div className="text-[11.5px] text-text-dim mt-1.5 leading-snug">{h.reason}</div>
        </div>
      </Link>
    </li>
  );
}
