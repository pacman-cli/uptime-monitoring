import { useEffect, useRef } from 'react';
import { clamp, lerp } from '@/lib/utils';

export interface TiltOptions {
  /** Max rotation in degrees (default 6) */
  max?: number;
  /** Glare opacity 0..1 (default 0) */
  glare?: number;
}

/**
 * 3D tilt on mouse-move. Returns ref + glareRef to attach to wrapper and optional glare overlay.
 * Skips on touch devices and reduced motion.
 */
export function useTilt(opts: TiltOptions = {}) {
  const { max = 6, glare = 0 } = opts;
  const ref = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || window.matchMedia('(pointer: coarse)').matches) return;

    let rx = 0;
    let ry = 0;
    let crx = 0;
    let cry = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      ry = clamp((px - 0.5) * 2 * max, -max, max);
      rx = clamp(-(py - 0.5) * 2 * max, -max, max);
    };

    const tick = () => {
      crx = lerp(crx, rx, 0.12);
      cry = lerp(cry, ry, 0.12);
      el.style.transform = `perspective(1000px) rotateX(${crx.toFixed(2)}deg) rotateY(${cry.toFixed(2)}deg)`;
      if (glare && glareRef.current) {
        const gx = (cry / max + 1) * 50;
        const gy = (crx / max + 1) * 50;
        glareRef.current.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,${glare}), transparent 60%)`;
        glareRef.current.style.opacity = '1';
      }
      raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      rx = 0;
      ry = 0;
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
  }, [max, glare]);

  return { ref, glareRef };
}
