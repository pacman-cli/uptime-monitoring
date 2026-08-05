import { motion, useReducedMotion } from 'framer-motion';
import { Section } from '../ui/Section';
import { StaggerGroup, staggerChild } from '../ui/StaggerGroup';
import { GradientText } from '../ui/GradientText';
import { GlassCard } from '../ui/GlassCard';

interface Step {
  num: number;
  title: string;
  body: string;
  hint: string;
  command: string;
  badge?: string;
}

const steps: Step[] = [
  {
    num: 1,
    title: 'Create Your Account',
    body: 'Sign up with email and password. No credit card. Free tier ready instantly.',
    hint: '~15s',
    command: 'register --email you@team.io',
  },
  {
    num: 2,
    title: 'Add Your Endpoint',
    body: 'Paste a URL, pick a check interval, and choose where to send alerts. Done.',
    hint: '~20s',
    command: 'add https://api.yourapp.com',
  },
  {
    num: 3,
    title: 'Get Alerts Instantly',
    body: 'Checks run continuously. Know the moment downtime strikes.',
    hint: '~25s',
    command: 'monitoring active',
    badge: 'live',
  },
];

const reassurances = [
  'No credit card',
  'No agent required',
  'Cancel anytime',
  'HTTPS & custom headers',
];

function ConnectingLine() {
  const reduced = useReducedMotion();
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-[18%] right-[18%] top-[60px] hidden h-12 md:block"
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0 6 L100 6"
        stroke="url(#line-gradient)"
        strokeWidth="1"
        strokeDasharray="2 3"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        transition={{ duration: reduced ? 0 : 1.4, ease: [0.16, 1, 0.3, 1], delay: reduced ? 0 : 0.3 }}
      />
      <defs>
        <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(16,185,129,0)" />
          <stop offset="50%" stopColor="rgba(16,185,129,0.5)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HowItWorks() {
  return (
    <Section tone="surface" className="relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/5 blur-3xl"
      />

      <div className="relative">
        <StaggerGroup className="mb-16 text-center" stagger={0.1}>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3.5 py-1 text-xs font-semibold text-brand">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            SETUP IN UNDER A MINUTE
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Up and Running in <GradientText>60 Seconds</GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Three steps. No credit card. No agent to install. Just paste your URL and go.
          </p>
        </StaggerGroup>

        <div className="relative">
          <ConnectingLine />

          <StaggerGroup className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8" stagger={0.15} delay={0.15}>
            {steps.map((step) => (
              <motion.div key={step.num} variants={staggerChild} className="group relative h-full">
                <GlassCard className="h-full p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-surface/60 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-emerald-400 text-lg font-bold text-white shadow-lg shadow-brand/30 ring-4 ring-brand/10">
                      {step.num}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      {step.hint}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{step.body}</p>

                  {step.badge === 'live' ? (
                    <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/5 bg-background/60 p-3 font-mono text-[11px]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                      <span className="text-emerald-400">Monitoring Active</span>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-lg border border-white/5 bg-background/60 p-3 font-mono text-[11px] text-slate-500">
                      <span className="text-brand">$</span> {step.command}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>

        <StaggerGroup
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500"
          stagger={0.05}
          delay={0.5}
        >
          {reassurances.map((item) => (
            <motion.span
              key={item}
              variants={staggerChild}
              className="inline-flex items-center gap-2"
            >
              <svg className="h-3.5 w-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </motion.span>
          ))}
        </StaggerGroup>
      </div>
    </Section>
  );
}