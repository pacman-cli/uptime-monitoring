import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, lazy, Suspense } from 'react';
import { GradientText } from '../ui/GradientText';
import { MagneticButton } from '../ui/MagneticButton';
import { HeroMesh } from '../effects/HeroMesh';
import { GlassCard } from '../ui/GlassCard';
import { staggerChild, staggerParent } from '@/lib/motion';
import { scrollToLenis } from '@/lib/lenis';
import { cn } from '@/lib/utils';

// Defer PingDemo until after first paint
const PingDemo = lazy(() =>
  import('../demo/PingDemo').then((m) => ({ default: m.PingDemo }))
);

function FloatingMonitorCard({
  position,
  variant,
  url,
  status,
  latency,
  delay,
  duration,
  reduced,
}: {
  position: string;
  variant: 'up' | 'down';
  url: string;
  status: 'UP' | 'DOWN';
  latency?: string;
  delay: number;
  duration: number;
  reduced: boolean | null;
}) {
  const isUp = variant === 'up';
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.7 + delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={position}
    >
      <motion.div
        // Reduced amplitude (10px instead of 18px) — premium sites are calmer
        animate={reduced ? undefined : { y: [0, -10, 0], rotate: [0, delay % 2 === 0 ? 0.5 : -0.5, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
        whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.3 } }}
      >
        <GlassCard intensity="strong" className="w-56 p-4 shadow-2xl sm:w-64">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                isUp
                  ? 'bg-brand shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                  : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
              )}
            />
            <span className={cn('text-xs font-semibold', isUp ? 'text-brand' : 'text-red-400')}>
              {status}
            </span>
          </div>
          <p className="truncate text-sm font-medium text-white">{url}</p>
          <p className={cn('mt-1 text-xs', isUp ? 'text-slate-400' : 'text-red-300')}>
            {latency}
          </p>
          {url === 'dashboard.myapp.io' && (
            <div className="mt-3 flex gap-0.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-sm bg-brand/${i % 3 === 0 ? 50 : i % 2 === 0 ? 80 : 'full'}`}
                  style={{ height: 24 }}
                />
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function HeroTrust() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 flex flex-col items-center justify-center gap-4 text-xs text-slate-500 sm:flex-row sm:gap-6"
    >
      <div className="flex -space-x-2" aria-hidden="true">
        {[
          'from-brand to-sky-400',
          'from-amber-400 to-orange-500',
          'from-purple-400 to-pink-500',
          'from-rose-400 to-fuchsia-500',
        ].map((g, i) => (
          <div
            key={i}
            className={cn(
              'h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br',
              g
            )}
          />
        ))}
      </div>
      <p>
        <span className="font-semibold text-slate-300">10,000+ developers</span> trust
        UptimeMonitor — 99.99% uptime SLA.
      </p>
    </motion.div>
  );
}

function HeroPullQuote() {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto mt-5 flex max-w-md items-center justify-center gap-3 text-xs text-slate-500"
    >
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <blockquote className="text-left italic">
        “Caught a 3 AM outage our last tool missed. Worth it.”
        <cite className="ml-1 not-italic text-slate-400">— Sarah K., CTO Nextera</cite>
      </blockquote>
    </motion.figure>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.96]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  const containerVariants = staggerParent(0.05, 0.1);
  const childVariants = staggerChild;

  return (
    <motion.section
      ref={ref}
      style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
    >
      <HeroMesh />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={childVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              All Systems Operational
            </span>
          </motion.div>

          <motion.h1
            variants={childVariants}
            className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Never Miss a<br />
            <GradientText variant="aurora">Downtime Again</GradientText>
          </motion.h1>

          <motion.p
            variants={childVariants}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl"
          >
            Real-time monitoring for your APIs, websites, and services. Get instant alerts
            the moment something goes wrong.
          </motion.p>

          <motion.div
            variants={childVariants}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <MagneticButton
              href="/register.html"
              // Pulse-glow removed — replaced with hover-only glow. Cleaner, premium feel.
              className="rounded-xl bg-brand px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand/25 transition-all duration-300 hover:bg-emerald-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
            >
              Start Monitoring Free
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </MagneticButton>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToLenis('#features', { offset: -64 });
              }}
              className="rounded-xl border border-white/10 px-8 py-3.5 text-base font-semibold text-slate-300 transition-all hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              See How It Works
            </a>
          </motion.div>

          <HeroTrust />
          <HeroPullQuote />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Suspense fallback={<div className="mx-auto mt-12 h-[360px] max-w-xl" aria-hidden="true" />}>
            <PingDemo />
          </Suspense>
        </motion.div>

        {/* Floating monitor cards — only 2, kept subtle */}
        <div className="relative mx-auto mt-16 hidden max-w-4xl lg:block">
          <FloatingMonitorCard
            position="absolute -left-8 top-0"
            variant="up"
            url="api.example.com"
            status="UP"
            latency="200 OK · 42ms"
            delay={0}
            duration={6}
            reduced={reduced}
          />
          <FloatingMonitorCard
            position="absolute -right-8 top-8"
            variant="down"
            url="staging.api.co"
            status="DOWN"
            latency="Connection timeout"
            delay={1}
            duration={7}
            reduced={reduced}
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity: scrollIndicatorOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="flex h-8 w-5 justify-center rounded-full border-2 border-slate-600 pt-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-slate-500" />
        </div>
      </motion.div>
    </motion.section>
  );
}