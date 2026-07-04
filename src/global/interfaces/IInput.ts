import type { ChangeEvent } from 'react';
export interface IInput {
  className?: string;
  label: string;
  name: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  maxLength?: number;
  value?: string | number;
  variant?: string;
}
