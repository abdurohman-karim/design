// Portfolio — Repositories. git ls-remote, live GitHub repos.
const { SectionHeading, Icon } = window.DS;

const LANG_COLORS = {
  PHP: '#7377AD',
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  Vue: '#41b883',
  HTML: '#e34c26',
  SCSS: '#c6538c',
  Handlebars: '#f7931e',
  Blade: '#f05340',
  TypeScript: '#3178c6',
  CSS: '#563d7c',
};

function LangDot({ lang }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: LANG_COLORS[lang] || 'var(--gray-500)', flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>{lang}</span>
    </span>
  );
}

function RepoCard({ name, description, language, stargazers_count, html_url }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={html_url} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        height: '100%', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: '22px 24px', borderRadius: 16,
        border: '1px solid',
        borderColor: hovered ? 'var(--border-strong)' : 'var(--border)',
        background: hovered ? 'var(--surface-card)' : 'transparent',
        transition: 'all var(--dur-base) var(--ease-out)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ color: hovered ? 'var(--white)' : 'var(--text-secondary)', transition: 'color var(--dur-base) var(--ease-out)' }}>
            <Icon name="branch" size={16} duotone />
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            ⭐ {stargazers_count}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, margin: '4px 0 8px',
            color: hovered ? 'var(--white)' : 'var(--text-primary)',
            transition: 'color var(--dur-base) var(--ease-out)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {name}
          </h4>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.6, margin: 0,
            color: description ? 'var(--text-secondary)' : 'var(--text-faint)',
            fontStyle: description ? 'normal' : 'italic',
          }}>
            {description || 'No description'}
          </p>
        </div>

        {language && (
          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <LangDot lang={language} />
          </div>
        )}
      </div>
    </a>
  );
}

function FilterBtn({ label, active, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
        padding: '6px 14px', borderRadius: 99,
        cursor: 'pointer', border: '1px solid',
        borderColor: active ? 'var(--border-strong)' : hovered ? 'var(--border)' : 'var(--border-subtle)',
        background: active ? 'var(--surface-card)' : 'transparent',
        color: active ? 'var(--white)' : hovered ? 'var(--text-secondary)' : 'var(--text-muted)',
        transition: 'all var(--dur-base) var(--ease-out)',
      }}>
      {label}
    </button>
  );
}

function Repositories() {
  const [repos, setRepos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [filter, setFilter] = React.useState('All');

  React.useEffect(() => {
    fetch('https://api.github.com/users/abdurohman-karim/repos?per_page=100&sort=stars')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) { setError(true); setLoading(false); return; }
        const list = data
          .filter(r => !r.fork && r.name !== 'abdurohman-karim')
          .sort((a, b) => b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name));
        setRepos(list);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const languages = React.useMemo(
    () => ['All', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort()],
    [repos]
  );
  const visible = filter === 'All' ? repos : repos.filter(r => r.language === filter);

  return (
    <section id="repos" style={{ padding: 'var(--section-gap) 0', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <SectionHeading index={4} title="Repositories"
          code={<><span style={{ color: 'var(--gray-400)' }}>git</span> <span style={{ color: 'var(--gray-300)' }}>ls-remote</span></>}
          lede="Public repositories on GitHub — payments, bots, apps and experiments across PHP, Python, JavaScript and Vue." />

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Fetching repositories…
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Could not load repositories. <a href="https://github.com/abdurohman-karim" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--white)' }}>View on GitHub →</a>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* language filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 40, marginBottom: 32 }}>
              {languages.map(lang => (
                <FilterBtn key={lang} label={lang} active={filter === lang} onClick={() => setFilter(lang)} />
              ))}
            </div>

            {/* repo grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, alignItems: 'stretch' }}>
              {visible.map(repo => <RepoCard key={repo.id} {...repo} />)}
            </div>

            {/* github link */}
            <div style={{ marginTop: 36, textAlign: 'center' }}>
              <a href="https://github.com/abdurohman-karim" target="_blank" rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em',
                  color: 'var(--text-muted)', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', border: '1px solid var(--border-subtle)',
                  borderRadius: 99, transition: 'all var(--dur-base) var(--ease-out)',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--surface-card)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon name="github" size={13} />
                View all on GitHub
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
window.Repositories = Repositories;
