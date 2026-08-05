import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Section } from '../ui/Section';
import { GlassCard } from '../ui/GlassCard';
import type { FaqItem } from '@/types';

const faqs: FaqItem[] = [
  {
    id: 'start',
    question: 'How quickly can I get started?',
    answer:
      'Under 60 seconds. Create an account, paste your URL, and we start monitoring immediately. No configuration files or agents required.',
  },
  {
    id: 'down',
    question: 'What happens when my endpoint goes down?',
    answer:
      'We detect the failure within your configured interval (as fast as 30 seconds) and send you an email alert immediately. The incident is logged and tracked until recovery.',
  },
  {
    id: 'private',
    question: 'Can I monitor internal/private APIs?',
    answer:
      'Yes. If your internal API is accessible from the public internet (via VPN tunnel, ngrok, or similar), you can monitor it just like any public endpoint.',
  },
  {
    id: 'free',
    question: 'Is there a free tier?',
    answer:
      'Absolutely. The Free plan includes 10 monitors, 60-second intervals, email alerts, and 24-hour history. No credit card required.',
  },
  {
    id: 'status',
    question: 'Do you support status pages?',
    answer:
      'Pro and Enterprise plans include a customizable public status page that shows real-time uptime for all your monitors.',
  },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-5 w-5 flex-shrink-0 text-slate-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </motion.svg>
  );
}

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Section id="faq" tone="surface" className="mx-auto max-w-3xl">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Frequently Asked Questions</h2>
        <p className="mt-4 text-slate-400">Everything you need to know.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => {
          const open = openId === faq.id;
          return (
            <GlassCard key={faq.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : faq.id)}
                aria-expanded={open}
                aria-controls={`faq-panel-${faq.id}`}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
              >
                <span className="pr-4 text-sm font-medium text-white">{faq.question}</span>
                <Chevron open={open} />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={`faq-panel-${faq.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>
    </Section>
  );
}