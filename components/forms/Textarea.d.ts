import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

/** Multi-line glass text field with white focus glow. */
export function Textarea(props: TextareaProps): JSX.Element;
