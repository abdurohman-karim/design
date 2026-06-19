import React from 'react';

export type IconName =
  | 'cube' | 'branch'
  | 'server' | 'database' | 'terminal' | 'code' | 'shield' | 'bolt'
  | 'layers' | 'bot' | 'mail' | 'send' | 'github'
  | 'arrowUpRight' | 'arrowRight' | 'arrowDown' | 'external' | 'check';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Add the 0.24 ghost fill (duotone icons only: cube, branch). */
  duotone?: boolean;
}

/** Monochrome line icon, renders with currentColor. */
export function Icon(props: IconProps): JSX.Element;
export const ICON_NAMES: IconName[];
