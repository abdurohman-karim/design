import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Filled white state (selected / active filter). */
  active?: boolean;
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

/** Mono tech-stack pill with glass hairline. */
export function Tag(props: TagProps): JSX.Element;
