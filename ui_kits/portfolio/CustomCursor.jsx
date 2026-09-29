// CustomCursor — dot + trailing ring with context states. Independent layer:
// components opt in with data attributes instead of importing anything.
//
//   (nothing)                     a / button / .decrypt-btn → ring frames the element
//   data-cursor="lock"            ring splits into 4 corner brackets that lock onto
//                                 the element; the dot becomes a pill with
//                                 data-cursor-label ("Visit site ↗")
//   data-cursor="drag"            wide ring + pill label ("‹ drag ›")
//   data-cursor="frame"           force the frame (e.g. a button inside a lock card)
//   input / textarea / [contenteditable] → I-beam
//
// Motion is time-based (gsap.quickTo), so it feels the same at 60 Hz and 120 Hz.
// mix-blend-mode: difference keeps it monochrome and legible on both themes.

(() => {
  /* ── CSS injected once ─────────────────────────────────────────────────── */
  if (!document.getElementById('ak-cursor-css')) {
    const s = document.createElement('style');
    s.id = 'ak-cursor-css';
    s.textContent = `
      /* Hide the system cursor everywhere while the custom one is active */
      body.ak-cur-active,
      body.ak-cur-active * { cursor: none !important; }

      #ak-cursor {
        position: fixed; left: 0; top: 0; width: 0; height: 0;
        z-index: 99999; pointer-events: none;
        mix-blend-mode: difference;       /* white inverts whatever is below */
        opacity: 0; transition: opacity .3s ease;
      }
      #ak-cursor.is-visible { opacity: 1; }
      #ak-cursor > * { position: absolute; left: 0; top: 0; will-change: transform; }

      .ak-cur-ring {
        width: 34px; height: 34px; box-sizing: border-box;
        border: 1.5px solid #fff; border-radius: 17px;
        transition: border-radius .35s cubic-bezier(.16, 1, .3, 1);
      }
      .ak-cur-dot {
        width: 6px; height: 6px; border-radius: 999px; background: #fff;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden; white-space: nowrap;
      }
      /* black text on the white pill → shows the backdrop through the
         difference blend, so the label always reads as "cut out" */
      .ak-cur-label {
        flex-shrink: 0; padding: 0 12px;
        font-family: var(--font-mono); font-size: 10.5px; font-weight: 500;
        letter-spacing: .14em; text-transform: uppercase; color: #000;
        opacity: 0;
      }
      .ak-cur-corner { width: 16px; height: 16px; opacity: 0; }
      .ak-cur-corner::before {
        content: ""; position: absolute; inset: 0; border: 0 solid #fff;
      }
      .ak-cur-corner.tl::before { border-top-width: 1.5px; border-left-width: 1.5px; }
      .ak-cur-corner.tr::before { border-top-width: 1.5px; border-right-width: 1.5px; }
      .ak-cur-corner.br::before { border-bottom-width: 1.5px; border-right-width: 1.5px; }
      .ak-cur-corner.bl::before { border-bottom-width: 1.5px; border-left-width: 1.5px; }
      .ak-cur-pulse {
        width: 34px; height: 34px; border-radius: 50%;
        border: 1px solid #fff; opacity: 0;
      }

      @media (hover: none) { #ak-cursor { display: none !important; } }
    `;
    document.head.appendChild(s);
  }

  const RING = 34;           // resting ring diameter
  const FRAME_PAD = 8;       // frame outset around a control
  const LOCK_PAD = 10;       // bracket outset around a locked card
  const CORNER = 16;         // bracket size
  const CONTROLS = 'a, button, .decrypt-btn';
  const TEXT = 'input, textarea, select, [contenteditable="true"]';

  /* ── React component ───────────────────────────────────────────────────── */
  function CustomCursor() {
    const rootRef = React.useRef(null);

    React.useEffect(() => {
      /* Touch / stylus devices have no hover — keep the system behaviour */
      if (window.matchMedia('(hover: none)').matches || !window.gsap) return;

      const root   = rootRef.current;
      const ring   = root.querySelector('.ak-cur-ring');
      const dot    = root.querySelector('.ak-cur-dot');
      const label  = root.querySelector('.ak-cur-label');
      const pulse  = root.querySelector('.ak-cur-pulse');
      const corners = ['tl', 'tr', 'br', 'bl'].map((k) => root.querySelector('.ak-cur-corner.' + k));

      document.body.classList.add('ak-cur-active');

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const d = (t) => (reduced ? 0.001 : t);   // durations collapse under reduced motion

      gsap.set([ring, dot, pulse], { xPercent: -50, yPercent: -50, x: -200, y: -200 });
      gsap.set(corners, { x: -200, y: -200 });

      /* position: dot sits exactly under the pointer, ring trails briefly */
      const dotX  = gsap.quickSetter(dot, 'x', 'px');
      const dotY  = gsap.quickSetter(dot, 'y', 'px');
      const ringX = gsap.quickTo(ring, 'x', { duration: d(0.18), ease: 'power3.out' });
      const ringY = gsap.quickTo(ring, 'y', { duration: d(0.18), ease: 'power3.out' });
      const ringW = gsap.quickTo(ring, 'width',  { duration: d(0.35), ease: 'power3.out' });
      const ringH = gsap.quickTo(ring, 'height', { duration: d(0.35), ease: 'power3.out' });
      const ringSX = gsap.quickTo(ring, 'scaleX', { duration: d(0.25), ease: 'power2.out' });
      const ringSY = gsap.quickTo(ring, 'scaleY', { duration: d(0.25), ease: 'power2.out' });
      const ringRot = gsap.quickSetter(ring, 'rotation', 'deg');
      /* brackets glide at slightly different speeds → the lock lands as a cascade */
      const cornerTo = corners.map((c, i) => ({
        x: gsap.quickTo(c, 'x', { duration: d(0.34 + i * 0.05), ease: 'power3.out' }),
        y: gsap.quickTo(c, 'y', { duration: d(0.34 + i * 0.05), ease: 'power3.out' }),
      }));

      const pos  = { x: -200, y: -200 };
      const prev = { x: -200, y: -200, t: performance.now() };
      let speed = 0, angle = 0;
      let mode = 'default', target = null, visible = false, pressed = false;

      /* ── state changes (shape, label, brackets) ── */
      const setLabel = (text) => {
        label.textContent = text || '';
        const w = text ? label.offsetWidth : 6;
        gsap.to(dot, { width: w, height: text ? 26 : 6, duration: d(0.35), ease: 'power3.out', overwrite: 'auto' });
        gsap.to(label, { opacity: text ? 1 : 0, duration: d(text ? 0.3 : 0.12), delay: text ? d(0.08) : 0, overwrite: 'auto' });
      };
      const showCorners = (on) => {
        if (on) {
          /* start the brackets from the ring so they visibly fly out of it */
          corners.forEach((c, i) => {
            const ox = i === 1 || i === 2 ? RING / 2 - CORNER : -RING / 2;
            const oy = i >= 2 ? RING / 2 - CORNER : -RING / 2;
            gsap.set(c, { x: gsap.getProperty(ring, 'x') + ox, y: gsap.getProperty(ring, 'y') + oy });
          });
        }
        gsap.to(corners, { opacity: on ? 1 : 0, duration: d(on ? 0.25 : 0.2), overwrite: 'auto' });
      };

      function setMode(next, el) {
        if (next === mode && el === target) return;
        const was = mode;
        mode = next;
        target = el;

        if (next === 'frame' && el) {
          const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
          const box = el.getBoundingClientRect();
          ring.style.borderRadius = Math.min(r + FRAME_PAD, (box.height + FRAME_PAD * 2) / 2) + 'px';
        } else if (next === 'text') {
          ring.style.borderRadius = '1px';
        } else {
          ring.style.borderRadius = '999px';
        }

        gsap.to(ring, { opacity: next === 'lock' || next === 'text' ? 0 : 1, duration: d(0.2), overwrite: 'auto' });
        showCorners(next === 'lock');
        if (was === 'lock' && next !== 'lock') {
          /* brackets fold back into the pointer */
          cornerTo.forEach((c) => { c.x(pos.x - CORNER / 2); c.y(pos.y - CORNER / 2); });
        }

        const text = next === 'lock' || next === 'drag' ? (el && el.dataset.cursorLabel) || '' : '';
        if (next === 'text') {
          gsap.to(dot, { width: 2, height: 22, duration: d(0.25), ease: 'power3.out', overwrite: 'auto' });
          gsap.to(label, { opacity: 0, duration: d(0.1), overwrite: 'auto' });
          label.textContent = '';
        } else {
          setLabel(text);
          if (next === 'frame') gsap.to(dot, { width: 4, height: 4, duration: d(0.25), overwrite: 'auto' });
        }
      }

      /* which state does the element under the pointer ask for? */
      function resolve(node) {
        if (!node || !node.closest) return ['default', null];
        const own = node.closest('[data-cursor]');
        if (own) return [own.dataset.cursor, own];
        const text = node.closest(TEXT);
        if (text) return ['text', text];
        const ctl = node.closest(CONTROLS);
        if (ctl) return ['frame', ctl];
        return ['default', null];
      }

      /* ── per-frame: follow pointer / element, stretch with speed ── */
      function tick() {
        if (target && !target.isConnected) setMode('default', null);   // SPA route change

        const now = performance.now();
        const dt = Math.max(1, now - prev.t);
        const vx = (pos.x - prev.x) / dt, vy = (pos.y - prev.y) / dt;
        const inst = Math.hypot(vx, vy) * 1000;                       // px / s
        speed += (inst - speed) * 0.25;
        if (inst > 60) angle = Math.atan2(vy, vx) * 180 / Math.PI;
        prev.x = pos.x; prev.y = pos.y; prev.t = now;

        dotX(pos.x); dotY(pos.y);

        if (mode === 'frame' && target) {
          const r = target.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          /* a little magnetic lean toward the pointer */
          ringX(cx + Math.max(-6, Math.min(6, (pos.x - cx) * 0.12)));
          ringY(cy + Math.max(-4, Math.min(4, (pos.y - cy) * 0.12)));
          ringW(r.width + FRAME_PAD * 2);
          ringH(r.height + FRAME_PAD * 2);
          ringRot(0); ringSX(pressed ? 0.94 : 1); ringSY(pressed ? 0.94 : 1);
        } else if (mode === 'lock' && target) {
          const r = target.getBoundingClientRect();
          const pad = pressed ? 4 : LOCK_PAD;
          /* brackets drift a few px toward the pointer — alive, not glued */
          const px = reduced ? 0 : (pos.x - (r.left + r.width / 2)) * 0.02;
          const py = reduced ? 0 : (pos.y - (r.top + r.height / 2)) * 0.02;
          const L = r.left - pad + px, T = r.top - pad + py;
          const R = r.right + pad - CORNER + px, B = r.bottom + pad - CORNER + py;
          cornerTo[0].x(L); cornerTo[0].y(T);
          cornerTo[1].x(R); cornerTo[1].y(T);
          cornerTo[2].x(R); cornerTo[2].y(B);
          cornerTo[3].x(L); cornerTo[3].y(B);
          ringX(pos.x); ringY(pos.y);
        } else {
          const size = mode === 'drag' ? 104 : RING;   // drag: a wide lens around the pill
          ringX(pos.x); ringY(pos.y);
          ringW(size); ringH(size);
          /* stretch along the direction of travel (default state only) */
          const k = mode === 'default' && !reduced ? Math.min(speed / 2600, 0.32) : 0;
          ringRot(angle);
          const press = pressed ? 0.82 : 1;
          ringSX((1 + k) * press); ringSY((1 - k * 0.55) * press);
        }
      }

      /* ── events ── */
      function onMove(e) {
        pos.x = e.clientX; pos.y = e.clientY;
        if (!visible) {
          /* first move: teleport, don't slide in from the corner */
          visible = true;
          prev.x = pos.x; prev.y = pos.y;
          gsap.set([ring, dot], { x: pos.x, y: pos.y });
          root.classList.add('is-visible');
        }
      }
      function onOver(e) {
        const [m, el] = resolve(e.target);
        setMode(m, el);
      }
      function onDown() {
        pressed = true;
        if (reduced) return;
        gsap.fromTo(pulse, { x: pos.x, y: pos.y, scale: 0.6, opacity: 0.55 },
          { scale: 2.4, opacity: 0, duration: 0.55, ease: 'power2.out', overwrite: true });
      }
      function onUp() { pressed = false; }
      function onLeaveWindow() { root.classList.remove('is-visible'); visible = false; }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseover', onOver);
      document.addEventListener('mousedown', onDown);
      document.addEventListener('mouseup', onUp);
      document.documentElement.addEventListener('mouseleave', onLeaveWindow);
      gsap.ticker.add(tick);

      return () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseover', onOver);
        document.removeEventListener('mousedown', onDown);
        document.removeEventListener('mouseup', onUp);
        document.documentElement.removeEventListener('mouseleave', onLeaveWindow);
        gsap.ticker.remove(tick);
        gsap.killTweensOf([ring, dot, label, pulse, ...corners]);
        document.body.classList.remove('ak-cur-active');
      };
    }, []);

    return (
      <div id="ak-cursor" ref={rootRef} aria-hidden="true">
        <div className="ak-cur-pulse" />
        <div className="ak-cur-ring" />
        <i className="ak-cur-corner tl" />
        <i className="ak-cur-corner tr" />
        <i className="ak-cur-corner br" />
        <i className="ak-cur-corner bl" />
        <div className="ak-cur-dot"><span className="ak-cur-label" /></div>
      </div>
    );
  }

  window.CustomCursor = CustomCursor;
})();
