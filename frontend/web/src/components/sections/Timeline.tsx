import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactElement } from 'react';
import { gsap, registerGsap } from '@/lib/gsap';
import { Section } from '../ui/Section';
import { GlassCard } from '../ui/GlassCard';
import type { TimelineStep } from '@/types';

const steps: TimelineStep[] = [
  {
    id: 'detect',
    label: '01',
    title: 'Outage Detected',
    description: 'A monitor fails. Our distributed checkers confirm within 8 seconds.',
    metric: '< 8s detection',
  },
  {
    id: 'alert',
    label: '02',
    title: 'Alert Triggered',
    description: 'Slack, email, SMS, or webhook — routed to the right on-call instantly.',
    metric: '12 channels',
  },
  {
    id: 'notify',
    label: '03',
    title: 'Team Notified',
    description: 'Incident opens automatically. Status page flips to investigating.',
    metric: 'Auto-paged',
  },
  {
    id: 'resolve',
    label: '04',
    title: 'Incident Resolved',
    description: 'Recovery detected. Status restored. Team gets the all-clear.',
    metric: 'Mean time to recovery',
  },
  {
    id: 'report',
    label: '05',
    title: 'Report Generated',
    description: 'Post-mortem template populated. Affected requests, latency impact, RCA hints.',
    metric: 'Zero-effort PMs',
  },
];

function StepVisual({ id, active }: { id: string; active: boolean }) {
  const map: Record<string, ReactElement> = {
    detect: (
      <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
        <motion.circle
          cx="32"
          cy="32"
          r="22"
          stroke="rgba(239,68,68,0.6)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={active ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.circle
          cx="32"
          cy="32"
          r="14"
          fill="rgba(239,68,68,0.2)"
          animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: 'center' }}
        />
      </svg>
    ),
    alert: (
      <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
        <motion.path
          d="M32 8 L52 50 L12 50 Z"
          stroke="rgba(245,158,11,0.7)"
          strokeWidth="2"
          fill="rgba(245,158,11,0.15)"
          initial={{ pathLength: 0 }}
          animate={active ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.line
          x1="32"
          y1="22"
          x2="32"
          y2="38"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={active ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        />
        <circle cx="32" cy="44" r="2" fill="#fbbf24" />
      </svg>
    ),
    notify: (
      <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
        <motion.rect
          x="10"
          y="20"
          width="44"
          height="28"
          rx="4"
          stroke="rgba(56,189,248,0.7)"
          strokeWidth="2"
          fill="rgba(56,189,248,0.1)"
          initial={{ pathLength: 0 }}
          animate={active ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d="M10 24 L32 38 L54 24"
          stroke="rgba(56,189,248,0.9)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={active ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
      </svg>
    ),
    resolve: (
      <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
        <motion.circle
          cx="32"
          cy="32"
          r="22"
          stroke="rgba(16,185,129,0.7)"
          strokeWidth="2"
          fill="rgba(16,185,129,0.1)"
          initial={{ pathLength: 0 }}
          animate={active ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d="M22 32 L29 39 L43 25"
          stroke="#10b981"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={active ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
      </svg>
    ),
    report: (
      <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
        <motion.rect
          x="14"
          y="10"
          width="36"
          height="44"
          rx="3"
          stroke="rgba(168,85,247,0.7)"
          strokeWidth="2"
          fill="rgba(168,85,247,0.08)"
          initial={{ pathLength: 0 }}
          animate={active ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        {[22, 30, 38, 46].map((y, i) => (
          <motion.line
            key={y}
            x1="20"
            y1={y}
            x2={i === 3 ? '36' : '44'}
            y2={y}
            stroke="rgba(168,85,247,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={active ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + i * 0.15 }}
          />
        ))}
      </svg>
    ),
  };
  return map[id];
}

export function Timeline() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    registerGsap();
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.timeline-card');
      const visuals = gsap.utils.toArray<HTMLElement>('.timeline-visual');

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
        gsap.fromTo(
          visuals[i],
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Connecting vertical line draw
      gsap.fromTo(
        '.timeline-line-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: {
            trigger: triggerRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 0.6,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <Section padding="py-32" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-3xl"
      />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -80px 0px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-400">
            INCIDENT LIFECYCLE
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            From Outage to Post-Mortem
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Watch the full incident flow as you scroll. Every step is automated.
          </p>
        </motion.div>

        <div ref={triggerRef} className="relative mx-auto max-w-4xl">
          {/* Vertical timeline line */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent md:block"
          />
          <div
            aria-hidden="true"
            className="timeline-line-fill absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-brand via-emerald-400 to-sky-400 md:block"
          />

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`timeline-card grid grid-cols-1 items-center gap-8 md:grid-cols-2 ${
                  i % 2 === 1 ? 'md:[&>:first-child]:order-2' : ''
                }`}
              >
                <GlassCard
                  className={`p-6 ${i % 2 === 1 ? 'md:ml-6' : 'md:mr-6'}`}
                  intensity="strong"
                >
                  <span className="font-mono text-xs uppercase tracking-wider text-brand">
                    {step.label}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                  <span className="mt-4 inline-flex rounded-full bg-brand/10 px-2.5 py-1 font-mono text-[11px] text-brand">
                    {step.metric}
                  </span>
                </GlassCard>

                <div className={`timeline-visual flex items-center justify-center ${i % 2 === 1 ? 'md:mr-6' : 'md:ml-6'}`}>
                  <div className="relative">
                    <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-brand/20 to-violet-500/20 blur-2xl" />
                    <StepVisual id={step.id} active={true} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}