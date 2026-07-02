// Heartbeat — tiny live backend status widget: dot + mono label ("API 200 · 41ms").
// Pings the same public GitHub API that Repositories.jsx already uses; the
// /rate_limit endpoint is chosen because requests to it do NOT count against
// the unauthenticated rate limit, so a 30s heartbeat can't starve the repos
// section. No tokens, no private endpoints. Monochrome: state is expressed by
// dot luminance/glow only, never hue.

(() => {
  /* ── CSS injected once ─────────────────────────────────────────────────── */
  if (!document.getElementById('ak-hb-css')) {
    const s = document.createElement('style');
    s.id = 'ak-hb-css';
    s.textContent = `
      .ak-hb {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: var(--font-mono); font-size: 11px;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        white-space: nowrap;
      }
      .ak-hb-dot {
        width: 7px; height: 7px; border-radius: var(--radius-full);
        background: var(--text-faint); /* offline/checking: dim, no glow */
        flex-shrink: 0;
        transition: background var(--dur-base) var(--ease-out),
                    box-shadow var(--dur-base) var(--ease-out);
      }
      .ak-hb-dot--online {
        background: var(--white);
        box-shadow: 0 0 8px var(--glow-medium), 0 0 20px var(--glow-soft);
        animation: ak-hb-pulse 2.4s var(--ease-in-out) infinite;
      }
      @keyframes ak-hb-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
      @media (prefers-reduced-motion: reduce) {
        .ak-hb-dot--online { animation: none; }
      }
    `;
    document.head.appendChild(s);
  }

  const PING_URL = 'https://api.github.com/rate_limit';
  const INTERVAL_MS = 30000;
  const TIMEOUT_MS  = 6000;

  function Heartbeat() {
    const [state, setState] = React.useState({ kind: 'checking', code: null, ms: null });

    React.useEffect(() => {
      let timer = null;
      let alive = true;

      const ping = () => {
        const ctrl = new AbortController();
        const kill = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        const t0 = performance.now();
        fetch(PING_URL, { signal: ctrl.signal, cache: 'no-store' })
          .then((r) => {
            const ms = Math.round(performance.now() - t0);
            if (alive) setState({ kind: r.ok ? 'online' : 'error', code: r.status, ms });
          })
          .catch(() => {
            /* network / CORS / timeout — silently degrade to offline */
            if (alive) setState({ kind: 'offline', code: null, ms: null });
          })
          .finally(() => clearTimeout(kill));
      };

      /* Pause while the tab is hidden — no background requests */
      const start = () => { if (!timer) { ping(); timer = setInterval(ping, INTERVAL_MS); } };
      const stop  = () => { clearInterval(timer); timer = null; };
      const onVis = () => { if (document.hidden) stop(); else start(); };

      if (!document.hidden) start();
      document.addEventListener('visibilitychange', onVis);
      return () => {
        alive = false;
        stop();
        document.removeEventListener('visibilitychange', onVis);
      };
    }, []);

    const online = state.kind === 'online';
    const label =
      state.kind === 'checking' ? 'API …' :
      online                    ? `API ${state.code} · ${state.ms}ms` :
      state.kind === 'error'    ? `API ${state.code}` :
                                  'API offline';

    return (
      <span className="ak-hb" role="status" aria-label={`backend status: ${label}`}>
        <span className={`ak-hb-dot${online ? ' ak-hb-dot--online' : ''}`} aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  window.Heartbeat = Heartbeat;
})();
