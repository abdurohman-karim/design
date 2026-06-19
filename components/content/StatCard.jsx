import React from 'react';

/**
 * StatCard — large mono number + label. Used in the About stat row.
 */
export function StatCard({ value, label, sub }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '24px 4px',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)',
        fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--text-primary)',
        lineHeight: 1, textShadow: 'var(--glow-text)',
      }}>{value}</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
      }}>{label}</span>
      {sub && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-faint)' }}>{sub}</span>
      )}
    </div>
  );
}
