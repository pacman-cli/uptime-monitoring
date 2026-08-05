import { lazy, Suspense, useEffect } from 'react';
import { initLenis, destroyLenis } from '@/lib/lenis';
import { Navbar } from './components/sections/Navbar';
import { Hero } from './components/sections/Hero';
import { TrustedBy } from './components/sections/TrustedBy';
import { Features } from './components/sections/Features';
import { HowItWorks } from './components/sections/HowItWorks';
import { Stats } from './components/sections/Stats';
import { ScrollProgress } from './components/effects/ScrollProgress';
import { NoiseOverlay } from './components/effects/NoiseOverlay';

// Below-fold sections are lazy-loaded for a faster first paint
const Timeline = lazy(() =>
  import('./components/sections/Timeline').then((m) => ({ default: m.Timeline }))
);
const Testimonials = lazy(() =>
  import('./components/sections/Testimonials').then((m) => ({ default: m.Testimonials }))
);
const Pricing = lazy(() =>
  import('./components/sections/Pricing').then((m) => ({ default: m.Pricing }))
);
const FAQ = lazy(() =>
  import('./components/sections/FAQ').then((m) => ({ default: m.FAQ }))
);
const CTA = lazy(() =>
  import('./components/sections/CTA').then((m) => ({ default: m.CTA }))
);
const Footer = lazy(() =>
  import('./components/sections/Footer').then((m) => ({ default: m.Footer }))
);

function LazyFallback() {
  return <div className="h-32" aria-hidden="true" />;
}

export default function App() {
  useEffect(() => {
    initLenis();
    return () => destroyLenis();
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[200] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <ScrollProgress />
      <NoiseOverlay />

      <Navbar />

      <main id="main-content" className="relative">
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <Stats />

        <Suspense fallback={<LazyFallback />}>
          <Timeline />
        </Suspense>

        <Suspense fallback={<LazyFallback />}>
          <Testimonials />
        </Suspense>

        <Suspense fallback={<LazyFallback />}>
          <Pricing />
        </Suspense>

        <Suspense fallback={<LazyFallback />}>
          <FAQ />
        </Suspense>

        <Suspense fallback={<LazyFallback />}>
          <CTA />
        </Suspense>

        <Suspense fallback={<LazyFallback />}>
          <Footer />
        </Suspense>
      </main>
    </>
  );
}