// Portfolio — Repositories. `git ls-remote`, live from the GitHub API.
//   1. stats HUD (repos · languages · since · last push)
//   2. `git log --graph`: every repo is a branch that forks off main when it
//      was created and runs to its last push — the whole history as one waterfall
//   3. a terminal: `git ls-remote | grep …` with --lang / --sort flags; rows
//      stream in like command output
// Hovering a row lights its branch in the graph and vice versa. Strictly
// monochrome (no language colours). Responses are cached in sessionStorage so
// reloads don't burn the 60 req/h unauthenticated GitHub limit.
// Wrapped in an IIFE: Babel script tags share one global scope. Class names
// use the ak-rt-* prefix — ak-term-* belongs to the Cmd+K CommandTerminal.
(() => {
  const { SectionHeading, Icon } = window.DS;

  const GH_USER = 'abdurohman-karim';
  const GH_URL = `https://github.com/${GH_USER}`;
  const HIDDEN = new Set([GH_USER]);          // profile-README repo; add names to hide more
  const CACHE_KEY = 'ak-gh-repos-v1';
  const CACHE_TTL = 10 * 60 * 1000;
  const PAGE = 12;                            // rows before "-- more --"

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── data ── */
  function normalize(list) {
    return list
      .filter((r) => !r.fork && !HIDDEN.has(r.name))
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        language: r.language || '',
        stars: r.stargazers_count,
        size: r.size,
        created: Date.parse(r.created_at),
        pushed: Date.parse(r.pushed_at),
        url: r.html_url,
      }));
  }
  function loadRepos() {
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE_KEY));
      if (c && Date.now() - c.t < CACHE_TTL && Array.isArray(c.d)) return Promise.resolve(c.d);
    } catch (e) { /* storage blocked — just fetch */ }
    return fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100`)
      .then((r) => r.json().then((d) => {
        if (!r.ok || !Array.isArray(d)) throw new Error((d && d.message) || `HTTP ${r.status}`);
        return d;
      }))
      .then((d) => {
        const list = normalize(d);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: list })); } catch (e) { /* ignore */ }
        return list;
      });
  }

  /* ── formatting ── */
  function ago(t) {
    const s = (Date.now() - t) / 1000;
    if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
    if (s < 86400) return `${Math.round(s / 3600)}h ago`;
    const d = Math.round(s / 86400);
    if (d < 31) return `${d}d ago`;
    const m = Math.round(d / 30.44);
    if (m < 12) return `${m}mo ago`;
    return `${(d / 365.25).toFixed(1).replace(/\.0$/, '')}y ago`;
  }
  const size = (kb) => (kb === 0 ? 'empty' : kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
  const ym = (t) => new Date(t).toISOString().slice(0, 7);

  /* ── styles — injected once ── */
  if (!document.getElementById('ak-repo-css')) {
    const s = document.createElement('style');
    s.id = 'ak-repo-css';
    s.textContent = `
      /* stats HUD */
      .ak-repo-stats {
        display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
        margin-top: 48px; border: 1px solid var(--border); border-radius: 18px; overflow: hidden;
        background: var(--surface-card);
        backdrop-filter: blur(var(--blur-md)); -webkit-backdrop-filter: blur(var(--blur-md));
      }
      .ak-repo-stat { padding: 18px 22px; display: flex; flex-direction: column; gap: 8px; }
      .ak-repo-stat + .ak-repo-stat { border-left: 1px solid var(--border-subtle); }
      .ak-repo-stat span {
        font-family: var(--font-mono); font-size: 10px; letter-spacing: .18em;
        text-transform: uppercase; color: var(--text-faint);
      }
      .ak-repo-stat b {
        font-family: var(--font-display); font-weight: 500; font-size: clamp(22px, 2.6vw, 32px);
        letter-spacing: -.02em; color: var(--text-primary); font-variant-numeric: tabular-nums;
      }
      @media (max-width: 700px) {
        .ak-repo-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .ak-repo-stat:nth-child(3) { border-left: 0; }
        .ak-repo-stat:nth-child(n+3) { border-top: 1px solid var(--border-subtle); }
      }

      /* panels share the glass chrome */
      .ak-repo-panel {
        margin-top: 20px; border: 1px solid var(--border); border-radius: 18px;
        background: var(--surface-card); overflow: hidden;
        backdrop-filter: blur(var(--blur-md)); -webkit-backdrop-filter: blur(var(--blur-md));
      }
      .ak-repo-bar {
        display: flex; align-items: center; gap: 14px; padding: 12px 18px;
        border-bottom: 1px solid var(--border-subtle);
        font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em; color: var(--text-faint);
      }
      .ak-repo-bar .dots { display: flex; gap: 6px; }
      .ak-repo-bar .dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--border-strong); }
      .ak-repo-bar > span:not(.dots) { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ak-repo-bar .end { margin-left: auto; flex-shrink: 0; }

      /* git log --graph */
      .ak-graph { position: relative; padding: 14px 18px 6px; }
      .ak-graph svg { display: block; overflow: visible; }
      .ak-graph .trunk { stroke: var(--text-muted); stroke-width: 1.5; fill: none; }
      .ak-graph .tick { stroke: var(--border-subtle); }
      .ak-graph .lbl { fill: var(--text-faint); font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em; }
      .ak-graph .lbl-hi { fill: var(--text-primary); }
      .ak-graph .head { stroke: var(--text-primary); stroke-dasharray: 2 3; }
      .ak-graph .row { transition: opacity .25s ease; }
      .ak-graph .br { fill: none; stroke: var(--text-faint); stroke-width: 1.2; transition: stroke .2s ease, stroke-width .2s ease; }
      .ak-graph .node { fill: var(--text-secondary); transition: fill .2s ease; }
      .ak-graph .hit { fill: transparent; pointer-events: all; }
      .ak-graph.has-hot .row { opacity: .2; }
      .ak-graph.has-hot .row.is-hot { opacity: 1; }
      .ak-graph .row.is-hot .br { stroke: var(--text-primary); stroke-width: 1.8; }
      .ak-graph .row.is-hot .node { fill: var(--text-primary); }
      .ak-graph-tip {
        position: absolute; left: 0; top: 0; pointer-events: none; z-index: 2;
        padding: 6px 10px; border-radius: 8px; white-space: nowrap;
        background: var(--text-primary); color: var(--bg);
        font-family: var(--font-mono); font-size: 11px; letter-spacing: .02em;
        transform: translate(-50%, calc(-100% - 10px));
      }
      .ak-graph-tip i { font-style: normal; opacity: .6; }

      /* terminal */
      .ak-rt-cmd {
        display: flex; align-items: center; flex-wrap: wrap; gap: 0 10px; padding: 16px 18px 6px;
        font-family: var(--font-mono); font-size: 13px; color: var(--text-primary);
      }
      .ak-rt-cmd .p { color: var(--text-muted); }
      .ak-rt-cmd .dim { color: var(--text-faint); }
      .ak-rt-type { display: inline-block; overflow: hidden; white-space: nowrap; vertical-align: bottom; }
      .ak-rt-grep {
        flex: 1; min-width: 140px; margin: 0; padding: 2px 0; border: 0; outline: 0; background: none;
        font: inherit; color: var(--text-primary); caret-color: var(--text-primary);
      }
      .ak-rt-grep::placeholder { color: var(--text-faint); }
      .ak-rt-flags {
        display: flex; flex-wrap: wrap; align-items: center; gap: 6px 4px; padding: 6px 18px 14px;
        font-family: var(--font-mono); font-size: 11px;
      }
      .ak-rt-flags .k { color: var(--text-faint); margin: 0 4px 0 10px; }
      .ak-rt-flags .k:first-child { margin-left: 0; }
      .ak-rt-flag {
        appearance: none; margin: 0; border: 1px solid transparent; border-radius: 6px; background: none;
        padding: 3px 7px; font: inherit; color: var(--text-muted);
        transition: color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
      }
      .ak-rt-flag:hover { color: var(--text-primary); border-color: var(--border); }
      .ak-rt-flag.is-on { color: var(--bg); background: var(--text-primary); }
      .ak-rt-flag:focus-visible { outline: 1px solid var(--border-strong); outline-offset: 1px; }
      .ak-rt-out {
        border-top: 1px solid var(--border-subtle); padding: 10px 6px 12px;
        font-family: var(--font-mono); font-size: 12.5px;
      }
      .ak-rt-note { padding: 6px 14px; color: var(--text-faint); }
      .ak-rt-row {
        display: grid; align-items: baseline; gap: 14px; padding: 7px 14px; border-radius: 8px;
        grid-template-columns: 58px minmax(0, 1fr) 104px 76px 72px 40px;
        text-decoration: none; color: var(--text-secondary);
        transition: background var(--dur-fast) ease, color var(--dur-fast) ease;
      }
      .ak-rt-row:hover, .ak-rt-row.is-hot { background: var(--white-a06); color: var(--text-primary); }
      .ak-rt-row:focus-visible { outline: 1px solid var(--border-strong); }
      .ak-rt-row > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ak-rt-row .mark { font-size: 10px; letter-spacing: .1em; color: var(--text-primary); }
      .ak-rt-row .mark i { font-style: normal; }
      .ak-rt-row .ref i { font-style: normal; color: var(--text-faint); }
      .ak-rt-row .ref em { font-style: normal; color: var(--text-faint); margin-left: 12px; }
      .ak-rt-row .lang, .ak-rt-row .sz, .ak-rt-row .when, .ak-rt-row .star { color: var(--text-muted); }
      .ak-rt-row .sz, .ak-rt-row .when, .ak-rt-row .star { text-align: right; }
      .ak-rt-more {
        appearance: none; margin: 6px 0 0; border: 0; background: none; padding: 7px 14px; border-radius: 8px;
        font: inherit; color: var(--text-muted); text-align: left; width: 100%;
      }
      .ak-rt-more:hover { color: var(--text-primary); background: var(--white-a04); }
      .ak-rt-foot {
        display: flex; align-items: center; gap: 10px; padding: 12px 18px;
        border-top: 1px solid var(--border-subtle); font-family: var(--font-mono); font-size: 12px;
      }
      .ak-rt-foot a { color: var(--text-muted); text-decoration: none; display: inline-flex; gap: 8px; align-items: center; }
      .ak-rt-foot a:hover { color: var(--text-primary); }
      .ak-rt-load { display: flex; align-items: center; gap: 12px; padding: 6px 14px; color: var(--text-muted); }
      .ak-rt-load .track { width: 160px; height: 4px; border-radius: 2px; background: var(--border); overflow: hidden; }
      .ak-rt-load .fill { height: 100%; width: 40%; background: var(--text-primary); animation: ak-rt-load 1.1s ease-in-out infinite alternate; }
      @keyframes ak-rt-load { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
      @media (prefers-reduced-motion: reduce) { .ak-rt-load .fill { animation: none; } }
      @media (max-width: 700px) {
        .ak-rt-row { grid-template-columns: 40px minmax(0, 1fr) 72px 60px; gap: 10px; font-size: 12px; }
        .ak-rt-row .sz, .ak-rt-row .star, .ak-rt-row .ref em { display: none; }
        .ak-rt-row .ref i, .ak-rt-row .mark i { display: none; }
        .ak-rt-cmd { font-size: 11.5px; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── 1. stats HUD ── */
  function RepoStats({ repos }) {
    const ref = React.useRef(null);
    const langs = new Set(repos.map((r) => r.language).filter(Boolean)).size;
    const since = new Date(Math.min(...repos.map((r) => r.created))).getFullYear();
    const last = Math.max(...repos.map((r) => r.pushed));
    const stats = [
      ['repositories', repos.length, true],
      ['languages', langs, true],
      ['first repo', since, false],
      ['last push', ago(last), false],
    ];

    React.useLayoutEffect(() => {
      if (reducedMotion()) return undefined;
      const els = [...ref.current.querySelectorAll('b')];
      const st = ScrollTrigger.create({
        trigger: ref.current, start: 'top 85%', once: true,
        onEnter: () => els.forEach((el, i) => {
          if (stats[i][2]) {
            const o = { v: 0 };
            gsap.to(o, { v: stats[i][1], duration: 1.2, ease: 'power3.out', snap: { v: 1 },
              onUpdate: () => { el.textContent = o.v; } });
          } else {
            window.akMotion.scramble(el, 0.9);
          }
        }),
      });
      return () => st.kill();
    }, []);

    return (
      <div className="ak-repo-stats" ref={ref}>
        {stats.map(([label, value]) => (
          <div key={label} className="ak-repo-stat"><span>{label}</span><b>{value}</b></div>
        ))}
      </div>
    );
  }

  /* ── 2. git log --graph ── */
  function BranchGraph({ repos, hot, setHot }) {
    const wrapRef = React.useRef(null);
    const svgRef = React.useRef(null);
    const drawnRef = React.useRef(false);
    const [w, setW] = React.useState(0);

    React.useLayoutEffect(() => {
      const el = wrapRef.current;
      const measure = () => setW(Math.round(el.clientWidth - 36));   // minus horizontal padding
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const rows = React.useMemo(() => [...repos].sort((a, b) => a.created - b.created), [repos]);
    const now = Date.now();
    const y0 = new Date(Math.min(...rows.map((r) => r.created))).getFullYear();
    const t0 = new Date(y0, 0, 1).getTime();
    const t1 = now + 20 * 86400000;
    const narrow = w < 560;
    const ROW = narrow ? 5 : 7, TRUNK = 16, TOP = 34, PADL = 4, PADR = narrow ? 40 : 56;
    const H = TOP + rows.length * ROW + 24;
    const x = (t) => PADL + ((t - t0) / (t1 - t0)) * (w - PADL - PADR);
    const years = [];
    for (let y = y0 + 1; y <= new Date(now).getFullYear(); y++) years.push(y);

    const geo = rows.map((r, i) => {
      const y = TOP + i * ROW;
      const xc = x(r.created);
      const xp = Math.max(x(r.pushed), xc + 3);
      const k = Math.min(6, y - TRUNK);
      return { r, y, xc, xp, d: `M${xc.toFixed(1)},${TRUNK} V${(y - k).toFixed(1)} Q${xc.toFixed(1)},${y} ${(xc + k).toFixed(1)},${y} H${xp.toFixed(1)}` };
    });

    /* branches grow out of main the first time the graph scrolls into view */
    React.useLayoutEffect(() => {
      if (!w || drawnRef.current || reducedMotion()) return undefined;
      const svg = svgRef.current;
      const paths = [...svg.querySelectorAll('.br')];
      const nodes = svg.querySelectorAll('.node');
      const trunk = svg.querySelector('.trunk');
      [trunk, ...paths].forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(nodes, { scale: 0, transformOrigin: '50% 50%' });
      const st = ScrollTrigger.create({
        trigger: svg, start: 'top 85%', once: true,
        onEnter: () => {
          drawnRef.current = true;
          const tl = gsap.timeline();
          tl.to(trunk, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
            .to(paths, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out', stagger: 0.02 }, 0.25)
            .to(nodes, { scale: 1, duration: 0.3, ease: 'power2.out', stagger: 0.02 }, 0.85)
            .set([trunk, ...paths], { clearProps: 'strokeDasharray,strokeDashoffset' })
            .set(nodes, { clearProps: 'transform,scale' });
        },
      });
      return () => st.kill();
    }, [w > 0]);

    const hotGeo = hot ? geo.find((g) => g.r.name === hot) : null;
    const tipLeft = hotGeo ? Math.min(Math.max(hotGeo.xp, 170), w - 170) : 0;   // centred on the node, kept inside

    return (
      <div className={`ak-graph${hot ? ' has-hot' : ''}`} ref={wrapRef} onMouseLeave={() => setHot(null)}>
        {w > 0 && (
          <svg ref={svgRef} width={w} height={H} aria-label="Repository history: each branch forks off main when created and ends at its last push" role="img">
            {years.map((y) => {
              const xx = x(new Date(y, 0, 1).getTime());
              return (
                <g key={y}>
                  <line className="tick" x1={xx} y1={TRUNK} x2={xx} y2={H - 16} />
                  <text className="lbl" x={xx} y={H - 2} textAnchor="middle">{y}</text>
                </g>
              );
            })}
            <text className="lbl" x={PADL} y={H - 2}>{y0}</text>
            <text className="lbl" x={PADL} y={TRUNK - 7}>main</text>
            <path className="trunk" d={`M${PADL},${TRUNK} H${x(now).toFixed(1)}`} />
            <line className="head" x1={x(now)} y1={TRUNK - 10} x2={x(now)} y2={H - 16} />
            <text className="lbl lbl-hi" x={x(now) + 6} y={TRUNK + 3}>HEAD</text>
            {geo.map((g) => (
              <g key={g.r.id} className={`row${hot === g.r.name ? ' is-hot' : ''}`}
                onMouseEnter={() => setHot(g.r.name)}>
                <path className="br" d={g.d} />
                <circle className="node" cx={g.xp} cy={g.y} r={narrow ? 1.8 : 2.4} />
                <rect className="hit" x={0} y={g.y - ROW / 2} width={w} height={ROW} />
              </g>
            ))}
          </svg>
        )}
        {hotGeo && (
          <div className="ak-graph-tip" style={{ left: tipLeft + 18, top: hotGeo.y + 14 }}>
            {hotGeo.r.name} <i>· {hotGeo.r.language || '—'} · {ym(hotGeo.r.created)} → {ym(hotGeo.r.pushed)}</i>
          </div>
        )}
      </div>
    );
  }

  /* ── 3. terminal ── */
  const SORTS = {
    pushed: (a, b) => b.pushed - a.pushed,
    created: (a, b) => b.created - a.created,
    name: (a, b) => a.name.localeCompare(b.name),
    size: (a, b) => b.size - a.size,
  };

  function RepoTerminal({ repos, status, error, hot, setHot }) {
    const rootRef = React.useRef(null);
    const outRef = React.useRef(null);
    const [booted, setBooted] = React.useState(false);
    const [q, setQ] = React.useState('');
    const [lang, setLang] = React.useState('all');
    const [sort, setSort] = React.useState('pushed');
    const [all, setAll] = React.useState(false);

    const langs = React.useMemo(() => {
      const count = {};
      repos.forEach((r) => { if (r.language) count[r.language] = (count[r.language] || 0) + 1; });
      return ['all', ...Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b))];
    }, [repos]);
    const headName = React.useMemo(
      () => (repos.length ? repos.reduce((a, b) => (b.pushed > a.pushed ? b : a)).name : ''), [repos]);

    const needle = q.trim().toLowerCase();
    const filtered = repos
      .filter((r) => lang === 'all' || r.language === lang)
      .filter((r) => !needle || `${r.name} ${r.description} ${r.language}`.toLowerCase().includes(needle))
      .sort(SORTS[sort]);
    const paged = all || needle || lang !== 'all' ? filtered : filtered.slice(0, PAGE);
    const rowsKey = paged.map((r) => r.id).join(',');

    /* boot: the command types itself the first time the terminal is seen */
    React.useLayoutEffect(() => {
      if (reducedMotion()) { setBooted(true); return undefined; }
      const cmd = rootRef.current.querySelector('.ak-rt-type');
      gsap.set(cmd, { width: 0 });
      const st = ScrollTrigger.create({
        trigger: rootRef.current, start: 'top 80%', once: true,
        onEnter: () => {
          const n = cmd.textContent.length;
          gsap.to(cmd, {
            width: cmd.scrollWidth, duration: n * 0.028, ease: `steps(${n})`,
            onComplete: () => { gsap.set(cmd, { clearProps: 'width' }); setBooted(true); },
          });
        },
      });
      return () => st.kill();
    }, []);

    /* rows stream in whenever the listing changes */
    React.useLayoutEffect(() => {
      if (!booted || reducedMotion() || !outRef.current) return;
      const rows = outRef.current.querySelectorAll('.ak-rt-row, .ak-rt-more, .ak-rt-note');
      if (!rows.length) return;
      gsap.fromTo(rows, { opacity: 0, x: -8 }, {
        opacity: 1, x: 0, duration: 0.3, ease: 'power2.out', overwrite: true,
        stagger: Math.min(0.035, 0.6 / rows.length),
      });
    }, [booted, rowsKey, status]);

    const pick = (setter, v) => { setter(v); setAll(false); };

    return (
      <div className="ak-repo-panel" ref={rootRef}>
        <div className="ak-repo-bar">
          <span className="dots"><i /><i /><i /></span>
          <span>zsh — ~/remote/{GH_USER}</span>
          <span className="end">{status === 'ready' ? `${filtered.length}/${repos.length} refs` : ''}</span>
        </div>

        <div className="ak-rt-cmd">
          <span className="p">$</span>
          <span className="ak-rt-type">git ls-remote --heads --sort=-{sort}</span>
          <span className="dim">| grep</span>
          <input
            className="ak-rt-grep"
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setAll(false); }}
            placeholder="filter…"
            aria-label="Filter repositories"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {status === 'ready' && (
          <div className="ak-rt-flags">
            <span className="k">--lang</span>
            {langs.map((l) => (
              <button key={l} type="button" className={`ak-rt-flag${lang === l ? ' is-on' : ''}`}
                aria-pressed={lang === l} onClick={() => pick(setLang, l)}>{l.toLowerCase()}</button>
            ))}
            <span className="k">--sort</span>
            {Object.keys(SORTS).map((k) => (
              <button key={k} type="button" className={`ak-rt-flag${sort === k ? ' is-on' : ''}`}
                aria-pressed={sort === k} onClick={() => pick(setSort, k)}>{k}</button>
            ))}
          </div>
        )}

        <div className="ak-rt-out" ref={outRef} aria-live="polite">
          {!booted && <div className="ak-rt-note">&nbsp;</div>}

          {booted && status === 'loading' && (
            <div className="ak-rt-load">
              <span>Resolving refs…</span><span className="track"><span className="fill" /></span>
            </div>
          )}

          {booted && status === 'error' && (
            <>
              <div className="ak-rt-note">fatal: unable to access 'https://api.github.com/': {error}</div>
              <div className="ak-rt-note">hint: the listing lives on GitHub too — see below</div>
            </>
          )}

          {booted && status === 'ready' && (
            <>
              <div className="ak-rt-note">From github.com:{GH_USER}</div>
              {paged.map((r) => (
                <a
                  key={r.id}
                  className={`ak-rt-row${hot === r.name ? ' is-hot' : ''}`}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="lock"
                  data-cursor-label="GitHub ↗"
                  onMouseEnter={() => setHot(r.name)}
                  onMouseLeave={() => setHot(null)}
                  onFocus={() => setHot(r.name)}
                  onBlur={() => setHot(null)}
                >
                  <span className="mark">{r.name === headName ? <>HEAD<i> →</i></> : ''}</span>
                  <span className="ref"><i>refs/heads/</i>{r.name}{r.description && <em># {r.description}</em>}</span>
                  <span className="lang">{r.language || '—'}</span>
                  <span className="sz">{size(r.size)}</span>
                  <span className="when">{ago(r.pushed)}</span>
                  <span className="star">★ {r.stars}</span>
                </a>
              ))}
              {!paged.length && <div className="ak-rt-note">grep: no refs match "{q}"</div>}
              {paged.length < filtered.length && (
                <button type="button" className="ak-rt-more" onClick={() => setAll(true)}>
                  -- more ({filtered.length - paged.length}) -- ↵
                </button>
              )}
            </>
          )}
        </div>

        <div className="ak-rt-foot">
          <span style={{ color: 'var(--text-muted)' }}>$</span>
          <a href={GH_URL} target="_blank" rel="noopener noreferrer">
            open github.com/{GH_USER} <Icon name="arrowUpRight" size={13} />
          </a>
        </div>
      </div>
    );
  }

  /* ── section ── */
  function Repositories() {
    const [repos, setRepos] = React.useState([]);
    const [status, setStatus] = React.useState('loading');
    const [error, setError] = React.useState('');
    const [hot, setHot] = React.useState(null);

    React.useEffect(() => {
      let alive = true;
      loadRepos()
        .then((list) => { if (alive) { setRepos(list); setStatus('ready'); } })
        .catch((e) => {
          if (!alive) return;
          setError(/rate limit/i.test(e.message) ? 'rate limit exceeded, try again later' : 'network error');
          setStatus('error');
        });
      return () => { alive = false; };
    }, []);

    /* graph + stats mount once data is here, so ScrollTrigger positions
       further down the page shift — re-measure after they render */
    React.useEffect(() => {
      if (status !== 'loading') requestAnimationFrame(() => ScrollTrigger.refresh());
    }, [status]);

    return (
      <section id="repos" style={{ padding: 'var(--section-gap) 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          <SectionHeading index={4} title="Repositories"
            code={<><span style={{ color: 'var(--gray-400)' }}>git</span> <span style={{ color: 'var(--gray-300)' }}>ls-remote</span></>}
            lede="Every public repository, live from GitHub — each one a branch off main, from first commit to last push." />

          {status === 'ready' && repos.length > 0 && (
            <>
              <RepoStats repos={repos} />
              <div className="ak-repo-panel">
                <div className="ak-repo-bar">
                  <span>git log --graph --all --since={new Date(Math.min(...repos.map((r) => r.created))).getFullYear()}</span>
                  <span className="end">╰ created · ● last push</span>
                </div>
                <BranchGraph repos={repos} hot={hot} setHot={setHot} />
              </div>
            </>
          )}

          <RepoTerminal repos={repos} status={status} error={error} hot={hot} setHot={setHot} />
        </div>
      </section>
    );
  }

  window.Repositories = Repositories;
})();
