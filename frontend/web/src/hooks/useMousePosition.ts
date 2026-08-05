import { useEffect, useRef } from 'react';

export interface MousePosition {
  x: number;
  y: number;
  /** Normalized -1..1 across viewport center */
  nx: number;
  ny: number;
}

/**
 * Track mouse position with rAF + lerp smoothing. Returns a ref so consumers can read
 * current value inside their own animation loop without re-renders.
 *
 * Usage:
 *   const mouse = useMousePosition();
 *   useEffect(() => {
 *     let raf;
 *     const tick = () => { mouse.current.x; raf = requestAnimationFrame(tick); };
 *     tick(); return () => cancelAnimationFrame(raf);
 *   }, []);
 */
export function useMousePosition(): React.MutableRefObject<MousePosition> {
  const ref = useRef<MousePosition>({ x: 0, y: 0, nx: 0, ny: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let raf = 0;

    const handleMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      const nx = (currentX / window.innerWidth) * 2 - 1;
      const ny = (currentY / window.innerHeight) * 2 - 1;
      ref.current = { x: currentX, y: currentY, nx, ny };
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
