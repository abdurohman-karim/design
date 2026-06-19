import React from 'react';

export interface StatCardProps {
  /** Big number, e.g. "20+". */
  value: React.ReactNode;
  /** Uppercase mono caption. */
  label: string;
  /** Optional secondary line. */
  sub?: string;
}

/** Large glowing stat figure with mono label. */
export function StatCard(props: StatCardProps): JSX.Element;
