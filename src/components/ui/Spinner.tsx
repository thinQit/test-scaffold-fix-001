import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Spinner({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('animate-spin rounded-full border-2 border-muted border-t-primary', className)}
      {...props}
    />
  );
}

export default Spinner;
