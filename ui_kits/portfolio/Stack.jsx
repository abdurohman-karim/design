// Portfolio — Tech Stack. print('Stack'), grouped tags.
const { SectionHeading, Tag, Icon } = window.DS;

function Stack() {
  const groups = [
    ['server', 'Languages & frameworks', ['PHP', 'Laravel', 'Python', 'aiogram', 'RoadRunner']],
    ['database', 'Data & infra', ['PostgreSQL', 'Redis', 'Docker', 'GitLab CI/CD']],
    ['bot', 'AI & integrations', ['OpenAI', 'Groq', 'DeepSeek', 'OpenRouter', 'SBP']],
  ];
  return (
    <section id="stack" style={{ padding: 'var(--section-gap) 0', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <SectionHeading index={2} title="Stack"
          code={<><span style={{ color: 'var(--gray-400)' }}>print</span>(<span style={{ color: 'var(--gray-300)' }}>'Stack'</span>)</>}
          lede="The tools I reach for to ship reliable, high-load backend systems." />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 48 }}>
          {groups.map(([icon, label, items], i) => (
            <div key={label} style={{
              display: 'grid', gridTemplateColumns: 'minmax(180px, 280px) 1fr', gap: 32,
              alignItems: 'center', padding: '28px 0',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: i === groups.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}><Icon name={icon} size={22} duotone /></span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {items.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Stack = Stack;
