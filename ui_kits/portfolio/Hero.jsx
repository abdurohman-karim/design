// Portfolio — Hero. echo "Welcome"; banner, big name, role, slogan, CTAs.
const { Badge } = window.DS;
const DecryptBtn = window.DecryptBtn;

const PROX_WEIGHT_MIN     = 300;
const PROX_WEIGHT_MAX     = 700;
const PROX_WEIGHT_DEFAULT = 500;
const PROX_RADIUS         = 220; // px falloff distance
const LERP_ACTIVE         = 0.20; // snappy follow
const LERP_RESET          = 0.08; // graceful reset on leave

function ProximityName() {
  const ref        = React.useRef(null);
  const rafRef     = React.useRef(null);
  const mouseRef   = React.useRef(null);
  const weightsRef = React.useRef(null); // Float32Array of current interpolated weights
  const centersRef = React.useRef(null); // cached { x, y } per character at default weight
  const spansRef   = React.useRef(null); // cached NodeList

  // Cache char centers + span refs at default weight (called on mouseenter)
  const cacheLayout = React.useCallback(() => {
    if (!ref.current) return;
    spansRef.current   = Array.from(ref.current.querySelectorAll('[data-ch]'));
    const n            = spansRef.current.length;
    centersRef.current = spansRef.current.map(s => {
      const r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    if (!weightsRef.current || weightsRef.current.length !== n) {
      weightsRef.current = new Float32Array(n).fill(PROX_WEIGHT_DEFAULT);
    }
  }, []);

  const tick = React.useCallback(() => {
    rafRef.current = null;
    const spans   = spansRef.current;
    const centers = centersRef.current;
    const weights = weightsRef.current;
    if (!spans || !centers || !weights) return;

    const pos   = mouseRef.current;
    const lerp  = pos ? LERP_ACTIVE : LERP_RESET;
    const n     = spans.length;
    let running = false;

    for (let i = 0; i < n; i++) {
      let target = PROX_WEIGHT_DEFAULT;
      if (pos) {
        const dx   = pos.x - centers[i].x;
        const dy   = pos.y - centers[i].y;
        const t    = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / PROX_RADIUS);
        target     = PROX_WEIGHT_MIN + t * (PROX_WEIGHT_MAX - PROX_WEIGHT_MIN);
      }
      const next   = weights[i] + (target - weights[i]) * lerp;
      weights[i]   = next;
      spans[i].style.fontVariationSettings = `'wght' ${Math.round(next)}`;
      if (Math.abs(next - target) > 0.5) running = true;
    }

    if (running) rafRef.current = requestAnimationFrame(tick);
  }, []);

  const onMouseEnter = React.useCallback(() => { cacheLayout(); },           [cacheLayout]);
  const onMouseMove  = React.useCallback((e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);
  const onMouseLeave = React.useCallback(() => {
    mouseRef.current = null;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  React.useEffect(() => {
    // Invalidate cached centers on resize so they're re-read at default weight
    const onResize = () => { centersRef.current = null; };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const line = (text) =>
    text.split('').map((ch, i) => <span key={i} data-ch>{ch}</span>);

  return (
    <h1
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 9vw, 124px)', fontWeight: 500,
        letterSpacing: '-0.045em', lineHeight: 0.95, color: 'var(--white)', margin: 0,
        textShadow: '0 0 60px rgba(255,255,255,0.12)', cursor: 'default',
      }}
    >
      {line('Abdurohman')}<br/>{line('Karim')}
    </h1>
  );
}

function Hero() {
  return (
    <section id="home" className="ak-grid-bg" style={{
      position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* radial glow + grid fade */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 38%, rgba(255,255,255,0.06), transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000, transparent 75%)',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000, transparent 75%)',
        backgroundImage: 'linear-gradient(to right, var(--grid-line-strong) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line-strong) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} />

      <div style={{
        position: 'relative', maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: '0 var(--container-pad)', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 28,
      }}>
        {/* code banner — data-decrypt-heading opts into DecryptHeadings' scramble */}
        <div data-decrypt-heading style={{
          fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)',
          padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)',
          background: 'var(--surface-card)', backdropFilter: 'blur(var(--blur-sm))', whiteSpace: 'nowrap',
        }}>
          echo <span style={{ color: 'var(--white)' }}>"Welcome"</span>;
        </div>

        <ProximityName />

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 'clamp(13px, 1.6vw, 16px)', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0,
        }}>
          Backend Developer · Fintech &amp; AI
        </p>

        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 'clamp(16px, 1.8vw, 20px)', lineHeight: 1.6,
          color: 'var(--text-secondary)', maxWidth: 560, margin: 0, textWrap: 'balance',
        }}>
          I build payment platforms, banking integrations and AI-driven services —
          high-load backends in PHP / Laravel and Python.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          <DecryptBtn variant="primary" size="lg" arrow as="a" href="#contact">Get in touch</DecryptBtn>
          <DecryptBtn variant="secondary" size="lg" as="a" href="#projects">View projects</DecryptBtn>
        </div>
      </div>

      {/* scroll cue */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.24em',
        textTransform: 'uppercase', color: 'var(--text-faint)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        scroll
        <span style={{ width: 1, height: 36, background: 'linear-gradient(var(--border-strong), transparent)' }} />
      </div>
    </section>
  );
}
window.Hero = Hero;
