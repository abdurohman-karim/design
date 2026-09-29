// Portfolio — Projects. console.log('Projects'): a bento grid of project cards.
// Each card carries a live monochrome "system preview" (ProjectPreviews.jsx)
// that plays while the card is on screen and speeds up under the pointer.
// The cursor locks onto a card with corner brackets (CustomCursor,
// data-cursor="lock"); features open in place of the preview, so opening them
// never reflows the grid. Wrapped in an IIFE: Babel script tags share one
// global scope, and Stack.jsx already owns names like `n` / `clamp`.
(() => {
  const { SectionHeading, Tag, Icon } = window.DS;

  /* Visual order = numbering. size: xl 7/12 · lg 5/12 · md 4/12 */
  const PROJECTS = [
    {
      title: 'uCash', size: 'xl', preview: 'ucash',
      kind: 'Payments platform · Laravel / PHP',
      href: 'https://u-cash.uz',
      description: 'Money-transfer & payments platform with deep admin tooling and SBP (Faster Payments) integration.',
      features: [
        'Black / white-list system to block suspicious clients',
        'Universal transfer-method toggle (SBP & others) from admin — no hardcode',
        'Branch-load forecasting via weighted alpha-blending, with Excel export',
        'PDF receipt generator with Control Number of Transfer (CNT)',
        'Failed-transfer reason dashboard from JSON analysis',
      ],
      stack: ['PHP', 'Laravel', 'PostgreSQL', 'Redis', 'Docker'],
    },
    {
      title: 'Coddle', size: 'lg', preview: 'coddle',
      kind: 'Coding-practice platform · Next.js / NestJS',
      href: 'https://coddle.uz',
      description: 'Coding-practice platform with an AI tutor, 1v1 real-time battles and a classroom layer for teachers — in Uzbek, Russian and English.',
      features: [
        'Leveled AI hints (Gemini) that nudge, never solve',
        'Sandboxed judging via Piston / Judge0 — Python, JS, C++, Java',
        '1v1 battles: matchmaking, ELO rating, live verdicts over WebSockets',
        'Organizations & roles: teacher dashboard, assignments, org leaderboard',
        'XP, streaks, achievements + Excel task-bank import / export',
      ],
      stack: ['TypeScript', 'Next.js', 'NestJS', 'Prisma', 'PostgreSQL', 'Redis', 'Docker'],
    },
    {
      title: 'NutriCore', size: 'md', preview: 'nutricore',
      kind: 'AI nutrition assistant · Python / Telegram',
      href: 'https://t.me/nutricoreuz_bot',
      description: 'Telegram nutrition assistant powered by a multi-provider LLM router with flexible subscriptions.',
      features: [
        'Multi-provider LLM router (OpenAI, Groq, DeepSeek, OpenRouter)',
        'Free / Premium / Premium+ tiers via a feature registry',
        'Meal simulation with timezones and MealLog snapshots',
        'Tri-lingual support + admin panel',
      ],
      stack: ['Python', 'aiogram', 'PostgreSQL', 'Redis'],
    },
    {
      title: 'Video Downloader Bot', size: 'md', preview: 'downloader',
      kind: 'Telegram bot · aiogram 3 / yt-dlp',
      href: 'https://t.me/keepdownload_bot',
      description: 'High-throughput Telegram bot that downloads Instagram / TikTok video with quality selection.',
      features: [
        'FSM-driven quality picker (Instagram / TikTok)',
        'Asyncio queue worker pool for high load',
        'Channel-subscription gating + multilingual UI',
        'aiosqlite-backed admin panel',
      ],
      stack: ['Python', 'aiogram', 'yt-dlp', 'aiosqlite'],
    },
    {
      title: 'MJ Bazaar', size: 'md', preview: 'bazaar',
      kind: 'E-commerce storefront · Laravel',
      href: 'https://apps.apple.com/us/app/mj-bazaar/id6784791264',
      description: 'Laravel e-commerce build with Uzbekistan geodata and config-switchable ordering.',
      features: [
        'Uzbekistan geodata (regions / districts)',
        'OTP test users for QA flows',
        'Order-request system, toggleable via config',
      ],
      stack: ['PHP', 'Laravel', 'PostgreSQL'],
    },
  ].map((p, i) => ({ ...p, index: i + 1 }));

  /* what the cursor pill says, from where the link goes */
  const ctaFor = (href) => (/t\.me\//.test(href) ? 'Open bot ↗'
    : /apps\.apple\.com/.test(href) ? 'App Store ↗' : 'Visit site ↗');

  const pad2 = (v) => String(v).padStart(2, '0');

  /* ── Styles — injected once ── */
  if (!document.getElementById('ak-proj-css')) {
    const s = document.createElement('style');
    s.id = 'ak-proj-css';
    s.textContent = `
      .ak-proj-grid {
        display: grid; grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 20px; margin-top: 56px;
      }
      .ak-proj { position: relative; min-width: 0; grid-column: span 4; }
      .ak-proj--xl { grid-column: span 7; }
      .ak-proj--lg { grid-column: span 5; }
      @media (max-width: 1024px) {
        .ak-proj, .ak-proj--lg { grid-column: span 6; }
        .ak-proj--xl { grid-column: span 12; }
      }
      @media (max-width: 700px) {
        .ak-proj, .ak-proj--lg, .ak-proj--xl { grid-column: span 12; }
      }

      .ak-proj-shell {
        position: relative; height: 100%; box-sizing: border-box;
        display: flex; flex-direction: column; overflow: hidden;
        border-radius: 22px; border: 1px solid var(--border);
        background: var(--surface-card);
        backdrop-filter: blur(var(--blur-md)); -webkit-backdrop-filter: blur(var(--blur-md));
        box-shadow: var(--inset-hairline);
        transition: border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-slow) var(--ease-out);
      }
      .ak-proj:hover .ak-proj-shell { border-color: var(--border-strong); box-shadow: var(--glow-halo-md), var(--inset-hairline); }

      /* preview stage: blueprint grid behind the diagram */
      .ak-proj-stage {
        position: relative; flex-shrink: 0; height: 236px; overflow: hidden;
        border-bottom: 1px solid var(--border-subtle);
        background: radial-gradient(ellipse 80% 90% at 50% 0%, var(--white-a04), transparent 70%);
      }
      .ak-proj--xl .ak-proj-stage, .ak-proj--lg .ak-proj-stage { height: 260px; }
      .ak-proj-stage::before {
        content: ""; position: absolute; inset: 0; pointer-events: none;
        background-image:
          linear-gradient(var(--white-a04) 1px, transparent 1px),
          linear-gradient(90deg, var(--white-a04) 1px, transparent 1px);
        background-size: 24px 24px;
        -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%);
        mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%);
      }
      .ak-proj-preview { position: absolute; inset: 10px 12px; will-change: transform; }
      .ak-proj-preview > svg { width: 100%; height: 100%; display: block; overflow: visible; }
      .ak-proj-features {
        position: absolute; inset: 0; padding: 20px 26px; overflow: auto;
        opacity: 0; visibility: hidden;
      }
      .ak-proj-feat-head {
        font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .14em;
        color: var(--text-faint); margin-bottom: 14px;
      }
      .ak-proj-features ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
      .ak-proj-features li {
        display: flex; gap: 10px; font-family: var(--font-sans); font-size: 13.5px;
        line-height: 1.5; color: var(--text-secondary);
      }
      .ak-proj-features li::before { content: "›"; font-family: var(--font-mono); color: var(--text-muted); }
      /* reveal scanline */
      .ak-proj-scan {
        position: absolute; left: 0; right: 0; top: 0; height: 1px; z-index: 4; pointer-events: none;
        background: var(--text-primary); box-shadow: 0 0 16px 2px var(--glow-strong); opacity: 0;
      }

      .ak-proj-body { flex: 1; display: flex; flex-direction: column; gap: 14px; padding: 24px 26px 22px; }
      .ak-proj-meta {
        display: flex; align-items: center; gap: 12px;
        font-family: var(--font-mono); font-size: 11px; letter-spacing: .16em;
        text-transform: uppercase; color: var(--text-muted);
      }
      .ak-proj-meta b { font-weight: 400; color: var(--text-faint); letter-spacing: .24em; }
      .ak-proj-arrow {
        margin-left: auto; display: inline-flex; color: var(--text-muted);
        transition: transform var(--dur-slow) var(--ease-out), color var(--dur-base) var(--ease-out);
      }
      .ak-proj:hover .ak-proj-arrow { transform: translate(3px, -3px); color: var(--text-primary); }
      .ak-proj-title {
        margin: 0; font-family: var(--font-display); font-size: 28px; font-weight: 500;
        letter-spacing: -.02em; line-height: 1.1; color: var(--text-primary);
      }
      .ak-proj--xl .ak-proj-title, .ak-proj--lg .ak-proj-title { font-size: 34px; }
      .ak-proj-title span { font-variant-numeric: tabular-nums; }
      /* stretched link: the whole card is the link, the features button sits above it */
      .ak-proj-link { color: inherit; text-decoration: none; outline: none; }
      .ak-proj-link::after { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: 22px; }
      .ak-proj-link:focus-visible::after { outline: 1px solid var(--border-strong); outline-offset: 3px; }
      .ak-proj-desc {
        margin: 0; font-family: var(--font-sans); font-size: 15px; line-height: 1.6;
        color: var(--text-secondary); text-wrap: pretty;
      }
      .ak-proj-foot { margin-top: auto; padding-top: 4px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
      .ak-proj-tags { display: flex; flex-wrap: wrap; gap: 8px; }
      .ak-proj-more {
        position: relative; z-index: 2; flex-shrink: 0; margin: 0;
        appearance: none; background: none; border: 1px solid var(--border); border-radius: 999px;
        padding: 7px 12px; font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .14em;
        text-transform: uppercase; white-space: nowrap; color: var(--text-muted);
        transition: color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
      }
      .ak-proj-more:hover, .ak-proj-more[aria-expanded="true"] { color: var(--text-primary); border-color: var(--border-strong); }
      .ak-proj-more:focus-visible { outline: 1px solid var(--border-strong); outline-offset: 2px; }
    `;
    document.head.appendChild(s);
  }

  /* ── One card ── */
  function ProjectTile({ p }) {
    const cardRef = React.useRef(null);
    const tlRef = React.useRef(null);        // preview timeline (set by the preview)
    const openRef = React.useRef(false);
    const visibleRef = React.useRef(false);
    const [open, setOpen] = React.useState(false);
    const Preview = window.AkPreviews[p.preview];
    const featId = `ak-proj-feat-${p.index}`;

    React.useLayoutEffect(() => {
      const card = cardRef.current;
      const shell = card.querySelector('.ak-proj-shell');
      const preview = card.querySelector('.ak-proj-preview');
      const title = card.querySelector('.ak-proj-title span');
      const tl = tlRef.current;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const canHover = window.matchMedia('(hover: hover)').matches;

      if (reduced) {
        if (tl) tl.seek('still').pause();      // static, fully drawn frame
        return undefined;
      }

      /* the preview only runs while the card is on screen */
      const vis = ScrollTrigger.create({
        trigger: card, start: 'top bottom', end: 'bottom top',
        onToggle: (self) => {
          visibleRef.current = self.isActive;
          if (!tl) return;
          if (self.isActive && !openRef.current) tl.play(); else tl.pause();
        },
      });

      /* pointer: cursor light, preview parallax, faster preview, title decrypt */
      const px = gsap.quickTo(preview, 'x', { duration: 0.8, ease: 'power3.out' });
      const py = gsap.quickTo(preview, 'y', { duration: 0.8, ease: 'power3.out' });
      const onEnter = () => {
        if (tl) gsap.to(tl, { timeScale: 1.7, duration: 0.4, overwrite: true });
        window.akMotion.scramble(title, 0.6);
      };
      const onMove = (e) => {
        const r = shell.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
        shell.style.setProperty('--mx', `${(mx * 100).toFixed(1)}%`);
        shell.style.setProperty('--my', `${(my * 100).toFixed(1)}%`);
        shell.style.setProperty('--spot', '1');
        px((0.5 - mx) * 14);
        py((0.5 - my) * 8);
      };
      const onLeave = () => {
        shell.style.setProperty('--spot', '0');
        px(0); py(0);
        if (tl) gsap.to(tl, { timeScale: 1, duration: 0.6, overwrite: true });
      };
      if (canHover) {
        card.addEventListener('pointerenter', onEnter);
        card.addEventListener('pointermove', onMove);
        card.addEventListener('pointerleave', onLeave);
      }

      return () => {
        vis.kill();
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
        gsap.killTweensOf(preview);
        if (tl) gsap.killTweensOf(tl);
        window.akMotion.scrambleStop(title);
      };
    }, []);

    /* features take the preview's place — no layout shift, no grid reflow */
    const toggle = () => {
      const next = !openRef.current;
      openRef.current = next;
      setOpen(next);
      const card = cardRef.current;
      const preview = card.querySelector('.ak-proj-preview');
      const feat = card.querySelector('.ak-proj-features');
      const items = feat.querySelectorAll('.ak-proj-feat-head, li');
      const tl = tlRef.current;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const d = (t) => (reduced ? 0 : t);
      if (next) {
        if (tl) tl.pause();
        gsap.to(preview, { opacity: 0, scale: 0.97, filter: 'blur(6px)', duration: d(0.35), ease: 'power2.out', overwrite: 'auto' });
        gsap.set(feat, { visibility: 'visible' });
        gsap.to(feat, { opacity: 1, duration: d(0.3), delay: d(0.1), overwrite: 'auto' });
        gsap.fromTo(items, { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: d(0.45), stagger: d(0.05), delay: d(0.12), ease: 'power3.out', overwrite: 'auto' });
      } else {
        gsap.to(feat, {
          opacity: 0, duration: d(0.25), overwrite: 'auto',
          onComplete: () => { if (!openRef.current) gsap.set(feat, { visibility: 'hidden' }); },
        });
        gsap.to(preview, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: d(0.45), delay: d(0.1), ease: 'power3.out', overwrite: 'auto' });
        if (tl && visibleRef.current && !reduced) tl.play();
      }
    };

    return (
      <article
        ref={cardRef}
        className={`ak-proj ak-proj--${p.size}`}
        data-cursor="lock"
        data-cursor-label={ctaFor(p.href)}
      >
        <div className="ak-proj-shell">
          <div className="ak-light-spot" />

          <div className="ak-proj-stage">
            <div className="ak-proj-preview">{Preview && <Preview apiRef={tlRef} />}</div>
            <div className="ak-proj-features" id={featId} aria-hidden={!open}>
              <div className="ak-proj-feat-head">$ cat {p.title.toLowerCase().replace(/\s+/g, '-')}/features.md</div>
              <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
            <div className="ak-proj-scan" />
          </div>

          <div className="ak-proj-body">
            <div className="ak-proj-meta">
              <b>{pad2(p.index)}</b>
              <span>{p.kind}</span>
              <span className="ak-proj-arrow"><Icon name="arrowUpRight" size={18} /></span>
            </div>
            <h3 className="ak-proj-title">
              <a className="ak-proj-link" href={p.href} target="_blank" rel="noopener noreferrer">
                <span>{p.title}</span>
              </a>
            </h3>
            <p className="ak-proj-desc">{p.description}</p>
            <div className="ak-proj-foot">
              <div className="ak-proj-tags">{p.stack.map((t) => <Tag key={t} size="sm">{t}</Tag>)}</div>
              <button
                type="button"
                className="ak-proj-more"
                data-cursor="frame"
                aria-expanded={open}
                aria-controls={featId}
                onClick={toggle}
              >
                {open ? '− preview' : `+ ${p.features.length} features`}
              </button>
            </div>
          </div>

          <div className="ak-light-edge" />
        </div>
      </article>
    );
  }

  function Projects() {
    const gridRef = React.useRef(null);

    /* scroll-in: each card opens top → down behind a scanline, then the
       preview "boots" with a short CRT flicker (a nod to the intro TV) */
    React.useLayoutEffect(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
      const cards = [...gridRef.current.querySelectorAll('.ak-proj')];
      const shells = cards.map((c) => c.querySelector('.ak-proj-shell'));
      gsap.set(shells, { clipPath: 'inset(0% 0% 100% 0% round 22px)' });

      const reveal = (card, delay) => {
        const shell = card.querySelector('.ak-proj-shell');
        const scan = card.querySelector('.ak-proj-scan');
        const stage = card.querySelector('.ak-proj-stage');
        const tl = gsap.timeline({ delay });
        tl.to(shell, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.1, ease: 'power3.inOut', clearProps: 'clipPath' })
          .fromTo(scan, { opacity: 1, top: '0%' }, { top: '100%', duration: 0.55, ease: 'power2.inOut' }, 0.05)
          .to(scan, { opacity: 0, duration: 0.2 })
          .fromTo(stage, { opacity: 0 }, {
            keyframes: [{ opacity: 0.8, duration: 0.05 }, { opacity: 0.15, duration: 0.07 }, { opacity: 1, duration: 0.3 }],
            clearProps: 'opacity',
          }, 0.45);
      };
      const triggers = ScrollTrigger.batch(cards, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => batch.forEach((card, i) => reveal(card, i * 0.12)),
      });

      return () => {
        triggers.forEach((t) => t.kill());
        gsap.killTweensOf(shells);
        gsap.set(shells, { clearProps: 'clipPath' });
      };
    }, []);

    return (
      <section id="projects" style={{ padding: 'var(--section-gap) 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          <SectionHeading index={3} title="Projects"
            code={<><span style={{ color: 'var(--gray-400)' }}>console.log</span>(<span style={{ color: 'var(--gray-300)' }}>'Projects'</span>)</>}
            lede="Selected fintech & AI systems — payments, LLM routing, automation and storefronts." />
          <div className="ak-proj-grid" ref={gridRef}>
            {PROJECTS.map((p) => <ProjectTile key={p.title} p={p} />)}
          </div>
        </div>
      </section>
    );
  }

  window.Projects = Projects;
  window.__akProjects = PROJECTS; // data export for CommandTerminal's `ls projects` command
})();
