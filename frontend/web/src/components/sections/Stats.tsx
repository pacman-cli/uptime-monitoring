import { Section } from '../ui/Section';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { StaggerGroup, staggerChild } from '../ui/StaggerGroup';
import { motion } from 'framer-motion';

interface Stat {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 99.9, decimals: 1, suffix: '%', label: 'Uptime SLA' },
  { value: 42, suffix: 'ms', prefix: '<', label: 'Avg Response' },
  { value: 24, suffix: '/7', label: 'Monitoring' },
  { value: 10, suffix: 'K+', label: 'Checks / Day' },
];

export function Stats() {
  return (
    <Section padding="py-24">
      <StaggerGroup
        className="grid grid-cols-2 gap-8 md:grid-cols-4"
        stagger={0.12}
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggerChild} className="text-center">
            <p className="text-4xl font-bold text-white sm:text-5xl">
              <AnimatedCounter
                value={stat.value}
                decimals={stat.decimals ?? 0}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </p>
            <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </StaggerGroup>
    </Section>
  );
}