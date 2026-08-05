import { motion } from 'framer-motion';
import { Section } from '../ui/Section';
import { StaggerGroup, staggerChild } from '../ui/StaggerGroup';
import { TiltCard } from '../ui/TiltCard';
import { GlassCard } from '../ui/GlassCard';
import type { Feature } from '@/types';

const features: Feature[] = [
  {
    id: 'monitor',
    title: 'Real-Time Monitoring',
    description:
      'Ping your endpoints every 30 seconds. Get status codes, latency metrics, and uptime percentages in real time.',
    icon: 'eye',
  },
  {
    id: 'alerts',
    title: 'Instant Alerts',
    description:
      'When downtime is detected, you know immediately. Email alerts fire within seconds of a failed check.',
    icon: 'bell',
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description:
      'P50, P95, P99 latency percentiles. Uptime charts. Incident timelines. All the data you need at a glance.',
    icon: 'chart',
  },
];

const iconMap = {
  eye: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  ),
  bell: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  ),
  chart: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  ),
};

const hoverColors = {
  eye: { border: 'hover:border-brand/40', bg: 'bg-brand/10', text: 'text-brand' },
  bell: { border: 'hover:border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-400' },
  chart: { border: 'hover:border-sky-500/40', bg: 'bg-sky-500/10', text: 'text-sky-400' },
};

export function Features() {
  return (
    <Section id="features">
      <StaggerGroup className="mb-16 text-center" stagger={0.12}>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything You Need to Stay Online</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Powerful features wrapped in a simple interface. Set up in minutes, monitor forever.
        </p>
      </StaggerGroup>

      <StaggerGroup className="grid grid-cols-1 gap-6 md:grid-cols-3" stagger={0.15}>
        {features.map((feature) => {
          const colors = hoverColors[feature.icon];
          return (
            <motion.div key={feature.id} variants={staggerChild} className="h-full">
              <TiltCard
                glare={0.08}
                className={`h-full transition-transform duration-200 ${colors.border}`}
                innerClassName="h-full"
              >
                <GlassCard className="h-full p-8 transition-all duration-300 hover:bg-surface/60">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
                    <svg className={`h-6 w-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      {iconMap[feature.icon]}
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
                </GlassCard>
              </TiltCard>
            </motion.div>
          );
        })}
      </StaggerGroup>
    </Section>
  );
}