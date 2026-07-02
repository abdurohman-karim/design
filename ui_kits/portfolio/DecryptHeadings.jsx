// DecryptHeadings — scramble/decrypt for section code-headers on first viewport
// entry. Additive enhancer: SectionHeading lives in the compiled _ds_bundle.js,
// so instead of editing it this layer targets rendered `header h2` elements
// (plus anything opting in via [data-decrypt-heading]) from the outside.
//
// Reuses DecryptBtn's mechanics: same glyph pool, same two-phase progress
// (full scramble → left-to-right resolve at 42%). A11y/SEO/copy stay intact:
// the real markup never changes — during the animation its text is made
// transparent and an aria-hidden overlay shows the scrambled frames, then the
// overlay is removed and the original styled spans reappear.

(() => {
  /* ── CSS injected once ─────────────────────────────────────────────────── */
  if (!document.getElementById('ak-dh-css')) {
    const s = document.createElement('style');
    s.id = 'ak-dh-css';
    s.textContent = `
      .ak-dh-scrambling { position: relative !important; }
      /* Hide the real text (incl. bare text nodes) without touching the DOM */
      .ak-dh-scrambling, .ak-dh-scrambling * { color: transparent !important; }
      /* Overlay wins by specificity — monochrome primary, resolves to the
         original colored spans the instant the animation completes */
      .ak-dh-scrambling .ak-dh-overlay { color: var(--text-primary) !important; }
      .ak-dh-overlay {
        position: absolute; inset: 0;
        pointer-events: none;
        font-variant-numeric: tabular-nums; /* same anti-thrash trick as DecryptBtn */
      }
    `;
    document.head.appendChild(s);
  }

  /* Same glyph pool as DecryptBtn.jsx */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#><[]{}|%$';
  const TOTAL_MS   = 420;  // effects.css motion range (160–500ms)
  const RESOLVE_AT = 0.42; // DecryptBtn's phase-1 → phase-2 split

  function scramble(el) {
    const text = el.textContent;
    if (!text.trim()) return;

    const overlay = document.createElement('span');
    overlay.className = 'ak-dh-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    el.classList.add('ak-dh-scrambling');
    el.appendChild(overlay);

    const chars = [...text];
    const t0 = performance.now();

    const frame = (now) => {
      /* Element unmounted mid-animation (route switch) — just stop */
      if (!el.isConnected) return;
      const p  = Math.min(1, (now - t0) / TOTAL_MS);
      const rp = Math.max(0, (p - RESOLVE_AT) / (1 - RESOLVE_AT));
      const resolved = Math.round(rp * chars.length);
      let out = '';
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        out += (c === ' ' || c === '\n' || i < resolved)
          ? c
          : CHARS[(Math.random() * CHARS.length) | 0];
      }
      overlay.textContent = out;
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        overlay.remove();
        el.classList.remove('ak-dh-scrambling');
      }
    };
    requestAnimationFrame(frame);
  }

  /* ── React component — mounted once in <App>, works on both routes ─────── */
  const SELECTOR = 'header h2, [data-decrypt-heading]';

  function DecryptHeadings() {
    React.useEffect(() => {
      /* Reduced motion: headings appear as final text via the normal reveal */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      /* Same IntersectionObserver pattern as the [data-reveal] fade-up in
         index.html: fire once on entry, then unobserve — never re-triggers
         on scroll back. Decrypt runs alongside the reveal, not instead. */
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          scramble(e.target);
        });
      }, { rootMargin: '0px 0px -10% 0px' });

      const attach = () => {
        document.querySelectorAll(SELECTOR).forEach((el) => {
          if (el.dataset.akDecrypt) return;
          el.dataset.akDecrypt = '1';
          io.observe(el);
        });
      };
      attach();

      /* Route switches remount sections — pick up new headings the same way
         DecryptBtn's vanilla auto-init watches for late-added buttons */
      const mo = new MutationObserver(attach);
      mo.observe(document.getElementById('root'), { childList: true, subtree: true });

      return () => { io.disconnect(); mo.disconnect(); };
    }, []);

    return null;
  }

  window.DecryptHeadings = DecryptHeadings;
})();
