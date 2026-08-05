import { useEffect, useRef, useState } from 'react';

interface Options {
  /** ms */
  duration?: number;
  /** re-animate when re-entering view */
  reset?: boolean;
}

/**
 * Eased count-up animation. Expo-out curve. Triggers when in view.
 */
export function useCountUp(target: number, options: Options = {}) {
  const { duration = 1800, reset = false } = options;
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (animated.current && !reset) return;
            animated.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const elapsed = now - start;
              const t = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(eased * target);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          } else if (reset) {
            animated.current = false;
            setValue(0);
          }
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, reset]);

  return { ref, value };
}
