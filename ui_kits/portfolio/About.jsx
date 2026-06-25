// Portfolio — About. $_GET('About'), bio + approach principles + stats.
const { SectionHeading, StatCard, Card, Icon } = window.DS;

function About() {
  const principles = [
    ['database', 'DB-side aggregation', 'Heavy lifting in the database, not the application layer — fewer round-trips, predictable load.'],
    ['layers', 'Additive changes', 'Extend behaviour without breaking existing logic. Migrations and feature flags over rewrites.'],
    ['bolt', 'Redis-backed caching', 'Hot paths cached in Redis; queues and workers keep request latency flat under load.'],
  ];
  return (
    <section id="about" style={{ padding: 'var(--section-gap) 0', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <SectionHeading index={1} title="About"
          code={<><span style={{ color: 'var(--gray-400)' }}>$_GET</span>(<span style={{ color: 'var(--gray-300)' }}>'About'</span>)</>}
          lede="Backend / full-stack developer in fintech and payment systems. I design APIs, payment platforms and banking integrations — including SBP (Faster Payments) — and multi-provider AI services." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0, margin: '56px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          <StatCard value="30+" label="Projects" />
          <StatCard value="3+" label="Years" />
          <StatCard value="3" label="Languages" sub="PHP · Python · JS" />
          <StatCard value="∞" label="Edge cases" sub="handled" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {principles.map(([icon, title, body]) => (
            <Card key={title} hover glow padding="lg">
              <span style={{ color: 'var(--text-secondary)' }}><Icon name={icon} size={26} duotone /></span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: 'var(--white)', margin: '18px 0 10px' }}>{title}</h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0, textWrap: 'pretty' }}>{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
window.About = About;
