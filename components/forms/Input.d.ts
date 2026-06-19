import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Mono caption shown above the field. */
  label?: string;
}

/** Minimal underline text field on dark glass. */
export function Input(props: InputProps): JSX.Element;
