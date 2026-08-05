import { Logo } from '../Logo';

const nav = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '/login.html', label: 'Sign In' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row sm:px-6 lg:px-8">
        <Logo size={28} />
        <nav className="flex items-center gap-6 text-sm text-slate-400">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <p className="text-xs text-slate-500">&copy; 2026 UptimeMonitor. All rights reserved.</p>
      </div>
    </footer>
  );
}