import { forwardRef, type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** id for in-page nav links + scroll-margin */
  id?: string;
  /** background tone: default = transparent, surface = slightly raised */
  tone?: 'default' | 'surface';
  /** Vertical padding (default 'py-24') */
  padding?: string;
  /** className for inner container */
  containerClassName?: string;
  /** Override element type (default 'section') */
  as?: 'section' | 'div' | 'article';
}

/**
 * Standardized section wrapper with consistent padding, container width, and scroll-margin
 * for in-page anchor nav.
 */
export const Section = forwardRef<HTMLElement, Props>(function Section(
  {
    children,
    id,
    tone = 'default',
    padding = 'py-24 sm:py-32',
    className,
    containerClassName,
    as: Tag = 'section',
    ...rest
  },
  ref
) {
  const TagComponent = Tag as ElementType;
  return (
    <TagComponent
      ref={ref}
      id={id}
      className={cn('relative scroll-mt-20', padding, tone === 'surface' && 'bg-surface/20', className)}
      {...rest}
    >
      <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', containerClassName)}>
        {children}
      </div>
    </TagComponent>
  );
});
