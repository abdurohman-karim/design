// Portfolio — Hero. echo "Welcome";
//   left:  banner, the name (variable-weight proximity effect), role, pitch,
//          CTAs and a meta line (availability + local time in Fergana)
//   right: a static dotted portrait (portrait.js); only light moves on it —
//          a breathing glow, flaring dots and waves of light from the cursor —
//          signed underneath (assets/signature.svg).
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

      /* the portrait bleeds into the right gutter so it can be larger than its column */
      .ak-hero-art {
        position: relative; margin: 0 calc(-1 * min(var(--container-pad), 72px)) 0 0; justify-self: end;
        width: calc(100% + min(var(--container-pad), 72px)); max-width: 640px;
      }
      @media (max-width: 900px) { .ak-hero-art { width: 100%; max-width: 440px; margin: 8px 0 0; justify-self: center; } }
      .ak-hero-portrait { position: relative; width: 100%; aspect-ratio: 1; touch-action: pan-y; }
      .ak-hero-portrait canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
      /* the signature (assets/signature.svg) under the portrait, tucked into its
         empty lower-right corner; the SVG is a mask, so it takes the text colour */
      .ak-hero-sign {
        display: block; width: clamp(150px, 34%, 220px); margin: -14% 8% 0 auto; pointer-events: none;
        filter: drop-shadow(0 0 8px var(--glow-medium)) drop-shadow(0 0 22px var(--glow-soft));
      }
      .ak-hero-sign span {
        display: block; aspect-ratio: 827 / 424; background: var(--text-primary);
        -webkit-mask: url('/assets/signature.svg') center / contain no-repeat;
        mask: url('/assets/signature.svg') center / contain no-repeat;
      }
      /* light theme: the art keeps its dark-room look as a framed print — a dark
         card with a hairline mat that brings the dark theme's colours inside */
      [data-theme="light"] .ak-hero-art {
        --text-primary: #FFFFFF; --glow-soft: rgba(255, 255, 255, 0.10); --glow-medium: rgba(255, 255, 255, 0.22);
        background: #0A0A0A; border-radius: var(--radius-2xl); padding-bottom: 22px; overflow: hidden;
        box-shadow: 0 40px 80px -32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.08);
        outline: 1px solid rgba(255, 255, 255, 0.10); outline-offset: -12px;
      }
      /* a visible card can't bleed into the gutter until the page has margin to spare */
      @media (max-width: 1400px) { [data-theme="light"] .ak-hero-art { width: 100%; margin-right: 0; } }
      .ak-hero-probe { position: absolute; width: 0; height: 0; overflow: hidden; color: var(--text-primary); }
      /* the canvas reads the probe's colour the moment data-theme flips — keep
         it out of the 0.3 s .theme-transition so it isn't read mid-fade */
      .ak-hero-portrait .ak-hero-probe { transition: none !important; }

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
     Portrait — the face as a field of lit dots (portrait.js), in the same
     visual language as the dotted globe it replaced. The art itself is
     static; only light moves: a slow breathing glow, a few dots that flare
     and fade, and waves — where the cursor touches the art's dots a ring of
     light runs out across them (never beyond); moving over it leaves ripples.
     The dots are always light on dark: on the light theme the art sits in a
     dark frame that carries the dark theme's colours (see .ak-hero-art).
     ───────────────────────────────────────────────────────────────────────── */
  const PORTRAIT_LEVELS = 10;
  const PORTRAIT_MIN = 0.07;  // weaker cells draw no dot
  const DOT_ALPHA = [0.12, 0.76];  // opacity of the faintest dot, and how much the brightest adds
  const DOT_TONE = 1.15;      // > 1 keeps the highlights from burning white
  const GLOW = [0.3, 0.34];   // glow opacity at the bottom of a breath, and how much a breath adds
  const BREATH = 6;          // s per glow breath
  const SPARKS = 14;         // dots flaring at any moment
  const SPARK_LIFE = 2.6;    // s one flare lasts
  const WAVE_SPEED = 520;    // px/s a wave of light runs out
  const WAVE_WIDTH = 56;     // px, the lit band of a wave
  const WAVE_TRAIL = 150;    // px the cursor moves inside before it leaves a ripple
  const WAVES_MAX = 5;       // waves alive at once
  const HIT_CELL = 6;        // px, cell of the map of where the art's dots are
  const HIT_PAD = 2;         // cells of slack around the dots
  const REENTER = 0.25;      // s off the art before coming back on counts as a new touch

  function portraitData() {
    const p = window.AK_PORTRAIT;
    if (!p) return null;
    const bin = atob(p.b64);
    const rh = p.pitch * Math.sqrt(3) / 2;
    const x = [], y = [], s = [];
    for (let row = 0; row < p.rows; row++) {
      for (let j = 0; j < p.cols; j++) {
        const v = bin.charCodeAt(row * p.cols + j) / 255;
        if (v < PORTRAIT_MIN) continue;
        x.push(p.pitch * 0.5 + j * p.pitch + (row % 2) * p.pitch / 2);
        y.push(rh * 0.5 + row * rh);
        s.push(v);
      }
    }
    return { w: p.w, h: p.h, pitch: p.pitch, n: x.length, x, y, s };
  }

  function Portrait({ introRef }) {
    const wrapRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const probeRef = React.useRef(null);

    React.useEffect(() => {
      const wrap = wrapRef.current, canvas = canvasRef.current, ctx = canvas.getContext('2d');
      const reduced = reducedMotion();
      const D = portraitData();
      const layer = () => document.createElement('canvas');
      const dotsC = layer(), glowC = layer(), waveC = layer(), sparkC = layer();
      let W = 0, H = 0, dpr = 1, k = 1, ox = 0, oy = 0, ink = '255,255,255';
      let hit = null, hitCols = 0, hitRows = 0;
      const S = D ? D.s : [];                        // dot strengths
      const bright = [];                             // dots the flares may light
      for (let i = 0; i < S.length; i++) if (S[i] > 0.45) bright.push(i);

      const readTheme = () => {
        const c = getComputedStyle(probeRef.current).color.match(/\d+(\.\d+)?/g) || [255, 255, 255];
        ink = `${c[0]},${c[1]},${c[2]}`;
      };

      /* the static art, rendered once per size / theme: crisp dots, then the
         same dots with a blur halo for the glow, and a soft sprite for flares */
      const build = () => {
        if (!D || !W) return;
        k = Math.min(W / D.w, H / D.h);
        ox = (W - D.w * k) / 2; oy = (H - D.h * k) / 2;
        dotsC.width = glowC.width = waveC.width = canvas.width;
        dotsC.height = glowC.height = waveC.height = canvas.height;

        const dc = dotsC.getContext('2d');
        dc.setTransform(dpr, 0, 0, dpr, 0, 0);
        const rmax = D.pitch * 0.42 * k;
        const bins = Array.from({ length: PORTRAIT_LEVELS }, () => []);
        for (let i = 0; i < D.n; i++) if (S[i] >= PORTRAIT_MIN) bins[Math.min(PORTRAIT_LEVELS - 1, Math.floor(S[i] * PORTRAIT_LEVELS))].push(i);
        bins.forEach((L, b) => {
          if (!L.length) return;
          const level = ((b + 0.5) / PORTRAIT_LEVELS) ** DOT_TONE;
          dc.fillStyle = `rgba(${ink},${(DOT_ALPHA[0] + DOT_ALPHA[1] * level).toFixed(3)})`;
          dc.beginPath();
          for (const i of L) {
            const x = ox + D.x[i] * k, y = oy + D.y[i] * k, r = rmax * (0.35 + 0.65 * Math.sqrt(S[i]));
            dc.moveTo(x + r, y); dc.arc(x, y, r, 0, Math.PI * 2);
          }
          dc.fill();
        });

        /* where the dots are, coarsely — the cursor wakes the art only over them */
        hitCols = Math.ceil(W / HIT_CELL); hitRows = Math.ceil(H / HIT_CELL);
        hit = new Uint8Array(hitCols * hitRows);
        for (let i = 0; i < D.n; i++) {
          if (S[i] < 0.12) continue;
          const cx = Math.floor((ox + D.x[i] * k) / HIT_CELL), cy = Math.floor((oy + D.y[i] * k) / HIT_CELL);
          for (let yy = Math.max(0, cy - HIT_PAD); yy <= Math.min(hitRows - 1, cy + HIT_PAD); yy++) {
            for (let xx = Math.max(0, cx - HIT_PAD); xx <= Math.min(hitCols - 1, cx + HIT_PAD); xx++) hit[yy * hitCols + xx] = 1;
          }
        }

        const gc = glowC.getContext('2d');
        gc.shadowColor = `rgba(${ink},1)`;
        gc.shadowBlur = Math.max(5, 14 * k) * dpr;
        gc.drawImage(dotsC, 0, 0);

        sparkC.width = sparkC.height = 64;
        const sc = sparkC.getContext('2d'), g = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, `rgba(${ink},1)`); g.addColorStop(0.25, `rgba(${ink},0.45)`); g.addColorStop(1, `rgba(${ink},0)`);
        sc.fillStyle = g; sc.fillRect(0, 0, 64, 64);
      };

      const resize = () => {
        const r = wrap.getBoundingClientRect();
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = r.width; H = r.height;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        build();
      };

      /* flares: each slot lights one bright dot, fades, then moves to another */
      const pick = () => (bright.length ? bright[Math.floor(Math.random() * bright.length)] : -1);
      const sparks = Array.from({ length: SPARKS }, () => ({ i: -1, t0: -Math.random() * SPARK_LIFE }));

      /* waves of light: each runs out from a point until it has crossed the art */
      const waves = [];
      const spawn = (x, y, a) => {
        if (reduced || !W) return;
        const far = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
        waves.push({ x, y, a, t0: performance.now() / 1000, life: (far + WAVE_WIDTH) / WAVE_SPEED });
        if (waves.length > WAVES_MAX) waves.shift();
        kick();
      };

      const draw = (now) => {
        const intro = introRef.current.v;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!D || !W || intro <= 0) return;
        const t = now / 1000;
        ctx.save();

        /* the glow breathes; the dots stay put */
        const breath = reduced ? 0.5 : 0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / BREATH);
        ctx.globalAlpha = intro * (GLOW[0] + GLOW[1] * breath);
        ctx.drawImage(glowC, 0, 0);
        ctx.globalAlpha = intro;
        ctx.drawImage(dotsC, 0, 0);

        ctx.globalCompositeOperation = 'lighter';
        if (!reduced) {
          const size = D.pitch * k * 3.2 * dpr;
          for (const sp of sparks) {
            let life = (t - sp.t0) / SPARK_LIFE;
            if (life >= 1 || life < 0 || sp.i < 0) { sp.i = pick(); sp.t0 = t; life = 0; }
            if (sp.i < 0) continue;
            const a = Math.sin(Math.PI * life) ** 2;
            ctx.globalAlpha = intro * a * 0.55;
            ctx.drawImage(sparkC, (ox + D.x[sp.i] * k) * dpr - size / 2, (oy + D.y[sp.i] * k) * dpr - size / 2, size, size);
          }
        }

        /* waves: the dots and their glow, cut to a ring that grows from the
           wave's origin, added on top — so the light only ever runs over the art */
        const wc = waveC.getContext('2d');
        for (let w = waves.length - 1; w >= 0; w--) {
          const wv = waves[w], age = t - wv.t0;
          if (age > wv.life) { waves.splice(w, 1); continue; }
          if (age < 0) continue;
          const r = age * WAVE_SPEED * dpr, bw = WAVE_WIDTH * dpr, R = r + bw;
          const cx = wv.x * dpr, cy = wv.y * dpr;
          const x0 = Math.max(0, Math.floor(cx - R)), y0 = Math.max(0, Math.floor(cy - R));
          const bwid = Math.min(canvas.width, Math.ceil(cx + R)) - x0, bhgt = Math.min(canvas.height, Math.ceil(cy + R)) - y0;
          if (bwid <= 0 || bhgt <= 0) continue;
          const fade = intro * wv.a * (1 - age / wv.life) ** 1.4;
          const ring = wc.createRadialGradient(cx, cy, 0, cx, cy, R);
          const inner = Math.max(0, (r - bw) / R);
          ring.addColorStop(0, 'rgba(0,0,0,0)');
          if (inner > 0) ring.addColorStop(inner, 'rgba(0,0,0,0)');
          ring.addColorStop(r / R, 'rgba(0,0,0,1)');
          ring.addColorStop(1, 'rgba(0,0,0,0)');
          wc.globalCompositeOperation = 'source-over';
          wc.clearRect(x0, y0, bwid, bhgt);
          wc.drawImage(glowC, x0, y0, bwid, bhgt, x0, y0, bwid, bhgt);
          wc.drawImage(dotsC, x0, y0, bwid, bhgt, x0, y0, bwid, bhgt);
          wc.globalCompositeOperation = 'destination-in';
          wc.fillStyle = ring; wc.fillRect(x0, y0, bwid, bhgt);
          for (const a of [1, 0.6]) {          // added twice: dim dots light up, the halo blooms
            ctx.globalAlpha = fade * a;
            ctx.drawImage(waveC, x0, y0, bwid, bhgt, x0, y0, bwid, bhgt);
          }
        }
        ctx.restore();
      };

      /* loop — only while on screen; nothing but light changes */
      let raf = null, visible = true;
      const frame = (now) => {
        raf = null;
        draw(now);
        if (visible && !reduced) raf = requestAnimationFrame(frame);
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

      /* the cursor touching the art (its dots, not the empty box around them)
         sends a wave from that point; moving over it leaves softer ripples */
      let trail = null, offSince = -Infinity;
      const onArt = (x, y) => {
        const cx = Math.floor(x / HIT_CELL), cy = Math.floor(y / HIT_CELL);
        return !!hit && cx >= 0 && cy >= 0 && cx < hitCols && cy < hitRows && hit[cy * hitCols + cx] === 1;
      };
      const onMove = (e) => {
        const r = wrap.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        const now = performance.now() / 1000;
        if (!onArt(x, y)) {
          if (trail) { trail = null; offSince = now; }
          return;
        }
        if (!trail) {
          trail = [x, y];
          if (now - offSince > REENTER) spawn(x, y, 1);   // a quick pass over an eye isn't a new touch
          return;
        }
        if (Math.hypot(x - trail[0], y - trail[1]) < WAVE_TRAIL) return;
        trail = [x, y];
        spawn(x, y, 0.45);
      };
      const onLeave = () => {
        if (trail) { trail = null; offSince = performance.now() / 1000; }
      };

      readTheme();
      resize();
      const ro = new ResizeObserver(() => { resize(); kick(); });
      ro.observe(wrap);
      const mo = new MutationObserver(() => { readTheme(); build(); kick(); });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
      io.observe(wrap);
      wrap.addEventListener('pointermove', onMove);
      wrap.addEventListener('pointerdown', onMove);   // a tap on a phone touches the art too
      wrap.addEventListener('pointerleave', onLeave);
      introRef.current.redraw = kick;   // the entrance tween nudges static renders
      kick();

      return () => {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect(); mo.disconnect(); io.disconnect();
        wrap.removeEventListener('pointermove', onMove);
        wrap.removeEventListener('pointerdown', onMove);
        wrap.removeEventListener('pointerleave', onLeave);
      };
    }, []);

    return (
      <div className="ak-hero-portrait" ref={wrapRef} role="img" aria-label="Dotted portrait of Abdurohman Karim">
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
      /* the signature is written in, left to right (the inset leaves room for the swashes) */
      gsap.set($('.ak-hero-sign'), { clipPath: 'inset(-40% 100% -40% -20%)' });

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
          .to($('.ak-hero-scroll'), { opacity: 1, duration: 0.8 }, 1.2)
          .to($('.ak-hero-sign'), {
            clipPath: 'inset(-40% -20% -40% -20%)', duration: 1.5, ease: 'power2.inOut', clearProps: 'clipPath',
          }, 1.3);
      });

      /* scroll out: the copy lifts and fades, the portrait sinks and shrinks */
      const out = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.5 },
      });
      out.to(root.querySelector('.ak-hero-copy'), { y: -90, opacity: 0.15, ease: 'none' }, 0)
        .to(root.querySelector('.ak-hero-art'), { y: 70, scale: 0.9, opacity: 0.25, ease: 'none' }, 0);

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
          <figure className="ak-hero-art">
            <Portrait introRef={introRef} />
            <figcaption className="ak-hero-sign" aria-hidden="true"><span /></figcaption>
          </figure>
        </div>

        <div className="ak-hero-scroll">scroll<span /></div>
      </section>
    );
  }

  window.Hero = Hero;
})();
