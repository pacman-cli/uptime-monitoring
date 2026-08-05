import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  /** 'brand' = green→emerald, 'aurora' = brand→sky, 'sunset' = purple→pink */
  variant?: 'brand' | 'aurora' | 'sunset';
}

const variants: Record<NonNullable<Props['variant']>, string> = {
  brand: 'from-brand via-emerald-400 to-brand',
  aurora: 'from-brand via-sky-400 to-violet-400',
  sunset: 'from-amber-400 via-pink-400 to-purple-500',
};

export function GradientText({ children, className, variant = 'brand' }: Props) {
  return (
    <span
      className={cn(
        'bg-clip-text text-transparent bg-gradient-to-r',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
