// CustomCursor — magnetic frame cursor. Independent layer, zero changes to existing components.

(() => {
  /* ── CSS injected once ─────────────────────────────────────────────────── */
  if (!document.getElementById('ak-cursor-css')) {
    const s = document.createElement('style');
    s.id = 'ak-cursor-css';
    s.textContent = `
      /* Hide system cursor everywhere while custom cursor is active */
      body.ak-cur-active,
      body.ak-cur-active * { cursor: none !important; }
      /* Restore text cursor in form fields */
      body.ak-cur-active input,
      body.ak-cur-active textarea,
      body.ak-cur-active select { cursor: text !important; }

      #ak-cursor {
        position: fixed;
        top: 0; left: 0;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--white);
        border: 1.5px solid transparent;
        pointer-events: none;
        z-index: 99999;
        opacity: 0;
        /* position handled by JS transform — no transition here */
        will-change: transform, width, height;
        transition:
          width       .38s cubic-bezier(.16, 1, .3, 1),
          height      .38s cubic-bezier(.16, 1, .3, 1),
          border-radius .38s cubic-bezier(.16, 1, .3, 1),
          background  .26s ease,
          border-color .26s ease,
          opacity     .30s ease;
      }

      /* Frame state — class toggled by JS */
      #ak-cursor.ak-cur--frame {
        background: transparent;
        border-color: var(--white);
      }

      /* Never show on touch devices */
      @media (hover: none) {
        #ak-cursor { display: none !important; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── React component ───────────────────────────────────────────────────── */
  function CustomCursor() {
    const ref = React.useRef(null);

    React.useEffect(() => {
      /* Bail on touch / stylus devices — no hover capability */
      if (window.matchMedia('(hover: none)').matches) return;

      const el = ref.current;
      if (!el) return;

      document.body.classList.add('ak-cur-active');

      /* Positions: raw mouse vs lerped cursor */
      const pos = { x: -300, y: -300 };
      const cur = { x: -300, y: -300 };
      let hovered = null; // DOM element currently framed
      let raf     = null;
      let visible = false;

      /* Lerp factors — snap to 1 under prefers-reduced-motion */
      const reduced     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const LERP_DOT    = reduced ? 1 : 0.12; // free-floating dot
      const LERP_FRAME  = reduced ? 1 : 0.15; // locked to element center
      const PAD         = 10;                  // px outset from element edges

      /* Selector — covers all interactive elements without touching any JSX */
      const SELECTOR = 'a, button, .decrypt-btn, [data-cursor="frame"]';

      function findTarget(node) {
        return node?.closest?.(SELECTOR) ?? null;
      }

      /* Switch cursor to frame shape matching the given element */
      function setFrame(t) {
        const r = t.getBoundingClientRect();
        el.style.width        = Math.round(r.width  + PAD * 2) + 'px';
        el.style.height       = Math.round(r.height + PAD * 2) + 'px';
        el.style.borderRadius = getComputedStyle(t).borderRadius;
        el.classList.add('ak-cur--frame');
      }

      /* Return cursor to dot */
      function unsetFrame() {
        el.classList.remove('ak-cur--frame');
        el.style.width = el.style.height = el.style.borderRadius = '';
      }

      /* RAF loop — lerps position, re-reads element rect each frame for scroll sync */
      function tick() {
        /* Framed element gone from DOM (e.g. SPA route change unmounted the
           clicked link) — mouseout never fires, so drop the frame manually.
           Otherwise getBoundingClientRect() returns 0,0 and the cursor would
           glide to the top-left corner. Fall back to the dot at the last
           known mouse position. */
        if (hovered && !hovered.isConnected) {
          hovered = null;
          unsetFrame();
        }
        if (hovered) {
          const r  = hovered.getBoundingClientRect();
          cur.x   += (r.left + r.width  / 2 - cur.x) * LERP_FRAME;
          cur.y   += (r.top  + r.height / 2 - cur.y) * LERP_FRAME;
        } else {
          cur.x += (pos.x - cur.x) * LERP_DOT;
          cur.y += (pos.y - cur.y) * LERP_DOT;
        }
        el.style.transform = `translate(${cur.x}px,${cur.y}px) translate(-50%,-50%)`;
        raf = requestAnimationFrame(tick);
      }

      /* ── Events ── */
      function onMove(e) {
        pos.x = e.clientX;
        pos.y = e.clientY;
        if (!visible) {
          /* Teleport on first move so cursor doesn't slide in from top-left */
          cur.x = e.clientX;
          cur.y = e.clientY;
          visible = true;
          el.style.opacity = '1';
        }
      }

      function onOver(e) {
        const t = findTarget(e.target);
        if (t && t !== hovered) {
          hovered = t;
          setFrame(t);
        }
      }

      function onOut(e) {
        if (!hovered) return;
        const rel = e.relatedTarget;
        /* Ignore events that stay inside the same target (child → parent, etc.) */
        if (rel && hovered.contains(rel)) return;
        const next = findTarget(rel);
        if (next && next !== hovered) {
          /* Moving directly to another target — switch without dot flash */
          hovered = next;
          setFrame(next);
        } else if (!next) {
          hovered = null;
          unsetFrame();
        }
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseover', onOver);
      document.addEventListener('mouseout',  onOut);
      raf = requestAnimationFrame(tick);

      return () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseover', onOver);
        document.removeEventListener('mouseout',  onOut);
        cancelAnimationFrame(raf);
        document.body.classList.remove('ak-cur-active');
      };
    }, []);

    return <div id="ak-cursor" ref={ref} />;
  }

  window.CustomCursor = CustomCursor;
})();
