// UI primitives shared by every section: SectionHeading, Icon, Tag, Badge,
// Input, Textarea. Exposed on window.DS (sections read them with
// `const { SectionHeading, Icon } = window.DS;`), so this file must load
// before any section script. Wrapped in an IIFE: Babel script tags share one
// global scope.
(() => {
  /* props minus the named keys — used instead of `{ a, b, ...rest }` params,
     which make Babel hoist an `_excluded` binding into the global scope that
     all the text/babel scripts share (another file's `_excluded` then
     collides with it). */
  const omit = (obj, keys) => {
    const out = {};
    for (const k in obj) if (!keys.includes(k)) out[k] = obj[k];
    return out;
  };
  window.akOmit = omit;   // DecryptBtn uses it too

  /* ── SectionHeading ─────────────────────────────────────────────── */
  /**
   * SectionHeading — the brand's signature header. A mono code-syntax title
   * (echo "…"; · print('…') · console.log('…')) with an index kicker and lede.
   */
  function SectionHeading({ index, code, title, lede, align = 'left', id }) {
    return (
      <header id={id} style={{
        display: 'flex', flexDirection: 'column', gap: 18,
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align === 'center' ? 'center' : 'left',
        maxWidth: 720,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {index != null && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.24em',
              color: 'var(--text-faint)',
            }}>{String(index).padStart(2, '0')}</span>
          )}
          <span style={{ width: 28, height: 1, background: 'var(--border-strong)' }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>{title}</span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)',
          lineHeight: 1.05, margin: 0,
        }}>{code}</h2>
        {lede && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 'clamp(15px, 1.4vw, 18px)',
            lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0,
            maxWidth: 620, textWrap: 'pretty',
          }}>{lede}</p>
        )}
      </header>
    );
  }

  /* ── Icon ─────────────────────────────────────────────── */
  /**
   * Icon — monochrome line icons (24px, 2px stroke, round joins).
   * The portfolio set is Iconsax-style: the developer's original cube /
   * code-branch / bar-chart / development glyphs (duotone, 0.24 ghost fill)
   * recolored to white, plus matching stroke icons for UI/social needs.
   * Renders with currentColor so it inherits text color.
   */
  const DUOTONE = {
    cube: {
      ghost: 'M12 10.7713L2 5.76859V16.7425C2 17.511 2.43124 18.2131 3.11275 18.554L12 23V10.7713Z',
      stroke: 'M12 10.7713L2 5.76859M12 10.7713L22 5.76859M12 10.7713V23M2 5.76859L11.1128 1.20978C11.6719 0.930072 12.3281 0.930072 12.8873 1.20978L22 5.76859M2 5.76859V16.7425C2 17.511 2.43124 18.2131 3.11275 18.554L12 23M22 5.76859V16.7425C22 17.511 21.5688 18.2131 20.8873 18.554L12 23',
    },
    branch: {
      ghost: 'M8 4C8 5.10457 7.10457 6 6 6C4.89543 6 4 5.10457 4 4C4 2.89543 4.89543 2 6 2C7.10457 2 8 2.89543 8 4ZM20 4C20 5.10457 19.1046 6 18 6C16.8954 6 16 5.10457 16 4C16 2.89543 16.8954 2 18 2C19.1046 2 20 2.89543 20 4ZM8 20C8 21.1046 7.10457 22 6 22C4.89543 22 4 21.1046 4 20C4 18.8954 4.89543 18 6 18C7.10457 18 8 18.8954 8 20Z',
      stroke: 'M6 6C7.10457 6 8 5.10457 8 4C8 2.89543 7.10457 2 6 2C4.89543 2 4 2.89543 4 4C4 5.10457 4.89543 6 6 6ZM6 6V14.5M18 6C19.1046 6 20 5.10457 20 4C20 2.89543 19.1046 2 18 2C16.8954 2 16 2.89543 16 4C16 5.10457 16.8954 6 18 6ZM18 6V10C18 11.1046 17.1046 12 16 12H10.1569C9.09599 12 8.07857 12.4214 7.32843 13.1716L6 14.5M6 18C4.89543 18 4 18.8954 4 20C4 21.1046 4.89543 22 6 22C7.10457 22 8 21.1046 8 20C8 18.8954 7.10457 18 6 18ZM6 18V14.5',
    },
  };

  const STROKE = {
    server: 'M5 4h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM5 13h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM7 8h.01M7 17h.01',
    database: 'M12 3c4.97 0 9 1.34 9 3s-4.03 3-9 3-9-1.34-9-3 4.03-3 9-3ZM3 6v6c0 1.66 4.03 3 9 3s9-1.34 9-3V6M3 12v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6',
    terminal: 'M5 7l5 5-5 5M13 17h6',
    code: 'M9 18l-6-6 6-6M15 6l6 6-6 6',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
    bolt: 'M13 2L3 14h8l-1 8 10-12h-8l1-8Z',
    layers: 'M12 2l9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
    bot: 'M12 8V4M8 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2ZM2 14h2M20 14h2M9 14v1M15 14v1',
    mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM22 7l-10 6L2 7',
    send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z',
    github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
    arrowUpRight: 'M7 17L17 7M7 7h10v10',
    arrowRight: 'M5 12h14M13 6l6 6-6 6',
    arrowDown: 'M12 5v14M6 13l6 6 6-6',
    external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
    check: 'M20 6L9 17l-5-5',
  };

  function Icon(props) {
    const { name, size = 24, strokeWidth = 2, duotone = false, style } = props;
    const rest = omit(props, ['name', 'size', 'strokeWidth', 'duotone', 'style']);
    const common = {
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      style: { display: 'block', flexShrink: 0, ...style }, ...rest,
    };
    if (DUOTONE[name]) {
      const d = DUOTONE[name];
      return (
        <svg {...common}>
          {duotone && <path opacity="0.24" d={d.ghost} fill="currentColor" />}
          <path d={d.stroke} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    const path = STROKE[name] || STROKE.code;
    return (
      <svg {...common}>
        <path d={path} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  /* ── Tag ─────────────────────────────────────────────── */
  /**
   * Tag — tech-stack pill. Mono type, glass hairline, white-glow hover.
   * Use for stack chips (PHP, Laravel, Redis…) and filter tokens.
   */
  function Tag(props) {
    const { children, active = false, size = 'md' } = props;
    const rest = omit(props, ['children', 'active', 'size']);
    const sizes = {
      sm: { padding: '5px 10px', fontSize: '11px' },
      md: { padding: '7px 14px', fontSize: '12px' },
    };
    const s = sizes[size] || sizes.md;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: s.padding,
          fontFamily: 'var(--font-mono)',
          fontSize: s.fontSize,
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: active ? 'var(--black)' : 'var(--text-secondary)',
          background: active ? 'var(--white)' : 'var(--surface-card)',
          border: `1px solid ${active ? 'var(--white)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-pill)',
          backdropFilter: 'blur(var(--blur-sm))',
          cursor: 'default',
          transition: 'all var(--dur-base) var(--ease-out)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (active) return;
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.color = 'var(--white)';
        }}
        onMouseLeave={(e) => {
          if (active) return;
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        {...rest}
      >
        {children}
      </span>
    );
  }

  /* ── Badge ─────────────────────────────────────────────── */
  /**
   * Badge — tiny mono status/meta label. Variants: default, outline, solid, dot.
   */
  function Badge(props) {
    const { children, variant = 'default', dot = false } = props;
    const rest = omit(props, ['children', 'variant', 'dot']);
    const variants = {
      default: { background: 'var(--surface-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
      outline: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' },
      solid:   { background: 'var(--white)', color: 'var(--black)', border: '1px solid var(--white)' },
    };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '4px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10.5px',
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          borderRadius: 'var(--radius-sm)',
          ...(variants[variant] || variants.default),
          ...rest.style,
        }}
        {...rest}
      >
        {dot && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }} />
        )}
        {children}
      </span>
    );
  }

  /* ── Input ─────────────────────────────────────────────── */
  /**
   * Input — minimal underline field on dark glass. Focus = white underline + glow.
   * Pass label for a mono caption above.
   */
  function Input(props) {
    const { label, type = 'text', style } = props;
    const rest = omit(props, ['label', 'type', 'style']);
    const [focused, setFocused] = React.useState(false);
    return (
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {label && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.16em',
            textTransform: 'uppercase', color: focused ? 'var(--text-secondary)' : 'var(--text-muted)',
            transition: 'color var(--dur-base) var(--ease-out)',
          }}>{label}</span>
        )}
        <input
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${focused ? 'var(--white)' : 'var(--border-strong)'}`,
            padding: '12px 2px',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            color: 'var(--text-primary)',
            outline: 'none',
            boxShadow: focused ? '0 1px 0 var(--white), var(--glow-halo-sm)' : 'none',
            transition: 'all var(--dur-base) var(--ease-out)',
            ...style,
          }}
          {...rest}
        />
      </label>
    );
  }

  /* ── Textarea ─────────────────────────────────────────────── */
  /**
   * Textarea — multi-line counterpart to Input. Bordered glass box, white focus glow.
   */
  function Textarea(props) {
    const { label, rows = 4, style } = props;
    const rest = omit(props, ['label', 'rows', 'style']);
    const [focused, setFocused] = React.useState(false);
    return (
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {label && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.16em',
            textTransform: 'uppercase', color: focused ? 'var(--text-secondary)' : 'var(--text-muted)',
            transition: 'color var(--dur-base) var(--ease-out)',
          }}>{label}</span>
        )}
        <textarea
          rows={rows}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            resize: 'vertical',
            background: 'var(--surface-card)',
            border: `1px solid ${focused ? 'var(--white)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            outline: 'none',
            boxShadow: focused ? 'var(--glow-halo-sm)' : 'none',
            transition: 'all var(--dur-base) var(--ease-out)',
            ...style,
          }}
          {...rest}
        />
      </label>
    );
  }

  window.DS = { SectionHeading, Icon, Tag, Badge, Input, Textarea };
})();
