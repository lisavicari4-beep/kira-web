// app/api/search/route.ts — AI Smart Search.
// Streams an LLM-ranked list of titles given a natural-language query.
// Falls back to a deterministic mock if ANTHROPIC_API_KEY is not set, so dev still works.

import Anthropic from '@anthropic-ai/sdk';
import { searchAll } from '@/lib/titles';
import type { Title } from '@/lib/types';

export const runtime = 'nodejs'; // we want fetch + node SDK

const SYSTEM = `You are KIRA's manga/anime concierge. The user describes what they want;
you return a JSON object {keywords: string[], filters: {maxVolumes?: number, demographic?: string, mature?: boolean}, tone: string}.
Be terse. Do not include markdown. Output ONLY valid JSON.`;

interface Plan { keywords: string[]; filters: { maxVolumes?: number; demographic?: string; mature?: boolean }; tone: string }

async function makePlan(q: string): Promise<Plan> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Deterministic mock: derive keywords by splitting on commas/sentences.
    const kws = q.toLowerCase()
      .replace(/[^a-z0-9\s,]/g, ' ')
      .split(/[\s,]+/)
      .filter((w) => w.length > 3 && !['like', 'with', 'want', 'give', 'make'].includes(w))
      .slice(0, 4);
    return { keywords: kws.length ? kws : [q.split(' ').slice(0, 2).join(' ')], filters: {}, tone: 'neutral' };
  }
  const client = new Anthropic();
  const out = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 200,
    system: SYSTEM,
    messages: [{ role: 'user', content: q }],
  });
  const text = out.content
    .filter((c) => c.type === 'text')
    .map((c) => (c.type === 'text' ? c.text : ''))
    .join('');
  try {
    return JSON.parse(text);
  } catch {
    return { keywords: [q], filters: {}, tone: 'neutral' };
  }
}

function rankHits(titles: Title[], plan: Plan, q: string) {
  const qWords = new Set([...plan.keywords, ...q.toLowerCase().split(/\s+/)]);
  return titles
    .map((t) => {
      const hay = (t.title + ' ' + t.genres.join(' ') + ' ' + t.tags.join(' ') + ' ' + t.synopsis).toLowerCase();
      let score = 0;
      qWords.forEach((w) => { if (hay.includes(w)) score += 10; });
      score += t.rating;
      if (plan.filters.demographic && t.demographic === plan.filters.demographic) score += 8;
      if (plan.filters.maxVolumes && t.volumes && t.volumes <= plan.filters.maxVolumes) score += 6;
      return { t, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ t, score }, i) => ({
      rank: i + 1,
      title: t,
      match: Math.min(99, 65 + Math.round(score)),
      reason: deriveReason(t, plan),
    }));
}

function deriveReason(t: Title, plan: Plan): string {
  const bits: string[] = [];
  const overlap = t.genres.find((g) => plan.keywords.some((k) => g.toLowerCase().includes(k)));
  if (overlap) bits.push(`overlap on ${overlap.toLowerCase()}`);
  if (t.rating >= 8) bits.push(`rated ${t.rating.toFixed(1)}`);
  if (t.status === 'finished') bits.push('complete · binge-safe');
  return bits.join(' · ') || 'matched on synopsis keywords';
}

export async function POST(req: Request) {
  const { q } = (await req.json().catch(() => ({}))) as { q?: string };
  if (!q || q.trim().length < 3) {
    return new Response(JSON.stringify({ error: 'query too short' }), { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      try {
        send('status', { phase: 'planning' });
        const plan = await makePlan(q);
        send('plan', plan);

        send('status', { phase: 'retrieving' });
        const pool: Title[] = [];
        for (const kw of plan.keywords.slice(0, 3)) {
          const found = await searchAll(kw).catch(() => []);
          pool.push(...found);
        }

        send('status', { phase: 'ranking' });
        const hits = rankHits(pool, plan, q);
        send('results', hits);
        send('done', { count: hits.length });
      } catch (err) {
        send('error', { message: (err as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
