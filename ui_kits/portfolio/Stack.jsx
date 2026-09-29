// Portfolio — Stack. print('Stack'), GSAP "orbit": the skill cards sit on a 3D
// arc. Desktop: pinned section — scroll turns the arc (magnetic stop on each
// card), the arc can be grabbed and flicked (Draggable + Inertia), ←/→ and the
// tab row jump between cards; the card in focus gets a cursor spotlight, a
// light tilt, a decrypted label and its tags rising in.
// Mobile: swipe carousel in normal document flow (no pin — pinning on phones
// fought the URL bar / 100vh resize). Reduced motion: static grid, no GSAP.
const { SectionHeading, Tag, Icon } = window.DS;

const GROUPS = [
  {
    icon:  'server',
    label: 'Backend',
    desc:  'High-load APIs, event-driven workers, full Laravel ecosystem',
    items: ['PHP', 'Laravel', 'Python', 'Node.js', 'RoadRunner', 'Livewire', 'Laravel Jobs', 'Queue Workers', 'CRON Jobs', 'aiogram'],
  },
  {
    icon:  'code',
    label: 'Frontend',
    desc:  'Reactive UIs, design systems and modern CSS tooling',
    items: ['JavaScript (ES6+)', 'Vue.js', 'Vuex', 'SCSS / SASS', 'Tailwind CSS', 'Bootstrap', 'HTML / CSS', 'ESLint', 'BEM', 'Animate.css'],
  },
  {
    icon:  'database',
    label: 'Databases',
    desc:  'SQL, NoSQL, caching layers and partitioning strategies',
    items: ['PostgreSQL', 'MySQL', 'MariaDB', 'MongoDB', 'Redis', 'DB Partitioning', 'DataGrip'],
  },
  {
    icon:  'bolt',
    label: 'API & Auth',
    desc:  'REST, JSON-RPC, OAuth flows and third-party API integrations',
    items: ['REST API', 'JSON-RPC', 'JWT', 'OAuth', 'Bearer Token', 'Basic Auth', 'API Key', 'Telegram Bot API', 'Trello API'],
  },
  {
    icon:  'layers',
    label: 'DevOps & Infra',
    desc:  'Containerisation, CI/CD pipelines, messaging and observability',
    items: ['Docker', 'GitHub Actions', 'GitLab CI/CD', 'RabbitMQ', 'Grafana', 'Sentry', 'Hestia CP'],
  },
  {
    icon:  'bot',
    label: 'AI & Bots',
    desc:  'LLM integrations, Telegram bots and computer-vision pipelines',
    items: ['OpenAI', 'Groq', 'DeepSeek', 'OpenRouter', 'python-telegram-bot', 'OpenCV', 'SBP'],
  },
  {
    icon:  'shield',
    label: 'Security',
    desc:  'Penetration testing, network analysis and vulnerability assessment',
    items: ['Nmap', 'Wireshark', 'SQLMap', 'Nikto', 'Burp Suite', 'Dirsearch', 'Metasploit', 'Hydra', 'Hashcat', 'Netcat'],
  },
  {
    icon:  'terminal',
    label: 'Tools & Creative',
    desc:  'Animation libs, 3D, design tools and everyday dev stack',
    items: ['GSAP', 'Three.js', 'Tilt.js', 'jQuery', 'Figma', 'Pixso', 'Canva', 'Git', 'Linux', 'Bitrix24'],
  },
];


const n = GROUPS.length;

/* Fixed header is ~75px tall (18px padding + 38px controls + 18px); the pinned
   desktop section sits at the very top of the viewport, so its heading needs
   to start below that. */
const HEADER_CLEARANCE = 112;

/* ── Orbit tuning ── */
const STEP_DEG = 38;     /* angle between neighbouring cards on the arc */
const CARD_GAP = 36;     /* gap between neighbouring card edges, px */
const STEP_VH  = 0.65;   /* pinned scroll distance per card, × viewport height */
const TAG_DIM  = 0.38;   /* tag opacity on cards that aren't in focus */
const MAX_THROW = 2;     /* a flick advances at most this many cards */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2  = (v) => String(v).padStart(2, '0');

/* ── Styles — injected once (masks, pseudo-elements and media queries don't fit inline) ── */
if (typeof document !== 'undefined' && !document.getElementById('ak-orbit-css')) {
  const s = document.createElement('style');
  s.id = 'ak-orbit-css';
  s.textContent = `
    /* desktop stage */
    .ak-orbit-stage {
      position: relative; flex: 1; min-height: 0;
      perspective: 1700px; perspective-origin: 50% 40%;
      cursor: grab; touch-action: pan-y;
      user-select: none; -webkit-user-select: none;
    }
    .ak-orbit-stage.is-dragging { cursor: grabbing; }
    .ak-orbit-card {
      position: absolute; left: 50%; top: 50%;
      width: clamp(420px, 50vw, 640px);
      will-change: transform, opacity;
      visibility: hidden;                 /* first render places + reveals */
    }
    .ak-orbit-face { position: relative; }
    .ak-orbit-content { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; }
    .ak-orbit-shade {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
    }
    /* depth: cards away from the front sink into the page background */
    .ak-orbit-shade { z-index: 2; background: var(--bg); opacity: 0; }
    .ak-orbit-tag { display: inline-flex; }
    /* floor light under the arc — brightens and widens with spin speed */
    .ak-orbit-floor {
      position: absolute; left: 0; right: 0; bottom: 2%; margin: 0 auto;
      width: min(980px, 82vw); height: 140px; pointer-events: none;
      background: radial-gradient(ellipse 50% 50% at 50% 50%, var(--white-a08), transparent 72%);
      opacity: .5;
    }

    /* HUD: counter · tabs · hint */
    .ak-orbit-nav {
      position: relative; z-index: 3; flex-shrink: 0;
      width: 100%; max-width: var(--container-max); margin: 0 auto;
      padding: 0 var(--container-pad) 26px; box-sizing: border-box;
      display: flex; align-items: center; gap: 24px;
    }
    .ak-orbit-count {
      min-width: 76px; height: 16px; overflow: hidden;
      font-family: var(--font-mono); font-size: 12px; line-height: 16px;
      letter-spacing: .08em; color: var(--text-faint);
      display: flex; font-variant-numeric: tabular-nums;
    }
    .ak-orbit-count b { display: inline-block; font-weight: 500; color: var(--text-primary); }
    .ak-orbit-tabs { position: relative; flex: 1; display: flex; justify-content: center; gap: 2px; }
    .ak-orbit-tab {
      appearance: none; background: none; border: 0; margin: 0;
      padding: 10px 11px; display: inline-flex; align-items: baseline;
      font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .16em;
      text-transform: uppercase; white-space: nowrap;
      color: var(--text-faint); transition: color var(--dur-base) var(--ease-out);
    }
    .ak-orbit-tab:hover { color: var(--text-secondary); }
    .ak-orbit-tab.is-active { color: var(--text-primary); }
    .ak-orbit-tab:focus-visible { outline: 1px solid var(--border-strong); outline-offset: 2px; border-radius: 6px; }
    .ak-orbit-tab-label { display: inline-block; overflow: hidden; vertical-align: bottom; }
    .ak-orbit-tab-label > span { display: inline-block; padding-left: 10px; }
    .ak-orbit-ind {
      position: absolute; left: 0; bottom: 2px; height: 1px; width: 0;
      background: var(--text-primary); box-shadow: 0 0 10px var(--glow-strong);
      pointer-events: none;
    }
    .ak-orbit-hint {
      min-width: 76px; text-align: right;
      font-family: var(--font-mono); font-size: 10px; letter-spacing: .2em;
      text-transform: uppercase; color: var(--text-faint);
      transition: opacity .8s var(--ease-out);
    }
    .ak-orbit-hint.is-gone { opacity: 0; }

    /* mobile swipe carousel */
    .ak-swipe {
      position: relative; display: grid; margin-top: 40px;
      overflow: hidden; padding-block: 6px 10px;
      touch-action: pan-y; perspective: 1200px;
      user-select: none; -webkit-user-select: none;
    }
    .ak-swipe > .ak-orbit-card {
      position: relative; left: auto; top: auto; grid-area: 1 / 1;
      justify-self: center; width: min(84vw, 440px);
    }
    .ak-swipe-dots { display: flex; justify-content: center; margin-top: 18px; }
    .ak-swipe-dot { appearance: none; background: none; border: 0; padding: 10px 4px; margin: 0; }
    .ak-swipe-dot::before {
      content: ""; display: block; width: 6px; height: 6px; border-radius: 999px;
      background: var(--border-strong);
      transition: width .4s var(--ease-out), background-color .4s var(--ease-out);
    }
    .ak-swipe-dot.is-active::before { width: 22px; background: var(--text-primary); }

    /* reduced motion: plain grid */
    .ak-stack-grid {
      display: grid; gap: 16px; margin-top: 48px;
      grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
    }
  `;
  document.head.appendChild(s);
}

/* Shared card shell (outer container differs per layout; this is the chrome) */
const CARD_SHELL = {
  borderRadius: 20,
  border: '1px solid var(--border)',
  background: 'var(--surface-raised)',
  boxShadow: '0 0 0 1px var(--border-subtle)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

/* Inner card content — shared by every layout */
function StackCardInner({ g, i }) {
  return (
    <>
      {/* card body */}
      <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* header row: icon + label + description */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <span style={{ color: 'var(--text-secondary)', marginTop: 2, flexShrink: 0 }}>
            <Icon name={g.icon} size={26} duotone />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="ak-orbit-label" style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>
              {g.label}
            </span>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: 13,
              color: 'var(--text-faint)', lineHeight: 1.5,
              letterSpacing: '0.01em',
            }}>
              {g.desc}
            </span>
          </div>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: 'var(--border-subtle)' }} />

        {/* tech tags — wrapped so GSAP animates the wrapper, not Tag's own
            inline `transition: all` (which would fight every tween) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {g.items.map((t) => <span key={t} className="ak-orbit-tag"><Tag>{t}</Tag></span>)}
        </div>
      </div>

      {/* card footer: skill-set label + card number */}
      <div style={{
        padding: '14px 28px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}>
          skill set
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
          color: 'var(--text-muted)',
        }}>
          {pad2(i + 1)}
          <span style={{ color: 'var(--text-faint)' }}> / {pad2(n)}</span>
        </span>
      </div>
    </>
  );
}

/* Card face: chrome + content, cursor-light layers (desktop) and depth shade */
function StackCardFace({ g, i, light = false }) {
  return (
    <div className="ak-orbit-face" style={CARD_SHELL}>
      {light && <div className="ak-light-spot" />}
      <div className="ak-orbit-content"><StackCardInner g={g} i={i} /></div>
      {light && <div className="ak-light-edge" />}
      <div className="ak-orbit-shade" />
    </div>
  );
}

function StackHeading() {
  return (
    <SectionHeading index={2} title="Stack"
      code={<><span style={{ color: 'var(--gray-400)' }}>print</span>(<span style={{ color: 'var(--gray-300)' }}>'Stack'</span>)</>}
      lede="The tools I reach for to ship reliable, high-load backend systems." />
  );
}

/* ── Focus effects shared by the desktop orbit and the mobile carousel ── */

/* Decrypt-style label reveal — shared with Projects (akMotion.js) */
const { scramble: scrambleText, scrambleStop: stopScramble } = window.akMotion;

/* Bring a card into focus (label decrypts, tags rise to full strength) and
   let the previous one sink back to the dimmed state. */
function focusCard(cards, next, prev) {
  if (prev >= 0 && cards[prev]) {
    gsap.to(cards[prev].querySelectorAll('.ak-orbit-tag'), {
      opacity: TAG_DIM, y: 0, duration: 0.35, ease: 'power2.out', overwrite: true,
    });
  }
  const card = cards[next];
  if (!card) return;
  gsap.fromTo(card.querySelectorAll('.ak-orbit-tag'),
    { opacity: TAG_DIM, y: 10 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', overwrite: true,
      stagger: { each: 0.03, from: 'center', grid: 'auto' } });
  scrambleText(card.querySelector('.ak-orbit-label'));
}

function tagsOf(cards) {
  return cards.flatMap((c) => [...c.querySelectorAll('.ak-orbit-tag')]);
}

/* ── Desktop: pinned 3D orbit ── */
function StackDesktop() {
  const sectionRef = React.useRef(null);
  const stageRef   = React.useRef(null);
  const cardsRef   = React.useRef([]);
  const tabsRef    = React.useRef([]);
  const indRef     = React.useRef(null);
  const countRef   = React.useRef(null);
  const floorRef   = React.useRef(null);
  const hintRef    = React.useRef(null);
  const api        = React.useRef({ goTo: () => {} });

  /* useLayoutEffect, not useEffect: its cleanup runs before React detaches
     the section. The pin wraps the section in a .pin-spacer, so st.kill()
     must un-wrap it first or React's removeChild throws (and takes the whole
     tree down) when the layout switches at the breakpoint. */
  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage   = stageRef.current;
    const floor   = floorRef.current;
    const cards   = cardsRef.current;
    const tabs    = tabsRef.current;
    const faces   = cards.map((c) => c.querySelector('.ak-orbit-face'));
    const shades  = cards.map((c) => c.querySelector('.ak-orbit-shade'));
    const tilts   = cards.map((c) => c.querySelector('.ak-orbit-tilt'));
    const labels  = tabs.map((t) => t.querySelector('.ak-orbit-tab-label'));
    const canHover = window.matchMedia('(hover: hover)').matches;

    /* pos: fractional card index at the front · intro: 0 folded → 1 unfolded
       tab: index shown in the HUD · shown: card currently "in focus" */
    const state = { pos: 0, intro: 0, introDone: false, tab: -1, shown: -1, lastPos: 0, lastT: 0 };
    let radius = 0, pxPerCard = 1;
    let drag = null, navTween = null, introTween = null, indTween = null;
    let dragging = false, dragAllowed = false, navIndex = 0, pressIndex = 0;

    const measure = () => {
      const w = cards[0].offsetWidth;
      /* apothem of the polygon whose sides are the cards (+ gap) */
      radius = (w + CARD_GAP) / 2 / Math.tan((STEP_DEG * Math.PI) / 360);
      pxPerCard = Math.max(180, w * 0.55);
      if (drag) drag.applyBounds({ minX: -(n - 1) * pxPerCard, maxX: 0 });
    };

    /* Intro: cards unfold from edge-on, left → right (cards past the 4th
       share its timing — they're off-stage anyway). 1 = folded, 0 = placed. */
    const INTRO_STAGGER = 0.14;
    const folded = (i) => {
      const t = clamp(state.intro * (1 + INTRO_STAGGER * 3) - Math.min(i, 3) * INTRO_STAGGER, 0, 1);
      return Math.pow(1 - t, 3);
    };

    const floorTo    = gsap.quickTo(floor, 'opacity', { duration: 0.6, ease: 'power2.out' });
    const floorScale = gsap.quickTo(floor, 'scaleX',  { duration: 0.8, ease: 'power2.out' });
    const tiltX = tilts.map((t) => gsap.quickTo(t, 'rotationX', { duration: 0.7, ease: 'power3.out' }));
    const tiltY = tilts.map((t) => gsap.quickTo(t, 'rotationY', { duration: 0.7, ease: 'power3.out' }));

    /* ── HUD ── */
    const indRect = (i) => ({ x: tabs[i].offsetLeft + 11, w: tabs[i].offsetWidth - 22 });
    const markTab = (next, prev, instant) => {
      tabs.forEach((t, i) => {
        t.classList.toggle('is-active', i === next);
        if (i === next) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
      });
      const dur = instant ? 0 : 0.55;
      labels.forEach((l, i) => {
        if (i === next) gsap.to(l, { width: 'auto', opacity: 1, duration: dur, ease: 'power3.inOut', overwrite: true });
        else if (i === prev || instant) gsap.to(l, { width: 0, opacity: 0, duration: dur, ease: 'power3.inOut', overwrite: true });
      });
      /* underline slides between the two tabs while their labels resize,
         so both ends are re-measured every frame */
      if (indTween) indTween.kill();
      const from = prev >= 0 ? prev : next;
      const k = { v: instant ? 1 : 0 };
      const place = () => {
        const a = indRect(from), b = indRect(next);
        gsap.set(indRef.current, { x: a.x + (b.x - a.x) * k.v, width: a.w + (b.w - a.w) * k.v });
      };
      indTween = gsap.to(k, { v: 1, duration: dur, ease: 'power3.inOut', onUpdate: place, onComplete: place });
      place();
    };
    const rollCount = (next, prev) => {
      const el = countRef.current;
      el.textContent = pad2(next + 1);
      const dir = prev < 0 || next > prev ? 1 : -1;
      gsap.fromTo(el, { yPercent: 80 * dir, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out', overwrite: true });
    };
    const hideHint = () => { if (hintRef.current) hintRef.current.classList.add('is-gone'); };

    /* ── Cursor light + tilt on the card in focus ── */
    const releaseLight = (i) => {
      if (i < 0) return;
      faces[i].style.setProperty('--spot', '0');
      tiltX[i](0); tiltY[i](0);
    };
    const onPointerMove = (e) => {
      if (!canHover || dragging || !state.introDone || e.pointerType === 'touch') return;
      const i = state.shown;
      if (i < 0) return;
      const r = cards[i].getBoundingClientRect();   // arc-placed box, tilt excluded
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      if (px < 0 || px > 1 || py < 0 || py > 1) { releaseLight(i); return; }
      faces[i].style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      faces[i].style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      faces[i].style.setProperty('--spot', '1');
      tiltY[i]((px - 0.5) * 12);
      tiltX[i]((0.5 - py) * 9);
    };
    const onPointerLeave = () => releaseLight(state.shown);

    /* ── Frame: place every card on the arc from state.pos ── */
    const render = () => {
      const pos = state.pos;
      for (let i = 0; i < n; i++) {
        const d = i - pos, ad = Math.abs(d), k = folded(i);
        const theta = d * STEP_DEG;
        const rad = (theta * Math.PI) / 180;
        const x = radius * Math.sin(rad);
        const z = radius * (Math.cos(rad) - 1) - k * 360;
        const rot = theta - k * 84;
        /* cards stay opaque (a translucent card lets the ledger background
           show through its face); depth comes from the shade, opacity only
           fades the far ones out and plays the intro */
        const op = clamp(2.4 - ad, 0, 1) * (1 - k);
        const card = cards[i];
        card.style.transform =
          `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${(k * 60).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg)`;
        card.style.opacity = op.toFixed(3);
        card.style.visibility = op < 0.01 ? 'hidden' : 'visible';
        card.style.zIndex = String(100 - Math.round(ad * 10));
        shades[i].style.opacity = Math.min(ad * 0.55, 0.9).toFixed(3);
      }

      /* floor light follows spin speed (cards / second) */
      const now = performance.now();
      const speed = (Math.abs(pos - state.lastPos) / Math.max(16, now - state.lastT)) * 1000;
      state.lastPos = pos;
      state.lastT = now;
      floorTo(clamp(0.5 + speed * 0.3, 0.5, 1));
      floorScale(clamp(1 + speed * 0.06, 1, 1.25));

      const active = clamp(Math.round(pos), 0, n - 1);
      if (active !== state.tab) {
        const prev = state.tab;
        state.tab = active;
        markTab(active, prev);
        rollCount(active, prev);
      }
      if (state.introDone && active !== state.shown) {
        const prev = state.shown;
        state.shown = active;
        releaseLight(prev);
        focusCard(cards, active, prev);
      }
    };

    /* initial state (before first paint — this is a layout effect) */
    gsap.set(labels, { width: 0, opacity: 0 });
    gsap.set(tagsOf(cards), { opacity: TAG_DIM });
    gsap.set(tilts, { transformPerspective: 1000 });
    measure();

    /* ── Scroll drives the arc: pinned, smoothed through quickTo ── */
    const posTo = gsap.quickTo(state, 'pos', { duration: 0.65, ease: 'power3.out', onUpdate: render });
    const st = ScrollTrigger.create({
      trigger: section,
      pin: true,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * STEP_VH * (n - 1))}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => posTo(self.progress * (n - 1)),
      onRefresh: () => {
        measure();
        render();
        if (state.tab >= 0) markTab(state.tab, -1, true);
      },
    });
    const toScroll = (p) => st.start + (clamp(p, 0, n - 1) / (n - 1)) * (st.end - st.start);
    const pinnedNow = () => Math.abs(section.getBoundingClientRect().top) < 3;

    const killNav = () => { if (navTween) { navTween.kill(); navTween = null; } };
    const goTo = (i, duration) => {
      i = clamp(i, 0, n - 1);
      navIndex = i;
      killNav();
      const o = { y: window.scrollY };
      const target = toScroll(i);
      const steps = Math.abs(target - o.y) / (window.innerHeight * STEP_VH);
      navTween = gsap.to(o, {
        y: target,
        duration: duration ?? clamp(0.6 + steps * 0.12, 0.6, 1.4),
        ease: 'power3.inOut',
        onUpdate: () => window.scrollTo(0, o.y),
        onComplete: () => { navTween = null; },
      });
    };
    api.current.goTo = (i) => { goTo(i); hideHint(); };

    /* magnet: when scrolling stops between two cards, settle on the nearest */
    const onScrollEnd = () => {
      if (dragging || navTween || !st.isActive) return;
      const p = st.progress * (n - 1);
      const target = Math.round(p);
      if (Math.abs(p - target) > 0.003) goTo(target, 0.5);
    };
    ScrollTrigger.addEventListener('scrollEnd', onScrollEnd);

    /* ── Grab & flick: Draggable moves a proxy, the proxy moves the page
       scroll, the scroll moves the arc — one source of truth, so wheel and
       drag never fight. Only while the section is pinned. ── */
    const proxy = document.createElement('div');
    const syncFromDrag = function () {
      if (!dragAllowed) return;
      st.scroll(toScroll(-this.x / pxPerCard));
      hideHint();
    };
    drag = Draggable.create(proxy, {
      type: 'x',
      trigger: stage,
      inertia: true,
      edgeResistance: 0.85,
      bounds: { minX: -(n - 1) * pxPerCard, maxX: 0 },
      throwResistance: 2200,
      snap: { x: (v) => -clamp(clamp(Math.round(-v / pxPerCard), pressIndex - MAX_THROW, pressIndex + MAX_THROW), 0, n - 1) * pxPerCard },
      onPress() {
        dragAllowed = pinnedNow() && state.introDone;
        if (!dragAllowed) return;
        dragging = true;
        killNav();
        stage.classList.add('is-dragging');
        releaseLight(state.shown);
        pressIndex = Math.round(st.progress * (n - 1));
        gsap.set(proxy, { x: -st.progress * (n - 1) * pxPerCard });
        this.update();
      },
      onDrag: syncFromDrag,
      onThrowUpdate: syncFromDrag,
      onRelease() {
        stage.classList.remove('is-dragging');
        /* a throw (if any) starts on release — check once it has */
        gsap.delayedCall(0, () => { if (!drag.isThrowing) dragging = false; });
      },
      onThrowComplete() { dragging = false; },
    })[0];

    /* ← / → while the section is pinned (never while typing, e.g. terminal) */
    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (!pinnedNow()) return;
      e.preventDefault();
      const base = navTween ? navIndex : Math.round(st.progress * (n - 1));
      goTo(base + (e.key === 'ArrowRight' ? 1 : -1));
      hideHint();
    };

    /* ── One-time entrance: the arc unfolds as the section scrolls in ── */
    const finishIntro = () => { state.intro = 1; state.introDone = true; render(); };
    const introST = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        /* page restored below the section → no show, just be ready */
        if (section.getBoundingClientRect().bottom < 0) { finishIntro(); return; }
        introTween = gsap.to(state, { intro: 1, duration: 1.5, ease: 'none', onUpdate: render, onComplete: finishIntro });
      },
    });

    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', killNav, { passive: true });
    window.addEventListener('touchstart', killNav, { passive: true });
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerleave', onPointerLeave);

    return () => {
      ScrollTrigger.removeEventListener('scrollEnd', onScrollEnd);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', killNav);
      window.removeEventListener('touchstart', killNav);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerleave', onPointerLeave);
      killNav();
      if (introTween) introTween.kill();
      if (indTween) indTween.kill();
      drag.kill();
      introST.kill();
      st.kill();
      gsap.killTweensOf([state, floor, countRef.current, indRef.current, ...tilts, ...labels, ...tagsOf(cards)]);
      cards.forEach((c) => stopScramble(c.querySelector('.ak-orbit-label')));
    };
  }, []);

  return (
    <section id="stack" ref={sectionRef} style={{
      position: 'relative',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderTop: '1px solid var(--border-subtle)',
    }}>

      {/* ── Section heading (stays at the top of the pin) ── */}
      <div style={{
        flexShrink: 0,
        width: '100%',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: `${HEADER_CLEARANCE}px var(--container-pad) 0`,
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 3,
      }}>
        <StackHeading />
      </div>

      {/* ── The orbit ── */}
      <div className="ak-orbit-stage" ref={stageRef} aria-roledescription="carousel" aria-label="Tech stack"
        data-cursor="drag" data-cursor-label="‹ drag ›">
        <div className="ak-orbit-floor" ref={floorRef} aria-hidden="true" />
        {GROUPS.map((g, i) => (
          <div
            key={g.label}
            className="ak-orbit-card"
            ref={(el) => { cardsRef.current[i] = el; }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}: ${g.label}`}
          >
            <div className="ak-orbit-tilt">
              <StackCardFace g={g} i={i} light />
            </div>
          </div>
        ))}
      </div>

      {/* ── HUD: counter · tabs · hint ── */}
      <div className="ak-orbit-nav">
        <div className="ak-orbit-count" aria-hidden="true">
          <b ref={countRef}>01</b><span>&nbsp;/ {pad2(n)}</span>
        </div>
        <div className="ak-orbit-tabs">
          {GROUPS.map((g, i) => (
            <button
              key={g.label}
              type="button"
              className="ak-orbit-tab"
              ref={(el) => { tabsRef.current[i] = el; }}
              aria-label={`Show ${g.label}`}
              onClick={() => api.current.goTo(i)}
            >
              <span>{pad2(i + 1)}</span>
              <span className="ak-orbit-tab-label"><span>{g.label}</span></span>
            </button>
          ))}
          <span className="ak-orbit-ind" ref={indRef} aria-hidden="true" />
        </div>
        <div className="ak-orbit-hint" ref={hintRef} aria-hidden="true">drag · ← →</div>
      </div>

    </section>
  );
}

/* ── Mobile: swipe carousel in normal flow (no pin) ── */
function StackMobile() {
  const stageRef = React.useRef(null);
  const cardsRef = React.useRef([]);
  const dotsRef  = React.useRef([]);
  const api      = React.useRef({ goTo: () => {} });

  React.useLayoutEffect(() => {
    const stage  = stageRef.current;
    const cards  = cardsRef.current;
    const dots   = dotsRef.current;
    const shades = cards.map((c) => c.querySelector('.ak-orbit-shade'));
    const state  = { pos: 0, dot: -1, shown: -1, entered: false };
    let step = 1, drag = null, navTween = null, pressIndex = 0;

    const measure = () => {
      /* neighbours tuck slightly behind the front card so ~30px of them
         peeks in at each edge — the visual cue that it swipes */
      step = cards[0].offsetWidth * 0.88;
      if (drag) drag.applyBounds({ minX: -(n - 1) * step, maxX: 0 });
    };
    const render = () => {
      for (let i = 0; i < n; i++) {
        const d = i - state.pos, ad = Math.abs(d);
        const op = clamp(2.2 - ad, 0, 1);   // opaque; the shade does the dimming
        const card = cards[i];
        card.style.transform =
          `translate3d(${(d * step).toFixed(1)}px, 0, 0) rotateY(${clamp(d * 14, -24, 24).toFixed(2)}deg) scale(${(1 - Math.min(ad, 2) * 0.1).toFixed(3)})`;
        card.style.opacity = op.toFixed(3);
        card.style.visibility = op < 0.01 ? 'hidden' : 'visible';
        card.style.zIndex = String(100 - Math.round(ad * 10));
        shades[i].style.opacity = Math.min(ad * 0.55, 0.9).toFixed(3);
      }
      const active = clamp(Math.round(state.pos), 0, n - 1);
      if (active !== state.dot) {
        state.dot = active;
        dots.forEach((el, i) => {
          el.classList.toggle('is-active', i === active);
          if (i === active) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
        });
      }
      if (state.entered && active !== state.shown) {
        focusCard(cards, active, state.shown);
        state.shown = active;
      }
    };

    gsap.set(tagsOf(cards), { opacity: TAG_DIM });
    measure();
    render();

    const proxy = document.createElement('div');
    const sync = function () { state.pos = -this.x / step; render(); };
    drag = Draggable.create(proxy, {
      type: 'x',
      trigger: stage,
      inertia: true,
      allowNativeTouchScrolling: true,     // vertical swipes still scroll the page
      edgeResistance: 0.85,
      bounds: { minX: -(n - 1) * step, maxX: 0 },
      throwResistance: 2200,
      snap: { x: (v) => -clamp(clamp(Math.round(-v / step), pressIndex - MAX_THROW, pressIndex + MAX_THROW), 0, n - 1) * step },
      onPress() {
        if (navTween) navTween.kill();
        pressIndex = Math.round(state.pos);
        gsap.set(proxy, { x: -state.pos * step });
        this.update();
      },
      onDrag: sync,
      onThrowUpdate: sync,
    })[0];

    const goTo = (i) => {
      if (navTween) navTween.kill();
      navTween = gsap.to(state, { pos: clamp(i, 0, n - 1), duration: 0.7, ease: 'power3.out', onUpdate: render });
    };
    api.current.goTo = goTo;

    /* first card comes alive once the carousel scrolls into view */
    const enterST = ScrollTrigger.create({
      trigger: stage,
      start: 'top 80%',
      once: true,
      onEnter: () => { state.entered = true; render(); },
    });

    const onResize = () => { measure(); render(); };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (navTween) navTween.kill();
      drag.kill();
      enterST.kill();
      gsap.killTweensOf([state, ...tagsOf(cards)]);
      cards.forEach((c) => stopScramble(c.querySelector('.ak-orbit-label')));
    };
  }, []);

  return (
    <section id="stack" style={{
      position: 'relative',
      padding: 'var(--section-gap) 0',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <StackHeading />
      </div>

      <div className="ak-swipe" ref={stageRef} aria-roledescription="carousel" aria-label="Tech stack"
        data-cursor="drag" data-cursor-label="‹ swipe ›">
        {GROUPS.map((g, i) => (
          <div
            key={g.label}
            className="ak-orbit-card"
            ref={(el) => { cardsRef.current[i] = el; }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}: ${g.label}`}
          >
            <StackCardFace g={g} i={i} />
          </div>
        ))}
      </div>

      <div className="ak-swipe-dots">
        {GROUPS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            className="ak-swipe-dot"
            ref={(el) => { dotsRef.current[i] = el; }}
            aria-label={`Show ${g.label}`}
            onClick={() => api.current.goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Reduced motion (or motion libs failed to load): static grid ── */
function StackStatic() {
  return (
    <section id="stack" style={{
      position: 'relative',
      padding: 'var(--section-gap) 0',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <StackHeading />
        <div className="ak-stack-grid">
          {GROUPS.map((g, i) => <StackCardFace key={g.label} g={g} i={i} />)}
        </div>
      </div>
    </section>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/* Draggable / Inertia come from the CDN — if any didn't load, stay static */
const HAS_MOTION_LIBS = typeof window !== 'undefined'
  && !!(window.gsap && window.ScrollTrigger && window.Draggable && window.InertiaPlugin);

function Stack() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile  = useMediaQuery('(max-width: 767px)');

  /* key forces a clean remount when the layout changes so GSAP/pin fully
     tears down instead of leaving a stale ScrollTrigger behind */
  if (reduced || !HAS_MOTION_LIBS) return <StackStatic key="static" />;
  return mobile ? <StackMobile key="mobile" /> : <StackDesktop key="desktop" />;
}
window.Stack = Stack;
window.__akStackGroups = GROUPS; // data export for CommandTerminal's `stack` command
