// LedgerBackground — ambient append-only "payment log" texture. Independent layer,
// zero changes to existing components; reads together with .ak-grid-bg as one surface.
// Lines are generated client-side — pure texture, no real endpoints or data.

(() => {
  /* ── CSS injected once ─────────────────────────────────────────────────── */
  if (!document.getElementById('ak-ledger-css')) {
    const s = document.createElement('style');
    s.id = 'ak-ledger-css';
    s.textContent = `
      #ak-ledger {
        position: fixed;
        inset: 0;
        /* Sections paint their own opaque .ak-grid-bg, so the layer must sit at
           z-index 0: above section backgrounds, below their positioned content
           (this layer mounts before the routes, so equal-z content wins). */
        z-index: 0;
        overflow: hidden;
        pointer-events: none;
        font-family: var(--font-mono);
        font-size: var(--text-3xs);
        letter-spacing: 0.06em;
        line-height: 1;
        white-space: nowrap;
        color: var(--white-a12); /* alpha token — flips to near-black in light theme */
        /* Same dissolve-at-edges idea as .ak-grid-bg--faded, linear instead of radial */
        -webkit-mask-image: linear-gradient(to bottom, transparent 2%, #000 34%, #000 80%, transparent 97%);
                mask-image: linear-gradient(to bottom, transparent 2%, #000 34%, #000 80%, transparent 97%);
      }
      #ak-ledger .ak-ledger-col {
        position: absolute;
        top: 100%;
        left: clamp(16px, 4vw, 56px);
        will-change: transform;
        transition: transform .9s cubic-bezier(.16, 1, .3, 1);
      }
      #ak-ledger .ak-ledger-row {
        position: absolute;
        left: 0;
        transition: opacity .9s ease;
        animation: ak-ledger-in .9s ease;
      }
      @keyframes ak-ledger-in { from { opacity: 0; } }
    `;
    document.head.appendChild(s);
  }

  /* ── Fake payment-log line generator ───────────────────────────────────── */
  const rnd  = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const hex  = (n) => {
    let s = '';
    while (s.length < n) s += Math.random().toString(16).slice(2);
    return s.slice(0, n);
  };

  function makeLine() {
    const method = pick(['SBP', 'SBP', 'SBP', 'CARD', 'CARD', 'P2P']);
    const id = pick([
      'tx_'  + hex(8),
      'pay_' + hex(6),
      'p2p_' + hex(4),
      'cbk_' + hex(4),
      'ref_' + hex(6),
    ]);
    const r = Math.random();
    const status = r < 0.58 ? '200 OK' : r < 0.90 ? '201' : r < 0.96 ? '402' : '500';
    const ms = 8 + rnd(status === '500' ? 900 : 180);
    const mid = method === 'CARD' ? `CARD **** ${4000 + rnd(6000)}` : method;
    return `${id} · ${mid} · ${status} · ${ms}ms`;
  }

  /* ── React component ───────────────────────────────────────────────────── */
  const MAX_ROWS = 24; // hard cap on live DOM rows
  const ROW_H    = 30; // px between lines — one global slot per appended row

  function LedgerBackground() {
    const reduced = React.useMemo(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

    /* id doubles as the row's monotonic slot index in the column */
    const [rows, setRows] = React.useState(() =>
      Array.from({ length: 8 }, (_, i) => ({ id: i, text: makeLine() })));

    React.useEffect(() => {
      if (reduced) return; // static snapshot — no timers, no motion

      let timer = null;
      const schedule = () => {
        timer = setTimeout(() => {
          setRows((prev) => {
            const next = [...prev, { id: prev[prev.length - 1].id + 1, text: makeLine() }];
            return next.length > MAX_ROWS ? next.slice(next.length - MAX_ROWS) : next;
          });
          schedule();
        }, 1800 + Math.random() * 800); // ~1.8–2.6s jitter
      };

      /* Pause the stream while the tab is hidden — no background timers */
      const onVis = () => {
        if (document.hidden) { clearTimeout(timer); timer = null; }
        else if (!timer) schedule();
      };

      if (!document.hidden) schedule();
      document.addEventListener('visibilitychange', onVis);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', onVis);
      };
    }, [reduced]);

    /* Column rides up one slot per appended row; rows keep their absolute slot,
       so the only animated properties are the column transform + row opacity. */
    const head = rows[rows.length - 1].id + 1; // total rows appended so far
    return (
      <div id="ak-ledger" aria-hidden="true">
        <div
          className="ak-ledger-col"
          style={{ transform: `translateY(${-(head * ROW_H + 16)}px)` }}
        >
          {rows.map((r) => (
            <div
              key={r.id}
              className="ak-ledger-row"
              style={{
                top: r.id * ROW_H,
                opacity: Math.max(0, 1 - (head - 1 - r.id) / MAX_ROWS),
              }}
            >
              {r.text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  window.LedgerBackground = LedgerBackground;
})();
