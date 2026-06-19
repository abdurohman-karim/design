import React from 'react';
import type { IconName } from '../core/Icon';

export interface SocialLinkProps {
  /** Icon name (send=Telegram, github, mail). */
  icon?: IconName;
  /** Uppercase mono caption, e.g. "Telegram". */
  label: string;
  /** The handle / address shown large. */
  handle: string;
  href?: string;
}

/** Contact row: framed icon + label + handle, arrow on hover. */
export function SocialLink(props: SocialLinkProps): JSX.Element;
