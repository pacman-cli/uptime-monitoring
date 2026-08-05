import { useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Logo } from '../Logo';
import { MagneticButton } from '../ui/MagneticButton';
import { scrollToLenis } from '@/lib/lenis';
import { cn } from '@/lib/utils';

const links = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    scrollToLenis(href, { offset: -64 });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500',
        scrolled
          ? 'border-white/5 bg-background/85 backdrop-blur-xl'
          : 'border-transparent bg-background/40 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" aria-label="UptimeMonitor Home" className="flex items-center">
          <Logo size={32} />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={handleNav(l.href)}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login.html"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Sign In
          </a>
          <MagneticButton
            href="/register.html"
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white shadow-lg shadow-brand/20 transition-all hover:bg-emerald-500 hover:shadow-brand/40"
          >
            Get Started
          </MagneticButton>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          className="rounded-md p-2 text-slate-300 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/5 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={handleNav(l.href)}
                  className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/login.html"
                className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                Sign In
              </a>
              <a
                href="/register.html"
                className="mt-2 block rounded-lg bg-brand px-5 py-2.5 text-center text-sm font-medium text-white"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}