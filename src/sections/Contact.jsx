// Portfolio — Contact + footer. cout << 'Contact';
//   • the form is a request composer: fields on the left, the live JSON body
//     of `POST /api/contact` on the right, and the server's response streams
//     in underneath (200 / 422 / 5xx) — same Telegram relay as before
//   • availability (with the local time in Fergana) + channels: Telegram,
//     GitHub, and an email tile that copies the address
//   • footer: brand (matches the header), live API heartbeat, back to top
// Wrapped in an IIFE: Babel script tags share one global scope.
(() => {
  const { SectionHeading, Icon } = window.DS;
  const DecryptBtn = window.DecryptBtn;
  const EMAIL = 'ghostmagic766@gmail.com';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.getElementById('ak-contact-css')) {
    const s = document.createElement('style');
    s.id = 'ak-contact-css';
    s.textContent = `
      .ak-contact-grid {
        display: grid; grid-template-columns: minmax(0, 8fr) minmax(0, 4fr);
        gap: 24px; margin-top: 56px; align-items: start;
      }
      @media (max-width: 1000px) { .ak-contact-grid { grid-template-columns: 1fr; } }
      .ak-panel {
        border: 1px solid var(--border); border-radius: 18px; overflow: hidden;
        background: var(--surface-card);
        backdrop-filter: blur(var(--blur-md)); -webkit-backdrop-filter: blur(var(--blur-md));
      }
      .ak-panel-bar {
        display: flex; align-items: center; gap: 12px; padding: 12px 18px;
        border-bottom: 1px solid var(--border-subtle);
        font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em; color: var(--text-faint);
      }
      .ak-panel-bar .dots { display: flex; gap: 6px; }
      .ak-panel-bar .dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--border-strong); }
      .ak-panel-bar b { color: var(--text-primary); font-weight: 500; }
      .ak-panel-bar .end { margin-left: auto; }

      /* request composer */
      .ak-req-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
      @media (max-width: 760px) { .ak-req-body { grid-template-columns: 1fr; } }
      .ak-req-form { display: flex; flex-direction: column; gap: 22px; padding: 26px 24px; }
      .ak-field { display: flex; flex-direction: column; gap: 8px; }
      .ak-field label {
        font-family: var(--font-mono); font-size: 11px; letter-spacing: .14em; text-transform: lowercase;
        color: var(--text-faint); transition: color var(--dur-base) var(--ease-out);
      }
      .ak-field:focus-within label { color: var(--text-primary); }
      .ak-field input, .ak-field textarea {
        width: 100%; box-sizing: border-box; margin: 0; resize: vertical;
        padding: 10px 0; border: 0; border-bottom: 1px solid var(--border-strong); border-radius: 0;
        background: transparent; outline: 0;
        font-family: var(--font-sans); font-size: 15px; line-height: 1.5; color: var(--text-primary);
        transition: border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
      }
      .ak-field input::placeholder, .ak-field textarea::placeholder { color: var(--text-faint); }
      .ak-field input:focus, .ak-field textarea:focus { border-bottom-color: var(--text-primary); box-shadow: 0 1px 0 0 var(--text-primary); }
      .ak-field.is-bad input, .ak-field.is-bad textarea { border-bottom-color: var(--text-primary); border-bottom-style: dashed; }
      .ak-field .err { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); }
      .ak-req-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
      .ak-req-reset {
        appearance: none; margin: 0; padding: 0; border: 0; background: none;
        font-family: var(--font-mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
        color: var(--text-muted); text-decoration: underline; text-underline-offset: 4px;
      }
      .ak-req-reset:hover { color: var(--text-primary); }

      .ak-req-wire {
        border-left: 1px solid var(--border-subtle); padding: 22px 22px 24px;
        font-family: var(--font-mono); font-size: 12px; line-height: 1.75; color: var(--text-faint);
        display: flex; flex-direction: column; min-width: 0;
      }
      @media (max-width: 760px) { .ak-req-wire { border-left: 0; border-top: 1px solid var(--border-subtle); } }
      .ak-req-wire pre { margin: 0; white-space: pre-wrap; word-break: break-word; font: inherit; }
      .ak-req-wire .m { color: var(--text-primary); font-weight: 500; }
      .ak-req-wire .k { color: var(--text-muted); }
      .ak-req-wire .v { color: var(--text-primary); }
      .ak-req-wire .v.empty { color: var(--text-faint); }
      .ak-req-wire .ln { display: block; border-radius: 4px; transition: background var(--dur-fast) ease; }
      .ak-req-wire .ln.is-live { background: var(--white-a06); }
      .ak-req-wire .caret {
        display: inline-block; width: 7px; height: 13px; margin-left: 1px; vertical-align: -2px;
        background: var(--text-primary); animation: ak-caret 1s steps(1) infinite;
      }
      @keyframes ak-caret { 50% { opacity: 0; } }
      .ak-req-resp { margin-top: auto; padding-top: 18px; border-top: 1px dashed var(--border); }
      .ak-req-resp .head { color: var(--text-muted); margin-bottom: 4px; }
      .ak-req-resp .status { color: var(--text-primary); font-weight: 500; }
      .ak-req-resp .bar { height: 2px; margin-top: 8px; background: var(--border); overflow: hidden; border-radius: 1px; }
      .ak-req-resp .bar i { display: block; height: 100%; width: 35%; background: var(--text-primary); animation: ak-req-load 1s ease-in-out infinite alternate; }
      @keyframes ak-req-load { from { transform: translateX(-100%); } to { transform: translateX(290%); } }
      @media (prefers-reduced-motion: reduce) {
        .ak-req-wire .caret, .ak-req-resp .bar i { animation: none; }
      }

      /* aside: availability + channels */
      .ak-avail { padding: 22px 22px 20px; display: flex; flex-direction: column; gap: 10px; }
      .ak-avail .st {
        display: inline-flex; align-items: center; gap: 10px;
        font-family: var(--font-display); font-size: 20px; font-weight: 500; color: var(--text-primary);
      }
      .ak-avail .st::before {
        content: ""; width: 8px; height: 8px; border-radius: 50%;
        background: var(--text-primary); box-shadow: 0 0 10px var(--glow-medium), 0 0 22px var(--glow-soft);
      }
      .ak-avail .meta { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: .02em; }
      .ak-avail .meta b { color: var(--text-primary); font-weight: 500; }
      .ak-channels { display: flex; flex-direction: column; margin-top: 16px; gap: 10px; }
      .ak-channel {
        display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; align-items: center; gap: 14px;
        width: 100%; box-sizing: border-box; margin: 0; padding: 16px 18px; text-align: left;
        appearance: none; font: inherit; text-decoration: none; color: inherit;
        border: 1px solid var(--border); border-radius: 14px; background: var(--surface-card);
        backdrop-filter: blur(var(--blur-md)); -webkit-backdrop-filter: blur(var(--blur-md));
        transition: border-color var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out);
      }
      .ak-channel:hover { border-color: var(--border-strong); background: var(--white-a06); }
      .ak-channel:focus-visible { outline: 1px solid var(--border-strong); outline-offset: 2px; }
      .ak-channel .ic {
        width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px;
        border: 1px solid var(--border); color: var(--text-secondary);
      }
      .ak-channel .lb { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--text-faint); }
      .ak-channel .hd { font-family: var(--font-sans); font-size: 15px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ak-channel .go {
        font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em; color: var(--text-muted); white-space: nowrap;
        transition: color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
      }
      .ak-channel:hover .go { color: var(--text-primary); transform: translateX(2px); }

      /* footer */
      .ak-foot {
        max-width: var(--container-max); margin: 0 auto; padding: 28px var(--container-pad);
        display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px 24px;
        font-family: var(--font-mono); font-size: 12px; color: var(--text-faint);
      }
      .ak-foot .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--text-muted); text-decoration: none; }
      .ak-foot .mark {
        width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid var(--border-strong);
        border-radius: 8px; font-family: var(--font-display); font-weight: 600; font-size: 13px;
        letter-spacing: -.04em; color: var(--text-primary);
      }
      .ak-foot .word { font-family: var(--font-display); font-size: 14px; color: var(--text-secondary); }
      .ak-foot .word b { color: var(--text-primary); font-weight: 600; }
      .ak-foot .top {
        appearance: none; margin: 0; padding: 7px 12px; border: 1px solid var(--border); border-radius: 999px;
        background: none; font: inherit; color: var(--text-muted);
        transition: color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
      }
      .ak-foot .top:hover { color: var(--text-primary); border-color: var(--border-strong); }
    `;
    document.head.appendChild(s);
  }

  /* ── request composer ── */
  function RequestComposer() {
    const [v, setV] = React.useState({ name: '', email: '', message: '' });
    const [live, setLive] = React.useState(null);           // field being edited
    const [status, setStatus] = React.useState('idle');     // idle | invalid | sending | sent | error
    const [errors, setErrors] = React.useState({});
    const [failure, setFailure] = React.useState('');
    const respRef = React.useRef(null);
    const busy = status === 'sending' || status === 'sent';

    const set = (k) => (e) => {
      setV((o) => ({ ...o, [k]: e.target.value }));
      if (errors[k]) setErrors((o) => { const n = { ...o }; delete n[k]; return n; });
    };

    const validate = () => {
      const e = {};
      if (!v.name.trim()) e.name = 'is required';
      if (!EMAIL_RE.test(v.email.trim())) e.email = 'must be a valid address';
      if (v.message.trim().length < 10) e.message = 'needs at least 10 characters';
      return e;
    };

    const onSubmit = (e) => {
      e.preventDefault();
      if (busy) return;
      const bad = validate();
      if (Object.keys(bad).length) { setErrors(bad); setStatus('invalid'); return; }
      setErrors({});
      setStatus('sending');
      window.sendNotification({ type: 'contact', name: v.name.trim(), email: v.email.trim(), message: v.message.trim() })
        .then(() => setStatus('sent'))
        .catch((err) => { setFailure(err.message || 'Something went wrong. Please try again.'); setStatus('error'); });
    };

    const reset = () => { setV({ name: '', email: '', message: '' }); setStatus('idle'); setErrors({}); setFailure(''); };

    /* the response streams in line by line */
    React.useLayoutEffect(() => {
      if (!respRef.current || reducedMotion() || status === 'idle') return;
      gsap.fromTo(respRef.current.querySelectorAll('.ln'), { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.07, ease: 'power2.out', overwrite: true });
    }, [status]);

    const val = (k, max) => {
      const raw = v[k].trim();
      if (!raw) return <span className="v empty">""</span>;
      const shown = raw.length > max ? `${raw.slice(0, max)}…` : raw;
      return <span className="v">{JSON.stringify(shown)}</span>;
    };
    const line = (k, max, last) => (
      <span className={`ln${live === k ? ' is-live' : ''}`}>
        {'  '}<span className="k">"{k}"</span>: {val(k, max)}{live === k && <span className="caret" />}{last ? '' : ','}
      </span>
    );

    let resp = null;
    if (status === 'idle') {
      resp = <span className="ln">// waiting for request…</span>;
    } else if (status === 'sending') {
      resp = <>
        <span className="ln head">⋯ awaiting response</span>
        <span className="ln bar"><i /></span>
      </>;
    } else if (status === 'sent') {
      resp = <>
        <span className="ln status">HTTP/1.1 200 OK</span>
        <span className="ln">{'{ '}<span className="k">"ok"</span>: <span className="v">true</span>, <span className="k">"delivered_to"</span>: <span className="v">"telegram"</span>{' }'}</span>
        <span className="ln">// thanks — I'll get back to you at {v.email.trim()}</span>
      </>;
    } else if (status === 'invalid') {
      resp = <>
        <span className="ln status">HTTP/1.1 422 Unprocessable Content</span>
        {Object.entries(errors).map(([k, msg]) => (
          <span className="ln" key={k}>{'  '}<span className="k">"{k}"</span>: <span className="v">"{msg}"</span></span>
        ))}
      </>;
    } else if (status === 'error') {
      resp = <>
        <span className="ln status">HTTP/1.1 502 Bad Gateway</span>
        <span className="ln">{'{ '}<span className="k">"error"</span>: <span className="v">{JSON.stringify(failure)}</span>{' }'}</span>
        <span className="ln">// or write directly: {EMAIL}</span>
      </>;
    }

    const field = (k, label, props) => (
      <div className={`ak-field${errors[k] ? ' is-bad' : ''}`}>
        <label htmlFor={`ak-c-${k}`}>{label}</label>
        {props.rows
          ? <textarea id={`ak-c-${k}`} name={k} value={v[k]} onChange={set(k)} onFocus={() => setLive(k)} onBlur={() => setLive(null)}
              disabled={busy} aria-invalid={!!errors[k]} autoComplete="off" {...props} />
          : <input id={`ak-c-${k}`} name={k} value={v[k]} onChange={set(k)} onFocus={() => setLive(k)} onBlur={() => setLive(null)}
              disabled={busy} aria-invalid={!!errors[k]} autoComplete="off" {...props} />}
        {errors[k] && <span className="err">{k} {errors[k]}</span>}
      </div>
    );

    return (
      <div className="ak-panel">
        <div className="ak-panel-bar">
          <span className="dots"><i /><i /><i /></span>
          <span><b>POST</b> /api/contact</span>
          <span className="end">application/json</span>
        </div>
        <div className="ak-req-body">
          <form className="ak-req-form" onSubmit={onSubmit} noValidate autoComplete="off">
            {field('name', 'name', { type: 'text', placeholder: 'Your name' })}
            {field('email', 'email', { type: 'email', placeholder: 'you@domain.com' })}
            {field('message', 'message', { rows: 5, placeholder: 'A payment platform, a bot, a backend that needs building…' })}
            <div className="ak-req-actions">
              <DecryptBtn variant="primary" size="lg" arrow type="submit" disabled={busy}>
                {status === 'sent' ? 'Delivered ✓' : status === 'sending' ? 'Sending…' : 'Send request'}
              </DecryptBtn>
              {status === 'sent' && <button type="button" className="ak-req-reset" onClick={reset}>new request</button>}
            </div>
          </form>

          <div className="ak-req-wire" aria-label="Request preview">
            <pre>
              <span className="ln"><span className="m">POST</span> /api/contact HTTP/1.1</span>
              <span className="ln">Content-Type: application/json</span>
              <span className="ln">&nbsp;</span>
              <span className="ln">{'{'}</span>
              {line('name', 40)}
              {line('email', 40)}
              {line('message', 140, true)}
              <span className="ln">{'}'}</span>
            </pre>
            <pre className="ak-req-resp" ref={respRef} aria-live="polite">{resp}</pre>
          </div>
        </div>
      </div>
    );
  }

  /* ── availability + channels ── */
  function Channels() {
    const [copied, setCopied] = React.useState(false);
    const Clock = window.AkClock;
    const copy = () => {
      const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(EMAIL).then(done, () => { window.location.href = `mailto:${EMAIL}`; });
      else window.location.href = `mailto:${EMAIL}`;
    };
    return (
      <div>
        <div className="ak-panel ak-avail">
          <span className="st">Available for new projects</span>
          <span className="meta">Fergana, Uzbekistan · {Clock ? <b><Clock /></b> : null} local time (UTC+5)</span>
        </div>
        <div className="ak-channels">
          <a className="ak-channel" href="https://t.me/abdurohman_karimov" target="_blank" rel="noopener noreferrer"
            data-cursor="lock" data-cursor-label="Telegram ↗">
            <span className="ic"><Icon name="send" size={18} /></span>
            <span><span className="lb">telegram</span><br /><span className="hd">@abdurohman_karimov</span></span>
            <span className="go">open ↗</span>
          </a>
          <a className="ak-channel" href="https://github.com/abdurohman-karim" target="_blank" rel="noopener noreferrer"
            data-cursor="lock" data-cursor-label="GitHub ↗">
            <span className="ic"><Icon name="github" size={18} /></span>
            <span><span className="lb">github</span><br /><span className="hd">abdurohman-karim</span></span>
            <span className="go">open ↗</span>
          </a>
          <button type="button" className="ak-channel" onClick={copy}
            data-cursor="lock" data-cursor-label={copied ? 'Copied ✓' : 'Copy email'}>
            <span className="ic"><Icon name="mail" size={18} /></span>
            <span><span className="lb">email</span><br /><span className="hd">{EMAIL}</span></span>
            <span className="go" aria-live="polite">{copied ? 'copied ✓' : 'copy ⧉'}</span>
          </button>
        </div>
      </div>
    );
  }

  function Contact() {
    const year = new Date().getFullYear();
    const toTop = () => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    return (
      <section id="contact" className="ak-grid-bg" style={{ padding: 'var(--section-gap) 0 0', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          <SectionHeading index={5} title="Contact"
            code={<><span style={{ color: 'var(--gray-400)' }}>cout</span> &lt;&lt; <span style={{ color: 'var(--gray-300)' }}>'Contact'</span>;</>}
            lede="Have a payment platform, bot or backend that needs building? Send a request — it lands straight in my Telegram." />

          <div className="ak-contact-grid">
            <RequestComposer />
            <Channels />
          </div>
        </div>

        <footer style={{ marginTop: 'var(--section-gap)', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="ak-foot">
            <a className="brand" href="/#home">
              <span className="mark">sY</span>
              <span className="word"><b>sy</b>ne<b>T</b>ra</span>
              <span>· backend developer</span>
            </a>
            {window.Heartbeat && <window.Heartbeat />}
            <span>© {year} · built with PHP, Python &amp; coffee</span>
            <button type="button" className="top" onClick={toTop}>↑ top</button>
          </div>
        </footer>
      </section>
    );
  }

  window.Contact = Contact;
})();
