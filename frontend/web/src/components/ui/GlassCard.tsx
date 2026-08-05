import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Border intensity: subtle (default) | strong */
  intensity?: 'subtle' | 'strong';
}

/**
 * Glassmorphism card: blurred translucent background with subtle border and soft inner shadow.
 * Used for feature cards, pricing, floating monitor widgets.
 */
export const GlassCard = forwardRef<HTMLDivElement, Props>(function GlassCard(
  { children, className, intensity = 'subtle', ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl border backdrop-blur-md',
        intensity === 'subtle'
          ? 'border-white/5 bg-surface/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
          : 'border-white/10 bg-surface/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.3)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
