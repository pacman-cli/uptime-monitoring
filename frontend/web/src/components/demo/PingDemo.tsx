import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type StepState = 'idle' | 'running' | 'done';

interface DemoStep {
  label: string;
  state: 'pending' | 'active' | 'done';
}

const STATUS_LABELS = [
  'Resolving {host}…',
  'Establishing TCP connection…',
  'Sending TLS Client Hello…',
  'GET /v1/health HTTP/1.1…',
];

const DONE_LABELS = [
  '✓ Resolved {host}',
  '✓ Established TCP connection',
  '✓ TLS Handshake successful',
  '✓ GET request sent',
];

/**
 * The hero's "Check Uptime" simulator. Replaces the old vanilla setTimeout chain
 * with framer-motion AnimatePresence for step reveals.
 */
export function PingDemo() {
  const [url, setUrl] = useState('https://api.example.com/v1/health');
  const [state, setState] = useState<StepState>('idle');
  const [steps, setSteps] = useState<DemoStep[]>(
    STATUS_LABELS.map(() => ({ label: '', state: 'pending' }))
  );
  const [latency, setLatency] = useState(42);
  const [bars, setBars] = useState<number[]>([12, 16, 10, 20, 24]);

  const run = async () => {
    if (state === 'running') return;
    setState('running');

    let host = 'endpoint';
    try {
      const u = url.startsWith('http') ? url : `https://${url}`;
      host = new URL(u).hostname;
    } catch {
      host = url;
    }

    setSteps(STATUS_LABELS.map((label, i) => ({ label: label.replace('{host}', host), state: i === 0 ? 'active' : 'pending' })));

    for (let i = 0; i < STATUS_LABELS.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx < i) return { ...s, label: DONE_LABELS[idx].replace('{host}', host), state: 'done' };
          if (idx === i) return { ...s, label: DONE_LABELS[idx].replace('{host}', host), state: 'done' };
          if (idx === i + 1) return { ...s, state: 'active' };
          return s;
        })
      );
    }

    await new Promise((r) => setTimeout(r, 500));
    setLatency(Math.floor(Math.random() * 130) + 20);
    setBars([12, 16, 10, 20, 24].map(() => Math.floor(Math.random() * 16) + 8));
    setState('done');
  };

  return (
    <div className="group relative mt-12 max-w-xl mx-auto">
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-3xl bg-gradient-to-r from-brand/30 to-sky-500/30 opacity-75 blur transition duration-500 group-hover:opacity-100"
      />
      <div className="relative rounded-3xl border border-white/10 bg-slate-900/90 p-1 shadow-2xl backdrop-blur-md">
        <div className="rounded-[22px] bg-slate-900/90 p-6 space-y-4">
          {/* Terminal header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <span className="font-mono text-xs text-slate-500">live-latency-test.sh</span>
          </div>

          {/* Input + button */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={state === 'running'}
              aria-label="Simulated test URL"
              className="flex-1 rounded-xl border border-slate-700/60 bg-slate-950/80 px-4 py-2.5 font-mono text-sm text-slate-100 transition focus:border-brand/70 focus:outline-none focus:ring-1 focus:ring-brand/40 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={run}
              disabled={state === 'running'}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{state === 'running' ? 'Checking…' : 'Check Uptime'}</span>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Output */}
          <AnimatePresence>
            {state !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2.5 overflow-hidden rounded-xl border border-white/5 bg-slate-950 p-4 text-left font-mono text-xs"
              >
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex items-center gap-2 ${
                      step.state === 'done'
                        ? 'text-emerald-400'
                        : step.state === 'active'
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.state === 'done' ? (
                      <span className="text-emerald-400">✓</span>
                    ) : (
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-slate-500" />
                    )}
                    <span>{step.label}</span>
                  </motion.div>
                ))}

                {state === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-2 space-y-3 border-t border-white/5 pt-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400">✓ 200 OK</span>
                      <span className="font-semibold text-slate-400">Latency: {latency}ms</span>
                    </div>
                    <div className="flex h-8 items-end gap-1.5 pt-1">
                      {bars.map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleY: 0, originY: 1 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.1 + i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className={`w-full rounded-sm ${
                            i === bars.length - 1
                              ? 'bg-brand shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse'
                              : 'bg-brand/30 transition-colors hover:bg-brand'
                          }`}
                          style={{ height: h }}
                        />
                      ))}
                    </div>
                    <p className="text-center text-[10px] text-slate-500">
                      Simulated test complete. Set up an account to keep it running 24/7.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}