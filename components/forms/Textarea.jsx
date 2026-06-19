import React from 'react';

/**
 * Textarea — multi-line counterpart to Input. Bordered glass box, white focus glow.
 */
export function Textarea({ label, rows = 4, style, ...rest }) {
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
