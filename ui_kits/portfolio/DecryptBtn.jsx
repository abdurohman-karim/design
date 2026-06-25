// DecryptBtn.jsx — Cyberpunk decrypt-text CTA button
//
// HOW IT WORKS
// ─────────────
// GSAP drives a single 0→1 progress proxy over 650 ms:
//   Phase 1 (0 → 42 %): every non-space char is replaced with a random
//     glyph on each animation frame, creating a full scramble.
//   Phase 2 (42 → 100 %): chars lock back to their original value
//     one-by-one, left-to-right, giving the "terminal decoding" feel.
//
// Three overlay effects play in parallel:
//   • Neon glow — box-shadow inflates at hover-start, deflates at end.
//   • Scan-line  — a translucent light strip sweeps L→R across the button.
//   • RGB glitch — two offset text clones flash three times at low opacity,
//                  simulating chromatic-aberration noise.
//
// prefers-reduced-motion: GSAP animations are skipped entirely;
//   only a gentle glow transition is applied (handled in CSS + JS guard).
//
// USAGE — React:
//   <DecryptBtn variant="primary" size="lg" arrow as="a" href="#contact">
//     Get in touch
//   </DecryptBtn>
//
// USAGE — vanilla HTML (auto-initialised at DOMContentLoaded):
//   <button class="decrypt-btn">Contact Me</button>

(() => {
  /* ─── Glyphs used during scramble phase ─────────────────────────────────── */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#><[]{}|%$';

  const prefersReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── One-time CSS injection ─────────────────────────────────────────────── */
  if (!document.getElementById('decrypt-btn-css')) {
    const s = document.createElement('style');
    s.id = 'decrypt-btn-css';
    s.textContent = `
      /* Structural requirements for the effect layers */
      .decrypt-btn {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      /* Light strip that sweeps across on hover */
      .decrypt-scanline {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 45%;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.08) 40%,
          rgba(255, 255, 255, 0.15) 50%,
          rgba(255, 255, 255, 0.08) 60%,
          transparent 100%
        );
        pointer-events: none;
        will-change: transform;
        z-index: 1;
      }

      /* The live text layer that shows scrambled / resolved chars */
      .decrypt-text {
        position: relative;
        z-index: 2;
        display: inline-block;
        /* Tabular numerics prevent layout thrash as char widths change */
        font-variant-numeric: tabular-nums;
      }

      /*
       * RGB offset ghost layers — briefly flash during scramble with an X
       * displacement to mimic chromatic aberration / phosphor echo.
       * They share inherited font/letter-spacing so the text aligns exactly.
       */
      .decrypt-glitch-r,
      .decrypt-glitch-b {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 3;
        font: inherit;
        letter-spacing: inherit;
        text-transform: inherit;
        white-space: nowrap;
        opacity: 0;
        color: inherit;
        will-change: transform, opacity;
      }

      /* Suppress all visual-noise layers for motion-sensitive users */
      @media (prefers-reduced-motion: reduce) {
        .decrypt-scanline,
        .decrypt-glitch-r,
        .decrypt-glitch-b {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  /* ─── DecryptEngine ─────────────────────────────────────────────────────── */
  class DecryptEngine {
    constructor(btn) {
      this.btn     = btn;
      this.textEl  = btn.querySelector('.decrypt-text');
      this.scanEl  = btn.querySelector('.decrypt-scanline');
      this.glitchR = btn.querySelector('.decrypt-glitch-r');
      this.glitchB = btn.querySelector('.decrypt-glitch-b');
      this.tl      = null;
      this.original = null;

      // Capture the button's initial box-shadow so we can restore it exactly.
      // getComputedStyle resolves CSS custom properties, giving the pixel value.
      this._restoreShadow = getComputedStyle(btn).boxShadow;
    }

    /* Pick a random glyph from the CHARS pool */
    _rand() {
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    /*
     * Render the current scramble frame.
     * `resolved` = how many non-space chars (counted left-to-right) are
     * already locked back to their original value.
     */
    _render(resolved) {
      const orig = this.original;
      let out = '';
      let nonSpace = 0;
      for (let i = 0; i < orig.length; i++) {
        if (orig[i] === ' ') {
          out += ' '; // non-breaking space — prevents layout collapse
          continue;
        }
        out += nonSpace < resolved ? orig[i] : this._rand();
        nonSpace++;
      }
      this.textEl.textContent = out;
      // Keep ghost layers in sync so glitch offsets show the same content
      if (this.glitchR) this.glitchR.textContent = out;
      if (this.glitchB) this.glitchB.textContent = out;
    }

    start() {
      // Read the live text every time — handles dynamic children (e.g. sent state)
      this.original = this.textEl.textContent.trim();
      const orig         = this.original;
      const nonSpaceTotal = [...orig].filter(c => c !== ' ').length;

      // Kill any in-flight animation without restoring (we're about to overwrite)
      this._kill(true);

      if (prefersReduced()) {
        // Reduced-motion: only a brief glow, no scramble or DOM changes
        gsap.to(this.btn, {
          boxShadow: '0 0 20px rgba(255,255,255,0.18)',
          duration: 0.25,
          ease: 'power2.out',
        });
        return;
      }

      const TOTAL      = 0.65; // total animation duration (seconds)
      const RESOLVE_AT = 0.42; // progress fraction where char resolution begins

      this.tl = gsap.timeline();

      /* ── 1. Neon glow build-in ── */
      this.tl.to(this.btn, {
        boxShadow: [
          '0 0 0 1px rgba(255,255,255,0.20)',
          '0 0 28px rgba(255,255,255,0.20)',
          '0 0 60px rgba(255,255,255,0.07)',
        ].join(', '),
        duration: 0.18,
        ease: 'power2.out',
      }, 0);

      /* ── 2. Scan-line sweep L → R ── */
      if (this.scanEl) {
        gsap.set(this.scanEl, { x: '-150%' });
        this.tl.to(this.scanEl, {
          x: '250%',
          duration: TOTAL * 0.82,
          ease: 'power1.inOut',
        }, 0.04);
      }

      /* ── 3. Core scramble + progressive resolve ──
       *
       * A single GSAP proxy drives both phases.
       * During Phase 1 (proxy.p < RESOLVE_AT): resolved=0, all chars scramble.
       * During Phase 2 (proxy.p ≥ RESOLVE_AT): resolved grows 0→nonSpaceTotal,
       *   each char snapping to its original value as the count ticks up.
       */
      const proxy = { p: 0 };
      this.tl.to(proxy, {
        p: 1,
        duration: TOTAL,
        ease: 'none',
        onUpdate: () => {
          const resolveProgress =
            Math.max(0, (proxy.p - RESOLVE_AT) / (1 - RESOLVE_AT));
          const resolved = Math.round(resolveProgress * nonSpaceTotal);
          this._render(resolved);
        },
        onComplete: () => {
          // Hard-restore original text at completion to guarantee accuracy
          this.textEl.textContent = orig;
          if (this.glitchR) this.glitchR.textContent = orig;
          if (this.glitchB) this.glitchB.textContent = orig;
        },
      }, 0);

      /* ── 4. RGB glitch bursts — three short pulses during scramble phase ──
       *
       * Each burst: glitch-r shifts +3 px right, glitch-b shifts -3 px left,
       * both at low opacity for ~90 ms (2-repeat yoyo = on → off).
       * The displacement creates a split-signal / chromatic-aberration look.
       */
      if (this.glitchR && this.glitchB) {
        const burst = (at) => {
          this.tl
            .fromTo(
              this.glitchR,
              { opacity: 0, x: 0 },
              { opacity: 0.45, x: 3, duration: 0.045, ease: 'none', yoyo: true, repeat: 1 },
              at,
            )
            .fromTo(
              this.glitchB,
              { opacity: 0, x: 0 },
              { opacity: 0.35, x: -3, duration: 0.045, ease: 'none', yoyo: true, repeat: 1 },
              at,
            );
        };
        burst(0.06);  // early scramble
        burst(0.21);  // mid scramble
        burst(0.36);  // late scramble / just before resolve
      }

      /* ── 5. Glow decay (overlaps the tail of the resolve phase) ── */
      this.tl.to(this.btn, {
        boxShadow: this._restoreShadow,
        duration: 0.38,
        ease: 'power2.inOut',
      }, TOTAL - 0.06);
    }

    /*
     * Called on mouseleave (or before a new start()).
     * `skipTextRestore` — true when called from start() because text is about
     * to be overwritten anyway; false when called from mouseleave.
     */
    _kill(skipTextRestore = false) {
      if (this.tl) { this.tl.kill(); this.tl = null; }
      if (!skipTextRestore && this.original) {
        this.textEl.textContent = this.original;
      }
      if (this.glitchR) gsap.set(this.glitchR, { opacity: 0, x: 0 });
      if (this.glitchB) gsap.set(this.glitchB, { opacity: 0, x: 0 });
      if (this.scanEl)  gsap.set(this.scanEl,  { x: '-150%' });
    }

    cancel() {
      this._kill(false);
      // Animate glow back to resting state (smooth on early mouse-out)
      gsap.to(this.btn, {
        boxShadow: this._restoreShadow,
        duration: 0.32,
        ease: 'power2.out',
      });
    }
  }

  /* ─── React component ───────────────────────────────────────────────────── */
  function DecryptBtn({
    children,
    variant  = 'primary',
    size     = 'md',
    arrow    = false,
    full     = false,
    disabled = false,
    as: Tag  = 'button',
    className = '',
    ...rest
  }) {
    const ref       = React.useRef(null);
    const engineRef = React.useRef(null);

    /* Mirror the design-system Button size tokens */
    const sizes = {
      sm: { padding: '8px 16px',  fontSize: '12px', height: 36, gap: 8  },
      md: { padding: '12px 22px', fontSize: '13px', height: 46, gap: 10 },
      lg: { padding: '16px 30px', fontSize: '14px', height: 56, gap: 12 },
    };
    const s = sizes[size] || sizes.md;

    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: full ? '100%' : 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: s.fontSize,
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      borderRadius: 'var(--radius-pill)',
      border: '1px solid transparent',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      /* Only transform in transition — box-shadow is GSAP-controlled */
      transition: 'transform var(--dur-base) var(--ease-out)',
      whiteSpace: 'nowrap',
      WebkitFontSmoothing: 'antialiased',
    };

    const variants = {
      primary: {
        background: 'var(--white)',
        color: 'var(--on-accent)',
        boxShadow: 'var(--glow-halo-sm)',
      },
      secondary: {
        background: 'var(--surface-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-strong)',
        backdropFilter: 'blur(var(--blur-sm))',
      },
      outline: {
        background: 'transparent',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-strong)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-secondary)',
      },
    };

    React.useEffect(() => {
      const btn = ref.current;
      if (!btn || disabled) return;

      const engine = new DecryptEngine(btn);
      engineRef.current = engine;

      const onEnter = () => engine.start();
      const onLeave = () => engine.cancel();

      btn.addEventListener('mouseenter', onEnter);
      btn.addEventListener('mouseleave', onLeave);

      return () => {
        btn.removeEventListener('mouseenter', onEnter);
        btn.removeEventListener('mouseleave', onLeave);
        engine.cancel();
      };
    }, [disabled]);

    // Resolve children to a plain string for aria-label and glitch layers.
    // Works for string literals and JSX-evaluated conditionals alike.
    const textStr = typeof children === 'string' ? children : '';

    return (
      <Tag
        ref={ref}
        // data-decrypt-init prevents the vanilla auto-init from re-wrapping
        data-decrypt-init="react"
        className={`decrypt-btn${className ? ` ${className}` : ''}`}
        style={{ ...base, ...(variants[variant] || variants.primary) }}
        // Provide the unscrambled label so screen readers always see real text
        aria-label={textStr || undefined}
        disabled={Tag === 'button' ? disabled : undefined}
        {...rest}
      >
        {/* Scan-line sweep strip (hidden from AT) */}
        <span className="decrypt-scanline" aria-hidden="true" />

        {/* Primary text layer — this is what the engine scrambles */}
        <span className="decrypt-text">{children}</span>

        {/* Ghost layers for RGB-offset glitch effect */}
        {textStr && <span className="decrypt-glitch-r" aria-hidden="true">{textStr}</span>}
        {textStr && <span className="decrypt-glitch-b" aria-hidden="true">{textStr}</span>}

        {/* Trailing arrow sits outside the scrambled text span */}
        {arrow && (
          <span
            aria-hidden="true"
            style={{ fontSize: '1.1em', lineHeight: 1, marginTop: '-1px', position: 'relative', zIndex: 2 }}
          >
            →
          </span>
        )}
      </Tag>
    );
  }

  window.DecryptBtn = DecryptBtn;

  /* ─── Vanilla JS auto-init ──────────────────────────────────────────────── */
  /*
   * For plain <button class="decrypt-btn"> elements (non-React).
   * Wraps the existing text in the required span structure, then
   * attaches a DecryptEngine instance.
   * Skips elements already initialised (data-decrypt-init is set by both
   * the React component and this routine after first run).
   */
  function initVanilla(btn) {
    if (btn.dataset.decryptInit) return;
    btn.dataset.decryptInit = 'vanilla';

    const text = btn.textContent.trim();
    // Replace raw text with the structured inner DOM
    btn.innerHTML = `
      <span class="decrypt-scanline" aria-hidden="true"></span>
      <span class="decrypt-text">${text}</span>
      <span class="decrypt-glitch-r" aria-hidden="true"></span>
      <span class="decrypt-glitch-b" aria-hidden="true"></span>
    `;
    // Provide accessible label so AT always reads the real text
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', text);

    const engine = new DecryptEngine(btn);
    btn.addEventListener('mouseenter', () => engine.start());
    btn.addEventListener('mouseleave', () => engine.cancel());
  }

  function autoInit() {
    // Exclude React-managed elements (data-decrypt-init="react")
    document.querySelectorAll('.decrypt-btn:not([data-decrypt-init])').forEach(initVanilla);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // Watch for buttons added after initial load (SPAs, dynamic content)
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches?.('.decrypt-btn:not([data-decrypt-init])')) initVanilla(node);
        node.querySelectorAll?.('.decrypt-btn:not([data-decrypt-init])').forEach(initVanilla);
      });
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

})();
