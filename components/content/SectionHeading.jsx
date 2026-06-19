import React from 'react';

/**
 * SectionHeading — the brand's signature header. A mono code-syntax title
 * (echo "…"; · print('…') · console.log('…')) with an index kicker and lede.
 */
export function SectionHeading({ index, code, title, lede, align = 'left', id }) {
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
