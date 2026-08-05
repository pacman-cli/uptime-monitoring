import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Premium hero backdrop. A single, calm, GPU-friendly mesh of radial gradients
 * positioned with feTurbulence-based blob warping via SVG. No canvas rAF loop,
 * no <img>, no video — just CSS-animated radial gradients with a subtle drift.
 *
 * Designed to feel like Linear/Vercel: one obvious hero moment, then silence.
 */
export function HeroMesh() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reduced) return;

    // Subtle parallax: mesh drifts slightly opposite to scroll
    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (ref.current) {
        ref.current.style.transform = `translate3d(0, ${y * -0.08}px, 0)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden will-change-transform"
    >
      {/* Base radial wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(16,185,129,0.12),transparent_60%)]" />

      {/* Animated mesh blobs */}
      <div className="absolute inset-0">
        <div
          className="absolute left-[15%] top-[20%] h-[480px] w-[480px] rounded-full opacity-60 blur-[100px]"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(16,185,129,0.55), rgba(16,185,129,0) 70%)',
            animation: reduced ? undefined : 'mesh-drift-a 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute right-[12%] top-[15%] h-[420px] w-[420px] rounded-full opacity-50 blur-[100px]"
          style={{
            background:
              'radial-gradient(circle at 70% 40%, rgba(56,189,248,0.45), rgba(56,189,248,0) 70%)',
            animation: reduced ? undefined : 'mesh-drift-b 22s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[8%] left-[35%] h-[500px] w-[500px] rounded-full opacity-40 blur-[100px]"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.35), rgba(168,85,247,0) 70%)',
            animation: reduced ? undefined : 'mesh-drift-c 26s ease-in-out infinite',
          }}
        />
      </div>

      {/* Faint static grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage:
            'radial-gradient(ellipse at center, black 0%, black 40%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 0%, black 40%, transparent 80%)',
        }}
      />

      {/* Soft top + bottom vignette for content readability */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}