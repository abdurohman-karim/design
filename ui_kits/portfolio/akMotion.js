// akMotion — small shared motion helpers for the portfolio sections. Plain JS
// (no JSX) so it can load as a normal script right after GSAP and before the
// Babel-transpiled sections that use it (Stack, Projects).
(() => {
  /* ── Cursor-light layers ────────────────────────────────────────────────
     Drop `.ak-light-spot` (soft light under the cursor) and `.ak-light-edge`
     (1px rim that lights up near the cursor) into any position:relative box
     with a border-radius, then drive them with --mx / --my / --spot on an
     ancestor. White light in dark, its ink twin in light (tokens flip). */
  if (!document.getElementById('ak-motion-css')) {
    const s = document.createElement('style');
    s.id = 'ak-motion-css';
    s.textContent = `
      .ak-light-spot, .ak-light-edge {
        position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
        opacity: var(--spot, 0); transition: opacity .4s var(--ease-out);
      }
      .ak-light-spot {
        background: radial-gradient(440px circle at var(--mx, 50%) var(--my, 50%), var(--white-a08), transparent 62%);
      }
      .ak-light-edge {
        z-index: 2; padding: 1px;
        background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), var(--white-a60), transparent 72%);
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        mask-composite: exclude;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Decrypt-style text reveal ──────────────────────────────────────────
     DecryptBtn's algorithm: every char scrambles, then from 42% they lock back
     left-to-right. The original text is stored once and restored exactly. */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#><[]{}|%$';
  const RESOLVE_AT = 0.42;

  function scramble(el, duration = 0.75) {
    if (!el || !window.gsap) return;
    const orig = el.dataset.text || (el.dataset.text = el.textContent);
    const chars = [...orig];
    const total = chars.filter((c) => c !== ' ').length;
    if (el._akScramble) el._akScramble.kill();
    const p = { v: 0 };
    el._akScramble = gsap.to(p, {
      v: 1, duration, ease: 'none',
      onUpdate: () => {
        const resolved = p.v < RESOLVE_AT ? 0
          : Math.floor(((p.v - RESOLVE_AT) / (1 - RESOLVE_AT)) * total);
        let k = 0;
        el.textContent = chars.map((c) => (c === ' ' ? ' '
          : k++ < resolved ? c : CHARS[(Math.random() * CHARS.length) | 0])).join('');
      },
      onComplete: () => { el.textContent = orig; el._akScramble = null; },
    });
  }

  function scrambleStop(el) {
    if (!el || !el._akScramble) return;
    el._akScramble.kill();
    el._akScramble = null;
    el.textContent = el.dataset.text;
  }

  window.akMotion = { scramble, scrambleStop };
})();
