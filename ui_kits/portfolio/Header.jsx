// Portfolio — Header / nav. Fixed, glass on scroll, monogram logo + theme toggle.
const { Badge } = window.DS;

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
  const [theme, setTheme] = React.useState(
    () => document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  );

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
        <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
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
            <a key={id} href={'#' + id} style={{
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

          <Badge dot>Available</Badge>
        </div>
      </div>
    </header>
  );
}
window.Header = Header;
