// Portfolio — Contact + footer. cout<<'Contact'; form + social links.
const { SectionHeading, Input, Textarea, Button, SocialLink } = window.DS;

function Contact() {
  const [sent, setSent] = React.useState(false);
  return (
    <section id="contact" className="ak-grid-bg" style={{ padding: 'var(--section-gap) 0 0', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <SectionHeading index={5} title="Contact"
          code={<><span style={{ color: 'var(--gray-400)' }}>cout</span> &lt;&lt; <span style={{ color: 'var(--gray-300)' }}>'Contact'</span>;</>}
          lede="Have a payment platform, bot or backend that needs building? Let's talk." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 56, marginTop: 56, alignItems: 'start' }}>
          {/* form */}
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <Input label="Name" placeholder="Your name" required />
            <Input label="Email" type="email" placeholder="you@domain.com" required />
            <Textarea label="Message" rows={5} placeholder="Tell me about the project…" required />
            <div>
              <Button variant="primary" size="lg" arrow type="submit">
                {sent ? 'Message sent ✓' : 'Send message'}
              </Button>
            </div>
          </form>

          {/* social */}
          <div>
            <SocialLink icon="send" label="Telegram" handle="@abdurohman" href="https://t.me/abdurohman" />
            <SocialLink icon="github" label="GitHub" handle="abdurohman-karim" href="https://github.com/abdurohman-karim" />
            <SocialLink icon="mail" label="Email" handle="hello@abdurohman.dev" href="mailto:hello@abdurohman.dev" />
          </div>
        </div>
      </div>

      {/* footer */}
      <footer style={{ marginTop: 'var(--section-gap)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          maxWidth: 'var(--container-max)', margin: '0 auto', padding: '32px var(--container-pad)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>aK</span> — Backend Developer
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
            // built with PHP, Python &amp; coffee · 2025
          </span>
        </div>
      </footer>
    </section>
  );
}
window.Contact = Contact;
