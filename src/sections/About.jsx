// Portfolio — About. $_GET('About'):
//   1. a first-person statement that lights up word by word as it scrolls in,
//      next to a `whoami --json` card (with the live local time in Fergana)
//   2. stats that roll in like an odometer
//   3. "how I build backends": a request-flow diagram (client → API → Redis /
//      queue → PostgreSQL). A packet walks the path of each principle — cache
//      hit, DB-side aggregation, additive change — and the principle cards
//      beside it drive (and follow) the diagram.
// Wrapped in an IIFE: Babel script tags share one global scope.
(() => {
  const { SectionHeading, Icon } = window.DS;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── live local time (Fergana runs on Tashkent time, UTC+5) ── */
  const TZ = 'Asia/Tashkent';
  const fmtTime = () => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date());
  function AkClock() {
    const [t, setT] = React.useState(fmtTime);
    React.useEffect(() => {
      const id = setInterval(() => setT(fmtTime()), 15000);
      return () => clearInterval(id);
    }, []);
    return <time dateTime={t}>{t}</time>;
  }
  window.AkClock = AkClock;   // Contact.jsx shows the same clock

  /* ── styles ── */
  if (!document.getElementById('ak-about-css')) {
    const s = document.createElement('style');
    s.id = 'ak-about-css';
    s.textContent = `
      .ak-about-intro {
        display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
        gap: 48px; align-items: start; margin-top: 56px;
      }
      @media (max-width: 900px) { .ak-about-intro { grid-template-columns: 1fr; gap: 32px; } }
      .ak-about-say {
        margin: 0; font-family: var(--font-display); font-weight: 400;
        font-size: clamp(22px, 2.6vw, 34px); line-height: 1.38; letter-spacing: -0.015em;
        color: var(--text-secondary); text-wrap: pretty;
      }
      .ak-about-say .w { display: inline; }
      .ak-about-say .k { color: var(--text-primary); }

      /* whoami card */
      .ak-who {
        border: 1px solid var(--border); border-radius: 18px; overflow: hidden;
        background: var(--surface-card);
        backdrop-filter: blur(var(--blur-md)); -webkit-backdrop-filter: blur(var(--blur-md));
        font-family: var(--font-mono); font-size: 12.5px; line-height: 1.75;
      }
      .ak-who-bar {
        display: flex; align-items: center; gap: 12px; padding: 11px 16px;
        border-bottom: 1px solid var(--border-subtle); color: var(--text-faint); font-size: 11px;
      }
      .ak-who-bar .dots { display: flex; gap: 6px; }
      .ak-who-bar i { width: 8px; height: 8px; border-radius: 50%; background: var(--border-strong); }
      .ak-who-body { margin: 0; padding: 14px 18px 18px; white-space: pre-wrap; color: var(--text-faint); }
      .ak-who-body .ln { display: block; }
      .ak-who-body .k { color: var(--text-muted); }
      .ak-who-body .s { color: var(--text-primary); }
      .ak-who-body .p { color: var(--text-faint); }
      .ak-who-live { display: inline-flex; align-items: center; gap: 8px; }
      .ak-who-live::before {
        content: ""; width: 6px; height: 6px; border-radius: 50%;
        background: var(--text-primary); box-shadow: 0 0 8px var(--glow-medium);
      }

      /* odometer stats */
      .ak-about-stats {
        display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
        margin: 64px 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);
      }
      @media (max-width: 700px) { .ak-about-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      .ak-stat { display: flex; flex-direction: column; gap: 6px; padding: 26px 4px; }
      .ak-stat-v {
        display: inline-flex; font-family: var(--font-display); font-size: clamp(36px, 5vw, 56px);
        font-weight: 500; letter-spacing: -0.03em; color: var(--text-primary); line-height: 1;
        text-shadow: var(--glow-text); font-variant-numeric: tabular-nums;
      }
      .ak-odo { display: inline-block; height: 1em; overflow: hidden; }
      .ak-odo > span { display: flex; flex-direction: column; }
      .ak-odo > span > span { height: 1em; line-height: 1; }
      .ak-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
      .ak-stat-l { font-family: var(--font-mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--text-muted); }
      .ak-stat-s { font-family: var(--font-sans); font-size: 13px; color: var(--text-faint); }

      /* request-flow diagram + principles */
      .ak-arch-head {
        display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap;
        font-family: var(--font-mono); font-size: 11px; letter-spacing: .16em; text-transform: uppercase;
        color: var(--text-faint); margin-bottom: 14px;
      }
      .ak-arch {
        border: 1px solid var(--border); border-radius: 18px; background: var(--surface-card);
        backdrop-filter: blur(var(--blur-md)); -webkit-backdrop-filter: blur(var(--blur-md));
        padding: 18px 18px 14px; overflow-x: auto;
      }
      .ak-arch svg { display: block; width: 100%; min-width: 640px; height: auto; }
      .ak-arch .edge { fill: none; stroke: var(--border-strong); stroke-width: 1.4; stroke-dasharray: 3 5; transition: stroke .35s ease, opacity .35s ease; }
      .ak-arch .node rect { fill: var(--surface-raised); stroke: var(--border-strong); stroke-width: 1; transition: stroke .35s ease, opacity .35s ease; }
      .ak-arch .node .t { fill: var(--text-primary); font-family: var(--font-mono); font-size: 13px; letter-spacing: .06em; }
      .ak-arch .node .d { fill: var(--text-faint); font-family: var(--font-mono); font-size: 11px; }
      .ak-arch .on .edge, .ak-arch .edge.on { stroke: var(--text-primary); stroke-dasharray: none; }
      .ak-arch .node.on rect { stroke: var(--text-primary); }
      .ak-arch .node.dim, .ak-arch .edge.dim { opacity: .35; }
      .ak-arch .chip rect { fill: var(--text-primary); }
      .ak-arch .chip text { fill: var(--bg); font-family: var(--font-mono); font-size: 10.5px; font-weight: 600; letter-spacing: .08em; }
      .ak-arch .pkt { fill: var(--text-primary); }
      .ak-arch .pkt-glow { fill: var(--text-primary); opacity: .18; }
      .ak-arch-log {
        margin-top: 10px; min-height: 20px; font-family: var(--font-mono); font-size: 12px;
        color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ak-arch-log b { color: var(--text-primary); font-weight: 500; }

      .ak-principles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 20px; }
      @media (max-width: 900px) { .ak-principles { grid-template-columns: 1fr; } }
      .ak-principle {
        position: relative; text-align: left; margin: 0; appearance: none; font: inherit;
        display: flex; flex-direction: column; gap: 10px; padding: 26px 26px 24px;
        border-radius: 18px; border: 1px solid var(--border); background: var(--surface-card);
        backdrop-filter: blur(var(--blur-md)); -webkit-backdrop-filter: blur(var(--blur-md));
        color: inherit; overflow: hidden;
        transition: border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-slow) var(--ease-out);
      }
      .ak-principle.is-on { border-color: var(--border-strong); box-shadow: var(--glow-halo-sm), var(--inset-hairline); }
      .ak-principle .n { font-family: var(--font-mono); font-size: 11px; letter-spacing: .2em; color: var(--text-faint); }
      .ak-principle h3 { margin: 4px 0 0; font-family: var(--font-display); font-size: 20px; font-weight: 500; color: var(--text-primary); }
      .ak-principle p { margin: 0; font-family: var(--font-sans); font-size: 14.5px; line-height: 1.65; color: var(--text-secondary); text-wrap: pretty; }
      /* progress rail: fills while this principle plays in the diagram */
      .ak-principle .rail { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--border-subtle); }
      .ak-principle .rail i { position: absolute; inset: 0; background: var(--text-primary); transform-origin: 0 50%; transform: scaleX(0); }
      .ak-principle:focus-visible { outline: 1px solid var(--border-strong); outline-offset: 3px; }
    `;
    document.head.appendChild(s);
  }

  /* ── 1. statement: words light up with scroll ── */
  const STATEMENT = [
    'I build the part of fintech nobody sees —',
    ['payment rails, banking integrations'],
    'and the queues behind them.',
    ['Laravel'], 'and', ['Python'], 'on the backend,',
    ['PostgreSQL'], 'doing the heavy lifting,',
    ['Redis'], 'wherever a path runs hot. Lately I route',
    ['LLM traffic'], 'across providers the way I route money — with fallbacks.',
  ];

  function Statement() {
    const ref = React.useRef(null);
    React.useLayoutEffect(() => {
      if (reducedMotion()) return undefined;
      const words = ref.current.querySelectorAll('.w');
      gsap.set(words, { opacity: 0.16 });
      const tween = gsap.to(words, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: 'top 82%', end: 'bottom 52%', scrub: 0.6 },
      });
      return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); gsap.set(words, { clearProps: 'opacity' }); };
    }, []);

    let key = 0;
    const words = (text, strong) => text.split(' ').map((w) => (
      <React.Fragment key={key++}>
        <span className={`w${strong ? ' k' : ''}`}>{w}</span>{' '}
      </React.Fragment>
    ));
    return (
      <p className="ak-about-say" ref={ref}>
        {STATEMENT.map((part) => (Array.isArray(part) ? words(part[0], true) : words(part, false)))}
      </p>
    );
  }

  /* ── whoami --json ── */
  function WhoAmI() {
    const ref = React.useRef(null);
    React.useLayoutEffect(() => {
      if (reducedMotion()) return undefined;
      const lines = ref.current.querySelectorAll('.ln');
      gsap.set(lines, { opacity: 0, x: -6 });
      const st = ScrollTrigger.create({
        trigger: ref.current, start: 'top 85%', once: true,
        onEnter: () => gsap.to(lines, { opacity: 1, x: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }),
      });
      return () => st.kill();
    }, []);

    const K = ({ k }) => <><span className="k">"{k}"</span><span className="p">: </span></>;
    const S = ({ v }) => <span className="s">"{v}"</span>;
    const A = ({ list }) => (
      <>
        <span className="p">[</span>
        {list.map((v, i) => <React.Fragment key={v}><S v={v} />{i < list.length - 1 && <span className="p">, </span>}</React.Fragment>)}
        <span className="p">]</span>
      </>
    );
    return (
      <div className="ak-who" ref={ref}>
        <div className="ak-who-bar"><span className="dots"><i /><i /><i /></span><span>~ $ whoami --json</span></div>
        <pre className="ak-who-body">
          <span className="ln p">{'{'}</span>
          <span className="ln">  <K k="name" /><S v="Abdurohman Karim" />,</span>
          <span className="ln">  <K k="role" /><S v="backend / full-stack developer" />,</span>
          <span className="ln">  <K k="focus" /><A list={['payments', 'banking APIs', 'SBP', 'LLM routing']} />,</span>
          <span className="ln">  <K k="stack" /><A list={['PHP · Laravel', 'Python', 'PostgreSQL', 'Redis']} />,</span>
          <span className="ln">  <K k="based_in" /><S v="Fergana, Uzbekistan" />,</span>
          <span className="ln">  <K k="local_time" /><span className="s">"<AkClock /> UTC+5"</span>,</span>
          <span className="ln">  <K k="status" /><span className="s ak-who-live">"open to new projects"</span></span>
          <span className="ln p">{'}'}</span>
        </pre>
      </div>
    );
  }

  /* ── 2. odometer stats ── */
  const STATS = [
    { value: '30+', label: 'Projects' },
    { value: '3+', label: 'Years' },
    { value: '3', label: 'Languages', sub: 'PHP · Python · JS' },
    { value: '∞', label: 'Edge cases', sub: 'handled' },
  ];
  function Odometer({ value }) {
    /* digits become rolling 0–9 strips; anything else (+, ∞) stays put */
    return [...value].map((ch, i) => (/\d/.test(ch)
      ? <span key={i} className="ak-odo" data-digit={ch}><span>{'0123456789'.split('').map((d) => <span key={d}>{d}</span>)}</span></span>
      : <span key={i} className="ak-odo-static">{ch}</span>));
  }
  function Stats() {
    const ref = React.useRef(null);
    React.useLayoutEffect(() => {
      const strips = [...ref.current.querySelectorAll('.ak-odo')];
      const land = (el) => -Number(el.dataset.digit) * 10;   // yPercent of the 0–9 strip
      if (reducedMotion()) { strips.forEach((el) => gsap.set(el.firstChild, { yPercent: land(el) })); return undefined; }
      gsap.set(ref.current.querySelectorAll('.ak-odo-static'), { opacity: 0 });
      const st = ScrollTrigger.create({
        trigger: ref.current, start: 'top 85%', once: true,
        onEnter: () => {
          strips.forEach((el, i) => gsap.fromTo(el.firstChild, { yPercent: 0 },
            { yPercent: land(el), duration: 1.4 + i * 0.15, ease: 'power4.out', delay: i * 0.08 }));
          gsap.to(ref.current.querySelectorAll('.ak-odo-static'), { opacity: 1, duration: 0.5, delay: 0.7, stagger: 0.1 });
        },
      });
      return () => st.kill();
    }, []);
    return (
      <div className="ak-about-stats" ref={ref}>
        {STATS.map((s) => (
          <div key={s.label} className="ak-stat">
            <span className="ak-stat-v"><span aria-hidden="true" style={{ display: 'inline-flex' }}><Odometer value={s.value} /></span><span className="ak-sr">{s.value}</span></span>
            <span className="ak-stat-l">{s.label}</span>
            {s.sub && <span className="ak-stat-s">{s.sub}</span>}
          </div>
        ))}
      </div>
    );
  }

  /* ── 3. request flow ── */
  const NODES = {
    client: { x: 20, y: 112, w: 130, t: 'client', d: 'browser · bot' },
    api:    { x: 230, y: 112, w: 160, t: 'api · laravel', d: 'validate · route' },
    redis:  { x: 480, y: 24, w: 170, t: 'redis', d: 'hot paths' },
    queue:  { x: 480, y: 200, w: 170, t: 'queue · workers', d: 'async jobs' },
    pg:     { x: 760, y: 112, w: 210, t: 'postgresql', d: 'aggregates in-db' },
  };
  const H = 56;
  const EDGES = {
    'client-api': [[150, 140], [230, 140]],
    'api-redis':  [[390, 140], [430, 140], [430, 52], [480, 52]],
    'api-queue':  [[390, 140], [430, 140], [430, 228], [480, 228]],
    'api-pg':     [[390, 140], [760, 140]],
    'redis-pg':   [[650, 52], [700, 52], [700, 140], [760, 140]],
    'queue-pg':   [[650, 228], [700, 228], [700, 140], [760, 140]],
  };
  const PRINCIPLES = [
    {
      icon: 'bolt', title: 'Redis-backed caching',
      body: 'Hot paths cached in Redis; queues and workers keep request latency flat under load.',
      route: ['client-api', 'api-redis'], nodes: ['client', 'api', 'redis'],
      chip: { node: 'redis', text: 'HIT · 3 ms' },
      log: <>GET /rates → <b>redis HIT</b> · 3 ms · the database is never touched</>,
    },
    {
      icon: 'database', title: 'DB-side aggregation',
      body: 'Heavy lifting in the database, not the application layer — fewer round-trips, predictable load.',
      route: ['client-api', 'api-pg'], nodes: ['client', 'api', 'pg'],
      chip: { node: 'pg', text: 'SUM() GROUP BY · 1 query' },
      log: <>GET /report → <b>1 query</b> · rows aggregated in PostgreSQL · nothing heavy shipped to PHP</>,
    },
    {
      icon: 'layers', title: 'Additive changes',
      body: 'Extend behaviour without breaking existing logic. Migrations and feature flags over rewrites.',
      route: ['client-api', 'api-queue', 'queue-pg'], nodes: ['client', 'api', 'queue', 'pg'],
      chip: { node: 'api', text: 'flag sbp_v2 · on' },
      log: <>POST /transfer → <b>new path behind a flag</b> · queued · the old path keeps serving</>,
    },
  ];
  const pts = (list) => list.map(([x, y]) => `${x},${y}`).join(' ');

  function Flow() {
    const svgRef = React.useRef(null);
    const cardsRef = React.useRef([]);
    const [active, setActive] = React.useState(0);
    const ctl = React.useRef({ pinned: false, tl: null, visible: false });

    /* play one principle: the packet walks its route there and back */
    const play = React.useCallback((i) => {
      const svg = svgRef.current;
      const c = ctl.current;
      if (c.tl) c.tl.kill();
      setActive(i);
      const p = PRINCIPLES[i];
      const pkt = svg.querySelector('.pkt-g');
      const chip = svg.querySelector(`.chip[data-for="${i}"]`);
      const rails = cardsRef.current.map((el) => el && el.querySelector('.rail i'));
      gsap.set(svg.querySelectorAll('.chip'), { opacity: 0 });
      gsap.set(rails, { scaleX: 0 });
      if (reducedMotion()) { gsap.set(chip, { opacity: 1 }); gsap.set(pkt, { opacity: 0 }); return; }

      const path = p.route.flatMap((e, k) => (k === 0 ? EDGES[e] : EDGES[e].slice(1)));
      /* a pinned principle replays; otherwise the cycle moves on */
      const tl = gsap.timeline({
        onComplete: () => { if (c.visible) play(c.pinned ? i : (i + 1) % PRINCIPLES.length); },
      });
      const SPEED = 520;   // viewBox units / s
      tl.set(pkt, { x: path[0][0], y: path[0][1], opacity: 0 })
        .to(pkt, { opacity: 1, duration: 0.15 });
      for (let k = 1; k < path.length; k++) {
        const d = Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1]);
        tl.to(pkt, { x: path[k][0], y: path[k][1], duration: d / SPEED, ease: 'none' });
      }
      tl.fromTo(chip, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' })
        .to(pkt, { scale: 1.8, opacity: 0.4, duration: 0.18, yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, '<');
      for (let k = path.length - 2; k >= 0; k--) {
        const d = Math.hypot(path[k][0] - path[k + 1][0], path[k][1] - path[k + 1][1]);
        tl.to(pkt, { x: path[k][0], y: path[k][1], duration: d / (SPEED * 1.4), ease: 'none' }, k === path.length - 2 ? '+=0.35' : '>');
      }
      tl.to(pkt, { opacity: 0, duration: 0.2 }).to({}, { duration: 1.1 });
      if (rails[i]) tl.fromTo(rails[i], { scaleX: 0 }, { scaleX: 1, duration: tl.duration(), ease: 'none' }, 0);
      c.tl = tl;
    }, []);

    /* runs only while the diagram is on screen */
    React.useLayoutEffect(() => {
      const c = ctl.current;
      const st = ScrollTrigger.create({
        trigger: svgRef.current, start: 'top 85%', end: 'bottom 15%',
        onToggle: (self) => {
          c.visible = self.isActive;
          if (self.isActive) play(c.last || 0);
          else if (c.tl) c.tl.pause();
        },
      });
      return () => { st.kill(); if (c.tl) c.tl.kill(); };
    }, [play]);
    React.useEffect(() => { ctl.current.last = active; }, [active]);

    /* hovering / focusing a principle pins it (it replays); leaving lets the cycle move on */
    const pin = (i) => {
      const c = ctl.current;
      c.pinned = true;
      if (i !== c.last || !c.tl || !c.tl.isActive()) play(i);
    };
    const unpin = () => { ctl.current.pinned = false; };

    const p = PRINCIPLES[active];
    const onNode = (n) => p.nodes.includes(n);
    const onEdge = (e) => p.route.includes(e);

    return (
      <div>
        <div className="ak-arch-head">
          <span>how I build backends</span>
          <span>{String(active + 1).padStart(2, '0')} / 03 · {p.title}</span>
        </div>
        <div className="ak-arch">
          <svg ref={svgRef} viewBox="0 0 990 280" role="img"
            aria-label="Request flow: client, Laravel API, Redis, queue and workers, PostgreSQL">
            {Object.entries(EDGES).map(([k, e]) => (
              <polyline key={k} className={`edge${onEdge(k) ? ' on' : ' dim'}`} points={pts(e)} />
            ))}
            {Object.entries(NODES).map(([k, n]) => (
              <g key={k} className={`node${onNode(k) ? ' on' : ' dim'}`}>
                <rect x={n.x} y={n.y} width={n.w} height={H} rx="10" />
                <text className="t" x={n.x + 16} y={n.y + 24}>{n.t}</text>
                <text className="d" x={n.x + 16} y={n.y + 42}>{n.d}</text>
              </g>
            ))}
            {PRINCIPLES.map((pr, i) => {
              const n = NODES[pr.chip.node];
              const w = pr.chip.text.length * 7 + 20;
              return (
                <g key={i} className="chip" data-for={i} style={{ opacity: 0 }}>
                  <rect x={n.x + n.w - w + 8} y={n.y - 13} width={w} height={22} rx="11" />
                  <text x={n.x + n.w - w / 2 + 8} y={n.y + 2} textAnchor="middle">{pr.chip.text}</text>
                </g>
              );
            })}
            <g className="pkt-g" style={{ opacity: 0 }}>
              <circle className="pkt-glow" r="12" />
              <circle className="pkt" r="5" />
            </g>
          </svg>
          <div className="ak-arch-log" aria-live="polite">$ {p.log}</div>
        </div>

        <div className="ak-principles">
          {PRINCIPLES.map((pr, i) => (
            <button
              key={pr.title}
              type="button"
              ref={(el) => { cardsRef.current[i] = el; }}
              className={`ak-principle${active === i ? ' is-on' : ''}`}
              onMouseEnter={() => pin(i)}
              onMouseLeave={unpin}
              onFocus={() => pin(i)}
              onBlur={unpin}
              onClick={() => pin(i)}
              aria-pressed={active === i}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}><Icon name={pr.icon} size={24} duotone /></span>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <h3>{pr.title}</h3>
              <p>{pr.body}</p>
              <span className="rail"><i /></span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function About() {
    return (
      <section id="about" style={{ padding: 'var(--section-gap) 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          <SectionHeading index={1} title="About"
            code={<><span style={{ color: 'var(--gray-400)' }}>$_GET</span>(<span style={{ color: 'var(--gray-300)' }}>'About'</span>)</>}
            lede="Backend / full-stack developer in fintech and payment systems. I design APIs, payment platforms and banking integrations — including SBP (Faster Payments) — and multi-provider AI services." />

          <div className="ak-about-intro">
            <Statement />
            <WhoAmI />
          </div>

          <Stats />
          <Flow />
        </div>
      </section>
    );
  }

  window.About = About;
})();
