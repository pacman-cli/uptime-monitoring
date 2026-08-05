import { RevealOnScroll } from '../ui/RevealOnScroll';

const tags = ['APIs', 'SaaS', 'E-commerce', 'Healthcare', 'Fintech', 'Startups'];

export function TrustedBy() {
  return (
    <section className="border-t border-white/5 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="text-center">
          <p className="mb-8 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Trusted by developers who care about uptime
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xl font-bold tracking-tight text-slate-600 transition-colors hover:text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}