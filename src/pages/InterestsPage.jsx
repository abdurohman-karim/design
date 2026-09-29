// Interests & Hobbies — standalone page. Ice cards that fracture under the
// pointer and refreeze when it leaves. Monochrome frost aesthetic, design
// tokens only (so the ice flips correctly with the light theme).
//
// Fracture model (per hit, all procedural):
//   crush zone   — white, opaque pulverised ice + micro-cracks at the impact
//   radials      — 7–11 jagged (midpoint-displacement) cracks, tapered ribbons
//                  thick at the impact and needle-thin at the tip
//   rings        — concentric cracks between neighbouring radials that sag
//                  toward the impact, like a spider web
//   facets       — the cells between radials and rings, each tilted a little
//                  so it catches more or less light
//   depth        — every crack has a bright edge, an offset dark shadow and a
//                  blurred bloom (light scattering inside the fracture)
//   growth       — the fracture front advances in stick–slip bursts; rings
//                  follow; facets settle; chips fly toward the viewer
//   refreeze     — on leave the cracks seal back into the impact point

(() => {
  /* ─────────────────────────────────────────────────────────────────────────
     One-time CSS injection (page-scoped: ice material, fracture, fx, modal)
     ───────────────────────────────────────────────────────────────────────── */
  if (!document.getElementById('ak-interests-css')) {
    const s = document.createElement('style');
    s.id = 'ak-interests-css';
    s.textContent = `
      .ice-card {
        position: relative;
        overflow: hidden;
        isolation: isolate;                 /* keep blend modes inside the card */
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
        padding: 30px 28px;
        min-height: 210px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        cursor: pointer;
        /* Layer 1 — ice depth: uneven thickness via stacked cold gradients */
        background:
          radial-gradient(140% 120% at 25% 12%, var(--white-a08), transparent 55%),
          radial-gradient(120% 100% at 85% 95%, var(--white-a06), transparent 50%),
          linear-gradient(160deg, var(--white-a06), transparent 45%, var(--white-a04)),
          var(--surface-raised);
        backdrop-filter: blur(var(--blur-sm));
        -webkit-backdrop-filter: blur(var(--blur-sm));
        /* frosted rim: ice is whiter where it's thin, at the edges */
        box-shadow: var(--inset-hairline), inset 0 1px 0 var(--white-a12), inset 0 0 28px var(--white-a06);
        transition: transform var(--dur-base) var(--ease-out),
                    border-color var(--dur-base) var(--ease-out),
                    box-shadow var(--dur-base) var(--ease-out);
      }
      /* Layer 2 — frosted-glass grain: feTurbulence noise (monochrome), blended */
      .ice-card::before {
        content: '';
        position: absolute; inset: 0;
        z-index: 1;
        pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E");
        opacity: .12;
        mix-blend-mode: overlay;
      }
      .ice-card:hover {
        transform: translateY(-4px);
        border-color: var(--border-strong);
        box-shadow: var(--inset-hairline), inset 0 1px 0 var(--white-a12), inset 0 0 28px var(--white-a06), var(--glow-halo-sm);
      }
      .ice-card--featured {
        border-color: var(--border-strong);
        box-shadow: var(--inset-hairline), inset 0 1px 0 var(--white-a12), inset 0 0 28px var(--white-a06), 0 0 0 1px var(--white-a08), var(--glow-halo-md);
      }
      /* impact jolt — the individual translate property composes with the
         hover transform instead of replacing it */
      .ice-card--hit { animation: ice-hit .24s ease-out; }
      @keyframes ice-hit {
        0% { translate: 0 0; } 18% { translate: -2px 1px; } 40% { translate: 2px -1px; }
        65% { translate: -1px 0; } 100% { translate: 0 0; }
      }

      /* Layer 3 — the ice itself: healed hairline veins + trapped air bubbles */
      .ice-card__texture {
        position: absolute; inset: 0; width: 100%; height: 100%;
        z-index: 1; pointer-events: none; overflow: visible;
        mix-blend-mode: screen;
      }
      [data-theme="light"] .ice-card__texture { mix-blend-mode: multiply; }
      .ice-vein { fill: none; stroke: var(--white-a18); stroke-linecap: round; }
      .ice-bubble { fill: var(--white-a04); stroke: var(--white-a18); stroke-width: .5; }
      .ice-bubble-hl { fill: var(--white-a30); }

      /* Layer 4 — the fracture */
      .ice-card__crack {
        position: absolute; inset: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 5; overflow: visible;
      }
      .ice-hi { fill: var(--white); opacity: .88; }
      .ice-shadow { fill: var(--bg); opacity: .55; }
      .ice-glow path { fill: none; stroke: var(--white); stroke-width: 2.6; stroke-linecap: round; opacity: .4; }
      .ice-facet--lit { fill: var(--white); }
      .ice-facet--dark { fill: var(--bg); }
      .ice-crush { fill: var(--white); }
      .ice-seal { fill: none; stroke: var(--white-a60); stroke-width: 1.5; }

      .ice-card__body { position: relative; z-index: 6; display: flex; flex-direction: column; gap: 14px; height: 100%; }

      /* Page-level fx layer: chips fly off the card toward the viewer, so they
         must not be clipped by it */
      #ice-fx { position: fixed; inset: 0; pointer-events: none; z-index: 60; overflow: hidden; }
      .ice-chip {
        position: absolute; left: 0; top: 0;
        background: linear-gradient(135deg, var(--white-a60), var(--white-a12));
        will-change: transform, opacity;
      }
      .ice-mote { position: absolute; left: 0; top: 0; border-radius: 50%; background: var(--white-a60); will-change: transform, opacity; }
      .ice-flash {
        position: absolute; left: 0; top: 0; border-radius: 50%;
        background: radial-gradient(circle, var(--white-a60), transparent 70%);
        will-change: transform, opacity;
      }
      /* four-point glint where a fracture edge catches the light */
      .ice-glint {
        position: absolute; left: 0; top: 0; width: 16px; height: 16px; margin: -8px 0 0 -8px;
        background:
          linear-gradient(var(--white), var(--white)) center / 100% 1px no-repeat,
          linear-gradient(var(--white), var(--white)) center / 1px 100% no-repeat;
        filter: drop-shadow(0 0 3px var(--glow-strong));
        opacity: 0;
      }

      /* Skyridge modal */
      .sky-overlay {
        position: fixed; inset: 0; z-index: var(--z-overlay);
        display: flex; align-items: flex-start; justify-content: center;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: max(24px, var(--container-pad)) var(--container-pad);
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
        margin: auto 0;
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
        .ice-card--hit { animation: none; }
        .sky-overlay, .sky-panel { transition: none; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Mountain-gear icons — user-supplied SVGs in assets/icons/interests.
     Rendered via CSS mask + currentColor so they stay monochrome and follow
     the active theme regardless of the SVG's own fills.
     ───────────────────────────────────────────────────────────────────────── */
  const ICON_BASE = '/assets/icons/interests/';
  function IceIcon({ file, size = 36 }) {
    const url = `url("${ICON_BASE}${file}")`;
    return (
      <span aria-hidden="true" style={{
        display: 'inline-block', width: size, height: size,
        background: 'currentColor',
        WebkitMaskImage: url, maskImage: url,
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskSize: 'contain', maskSize: 'contain',
      }} />
    );
  }

  const CARDS = [
    { icon: 'ice-axe.svg',   title: 'Mountaineering', desc: 'High-altitude ascents above 4000m, multi-day approaches and glacier travel roped up as a team — route-finding, crevasse rescue and pacing a summit push against the weather window.' },
    { icon: 'crampon.svg',   title: 'Ice Climbing',   desc: 'Vertical ice and frozen waterfalls from WI3 to WI5 — front-pointing on crampons, dual-tool technique, and reading how the ice will take a swing before committing to it.' },
    { icon: 'carabiner.svg', title: 'Rock Climbing',  desc: 'Trad and sport routes, placing gear and building anchors on lead, reading rock for the next hold, and trusting a placement you can’t see from below.' },
    { icon: 'helmet.svg',    title: 'Safety',         desc: 'Avalanche assessment (CT/ECT snowpack tests), weather-window planning and turnaround discipline — the unglamorous part that actually keeps a rope team alive.' },
    { icon: 'rope.svg',      title: 'Ropework',       desc: 'Prusiks, Munter hitches, controlled rappels and crevasse-rescue haul systems — knots rehearsed until they’re reflex, not something you look up mid-climb.' },
    { icon: 'peak.svg',      title: 'Skyridge',       desc: 'A community that plans its weekends around a summit — joint ascents, technique clinics on rock and ice, and a mentorship track for anyone starting out. Tap to join the rope team.', featured: true },
  ];

  const rand = (a, b) => a + Math.random() * (b - a);
  const irand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let uid = 0;

  /* ─────────────────────────────────────────────────────────────────────────
     Geometry helpers
     ───────────────────────────────────────────────────────────────────────── */
  const f1 = (v) => v.toFixed(1);
  const toD = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L');

  /* Midpoint displacement: a self-similar jagged line from a to b — each pass
     splits every segment and pushes the midpoint sideways by ±rough·length. */
  function jag(a, b, rough, depth) {
    let pts = [a, b];
    for (let d = 0; d < depth; d++) {
      const next = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const off = rand(-1, 1) * len * rough;
        next.push([(x1 + x2) / 2 - ((y2 - y1) / len) * off, (y1 + y2) / 2 + ((x2 - x1) / len) * off], pts[i + 1]);
      }
      pts = next;
    }
    return pts;
  }
  /* coarse control points → jagged polyline */
  function jagChain(coarse, rough, depth) {
    let out = [coarse[0]];
    for (let i = 0; i < coarse.length - 1; i++) out = out.concat(jag(coarse[i], coarse[i + 1], rough, depth).slice(1));
    return out;
  }

  /* Tapered ribbon along a polyline: width w0 at the start → w1 at the end,
     with a little per-vertex jitter (a real crack opens unevenly). Filled
     shape instead of a stroke, so tips end in a sharp point. */
  function ribbon(pts, w0, w1) {
    const n = pts.length;
    const cum = [0];
    for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = cum[n - 1] || 1;
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const t = cum[i] / total;
      const hw = ((w1 + (w0 - w1) * Math.pow(1 - t, 1.4)) / 2) * rand(0.7, 1.3);
      L.push([pts[i][0] - dy * hw, pts[i][1] + dx * hw]);
      R.push([pts[i][0] + dy * hw, pts[i][1] - dx * hw]);
    }
    return `${toD(L)}L${R.reverse().map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z`;
  }

  /* ─────────────────────────────────────────────────────────────────────────
     The ice before it breaks: healed hairline veins + trapped air bubbles
     ───────────────────────────────────────────────────────────────────────── */
  function drawIceTexture(svg, w, h) {
    const parts = [];
    for (let i = irand(5, 8); i > 0; i--) {
      let x = rand(0, w), y = rand(0, h), a = rand(0, Math.PI * 2);
      const coarse = [[x, y]];
      const segs = irand(3, 5), step = rand(w * 0.1, w * 0.22);
      for (let k = 0; k < segs; k++) { a += rand(-0.5, 0.5); x += Math.cos(a) * step; y += Math.sin(a) * step; coarse.push([x, y]); }
      const d = toD(jagChain(coarse, 0.18, 2));
      const sw = rand(0.35, 0.8).toFixed(2);
      parts.push(`<path class="ice-vein" d="${d}" stroke-width="${sw}" opacity="${rand(0.5, 1).toFixed(2)}"/>`);
      /* a fainter twin a few px away — veins in real ice come in feathery sheets */
      if (Math.random() < 0.5) parts.push(`<path class="ice-vein" d="${d}" stroke-width="${(sw * 0.6).toFixed(2)}" opacity=".35" transform="translate(${f1(rand(-3, 3))} ${f1(rand(2, 4))})"/>`);
    }
    /* bubbles: a few loose ones + one or two rising trails */
    const bubble = (cx, cy, r) => {
      parts.push(`<circle class="ice-bubble" cx="${f1(cx)}" cy="${f1(cy)}" r="${r.toFixed(2)}"/>`);
      if (r > 1.2) parts.push(`<circle class="ice-bubble-hl" cx="${f1(cx - r * 0.35)}" cy="${f1(cy - r * 0.35)}" r="${(r * 0.3).toFixed(2)}"/>`);
    };
    for (let i = irand(5, 9); i > 0; i--) bubble(rand(0, w), rand(0, h), rand(0.6, 2.2));
    for (let t = irand(1, 2); t > 0; t--) {
      let x = rand(w * 0.1, w * 0.9), y = rand(h * 0.4, h * 0.95), r = rand(1.6, 2.6);
      for (let k = irand(4, 7); k > 0; k--) { bubble(x, y, r); x += rand(-3, 3); y -= rand(5, 11); r *= rand(0.7, 0.9); }
    }
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = parts.join('');
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Fracture generator
     ───────────────────────────────────────────────────────────────────────── */
  function genFracture(P, w, h) {
    const [px, py] = P;
    const reach = Math.hypot(Math.max(px, w - px), Math.max(py, h - py));   // to the farthest corner
    const N = irand(7, 11);
    const slice = (Math.PI * 2) / N;
    const rot = rand(0, Math.PI * 2);

    /* radials: some run off the card, some stop short */
    const radials = Array.from({ length: N }, (_, i) => {
      const ang = rot + i * slice + rand(-0.28, 0.28) * slice;
      const len = reach * (Math.random() < 0.5 ? rand(0.75, 1.15) : rand(0.3, 0.62));
      const coarse = [P];
      let a = ang, x = px, y = py;
      const k = irand(4, 6);
      for (let s = 0; s < k; s++) { a += rand(-0.2, 0.2); x += (Math.cos(a) * len) / k; y += (Math.sin(a) * len) / k; coarse.push([x, y]); }
      return { ang, len, pts: jagChain(coarse, 0.15, 2) };
    });
    const pointAt = (rad, R) => rad.pts.find((p) => Math.hypot(p[0] - px, p[1] - py) >= R) || null;

    /* rings: spider-web cracks between neighbouring radials, sagging inward */
    const RADII = [0.13, 0.28, 0.5].map((f) => f * reach * rand(0.85, 1.15));
    const CHANCE = [0.85, 0.68, 0.42];
    const ringAt = RADII.map(() => ({}));
    const rings = [];
    RADII.forEach((R, k) => {
      for (let i = 0; i < N; i++) {
        if (Math.random() > CHANCE[k]) continue;
        const pa = pointAt(radials[i], R * rand(0.92, 1.08));
        const pb = pointAt(radials[(i + 1) % N], R * rand(0.92, 1.08));
        if (!pa || !pb) continue;
        const c = [px + ((pa[0] + pb[0]) / 2 - px) * 0.84, py + ((pa[1] + pb[1]) / 2 - py) * 0.84];
        const q = [];
        for (let s = 0; s <= 4; s++) {
          const t = s / 4, u = 1 - t;
          q.push([u * u * pa[0] + 2 * u * t * c[0] + t * t * pb[0], u * u * pa[1] + 2 * u * t * c[1] + t * t * pb[1]]);
        }
        const pts = jagChain(q, 0.2, 2);
        ringAt[k][i] = pts;
        rings.push(pts);
      }
    });

    /* facets: cells bounded by two radials and two rings (or the impact) */
    const facets = [];
    for (let k = 0; k < RADII.length; k++) {
      for (let i = 0; i < N; i++) {
        const outer = ringAt[k][i];
        const inner = k === 0 ? [P] : ringAt[k - 1][i];
        if (!outer || !inner || Math.random() < 0.18) continue;
        const r = Math.random();
        facets.push({
          d: `${toD(outer.concat(inner.slice().reverse()))}Z`,
          tone: r < 0.6 ? 'lit' : 'dark',
          a: r < 0.6 ? rand(0.03, 0.1) : rand(0.12, 0.3),
        });
      }
    }

    /* forks off the long radials */
    const forks = [];
    radials.forEach((rad) => {
      if (rad.pts.length < 10 || Math.random() < 0.3) return;
      const s = rad.pts[irand(3, rad.pts.length - 5)];
      const a = rad.ang + (Math.random() < 0.5 ? -1 : 1) * rand(0.35, 0.85);
      const l = rad.len * rand(0.14, 0.32);
      forks.push(jag(s, [s[0] + Math.cos(a) * l, s[1] + Math.sin(a) * l], 0.2, 3));
    });

    /* crush zone: pulverised ice + a halo of micro-cracks */
    const micro = Array.from({ length: irand(10, 16) }, () => {
      const a = rand(0, Math.PI * 2), r0 = rand(2, 6), l = rand(5, 17), a2 = a + rand(-0.45, 0.45);
      const s = [px + Math.cos(a) * r0, py + Math.sin(a) * r0];
      return jag(s, [s[0] + Math.cos(a2) * l, s[1] + Math.sin(a2) * l], 0.25, 2);
    });
    const crush = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2, r = rand(3, 8.5);
      return [px + Math.cos(a) * r, py + Math.sin(a) * r];
    });

    return { P, reach, radials, rings, facets, forks, micro, crush };
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Render: two growth fronts (clip circles) reveal the cracks outward —
     radials behind the fast front, rings behind a slower one
     ───────────────────────────────────────────────────────────────────────── */
  function renderFracture(svg, F, w, h) {
    const id = `ice${++uid}`;
    const [px, py] = F.P;
    const main = [
      ...F.radials.map((r) => ribbon(r.pts, rand(2.2, 3.4), 0.2)),
      ...F.forks.map((p) => ribbon(p, rand(0.9, 1.4), 0.15)),
      ...F.micro.map((p) => ribbon(p, rand(0.6, 1), 0.12)),
    ];
    const rings = F.rings.map((p) => ribbon(p, rand(0.8, 1.3), 0.5));
    const lines = [...F.radials.map((r) => r.pts), ...F.forks].map((p) => `<path d="${toD(p)}"/>`).join('');
    const ringLines = F.rings.map((p) => `<path d="${toD(p)}"/>`).join('');
    /* each crack gets its own brightness: faint hairlines next to open, glowing planes */
    const fill = (list, cls, lo = 0.5) => list.map((d) => `<path class="${cls}" d="${d}" opacity="${rand(lo, 1).toFixed(2)}"/>`).join('');

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = `
      <defs>
        <clipPath id="${id}-f"><circle class="ice-front" cx="${f1(px)}" cy="${f1(py)}" r="0"/></clipPath>
        <clipPath id="${id}-r"><circle class="ice-ringfront" cx="${f1(px)}" cy="${f1(py)}" r="0"/></clipPath>
        <filter id="${id}-b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.4"/></filter>
        <filter id="${id}-c" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
      </defs>
      <g class="ice-facets" opacity="0" clip-path="url(#${id}-r)">
        ${F.facets.map((f) => `<path class="ice-facet--${f.tone}" d="${f.d}" opacity="${f.a.toFixed(3)}"/>`).join('')}
      </g>
      <g clip-path="url(#${id}-f)"><g class="ice-glow" opacity="0" filter="url(#${id}-b)">${lines}</g></g>
      <g clip-path="url(#${id}-r)"><g class="ice-glow" opacity="0" filter="url(#${id}-b)">${ringLines}</g></g>
      <g clip-path="url(#${id}-f)">
        <g transform="translate(.8 1)">${fill(main, 'ice-shadow')}</g>
        ${fill(main, 'ice-hi')}
      </g>
      <g clip-path="url(#${id}-r)">
        <g transform="translate(.7 .9)">${fill(rings, 'ice-shadow')}</g>
        ${fill(rings, 'ice-hi', 0.4)}
      </g>
      <g class="ice-crushzone" opacity="0">
        <path class="ice-crush" d="${toD(F.crush)}Z" filter="url(#${id}-c)" opacity=".75"/>
        <circle class="ice-crush" cx="${f1(px)}" cy="${f1(py)}" r="2.2"/>
      </g>
      <circle class="ice-seal" cx="${f1(px)}" cy="${f1(py)}" r="0" opacity="0" filter="url(#${id}-c)"/>
    `;
    gsap.set(svg, { opacity: 1 });
  }

  function clearFracture(svg) {
    if (!svg) return;
    svg.innerHTML = '';
    gsap.set(svg, { clearProps: 'opacity' });
  }

  /* The break: stick–slip bursts of the fracture front, rings trailing it,
     the bloom flaring then relaxing, facets settling into place. */
  function playFracture(svg, F, instant) {
    const $ = (s) => svg.querySelectorAll(s);
    const m = F.reach * 1.1;
    const [px, py] = F.P;
    const front = $('.ice-front'), ringFront = $('.ice-ringfront');
    if (instant) {
      gsap.set([...front, ...ringFront], { attr: { r: m } });
      gsap.set($('.ice-facets, .ice-glow, .ice-crushzone'), { opacity: 1 });
      return gsap.from(svg, { opacity: 0, duration: 0.2 });
    }
    return gsap.timeline()
      .fromTo($('.ice-crushzone'), { opacity: 0, scale: 0.3, svgOrigin: `${px} ${py}` },
        { opacity: 1, scale: 1, duration: 0.09, ease: 'power3.out' }, 0)
      .to(front, {
        keyframes: [
          { attr: { r: m * 0.2 }, duration: 0.05, ease: 'power4.out' },
          { attr: { r: m * 0.24 }, duration: 0.07, ease: 'none' },     // stall
          { attr: { r: m * 0.56 }, duration: 0.08, ease: 'power3.out' },
          { attr: { r: m * 0.6 }, duration: 0.06, ease: 'none' },      // stall
          { attr: { r: m }, duration: 0.24, ease: 'power2.out' },
        ],
      }, 0.02)
      .to(ringFront, { attr: { r: m }, duration: 0.6, ease: 'power2.inOut' }, 0.12)
      .to($('.ice-glow'), { opacity: 1, duration: 0.16 }, 0.03)
      .to($('.ice-glow'), { opacity: 0.45, duration: 1.2, ease: 'power2.out' }, 0.32)
      .to($('.ice-facets'), { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0.3);
  }

  /* Refreeze: facets and bloom fade, then both fronts pull back into the
     impact while a frost ring closes in behind them. */
  function refreezeFracture(svg, F, onDone) {
    const $ = (s) => svg.querySelectorAll(s);
    const m = F.reach * 1.1;
    return gsap.timeline({ onComplete: onDone })
      .to($('.ice-facets'), { opacity: 0, duration: 0.3 }, 0)
      .to($('.ice-glow'), { opacity: 0, duration: 0.4 }, 0)
      .to($('.ice-ringfront'), { attr: { r: 0 }, duration: 0.5, ease: 'power2.in' }, 0)
      .to($('.ice-front'), { attr: { r: 0 }, duration: 0.75, ease: 'power3.inOut' }, 0.08)
      .fromTo($('.ice-seal'), { attr: { r: m * 0.8 }, opacity: 0 },
        { attr: { r: 0 }, opacity: 0.55, duration: 0.75, ease: 'power3.inOut' }, 0.08)
      .to($('.ice-seal'), { opacity: 0, duration: 0.2 }, 0.72)
      .to($('.ice-crushzone'), { opacity: 0, duration: 0.3 }, 0.55);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Shatter fx (page-level fixed layer, viewport coordinates)
       chips  — flat shards that fly out AND toward the viewer (scale up),
                tumbling in 3D; brightness follows the face angle (glint)
       motes  — fine powder: slower, drags, drifts down, twinkles
       glints — 4-point stars flaring on fracture edges
     One RAF loop for all particles, time-based.
     ───────────────────────────────────────────────────────────────────────── */
  function fxLayer() {
    let el = document.getElementById('ice-fx');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ice-fx';
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    return el;
  }
  const CHIP_SHAPES = [
    'polygon(50% 0, 100% 38%, 78% 100%, 22% 84%, 0 32%)',
    'polygon(0 0, 100% 30%, 60% 100%)',
    'polygon(20% 0, 100% 10%, 80% 100%, 0 70%)',
    'polygon(50% 0, 100% 100%, 0 80%)',
  ];

  function shatter(cx, cy, glints) {
    const layer = fxLayer();
    const make = (cls) => { const el = document.createElement('div'); el.className = cls; layer.appendChild(el); return el; };

    /* impact flash */
    const flash = make('ice-flash');
    gsap.fromTo(flash, { x: cx - 45, y: cy - 45, width: 90, height: 90, scale: 0.2, opacity: 0.7 },
      { scale: 1.4, opacity: 0, duration: 0.22, ease: 'power2.out', onComplete: () => flash.remove() });

    /* edge glints */
    glints.forEach(([gx, gy], i) => {
      const g = make('ice-glint');
      gsap.timeline({ delay: 0.12 + i * 0.07 + rand(0, 0.08), onComplete: () => g.remove() })
        .set(g, { x: gx, y: gy, rotation: rand(0, 45), scale: 0 })
        .to(g, { scale: rand(0.8, 1.3), opacity: 1, duration: 0.12, ease: 'power2.out' })
        .to(g, { scale: 0, opacity: 0, rotation: '+=40', duration: 0.3, ease: 'power2.in' });
    });

    const parts = [];
    const t0 = performance.now();
    for (let i = irand(9, 14); i > 0; i--) {
      const el = make('ice-chip');
      const size = rand(4, 9.5);
      el.style.width = `${size.toFixed(1)}px`;
      el.style.height = `${(size * rand(0.7, 1.3)).toFixed(1)}px`;
      el.style.clipPath = CHIP_SHAPES[irand(0, CHIP_SHAPES.length - 1)];
      const a = rand(0, Math.PI * 2), v = rand(140, 460);
      parts.push({ el, chip: true, x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - rand(40, 160),
        z: 0, vz: rand(80, 520), rx: rand(0, 360), ry: rand(0, 360), vrx: rand(-900, 900), vry: rand(-900, 900),
        dur: rand(650, 1050), t0 });
    }
    for (let i = irand(22, 32); i > 0; i--) {
      const el = make('ice-mote');
      const size = rand(0.8, 2.2);
      el.style.width = el.style.height = `${size.toFixed(1)}px`;
      const a = rand(0, Math.PI * 2), v = rand(30, 190);
      parts.push({ el, chip: false, x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        tw: rand(8, 18), ph: rand(0, 6), dur: rand(900, 1600), t0 });
    }

    let last = t0;
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let alive = false;
      for (const p of parts) {
        if (!p.el) continue;
        const life = (now - p.t0) / p.dur;
        if (life >= 1 || !p.el.isConnected) { p.el.remove(); p.el = null; continue; }
        alive = true;
        const fade = life < 0.6 ? 1 : 1 - (life - 0.6) / 0.4;
        if (p.chip) {
          p.vy += 900 * dt;                       // gravity
          p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
          p.rx += p.vrx * dt; p.ry += p.vry * dt;
          const s = 1 + p.z / 420;                // toward the viewer → bigger
          const glint = 0.35 + 0.65 * Math.abs(Math.cos((p.ry * Math.PI) / 180));
          p.el.style.transform = `translate3d(${f1(p.x)}px, ${f1(p.y)}px, 0) scale(${s.toFixed(2)}) rotateX(${p.rx.toFixed(0)}deg) rotateY(${p.ry.toFixed(0)}deg)`;
          p.el.style.opacity = (fade * glint).toFixed(2);
        } else {
          const drag = Math.pow(0.12, dt);        // powder loses speed fast
          p.vx *= drag; p.vy = p.vy * drag + 160 * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          const twinkle = 0.55 + 0.45 * Math.sin(p.ph + (now / 1000) * p.tw);
          p.el.style.transform = `translate3d(${f1(p.x)}px, ${f1(p.y)}px, 0)`;
          p.el.style.opacity = (fade * twinkle).toFixed(2);
        }
      }
      if (alive) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* a few points along the fracture where light will flare (viewport coords) */
  function glintPoints(F, rect) {
    const out = [];
    const pool = F.radials.filter((r) => r.pts.length > 6);
    for (let i = Math.min(irand(3, 5), pool.length); i > 0; i--) {
      const r = pool.splice(irand(0, pool.length - 1), 1)[0];
      const p = r.pts[Math.floor(r.pts.length * rand(0.25, 0.7))];
      if (p[0] > 4 && p[1] > 4 && p[0] < rect.width - 4 && p[1] < rect.height - 4) out.push([rect.left + p[0], rect.top + p[1]]);
    }
    return out;
  }

  /* ─────────────────────────────────────────────────────────────────────────
     IceCard component
     ───────────────────────────────────────────────────────────────────────── */
  function IceCard({ icon, title, desc, featured, onOpen }) {
    const cardRef = React.useRef(null);
    const textureRef = React.useRef(null);
    const svgRef = React.useRef(null);
    const st = React.useRef({ active: false, F: null, tl: null, timer: null });

    /* draw the unbroken ice once the card has real dimensions */
    React.useEffect(() => {
      const raf = requestAnimationFrame(() => {
        const card = cardRef.current;
        if (!card || !textureRef.current) return;
        const r = card.getBoundingClientRect();
        if (r.width && r.height) drawIceTexture(textureRef.current, r.width, r.height);
      });
      return () => cancelAnimationFrame(raf);
    }, []);

    const trigger = React.useCallback((clientX, clientY) => {
      const card = cardRef.current, s = st.current;
      if (!card || s.active) return;
      s.active = true;
      if (s.tl) s.tl.kill();
      const r = card.getBoundingClientRect();
      const P = [
        clientX != null ? clientX - r.left : r.width / 2,
        clientY != null ? clientY - r.top : r.height / 2,
      ];
      const F = genFracture(P, r.width, r.height);
      s.F = F;
      renderFracture(svgRef.current, F, r.width, r.height);
      const instant = reducedMotion();
      s.tl = playFracture(svgRef.current, F, instant);
      if (!instant) {
        shatter(r.left + P[0], r.top + P[1], glintPoints(F, r));
        card.classList.remove('ice-card--hit');
        void card.offsetWidth;                    // restart the jolt
        card.classList.add('ice-card--hit');
      }
    }, []);

    const reset = React.useCallback(() => {
      const s = st.current, svg = svgRef.current;
      if (!s.active) return;
      s.active = false;
      if (s.tl) s.tl.kill();
      if (!s.F) return;
      s.tl = reducedMotion()
        ? gsap.to(svg, { opacity: 0, duration: 0.2, onComplete: () => clearFracture(svg) })
        : refreezeFracture(svg, s.F, () => clearFracture(svg));
    }, []);

    /* ice glints under the pointer before (and while) it breaks */
    const onPointerMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const card = cardRef.current, r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
      card.style.setProperty('--spot', '1');
    };
    const onPointerEnter = (e) => { if (e.pointerType === 'mouse') trigger(e.clientX, e.clientY); };
    const onPointerLeave = (e) => {
      if (e.pointerType !== 'mouse') return;
      cardRef.current.style.setProperty('--spot', '0');
      reset();
    };
    const onPointerDown = (e) => {
      if (e.pointerType !== 'mouse') {
        /* touch / pen: break on tap, refreeze after a beat */
        trigger(e.clientX, e.clientY);
        clearTimeout(st.current.timer);
        st.current.timer = setTimeout(reset, 1600);
      }
    };
    const onClick = () => { if (featured && onOpen) onOpen(); };

    React.useEffect(() => () => {
      const s = st.current;
      clearTimeout(s.timer);
      if (s.tl) s.tl.kill();
    }, []);

    return (
      <div
        ref={cardRef}
        className={`ice-card${featured ? ' ice-card--featured' : ''}`}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onAnimationEnd={(e) => { if (e.animationName === 'ice-hit') e.currentTarget.classList.remove('ice-card--hit'); }}
        onClick={onClick}
        role={featured ? 'button' : undefined}
        tabIndex={featured ? 0 : undefined}
        data-cursor={featured ? 'lock' : undefined}
        data-cursor-label={featured ? 'Join Skyridge ↗' : undefined}
        onKeyDown={featured ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(); } } : undefined}
      >
        <div className="ak-light-spot" style={{ zIndex: 1 }} aria-hidden="true" />
        <svg ref={textureRef} className="ice-card__texture" aria-hidden="true" />
        <svg ref={svgRef} className="ice-card__crack" aria-hidden="true" />
        <div className="ak-light-edge" style={{ zIndex: 7 }} aria-hidden="true" />

        <div className="ice-card__body">
          <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><IceIcon file={icon} /></span>
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
            }}>Learn about the club →</span>
          )}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
     Skyridge modal
     ───────────────────────────────────────────────────────────────────────── */
  const DecryptBtn = window.DecryptBtn;
  const { Input, Textarea } = window.DS;

  function SkyridgeModal({ open, onClose }) {
    const [mounted, setMounted] = React.useState(open);
    const [shown, setShown] = React.useState(false);
    const [status, setStatus] = React.useState('idle'); // idle | sending | sent | error
    const [error, setError] = React.useState('');

    React.useEffect(() => {
      if (open) {
        setMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      } else {
        setShown(false);
        const t = setTimeout(() => {
          setMounted(false);
          setStatus('idle');
          setError('');
        }, 300);
        return () => clearTimeout(t);
      }
    }, [open]);

    /* Lock background scroll while the modal is up — otherwise the fixed
       overlay stays put but the page behind it keeps scrolling, and on
       short mobile viewports the form (and its submit button) can end up
       taller than the screen with no way to reach it. */
    React.useEffect(() => {
      if (!mounted) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [mounted]);

    const onSubmit = (e) => {
      e.preventDefault();
      if (status === 'sending' || status === 'sent') return;
      const fd = new FormData(e.target);
      setStatus('sending');
      setError('');
      window.sendNotification({
        type: 'skyridge',
        name: fd.get('name'),
        phone: fd.get('phone'),
        message: fd.get('message'),
      }).then(() => {
        setStatus('sent');
      }).catch((err) => {
        setStatus('error');
        setError(err.message || 'Something went wrong. Please try again.');
      });
    };

    React.useEffect(() => {
      if (!open) return;
      const onKey = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!mounted) return null;

    return (
      <div className={`sky-overlay${shown ? ' is-open' : ''}`} onClick={onClose}
        role="dialog" aria-modal="true" aria-label="Skyridge club">
        <div className="sky-panel" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} aria-label="Close" style={{
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
          }}>// mountain club</span>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 500,
            letterSpacing: '-0.03em', color: 'var(--white)', margin: '14px 0 16px',
            textShadow: 'var(--glow-text)',
          }}>Skyridge</h2>

          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.7,
            color: 'var(--text-secondary)', margin: '0 0 28px', textWrap: 'pretty',
          }}>
            Skyridge is built around one shared itch: get back on rock, ice or a ridge line every
            chance we get. Through the season we run joint ascents, technique clinics on belaying,
            ice-tool footwork and anchor building, plus regular trips out to frozen waterfalls and
            alpine faces. New members get paired with a mentor and a gentle on-ramp; the experienced
            crowd sets the harder objectives — new routes, longer traverses, colder ice.
          </p>

          {status === 'sent' ? (
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.02em',
              color: 'var(--text-primary)', margin: 0,
            }}>Request sent ✓ — we'll reach out on the number you left.</p>
          ) : (
            <form onSubmit={onSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <Input name="name" label="Name" placeholder="Your name" required autoComplete="off"
                disabled={status === 'sending'} />
              <Input name="phone" label="Phone" type="tel" placeholder="+1 234 567 8900" required autoComplete="off"
                disabled={status === 'sending'} />
              <Textarea name="message" label="Message (optional)" rows={3}
                placeholder="Climbing experience, goals, anything we should know…"
                autoComplete="off" disabled={status === 'sending'} />
              <div>
                <DecryptBtn variant="primary" size="lg" arrow type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Join Skyridge'}
                </DecryptBtn>
              </div>
              {status === 'error' && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>{error}</span>
              )}
            </form>
          )}
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

    /* the shatter fx layer lives on <body>; drop it when leaving the route */
    React.useEffect(() => () => { const fx = document.getElementById('ice-fx'); if (fx) fx.remove(); }, []);

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
          }}>Mountains&nbsp;&&nbsp;Ice</h1>

          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 'clamp(16px, 1.8vw, 20px)', lineHeight: 1.6,
            color: 'var(--text-secondary)', maxWidth: 620, margin: 0, textWrap: 'balance',
          }}>
            Backend work pays the bills; the mountains keep me honest. When I'm not shipping payment
            APIs, I'm on rock, ice or a glacier — building the technique and judgment that keep a
            rope team alive. Hover a card (or tap on mobile) and watch the ice crack.
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
