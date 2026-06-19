import React from 'react';

/**
 * Button — monochrome action.
 * Variants: primary (solid white), secondary (glass hairline), ghost (text), outline.
 * White-glow hover, no hue. Optional trailing arrow.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  arrow = false,
  full = false,
  disabled = false,
  as = 'button',
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: '12px', height: 36, gap: 8 },
    md: { padding: '12px 22px', fontSize: '13px', height: 46, gap: 10 },
    lg: { padding: '16px 30px', fontSize: '14px', height: 56, gap: 12 },
  };
  const s = sizes[size] || sizes.md;

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    width: full ? '100%' : 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: s.fontSize,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all var(--dur-base) var(--ease-out)',
    whiteSpace: 'nowrap',
    WebkitFontSmoothing: 'antialiased',
  };

  const variants = {
    primary: {
      background: 'var(--white)',
      color: 'var(--black)',
      boxShadow: 'var(--glow-halo-sm)',
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-strong)',
      backdropFilter: 'blur(var(--blur-sm))',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-strong)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
  };

  const Tag = as;
  return (
    <Tag
      style={{ ...base, ...(variants[variant] || variants.primary) }}
      disabled={as === 'button' ? disabled : undefined}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = 'var(--glow-halo-md)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        } else {
          e.currentTarget.style.borderColor = 'var(--white)';
          e.currentTarget.style.color = 'var(--white)';
          e.currentTarget.style.boxShadow = 'var(--glow-halo-sm)';
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = 'none';
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = 'var(--glow-halo-sm)';
        } else {
          e.currentTarget.style.borderColor = variant === 'ghost' ? 'transparent' : 'var(--border-strong)';
          e.currentTarget.style.color = variant === 'ghost' ? 'var(--text-secondary)' : 'var(--text-primary)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      {...rest}
    >
      {children}
      {arrow && (
        <span aria-hidden="true" style={{ fontSize: '1.1em', lineHeight: 1, marginTop: '-1px' }}>→</span>
      )}
    </Tag>
  );
}
