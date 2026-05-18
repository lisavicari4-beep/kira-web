'use client';
// Age-gate UI. Three consent rows must be checked → POST /api/age-gate → redirect.
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons';
import { KiraLogo } from '@/components/KiraLogo';

export function AgeGateClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const returnTo = sp.get('return') || '/';

  const [checks, setChecks] = useState([false, false, false]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const allOk = checks.every(Boolean);

  async function submit() {
    if (!allOk || busy) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/age-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, returnTo }),
      });
      if (!r.ok) throw new Error('failed to set cookie');
      router.push(returnTo);
    } catch (e) {
      setErr((e as Error).message); setBusy(false);
    }
  }

  return (
    <>
      <header className="flex justify-between items-center px-4 pt-4">
        <button onClick={() => router.back()} aria-label="Back"><Icon name="chevron-left" size={22} className="text-text-dim" /></button>
        <KiraLogo size={14} />
        <div className="w-6" />
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full"
           style={{ background: 'radial-gradient(circle at 50% -10%, rgba(184,85,255,0.25), transparent 55%)' }}>
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 grid place-items-center">
            <div className="absolute inset-0 blur-xl rounded-full bg-violet/30" />
            <div className="relative w-20 h-20 rounded-full border-2 border-violet bg-violet/10 grid place-items-center font-display text-2xl text-violet"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(184,85,255,0.3), 0 0 24px rgba(184,85,255,0.25)' }}>
              18+
            </div>
          </div>
        </div>
        <div className="kira-hit text-[11px] text-violet tracking-[0.2em] text-center">RESTRICTED · MATURE</div>
        <h1 className="kira-display text-3xl mt-2 leading-tight text-center">
          Adult comics<br/>& mature galleries
        </h1>
        <p className="mt-3 text-[13px] text-text-dim leading-relaxed text-center">
          You're entering KIRA's separated mature library. Content is rated 17+ to 21+.
          Your main feed stays clean — toggle off any time in Settings.
        </p>

        <ul className="mt-6 flex flex-col gap-2.5">
          {[
            { label: "I'm 18 or older" },
            { label: "I'm not browsing in public", detail: 'hides covers if you switch apps' },
            { label: 'I understand my main feed stays SFW' },
          ].map((row, i) => (
            <li key={i}>
              <button type="button"
                onClick={() => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))}
                className="w-full flex items-center gap-3 p-3 bg-bg-1 border border-line rounded-xl text-left">
                <span className={`w-5.5 h-5.5 rounded-md grid place-items-center flex-shrink-0 border${
                  checks[i] ? ' border-violet bg-violet/15' : ' border-line bg-transparent'
                }`} style={{ width: 22, height: 22 }}>
                  {checks[i] && <Icon name="check" size={12} className="text-violet" />}
                </span>
                <div>
                  <div className="text-[12.5px] font-semibold">{row.label}</div>
                  {row.detail && <div className="text-[10.5px] text-text-muted">{row.detail}</div>}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <button onClick={submit} disabled={!allOk || busy}
          className="kira-btn mt-5 disabled:opacity-50"
          style={{ background: '#b855ff', borderColor: 'transparent', color: '#fff', boxShadow: '0 0 24px rgba(184,85,255,0.4)' }}>
          <Icon name="shield" size={14} /> {busy ? 'Verifying…' : 'Enter mature section'}
        </button>
        <button onClick={() => router.push('/')} className="kira-btn kira-btn-hot bg-transparent border-none text-text-muted mt-2 hover:bg-transparent">
          Not now
        </button>

        {err && <div className="text-[11px] text-hot mt-2 text-center">{err}</div>}

        <div className="mt-6 p-2.5 rounded-xl border border-line bg-white/[0.03] flex items-center gap-2.5">
          <Icon name="shield" size={14} className="text-text-muted" />
          <span className="text-[10.5px] text-text-muted leading-snug">
            Mature content lives on a separate subdomain (m.kira.app) — keeps your SEO clean and ad-network safe.
          </span>
        </div>
      </div>
    </>
  );
}
