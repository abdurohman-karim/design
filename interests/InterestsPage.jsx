// Interests & Hobbies — standalone page. Ice cards with procedural crack + dust effect.
// Monochrome frost aesthetic, uses existing design tokens only.

(() => {
  /* ─────────────────────────────────────────────────────────────────────────
     One-time CSS injection (page-scoped: ice texture, cracks, dust, modal)
     ───────────────────────────────────────────────────────────────────────── */
  if (!document.getElementById('ak-interests-css')) {
    const s = document.createElement('style');
    s.id = 'ak-interests-css';
    s.textContent = `
      .ice-card {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
        padding: 30px 28px;
        min-height: 210px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        cursor: pointer;
        background:
          repeating-linear-gradient(115deg, var(--white-a04) 0 2px, transparent 2px 8px),
          repeating-linear-gradient(202deg, var(--white-a04) 0 1px, transparent 1px 10px),
          radial-gradient(120% 80% at 18% 0%, var(--white-a08), transparent 60%),
          radial-gradient(100% 70% at 92% 100%, var(--white-a06), transparent 55%),
          var(--surface-card);
        backdrop-filter: blur(var(--blur-sm));
        -webkit-backdrop-filter: blur(var(--blur-sm));
        box-shadow: var(--inset-hairline);
        transition: transform var(--dur-base) var(--ease-out),
                    border-color var(--dur-base) var(--ease-out),
                    box-shadow var(--dur-base) var(--ease-out);
      }
      .ice-card:hover {
        transform: translateY(-4px);
        border-color: var(--border-strong);
        box-shadow: var(--inset-hairline), var(--glow-halo-sm);
      }
      .ice-card--featured {
        border-color: var(--border-strong);
        box-shadow: var(--inset-hairline), 0 0 0 1px var(--white-a08), var(--glow-halo-md);
      }
      .ice-card__crack {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 5;
        overflow: visible;
        filter: drop-shadow(0 0 2px var(--glow-soft));
      }
      .ice-card__dust {
        position: absolute; inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 6;
      }
      .ice-dust {
        position: absolute; top: 0; left: 0;
        border-radius: 50%;
        background: var(--white-a30);
        will-change: transform, opacity;
      }
      .ice-card__body { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 14px; height: 100%; }

      /* Skyridge modal */
      .sky-overlay {
        position: fixed; inset: 0; z-index: var(--z-overlay);
        display: grid; place-items: center;
        padding: var(--container-pad);
        background: rgba(0,0,0,0.62);
        backdrop-filter: blur(var(--blur-md));
        -webkit-backdrop-filter: blur(var(--blur-md));
        opacity: 0;
        transition: opacity var(--dur-base) var(--ease-out);
      }
      .sky-overlay.is-open { opacity: 1; }
      .sky-panel {
        position: relative;
        max-width: 540px; width: 100%;
        border-radius: var(--radius-xl);
        border: 1px solid var(--border-strong);
        background:
          radial-gradient(120% 90% at 15% 0%, var(--white-a08), transparent 55%),
          var(--surface-raised);
        box-shadow: var(--shadow-lg), var(--glow-halo-md), var(--inset-hairline);
        padding: 40px;
        transform: translateY(18px) scale(0.98);
        opacity: 0;
        transition: transform var(--dur-base) var(--ease-out), opacity var(--dur-base) var(--ease-out);
      }
      .sky-overlay.is-open .sky-panel { transform: none; opacity: 1; }

      @media (prefers-reduced-motion: reduce) {
        .ice-card, .ice-card:hover { transform: none; }
        .sky-overlay, .sky-panel { transition: none; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Mountain-gear icons — match DS convention: 24×24, strokeWidth 2, round
     ───────────────────────────────────────────────────────────────────────── */
  const svgBase = {
    width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  const IceAxe = () => (
    <svg {...svgBase}>
      <path d="M6 19 L17 8" />
      <path d="M17 8 C19 6 20 5 21 6" />
      <path d="M17 8 C16 5 15 4 13 4" />
      <path d="M6 19 L5 21" />
    </svg>
  );
  const Crampons = () => (
    <svg {...svgBase}>
      <path d="M5 9 C5 7 19 7 19 9" />
      <path d="M6 9 L5 14 M9 9 L8 13 M12 9 L12 15 M15 9 L16 13 M18 9 L19 14" />
    </svg>
  );
  const Carabiner = () => (
    <svg {...svgBase}>
      <path d="M12 3 C7.5 3 7.5 21 12 21 C16.5 21 16.5 3 12 3 Z" />
      <path d="M12 4 L12 9" />
    </svg>
  );
  const Helmet = () => (
    <svg {...svgBase}>
      <path d="M5 14 a7 7 0 0 1 14 0" />
      <path d="M3 14 L21 14" />
      <path d="M10 8 L10 7 M14 8 L14 7" />
    </svg>
  );
  const Rope = () => (
    <svg {...svgBase}>
      <circle cx="9" cy="8" r="5" />
      <path d="M9 3 L11 5 M7 4 L9 6 M11 8 L13 10 M13 12 C15 14 16 17 14 20" />
    </svg>
  );
  const Peak = () => (
    <svg {...svgBase}>
      <path d="M3 18 L9 8 L13 14 L16 9 L21 18 Z" />
      <path d="M16 9 L16 3 L20 4.5 L16 6" />
    </svg>
  );

  const CARDS = [
    { icon: IceAxe,    title: 'Альпинизм',    desc: 'Высотные восхождения, многодневные маршруты и работа в связке.' },
    { icon: Crampons,  title: 'Ледолазание',  desc: 'Вертикальный лёд, замёрзшие водопады и техника на передних зубьях.' },
    { icon: Carabiner, title: 'Скалолазание', desc: 'Трэд и спорт-маршруты, страховочные станции, чтение рельефа.' },
    { icon: Helmet,    title: 'Безопасность', desc: 'Оценка лавин, погодные окна и дисциплина горной страховки.' },
    { icon: Rope,      title: 'Верёвки',      desc: 'Узлы, бухтование, дюльфер и спасработы на сложном рельефе.' },
    { icon: Peak,      title: 'Skyridge',     desc: 'Сообщество людей, влюблённых в горы. Нажми, чтобы присоединиться.', featured: true },
  ];

  /* ─────────────────────────────────────────────────────────────────────────
     Procedural crack generator — jagged branches radiating from an origin.
     Returns SVG path-d strings. Slight randomness on every call.
     ───────────────────────────────────────────────────────────────────────── */
  const rand = (a, b) => a + Math.random() * (b - a);

  function genCracks(ox, oy, w, h) {
    const paths = [];
    const branches = 5 + Math.floor(rand(0, 4));
    const reach = Math.min(w, h) * 0.55;

    const walk = (startAngle, segs, x0, y0) => {
      let x = x0, y = y0, angle = startAngle;
      let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      const step = reach / segs;
      const verts = [];
      for (let s = 0; s < segs; s++) {
        angle += rand(-0.34, 0.34);
        x += Math.cos(angle) * step * rand(0.7, 1.25);
        y += Math.sin(angle) * step * rand(0.7, 1.25);
        x = Math.max(2, Math.min(w - 2, x));
        y = Math.max(2, Math.min(h - 2, y));
        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        verts.push([x, y, angle]);
      }
      return { d, verts };
    };

    for (let i = 0; i < branches; i++) {
      const base = (i / branches) * Math.PI * 2 + rand(-0.3, 0.3);
      const segs = 4 + Math.floor(rand(0, 3));
      const main = walk(base, segs, ox, oy);
      paths.push(main.d);
      // ~40% spawn a fork from an early vertex
      if (Math.random() < 0.4 && main.verts.length > 1) {
        const [fx, fy, fa] = main.verts[0];
        const fork = walk(fa + rand(-0.6, 0.6), 2 + Math.floor(rand(0, 2)), fx, fy);
        paths.push(fork.d);
      }
    }
    return paths;
  }

  /* Draw cracks imperatively into the SVG, animate stroke-dashoffset (origin-out) */
  function drawCracks(svg, paths, w, h) {
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = paths.map((d, i) => (
      `<path d="${d}" pathLength="1" fill="none" stroke-width="1"
         stroke-linecap="round" stroke-linejoin="round"
         style="stroke:var(--white-a30);stroke-dasharray:1;stroke-dashoffset:1;opacity:1;
                transition:stroke-dashoffset .34s var(--ease-out) ${(i * 0.03).toFixed(2)}s, opacity .3s ease"/>`
    )).join('');
    void svg.getBoundingClientRect(); // force reflow so the transition runs
    svg.querySelectorAll('path').forEach((p) => { p.style.strokeDashoffset = '0'; });
  }

  function clearCracks(svg) {
    if (!svg) return;
    svg.querySelectorAll('path').forEach((p) => { p.style.opacity = '0'; p.style.strokeDashoffset = '1'; });
    setTimeout(() => { if (svg) svg.innerHTML = ''; }, 320);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Ice-dust particle burst — DOM divs with gravity + fade, ~0.5s, single burst
     ───────────────────────────────────────────────────────────────────────── */
  function burstDust(layer, ox, oy, count = 16) {
    const DUR = 520;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'ice-dust';
      const size = rand(1, 3);
      el.style.width = el.style.height = `${size.toFixed(1)}px`;
      layer.appendChild(el);

      let x = ox, y = oy;
      let vx = rand(-1.4, 1.4);
      let vy = rand(-1.3, 0.3);
      const g = 0.07;
      const start = performance.now();

      const step = (now) => {
        const t = now - start;
        if (t >= DUR || !el.isConnected) { el.remove(); return; }
        vy += g;
        x += vx; y += vy;
        const op = 1 - t / DUR;
        const sc = 1 - (t / DUR) * 0.5;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(2)})`;
        el.style.opacity = op.toFixed(2);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     IceCard component
     ───────────────────────────────────────────────────────────────────────── */
  function IceCard({ icon: IconCmp, title, desc, featured, onOpen }) {
    const cardRef = React.useRef(null);
    const svgRef  = React.useRef(null);
    const dustRef = React.useRef(null);
    const activeRef = React.useRef(false);
    const resetTimer = React.useRef(null);

    const trigger = React.useCallback((clientX, clientY) => {
      const card = cardRef.current;
      if (!card || activeRef.current) return;
      activeRef.current = true;

      const r = card.getBoundingClientRect();
      const ox = clientX != null ? clientX - r.left : r.width / 2;
      const oy = clientY != null ? clientY - r.top  : r.height / 2;

      const paths = genCracks(ox, oy, r.width, r.height);
      drawCracks(svgRef.current, paths, r.width, r.height);
      burstDust(dustRef.current, ox, oy);
    }, []);

    const reset = React.useCallback(() => {
      activeRef.current = false;
      clearCracks(svgRef.current);
    }, []);

    const onPointerEnter = (e) => { if (e.pointerType === 'mouse') trigger(e.clientX, e.clientY); };
    const onPointerLeave = (e) => { if (e.pointerType === 'mouse') reset(); };
    const onPointerDown  = (e) => {
      if (e.pointerType !== 'mouse') {
        // touch / pen: fire on tap, auto-reset after a beat
        trigger(e.clientX, e.clientY);
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(reset, 1400);
      }
    };
    const onClick = () => { if (featured && onOpen) onOpen(); };

    React.useEffect(() => () => clearTimeout(resetTimer.current), []);

    return (
      <div
        ref={cardRef}
        className={`ice-card${featured ? ' ice-card--featured' : ''}`}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onClick={onClick}
        role={featured ? 'button' : undefined}
        tabIndex={featured ? 0 : undefined}
        onKeyDown={featured ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(); } } : undefined}
      >
        <svg ref={svgRef} className="ice-card__crack" aria-hidden="true" />
        <div ref={dustRef} className="ice-card__dust" aria-hidden="true" />

        <div className="ice-card__body">
          <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><IconCmp /></span>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 500,
            color: 'var(--white)', margin: '6px 0 0', letterSpacing: '-0.02em',
          }}>{title}</h3>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.6,
            color: 'var(--text-secondary)', margin: 0, textWrap: 'pretty',
          }}>{desc}</p>
          {featured && (
            <span style={{
              marginTop: 'auto', alignSelf: 'flex-start',
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)',
            }}>Узнать о клубе →</span>
          )}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Skyridge modal
     ───────────────────────────────────────────────────────────────────────── */
  const DecryptBtn = window.DecryptBtn;

  function SkyridgeModal({ open, onClose }) {
    const [mounted, setMounted] = React.useState(open);
    const [shown, setShown] = React.useState(false);

    React.useEffect(() => {
      if (open) {
        setMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      } else {
        setShown(false);
        const t = setTimeout(() => setMounted(false), 300);
        return () => clearTimeout(t);
      }
    }, [open]);

    React.useEffect(() => {
      if (!open) return;
      const onKey = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!mounted) return null;

    return (
      <div className={`sky-overlay${shown ? ' is-open' : ''}`} onClick={onClose}
        role="dialog" aria-modal="true" aria-label="Клуб Skyridge">
        <div className="sky-panel" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} aria-label="Закрыть" style={{
            position: 'absolute', top: 18, right: 18, width: 34, height: 34,
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round"><path d="M6 6 L18 18 M18 6 L6 18" /></svg>
          </button>

          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>// горный клуб</span>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 500,
            letterSpacing: '-0.03em', color: 'var(--white)', margin: '14px 0 16px',
            textShadow: 'var(--glow-text)',
          }}>Skyridge</h2>

          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.7,
            color: 'var(--text-secondary)', margin: '0 0 28px', textWrap: 'pretty',
          }}>
            Сообщество людей, увлечённых горами, альпинизмом и активным отдыхом.
            Совместные восхождения, тренировки по технике и страховке, выезды на лёд и скалы,
            обмен опытом и маршрутами. Новичкам — наставничество, опытным — серьёзные цели.
            Присоединяйся к связке Skyridge.
          </p>

          <DecryptBtn variant="primary" size="lg" arrow as="a" href="#join">
            Присоединиться
          </DecryptBtn>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Page
     ───────────────────────────────────────────────────────────────────────── */
  function InterestsPage() {
    const [open, setOpen] = React.useState(false);
    const openModal  = React.useCallback(() => setOpen(true), []);
    const closeModal = React.useCallback(() => setOpen(false), []);

    return (
      <main id="home" className="ak-grid-bg" style={{ minHeight: '100vh', paddingTop: 120 }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad) var(--section-gap)' }}>
          {/* page hero */}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>// interests</span>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 500,
            letterSpacing: '-0.04em', lineHeight: 1.0, color: 'var(--white)', margin: '18px 0 18px',
            textShadow: '0 0 60px rgba(255,255,255,0.12)',
          }}>Горы&nbsp;и&nbsp;лёд</h1>

          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 'clamp(16px, 1.8vw, 20px)', lineHeight: 1.6,
            color: 'var(--text-secondary)', maxWidth: 620, margin: 0, textWrap: 'balance',
          }}>
            Помимо бэкенда — высота, лёд и скалы. Наведи на карточку (или коснись на телефоне),
            чтобы лёд треснул.
          </p>

          {/* ice cards grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20, marginTop: 56,
          }}>
            {CARDS.map((c) => (
              <IceCard key={c.title} {...c} onOpen={openModal} />
            ))}
          </div>
        </div>

        <SkyridgeModal open={open} onClose={closeModal} />
      </main>
    );
  }

  window.InterestsPage = InterestsPage;
})();
