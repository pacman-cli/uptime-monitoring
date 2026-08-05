import { motion } from 'framer-motion';
import { MagneticButton } from '../ui/MagneticButton';
import { GradientText } from '../ui/GradientText';

export function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -80px 0px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/10 via-background to-sky-500/10 p-12 sm:p-16"
        >
          {/* Animated glow blob */}
          <motion.div
            aria-hidden="true"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/30 blur-3xl"
          />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Start Monitoring in <GradientText>60 Seconds</GradientText>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-400">
              No credit card required. Free tier included. Set up your first monitor before your coffee gets cold.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton
                href="/register.html"
                className="rounded-xl bg-brand px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand/30 transition-all hover:bg-emerald-500 hover:shadow-brand/50"
              >
                Create Free Account
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </MagneticButton>
              <a
                href="/login.html"
                className="rounded-xl border border-white/10 px-8 py-3.5 text-base font-semibold text-slate-300 transition-all hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                Sign In
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}