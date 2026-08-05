import { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '../ui/Section';
import { GlassCard } from '../ui/GlassCard';
import type { Testimonial } from '@/types';

const testimonials: Testimonial[] = [
  {
    id: 'sk',
    initials: 'SK',
    name: 'Sarah Kim',
    role: 'CTO, Nextera',
    gradient: 'from-brand to-sky-400',
    quote:
      'Set up in under a minute. We caught a production outage at 3 AM that our previous tool missed entirely.',
  },
  {
    id: 'jr',
    initials: 'JR',
    name: 'James Rodriguez',
    role: 'Lead DevOps, Stackline',
    gradient: 'from-amber-400 to-orange-500',
    quote:
      'The dashboard is beautiful and the latency metrics are incredibly useful. Replaced three other tools for us.',
  },
  {
    id: 'ml',
    initials: 'ML',
    name: 'Maya Lin',
    role: 'Founder, Pingbase',
    gradient: 'from-purple-400 to-pink-500',
    quote:
      'Free tier is generous. The P95 latency tracking helped us optimize our API from 200ms to 45ms.',
  },
  {
    id: 'dn',
    initials: 'DN',
    name: 'Daniel Nakamura',
    role: 'Staff Engineer, Vellum',
    gradient: 'from-emerald-400 to-teal-500',
    quote:
      'Slack alerts arrive before our own APM does. The 8-second detection time is genuinely game-changing.',
  },
  {
    id: 'ap',
    initials: 'AP',
    name: 'Aisha Patel',
    role: 'Head of SRE, Lattice',
    gradient: 'from-rose-400 to-fuchsia-500',
    quote:
      'Status pages built in. Post-mortem templates auto-populated. Saved my team a full day per incident.',
  },
  {
    id: 'tk',
    initials: 'TK',
    name: 'Tom Kowalski',
    role: 'Indie Dev, Sidekiq',
    gradient: 'from-sky-400 to-blue-500',
    quote:
      'I monitor 14 side-project APIs from a single dashboard. The free tier is honestly too good.',
  },
];

function Stars() {
  return (
    <div className="mb-4 flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Card({ testimonial }: { testimonial: Testimonial }) {
  return (
    <GlassCard className="w-[320px] flex-shrink-0 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] sm:w-[400px]">
      <Stars />
      <p className="text-sm leading-relaxed text-slate-300">"{testimonial.quote}"</p>
      <div className="mt-4 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-xs font-bold text-white`}
        >
          {testimonial.initials}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{testimonial.name}</p>
          <p className="text-xs text-slate-500">{testimonial.role}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function MarqueeRow({ items, direction, duration }: { items: Testimonial[]; direction: 'left' | 'right'; duration: number }) {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        animate={
          paused
            ? undefined
            : { x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }
        }
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
        }}
        className="flex gap-6"
      >
        {[...items, ...items].map((t, i) => (
          <Card key={`${t.id}-${i}`} testimonial={t} />
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  const half = Math.ceil(testimonials.length / 2);
  return (
    <Section tone="surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -80px 0px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 text-center"
      >
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Loved by Developers</h2>
        <p className="mt-4 text-slate-400">See what teams are saying about UptimeMonitor.</p>
      </motion.div>

      <div className="space-y-6">
        <MarqueeRow items={testimonials.slice(0, half)} direction="left" duration={45} />
        <MarqueeRow items={testimonials.slice(half)} direction="right" duration={55} />
      </div>
    </Section>
  );
}