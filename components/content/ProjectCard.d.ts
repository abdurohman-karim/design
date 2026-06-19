import React from 'react';

export interface ProjectCardProps {
  index?: number;
  /** Project name, e.g. "uCash". */
  title: string;
  /** Mono type label, e.g. "Payments platform · Laravel". */
  kind?: string;
  description?: React.ReactNode;
  /** Bulleted key features (each gets a check). */
  features?: string[];
  /** Tech-stack chips. */
  stack?: string[];
  href?: string;
}

/**
 * Portfolio project showcase card — glass, hover glow, tech tags.
 * @startingPoint section="Content" subtitle="Project showcase card with stack + features" viewport="700x420"
 */
export function ProjectCard(props: ProjectCardProps): JSX.Element;
