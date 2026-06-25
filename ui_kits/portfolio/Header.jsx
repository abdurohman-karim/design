// Portfolio — Header / nav. Fixed, glass on scroll, monogram logo + theme toggle.
const { Badge } = window.DS;

/* Frost hover for the Interests nav link — injected once, monochrome white bloom */
if (typeof document !== 'undefined' && !document.getElementById('ak-frost-css')) {
  const s = document.createElement('style');
  s.id = 'ak-frost-css';
  s.textContent = `
    .ak-frost-link { position: relative; transition: color var(--dur-base) var(--ease-out), text-shadow var(--dur-base) var(--ease-out); }
    .ak-frost-link::after {
      content: attr(data-frost);
      position: absolute; left: 14px; top: 8px;
      color: var(--white); filter: blur(7px);
      opacity: 0; transition: opacity var(--dur-base) var(--ease-out);
      pointer-events: none; white-space: nowrap; letter-spacing: inherit;
    }
    .ak-frost-link:hover { text-shadow: 0 0 12px var(--glow-medium); }
    .ak-frost-link:hover::after { opacity: 0.5; }

    /* ── Mobile menu ── */
    .ak-burger { display: none; }
    .ak-mobile-menu {
      position: fixed; inset: 0; z-index: 90;
      display: flex; flex-direction: column;
      padding: 96px var(--container-pad) 40px;
      gap: 2px;
      background: var(--header-bg);
      backdrop-filter: blur(var(--blur-lg));
      -webkit-backdrop-filter: blur(var(--blur-lg));
      opacity: 0; visibility: hidden;
      transform: translateY(-10px);
      transition: opacity var(--dur-base) var(--ease-out),
                  transform var(--dur-base) var(--ease-out),
                  visibility var(--dur-base) var(--ease-out);
    }
    .ak-mobile-menu.is-open { opacity: 1; visibility: visible; transform: none; }
    .ak-mobile-menu a {
      opacity: 0; transform: translateY(12px);
      transition: opacity .45s var(--ease-out), transform .45s var(--ease-out),
                  color var(--dur-base) var(--ease-out);
    }
    .ak-mobile-menu.is-open a { opacity: 1; transform: none; }
    .ak-mobile-menu.is-open a:nth-child(1) { transition-delay: .05s; }
    .ak-mobile-menu.is-open a:nth-child(2) { transition-delay: .09s; }
    .ak-mobile-menu.is-open a:nth-child(3) { transition-delay: .13s; }
    .ak-mobile-menu.is-open a:nth-child(4) { transition-delay: .17s; }
    .ak-mobile-menu.is-open a:nth-child(5) { transition-delay: .21s; }
    .ak-mobile-menu.is-open a:nth-child(6) { transition-delay: .25s; }
    .ak-mobile-menu.is-open a:nth-child(7) { transition-delay: .29s; }

    @media (max-width: 720px) {
      .ak-burger { display: grid; }
      .ak-hide-mobile { display: none !important; }
    }
    @media (min-width: 721px) {
      .ak-mobile-menu { display: none !important; }
    }
  `;
  document.head.appendChild(s);
}

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

function Header({ active }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState(
    () => document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  );

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock body scroll + Esc-to-close while the mobile menu is open */
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    if (menuOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  /* Close menu if viewport grows past the mobile breakpoint */
  React.useEffect(() => {
    const onResize = () => { if (window.innerWidth > 720) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleTheme = React.useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.add('theme-transition');
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('ak-theme', next);
    setTheme(next);
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 350);
  }, [theme]);

  const links = [
    ['home', 'Home'], ['about', 'About'], ['stack', 'Stack'],
    ['projects', 'Projects'], ['repos', 'Repos'], ['contact', 'Contact'],
  ];

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      background: scrolled ? 'var(--header-bg)' : 'transparent',
      backdropFilter: scrolled ? 'blur(var(--blur-md))' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(var(--blur-md))' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)',
    }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: '18px var(--container-pad)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* logo */}
        <a href="/#home" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <span style={{
            width: 38, height: 38, display: 'grid', placeItems: 'center',
            border: '1px solid var(--border-strong)', borderRadius: 10,
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18,
            letterSpacing: '-0.04em', color: 'var(--white)', boxShadow: 'var(--inset-hairline)',
          }}>sY</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
            <b style={{ color: 'var(--white)', fontWeight: 600 }}>sy</b>ne<b style={{ color: 'var(--white)', fontWeight: 600 }}>T</b>ra
          </span>
        </a>

        {/* nav */}
        <nav style={{ display: 'flex', gap: 4 }} className="ak-nav">
          {links.map(([id, label]) => (
            <a key={id} href={'/#' + id} style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '8px 14px', borderRadius: 'var(--radius-pill)',
              color: active === id ? 'var(--white)' : 'var(--text-muted)',
              background: active === id ? 'var(--surface-card)' : 'transparent',
              border: active === id ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'color var(--dur-base) var(--ease-out)',
            }}
            onMouseEnter={(e) => { if (active !== id) e.currentTarget.style.color = 'var(--white)'; }}
            onMouseLeave={(e) => { if (active !== id) e.currentTarget.style.color = 'var(--text-muted)'; }}
            >{label}</a>
          ))}
          {/* Interests — separate page, icy frost hover */}
          <a href="/interests/" className="ak-frost-link" data-frost="Interests" style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '8px 14px', borderRadius: 'var(--radius-pill)',
            color: active === 'interests' ? 'var(--white)' : 'var(--text-muted)',
            background: active === 'interests' ? 'var(--surface-card)' : 'transparent',
            border: active === 'interests' ? '1px solid var(--border)' : '1px solid transparent',
            textShadow: active === 'interests' ? '0 0 12px var(--glow-medium)' : 'none',
          }}>Interests</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            style={{
              width: 38, height: 38, display: 'grid', placeItems: 'center',
              border: '1px solid var(--border-strong)', borderRadius: 10,
              background: 'var(--surface-card)', backdropFilter: 'blur(var(--blur-sm))',
              color: 'var(--text-secondary)', cursor: 'pointer',
              boxShadow: 'var(--inset-hairline)',
              transition: 'color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <span className="ak-hide-mobile"><Badge dot>Available</Badge></span>

          {/* burger — mobile only */}
          <button
            className="ak-burger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{
              width: 38, height: 38, placeItems: 'center',
              border: '1px solid var(--border-strong)', borderRadius: 10,
              background: 'var(--surface-card)', backdropFilter: 'blur(var(--blur-sm))',
              color: 'var(--text-secondary)', cursor: 'pointer', boxShadow: 'var(--inset-hairline)',
            }}
          >
            <span style={{ position: 'relative', width: 18, height: 12, display: 'block' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  position: 'absolute', left: 0, right: 0, height: 1.5, borderRadius: 1,
                  background: menuOpen ? 'var(--white)' : 'currentColor',
                  top: i === 0 ? 0 : i === 1 ? 5.25 : 10.5,
                  transformOrigin: 'center',
                  transform: menuOpen
                    ? (i === 0 ? 'translateY(5.25px) rotate(45deg)'
                      : i === 1 ? 'scaleX(0)' : 'translateY(-5.25px) rotate(-45deg)')
                    : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                  transition: 'transform var(--dur-base) var(--ease-out), opacity var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out)',
                }} />
              ))}
            </span>
          </button>
        </div>
      </div>

      {/* mobile menu overlay */}
      <div className={`ak-mobile-menu${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(false)}>
        {links.map(([id, label], i) => (
          <a key={id} href={'/#' + id} onClick={() => setMenuOpen(false)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)', fontSize: 17, letterSpacing: '0.06em',
            textTransform: 'uppercase', padding: '20px 4px', textDecoration: 'none',
            borderBottom: '1px solid var(--border-subtle)',
            color: active === id ? 'var(--white)' : 'var(--text-secondary)',
          }}>
            <span>{label}</span>
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{String(i + 1).padStart(2, '0')}</span>
          </a>
        ))}
        <a href="/interests/" onClick={() => setMenuOpen(false)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: 17, letterSpacing: '0.06em',
          textTransform: 'uppercase', padding: '20px 4px', textDecoration: 'none',
          borderBottom: '1px solid var(--border-subtle)',
          color: active === 'interests' ? 'var(--white)' : 'var(--text-secondary)',
          textShadow: '0 0 14px var(--glow-medium)',
        }}>
          <span>Interests</span>
          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{String(links.length + 1).padStart(2, '0')}</span>
        </a>
      </div>
    </header>
  );
}
window.Header = Header;
