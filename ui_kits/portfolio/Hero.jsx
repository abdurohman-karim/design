// Portfolio — Hero. echo "Welcome"; banner, big name, role, slogan, CTAs.
const { Button, Badge } = window.DS;

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
        {/* code banner */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)',
          padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)',
          background: 'var(--surface-card)', backdropFilter: 'blur(var(--blur-sm))', whiteSpace: 'nowrap',
        }}>
          echo <span style={{ color: 'var(--white)' }}>"Welcome"</span>;
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 9vw, 124px)', fontWeight: 500,
          letterSpacing: '-0.045em', lineHeight: 0.95, color: 'var(--white)', margin: 0,
          textShadow: '0 0 60px rgba(255,255,255,0.12)',
        }}>
          Abdurohman<br/>Karim
        </h1>

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
          <Button variant="primary" size="lg" arrow as="a" href="#contact">Get in touch</Button>
          <Button variant="secondary" size="lg" as="a" href="#projects">View projects</Button>
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
