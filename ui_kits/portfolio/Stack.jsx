// Portfolio — Stack. print('Stack'), GSAP card-deck reveal (pinned section).
const { SectionHeading, Tag, Icon } = window.DS;

const GROUPS = [
  {
    icon:  'server',
    label: 'Backend',
    desc:  'High-load APIs, event-driven workers, full Laravel ecosystem',
    items: ['PHP', 'Laravel', 'Python', 'Node.js', 'RoadRunner', 'Livewire', 'Laravel Jobs', 'Queue Workers', 'CRON Jobs', 'aiogram'],
  },
  {
    icon:  'code',
    label: 'Frontend',
    desc:  'Reactive UIs, design systems and modern CSS tooling',
    items: ['JavaScript (ES6+)', 'Vue.js', 'Vuex', 'SCSS / SASS', 'Tailwind CSS', 'Bootstrap', 'HTML / CSS', 'ESLint', 'BEM', 'Animate.css'],
  },
  {
    icon:  'database',
    label: 'Databases',
    desc:  'SQL, NoSQL, caching layers and partitioning strategies',
    items: ['PostgreSQL', 'MySQL', 'MariaDB', 'MongoDB', 'Redis', 'DB Partitioning', 'DataGrip'],
  },
  {
    icon:  'bolt',
    label: 'API & Auth',
    desc:  'REST, JSON-RPC, OAuth flows and third-party API integrations',
    items: ['REST API', 'JSON-RPC', 'JWT', 'OAuth', 'Bearer Token', 'Basic Auth', 'API Key', 'Telegram Bot API', 'Trello API'],
  },
  {
    icon:  'layers',
    label: 'DevOps & Infra',
    desc:  'Containerisation, CI/CD pipelines, messaging and observability',
    items: ['Docker', 'GitHub Actions', 'GitLab CI/CD', 'RabbitMQ', 'Grafana', 'Sentry', 'Hestia CP'],
  },
  {
    icon:  'bot',
    label: 'AI & Bots',
    desc:  'LLM integrations, Telegram bots and computer-vision pipelines',
    items: ['OpenAI', 'Groq', 'DeepSeek', 'OpenRouter', 'python-telegram-bot', 'OpenCV', 'SBP'],
  },
  {
    icon:  'shield',
    label: 'Security',
    desc:  'Penetration testing, network analysis and vulnerability assessment',
    items: ['Nmap', 'Wireshark', 'SQLMap', 'Nikto', 'Burp Suite', 'Dirsearch', 'Metasploit', 'Hydra', 'Hashcat', 'Netcat'],
  },
  {
    icon:  'terminal',
    label: 'Tools & Creative',
    desc:  'Animation libs, 3D, design tools and everyday dev stack',
    items: ['GSAP', 'Three.js', 'Tilt.js', 'jQuery', 'Figma', 'Pixso', 'Canva', 'Git', 'Linux', 'Bitrix24'],
  },
];

function Stack() {
  const sectionRef = React.useRef(null);
  const cardsRef   = React.useRef([]);
  const counterRef = React.useRef(null);
  const progRef    = React.useRef(null);
  const n = GROUPS.length;

  React.useEffect(() => {
    const section = sectionRef.current;
    const cards   = cardsRef.current;
    const isMob   = window.innerWidth < 768;

    /* depth per "behind" layer */
    const LAYER = { y: isMob ? 8 : 14, scale: 0.03, opacityStep: 0.22 };
    const EXIT_Y = -(window.innerHeight * 0.9);
    const ROTS   = [3.2, -3.5, 2.8]; /* alternating z-rotation on exit */

    /* ── seed initial stack state ── */
    cards.forEach((card, i) => {
      gsap.set(card, {
        xPercent: -50,
        yPercent: -50,
        y:        i * LAYER.y,
        scale:    1 - i * LAYER.scale,
        opacity:  i === 0 ? 1 : Math.max(0.28, 1 - i * LAYER.opacityStep),
        rotation: 0,
        zIndex:   n - i,
      });
    });

    /* ── build transition timeline (n-1 steps, each unit=1) ── */
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    for (let step = 0; step < n - 1; step++) {
      const rot = isMob ? 0 : ROTS[step % ROTS.length];

      /* active card flies off upward */
      tl.to(cards[step], {
        y: EXIT_Y, scale: 0.80, opacity: 0, rotation: rot,
        xPercent: -50, yPercent: -50, duration: 1,
      }, step);

      /* all remaining cards advance one layer */
      for (let j = step + 1; j < n; j++) {
        const rel = j - step - 1; /* 0 = next active, 1 = second, … */
        tl.to(cards[j], {
          y:       rel * LAYER.y,
          scale:   1 - rel * LAYER.scale,
          opacity: rel === 0 ? 1 : Math.max(0.28, 1 - rel * LAYER.opacityStep),
          rotation: 0,
          xPercent: -50, yPercent: -50, duration: 1,
        }, step);
      }
    }

    /* ── ScrollTrigger pin + scrub ── */
    const st = ScrollTrigger.create({
      trigger:   section,
      pin:       true,
      scrub:     1.2,
      start:     'top top',
      end:       `+=${window.innerHeight * (n - 1)}`,
      animation: tl,
      onUpdate: (self) => {
        const idx = Math.min(n - 1, Math.floor(self.progress * n));
        if (counterRef.current) counterRef.current.textContent = String(idx + 1).padStart(2, '0');
        if (progRef.current)    progRef.current.style.transform = `scaleY(${self.progress})`;
      },
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);
    return () => { st.kill(); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <section id="stack" ref={sectionRef} style={{
      position: 'relative',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderTop: '1px solid var(--border-subtle)',
    }}>

      {/* ── Section heading (stays fixed at top of the pin) ── */}
      <div style={{
        flexShrink: 0,
        width: '100%',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: '52px var(--container-pad) 0',
        boxSizing: 'border-box',
      }}>
        <SectionHeading index={2} title="Stack"
          code={<><span style={{ color: 'var(--gray-400)' }}>print</span>(<span style={{ color: 'var(--gray-300)' }}>'Stack'</span>)</>}
          lede="The tools I reach for to ship reliable, high-load backend systems." />
      </div>

      {/* ── Card deck ── */}
      <div style={{
        flex: 1,
        position: 'relative',
        perspective: '1200px',
        minHeight: 0,
      }}>
        {GROUPS.map((g, i) => (
          <div
            key={g.label}
            ref={el => cardsRef.current[i] = el}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 'min(700px, calc(100vw - 48px))',
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: 'var(--surface-raised)',
              boxShadow: '0 0 0 1px var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              willChange: 'transform, opacity',
              transformStyle: 'preserve-3d',
              overflow: 'hidden',
            }}
          >
            {/* card body */}
            <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* header row: icon + label + description */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span style={{ color: 'var(--text-secondary)', marginTop: 2, flexShrink: 0 }}>
                  <Icon name={g.icon} size={26} duotone />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}>
                    {g.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 13,
                    color: 'var(--text-faint)', lineHeight: 1.5,
                    letterSpacing: '0.01em',
                  }}>
                    {g.desc}
                  </span>
                </div>
              </div>

              {/* divider */}
              <div style={{ height: 1, background: 'var(--border-subtle)', marginLeft: 0 }} />

              {/* tech tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {g.items.map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>

            {/* card footer: skill-set label + card number */}
            <div style={{
              padding: '14px 40px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--text-faint)',
              }}>
                skill set
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
                color: 'var(--text-muted)',
              }}>
                {String(i + 1).padStart(2, '0')}
                <span style={{ color: 'var(--text-faint)' }}> / {String(n).padStart(2, '0')}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Progress indicator (right side) ── */}
      <div style={{
        position: 'absolute',
        right: 28,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <span ref={counterRef} style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.08em', color: 'var(--text-muted)',
        }}>
          01
        </span>
        <div style={{
          width: 1, height: 64,
          background: 'var(--border)',
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div ref={progRef} style={{
            position: 'absolute', inset: 0,
            background: 'var(--text-secondary)',
            transformOrigin: 'top center',
            transform: 'scaleY(0)',
            borderRadius: 1,
          }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.08em', color: 'var(--text-faint)',
        }}>
          {String(n).padStart(2, '0')}
        </span>
      </div>

    </section>
  );
}
window.Stack = Stack;
