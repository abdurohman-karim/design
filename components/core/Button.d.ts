import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. primary = solid white; secondary/outline = glass hairline; ghost = text only. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show a trailing → arrow. */
  arrow?: boolean;
  /** Full-width block. */
  full?: boolean;
  disabled?: boolean;
  /** Render as a different element, e.g. 'a'. */
  as?: 'button' | 'a';
  children?: React.ReactNode;
}

/**
 * Primary call-to-action button, monochrome with white-glow hover.
 * @startingPoint section="Core" subtitle="Monochrome CTA with glow + arrow" viewport="700x140"
 */
export function Button(props: ButtonProps): JSX.Element;
