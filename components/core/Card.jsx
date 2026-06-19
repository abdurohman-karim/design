import React from 'react';

/**
 * Card — glass surface container. Hairline border, optional white-glow hover.
 * Base building block for projects, stats, info panels.
 */
export function Card({ children, hover = false, padding = 'lg', glow = false, style, ...rest }) {
  const pads = { sm: 20, md: 28, lg: 36 };
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        position: 'relative',
        background: 'var(--surface-card)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: pads[padding] ?? pads.lg,
        backdropFilter: 'blur(var(--blur-md))',
        WebkitBackdropFilter: 'blur(var(--blur-md))',
        boxShadow: hovered && glow ? 'var(--glow-halo-md), var(--inset-hairline)' : 'var(--inset-hairline)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all var(--dur-base) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
