import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Top scroll progress bar. Animated via spring for a subtle premium feel.
 * Fixed at top of viewport. Skips animation when reduced motion is on.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const [scrollY, setScrollY] = useState(0);
  const [docHeight, setDocHeight] = useState(1);

  useEffect(() => {
    const update = () => {
      setScrollY(window.scrollY);
      setDocHeight(
        Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const raw = scrollY / docHeight;
  const spring = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });
  const width = useTransform(spring, (v) => `${Math.min(Math.max(v, 0), 1) * 100}%`);

  if (reduced) {
    return (
      <div
        className="fixed left-0 top-0 z-[60] h-[2px] bg-brand"
        style={{ width: `${Math.min(Math.max(raw, 0), 1) * 100}%` }}
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.div
      className={cn('fixed left-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-brand via-emerald-400 to-sky-400')}
      style={{ width }}
      aria-hidden="true"
    />
  );
}
