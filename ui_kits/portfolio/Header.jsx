// Portfolio — Header / nav. Fixed, glass on scroll, monogram logo.
const { Badge } = window.DS;

function Header({ active }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          }}>aK</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
            <b style={{ color: 'var(--white)', fontWeight: 600 }}>a</b>bdurohman<b style={{ color: 'var(--white)', fontWeight: 600 }}>K</b>arim
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
          <Badge dot>Available</Badge>
        </div>
      </div>
    </header>
  );
}
window.Header = Header;
