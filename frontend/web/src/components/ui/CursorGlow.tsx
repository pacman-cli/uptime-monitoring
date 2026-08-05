import { useEffect, useRef } from 'react';
import { lerp } from '@/lib/utils';

/**
 * Soft radial glow that follows the cursor across the page. Desktop + no-reduced-motion only.
 * Rendered once near the root. Pointer-events: none so it never blocks UI.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const tick = () => {
      cx = lerp(cx, tx, 0.08);
      cy = lerp(cy, ty, 0.08);
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[1] hidden h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
      style={{
        background:
          'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 30%, transparent 70%)',
        mixBlendMode: 'screen',
      }}
    />
  );
}
