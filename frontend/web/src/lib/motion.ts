import type { Variants, Transition } from 'framer-motion';

/**
 * Premium motion tokens. All easings use expo-out or smooth quart for a Linear/Stripe feel.
 * Durations tuned for "satisfying without laggy" — never above 1.2s for entry, 0.6s for hover.
 */
export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.76, 0, 0.24, 1] as const,
  spring: { type: 'spring' as const, stiffness: 100, damping: 30, mass: 0.5 },
  springSoft: { type: 'spring' as const, stiffness: 60, damping: 20, mass: 0.8 },
};

export const DURATION = {
  fast: 0.4,
  base: 0.7,
  slow: 1.0,
  slower: 1.4,
};

const baseTransition: Transition = {
  duration: DURATION.base,
  ease: EASE.out,
};

/* ----- Variants ----- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: baseTransition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: baseTransition },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: baseTransition },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: baseTransition },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: baseTransition },
};

export const staggerParent = (delay = 0.12, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: {
      delayChildren: delay,
      staggerChildren,
    },
  },
});

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION.base, ease: EASE.out },
  },
};

/** Empty variants for reduced-motion — render instantly, no transforms */
export const reducedVariants: Variants = {
  hidden: { opacity: 1, y: 0, filter: 'blur(0px)', x: 0, scale: 1 },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', x: 0, scale: 1 },
};

/**
 * Resolve a variant set to either the real one or a no-op based on reduced motion preference.
 * Used inside components that don't take useReducedMotion() directly.
 */
export function pickVariants(
  variants: Variants,
  reduced: boolean | undefined
): Variants {
  return reduced ? reducedVariants : variants;
}
