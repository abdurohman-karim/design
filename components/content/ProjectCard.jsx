import React from 'react';
import { Tag } from '../core/Tag.jsx';
import { Icon } from '../core/Icon.jsx';

/**
 * ProjectCard — showcase card for a portfolio project. Glass surface,
 * index + title row, description, key-feature list, tech tags, hover glow.
 */
export function ProjectCard({ index, title, kind, description, features = [], stack = [], href = '#' }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 20,
        padding: 32, borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-card)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        backdropFilter: 'blur(var(--blur-md))', WebkitBackdropFilter: 'blur(var(--blur-md))',
        boxShadow: hovered ? 'var(--glow-halo-md), var(--inset-hairline)' : 'var(--inset-hairline)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all var(--dur-base) var(--ease-out)',
        textDecoration: 'none', overflow: 'hidden',
      }}
    >
      {/* top row: index + arrow */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.24em', color: 'var(--text-faint)' }}>
            {String(index ?? 0).padStart(2, '0')}
          </span>
          {kind && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{kind}</span>
          )}
        </div>
        <span style={{
          color: hovered ? 'var(--white)' : 'var(--text-muted)',
          transform: hovered ? 'translate(2px,-2px)' : 'none',
          transition: 'all var(--dur-base) var(--ease-out)',
        }}>
          <Icon name="arrowUpRight" size={20} />
        </span>
      </div>

      {/* title */}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500,
        letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.1,
      }}>{title}</h3>

      {/* description */}
      {description && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0, textWrap: 'pretty' }}>
          {description}
        </p>
      )}

      {/* features */}
      {features.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }}><Icon name="check" size={14} /></span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      {/* stack */}
      {stack.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
          {stack.map((s) => <Tag key={s} size="sm">{s}</Tag>)}
        </div>
      )}
    </a>
  );
}
