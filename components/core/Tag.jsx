import React from 'react';

/**
 * Tag — tech-stack pill. Mono type, glass hairline, white-glow hover.
 * Use for stack chips (PHP, Laravel, Redis…) and filter tokens.
 */
export function Tag({ children, active = false, size = 'md', ...rest }) {
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
