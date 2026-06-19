import React from 'react';

/**
 * Badge — tiny mono status/meta label. Variants: default, outline, solid, dot.
 */
export function Badge({ children, variant = 'default', dot = false, ...rest }) {
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
