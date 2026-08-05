import Lenis from 'lenis';
import { prefersReducedMotion } from './utils';

let instance: Lenis | null = null;

/**
 * Singleton Lenis (v1.3 API). Auto-RAF, anchor handling built-in.
 * Disabled for reduced-motion users (native scroll).
 */
export function initLenis(): Lenis | null {
  if (instance) return instance;
  if (prefersReducedMotion()) return null;
  if (typeof window === 'undefined') return null;

  instance = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    autoRaf: true,
  });

  return instance;
}

export function getLenis(): Lenis | null {
  return instance;
}

export function destroyLenis(): void {
  instance?.destroy();
  instance = null;
}

export function scrollToLenis(
  target: string | number | HTMLElement,
  opts?: { offset?: number; duration?: number; immediate?: boolean }
): void {
  if (!instance) {
    if (typeof target === 'string') {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }
  instance.scrollTo(target, opts as never);
}
