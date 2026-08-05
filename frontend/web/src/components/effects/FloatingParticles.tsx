import { useEffect, useRef } from 'react';

interface Props {
  /** Number of particles (default 30) */
  count?: number;
  /** Color of particles */
  color?: string;
}

/**
 * Lightweight canvas particle field. Throttles updates to ~30fps when in view, otherwise
 * pauses rAF entirely. Used as a subtle ambient layer behind hero / aurora backgrounds.
 */
export function FloatingParticles({ count = 30, color = 'rgba(16, 185, 129, 0.4)' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let lastFrame = 0;
    const frameInterval = 1000 / 30; // 30 fps throttle
    let inView = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
    let particles: P[] = [];

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    const init = () => {
      const rect = container.getBoundingClientRect();
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const t = performance.now() * 0.001;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = rect.width;
        if (p.x > rect.width) p.x = 0;
        if (p.y < 0) p.y = rect.height;
        if (p.y > rect.height) p.y = 0;
        const alpha = 0.4 + Math.sin(t * 2 + p.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${Math.max(0, alpha).toFixed(2)})`);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      if (!inView) return;
      if (now - lastFrame >= frameInterval) {
        lastFrame = now;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            inView = true;
            raf = requestAnimationFrame(loop);
          } else {
            inView = false;
            cancelAnimationFrame(raf);
          }
        }
      },
      { threshold: 0 }
    );

    resize();
    init();
    observer.observe(container);
    window.addEventListener('resize', resize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [count, color]);

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}