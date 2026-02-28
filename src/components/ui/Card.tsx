import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('rounded-lg border border-border bg-background p-6 shadow-sm', className)}>{children}</div>;
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardSectionProps) {
  return <div className={cn('mb-4 space-y-1', className)}>{children}</div>;
}

export function CardContent({ children, className }: CardSectionProps) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardSectionProps) {
  return <div className={cn('mt-4 flex items-center justify-end', className)}>{children}</div>;
}

export default Card;
