import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const Container = ({
  className,
  children,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('container mx-auto px-4 mt-5', className)}>
      {children}
    </div>
  );
};
