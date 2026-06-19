import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'solid';
  /** Leading glow dot (e.g. "available"). */
  dot?: boolean;
  children?: React.ReactNode;
}

/** Tiny mono status / meta label. */
export function Badge(props: BadgeProps): JSX.Element;
