// Portfolio — IntroTV. Full-screen CRT power-on intro that plays once per full
// page load. Pure CSS/SVG (no video, no anim libs) to match the build-less
// React-via-Babel stack. Strictly monochrome, theme-token driven. Additive:
// mounted at the top of <App>, above all content; never touches other logic.

/* Inject the stylesheet once. All colours come from existing theme tokens.
   Fixed monochrome tokens (--black, --gray-*, --ink-*) are used for the CRT
   itself so the bright/dark relationship holds in BOTH themes (--white flips). */
if (typeof document !== 'undefined' && !document.getElementById('ak-introtv-css')) {
  const s = document.createElement('style');
  s.id = 'ak-introtv-css';
  s.textContent = `
    /* Scroll lock that survives the preloader clearing body.style.overflow */
    body.ak-intro-lock { overflow: hidden !important; }

    .ak-introtv {
      /* inset:0 (not 100vw/100vh) so the fixed overlay fills exactly the
         viewport minus the scrollbar — 100vw would overshoot by the scrollbar
         width and add a horizontal scrollbar to the page. */
      position: fixed; inset: 0;
      z-index: 999999; overflow: hidden; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: var(--black);
      animation: ak-tv-overlayout .4s var(--ease-out, ease) 3.35s forwards;
    }
    /* faint site grid texture on the black room */
    .ak-introtv::before {
      content: ""; position: absolute; inset: 0; pointer-events: none;
      background-image:
        linear-gradient(var(--white-a04) 1px, transparent 1px),
        linear-gradient(90deg, var(--white-a04) 1px, transparent 1px);
      background-size: 44px 44px;
      mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 40%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 40%, transparent 100%);
    }
    /* Skip → fast fade, cancel every running keyframe */
    .ak-introtv.ak-introtv--skip,
    .ak-introtv.ak-introtv--skip * { animation: none !important; }
    .ak-introtv.ak-introtv--skip { opacity: 0; transition: opacity .25s var(--ease-out, ease); }

    .ak-tv-set {
      position: relative; width: min(86vw, 540px); aspect-ratio: 670 / 515;
    }
    .ak-tv-img {
      position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2;
      user-select: none; -webkit-user-drag: none;
      filter: grayscale(1) contrast(1.02);
    }

    /* ── Screen: sits over the white cut-out of tv.png ── */
    .ak-tv-screen {
      position: absolute; z-index: 3; overflow: hidden;
      left: 6.4%; top: 10.4%; width: 66.8%; height: 69.4%;
      border-radius: 8% / 10%;
      background: var(--black);
    }
    .ak-tv-screen > * { position: absolute; inset: 0; pointer-events: none; }

    .ak-tv-vignette {
      background: radial-gradient(ellipse 78% 70% at 50% 48%, rgba(228,228,228,0.05), transparent 72%);
    }

    /* content wrapper: fades in after power-on, fades out before power-off */
    .ak-tv-content {
      display: grid; place-items: center; opacity: 0;
      animation: ak-tv-content 2.1s var(--ease-out, ease) .8s both;
    }
    .ak-tv-logo {
      display: flex; align-items: center; gap: clamp(8px, 2.4vw, 14px);
      transform: scale(1);
      animation: ak-tv-flicker 1.7s steps(24, end) infinite;
      filter: drop-shadow(0 0 14px var(--glow-strong, rgba(255,255,255,.4)));
    }
    .ak-tv-mark {
      width: clamp(40px, 12vw, 62px); height: clamp(40px, 12vw, 62px);
      display: grid; place-items: center;
      border: 1px solid var(--gray-300); border-radius: 12px;
      font-family: var(--font-display); font-weight: 600;
      font-size: clamp(20px, 6vw, 30px); letter-spacing: -0.04em;
      color: var(--gray-100); box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
    }
    .ak-tv-word {
      font-family: var(--font-display); letter-spacing: -0.01em;
      font-size: clamp(15px, 4.6vw, 24px); color: var(--gray-400);
    }
    .ak-tv-word b { color: var(--gray-100); font-weight: 600; }

    /* CRT scanlines */
    .ak-tv-scanlines {
      background: repeating-linear-gradient(
        to bottom,
        rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px,
        rgba(0,0,0,0.42) 3px, rgba(0,0,0,0.42) 4px);
      opacity: 0; mix-blend-mode: multiply;
      animation: ak-tv-content 2.1s var(--ease-out, ease) .8s both,
                 ak-tv-scan 6s linear infinite;
    }
    /* grayscale static / noise */
    .ak-tv-static {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0; mix-blend-mode: screen;
      animation: ak-tv-static-op 2.1s var(--ease-out, ease) .8s both,
                 ak-tv-static-shift .16s steps(3, end) infinite;
    }

    /* ── Sparks: procedural embers (paths + parabolic motion generated in JS) ── */
    .ak-tv-defs { position: absolute; width: 0; height: 0; overflow: hidden; }
    /* Spark layer spans the whole set, above the corpus — embers crack at the
       TOP of the TV, the same spot the smoke then rises from. */
    .ak-tv-spark-layer { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    .ak-tv-spark {
      position: absolute;              /* per-ember left/top set inline (smoke zone) */
      transform-origin: 0 0; opacity: 0; will-change: transform, opacity;
    }
    .ak-tv-spark svg { position: absolute; left: 0; top: 0; overflow: visible; display: block; }
    .ak-tv-spark path {
      fill: none; stroke: #fff6ea;   /* whisper-warm white — reads monochrome, warms the bloom */
      stroke-linecap: round; stroke-linejoin: round;
      filter: url(#ak-spark-glow);
    }

    /* power-ON bright fill: horizontal line → full screen → fades to content */
    .ak-tv-on {
      transform-origin: 50% 50%; opacity: 0;
      background: var(--gray-100);
      box-shadow: 0 0 40px 8px rgba(228,228,228,.6);
      animation: ak-tv-on .6s var(--ease-out, ease) .3s both;
    }
    /* power-OFF: bright flash → collapse to line → collapse to point → gone */
    .ak-tv-off {
      transform-origin: 50% 50%; opacity: 0;
      background: var(--gray-100);
      box-shadow: 0 0 46px 10px rgba(228,228,228,.7);
      animation: ak-tv-off .5s var(--ease-in-out, ease) 2.85s both;
    }

    /* ── Smoke rising from behind the top of the corpus ── */
    .ak-tv-smoke-layer { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    /* ── Smoke: turbulent puffs (feTurbulence + feDisplacementMap, JS-driven) ── */
    .ak-tv-smoke {
      position: absolute; opacity: 0;
      transform-origin: 50% 100%; will-change: transform, opacity, filter;
    }
    .ak-tv-smoke-tex {
      position: absolute; inset: 0; border-radius: 50%;
      background: radial-gradient(circle at 50% 55%,
        var(--gray-300) 0%, rgba(160,160,160,0.5) 30%,
        rgba(120,120,120,0.26) 56%, transparent 76%);
    }

    .ak-tv-hint {
      position: absolute; left: 0; right: 0; bottom: 7%;
      text-align: center; pointer-events: none;
      font-family: var(--font-mono); font-size: 11px; letter-spacing: .28em;
      text-transform: uppercase; color: var(--gray-600);
      opacity: 0; animation: ak-tv-hint 3.2s ease-in-out .9s both;
    }

    @keyframes ak-tv-on {
      0%   { opacity: 0; transform: scaleY(0.004); }
      9%   { opacity: 1; transform: scaleY(0.004); }
      15%  { transform: scaleY(0.03); }
      55%  { opacity: 1; transform: scaleY(1); }
      62%  { opacity: 0.55; }
      70%  { opacity: 1; }
      82%  { opacity: 0.3; }
      100% { opacity: 0; transform: scaleY(1); }
    }
    @keyframes ak-tv-off {
      0%   { opacity: 0; transform: scaleX(1) scaleY(1); }
      10%  { opacity: 1; transform: scaleX(1) scaleY(1); }
      42%  { opacity: 1; transform: scaleX(1) scaleY(0.012); }
      72%  { opacity: 1; transform: scaleX(0.02) scaleY(0.012); }
      100% { opacity: 0; transform: scaleX(0) scaleY(0.012); }
    }
    @keyframes ak-tv-content {
      0% { opacity: 0; } 11% { opacity: 1; } 82% { opacity: 1; } 100% { opacity: 0; }
    }
    @keyframes ak-tv-static-op {
      0% { opacity: 0; } 11% { opacity: 0.12; } 82% { opacity: 0.1; } 100% { opacity: 0; }
    }
    @keyframes ak-tv-flicker {
      0%, 100% { opacity: 1; }
      5%  { opacity: 0.55; } 7%  { opacity: 1; }
      41% { opacity: 0.82; } 43% { opacity: 1; }
      68% { opacity: 0.45; } 70% { opacity: 1; }
      88% { opacity: 0.9; }
    }
    @keyframes ak-tv-scan { 0% { background-position: 0 0; } 100% { background-position: 0 8px; } }
    @keyframes ak-tv-static-shift {
      0% { transform: translate(0,0); } 33% { transform: translate(-6px,4px); }
      66% { transform: translate(5px,-5px); } 100% { transform: translate(-3px,7px); }
    }
    /* (spark + smoke are procedural now — animated via the Web Animations API) */
    @keyframes ak-tv-hint {
      0% { opacity: 0; } 25% { opacity: 1; } 78% { opacity: 1; } 100% { opacity: 0; }
    }
    @keyframes ak-tv-overlayout { 0% { opacity: 1; } 100% { opacity: 0; } }

    @media (prefers-reduced-motion: reduce) { .ak-introtv { display: none; } }
  `;
  document.head.appendChild(s);
}

/* ── Procedural spark + smoke generators — a fresh set every play/reload ──
   Motion is driven by the Web Animations API so each particle gets its own
   randomised keyframes (path, arc, duration, delay) with no repeating sprite. */
const akRand = (a, b) => a + Math.random() * (b - a);
const akLerp = (a, b, t) => a + (b - a) * t;

// One ember: a jagged lightning-scratch polyline + a launch vector under gravity.
function akMakeSpark() {
  const len = akRand(12, 30);
  const segs = 3 + Math.floor(akRand(0, 3));            // 3–5 kinks
  const step = len / segs;
  let d = 'M0 0';
  for (let i = 1; i <= segs; i++) {
    d += ' L' + (i * step).toFixed(1) + ' ' + akRand(-4, 4).toFixed(1);
  }
  return {
    d, len,
    left: akRand(36, 58), top: akRand(7, 17),            // launch from the top of the corpus (smoke zone)
    ox: akRand(-16, 16), oy: akRand(-10, 10),            // small scatter around that point
    vx: akRand(-150, 150),                               // horizontal velocity
    vy: -akRand(150, 275),                               // upward velocity
    g:  akRand(280, 410),                                // gravity → parabolic arc
    dur: akRand(520, 980), delay: akRand(1820, 2180),
    rot: akRand(0, 360), sw: akRand(1, 1.9), scale0: akRand(0.7, 1.35),
  };
}
// Sample the parabola into WAAPI keyframes: fly along an arc, shrink, fade out.
function akSparkFrames(s) {
  const N = 10, out = [];
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const x = s.ox + s.vx * f;
    const y = s.oy + s.vy * f + 0.5 * s.g * f * f;       // y = v·t + ½g·t²
    const sc = (s.scale0 * (1 - 0.62 * f)).toFixed(3);
    const op = (f < 0.12 ? f / 0.12 : Math.max(0, 1 - (f - 0.12) / 0.88)).toFixed(3);
    out.push({ offset: f, opacity: op,
      transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${s.rot.toFixed(0)}deg) scale(${sc})` });
  }
  return out;
}

// One smoke plume: own position, rise height, sway, widening, blur ramp, timing.
function akMakeSmoke(filters) {
  const f = filters[Math.floor(Math.random() * filters.length)];
  return {
    filterId: f.id,
    left: akRand(36, 58), top: akRand(7, 17), size: akRand(58, 130),
    rise: -akRand(150, 300),                             // final upward travel
    swayA: akRand(-40, 40), swayB: akRand(-30, 30),      // horizontal wander
    sx0: akRand(0.42, 0.7), sxe: akRand(1.3, 2.0),       // widens more than it grows tall
    sy0: akRand(0.5, 0.72), sye: akRand(1.05, 1.6),
    blur0: akRand(2, 5), blure: akRand(13, 24),          // loses sharpness while rising
    peak: akRand(0.24, 0.42),
    dur: akRand(1700, 2600), delay: akRand(2150, 2550),   // starts just after the sparks crack
  };
}
function akSmokeFrames(p) {
  const tf = (sway, t) =>
    `translate(${sway.toFixed(1)}px, ${(p.rise * t).toFixed(1)}px)` +
    ` scale(${akLerp(p.sx0, p.sxe, t).toFixed(3)}, ${akLerp(p.sy0, p.sye, t).toFixed(3)})`;
  const bl = (t) => `blur(${akLerp(p.blur0, p.blure, t).toFixed(1)}px)`;
  return [
    { offset: 0,    opacity: 0,          transform: tf(0, 0),             filter: bl(0) },
    { offset: 0.16, opacity: p.peak,     transform: tf(p.swayA * 0.5, 0.16), filter: bl(0.16) },
    { offset: 0.45, opacity: p.peak * 0.9, transform: tf(p.swayA, 0.45),   filter: bl(0.45) },
    { offset: 0.72, opacity: p.peak * 0.5, transform: tf(p.swayB, 0.72),   filter: bl(0.72) },
    { offset: 1,    opacity: 0,          transform: tf(p.swayB * 0.4, 1),  filter: bl(1) },
  ];
}

/* ── Audio ───────────────────────────────────────────────────────────────────
   One pre-mixed clip for the whole intro — you glue the TV turn-on / static /
   spark / smoke sounds into a single mp3 timed to the ~3.8s sequence and drop it
   at the path below. Optional: a missing file just stays silent (no errors).

   Path is absolute (leading "/") so it resolves on every route, including
   /interests. Put the file at  <project root>/audio/effects/tv-intro.mp3 .

   NOTE: browsers block autoplay until the user interacts with the page, so on a
   hard reload the sound may be muted by the browser's autoplay policy — that's
   expected, not an error. */
const AK_TV_AUDIO = {
  src: '/audio/effects/tv-intro.mp3',
  at: 0,          // ms from intro start (0 = plays immediately, in sync with frame 1)
  volume: 0.7,
};

function IntroTV({ onFinish }) {
  const [skipping, setSkipping] = React.useState(false);
  const doneRef = React.useRef(false);
  const stopAudioRef = React.useRef(null);   // stops every scheduled sound at once

  const finish = React.useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onFinish && onFinish();
  }, [onFinish]);

  const skip = React.useCallback(() => {
    if (doneRef.current || skipping) return;
    setSkipping(true);
    if (stopAudioRef.current) stopAudioRef.current();   // cut sound on skip
    setTimeout(finish, 260);          // let the fast fade play, then release
  }, [finish, skipping]);

  React.useEffect(() => {
    document.body.classList.add('ak-intro-lock');
    const onKey = () => skip();
    window.addEventListener('keydown', onKey);
    const t = setTimeout(finish, 3800); // full sequence length
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
      document.body.classList.remove('ak-intro-lock');
    };
  }, [skip, finish]);

  // Turbulence filters — random seed/frequency per load ⇒ different smoke each visit
  const filters = React.useMemo(() => [0, 1, 2].map((k) => ({
    id: 'ak-smoke-t' + k,
    seed: Math.floor(Math.random() * 1000),
    bf: (0.010 + Math.random() * 0.012).toFixed(4) + ' ' + (0.016 + Math.random() * 0.02).toFixed(4),
    scale: 26 + Math.floor(Math.random() * 22),
  })), []);

  // Fresh particle sets, generated once per mount (i.e. once per full page load)
  const sparks = React.useMemo(
    () => Array.from({ length: 6 + Math.floor(Math.random() * 7) }, akMakeSpark), []); // 6–12
  const puffs = React.useMemo(
    () => Array.from({ length: 5 + Math.floor(Math.random() * 4) }, () => akMakeSmoke(filters)), [filters]); // 5–8

  const sparkEls = React.useRef([]);
  const puffEls = React.useRef([]);

  // Drive every particle via the Web Animations API; cancel on unmount/skip.
  React.useEffect(() => {
    const anims = [];
    sparks.forEach((s, i) => {
      const el = sparkEls.current[i];
      if (el) anims.push(el.animate(akSparkFrames(s),
        { duration: s.dur, delay: s.delay, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'both' }));
    });
    puffs.forEach((p, i) => {
      const el = puffEls.current[i];
      if (el) anims.push(el.animate(akSmokeFrames(p),
        { duration: p.dur, delay: p.delay, easing: 'ease-out', fill: 'both' }));
    });
    return () => anims.forEach((a) => { try { a.cancel(); } catch (e) {} });
  }, [sparks, puffs]);

  // Single pre-mixed clip, started with the intro. Missing file stays silent,
  // autoplay blocks are swallowed, and it stops on skip/unmount so nothing
  // bleeds into the site.
  React.useEffect(() => {
    const cfg = AK_TV_AUDIO;
    if (!cfg || !cfg.src) return;

    const a = new Audio(cfg.src);
    a.preload = 'auto';
    a.volume = cfg.volume == null ? 1 : cfg.volume;
    a.addEventListener('error', () => {});     // 404 / decode error → silent, never throws

    const startT = setTimeout(() => {
      try { a.currentTime = 0; } catch (e) {}
      const p = a.play();
      if (p && p.catch) p.catch(() => {});      // autoplay blocked before a gesture → ignore
    }, cfg.at || 0);

    const stop = () => { try { a.pause(); } catch (e) {} };
    stopAudioRef.current = stop;

    return () => { clearTimeout(startT); stop(); };
  }, []);

  return (
    <div
      className={'ak-introtv' + (skipping ? ' ak-introtv--skip' : '')}
      onClick={skip}
      role="presentation"
      aria-hidden="true"
    >
      <div className="ak-tv-set">
        {/* Shared SVG filters — spark bloom + turbulent smoke (random seeds/load) */}
        <svg className="ak-tv-defs" aria-hidden="true">
          <defs>
            <filter id="ak-spark-glow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.3" result="b" />
              <feMerge>
                <feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {filters.map((f) => (
              <filter key={f.id} id={f.id} x="-40%" y="-40%" width="180%" height="180%">
                <feTurbulence type="fractalNoise" baseFrequency={f.bf} numOctaves="3"
                  seed={f.seed} stitchTiles="stitch" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale={f.scale}
                  xChannelSelector="R" yChannelSelector="G" />
              </filter>
            ))}
          </defs>
        </svg>

        {/* Smoke behind the set (z:1) — turbulent plumes rise from the back/top */}
        <div className="ak-tv-smoke-layer">
          {puffs.map((p, i) => (
            <div key={i} className="ak-tv-smoke"
              ref={(el) => { puffEls.current[i] = el; }}
              style={{ left: p.left + '%', top: p.top + '%', width: p.size, height: p.size }}>
              <div className="ak-tv-smoke-tex" style={{ filter: 'url(#' + p.filterId + ')' }} />
            </div>
          ))}
        </div>

        <img className="ak-tv-img" src="/assets/tv.png" alt="" draggable="false" />

        {/* Screen — mapped over the white cut-out of the TV image */}
        <div className="ak-tv-screen">
          <div className="ak-tv-vignette" />

          {/* Reused header logo (monogram + syneTra wordmark) */}
          <div className="ak-tv-content">
            <div className="ak-tv-logo">
              <span className="ak-tv-mark">sY</span>
              <span className="ak-tv-word"><b>sy</b>ne<b>T</b>ra</span>
            </div>
          </div>

          <div className="ak-tv-scanlines" />
          <div className="ak-tv-static" />

          <div className="ak-tv-on" />
          <div className="ak-tv-off" />
        </div>

        {/* Sparks — embers cracking at the TOP of the corpus, right where the
            smoke then rises from (same zone, painted above the set) */}
        <div className="ak-tv-spark-layer">
          {sparks.map((s, i) => (
            <span key={i} className="ak-tv-spark" ref={(el) => { sparkEls.current[i] = el; }}
              style={{ left: s.left + '%', top: s.top + '%' }}>
              <svg width={s.len + 8} height="22" viewBox={`-4 -11 ${s.len + 8} 22`}
                xmlns="http://www.w3.org/2000/svg">
                <path d={s.d} strokeWidth={s.sw} />
              </svg>
            </span>
          ))}
        </div>
      </div>

      <div className="ak-tv-hint">press any key to skip</div>
    </div>
  );
}
window.IntroTV = IntroTV;
