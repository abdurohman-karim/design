// Portfolio — ProjectPreviews. One small monochrome "system preview" per
// project: an SVG diagram of what the system does, animated by a looping GSAP
// timeline. Previews only build their timeline (paused); the project card
// decides when it plays (on screen), how fast (hover) and, under reduced
// motion, seeks it to the 'still' label for a static frame.
//
// Every state is its own element toggled by opacity/transform (no text
// swapping in callbacks), so any point of a timeline can be seeked cleanly.
(() => {
  const INK = {
    line:  'var(--border-strong)',
    soft:  'var(--border)',
    faint: 'var(--text-faint)',
    muted: 'var(--text-muted)',
    text:  'var(--text-secondary)',
    hi:    'var(--text-primary)',
    panel: 'var(--surface-raised)',
    bg:    'var(--bg)',
  };
  const CHAR_W = 0.6;   // JetBrains Mono advance, em

  /* mono SVG text */
  function T({ x, y, size = 11, c = 'text', anchor, ls, weight, cls, children, pre }) {
    return (
      <text x={x} y={y} textAnchor={anchor} className={cls}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: size, fill: INK[c],
          letterSpacing: ls, fontWeight: weight, whiteSpace: pre ? 'pre' : undefined,
        }}>
        {children}
      </text>
    );
  }
  /* outlined panel */
  function Box({ x, y, w, h, r = 10, stroke = 'line', fill = 'panel', cls, sw = 1 }) {
    return <rect x={x} y={y} width={w} height={h} rx={r} className={cls}
      style={{ fill: INK[fill] || fill, stroke: INK[stroke] || stroke, strokeWidth: sw }} />;
  }

  /* SVG ids must be unique per instance and valid inside url(#…) */
  function useUid(prefix) {
    return prefix + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  }

  /* Build the timeline once inside a gsap.context → one revert() cleans up */
  function usePreviewTimeline(apiRef, build) {
    const root = React.useRef(null);
    React.useLayoutEffect(() => {
      const ctx = gsap.context(() => {
        apiRef.current = build(gsap.utils.selector(root.current));
      }, root);
      return () => { ctx.revert(); apiRef.current = null; };
    }, []);
    return root;
  }
  const loop = () => gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.5, defaults: { ease: 'power2.out' } });

  /* ── uCash: sender → router (SBP) → receiver, receipt CNT, load forecast ── */
  function UcashPreview({ apiRef }) {
    const id = useUid('uc');
    /* deterministic "branch load": measured to the left of now, forecast after */
    const pts = Array.from({ length: 23 }, (_, i) => {
      const x = 16 + (608 * i) / 22;
      const y = 214 - 26 * (0.55 + 0.45 * Math.sin(i * 0.8 + 0.6)) * (0.65 + 0.35 * Math.sin(i * 0.31 + 1.2));
      return [x, y];
    });
    const NOW = 14;
    const toStr = (a) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

    const root = usePreviewTimeline(apiRef, (q) => {
      gsap.set(q('.u-packet'), { x: 166, y: 52, opacity: 0 });
      gsap.set(q('.u-ping'), { opacity: 0, transformOrigin: '50% 50%' });
      gsap.set(q('.u-type'), { attr: { width: 0 } });
      gsap.set(q('.u-ok'), { opacity: 0 });
      gsap.set(q('.u-stamp'), { opacity: 0, scale: 1.3, rotation: -6, transformOrigin: '50% 50%' });
      gsap.set(q('.u-sweep'), { attr: { width: 0 } });

      const tl = loop();
      tl.to(q('.u-packet'), { opacity: 1, duration: 0.2 })
        .to(q('.u-packet'), { x: 245, duration: 0.7, ease: 'power2.inOut' })
        .to(q('.u-packet'), { opacity: 0, duration: 0.1 })
        .set(q('.u-ping-h'), { opacity: 0.8, scale: 1 }, '<')
        .to(q('.u-ping-h'), { opacity: 0, scale: 1.16, duration: 0.5 }, '<')
        .set(q('.u-packet'), { x: 395 })
        .to(q('.u-packet'), { opacity: 1, duration: 0.1 }, '+=0.15')
        .to(q('.u-packet'), { x: 474, duration: 0.7, ease: 'power2.inOut' })
        .to(q('.u-packet'), { opacity: 0, duration: 0.1 })
        .set(q('.u-ping-r'), { opacity: 0.8, scale: 1 }, '<')
        .to(q('.u-ping-r'), { opacity: 0, scale: 1.16, duration: 0.5 }, '<')
        .to(q('.u-type'), { attr: { width: 330 }, duration: 0.9, ease: 'steps(34)' }, '-=0.3')
        .to(q('.u-ok'), { opacity: 1, duration: 0.25 })
        .to(q('.u-stamp'), { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: 'power3.out' }, '<0.1')
        .to(q('.u-sweep'), { attr: { width: 612 }, duration: 1.4, ease: 'power2.inOut' }, '+=0.1')
        .addLabel('still', '+=0.2')
        .to(q('.u-fade'), { opacity: 0, duration: 0.45 }, '+=1.6');
      return tl;
    });

    return (
      <svg ref={root} viewBox="0 0 640 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <clipPath id={`${id}-type`}><rect className="u-type" x="16" y="100" width="0" height="22" /></clipPath>
          <clipPath id={`${id}-sweep`}><rect className="u-sweep" x="10" y="160" width="0" height="90" /></clipPath>
        </defs>

        {/* route */}
        <line x1="166" y1="52" x2="245" y2="52" style={{ stroke: INK.line, strokeDasharray: '3 4' }} />
        <line x1="395" y1="52" x2="474" y2="52" style={{ stroke: INK.line, strokeDasharray: '3 4' }} />
        <Box x={16} y={24} w={150} h={56} />
        <T x={30} y={45} size={9} c="faint" ls="0.16em">SENDER</T>
        <T x={30} y={66} size={11}>UZ · card ••4417</T>
        <Box x={245} y={24} w={150} h={56} stroke="hi" />
        <rect className="u-ping u-ping-h" x="245" y="24" width="150" height="56" rx="10" style={{ fill: 'none', stroke: INK.hi }} />
        <T x={259} y={45} size={9} c="faint" ls="0.16em">UCASH · ROUTER</T>
        <T x={259} y={66} size={11} c="hi">route → SBP</T>
        <Box x={474} y={24} w={150} h={56} />
        <rect className="u-ping u-ping-r" x="474" y="24" width="150" height="56" rx="10" style={{ fill: 'none', stroke: INK.hi }} />
        <T x={488} y={45} size={9} c="faint" ls="0.16em">RECEIVER</T>
        <T x={488} y={66} size={11}>RU · bank ••0932</T>
        <g className="u-packet">
          <circle r="10" style={{ fill: INK.hi, opacity: 0.16 }} />
          <circle r="4" style={{ fill: INK.hi }} />
        </g>

        <g className="u-fade">
          {/* transfer line + receipt */}
          <g clipPath={`url(#${id}-type)`}>
            <T x={16} y={116} size={11.5}>TX 7F3A · 1 250 000 UZS → 8 640 RUB</T>
          </g>
          <T cls="u-ok" x={16} y={146} size={11} c="hi">● 200 OK</T>
          <g className="u-stamp">
            <rect x="96" y="131" width="178" height="22" rx="4" style={{ fill: 'none', stroke: INK.hi }} />
            <T x={185} y={146} size={10.5} c="hi" anchor="middle" ls="0.08em">CNT 4812-0937-66</T>
          </g>

          {/* branch-load forecast */}
          <T x={16} y={176} size={9} c="faint" ls="0.16em">BRANCH LOAD · α-BLEND FORECAST</T>
          <T x={624} y={176} size={9} c="faint" anchor="end" ls="0.16em">XLSX ↓</T>
          <g clipPath={`url(#${id}-sweep)`}>
            <line x1="16" y1="238" x2="624" y2="238" style={{ stroke: INK.soft }} />
            <polyline points={toStr(pts.slice(0, NOW + 1))} style={{ fill: 'none', stroke: INK.text, strokeWidth: 1.5 }} />
            <polyline points={toStr(pts.slice(NOW))} style={{ fill: 'none', stroke: INK.hi, strokeWidth: 1.5, strokeDasharray: '4 4' }} />
            <line x1={pts[NOW][0]} y1="186" x2={pts[NOW][0]} y2="238" style={{ stroke: INK.line, strokeDasharray: '2 3' }} />
            <circle cx={pts[NOW][0]} cy={pts[NOW][1]} r="3" style={{ fill: INK.hi }} />
          </g>
        </g>
      </svg>
    );
  }

  /* ── Coddle: solution types in, tests run, verdict + ELO ── */
  const CODE = [
    [['def', 'hi'], [' two_sum(nums, target):', 'text']],
    [['    seen ', 'text'], ['=', 'hi'], [' {}', 'text']],
    [['    ', 'text'], ['for', 'hi'], [' i, x ', 'text'], ['in', 'hi'], [' enumerate(nums):', 'text']],
    [['        ', 'text'], ['if', 'hi'], [' target - x ', 'text'], ['in', 'hi'], [' seen:', 'text']],
    [['            ', 'text'], ['return', 'hi'], [' [seen[target - x], i]', 'text']],
    [['        seen[x] ', 'text'], ['=', 'hi'], [' i', 'text']],
  ];
  function CoddlePreview({ apiRef }) {
    const id = useUid('cd');
    const FS = 11;
    const lineW = CODE.map((l) => l.reduce((n, [s]) => n + s.length, 0) * FS * CHAR_W);

    const root = usePreviewTimeline(apiRef, (q) => {
      const clips = q('.c-clip');
      gsap.set(clips, { attr: { width: 0 } });
      gsap.set(q('.c-caret'), { x: 0, y: 0, opacity: 0 });
      gsap.set(q('.c-dot'), { opacity: 0.25 });
      gsap.set(q('.c-verdict, .c-elo'), { opacity: 0 });
      gsap.set(q('.c-verdict'), { scale: 0.9, transformOrigin: '50% 50%' });

      const tl = loop();
      tl.to(q('.c-caret'), { opacity: 1, duration: 0.1 });
      CODE.forEach((l, i) => {
        const chars = l.reduce((n, [s]) => n + s.length, 0);
        const dur = chars * 0.03;
        tl.set(q('.c-caret'), { x: 0, y: i * 18 })
          .to(clips[i], { attr: { width: lineW[i] + 2 }, duration: dur, ease: `steps(${chars})` })
          .to(q('.c-caret'), { x: lineW[i], duration: dur, ease: `steps(${chars})` }, '<');
      });
      tl.to(q('.c-caret'), { opacity: 0, duration: 0.1 }, '+=0.2')
        .to(q('.c-dot'), { opacity: 1, duration: 0.15, stagger: 0.22 })
        .to(q('.c-verdict'), { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }, '+=0.1')
        .to(q('.c-elo'), { opacity: 1, duration: 0.3 }, '+=0.15')
        .addLabel('still', '+=0.2')
        .to(q('.c-fade'), { opacity: 0, duration: 0.45 }, '+=1.6');
      return tl;
    });

    return (
      <svg ref={root} viewBox="0 0 480 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          {CODE.map((_, i) => (
            <clipPath key={i} id={`${id}-l${i}`}>
              <rect className="c-clip" x="46" y={58 + i * 18} width="0" height="16" />
            </clipPath>
          ))}
        </defs>
        <Box x={8} y={8} w={464} h={234} r={12} />
        {[28, 40, 52].map((cx) => <circle key={cx} cx={cx} cy="26" r="3.5" style={{ fill: INK.line }} />)}
        <T x={74} y={30} size={10} c="muted">two_sum.py</T>
        <T x={458} y={30} size={9} c="faint" anchor="end" ls="0.14em">PYTHON 3 · JUDGE0</T>
        <line x1="8" y1="42" x2="472" y2="42" style={{ stroke: INK.soft }} />

        <g className="c-fade">
          {CODE.map((l, i) => (
            <g key={i}>
              <T x={24} y={70 + i * 18} size={10} c="faint">{i + 1}</T>
              <g clipPath={`url(#${id}-l${i})`}>
                <text x="46" y={70 + i * 18} style={{ fontFamily: 'var(--font-mono)', fontSize: FS, whiteSpace: 'pre' }}>
                  {l.map(([s, c], k) => <tspan key={k} style={{ fill: INK[c] }}>{s}</tspan>)}
                </text>
              </g>
            </g>
          ))}
          <rect className="c-caret" x="46" y="60" width="6" height="13" style={{ fill: INK.hi }} />

          <line x1="8" y1="180" x2="472" y2="180" style={{ stroke: INK.soft }} />
          <T x={24} y={206} size={10} c="muted" ls="0.14em">RUN ▸</T>
          {[0, 1, 2, 3].map((k) => <circle key={k} className="c-dot" cx={82 + k * 16} cy="202" r="4" style={{ fill: INK.hi }} />)}
          <T x={148} y={206} size={10} c="faint" ls="0.1em">4/4 TESTS</T>
          <g className="c-verdict">
            <rect x="300" y="189" width="156" height="24" rx="12" style={{ fill: INK.hi }} />
            <T x={378} y={205} size={10.5} c="bg" anchor="middle" ls="0.12em" weight={600}>ACCEPTED · 42 MS</T>
          </g>
          <T cls="c-elo" x={24} y={230} size={10} c="text" ls="0.06em">ELO 1432 → 1444  (+12)  · battle won</T>
        </g>
      </svg>
    );
  }

  /* ── NutriCore: meal in → router picks a model → macros back ── */
  function NutriPreview({ apiRef }) {
    const root = usePreviewTimeline(apiRef, (q) => {
      gsap.set(q('.n-user'), { opacity: 0, y: 8 });
      gsap.set(q('.n-bot'), { opacity: 0, y: 8 });
      gsap.set(q('.n-typing circle'), { opacity: 0.2 });
      gsap.set(q('.n-line'), { opacity: 0, x: -6 });
      gsap.set(q('.n-model'), { opacity: 0, y: 8 });
      gsap.set(q('.n-tier-on'), { opacity: 0 });

      const tl = loop();
      tl.to(q('.n-user'), { opacity: 1, y: 0, duration: 0.4 })
        .to(q('.n-bot'), { opacity: 1, y: 0, duration: 0.35 }, '+=0.2')
        .to(q('.n-typing circle'), { opacity: 1, duration: 0.2, stagger: { each: 0.12, repeat: 5, yoyo: true } }, '<');
      /* the router tries providers while the bot "types" */
      ['.n-m1', '.n-m2', '.n-m3'].forEach((m, i) => {
        tl.to(q(m), { opacity: 1, y: 0, duration: 0.25 }, i === 0 ? '<' : '+=0.25');
        if (i < 2) tl.to(q(m), { opacity: 0, y: -8, duration: 0.25 }, '+=0.35');
      });
      tl.to(q('.n-typing'), { opacity: 0, duration: 0.15 })
        .to(q('.n-line'), { opacity: 1, x: 0, duration: 0.35, stagger: 0.15 })
        .to(q('.n-tier-on'), { opacity: 1, duration: 0.3 }, '+=0.1')
        .addLabel('still', '+=0.2')
        .to(q('.n-fade'), { opacity: 0, duration: 0.45 }, '+=1.6');
      return tl;
    });

    return (
      <svg ref={root} viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <T x={16} y={28} size={11} c="hi" weight={600}>@nutricoreuz_bot</T>
        <T x={16} y={44} size={9} c="faint" ls="0.14em">AI NUTRITION · UZ / RU / EN</T>
        <Box x={238} y={14} w={146} h={24} r={12} fill="none" />
        <T x={252} y={30} size={9} c="faint" ls="0.14em">LLM</T>
        <g className="n-model n-m1"><T x={372} y={30} size={10} c="text" anchor="end" ls="0.1em">OPENAI</T></g>
        <g className="n-model n-m2"><T x={372} y={30} size={10} c="text" anchor="end" ls="0.1em">GROQ</T></g>
        <g className="n-model n-m3"><T x={372} y={30} size={10} c="hi" anchor="end" ls="0.1em">DEEPSEEK ✓</T></g>

        <g className="n-fade">
          <g className="n-user">
            <rect x="160" y="60" width="224" height="30" rx="12" style={{ fill: INK.hi }} />
            <T x={372} y={79} size={11} c="bg" anchor="end">grilled chicken 200g + rice</T>
          </g>
          <g className="n-bot">
            <Box x={16} y={104} w={262} h={84} r={12} />
            <g className="n-typing">
              {[0, 1, 2].map((k) => <circle key={k} cx={36 + k * 12} cy="146" r="3.5" style={{ fill: INK.muted }} />)}
            </g>
            <g className="n-line"><T x={32} y={132} size={15} c="hi" weight={600}>≈ 520 kcal</T></g>
            <g className="n-line"><T x={32} y={155} size={11}>P 48 g · C 45 g · F 12 g</T></g>
            <g className="n-line"><T x={32} y={175} size={9.5} c="faint">meal logged · 13:40 Asia/Tashkent</T></g>
          </g>
          {/* subscription tiers */}
          {['FREE', 'PREMIUM', 'PREMIUM+'].map((t, i) => {
            const x = 16 + i * 92;
            return (
              <g key={t}>
                <Box x={x} y={206} w={84} h={24} r={12} fill="none" stroke="soft" />
                <T x={x + 42} y={222} size={9.5} c="muted" anchor="middle" ls="0.12em">{t}</T>
              </g>
            );
          })}
          <g className="n-tier-on">
            <rect x="200" y="206" width="84" height="24" rx="12" style={{ fill: INK.hi }} />
            <T x={242} y={222} size={9.5} c="bg" anchor="middle" ls="0.12em" weight={600}>PREMIUM+</T>
          </g>
        </g>
      </svg>
    );
  }

  /* ── Video Downloader Bot: asyncio pool, 4 workers, queue drains ── */
  const JOBS = [
    ['tiktok · 1080p', 1.5, 0],
    ['instagram · reel', 2.2, 0.25],
    ['tiktok · 720p', 1.1, 0.5],
    ['instagram · story', 1.8, 0.7],
  ];
  function DownloaderPreview({ apiRef }) {
    const root = usePreviewTimeline(apiRef, (q) => {
      const bars = q('.d-bar'), done = q('.d-done'), queue = q('.d-q');
      gsap.set(bars, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(done, { opacity: 0, x: -6 });
      gsap.set(queue, { opacity: 1 });

      const tl = loop();
      JOBS.forEach(([, dur, at], i) => {
        tl.to(bars[i], { scaleX: 1, duration: dur, ease: 'power1.inOut' }, at)
          .to(done[i], { opacity: 1, x: 0, duration: 0.3 }, at + dur)
          .to(queue[queue.length - 1 - i], { opacity: 0.15, duration: 0.2 }, at + dur);
      });
      tl.addLabel('still', '+=0.3')
        .to(q('.d-fade'), { opacity: 0, duration: 0.45 }, '+=1.4');
      return tl;
    });

    return (
      <svg ref={root} viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <T x={16} y={28} size={9} c="faint" ls="0.16em">ASYNCIO POOL · 4 WORKERS</T>
        <T x={262} y={28} size={9} c="faint" ls="0.16em">QUEUE</T>
        {Array.from({ length: 8 }, (_, k) => (
          <rect key={k} className="d-q" x={306 + k * 10} y="20" width="7" height="10" rx="1.5" style={{ fill: INK.hi }} />
        ))}
        <g className="d-fade">
          {JOBS.map(([job], i) => {
            const y = 66 + i * 40;
            return (
              <g key={job}>
                <T x={16} y={y + 4} size={9.5} c="faint" ls="0.1em">{`W${i + 1}`}</T>
                <T x={46} y={y - 6} size={10.5} c="text">{job}</T>
                <rect x="46" y={y + 2} width="270" height="4" rx="2" style={{ fill: INK.soft }} />
                <rect className="d-bar" x="46" y={y + 2} width="270" height="4" rx="2" style={{ fill: INK.hi }} />
                <g className="d-done"><T x={384} y={y + 7} size={10} c="hi" anchor="end" ls="0.1em">✓ SENT</T></g>
              </g>
            );
          })}
        </g>
        <T x={16} y={236} size={9} c="faint" ls="0.1em">yt-dlp · channel gate ✓ · uz / ru / en</T>
      </svg>
    );
  }

  /* ── MJ Bazaar: add to cart → pick region → OTP → order request ── */
  function BazaarPreview({ apiRef }) {
    const root = usePreviewTimeline(apiRef, (q) => {
      gsap.set(q('.b-pick'), { opacity: 0 });
      gsap.set(q('.b-fly'), { opacity: 0, x: 66, y: 110 });
      gsap.set(q('.b-c3'), { opacity: 0, y: 6 });
      gsap.set(q('.b-sel'), { y: 0 });
      gsap.set(q('.b-otp'), { opacity: 0, y: 4 });
      gsap.set(q('.b-sent'), { opacity: 0 });

      const tl = loop();
      tl.to(q('.b-pick'), { opacity: 1, duration: 0.25 })
        .to(q('.b-fly'), { opacity: 1, duration: 0.1 })
        .to(q('.b-fly'), { x: 136, y: 38, duration: 0.6, ease: 'power2.in' })
        .to(q('.b-fly'), { opacity: 0, duration: 0.1 })
        .to(q('.b-c2'), { opacity: 0, y: -6, duration: 0.2 }, '<')
        .to(q('.b-c3'), { opacity: 1, y: 0, duration: 0.25 }, '<0.05')
        .to(q('.b-pick'), { opacity: 0, duration: 0.3 }, '+=0.2')
        .to(q('.b-sel'), { y: 26, duration: 0.45, ease: 'power3.inOut' }, '<')
        .to(q('.b-sel'), { y: 52, duration: 0.45, ease: 'power3.inOut' }, '+=0.3')
        .to(q('.b-otp'), { opacity: 1, y: 0, duration: 0.2, stagger: 0.18 }, '+=0.2')
        .to(q('.b-sent'), { opacity: 1, duration: 0.3 }, '+=0.2')
        .addLabel('still', '+=0.2')
        .to(q('.b-fade'), { opacity: 0, duration: 0.45 }, '+=1.6');
      return tl;
    });

    return (
      <svg ref={root} viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* phone */}
        <Box x={20} y={8} w={136} h={234} r={22} />
        <rect x="66" y="16" width="44" height="6" rx="3" style={{ fill: INK.line }} />
        <T x={36} y={44} size={9} c="text" ls="0.16em" weight={600}>MJ BAZAAR</T>
        <rect x="128" y="32" width="14" height="14" rx="3" style={{ fill: 'none', stroke: INK.text }} />
        <circle cx="146" cy="32" r="7" style={{ fill: INK.hi }} />
        <g className="b-c2"><T x={146} y={35.5} size={9} c="bg" anchor="middle" weight={700}>2</T></g>
        <g className="b-c3"><T x={146} y={35.5} size={9} c="bg" anchor="middle" weight={700}>3</T></g>
        {Array.from({ length: 6 }, (_, k) => {
          const x = 34 + (k % 2) * 56, y = 58 + Math.floor(k / 2) * 58;
          return (
            <g key={k}>
              <rect x={x} y={y} width="50" height="50" rx="8" style={{ fill: INK.soft }} />
              <rect x={x + 6} y={y + 36} width="26" height="4" rx="2" style={{ fill: INK.line }} />
            </g>
          );
        })}
        <rect className="b-pick" x="33" y="115" width="52" height="52" rx="9" style={{ fill: 'none', stroke: INK.hi, strokeWidth: 1.5 }} />
        <g className="b-fly"><circle r="5" style={{ fill: INK.hi }} /></g>

        <g className="b-fade">
          <T x={180} y={30} size={9} c="faint" ls="0.16em">DELIVERY · UZ GEODATA</T>
          <rect className="b-sel" x="178" y="42" width="206" height="24" rx="6" style={{ fill: 'none', stroke: INK.hi }} />
          {['Toshkent sh.', 'Chilonzor tumani', '9-kvartal'].map((t, i) => (
            <T key={t} x={190} y={58 + i * 26} size={10.5} c={i === 2 ? 'hi' : 'text'}>{t}</T>
          ))}
          <T x={180} y={148} size={9} c="faint" ls="0.16em">OTP</T>
          {['4', '8', '1', '2'].map((dgt, i) => (
            <g key={i}>
              <Box x={180 + i * 34} y={158} w={28} h={32} r={6} fill="none" />
              <g className="b-otp"><T x={194 + i * 34} y={179} size={13} c="hi" anchor="middle" weight={600}>{dgt}</T></g>
            </g>
          ))}
          <g className="b-sent"><T x={180} y={220} size={10} c="hi" ls="0.08em">✓ order request sent</T></g>
        </g>
      </svg>
    );
  }

  window.AkPreviews = {
    ucash: UcashPreview,
    coddle: CoddlePreview,
    nutricore: NutriPreview,
    downloader: DownloaderPreview,
    bazaar: BazaarPreview,
  };
})();
