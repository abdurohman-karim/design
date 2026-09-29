// Portfolio — Hero. echo "Welcome";
//   left:  banner, the name (variable-weight proximity effect), role, pitch,
//          CTAs and a meta line (availability + local time in Fergana)
//   right: a dotted, lit monochrome globe — continents from a Natural Earth
//          land mask (landmask.js) — turning slowly; it leans toward the
//          pointer and can be spun.
// Entrance plays once the preloader / intro TV are gone; on scroll the hero
// dissolves into About. Wrapped in an IIFE: Babel script tags share one
// global scope.
(() => {
  const DecryptBtn = window.DecryptBtn;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.getElementById('ak-hero-css')) {
    const s = document.createElement('style');
    s.id = 'ak-hero-css';
    s.textContent = `
      .ak-hero {
        position: relative; width: 100%; max-width: var(--container-max); margin: 0 auto;
        padding: 110px var(--container-pad) 90px; box-sizing: border-box;
        display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 32px; align-items: center;
      }
      @media (max-width: 900px) {
        .ak-hero { grid-template-columns: 1fr; gap: 12px; padding-top: 104px; }
      }
      .ak-hero-copy { display: flex; flex-direction: column; align-items: flex-start; gap: 26px; }
      .ak-hero-banner {
        font-family: var(--font-mono); font-size: 13px; color: var(--text-muted);
        padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-pill);
        background: var(--surface-card); backdrop-filter: blur(var(--blur-sm)); -webkit-backdrop-filter: blur(var(--blur-sm));
        white-space: nowrap;
      }
      .ak-hero-name {
        margin: 0; font-family: var(--font-display); font-size: clamp(44px, 6.6vw, 94px); font-weight: 500;
        letter-spacing: -0.045em; line-height: 0.95; color: var(--white);
        text-shadow: 0 0 60px var(--white-a12); cursor: default;
      }
      /* each line is a mask the letters rise out of (lifted after the entrance
         so the glow isn't clipped) */
      .ak-hero-line { display: block; padding: 0.06em 0.08em 0.12em; margin: -0.06em -0.08em -0.12em; }
      .ak-hero-name.is-masked .ak-hero-line { overflow: hidden; }
      .ak-hero-ch { display: inline-block; }
      .ak-hero-role {
        margin: 0; font-family: var(--font-mono); font-size: clamp(12px, 1.4vw, 15px);
        letter-spacing: .2em; text-transform: uppercase; color: var(--text-secondary);
      }
      .ak-hero-pitch {
        margin: 0; max-width: 540px; font-family: var(--font-sans); font-size: clamp(16px, 1.7vw, 19px);
        line-height: 1.65; color: var(--text-secondary); text-wrap: pretty;
      }
      .ak-hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 4px; }
      .ak-hero-meta {
        display: flex; flex-wrap: wrap; align-items: center; gap: 8px 18px;
        font-family: var(--font-mono); font-size: 11.5px; letter-spacing: .06em; color: var(--text-faint);
      }
      .ak-hero-meta b { color: var(--text-secondary); font-weight: 500; }
      .ak-hero-meta .live { display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); }
      .ak-hero-meta .live::before {
        content: ""; width: 7px; height: 7px; border-radius: 50%;
        background: var(--text-primary); box-shadow: 0 0 10px var(--glow-medium), 0 0 22px var(--glow-soft);
      }

      .ak-hero-globe { position: relative; width: 100%; aspect-ratio: 1; max-width: 560px; justify-self: end; touch-action: pan-y; }
      @media (max-width: 900px) { .ak-hero-globe { max-width: 380px; justify-self: center; margin-top: 8px; } }
      .ak-hero-globe canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
      .ak-hero-probe { position: absolute; width: 0; height: 0; overflow: hidden; color: var(--text-primary); }

      .ak-hero-scroll {
        position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
        font-family: var(--font-mono); font-size: 10px; letter-spacing: .24em; text-transform: uppercase;
        color: var(--text-faint); display: flex; flex-direction: column; align-items: center; gap: 8px;
      }
      .ak-hero-scroll span { width: 1px; height: 36px; background: linear-gradient(var(--border-strong), transparent); }
      @media (max-width: 900px) { .ak-hero-scroll { display: none; } }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Name — each letter's variable weight follows pointer proximity
     ───────────────────────────────────────────────────────────────────────── */
  const PROX_WEIGHT_MIN = 300;
  const PROX_WEIGHT_MAX = 700;
  const PROX_WEIGHT_DEFAULT = 500;
  const PROX_RADIUS = 220;   // px falloff distance
  const LERP_ACTIVE = 0.20;  // snappy follow
  const LERP_RESET = 0.08;   // graceful reset on leave

  function ProximityName() {
    const ref = React.useRef(null);
    const rafRef = React.useRef(null);
    const mouseRef = React.useRef(null);
    const weightsRef = React.useRef(null);
    const centersRef = React.useRef(null);
    const spansRef = React.useRef(null);

    const cacheLayout = React.useCallback(() => {
      if (!ref.current) return;
      spansRef.current = Array.from(ref.current.querySelectorAll('[data-ch]'));
      const n = spansRef.current.length;
      centersRef.current = spansRef.current.map((s) => {
        const r = s.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      if (!weightsRef.current || weightsRef.current.length !== n) {
        weightsRef.current = new Float32Array(n).fill(PROX_WEIGHT_DEFAULT);
      }
    }, []);

    const tick = React.useCallback(() => {
      rafRef.current = null;
      const spans = spansRef.current, centers = centersRef.current, weights = weightsRef.current;
      if (!spans || !centers || !weights) return;
      const pos = mouseRef.current;
      const lerp = pos ? LERP_ACTIVE : LERP_RESET;
      let running = false;
      for (let i = 0; i < spans.length; i++) {
        let target = PROX_WEIGHT_DEFAULT;
        if (pos) {
          const dx = pos.x - centers[i].x, dy = pos.y - centers[i].y;
          const t = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / PROX_RADIUS);
          target = PROX_WEIGHT_MIN + t * (PROX_WEIGHT_MAX - PROX_WEIGHT_MIN);
        }
        const next = weights[i] + (target - weights[i]) * lerp;
        weights[i] = next;
        spans[i].style.fontVariationSettings = `'wght' ${Math.round(next)}`;
        if (Math.abs(next - target) > 0.5) running = true;
      }
      if (running) rafRef.current = requestAnimationFrame(tick);
    }, []);

    const onMouseEnter = React.useCallback(() => { cacheLayout(); }, [cacheLayout]);
    const onMouseMove = React.useCallback((e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!centersRef.current) cacheLayout();
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    }, [tick, cacheLayout]);
    const onMouseLeave = React.useCallback(() => {
      mouseRef.current = null;
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    React.useEffect(() => {
      /* centers are page-relative snapshots — drop them on resize and scroll */
      const invalidate = () => { centersRef.current = null; };
      window.addEventListener('resize', invalidate);
      window.addEventListener('scroll', invalidate, { passive: true });
      return () => {
        window.removeEventListener('resize', invalidate);
        window.removeEventListener('scroll', invalidate);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    const line = (text) => (
      <span className="ak-hero-line">
        {text.split('').map((ch, i) => <span key={i} data-ch className="ak-hero-ch">{ch}</span>)}
      </span>
    );
    return (
      <h1 ref={ref} className="ak-hero-name" aria-label="Abdurohman Karim"
        onMouseEnter={onMouseEnter} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
        <span aria-hidden="true">{line('Abdurohman')}{line('Karim')}</span>
      </h1>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Globe — dotted, lit, slowly turning. Continents from the Natural Earth
     land mask (landmask.js), a sparse dotted ocean for volume, a soft
     atmosphere at the limb. Drag to spin (with inertia).
     ───────────────────────────────────────────────────────────────────────── */
  const RAD = Math.PI / 180;
  const START_LON = 60;              // Central Asia faces the viewer first
  const TILT = 22 * RAD;             // north pole leans toward the viewer
  const SPIN = (2 * Math.PI) / 110;  // one turn every ~110 s
  /* light from the upper left, a little in front — gives the sphere its shape */
  const LIGHT = (() => { const l = [-0.55, 0.62, 0.56], n = Math.hypot(...l); return l.map((v) => v / n); })();

  function spherePoints(N, keep) {
    const golden = Math.PI * (3 - Math.sqrt(5)), out = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      const x = Math.cos(th) * r, z = Math.sin(th) * r;
      if (keep(Math.asin(y) / RAD, Math.atan2(x, z) / RAD)) out.push([x, y, z]);
    }
    return out;
  }
  function landTest() {
    const m = window.AK_LANDMASK;
    if (!m) return () => false;
    const bin = atob(m.b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return (lat, lon) => {
      const col = Math.min(m.w - 1, Math.floor(lon + 180)), row = Math.min(m.h - 1, Math.floor(90 - lat));
      return (bytes[row * m.rowBytes + (col >> 3)] & (0x80 >> (col & 7))) !== 0;
    };
  }

  function Globe({ introRef }) {
    const wrapRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const probeRef = React.useRef(null);

    React.useEffect(() => {
      const wrap = wrapRef.current, canvas = canvasRef.current, ctx = canvas.getContext('2d');
      const reduced = reducedMotion();
      const isLand = landTest();
      const land = spherePoints(10000, (la, lo) => isLand(la, lo));
      const ocean = spherePoints(2400, (la, lo) => !isLand(la, lo));

      let W = 0, H = 0, rgb = '255,255,255';
      const readTheme = () => {
        const c = getComputedStyle(probeRef.current).color.match(/\d+(\.\d+)?/g) || [255, 255, 255];
        rgb = `${c[0]},${c[1]},${c[2]}`;
      };
      const resize = () => {
        const r = wrap.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        W = r.width; H = r.height;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      /* view: steady spin + pointer lean + drag (inertia) */
      const view = { yaw: START_LON * RAD, lean: 0, leanT: 0, tilt: 0, tiltT: 0, vel: 0, dragging: false };
      let sy = 0, cy = 1, sp = 0, cp = 1;
      const project = (v, out) => {
        const x1 = v[0] * cy - v[2] * sy, z1 = v[0] * sy + v[2] * cy;
        out[0] = x1; out[1] = v[1] * cp - z1 * sp; out[2] = v[1] * sp + z1 * cp;
        return out;
      };
      /* brightness of a surface point (its position is its normal on a unit sphere) */
      const lit = (p) => 0.28 + 0.72 * Math.max(0, p[0] * LIGHT[0] + p[1] * LIGHT[1] + p[2] * LIGHT[2]);

      const P = [0, 0, 0];
      const LEVELS = 8;
      const draw = () => {
        const intro = introRef.current.v;
        ctx.clearRect(0, 0, W, H);
        if (!W || intro <= 0) return;
        const yaw = view.yaw + view.lean, pitch = TILT + view.tilt;
        sy = Math.sin(yaw); cy = Math.cos(yaw); sp = Math.sin(pitch); cp = Math.cos(pitch);
        const R = Math.min(W, H) * 0.43 * (0.86 + 0.14 * intro);
        const cx = W / 2, cyc = H / 2;
        ctx.globalAlpha = intro;

        /* atmosphere: a soft halo outside the limb */
        let g = ctx.createRadialGradient(cx, cyc, R * 0.92, cx, cyc, R * 1.22);
        g.addColorStop(0, `rgba(${rgb},0.10)`); g.addColorStop(0.35, `rgba(${rgb},0.04)`); g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cyc, R * 1.22, 0, Math.PI * 2); ctx.fill();
        /* body: faintly lit disc, brighter toward the light */
        g = ctx.createRadialGradient(cx - R * 0.45, cyc - R * 0.5, R * 0.1, cx, cyc, R);
        g.addColorStop(0, `rgba(${rgb},0.07)`); g.addColorStop(1, `rgba(${rgb},0.012)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cyc, R, 0, Math.PI * 2); ctx.fill();

        /* far side of the land, seen through the sphere */
        ctx.fillStyle = `rgba(${rgb},0.05)`;
        ctx.beginPath();
        for (let i = 0; i < land.length; i += 2) {
          project(land[i], P);
          if (P[2] >= 0) continue;
          ctx.rect(cx + P[0] * R - 0.5, cyc - P[1] * R - 0.5, 1, 1);
        }
        ctx.fill();

        /* ocean: sparse, dim dots — gives the sphere its volume */
        ctx.fillStyle = `rgba(${rgb},0.09)`;
        ctx.beginPath();
        for (let i = 0; i < ocean.length; i++) {
          project(ocean[i], P);
          if (P[2] <= 0.02) continue;
          const s = 0.6 + 0.6 * P[2];
          ctx.rect(cx + P[0] * R - s / 2, cyc - P[1] * R - s / 2, s, s);
        }
        ctx.fill();

        /* land: round dots, lit, bigger toward the centre — one path per level */
        const bins = Array.from({ length: LEVELS }, () => []);
        for (let i = 0; i < land.length; i++) {
          project(land[i], P);
          if (P[2] <= 0) continue;
          const b = Math.min(LEVELS - 1, Math.floor(lit(P) * LEVELS));
          bins[b].push(cx + P[0] * R, cyc - P[1] * R, 0.55 + 0.75 * Math.sqrt(P[2]));
        }
        for (let b = 0; b < LEVELS; b++) {
          const L = bins[b];
          if (!L.length) continue;
          ctx.fillStyle = `rgba(${rgb},${(0.16 + 0.84 * ((b + 0.5) / LEVELS)).toFixed(3)})`;
          ctx.beginPath();
          for (let i = 0; i < L.length; i += 3) { ctx.moveTo(L[i] + L[i + 2], L[i + 1]); ctx.arc(L[i], L[i + 1], L[i + 2], 0, Math.PI * 2); }
          ctx.fill();
        }

        /* limb: a thin bright rim where the atmosphere is seen edge-on */
        g = ctx.createRadialGradient(cx, cyc, R * 0.88, cx, cyc, R);
        g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(1, `rgba(${rgb},0.16)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cyc, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${rgb},0.14)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cyc, R, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      };

      /* loop — only while on screen */
      let raf = null, visible = true, last = performance.now();
      const frame = (now) => {
        raf = null;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        view.lean += (view.leanT - view.lean) * 0.06;
        view.tilt += (view.tiltT - view.tilt) * 0.06;
        if (!view.dragging) {
          view.yaw -= SPIN * dt - view.vel;   // eastward: the surface drifts left → right
          view.vel *= 0.95;                 // flick inertia dies out, the steady turn stays
        }
        draw();
        if (visible && !reduced) raf = requestAnimationFrame(frame);
      };
      const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

      /* pointer: lean toward it; drag to spin */
      let lastX = 0;
      const onMove = (e) => {
        const r = wrap.getBoundingClientRect();
        view.leanT = ((e.clientX - r.left) / r.width - 0.5) * 0.45;
        view.tiltT = ((e.clientY - r.top) / r.height - 0.5) * -0.28;
        if (view.dragging) {
          const dx = e.clientX - lastX;
          lastX = e.clientX;
          view.vel = -dx * 0.006;           // the surface follows the pointer
          view.yaw += view.vel;
        }
        if (reduced) kick();
      };
      const onDown = (e) => { view.dragging = true; lastX = e.clientX; if (wrap.setPointerCapture) wrap.setPointerCapture(e.pointerId); };
      const onUp = () => { view.dragging = false; };
      const onLeave = () => { view.leanT = 0; view.tiltT = 0; };

      readTheme();
      resize();
      const ro = new ResizeObserver(() => { resize(); kick(); });
      ro.observe(wrap);
      const mo = new MutationObserver(() => { readTheme(); kick(); });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
      io.observe(wrap);
      wrap.addEventListener('pointermove', onMove);
      wrap.addEventListener('pointerdown', onDown);
      wrap.addEventListener('pointerup', onUp);
      wrap.addEventListener('pointercancel', onUp);
      wrap.addEventListener('pointerleave', onLeave);
      introRef.current.redraw = kick;   // the entrance tween nudges static renders
      kick();

      return () => {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect(); mo.disconnect(); io.disconnect();
        wrap.removeEventListener('pointermove', onMove);
        wrap.removeEventListener('pointerdown', onDown);
        wrap.removeEventListener('pointerup', onUp);
        wrap.removeEventListener('pointercancel', onUp);
        wrap.removeEventListener('pointerleave', onLeave);
      };
    }, []);

    return (
      <div className="ak-hero-globe" ref={wrapRef} data-cursor="drag" data-cursor-label="‹ spin ›"
        role="img" aria-label="A slowly turning dotted globe">
        <canvas ref={canvasRef} />
        <span className="ak-hero-probe" ref={probeRef} />
      </div>
    );
  }

  /* wait until the preloader and the intro TV are gone */
  function whenStageClear(cb) {
    const clear = () => !document.getElementById('ak-preloader')
      && !document.querySelector('.ak-introtv') && !document.body.classList.contains('ak-intro-lock');
    if (clear()) { cb(); return () => {}; }
    const id = setInterval(() => { if (clear()) { clearInterval(id); clearTimeout(safety); cb(); } }, 120);
    const safety = setTimeout(() => { clearInterval(id); cb(); }, 24000);   // ?intro plays the ~15 s film on load
    return () => { clearInterval(id); clearTimeout(safety); };
  }

  /* "Get in touch" plays the intro TV film (App listens for `ak:intro`) */
  function playIntro() {
    window.dispatchEvent(new CustomEvent('ak:intro'));
  }

  function Hero() {
    const rootRef = React.useRef(null);
    const introRef = React.useRef({ v: 0, redraw: null });
    const Clock = window.AkClock;

    React.useLayoutEffect(() => {
      const root = rootRef.current;
      const $ = (s) => root.querySelectorAll(s);
      const name = root.querySelector('.ak-hero-name');
      const intro = introRef.current;
      const nudge = () => intro.redraw && intro.redraw();

      if (reducedMotion()) { intro.v = 1; nudge(); return undefined; }

      /* hidden before first paint */
      name.classList.add('is-masked');
      gsap.set($('.ak-hero-ch'), { yPercent: 115 });
      gsap.set($('.ak-hero-banner, .ak-hero-role, .ak-hero-pitch, .ak-hero-cta > *, .ak-hero-meta'), { opacity: 0, y: 16 });
      gsap.set($('.ak-hero-scroll'), { opacity: 0 });   // scroll cue keeps its CSS centring transform

      let tl = null;
      const cancel = whenStageClear(() => {
        tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to($('.ak-hero-banner'), { opacity: 1, y: 0, duration: 0.6 }, 0)
          .to($('.ak-hero-ch'), {
            yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.035,
            onComplete: () => name.classList.remove('is-masked'),
          }, 0.1)
          .to(intro, { v: 1, duration: 1.6, ease: 'power2.out', onUpdate: nudge }, 0.2)
          .to($('.ak-hero-role'), {
            opacity: 1, y: 0, duration: 0.6,
            onStart: () => window.akMotion && window.akMotion.scramble(root.querySelector('.ak-hero-role'), 0.8),
          }, 0.55)
          .to($('.ak-hero-pitch'), { opacity: 1, y: 0, duration: 0.7 }, 0.7)
          .to($('.ak-hero-cta > *'), { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.85)
          .to($('.ak-hero-meta'), { opacity: 1, y: 0, duration: 0.6 }, 1.0)
          .to($('.ak-hero-scroll'), { opacity: 1, duration: 0.8 }, 1.2);
      });

      /* scroll out: the copy lifts and fades, the globe sinks and shrinks */
      const out = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.5 },
      });
      out.to(root.querySelector('.ak-hero-copy'), { y: -90, opacity: 0.15, ease: 'none' }, 0)
        .to(root.querySelector('.ak-hero-globe'), { y: 70, scale: 0.9, opacity: 0.25, ease: 'none' }, 0);

      return () => {
        cancel();
        if (tl) tl.kill();
        out.scrollTrigger && out.scrollTrigger.kill();
        out.kill();
        if (window.akMotion) window.akMotion.scrambleStop(root.querySelector('.ak-hero-role'));
      };
    }, []);

    return (
      <section id="home" className="ak-grid-bg" ref={rootRef} style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden',
      }}>
        {/* radial glow + grid fade */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 55% 55% at 70% 45%, var(--white-a06), transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000, transparent 75%)',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000, transparent 75%)',
          backgroundImage: 'linear-gradient(to right, var(--grid-line-strong) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line-strong) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        <div className="ak-hero">
          <div className="ak-hero-copy">
            {/* data-decrypt-heading opts into DecryptHeadings' scramble */}
            <div className="ak-hero-banner" data-decrypt-heading>
              echo <span style={{ color: 'var(--white)' }}>"Welcome"</span>;
            </div>
            <ProximityName />
            <p className="ak-hero-role">Backend Developer · Fintech &amp; AI</p>
            <p className="ak-hero-pitch">
              I build payment platforms, banking integrations and AI-driven services —
              high-load backends in PHP / Laravel and Python.
            </p>
            <div className="ak-hero-cta">
              <DecryptBtn variant="primary" size="lg" arrow type="button" onClick={playIntro}>Get in touch</DecryptBtn>
              <DecryptBtn variant="secondary" size="lg" as="a" href="#projects">View projects</DecryptBtn>
            </div>
            <div className="ak-hero-meta">
              <span className="live">available for new projects</span>
              <span>Fergana · {Clock ? <b><Clock /></b> : null} UTC+5</span>
              <span>PHP · Laravel · Python</span>
            </div>
          </div>
          <Globe introRef={introRef} />
        </div>

        <div className="ak-hero-scroll">scroll<span /></div>
      </section>
    );
  }

  window.Hero = Hero;
})();
