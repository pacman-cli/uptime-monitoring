import { type ReactNode, forwardRef } from 'react';
import { useTilt } from '@/hooks/useTilt';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  max?: number;
  glare?: number;
  /** Style for the wrapper (positioning, dimensions) */
  style?: React.CSSProperties;
}

/**
 * Wrapper that adds 3D mouse-tilt + optional glare overlay. Children are rendered inside.
 * The outer element transforms; the inner element gets the visible styling and glare overlay.
 */
export const TiltCard = forwardRef<HTMLDivElement, Props>(function TiltCard(
  { children, className, innerClassName, max = 6, glare = 0.12, style },
  externalRef
) {
  const { ref, glareRef } = useTilt({ max, glare });
  const combinedRef = (node: HTMLDivElement | null) => {
    (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof externalRef === 'function') externalRef(node);
    else if (externalRef) (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <div
      ref={combinedRef}
      className={cn('will-change-transform transition-transform duration-200', className)}
      style={style}
    >
      <div className={cn('relative h-full w-full', innerClassName)}>
        {children}
        {glare > 0 && (
          <div
            ref={glareRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </div>
    </div>
  );
});
