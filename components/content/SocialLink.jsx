import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * SocialLink — contact row: icon + label + handle, arrow on hover.
 * For Telegram / GitHub / email links in the contact section.
 */
export function SocialLink({ icon = 'send', label, handle, href = '#' }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 18, padding: '20px 4px',
        borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none',
        transition: 'all var(--dur-base) var(--ease-out)',
      }}
    >
      <span style={{
        display: 'grid', placeItems: 'center', width: 44, height: 44, flexShrink: 0,
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        background: 'var(--surface-card)',
        color: hovered ? 'var(--white)' : 'var(--text-secondary)',
        boxShadow: hovered ? 'var(--glow-halo-sm)' : 'none',
        transition: 'all var(--dur-base) var(--ease-out)',
      }}>
        <Icon name={icon} size={20} />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 17, color: hovered ? 'var(--white)' : 'var(--text-primary)', transition: 'color var(--dur-base) var(--ease-out)' }}>{handle}</span>
      </span>
      <span style={{
        color: hovered ? 'var(--white)' : 'var(--text-faint)',
        transform: hovered ? 'translateX(3px)' : 'none',
        transition: 'all var(--dur-base) var(--ease-out)',
      }}>
        <Icon name="arrowRight" size={18} />
      </span>
    </a>
  );
}
