import React from 'react';

/**
 * Input — minimal underline field on dark glass. Focus = white underline + glow.
 * Pass label for a mono caption above.
 */
export function Input({ label, type = 'text', style, ...rest }) {
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
