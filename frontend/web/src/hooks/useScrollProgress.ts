import { useEffect, useState } from 'react';

/**
 * Returns scroll progress 0..1 for the page (or a target element if provided).
 * Smooth via rAF. No layout reads in render.
 */
export function useScrollProgress(target?: React.RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let raf = 0;
    const tick = () => {
      const total = target?.current
        ? target.current.scrollHeight - window.innerHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? window.scrollY / total : 0;
      setProgress(Math.min(Math.max(p, 0), 1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return progress;
}
