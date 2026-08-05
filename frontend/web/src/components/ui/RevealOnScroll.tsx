import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';
import { fadeUp, pickVariants } from '@/lib/motion';

interface Props {
  children: ReactNode;
  className?: string;
  /** Override the default variant */
  variant?: Variants;
  /** IntersectionObserver margin (default -60px bottom) */
  margin?: string;
  /** Trigger once (default true) */
  once?: boolean;
  /** Custom delay in seconds */
  delay?: number;
  /** as element */
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
}

/**
 * Reveal child on scroll into view. Default = fade + blur + 32px slide up.
 * Respects reduced-motion: renders instantly.
 */
export function RevealOnScroll({
  children,
  className,
  variant,
  margin = '0px 0px -60px 0px',
  once = true,
  delay = 0,
  as = 'div',
}: Props) {
  const reduced = useReducedMotion();
  const v = pickVariants(variant ?? fadeUp, Boolean(reduced));
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: margin as `${number}px ${number}px ${number}px ${number}px` }}
      variants={v}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}
