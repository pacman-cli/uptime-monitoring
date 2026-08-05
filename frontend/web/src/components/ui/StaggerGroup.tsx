import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';
import { staggerChild, staggerParent, pickVariants } from '@/lib/motion';

interface Props {
  children: ReactNode;
  className?: string;
  /** Per-child stagger interval (seconds) */
  stagger?: number;
  /** Initial delay (seconds) */
  delay?: number;
  margin?: string;
  once?: boolean;
}

/**
 * Parent that staggers its motion children. Children must be motion.* elements with
 * variants={staggerChild} (or compatible) to inherit the cascade.
 */
export function StaggerGroup({
  children,
  className,
  stagger = 0.1,
  delay = 0,
  margin = '0px 0px -60px 0px',
  once = true,
}: Props) {
  const reduced = useReducedMotion();
  const parent = pickVariants(staggerParent(delay, stagger), Boolean(reduced));

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        margin: margin as `${number}px ${number}px ${number}px ${number}px`,
      }}
      variants={parent}
    >
      {children}
    </motion.div>
  );
}

export { staggerChild };
