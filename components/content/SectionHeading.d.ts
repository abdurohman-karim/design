import React from 'react';

export interface SectionHeadingProps {
  /** Section number, rendered zero-padded (1 → "01"). */
  index?: number;
  /** The code-syntax headline, e.g. console.log('Projects'). */
  code: React.ReactNode;
  /** Uppercase mono label next to the index. */
  title: string;
  /** Supporting paragraph. */
  lede?: React.ReactNode;
  align?: 'left' | 'center';
  id?: string;
}

/**
 * Signature code-syntax section header with index kicker.
 * @startingPoint section="Content" subtitle="Code-syntax section header" viewport="700x260"
 */
export function SectionHeading(props: SectionHeadingProps): JSX.Element;
