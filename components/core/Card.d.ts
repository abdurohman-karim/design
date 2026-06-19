import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lift + border-brighten on hover. */
  hover?: boolean;
  /** Add white-glow halo on hover (requires hover). */
  glow?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

/** Glass surface container with hairline border. */
export function Card(props: CardProps): JSX.Element;
