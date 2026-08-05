import { motion } from 'framer-motion';
import { Section } from '../ui/Section';
import { StaggerGroup, staggerChild } from '../ui/StaggerGroup';
import { TiltCard } from '../ui/TiltCard';
import { GlassCard } from '../ui/GlassCard';
import { MagneticButton } from '../ui/MagneticButton';
import { cn } from '@/lib/utils';
import type { PricingTier } from '@/types';

const tiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For side projects',
    price: '$0',
    period: '/mo',
    features: ['10 monitors', '60-second intervals', 'Email alerts', '24-hour history'],
    cta: 'Get Started',
    href: '/register.html',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams',
    price: '$9',
    period: '/mo',
    features: [
      '100 monitors',
      '30-second intervals',
      'Email + Slack alerts',
      '90-day history',
      'Status page',
    ],
    cta: 'Start Pro Trial',
    href: '/register.html',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large-scale ops',
    price: 'Custom',
    features: [
      'Unlimited monitors',
      '10-second intervals',
      'Multi-channel alerts',
      'Unlimited history',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: 'mailto:support@uptimemonitor.dev',
  },
];

function CheckIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function Pricing() {
  return (
    <Section id="pricing">
      <StaggerGroup className="mb-16 text-center" stagger={0.1}>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Simple, Transparent Pricing</h2>
        <p className="mt-4 text-slate-400">Start free. Scale when you're ready.</p>
      </StaggerGroup>

      <StaggerGroup className="grid grid-cols-1 gap-8 md:grid-cols-3" stagger={0.15}>
        {tiers.map((tier) => (
          <motion.div key={tier.id} variants={staggerChild} className="relative h-full">
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white shadow-lg shadow-brand/30">
                Most Popular
              </span>
            )}
            <TiltCard
              glare={tier.featured ? 0.15 : 0.08}
              className={cn('h-full transition-transform duration-200', tier.featured ? 'md:scale-[1.03]' : '')}
              innerClassName="h-full"
            >
              <GlassCard
                intensity={tier.featured ? 'strong' : 'subtle'}
                className={cn(
                  'flex h-full flex-col p-8 transition-all duration-300',
                  tier.featured
                    ? 'border-brand/40 bg-brand/5 hover:border-brand/60'
                    : 'hover:border-white/15'
                )}
              >
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{tier.description}</p>
                <p className="mt-6 text-4xl font-bold text-white">
                  {tier.price}
                  {tier.period && <span className="text-lg font-normal text-slate-400">{tier.period}</span>}
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton
                  href={tier.href}
                  className={cn(
                    'mt-8 block w-full rounded-xl px-6 py-3 text-center font-medium transition-all',
                    tier.featured
                      ? 'bg-brand text-white shadow-lg shadow-brand/20 hover:bg-emerald-500 hover:shadow-brand/40'
                      : 'border border-white/10 text-white hover:border-white/20 hover:bg-white/5'
                  )}
                >
                  {tier.cta}
                </MagneticButton>
              </GlassCard>
            </TiltCard>
          </motion.div>
        ))}
      </StaggerGroup>
    </Section>
  );
}