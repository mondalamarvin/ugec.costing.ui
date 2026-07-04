import type { ReactNode } from 'react';

export interface IForm {
  className?: string;
  children: ReactNode;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}
