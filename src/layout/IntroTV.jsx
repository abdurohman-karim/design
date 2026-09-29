// Portfolio — IntroTV. Full-screen CRT film, played by the hero's "Get in touch"
// (or ?intro on load). One GSAP timeline drives it, frame by frame:
//   1. power-on  — line → full-screen flash → logo + static
//   2. dolly in  — the camera pushes in until the screen fills the frame,
//                  then dives through the glass
//   3. inside    — a short reel plays in the screen's "virtual space"
//                  (a canvas corridor of receding screens + kinetic type)
//   4. pull out  — the reel stays painted on the screen while the camera backs
//                  out, so the set slides back into frame around it
//   5. short out — arcs, sparks, tearing, a last surge, collapse to a dot
// No video, strictly monochrome, theme-token driven. Additive: mounted at the
// top of <App> while it plays, above all content; never touches other logic.

// (body left unindented inside the IIFE to keep the file's git history readable)
(() => {
/* TV static as bitmap tiles, drawn once. (An SVG feTurbulence background
   gets re-rasterised at every new camera scale, i.e. on every frame of a
   dolly — the single most expensive thing the film used to do.)
   Several different frames of "snow": the film shows a new one at a random
   offset ~60 times a second, the way a tube draws fresh noise every field —
   one tile nudged back and forth reads as a picture that shakes. Each row
   gets its own gain (the beam sweeps line by line), and each frame its own
   overall level, so the snow flickers and streaks like the real thing. */
const AK_NOISES = [1, 0.8, 1.15, 0.9, 1.05, 0.85].map((gain) => {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    const img = x.createImageData(128, 128);
    for (let y = 0; y < 128; y++) {
      const row = gain * (Math.random() < 0.05 ? 1.45 : 0.75 + Math.random() * 0.5);
      for (let i = y * 512; i < (y + 1) * 512; i += 4) {
        // mean of two: grainy "snow" with sparkle, not flat salt-and-pepper
        const v = (Math.random() + Math.random()) * 127.5 * row;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;   // the array clamps
        img.data[i + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    return 'url(' + c.toDataURL('image/png') + ')';
  } catch (e) { return 'none'; }
});
const AK_NOISE = AK_NOISES[0];

/* Inject the stylesheet once. All colours come from existing theme tokens.
   The room around the set follows the page theme (--bg), so a light-theme
   visitor gets a light room instead of a black slab between the preloader and
   the site. Fixed monochrome tokens (--black, --gray-*, --ink-*) are used for
   the CRT screen and the world inside it, so the bright/dark relationship
   holds in BOTH themes.
   Performance: no mix-blend-mode anywhere (every overlay here sits on black,
   where plain alpha looks the same and composites far cheaper), no CSS
   filters on anything the camera scales, and the layers that change every
   frame are promoted with will-change. */
if (typeof document !== 'undefined' && !document.getElementById('ak-introtv-css')) {
  const s = document.createElement('style');
  s.id = 'ak-introtv-css';
  s.textContent = `
    /* Scroll lock that survives the preloader clearing body.style.overflow.
       <html> too: its overflow-x: clip stops body's overflow from reaching the
       viewport, which would leave a scrollbar beside the film. */
    html.ak-intro-lock, body.ak-intro-lock { overflow: hidden !important; }

    .ak-introtv {
      /* inset:0 (not 100vw/100vh) so the fixed overlay fills exactly the
         viewport minus the scrollbar — 100vw would overshoot by the scrollbar
         width and add a horizontal scrollbar to the page. */
      position: fixed; inset: 0;
      z-index: 999999; overflow: hidden; cursor: pointer;
      background: var(--bg, #000);
      --ak-tv-spark: #fff6ea;                  /* whisper-warm white embers on the dark room */
      --ak-tv-light: rgba(228,228,228,0.13);   /* screen light spilling onto the room */
    }
    [data-theme="light"] .ak-introtv {
      --ak-tv-spark: #2a2a2a;                  /* dark embers so they read on the light room */
      --ak-tv-light: rgba(0,0,0,0);            /* a lit screen doesn't show on a white wall */
    }
    /* Skip → fast fade, cancel every running keyframe */
    .ak-introtv.ak-introtv--skip,
    .ak-introtv.ak-introtv--skip * { animation: none !important; }
    .ak-introtv.ak-introtv--skip { opacity: 0 !important; transition: opacity .25s var(--ease-out, ease); }

    /* ── World: everything the camera sees (roll + shake live here) ── */
    .ak-tv-world {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      transform-origin: 50% 50%; will-change: transform;
    }
    /* faint site grid on the back wall — further than the set, so it
       grows slower while the camera pushes in (parallax) */
    .ak-tv-room {
      position: absolute; inset: -6%; pointer-events: none;
      transform-origin: 50% 50%; will-change: transform;
      background-image:
        linear-gradient(var(--white-a04) 1px, transparent 1px),
        linear-gradient(90deg, var(--white-a04) 1px, transparent 1px);
      background-size: 44px 44px;
      mask-image: radial-gradient(ellipse 66% 66% at 50% 50%, #000 40%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 66% 66% at 50% 50%, #000 40%, transparent 100%);
    }

    /* the camera moves the set: transform = translate + scale from JS */
    .ak-tv-set {
      position: relative; flex: none;
      width: min(86vw, 540px); aspect-ratio: 670 / 515;
      transform-origin: 0 0;
    }
    .ak-tv-img {
      position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2;
      user-select: none; -webkit-user-drag: none;
      filter: grayscale(1) contrast(1.02);   /* until the baked copy is ready */
    }
    .ak-tv-img.is-baked { filter: none; }
    /* depth of field: a pre-blurred twin cross-faded in as the glass nears */
    .ak-tv-img--soft { opacity: 0; }
    /* dark tube behind the glass: the cut-out in tv.png is translucent and a
       little wider than .ak-tv-screen, so without this the room (white in the
       light theme) shows through its rim — and the camera magnifies it */
    .ak-tv-backing {
      position: absolute; z-index: 1; pointer-events: none;
      left: 5%; top: 10.6%; width: 71.6%; height: 72%;
      border-radius: 9% / 11%; background: var(--black);
    }
    .ak-tv-spill {
      position: absolute; z-index: 0; pointer-events: none;
      left: -45%; right: -45%; top: -55%; bottom: -55%;
      background: radial-gradient(ellipse 44% 44% at 43% 47%, var(--ak-tv-light), transparent 70%);
      opacity: 0;
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
    .ak-tv-content { display: grid; place-items: center; opacity: 0; }

    /* Header logo (monogram + syneTra wordmark). Sized in em so the copy
       inside the screen world is an exact scaled twin of this one. */
    /* phosphor glow via text/box-shadow, not filter: drop-shadow — a filter
       would be recomputed on every frame the camera scales the logo */
    .ak-tv-logo {
      display: flex; align-items: center; gap: .58em;
      font-size: clamp(15px, 4.6vw, 24px);
      animation: ak-tv-flicker 1.7s steps(24, end) infinite;
      text-shadow: 0 0 .45em rgba(255,255,255,.42);
    }
    .ak-tv-mark {
      font-size: 1.25em; width: 2.08em; height: 2.08em; flex: none;
      display: grid; place-items: center;
      border: max(1px, .034em) solid var(--gray-300); border-radius: .4em;
      font-family: var(--font-display); font-weight: 600; letter-spacing: -0.04em;
      color: var(--gray-100);
      box-shadow: inset 0 .034em 0 rgba(255,255,255,.12), 0 0 .4em rgba(255,255,255,.2), inset 0 0 .3em rgba(255,255,255,.1);
    }
    .ak-tv-word {
      font-family: var(--font-display); letter-spacing: -0.01em; white-space: nowrap;
      color: var(--gray-400);
    }
    .ak-tv-word b { color: var(--gray-100); font-weight: 600; }

    /* CRT scanlines — one 4px tile, so the world inside can match it at any scale */
    .ak-tv-scanlines {
      background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.42) 75%);
      background-size: 100% 4px;
      opacity: 0;
    }
    /* grayscale static / noise */
    .ak-tv-static, .ak-in-static, .ak-tv-screen > .ak-tv-tear {
      background-image: ${AK_NOISE};
    }
    .ak-tv-static { opacity: 0; }   /* a fresh frame of snow every field — see render() */
    /* a soft brighter band rolling down the tube */
    .ak-tv-screen > .ak-tv-roll {
      bottom: auto; height: 34%; opacity: 0;
      background: linear-gradient(to bottom, transparent, rgba(228,228,228,.05) 40%,
        rgba(228,228,228,.09) 50%, rgba(228,228,228,.05) 60%, transparent);
      animation: ak-tv-rollbar 3.4s linear infinite;
    }
    /* signal tearing during the short circuit */
    .ak-tv-screen > .ak-tv-tear {
      bottom: auto; height: 5%; opacity: 0;
      background-color: rgba(228,228,228,.22); background-blend-mode: soft-light;
      box-shadow: 0 -1px 0 rgba(255,255,255,.55);
    }
    /* electric arcs crawling over the glass */
    .ak-tv-screen > .ak-tv-arcs {
      width: 100%; height: 100%; overflow: visible;
      filter: drop-shadow(0 0 2px rgba(255,255,255,.95)) drop-shadow(0 0 10px rgba(255,255,255,.55));
    }
    .ak-tv-arcs path {
      fill: none; stroke: #f6f6f6; opacity: 0;
      stroke-linecap: round; stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }
    .ak-tv-flash { background: var(--gray-100); opacity: 0; }

    /* power-ON bright fill: horizontal line → full screen → fades to content */
    .ak-tv-on {
      transform-origin: 50% 50%; opacity: 0;
      background: var(--gray-100);
      box-shadow: 0 0 40px 8px rgba(228,228,228,.6);
    }
    /* power-OFF: bright flash → collapse to line → collapse to point → gone */
    .ak-tv-off {
      transform-origin: 50% 50%; opacity: 0;
      background: var(--gray-100);
      box-shadow: 0 0 46px 10px rgba(228,228,228,.7);
    }
    /* the phosphor dot that lingers after the collapse */
    .ak-tv-screen > .ak-tv-dot {
      inset: auto; left: 50%; top: 50%; width: 10px; height: 10px;
      border-radius: 50%; opacity: 0;
      background: var(--gray-100);
      box-shadow: 0 0 14px 5px rgba(228,228,228,.8);
    }

    /* ── Sparks: procedural embers (paths + parabolic motion generated in JS) ── */
    .ak-tv-defs { position: absolute; width: 0; height: 0; overflow: hidden; }
    /* back layer: embers crack at the TOP of the corpus, behind it, the same
       spot the smoke then rises from; front layer: the control panel shorts */
    .ak-tv-spark-layer { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    .ak-tv-spark-layer--front { z-index: 4; }
    .ak-tv-spark {
      position: absolute;              /* per-ember left/top set inline */
      transform-origin: 0 0; opacity: 0; will-change: transform, opacity;
    }
    .ak-tv-spark svg { position: absolute; left: 0; top: 0; overflow: visible; display: block; }
    .ak-tv-spark path {
      fill: none; stroke: var(--ak-tv-spark);
      stroke-linecap: round; stroke-linejoin: round;
      filter: url(#ak-spark-glow);
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

    /* ── Inside the screen: full-viewport world, clipped to the glass on the way out ── */
    .ak-tv-inside {
      position: absolute; inset: 0; z-index: 2; overflow: hidden;
      background: var(--black); visibility: hidden; opacity: 0; will-change: opacity;
    }
    .ak-tv-inside > * { position: absolute; inset: 0; pointer-events: none; }
    .ak-tv-inside canvas { width: 100%; height: 100%; display: block; }
    .ak-in-stage { transform-origin: 50% 50%; }
    .ak-in-beat {
      position: absolute; inset: 0; padding: 0 6vw;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: clamp(14px, 2.4vw, 26px); text-align: center; opacity: 0;
    }
    .ak-in-kick {
      font-family: var(--font-mono); font-size: clamp(10px, 1.1vw, 13px);
      letter-spacing: .28em; color: var(--gray-500); white-space: nowrap;
    }
    .ak-in-head {
      margin: 0; font-family: var(--font-display); font-weight: 600;
      font-size: clamp(34px, 6.4vw, 96px); line-height: 1.04; letter-spacing: -0.035em;
      color: var(--gray-200);
    }
    .ak-in-line { display: block; white-space: nowrap; }
    /* words / items / the lockup blur in: own layers, so the blur is composited */
    .ak-in-w, .ak-in-item, .ak-in-pop { will-change: opacity, filter; }
    .ak-in-w { display: inline-block; }
    .ak-in-hot { color: #fff; text-shadow: 0 0 .32em rgba(255,255,255,.34); }
    .ak-in-roll {
      position: relative; width: 100%; height: 1.2em;
      font-family: var(--font-display); font-weight: 600;
      font-size: clamp(26px, 6vw, 88px); letter-spacing: -0.035em; color: var(--gray-100);
    }
    .ak-in-item { position: absolute; left: 0; right: 0; top: 0; line-height: 1.2; white-space: nowrap; opacity: 0; }
    .ak-in-stack {
      font-family: var(--font-mono); font-size: clamp(11px, 1.3vw, 15px);
      letter-spacing: .22em; color: var(--gray-400); white-space: nowrap; opacity: 0;
    }
    .ak-in-b3 { --lk: clamp(30px, 10vw, 84px); }
    .ak-in-lock { position: relative; transform-origin: 50% 50%; }
    .ak-tv-logo.ak-in-logo { font-size: var(--lk); animation: none; }
    .ak-in-sign {
      position: absolute; left: 0; right: 0;
      top: calc(50% + 1.3 * var(--lk) + clamp(18px, 3.2vh, 36px));
      display: flex; flex-direction: column; align-items: center; gap: 10px;
    }
    .ak-in-name {
      font-family: var(--font-display); font-weight: 500;
      font-size: clamp(17px, 2.3vw, 30px); letter-spacing: -0.01em; color: var(--gray-200); opacity: 0;
    }
    .ak-in-role {
      font-family: var(--font-mono); font-size: clamp(10px, 1.1vw, 13px);
      letter-spacing: .24em; text-transform: uppercase; color: var(--gray-500);
      white-space: nowrap; opacity: 0;
    }
    /* live snow like the tube's (render()); its own layer, so a new field
       never repaints the copy under it */
    .ak-in-static { opacity: .06; background-size: 256px 128px; will-change: transform; }
    .ak-in-fine {
      background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.34) 75%);
      background-size: 100% 3px; opacity: 0;
    }
    /* the glass's own scanlines on the way out: sized to the screen box and
       moved with a transform (JS), so the camera move never repaints them */
    .ak-tv-inside > .ak-in-crt {
      right: auto; bottom: auto; transform-origin: 0 0; will-change: transform;
      background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.42) 75%);
      background-size: 100% 4px; opacity: 0;
    }
    .ak-in-vig { background: radial-gradient(ellipse 80% 76% at 50% 50%, transparent 55%, rgba(0,0,0,.62) 100%); }

    /* ── Lens: vignette that tightens with camera speed + the glass-crossing bloom ── */
    .ak-tv-lens {
      position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: 0; will-change: opacity;
      background: radial-gradient(ellipse 72% 68% at 50% 50%, transparent 48%, rgba(0,0,0,.62) 100%);
    }
    /* drawn small and scaled up on the compositor (a soft gradient loses nothing) */
    .ak-tv-bloom {
      position: absolute; left: 50%; top: 50%; z-index: 4; pointer-events: none;
      width: 40vmax; height: 40vmax; margin: -20vmax 0 0 -20vmax;
      border-radius: 50%; opacity: 0; will-change: transform, opacity;
      background: radial-gradient(circle, rgba(236,236,236,.95) 0%, rgba(236,236,236,.42) 20%,
        rgba(236,236,236,.1) 42%, transparent 66%);
    }

    .ak-tv-hint {
      position: absolute; left: 0; right: 0; bottom: 7%; z-index: 5;
      text-align: center; pointer-events: none;
      font-family: var(--font-mono); font-size: 11px; letter-spacing: .28em;
      text-transform: uppercase; color: var(--gray-600);
      opacity: 0; animation: ak-tv-hint 3.2s ease-in-out .9s both;
    }

    @keyframes ak-tv-flicker {
      0%, 100% { opacity: 1; }
      5%  { opacity: 0.55; } 7%  { opacity: 1; }
      41% { opacity: 0.82; } 43% { opacity: 1; }
      68% { opacity: 0.45; } 70% { opacity: 1; }
      88% { opacity: 0.9; }
    }
    @keyframes ak-tv-rollbar { 0% { transform: translateY(-100%); } 100% { transform: translateY(300%); } }
    /* (the film itself is one GSAP timeline; sparks + smoke use the Web Animations API) */
    @keyframes ak-tv-hint {
      0% { opacity: 0; } 25% { opacity: 1; } 78% { opacity: 1; } 100% { opacity: 0; }
    }

    /* no reduced-motion opt-out: the film only ever plays when asked for */
  `;
  document.head.appendChild(s);
}

/* ── The film's clock (seconds). Everything is placed on one timeline. ── */
const AK_T = {
  on: 0.3,          // power-on line → full-screen flash
  logo: 0.8,        // logo + static fade in
  dolly: 1.45,      // the camera starts pushing in …
  glitch: 2.7,      // … the logo breaks up into signal on the way …
  fill: 3.7,        // … the screen fills the frame …
  plunge: 3.72,     // … and the camera dives through the glass
  b1: 4.45, b2: 6.3, b3: 8.2,          // the reel: three beats
  exit: 10.0,       // the camera backs out of the screen
  back: 11.9,       // the set is back at rest
  faults: [12.25, 12.65, 13.05],       // short-circuit pops
  off: 13.2,        // final collapse
  end: 14.7,        // overlay gone → onFinish
};
// The screen cut-out inside tv.png, as fractions of the set box.
const AK_SCR = { l: 0.064, t: 0.104, w: 0.668, h: 0.694 };
// Camera depth on a log scale: 0 = at rest, 1 = the screen just fills the
// frame, AK_P_IN = through the glass, AK_P0 = where the pull-back starts.
const AK_P_IN = 1.6, AK_P0 = 1.15;

// The reel inside the screen.
const AK_REEL = {
  b1: { kick: '// backend engineering', lines: [['I', 'build', 'systems'], ['that', 'move', 'money.']] },
  b2: {
    kick: '// shipped to production',
    items: ['Payment platforms', 'Banking integrations', 'AI-driven services'],
    stack: 'PHP · Laravel · Python',
  },
  b3: { name: 'Abdurohman Karim', role: 'Backend Developer · Fintech & AI' },
};

/* ── Procedural spark + smoke generators — a fresh set every play/reload ──
   Motion is driven by the Web Animations API so each particle gets its own
   randomised keyframes (path, arc, duration, delay) with no repeating sprite. */
const akRand = (a, b) => a + Math.random() * (b - a);
const akLerp = (a, b, t) => a + (b - a) * t;
const akClamp = (v, a, b) => Math.min(b, Math.max(a, v));
const akSmooth = (a, b, v) => { const t = akClamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// Where embers launch from (percent of the set box) and how hard they fly.
const AK_SPARK_ZONES = {
  top:   { l: [36, 58], t: [7, 17],  vx: [-150, 150], vy: [150, 275] },   // behind the top of the corpus
  panel: { l: [80, 94], t: [10, 34], vx: [-60, 230],  vy: [110, 240] },   // the control panel, in front
};
// One burst per short-circuit pop: [zone, how many].
const AK_BURSTS = [
  [['panel', 6]],
  [['top', 7], ['panel', 3]],
  [['top', 11], ['panel', 4]],
];

// One ember: a jagged lightning-scratch polyline + a launch vector under gravity.
function akMakeSpark(zone, burst) {
  const z = AK_SPARK_ZONES[zone];
  const len = akRand(12, 30);
  const segs = 3 + Math.floor(akRand(0, 3));            // 3–5 kinks
  const step = len / segs;
  let d = 'M0 0';
  for (let i = 1; i <= segs; i++) {
    d += ' L' + (i * step).toFixed(1) + ' ' + akRand(-4, 4).toFixed(1);
  }
  return {
    d, len, zone, burst,
    left: akRand(z.l[0], z.l[1]), top: akRand(z.t[0], z.t[1]),
    ox: akRand(-16, 16), oy: akRand(-10, 10),            // small scatter around that point
    vx: akRand(z.vx[0], z.vx[1]),                        // horizontal velocity
    vy: -akRand(z.vy[0], z.vy[1]),                       // upward velocity
    g:  akRand(280, 410),                                // gravity → parabolic arc
    dur: akRand(520, 980), delay: akRand(0, 140),        // delay is relative to its pop
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
// group 0 = thin wisps after the second pop, group 1 = the plume after the collapse.
function akMakeSmoke(filters, group) {
  const f = filters[Math.floor(Math.random() * filters.length)];
  return {
    filterId: f.id, group,
    left: akRand(36, 58), top: akRand(7, 17),
    size: group ? akRand(58, 130) : akRand(40, 70),
    rise: -akRand(150, 300),                             // final upward travel
    swayA: akRand(-40, 40), swayB: akRand(-30, 30),      // horizontal wander
    sx0: akRand(0.42, 0.7), sxe: akRand(1.3, 2.0),       // widens more than it grows tall
    sy0: akRand(0.5, 0.72), sye: akRand(1.05, 1.6),
    blur0: akRand(2, 5), blure: akRand(13, 24),          // loses sharpness while rising
    peak: group ? akRand(0.24, 0.42) : akRand(0.12, 0.2),
    dur: akRand(1700, 2600), delay: akRand(0, 450),      // delay is relative to its trigger
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

/* ── Electric arcs: midpoint-displacement lightning in the screen's 0–100 box ── */
function akBolt(x1, y1, x2, y2, rough, depth) {
  let pts = [[x1, y1], [x2, y2]];
  let off = rough;
  for (let d = 0; d < depth; d++) {
    const next = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
      const o = akRand(-off, off);
      next.push([(ax + bx) / 2 - (dy / len) * o, (ay + by) / 2 + (dx / len) * o], pts[i]);
    }
    pts = next;
    off *= 0.55;
  }
  return pts;
}
const akPath = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
// A bolt between two different edges of the glass, plus one forked branch.
function akArcPaths() {
  const edge = () => {
    const s = Math.floor(Math.random() * 4), k = akRand(8, 92);
    return [[k, 1], [99, k], [k, 99], [1, k]][s].concat(s);
  };
  const a = edge();
  let b = edge();
  while (b[2] === a[2]) b = edge();
  const main = akBolt(a[0], a[1], b[0], b[1], 16, 5);
  const [fx, fy] = main[2 + Math.floor(Math.random() * (main.length - 4))];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + akRand(-1.1, 1.1);
  const L = akRand(14, 30);
  return [akPath(main), akPath(akBolt(fx, fy, fx + Math.cos(ang) * L, fy + Math.sin(ang) * L, 6, 3))];
}

/* ── The world inside the screen: a corridor of receding screen outlines and
   star streaks, drawn on one canvas. Depth runs from the near plane AK_ZN to
   the far plane AK_ZF; `v` is the camera speed through it (negative = backing
   out), `zoom` + `cx/cy` shrink the whole world onto the glass on the way out. */
const AK_ZN = 0.18, AK_ZF = 3.4;
function akSpawnStar(s, z) {
  do { s.x = akRand(-1.7, 1.7); s.y = akRand(-1.25, 1.25); } while (Math.abs(s.x) < 0.14 && Math.abs(s.y) < 0.14);
  s.z = z; s.w = akRand(0.5, 1.3); s.b = akRand(0.3, 0.9); s.f = 0;
  return s;
}
function akMakeWarp() {
  const span = AK_ZF - AK_ZN;
  return {
    stars: Array.from({ length: 200 }, () => Object.assign(akSpawnStar({}, akRand(AK_ZN, AK_ZF)), { f: 1 })),
    frames: Array.from({ length: 8 }, (_, i) => ({ z: AK_ZN + ((i + 0.5) * span) / 8 })),
    v: 0, a: 0, zoom: 1, cx: 0, cy: 0,
  };
}
function akDrawWarp(ctx, cv, w, dpr, dt) {
  const CW = cv.width, CH = cv.height, span = AK_ZF - AK_ZN;
  ctx.clearRect(0, 0, CW, CH);
  if (w.a <= 0.01) return;
  const cx = w.cx * dpr, cy = w.cy * dpr;
  const F = 0.32 * Math.min(CW, CH) * w.zoom;
  const dz = w.v * dt, zk = Math.min(1, w.zoom * 1.4);

  // faint light at the vanishing point (filled over its own box only)
  const R = F * 1.6;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  glow.addColorStop(0, `rgba(228,228,228,${(0.08 * w.a).toFixed(3)})`);
  glow.addColorStop(1, 'rgba(228,228,228,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);

  // corridor of screen outlines (same 1.25 aspect + corner radii as the glass)
  ctx.lineWidth = Math.max(0.6, dpr * zk);
  for (const f of w.frames) {
    f.z -= dz;
    if (f.z < AK_ZN) f.z += span; else if (f.z > AK_ZF) f.z -= span;
    const al = 0.3 * w.a * akClamp((AK_ZF - f.z) / 1.4, 0, 1) * akClamp((f.z - AK_ZN) / 0.3, 0, 1);
    if (al < 0.004) continue;
    const hx = F / f.z, hy = (0.8 * F) / f.z;
    ctx.strokeStyle = `rgba(228,228,228,${al.toFixed(3)})`;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cx - hx, cy - hy, 2 * hx, 2 * hy, [{ x: 0.16 * hx, y: 0.2 * hy }]);
    else ctx.rect(cx - hx, cy - hy, 2 * hx, 2 * hy);
    ctx.stroke();
  }

  // star streaks: tail length follows the speed, so a stop reads as dots
  ctx.lineCap = 'round';
  for (const s of w.stars) {
    s.z -= dz;
    if (s.z < AK_ZN) akSpawnStar(s, AK_ZF - Math.random() * 0.3);
    else if (s.z > AK_ZF) akSpawnStar(s, AK_ZN + Math.random() * 0.3);
    s.f = Math.min(1, s.f + dt * 3);                      // fade in after a respawn
    const al = s.b * s.f * w.a * akClamp((AK_ZF - s.z) / 1.4, 0, 1);
    if (al < 0.01) continue;
    const tz = akClamp(s.z + w.v * 0.05, AK_ZN * 0.8, AK_ZF);
    ctx.strokeStyle = `rgba(236,236,236,${al.toFixed(3)})`;
    ctx.lineWidth = Math.max(0.5, s.w * dpr * (0.6 + 1.2 * (1 - s.z / AK_ZF)) * zk);
    ctx.beginPath();
    ctx.moveTo(cx + (s.x / tz) * F, cy + (s.y / tz) * F);
    ctx.lineTo(cx + (s.x / s.z) * F + 0.01, cy + (s.y / s.z) * F);
    ctx.stroke();
  }
}

/* ── tv.png, baked once while the page is idle ──
   Grayscale + contrast (what the CSS filter redid on every repaint of the
   scaled set) and a blurred twin for the depth of field, which is then just
   cross-faded instead of re-filtering the bezel on every frame. */
const akTvBake = { sharp: null, soft: null };

// Separable box blur, one pass per radius (three ≈ a Gaussian), on
// premultiplied alpha so the translucent glass and the edges don't halo.
function akBlur(d, w, h, radii) {
  const p = d.data, n = w * h;
  const buf = new Float32Array(n * 4), tmp = new Float32Array(n * 4);
  for (let i = 0; i < n * 4; i += 4) {
    const a = p[i + 3] / 255;
    buf[i] = p[i] * a; buf[i + 1] = p[i + 1] * a; buf[i + 2] = p[i + 2] * a; buf[i + 3] = p[i + 3];
  }
  const pass = (src, dst, r, horiz) => {
    const len = horiz ? w : h, lines = horiz ? h : w, step = horiz ? 4 : w * 4, k = 1 / (2 * r + 1);
    for (let l = 0; l < lines; l++) {
      const base = horiz ? l * w * 4 : l * 4;
      for (let ch = 0; ch < 4; ch++) {
        let acc = 0;
        for (let j = -r; j <= r; j++) acc += src[base + akClamp(j, 0, len - 1) * step + ch];
        for (let i = 0; i < len; i++) {
          dst[base + i * step + ch] = acc * k;
          acc += src[base + Math.min(len - 1, i + r + 1) * step + ch] - src[base + Math.max(0, i - r) * step + ch];
        }
      }
    }
  };
  radii.forEach((r) => { pass(buf, tmp, r, true); pass(tmp, buf, r, false); });
  for (let i = 0; i < n * 4; i += 4) {
    const a = buf[i + 3], m = a > 0 ? 255 / a : 0;
    p[i] = buf[i] * m; p[i + 1] = buf[i + 1] * m; p[i + 2] = buf[i + 2] * m; p[i + 3] = a;
  }
}
function akBakeTv() {
  const img = new Image();
  img.src = '/assets/tv.png';
  img.decode().then(() => {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, w, h), p = d.data;
    for (let i = 0; i < p.length; i += 4) {        // grayscale(1) contrast(1.02); the array clamps
      p[i] = p[i + 1] = p[i + 2] = (0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2] - 127.5) * 1.02 + 127.5;
    }
    const url = () => new Promise((res) => { x.putImageData(d, 0, 0); c.toBlob((b) => res(b && URL.createObjectURL(b))); });
    return url().then((sharp) => {
      akBlur(d, w, h, [2, 1, 1]);                    // ≈ σ 1.8 source px; the camera scale grows it
      return url().then((soft) => { akTvBake.sharp = sharp; akTvBake.soft = soft; });
    });
  }).catch(() => {});                              // fall back to the CSS filter, no depth of field
}
if (typeof window !== 'undefined') (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(akBakeTv);

/* ── Audio ───────────────────────────────────────────────────────────────────
   One clip, played as cues along the film. Each cue is
   [when on the timeline (s), where in the clip (s), how long (s)].
   The current tv-intro.mp3 (2.8 s) is cut in two: its power-on thump + hum
   opens the film, its crackle comes back for the short circuit. Mix a new
   clip to the full film (see AK_T) and set cues to [[0, 0, AK_T.end]].
   Optional: a missing file just stays silent (no errors).

   Path is absolute (leading "/") so it resolves on every route, including
   /interests. The file lives at  assets/audio/tv-intro.mp3 .

   NOTE: browsers block autoplay until the user interacts with the page. Played
   from the "Get in touch" click the sound is allowed; with ?intro on a hard
   reload it may be muted by the autoplay policy — expected, not an error. */
const AK_TV_AUDIO = {
  src: '/assets/audio/tv-intro.mp3',
  volume: 0.7,
  cues: [
    [0, 0, 1.8],                          // power-on thump + tube hum
    [AK_T.faults[0] - 0.1, 2.05, 0.77],   // the crackle, re-used for the short circuit
  ],
};

// Header logo — used on the screen and (scaled) as the reel's closing lockup.
const AkLogo = ({ className }) => (
  <div className={'ak-tv-logo' + (className ? ' ' + className : '')}>
    <span className="ak-tv-mark">sY</span>
    <span className="ak-tv-word"><b>sy</b>ne<b>T</b>ra</span>
  </div>
);

function IntroTV({ onFinish }) {
  const [skipping, setSkipping] = React.useState(false);
  const rootRef = React.useRef(null);
  const doneRef = React.useRef(false);
  const tlRef = React.useRef(null);
  const stopAudioRef = React.useRef(null);   // stops every scheduled sound at once

  const finish = React.useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onFinish && onFinish();
  }, [onFinish]);
  const finishRef = React.useRef(finish);
  finishRef.current = finish;

  const skip = React.useCallback(() => {
    if (doneRef.current || skipping) return;
    setSkipping(true);
    if (tlRef.current) tlRef.current.pause();
    if (stopAudioRef.current) stopAudioRef.current();   // cut sound on skip
    setTimeout(finish, 260);          // let the fast fade play, then release
  }, [finish, skipping]);

  React.useEffect(() => {
    document.documentElement.classList.add('ak-intro-lock');
    document.body.classList.add('ak-intro-lock');
    const onKey = () => skip();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('ak-intro-lock');
      document.body.classList.remove('ak-intro-lock');
    };
  }, [skip]);

  // Turbulence filters — random seed/frequency per load ⇒ different smoke each visit
  const filters = React.useMemo(() => [0, 1, 2].map((k) => ({
    id: 'ak-smoke-t' + k,
    seed: Math.floor(Math.random() * 1000),
    bf: (0.010 + Math.random() * 0.012).toFixed(4) + ' ' + (0.016 + Math.random() * 0.02).toFixed(4),
    scale: 26 + Math.floor(Math.random() * 22),
  })), []);

  // Fresh particle sets, generated once per mount (i.e. once per play)
  const sparks = React.useMemo(() => AK_BURSTS.flatMap((burst, b) =>
    burst.flatMap(([zone, n]) => Array.from({ length: n }, () => akMakeSpark(zone, b)))), []);
  const puffs = React.useMemo(() => [
    ...Array.from({ length: 2 }, () => akMakeSmoke(filters, 0)),
    ...Array.from({ length: 5 + Math.floor(Math.random() * 3) }, () => akMakeSmoke(filters, 1)), // 5–7
  ], [filters]);

  /* ── The film: camera rig + one GSAP timeline ── */
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !window.gsap) { finishRef.current(); return undefined; }   // never trap the visitor
    const q = (s) => root.querySelector(s);
    const qa = (s) => Array.from(root.querySelectorAll(s));
    const el = {
      world: q('.ak-tv-world'), room: q('.ak-tv-room'), set: q('.ak-tv-set'), img: q('.ak-tv-img'),
      soft: q('.ak-tv-img--soft'), backing: q('.ak-tv-backing'),
      spill: q('.ak-tv-spill'), content: q('.ak-tv-content'), logo: q('.ak-tv-screen .ak-tv-logo'),
      scan: q('.ak-tv-scanlines'), stat: q('.ak-tv-static'), roll: q('.ak-tv-roll'),
      tears: qa('.ak-tv-tear'), arcs: qa('.ak-tv-arcs path'), flash: q('.ak-tv-flash'),
      on: q('.ak-tv-on'), off: q('.ak-tv-off'), dot: q('.ak-tv-dot'),
      inside: q('.ak-tv-inside'), canvas: q('.ak-tv-inside canvas'), stage: q('.ak-in-stage'),
      beats: qa('.ak-in-beat'), words: qa('.ak-in-b1 .ak-in-w'), items: qa('.ak-in-item'),
      stack: q('.ak-in-stack'), lock: q('.ak-in-lock'), pop: q('.ak-in-pop'),
      inLogo: q('.ak-in-logo'), inWord: q('.ak-in-logo .ak-tv-word'),
      name: q('.ak-in-name'), role: q('.ak-in-role'),
      inStat: q('.ak-in-static'), fine: q('.ak-in-fine'), crt: q('.ak-in-crt'), vig: q('.ak-in-vig'),
      lens: q('.ak-tv-lens'), bloom: q('.ak-tv-bloom'),
    };
    const sparkEls = [], puffEls = [];
    qa('.ak-tv-spark').forEach((n) => { sparkEls[+n.dataset.i] = n; });
    qa('.ak-tv-smoke').forEach((n) => { puffEls[+n.dataset.i] = n; });
    const ctx = el.canvas.getContext('2d');

    const cam = { p: -0.06, roll: -0.9, sx: 0, sy: 0 };   // p: depth on a log scale (see AK_P_IN)
    const warp = akMakeWarp();
    const st = { mode: 0, rEnd: null, lens: 0, lastP: cam.p, snowT: 0, snow: 0 };   // mode: 0 off, 1 inside, 2 on the glass
    const geo = { vw: 0, vh: 0, W: 0, H: 0, Kf: 4, dpr: 1 };
    const anims = [];
    // write a style only when it changed — most frames most layers hold still
    const last = new Map();
    const put = (node, prop, v) => {
      const m = last.get(node) || last.set(node, {}).get(node);
      if (m[prop] !== v) { m[prop] = v; node.style[prop] = v; }
    };

    const measure = () => {
      geo.vw = root.clientWidth; geo.vh = root.clientHeight;
      geo.W = el.set.offsetWidth; geo.H = el.set.offsetHeight;
      // camera scale at which the screen (rounded corners included) covers the frame
      geo.Kf = Math.max(geo.vw / (geo.W * AK_SCR.w), geo.vh / (geo.H * AK_SCR.h)) * 1.12;
      // the streaks are soft and moving: 1.5× density looks the same as 2× for half the fill
      geo.dpr = Math.min(1.5, window.devicePixelRatio || 1);
      el.canvas.width = Math.round(geo.vw * geo.dpr);
      el.canvas.height = Math.round(geo.vh * geo.dpr);
      el.crt.style.width = AK_SCR.w * geo.W + 'px';
      el.crt.style.height = AK_SCR.h * geo.H + 'px';
      st.rEnd = null;
    };

    /* One frame of the camera. The set is scaled by K = Kf^p about a look-at
       point that glides from the set's centre to the screen's centre, so the
       camera aims at the glass while it pushes in. */
    const render = (time, dtMs) => {
      const dt = Math.min(0.05, (dtMs || 16) / 1000);
      const { vw, vh, W, H, Kf } = geo;
      const K = Math.pow(Kf, cam.p);
      const u = 1 - Math.pow(1 - akClamp(cam.p, 0, 1), 3);
      const Lx = akLerp(W / 2, (AK_SCR.l + AK_SCR.w / 2) * W, u);
      const Ly = akLerp(H / 2, (AK_SCR.t + AK_SCR.h / 2) * H, u);
      put(el.set, 'transform', `translate(${(W / 2 - K * Lx).toFixed(2)}px, ${(H / 2 - K * Ly).toFixed(2)}px) scale(${K.toFixed(4)})`);
      put(el.world, 'transform', `translate(${cam.sx.toFixed(2)}px, ${cam.sy.toFixed(2)}px) rotate(${cam.roll.toFixed(3)}deg)`);
      put(el.room, 'transform', `scale(${Math.pow(K, 0.3).toFixed(4)})`);
      // static grain grows only gently with the camera (a bitmap blown up K×
      // turns into blobs); a new tile size is just a re-tiled image, no filter
      // (grains twice as wide as tall: the beam smears noise along the line)
      const g = 128 / Math.pow(Math.max(1, K), 0.6);
      put(el.stat, 'backgroundSize', `${(2 * g).toFixed(1)}px ${g.toFixed(1)}px`);
      // live snow: a different tile at a random offset each field (~60/s)
      st.snowT += dt;
      if (st.snowT >= 0.0155) {
        st.snowT = 0;
        st.snow = (st.snow + 1 + ((Math.random() * (AK_NOISES.length - 1)) | 0)) % AK_NOISES.length;
        const field = (n) => {
          n.style.backgroundImage = AK_NOISES[st.snow];
          n.style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 128) | 0}px`;
        };
        if (parseFloat(el.stat.style.opacity) > 0) field(el.stat);
        if (st.mode) field(el.inStat);
      }
      // lens vignette tightens with camera speed (a jump between shots is a cut, not speed)
      const dp = Math.abs(cam.p - st.lastP);
      const speed = dp > 0.2 ? 0 : dp / dt;
      st.lastP = cam.p;
      st.lens += (akClamp(speed * 0.55, 0, 0.9) - st.lens) * Math.min(1, dt * 7);
      put(el.lens, 'opacity', st.lens.toFixed(2));

      if (st.mode === 2) {
        // backing out: the world inside is clipped to the glass and shrinks with it
        const sw = K * AK_SCR.w * W, sh = K * AK_SCR.h * H;
        const x0 = vw / 2 + K * (AK_SCR.l * W - Lx), y0 = vh / 2 + K * (AK_SCR.t * H - Ly);
        el.inside.style.clipPath = `inset(${y0.toFixed(1)}px ${(vw - x0 - sw).toFixed(1)}px ${(vh - y0 - sh).toFixed(1)}px ${x0.toFixed(1)}px round ${(0.08 * sw).toFixed(1)}px / ${(0.1 * sh).toFixed(1)}px)`;
        const sz = K / Math.pow(Kf, AK_P0);
        warp.cx = x0 + sw / 2; warp.cy = y0 + sh / 2; warp.zoom = sz;
        el.stage.style.transform = `translate(${(warp.cx - vw / 2).toFixed(1)}px, ${(warp.cy - vh / 2).toFixed(1)}px) scale(${sz.toFixed(4)})`;
        // the lockup eases to the exact size of the logo on the screen below,
        // so the hand-over at rest is invisible
        if (st.rEnd == null) st.rEnd = (el.logo.offsetWidth * Math.pow(Kf, AK_P0)) / Math.max(1, el.inLogo.offsetWidth);
        const prog = 1 - akClamp(cam.p / AK_P0, 0, 1);
        el.lock.style.transform = `scale(${Math.pow(st.rEnd, prog).toFixed(4)})`;
        el.crt.style.transform = `translate(${x0.toFixed(1)}px, ${y0.toFixed(1)}px) scale(${K.toFixed(4)})`;
      }
      if (st.mode) akDrawWarp(ctx, el.canvas, warp, geo.dpr, dt);
    };

    measure();
    render(0, 16);
    /* Warm-up while the screen is still dark: decode the set's images, give
       the canvas its backing store, and let the world inside get rasterised
       (it's composited at opacity 0) — otherwise all of that lands on the
       first frames of the dive through the glass. */
    [el.img, el.soft].forEach((n) => { if (n && n.decode) n.decode().catch(() => {}); });
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1, 1);
    el.inside.style.visibility = 'visible';
    gsap.ticker.add(render);
    window.addEventListener('resize', measure);

    /* ── helpers ── */
    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;
    const ft = (t, a, b, at) => tl.fromTo(t, a, Object.assign({ immediateRender: false }, b), at);
    const toInside = () => {
      st.mode = 1;
      el.inside.style.clipPath = 'none';
      el.stage.style.transform = '';
      warp.cx = geo.vw / 2; warp.cy = geo.vh / 2; warp.zoom = 1;
    };
    // camera pushes through a beat: the copy flies past, the corridor surges
    const push = (beat, at) => {
      tl.to(beat, { opacity: 0, scale: 1.45, filter: 'blur(14px)', duration: 0.5, ease: 'power2.in' }, at)
        .to(warp, { v: 2.4, duration: 0.4, ease: 'power2.in' }, at)
        .to(warp, { v: 0.28, duration: 1.0, ease: 'power3.out' }, at + 0.4);
    };
    // no blur on the beat itself: its words / items blur in on their own, and a
    // filter wrapped around filters is the costliest thing a browser can draw
    const beatIn = (beat, at) => ft(beat, { opacity: 0, scale: 0.84 },
      { opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out' }, at);
    const scramble = (node, at, d) => tl.call(() => window.akMotion && window.akMotion.scramble(node, d), null, at);
    const pop = (t, peak) => tl.to(el.flash, { opacity: peak, duration: 0.035, ease: 'none' }, t)
      .to(el.flash, { opacity: 0, duration: 0.24, ease: 'power2.out' }, t + 0.035);
    const flare = (t, k) => tl.to(el.spill, { opacity: 1, scale: 1 + 0.25 * k, duration: 0.04 }, t)
      .to(el.spill, { opacity: 0.75, scale: 1, duration: 0.4, ease: 'power2.out' }, t + 0.04);
    const jitter = (t, a) => tl.to(el.content, { keyframes: [
      { x: akRand(-a, a), skewX: akRand(-a, a) * 1.4, duration: 0.04 },
      { x: akRand(-a, a), skewX: akRand(-a, a), duration: 0.04 },
      { x: 0, skewX: 0, duration: 0.07 },
    ], ease: 'none' }, t);
    const tear = (t, n) => el.tears.slice(0, n).forEach((b) => {
      tl.set(b, { top: akRand(4, 86) + '%', height: akRand(2, 9) + '%', x: akRand(-14, 14), opacity: akRand(0.5, 0.9) }, t + akRand(0, 0.05))
        .set(b, { top: akRand(4, 86) + '%', x: akRand(-20, 20) }, t + akRand(0.07, 0.12))
        .set(b, { opacity: 0 }, t + akRand(0.16, 0.26));
    });
    const zap = (t, bolts, steps) => {
      for (let i = 0; i < steps; i++) {
        tl.call(() => {
          for (let b = 0; b < 2; b++) {
            const lit = b < bolts && Math.random() > 0.12;
            const [m, br] = lit ? akArcPaths() : ['', ''];
            const o = lit ? akRand(0.55, 1) : 0;
            el.arcs[b * 2].setAttribute('d', m);
            el.arcs[b * 2 + 1].setAttribute('d', br);
            el.arcs[b * 2].style.opacity = o.toFixed(2);
            el.arcs[b * 2 + 1].style.opacity = (o * 0.8).toFixed(2);
          }
        }, null, t + i * 0.045);
      }
      tl.call(() => el.arcs.forEach((p) => { p.style.opacity = 0; }), null, t + steps * 0.045);
    };
    const shake = (t, amp, n = 6) => {
      for (let i = 0; i < n; i++) {
        const a = amp * (1 - i / n);
        tl.to(cam, { sx: akRand(-a, a), sy: akRand(-a, a), duration: 0.035, ease: 'none' }, t + i * 0.035);
      }
      tl.to(cam, { sx: 0, sy: 0, duration: 0.08 }, t + n * 0.035);
    };
    const fire = (t, burst) => tl.call(() => sparks.forEach((s, i) => {
      if (s.burst === burst && sparkEls[i]) anims.push(sparkEls[i].animate(akSparkFrames(s),
        { duration: s.dur, delay: s.delay, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'both' }));
    }), null, t);
    const smoke = (t, group) => tl.call(() => puffs.forEach((p, i) => {
      if (p.group === group && puffEls[i]) anims.push(puffEls[i].animate(akSmokeFrames(p),
        { duration: p.dur, delay: p.delay, easing: 'ease-out', fill: 'both' }));
    }), null, t);

    gsap.set(el.on, { scaleY: 0.004 });
    gsap.set(el.dot, { xPercent: -50, yPercent: -50 });

    /* 1 ─ power on. The camera is never quite still: a slow creep and a
       slight dutch angle that levels out on the way in. */
    tl.to(cam, { p: 0, duration: AK_T.dolly, ease: 'sine.inOut' }, 0)
      .to(cam, { roll: 0, duration: AK_T.fill, ease: 'sine.inOut' }, 0)
      .to(el.on, { keyframes: [
        { opacity: 1, scaleY: 0.004, duration: 0.054 },
        { scaleY: 0.03, duration: 0.036 },
        { scaleY: 1, duration: 0.24, ease: 'power2.out' },
        { opacity: 0.55, duration: 0.042 },
        { opacity: 1, duration: 0.048 },
        { opacity: 0.3, duration: 0.072 },
        { opacity: 0, duration: 0.108 },
      ] }, AK_T.on)
      .to(el.spill, { opacity: 0.75, duration: 0.6, ease: 'power2.out' }, AK_T.on + 0.12)
      .to([el.content, el.scan], { opacity: 1, duration: 0.25 }, AK_T.logo)
      .to(el.stat, { opacity: 0.12, duration: 0.25 }, AK_T.logo)
      .to(el.roll, { opacity: 1, duration: 0.6 }, AK_T.logo + 0.3);

    /* 2 ─ dolly in: the logo breaks up into signal as the glass nears, the
       screen fills the frame, then the camera dives through it */
    tl.to(cam, { p: 1, duration: AK_T.fill - AK_T.dolly, ease: 'power2.inOut' }, AK_T.dolly)
      .to(el.spill, { opacity: 0, duration: 0.8 }, AK_T.dolly + 0.6)
      .to(el.content, { keyframes: [
        { x: -7, skewX: 14, duration: 0.05 },
        { x: 5, skewX: -8, duration: 0.05 },
        { x: 0, skewX: 0, duration: 0.07 },
      ], ease: 'none' }, AK_T.glitch)
      .to(el.content, { keyframes: [
        { x: 9, skewX: -18, opacity: 0.5, duration: 0.04 },
        { x: -4, skewX: 6, opacity: 1, duration: 0.05 },
        { x: 0, skewX: 0, scaleY: 0.04, scaleX: 1.25, opacity: 0, duration: 0.22, ease: 'power2.in' },
      ] }, AK_T.glitch + 0.3)
      .to(el.stat, { opacity: 0.3, duration: 0.6 }, AK_T.glitch + 0.2)
      .to(cam, { p: AK_P_IN, duration: 0.58, ease: 'power2.in' }, AK_T.plunge)
      .call(toInside, null, AK_T.plunge + 0.08)
      .to(el.inside, { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, AK_T.plunge + 0.13)
      .to(el.fine, { opacity: 1, duration: 0.5 }, AK_T.plunge + 0.13)
      .to(warp, { a: 1, duration: 0.4 }, AK_T.plunge + 0.13)
      .fromTo(warp, { v: 0.9 }, { v: 7, duration: 0.45, ease: 'power2.in', immediateRender: false }, AK_T.plunge + 0.13)
      .to(warp, { v: 0.28, duration: 1.4, ease: 'power3.out' }, AK_T.plunge + 0.58);
    // passing the glass: a soft phosphor bloom from the centre
    ft(el.bloom, { opacity: 0, scale: 0.8 }, { opacity: 0.55, scale: 3.9, duration: 0.25, ease: 'power2.in' }, AK_T.plunge + 0.3);
    tl.to(el.bloom, { opacity: 0, scale: 7.2, duration: 0.5, ease: 'power2.out' }, AK_T.plunge + 0.55)
      .set(el.set, { visibility: 'hidden' }, AK_T.plunge + 0.66);

    /* 3 ─ the reel inside the screen */
    beatIn(el.beats[0], AK_T.b1);
    ft(el.beats[0].querySelector('.ak-in-kick'), { opacity: 0, letterSpacing: '0.7em' },
      { opacity: 1, letterSpacing: '0.28em', duration: 0.9, ease: 'power3.out' }, AK_T.b1);
    ft(el.words, { opacity: 0, yPercent: 45, filter: 'blur(12px)' },
      { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.75, ease: 'back.out(1.5)', stagger: 0.085 }, AK_T.b1 + 0.12);
    push(el.beats[0], AK_T.b2 - 0.3);

    beatIn(el.beats[1], AK_T.b2);
    ft(el.beats[1].querySelector('.ak-in-kick'), { opacity: 0, letterSpacing: '0.7em' },
      { opacity: 1, letterSpacing: '0.28em', duration: 0.9, ease: 'power3.out' }, AK_T.b2);
    el.items.forEach((it, i) => {
      const at = AK_T.b2 + 0.1 + i * 0.58;
      ft(it, { opacity: 0, yPercent: 70, filter: 'blur(10px)' },
        { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, at);
      if (i < el.items.length - 1) {
        tl.to(it, { opacity: 0, yPercent: -70, filter: 'blur(8px)', duration: 0.32, ease: 'power2.in' }, at + 0.5);
      }
    });
    tl.to(el.stack, { opacity: 1, duration: 0.4 }, AK_T.b2 + 0.3);
    scramble(el.stack, AK_T.b2 + 0.3, 0.9);
    push(el.beats[1], AK_T.b3 - 0.3);

    tl.set(el.beats[2], { opacity: 1 }, AK_T.b3);
    ft(el.pop, { opacity: 0, scale: 0.72, filter: 'blur(12px) brightness(1)' },
      { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)', duration: 0.95, ease: 'back.out(1.6)' }, AK_T.b3);
    ft(el.inWord, { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power3.out' }, AK_T.b3 + 0.28);
    ft(el.name, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, AK_T.b3 + 0.55);
    ft(el.role, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, AK_T.b3 + 0.7);
    scramble(el.role, AK_T.b3 + 0.7, 0.8);
    tl.to(el.pop, { keyframes: [
      { filter: 'blur(0px) brightness(1.7)', duration: 0.1 },
      { filter: 'blur(0px) brightness(1)', duration: 0.55 },
    ] }, AK_T.b3 + 1.2);

    /* 4 ─ pull out: the set returns under the world inside, which is now
       clipped to the glass and shrinks with it until it IS the picture */
    const ex = AK_T.exit;
    // the reel only shrinks from here on: hand its scaling to the compositor.
    // Promoted during the lockup's quiet hold, so building the layers doesn't
    // land on the first frame of the move.
    tl.call(() => { el.stage.style.willChange = el.lock.style.willChange = 'transform'; }, null, AK_T.b3 + 1.0);
    // re-dress the set a beat early, hidden under the world inside, so its
    // first paint at this scale doesn't land on the first frame of the move
    // (the picture on the glass stays blank until the hand-over: it's under the
    // reel the whole way, and every frame of the move would repaint it)
    tl.set(cam, { p: AK_P0 }, ex - 0.3)
      .set(el.set, { visibility: 'visible' }, ex - 0.3)
      .set([el.content, el.scan, el.stat, el.roll], { opacity: 0 }, ex - 0.3)
      .set(el.content, { x: 0, skewX: 0, scaleX: 1, scaleY: 1 }, ex - 0.3)
      .set([el.content, el.scan, el.roll], { opacity: 1 }, AK_T.back - 0.35)
      .set(el.stat, { opacity: 0.12 }, AK_T.back - 0.35)
      .call(() => { st.mode = 2; st.rEnd = null; }, null, ex)
      .to([el.name, el.role], { opacity: 0, y: -6, duration: 0.35, ease: 'power2.in' }, ex)
      .to(el.fine, { opacity: 0, duration: 0.45 }, ex)
      .to(el.crt, { opacity: 1, duration: 0.45 }, ex)
      .to(el.vig, { opacity: 0, duration: 0.6 }, ex)
      .to(warp, { v: -2.2, duration: 0.45, ease: 'power2.in' }, ex)
      .to(warp, { v: -0.12, duration: 1.3, ease: 'power2.out' }, ex + 0.45)
      .to(cam, { p: 0, duration: AK_T.back - ex, ease: 'power2.inOut' }, ex)
      .to(cam, { roll: 0.7, duration: 0.9, ease: 'sine.inOut' }, ex + 0.35)
      .to(el.spill, { opacity: 0.75, duration: 0.8 }, ex + 1.1)
      .to(cam, { roll: 0, duration: 1.0, ease: 'sine.inOut' }, ex + 1.25)
      .to(el.inside, { opacity: 0, duration: 0.35, ease: 'sine.inOut' }, AK_T.back - 0.25)
      .call(() => {
        st.mode = 0;
        el.inside.style.visibility = 'hidden';
        el.stage.style.willChange = el.lock.style.willChange = '';
      }, null, AK_T.back + 0.15);

    /* 5 ─ short circuit */
    const [f1, f2, f3] = AK_T.faults;
    // the panel shorts: a pop, one arc, embers from the control panel
    pop(f1, 0.7); flare(f1, 0.6); zap(f1, 1, 5); tear(f1, 2); jitter(f1, 8); shake(f1, 3); fire(f1, 0);
    tl.to(el.content, { opacity: 0.35, duration: 0.03 }, f1 + 0.22).to(el.content, { opacity: 1, duration: 0.06 }, f1 + 0.27);
    // bigger: the vertical hold slips, two arcs, embers from the top, first wisps
    pop(f2, 0.85); flare(f2, 1); zap(f2, 2, 6); tear(f2, 3); jitter(f2, 12); shake(f2, 5); fire(f2, 1); smoke(f2 + 0.1, 0);
    ft(el.content, { yPercent: -32 }, { yPercent: 0, duration: 0.28, ease: 'steps(5)' }, f2);
    tl.to(el.stat, { opacity: 0.45, duration: 0.05 }, f2).to(el.stat, { opacity: 0.18, duration: 0.3 }, f2 + 0.12);
    // the surge: the tube over-exposes, arcs everywhere, a big ember burst
    tl.to(el.flash, { opacity: 0.95, duration: 0.05, ease: 'none' }, f3);
    flare(f3, 1.4); zap(f3, 2, 3); jitter(f3, 16); shake(f3, 7, 8); fire(f3, 2);
    tl.to(el.stat, { opacity: 0.55, duration: 0.05 }, f3);

    // collapse: flash → line → point → a lingering phosphor dot → dark
    const o = AK_T.off;
    tl.set(el.off, { opacity: 1, scaleX: 1, scaleY: 1 }, o)
      .set([el.flash, el.content, el.stat, el.scan, el.roll], { opacity: 0 }, o + 0.05)
      .to(el.off, { scaleY: 0.012, duration: 0.16, ease: 'power2.in' }, o + 0.05)
      .to(el.off, { scaleX: 0.02, duration: 0.15, ease: 'power2.in' }, o + 0.21)
      .set(el.off, { opacity: 0 }, o + 0.36)
      .set(el.dot, { opacity: 1, scale: 1 }, o + 0.36)
      .to(el.dot, { opacity: 0, scale: 0.15, duration: 0.75, ease: 'power2.in' }, o + 0.36)
      .to(el.spill, { opacity: 0, scale: 1, duration: 0.35, overwrite: 'auto' }, o + 0.1);
    smoke(o + 0.1, 1);

    // fade the room out, release the site
    tl.to(root, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, AK_T.end - 0.6)
      .call(() => finishRef.current(), null, AK_T.end);

    tl.play(0);

    return () => {
      tl.kill();
      gsap.ticker.remove(render);
      window.removeEventListener('resize', measure);
      anims.forEach((a) => { try { a.cancel(); } catch (e) {} });
    };
  }, [sparks, puffs]);

  // One clip, played as cues along the film (see AK_TV_AUDIO). Missing file
  // stays silent, autoplay blocks are swallowed, and everything stops on
  // skip/unmount so nothing bleeds into the site.
  React.useEffect(() => {
    const cfg = AK_TV_AUDIO;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!cfg || !cfg.src || !AC) return undefined;
    let ac;
    try { ac = new AC(); } catch (e) { return undefined; }
    const gain = ac.createGain();
    gain.gain.value = cfg.volume == null ? 1 : cfg.volume;
    gain.connect(ac.destination);
    const t0 = performance.now();
    let dead = false;

    fetch(cfg.src)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('no audio'))))
      .then((ab) => new Promise((res, rej) => ac.decodeAudioData(ab, res, rej)))
      .then((buf) => {
        if (dead) return;
        const elapsed = (performance.now() - t0) / 1000;    // film time already played
        cfg.cues.forEach(([at, from, len]) => {
          const late = Math.max(0, elapsed - at);
          if (late >= len) return;
          const src = ac.createBufferSource();
          src.buffer = buf;
          src.connect(gain);
          src.start(ac.currentTime + Math.max(0, at - elapsed), from + late, len - late);
        });
      })
      .catch(() => {});                                     // 404 / decode error → silent
    if (ac.state === 'suspended') ac.resume().catch(() => {});   // blocked before a gesture → ignore

    const stop = () => {
      if (dead) return;
      dead = true;
      try { gain.gain.setTargetAtTime(0, ac.currentTime, 0.04); } catch (e) {}
      setTimeout(() => { try { ac.close(); } catch (e) {} }, 250);
    };
    stopAudioRef.current = stop;
    return stop;
  }, []);

  const sparkNode = (s, i) => (
    <span key={i} data-i={i} className="ak-tv-spark" style={{ left: s.left + '%', top: s.top + '%' }}>
      <svg width={s.len + 8} height="22" viewBox={`-4 -11 ${s.len + 8} 22`} xmlns="http://www.w3.org/2000/svg">
        <path d={s.d} strokeWidth={s.sw} />
      </svg>
    </span>
  );
  const { b1, b2, b3 } = AK_REEL;

  return (
    <div
      ref={rootRef}
      className={'ak-introtv' + (skipping ? ' ak-introtv--skip' : '')}
      onClick={skip}
      role="presentation"
      aria-hidden="true"
    >
      <div className="ak-tv-world">
        <div className="ak-tv-room" />

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

          {/* screen light on the room, pops with every short-circuit flash */}
          <div className="ak-tv-spill" />
          <div className="ak-tv-backing" />

          {/* Smoke behind the set (z:1) — turbulent plumes rise from the back/top */}
          <div className="ak-tv-smoke-layer">
            {puffs.map((p, i) => (
              <div key={i} data-i={i} className="ak-tv-smoke"
                style={{ left: p.left + '%', top: p.top + '%', width: p.size, height: p.size }}>
                <div className="ak-tv-smoke-tex" style={{ filter: 'url(#' + p.filterId + ')' }} />
              </div>
            ))}
          </div>

          {/* Embers cracking at the top of the corpus — behind the set */}
          <div className="ak-tv-spark-layer">
            {sparks.map((s, i) => (s.zone === 'top' ? sparkNode(s, i) : null))}
          </div>

          <img className={'ak-tv-img' + (akTvBake.sharp ? ' is-baked' : '')}
            src={akTvBake.sharp || '/assets/tv.png'} alt="" draggable="false" />
          {akTvBake.soft && <img className="ak-tv-img ak-tv-img--soft is-baked" src={akTvBake.soft} alt="" draggable="false" />}

          {/* Screen — mapped over the white cut-out of the TV image */}
          <div className="ak-tv-screen">
            <div className="ak-tv-vignette" />
            <div className="ak-tv-content"><AkLogo /></div>
            <div className="ak-tv-roll" />
            <div className="ak-tv-tear" /><div className="ak-tv-tear" /><div className="ak-tv-tear" />
            <div className="ak-tv-scanlines" />
            <div className="ak-tv-static" />
            <div className="ak-tv-flash" />
            <svg className="ak-tv-arcs" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path strokeWidth="1.8" /><path strokeWidth="1" />
              <path strokeWidth="1.8" /><path strokeWidth="1" />
            </svg>
            <div className="ak-tv-on" />
            <div className="ak-tv-off" />
            <div className="ak-tv-dot" />
          </div>

          {/* Embers from the shorting control panel — in front of the set */}
          <div className="ak-tv-spark-layer ak-tv-spark-layer--front">
            {sparks.map((s, i) => (s.zone === 'panel' ? sparkNode(s, i) : null))}
          </div>
        </div>

        {/* The world inside the screen */}
        <div className="ak-tv-inside">
          <canvas />
          <div className="ak-in-stage">
            <div className="ak-in-beat ak-in-b1">
              <div className="ak-in-kick">{b1.kick}</div>
              <h2 className="ak-in-head">
                {b1.lines.map((line, li) => (
                  <span key={li} className="ak-in-line">
                    {line.map((w, wi) => (
                      <React.Fragment key={wi}>
                        {wi > 0 && ' '}
                        <span className={'ak-in-w' + (li === b1.lines.length - 1 && wi === line.length - 1 ? ' ak-in-hot' : '')}>{w}</span>
                      </React.Fragment>
                    ))}
                  </span>
                ))}
              </h2>
            </div>
            <div className="ak-in-beat ak-in-b2">
              <div className="ak-in-kick">{b2.kick}</div>
              <div className="ak-in-roll">
                {b2.items.map((t) => <div key={t} className="ak-in-item">{t}</div>)}
              </div>
              <div className="ak-in-stack">{b2.stack}</div>
            </div>
            <div className="ak-in-beat ak-in-b3">
              <div className="ak-in-lock">
                <div className="ak-in-pop"><AkLogo className="ak-in-logo" /></div>
              </div>
              <div className="ak-in-sign">
                <div className="ak-in-name">{b3.name}</div>
                <div className="ak-in-role">{b3.role}</div>
              </div>
            </div>
          </div>
          <div className="ak-in-static" />
          <div className="ak-in-fine" />
          <div className="ak-in-crt" />
          <div className="ak-in-vig" />
        </div>
      </div>

      <div className="ak-tv-lens" />
      <div className="ak-tv-bloom" />
      <div className="ak-tv-hint">press any key to skip</div>
    </div>
  );
}
window.IntroTV = IntroTV;
})();
