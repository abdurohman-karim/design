// Portfolio — Contact + footer. cout<<'Contact'; form + social links.
const { SectionHeading, Input, Textarea, SocialLink } = window.DS;
const DecryptBtn = window.DecryptBtn;

function Contact() {
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent | error
  const [error, setError] = React.useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    const fd = new FormData(e.target);
    setStatus('sending');
    setError('');
    window.sendNotification({
      type: 'contact',
      name: fd.get('name'),
      email: fd.get('email'),
      message: fd.get('message'),
    }).then(() => {
      setStatus('sent');
    }).catch((err) => {
      setStatus('error');
      setError(err.message || 'Something went wrong. Please try again.');
    });
  };

  return (
    <section id="contact" className="ak-grid-bg" style={{ padding: 'var(--section-gap) 0 0', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <SectionHeading index={5} title="Contact"
          code={<><span style={{ color: 'var(--gray-400)' }}>cout</span> &lt;&lt; <span style={{ color: 'var(--gray-300)' }}>'Contact'</span>;</>}
          lede="Have a payment platform, bot or backend that needs building? Let's talk." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 56, marginTop: 56, alignItems: 'start' }}>
          {/* form */}
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <Input name="name" label="Name" placeholder="Your name" required disabled={status === 'sending' || status === 'sent'} />
            <Input name="email" label="Email" type="email" placeholder="you@domain.com" required disabled={status === 'sending' || status === 'sent'} />
            <Textarea name="message" label="Message" rows={5} placeholder="Tell me about the project…" required disabled={status === 'sending' || status === 'sent'} />
            <div>
              <DecryptBtn variant="primary" size="lg" arrow type="submit" disabled={status === 'sending' || status === 'sent'}>
                {status === 'sent' ? 'Message sent ✓' : status === 'sending' ? 'Sending…' : 'Send message'}
              </DecryptBtn>
            </div>
            {status === 'error' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>{error}</span>
            )}
          </form>

          {/* social */}
          <div>
            <SocialLink icon="send" label="Telegram" handle="@abdurohman_karimov" href="https://t.me/abdurohman_karimov" />
            <SocialLink icon="github" label="GitHub" handle="abdurohman-karim" href="https://github.com/abdurohman-karim" />
            <SocialLink icon="mail" label="Email" handle="ghostmagic766@gmail.com" href="mailto:ghostmagic766@gmail.com" />
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
