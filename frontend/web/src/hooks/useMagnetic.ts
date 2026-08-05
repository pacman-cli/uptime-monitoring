import { useEffect, useRef } from 'react';
import { clamp, lerp } from '@/lib/utils';

/**
 * Magnetic effect: child tracks mouse within bounds, applies translate offset.
 * Returns a ref to attach to the wrapper. Caller renders children inside the wrapper.
 *
 * Strength 0..1 controls how much the element moves (default 0.3).
 * Range (px) controls the capture radius around the element center (default 80).
 */
export function useMagnetic(strength = 0.3, range = 80) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < range) {
        const factor = clamp(1 - dist / range, 0, 1);
        targetX = dx * strength * factor;
        targetY = dy * strength * factor;
      } else {
        targetX = 0;
        targetY = 0;
      }
    };

    const tick = () => {
      currentX = lerp(currentX, targetX, 0.15);
      currentY = lerp(currentY, targetY, 0.15);
      el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [strength, range]);

  return ref;
}
